"use client";

import { ChevronLeft, ChevronRight, FileText, Loader2, Maximize2, Search, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs, type TextContent } from "react-pdf";

import type { ReferenciaDocumentoAnaliseRelease } from "@/app/types/Documento";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const opcoesPdf = {
    withCredentials: true,
};

const zoomMinimo = 0.75;
const zoomMaximo = 2.5;
const passoZoom = 0.15;

interface PdfDocumentViewerProps {
    evidenciaSelecionada?: ReferenciaDocumentoAnaliseRelease | null;
    evidenciaSelecionadaChave?: number;
    fileUrl: string;
    onPageCountChange?: (totalPaginas: number) => void;
}

type DimensoesPagina = {
    altura: number;
    largura: number;
};

interface ResultadoBusca {
    indice: number;
    pagina: number;
    item: number;
    inicio: number;
    tamanho: number;
}

function escaparHtml(valor: string) {
    return valor.replace(/[&<>'"]/g, (caractere) => {
        const entidades: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
        };

        return entidades[caractere];
    });
}

function escaparExpressaoRegular(valor: string) {
    return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function chaveItem(pagina: number, item: number) {
    return `${pagina}:${item}`;
}

export default function PdfDocumentViewer({ evidenciaSelecionada, evidenciaSelecionadaChave, fileUrl, onPageCountChange }: Readonly<PdfDocumentViewerProps>) {
    return (
        <LeitorPdf
            key={fileUrl}
            evidenciaSelecionada={evidenciaSelecionada}
            evidenciaSelecionadaChave={evidenciaSelecionadaChave}
            fileUrl={fileUrl}
            onPageCountChange={onPageCountChange}
        />
    );
}

function LeitorPdf({ evidenciaSelecionada, evidenciaSelecionadaChave, fileUrl, onPageCountChange }: Readonly<PdfDocumentViewerProps>) {
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [larguraPainel, setLarguraPainel] = useState(0);
    const [termoBusca, setTermoBusca] = useState("");
    const [textosPaginas, setTextosPaginas] = useState<Record<number, string[]>>({});
    const [indiceResultadoPreferido, setIndiceResultadoPreferido] = useState(0);
    const [dimensoesPaginas, setDimensoesPaginas] = useState<Record<number, DimensoesPagina>>({});
    const painelRef = useRef<HTMLDivElement | null>(null);
    const termoNormalizado = termoBusca.trim();
    const larguraBasePagina = larguraPainel > 0 ? Math.max(320, larguraPainel - 32) : 720;
    const larguraPagina = Math.floor(larguraBasePagina * zoom);

    const resultadosBusca = useMemo<ResultadoBusca[]>(() => {
        if (!termoNormalizado) return [];

        const expressao = new RegExp(escaparExpressaoRegular(termoNormalizado), "gi");
        const resultados: ResultadoBusca[] = [];

        Object.entries(textosPaginas)
            .sort(([paginaA], [paginaB]) => Number(paginaA) - Number(paginaB))
            .forEach(([pagina, itens]) => {
                itens.forEach((texto, item) => {
                    expressao.lastIndex = 0;
                    let correspondencia = expressao.exec(texto);

                    while (correspondencia) {
                        resultados.push({
                            indice: resultados.length,
                            pagina: Number(pagina),
                            item,
                            inicio: correspondencia.index,
                            tamanho: correspondencia[0].length,
                        });
                        correspondencia = expressao.exec(texto);
                    }
                });
            });

        return resultados;
    }, [termoNormalizado, textosPaginas]);

    const resultadosPorItem = useMemo(() => {
        const resultados = new Map<string, ResultadoBusca[]>();

        resultadosBusca.forEach((resultado) => {
            const chave = chaveItem(resultado.pagina, resultado.item);
            resultados.set(chave, [...(resultados.get(chave) ?? []), resultado]);
        });

        return resultados;
    }, [resultadosBusca]);

    const indiceResultadoAtivo = resultadosBusca.length > 0
        ? Math.min(indiceResultadoPreferido, resultadosBusca.length - 1)
        : -1;
    const avisoEvidencia = useMemo(() => {
        if (!evidenciaSelecionada) return "";
        if (totalPaginas === 0) return "Carregando a página da evidência...";

        const pagina = evidenciaSelecionada.page + 1;
        if (pagina < 1 || pagina > totalPaginas) {
            return "A página desta evidência não existe no PDF carregado.";
        }

        return evidenciaSelecionada.rects.length
            ? `Evidência destacada na página ${pagina}.`
            : `Evidência localizada na página ${pagina}, sem área precisa para destacar.`;
    }, [evidenciaSelecionada, totalPaginas]);

    useEffect(() => {
        const painel = painelRef.current;
        if (!painel) return undefined;

        setLarguraPainel(painel.getBoundingClientRect().width);

        const observer = new ResizeObserver(([entry]) => {
            setLarguraPainel(entry.contentRect.width);
        });
        observer.observe(painel);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (indiceResultadoAtivo < 0) return undefined;

        const painel = painelRef.current;
        if (!painel) return undefined;

        const seletorResultado = `[data-pdf-search-result="${indiceResultadoAtivo}"]`;
        const rolarParaResultado = () => {
            const resultadoAtivo = painel.querySelector<HTMLElement>(seletorResultado);
            if (!resultadoAtivo) return false;

            const limitePainel = painel.getBoundingClientRect();
            const limiteResultado = resultadoAtivo.getBoundingClientRect();
            const proximaPosicao = painel.scrollTop
                + limiteResultado.top
                - limitePainel.top
                - (painel.clientHeight - limiteResultado.height) / 2;

            painel.scrollTo({ behavior: "smooth", top: Math.max(0, proximaPosicao) });
            return true;
        };

        if (rolarParaResultado()) return undefined;

        const observer = new MutationObserver(() => {
            if (rolarParaResultado()) observer.disconnect();
        });
        observer.observe(painel, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [indiceResultadoAtivo, resultadosBusca.length, zoom]);

    useEffect(() => {
        if (!evidenciaSelecionada) {
            return undefined;
        }

        if (totalPaginas === 0) {
            return undefined;
        }

        const pagina = evidenciaSelecionada.page + 1;
        if (pagina < 1 || pagina > totalPaginas) {
            return undefined;
        }

        const painel = painelRef.current;
        if (!painel) return undefined;

        const seletorPagina = `[data-pdf-evidence-page="${pagina}"]`;
        const rolarParaEvidencia = () => {
            const paginaEvidencia = painel.querySelector<HTMLElement>(seletorPagina);
            if (!paginaEvidencia) return false;

            const limitePainel = painel.getBoundingClientRect();
            const limitePagina = paginaEvidencia.getBoundingClientRect();
            const proximaPosicao = painel.scrollTop
                + limitePagina.top
                - limitePainel.top
                - (painel.clientHeight - limitePagina.height) / 2;

            painel.scrollTo({ behavior: "smooth", top: Math.max(0, proximaPosicao) });
            return true;
        };

        if (rolarParaEvidencia()) return undefined;

        const observer = new MutationObserver(() => {
            if (rolarParaEvidencia()) observer.disconnect();
        });
        observer.observe(painel, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [evidenciaSelecionada, evidenciaSelecionadaChave, totalPaginas]);

    const alterarZoom = useCallback((proximoZoom: number) => {
        setZoom(Math.min(zoomMaximo, Math.max(zoomMinimo, Number(proximoZoom.toFixed(2)))));
    }, []);

    const armazenarTextoPagina = useCallback((pagina: number, conteudo: TextContent) => {
        const itens = conteudo.items.map((item) => ("str" in item ? item.str : ""));

        setTextosPaginas((textosAtuais) => {
            const textoAnterior = textosAtuais[pagina];
            if (textoAnterior?.length === itens.length && textoAnterior.every((texto, indice) => texto === itens[indice])) {
                return textosAtuais;
            }

            return { ...textosAtuais, [pagina]: itens };
        });
    }, []);

    const renderizarTexto = useCallback(
        ({ itemIndex, pageNumber, str }: { itemIndex: number; pageNumber: number; str: string }) => {
            const resultados = resultadosPorItem.get(chaveItem(pageNumber, itemIndex));
            if (!resultados?.length) return escaparHtml(str);

            let cursor = 0;
            let textoComDestaques = "";

            resultados.forEach((resultado) => {
                const fim = resultado.inicio + resultado.tamanho;
                textoComDestaques += escaparHtml(str.slice(cursor, resultado.inicio));
                textoComDestaques += `<mark class="pdf-search-result${resultado.indice === indiceResultadoAtivo ? " pdf-search-result--active" : ""}" data-pdf-search-result="${resultado.indice}">${escaparHtml(str.slice(resultado.inicio, fim))}</mark>`;
                cursor = fim;
            });

            return `${textoComDestaques}${escaparHtml(str.slice(cursor))}`;
        },
        [indiceResultadoAtivo, resultadosPorItem]
    );

    function navegarResultados(deslocamento: number) {
        setIndiceResultadoPreferido((indiceAtual) => {
            if (resultadosBusca.length === 0) return 0;
            const indiceBase = Math.min(indiceAtual, resultadosBusca.length - 1);
            return (indiceBase + deslocamento + resultadosBusca.length) % resultadosBusca.length;
        });
    }

    const buscaAtiva = Boolean(termoNormalizado);
    const possuiResultados = resultadosBusca.length > 0;

    return (
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
            <div className="flex min-h-14 flex-wrap items-center gap-2 border-b border-line bg-header-bg px-4 py-3" aria-label="Controles do PDF">
                <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
                    <div className="flex h-9 min-w-52 flex-1 items-center rounded-lg border border-line bg-input-bg focus-within:border-brand">
                        <Search className="ml-2 shrink-0 text-muted" size={16} aria-hidden="true" />
                        <input
                            type="text"
                            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-ink outline-none placeholder:text-muted"
                            value={termoBusca}
                            onChange={(event) => {
                                setTermoBusca(event.target.value);
                                setIndiceResultadoPreferido(0);
                            }}
                            onKeyDown={(event) => {
                                if (event.key !== "Enter" || !possuiResultados) return;
                                event.preventDefault();
                                navegarResultados(event.shiftKey ? -1 : 1);
                            }}
                            placeholder="Pesquisar no PDF"
                            aria-label="Pesquisar texto exato no PDF"
                        />
                        {buscaAtiva ? (
                            <button
                                type="button"
                                className="mr-1 inline-flex size-7 items-center justify-center rounded-md text-muted transition hover:bg-subtle-hover hover:text-ink"
                                onClick={() => {
                                    setTermoBusca("");
                                    setIndiceResultadoPreferido(0);
                                }}
                                aria-label="Limpar pesquisa"
                                title="Limpar pesquisa"
                            >
                                <X size={15} />
                            </button>
                        ) : null}
                    </div>
                    {buscaAtiva ? (
                        <div className="flex items-center gap-1" aria-live="polite">
                            <span className="whitespace-nowrap text-xs font-semibold text-muted">
                                {possuiResultados ? `${indiceResultadoAtivo + 1} de ${resultadosBusca.length}` : "Nenhuma ocorrência"}
                            </span>
                            <BotaoControlePdf
                                label="Ocorrência anterior"
                                disabled={!possuiResultados}
                                onClick={() => navegarResultados(-1)}
                            >
                                <ChevronLeft size={17} />
                            </BotaoControlePdf>
                            <BotaoControlePdf
                                label="Próxima ocorrência"
                                disabled={!possuiResultados}
                                onClick={() => navegarResultados(1)}
                            >
                                <ChevronRight size={17} />
                            </BotaoControlePdf>
                        </div>
                    ) : null}
                    {avisoEvidencia ? (
                        <span className="max-w-56 text-xs font-semibold leading-4 text-muted" role="status">
                            {avisoEvidencia}
                        </span>
                    ) : null}
                    <span className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
                    <BotaoControlePdf
                        label="Diminuir zoom"
                        disabled={zoom <= zoomMinimo}
                        onClick={() => alterarZoom(zoom - passoZoom)}
                    >
                        <ZoomOut size={17} />
                    </BotaoControlePdf>
                    <button
                        type="button"
                        className="h-9 min-w-14 rounded-lg border border-line bg-input-bg px-2 text-xs font-bold text-muted transition hover:border-brand hover:text-ink"
                        onClick={() => alterarZoom(1)}
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    <BotaoControlePdf
                        label="Aumentar zoom"
                        disabled={zoom >= zoomMaximo}
                        onClick={() => alterarZoom(zoom + passoZoom)}
                    >
                        <ZoomIn size={17} />
                    </BotaoControlePdf>
                    <a
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-input-bg text-muted transition hover:border-brand hover:text-ink"
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Abrir PDF em nova aba"
                    >
                        <Maximize2 size={16} />
                    </a>
                </div>
            </div>

            <div ref={painelRef} className="min-h-0 overflow-auto bg-panel-soft p-4">
                <Document
                    file={fileUrl}
                    options={opcoesPdf}
                    className="flex min-h-full w-max min-w-full flex-col items-center gap-4"
                    loading={<EstadoPdf icone={<Loader2 className="animate-spin" size={32} />} texto="Carregando PDF..." />}
                    error={<EstadoPdf icone={<FileText size={32} />} texto="Não foi possível renderizar o PDF." />}
                    noData={<EstadoPdf icone={<FileText size={32} />} texto="Nenhum PDF disponível." />}
                    onLoadSuccess={(documentoPdf) => {
                        setTotalPaginas(documentoPdf.numPages);
                        onPageCountChange?.(documentoPdf.numPages);
                        void Promise.all(
                            Array.from({ length: documentoPdf.numPages }, async (_, indice) => {
                                const pagina = await documentoPdf.getPage(indice + 1);
                                const viewport = pagina.getViewport({ scale: 1 });
                                return [indice + 1, { largura: viewport.width, altura: viewport.height }] as const;
                            })
                        ).then((dimensoes) => {
                            setDimensoesPaginas(Object.fromEntries(dimensoes));
                        });
                    }}
                    onLoadError={() => {
                        setTotalPaginas(0);
                        setTextosPaginas({});
                        setDimensoesPaginas({});
                        onPageCountChange?.(0);
                    }}
                >
                    {Array.from({ length: totalPaginas }, (_, indice) => {
                        const pagina = indice + 1;
                        const dimensoes = dimensoesPaginas[pagina];
                        const escalaEvidencia = dimensoes ? larguraPagina / dimensoes.largura : 0;
                        const destacarPagina = evidenciaSelecionada?.page === indice && escalaEvidencia > 0;

                        return (
                            <div
                                className="relative overflow-hidden rounded-lg bg-white shadow-[0_18px_44px_-28px_var(--chrome-shadow)]"
                                data-pdf-evidence-page={pagina}
                                key={pagina}
                            >
                                <Page
                                    className="[&_canvas]:block [&_canvas]:max-w-none"
                                    error={<EstadoPdf icone={<FileText size={32} />} texto="Não foi possível renderizar esta página." />}
                                    loading={<EstadoPdf icone={<Loader2 className="animate-spin" size={32} />} texto="Carregando página..." />}
                                    pageNumber={pagina}
                                    renderAnnotationLayer={false}
                                    renderTextLayer
                                    onGetTextSuccess={(conteudo) => armazenarTextoPagina(pagina, conteudo)}
                                    customTextRenderer={renderizarTexto}
                                    width={larguraPagina}
                                />
                                {destacarPagina && evidenciaSelecionada?.rects.length ? (
                                    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                                        {evidenciaSelecionada.rects.map((retangulo, indiceRetangulo) => (
                                            <span
                                                className="absolute border-b-2 border-amber-600/80 bg-amber-300/35 motion-safe:animate-pulse"
                                                key={`${evidenciaSelecionadaChave ?? 0}-${indiceRetangulo}`}
                                                style={{
                                                    height: (retangulo.y2 - retangulo.y1) * escalaEvidencia,
                                                    left: retangulo.x1 * escalaEvidencia,
                                                    top: retangulo.y1 * escalaEvidencia,
                                                    width: (retangulo.x2 - retangulo.x1) * escalaEvidencia,
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </Document>
            </div>
        </div>
    );
}

function BotaoControlePdf({
    children,
    disabled,
    label,
    onClick,
}: {
    children: React.ReactNode;
    disabled?: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg text-muted transition hover:border-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            title={label}
        >
            {children}
        </button>
    );
}

function EstadoPdf({ icone, texto }: { icone: React.ReactNode; texto: string }) {
    return (
        <div className="grid min-h-80 w-full place-items-center text-center text-muted">
            <div className="grid justify-items-center gap-3">
                <div className="text-accent">{icone}</div>
                <span className="text-sm font-semibold">{texto}</span>
            </div>
        </div>
    );
}
