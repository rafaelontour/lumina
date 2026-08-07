"use client";

import { ChevronLeft, ChevronRight, FileText, Loader2, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

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
    fileUrl: string;
    title: string;
}

export default function PdfDocumentViewer({ fileUrl, title }: Readonly<PdfDocumentViewerProps>) {
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [zoom, setZoom] = useState(1);
    const [larguraPainel, setLarguraPainel] = useState(0);
    const painelRef = useRef<HTMLDivElement | null>(null);
    const larguraBasePagina = larguraPainel > 0 ? Math.max(320, larguraPainel - 32) : 720;
    const larguraPagina = Math.floor(larguraBasePagina * zoom);

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

    function alterarZoom(proximoZoom: number) {
        setZoom(Math.min(zoomMaximo, Math.max(zoomMinimo, Number(proximoZoom.toFixed(2)))));
    }

    return (
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
            <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-line bg-header-bg px-4 py-3">
                <div className="min-w-0">
                    <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-sm font-bold">
                        {title}
                    </h3>
                    <span className="text-xs font-semibold text-muted">
                        {totalPaginas > 0 ? `Página ${paginaAtual} de ${totalPaginas}` : "Carregando PDF"}
                    </span>
                </div>

                <div className="flex items-center gap-1" aria-label="Controles do PDF">
                    <BotaoControlePdf
                        label="Página anterior"
                        disabled={paginaAtual <= 1}
                        onClick={() => setPaginaAtual((pagina) => Math.max(1, pagina - 1))}
                    >
                        <ChevronLeft size={17} />
                    </BotaoControlePdf>
                    <BotaoControlePdf
                        label="Próxima página"
                        disabled={totalPaginas === 0 || paginaAtual >= totalPaginas}
                        onClick={() => setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1))}
                    >
                        <ChevronRight size={17} />
                    </BotaoControlePdf>
                    <span className="mx-2 h-6 w-px bg-line" aria-hidden="true" />
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
                    className="flex min-h-full w-max min-w-full justify-center"
                    loading={<EstadoPdf icone={<Loader2 className="animate-spin" size={32} />} texto="Carregando PDF..." />}
                    error={<EstadoPdf icone={<FileText size={32} />} texto="Não foi possível renderizar o PDF." />}
                    noData={<EstadoPdf icone={<FileText size={32} />} texto="Nenhum PDF disponível." />}
                    onLoadSuccess={({ numPages }: { numPages: number }) => {
                        setTotalPaginas(numPages);
                        setPaginaAtual((pagina) => Math.min(Math.max(1, pagina), numPages));
                    }}
                    onLoadError={() => {
                        setTotalPaginas(0);
                        setPaginaAtual(1);
                    }}
                >
                    <Page
                        className="overflow-hidden rounded-lg bg-white shadow-[0_18px_44px_-28px_var(--chrome-shadow)] [&_canvas]:block [&_canvas]:max-w-none"
                        error={<EstadoPdf icone={<FileText size={32} />} texto="Não foi possível renderizar esta página." />}
                        loading={<EstadoPdf icone={<Loader2 className="animate-spin" size={32} />} texto="Carregando página..." />}
                        pageNumber={paginaAtual}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        width={larguraPagina}
                    />
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
            className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-input-bg text-muted transition hover:border-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
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
