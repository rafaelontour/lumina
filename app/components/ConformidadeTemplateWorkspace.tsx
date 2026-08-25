"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ChevronDown, FileCheck2, FileWarning, History, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
    enviarConformidadeTemplate,
    listarDocumentosConformidade,
    listarHistoricoConformidadeTemplate,
    listarTemplatesConformidade,
    obterResultadoConformidadeTemplate,
} from "@/app/services/conformidade";
import { baixarArquivoPdfRelease } from "@/app/services/oiac";
import type {
    AlvoDocumentoConformidade,
    ResultadoProcessamentoConformidade,
    ResultadoConformidadeTemplate,
    StatusProcessamentoConformidade,
    TemplateConformidade,
} from "@/app/types/Conformidade";

const intervaloResultadoConformidadeMs = 5000;

type Registro = Record<string, unknown>;

type VerificacaoDeterministica = {
    field: string;
    templateValue: string;
    articleValue: string;
    match: boolean;
};

type ItemVisual = {
    criterio: string;
    justificativa: string;
};

type CriterioTemplate = {
    id: string;
    title: string;
    match: boolean;
    visual: boolean;
    checks: VerificacaoDeterministica[];
    criterios: ItemVisual[];
};

type SecaoTemplate = {
    id: string;
    title: string;
    match: boolean;
    criterios: CriterioTemplate[];
};

type RelatorioTemplate = {
    metadados: Array<{ rotulo: string; valor: string }>;
    emConformidade?: boolean;
    secoesPassaram?: number;
    secoesTotal?: number;
    descricao?: string;
    secoes: SecaoTemplate[];
};

type GrupoDocumentosConformidade = {
    id: string;
    title: string;
    kind: string;
    documentos: AlvoDocumentoConformidade[];
};

type EstadoResultadoCache = {
    resultado: ResultadoConformidadeTemplate | null;
    estado: "idle" | "absent" | "error";
    erro: string;
};

function horarioResultadoHistorico(resultado: ResultadoProcessamentoConformidade) {
    const horario = Date.parse(resultado.updated_at);
    return Number.isNaN(horario) ? Number.NEGATIVE_INFINITY : horario;
}

function rotuloStatusHistorico(status: StatusProcessamentoConformidade) {
    const rotulos: Record<StatusProcessamentoConformidade, string> = {
        processing: "Em processamento",
        completed: "Concluída",
        error: "Com erro",
    };

    return rotulos[status];
}

function classeStatusHistorico(status: StatusProcessamentoConformidade) {
    if (status === "completed") return "border-brand/40 bg-subtle-hover text-ink";
    if (status === "error") return "border-accent/40 bg-accent/10 text-accent";
    return "border-line bg-panel text-muted";
}

function comoRegistro(valor: unknown): Registro | null {
    return valor && typeof valor === "object" && !Array.isArray(valor) ? (valor as Registro) : null;
}

function comoTexto(valor: unknown, fallback = "Não informado") {
    return typeof valor === "string" && valor.trim() ? valor : fallback;
}

function comoLista(valor: unknown) {
    return Array.isArray(valor) ? valor : [];
}

function rotuloMetadado(chave: string) {
    const rotulos: Record<string, string> = {
        approach: "Abordagem",
        model: "Modelo",
        template_file: "Arquivo do template",
        article_file: "Arquivo analisado",
    };

    return rotulos[chave] ?? chave.replace(/_/g, " ").replace(/^./, (letra) => letra.toUpperCase());
}

function normalizarRelatorio(valor: Record<string, unknown> | null): RelatorioTemplate | null {
    const relatorio = comoRegistro(valor);
    if (!relatorio) return null;

    const metadata = comoRegistro(relatorio.metadata);
    const summary = comoRegistro(relatorio.summary);
    const secoes = comoLista(relatorio.sections).flatMap((valorSecao, indiceSecao) => {
        const secao = comoRegistro(valorSecao);
        if (!secao) return [];

        const criterios = comoLista(secao.criteria).flatMap((valorCriterio, indiceCriterio) => {
            const criterio = comoRegistro(valorCriterio);
            if (!criterio) return [];

            const checks = comoLista(criterio.checks).flatMap((valorCheck) => {
                const check = comoRegistro(valorCheck);
                if (!check) return [];
                return [{
                    field: comoTexto(check.field),
                    templateValue: comoTexto(check.template_value),
                    articleValue: comoTexto(check.article_value),
                    match: check.match === true,
                }];
            });

            const criteriosVisuais = comoLista(criterio.criterios).flatMap((valorItem) => {
                const item = comoRegistro(valorItem);
                if (!item) return [];
                return [{
                    criterio: comoTexto(item.criteria_item),
                    justificativa: comoTexto(item.justificativa),
                }];
            });

            return [{
                id: comoTexto(criterio.id, `criterio-${indiceSecao}-${indiceCriterio}`),
                title: comoTexto(criterio.title, "Critério sem título"),
                match: criterio.match === true,
                visual: criterio.is_visual === true,
                checks,
                criterios: criteriosVisuais,
            }];
        });

        return [{
            id: comoTexto(secao.id, `secao-${indiceSecao}`),
            title: comoTexto(secao.title, "Seção sem título"),
            match: secao.match === true,
            criterios,
        }];
    });

    return {
        metadados: metadata
            ? Object.entries(metadata).flatMap(([chave, valor]) => {
                if (typeof valor !== "string" || !valor.trim()) return [];
                return [{
                    rotulo: rotuloMetadado(chave),
                    valor: chave === "approach" ? descreverAbordagemParaUsuario(valor) : valor,
                }];
            })
            : [],
        emConformidade: typeof summary?.is_compliant === "boolean" ? summary.is_compliant : undefined,
        secoesPassaram: typeof summary?.sections_passed === "number" ? summary.sections_passed : undefined,
        secoesTotal: typeof summary?.sections_total === "number" ? summary.sections_total : undefined,
        descricao: typeof summary?.description === "string" ? summary.description : undefined,
        secoes,
    };
}

function formatarData(data: string) {
    const valor = new Date(data);
    return Number.isNaN(valor.getTime()) ? data : valor.toLocaleString("pt-BR");
}

function descreverAbordagemParaUsuario(texto: string) {
    if (/^Abordagem híbrida por seção/i.test(texto.trim())) {
        return "Comparamos cada parte do seu documento com o template escolhido. Veja abaixo o que está alinhado e os pontos que merecem atenção.";
    }

    return texto;
}

function descreverResumoParaUsuario(descricao?: string) {
    return descricao ? descreverAbordagemParaUsuario(descricao) : undefined;
}

function CriterioCard({ criterio }: { criterio: CriterioTemplate }) {
    return (
        <article className="grid gap-3 rounded-lg border border-line bg-input-bg p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display text-base font-bold text-ink">{criterio.title}</h4>
                <ResultadoBadge match={criterio.match} />
            </div>
            <span className="w-fit rounded-full border border-line px-2 py-1 text-xs font-bold text-muted">
                {criterio.visual ? "Análise visual" : "Comparação de conteúdo"}
            </span>

            {criterio.visual && criterio.criterios.length > 0 ? (
                <div className="grid gap-3">
                    {criterio.criterios.map((item, indice) => (
                        <div className="rounded-md border border-line bg-panel p-3" key={`${item.criterio}-${indice}`}>
                            <strong className="text-sm text-ink">{item.criterio}</strong>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted">{item.justificativa}</p>
                        </div>
                    ))}
                </div>
            ) : null}

            {!criterio.visual && criterio.checks.length > 0 ? (
                <div className="overflow-x-auto rounded-md border border-line">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-panel text-xs uppercase tracking-wide text-muted">
                            <tr>
                                <th className="px-3 py-2">Item analisado</th>
                                <th className="px-3 py-2">No template</th>
                                <th className="px-3 py-2">No documento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {criterio.checks.map((check, indice) => (
                                <tr className="border-t border-line align-top" key={`${check.field}-${indice}`}>
                                    <td className="px-3 py-2 font-semibold text-ink">{check.field}</td>
                                    <td className="whitespace-pre-wrap px-3 py-2 text-muted">{check.templateValue}</td>
                                    <td className="whitespace-pre-wrap px-3 py-2 text-muted">{check.articleValue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </article>
    );
}

function ResultadoBadge({ match }: { match: boolean }) {
    return (
        <span
            className={`rounded-full border px-2 py-1 text-xs font-bold ${
                match ? "border-brand/40 bg-subtle-hover text-ink" : "border-accent/50 text-accent"
            }`}
        >
            {match ? "Compatível" : "Divergência"}
        </span>
    );
}

function SecaoCard({ secao }: { secao: SecaoTemplate }) {
    return (
        <details
            className={`group rounded-lg border bg-panel ${secao.match ? "border-line" : "border-accent/50"}`}
        >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                    <h3 className="font-display text-lg font-bold text-ink">{secao.title}</h3>
                    <ResultadoBadge match={secao.match} />
                </div>
                <ChevronDown className="shrink-0 transition group-open:rotate-180" size={18} />
            </summary>
            <div className="grid gap-3 border-t border-line p-4">
                {secao.criterios.length > 0 ? (
                    secao.criterios.map((criterio) => <CriterioCard criterio={criterio} key={criterio.id} />)
                ) : (
                    <p className="text-sm text-muted">Nenhum critério detalhado foi retornado para esta seção.</p>
                )}
            </div>
        </details>
    );
}

export default function ConformidadeTemplateWorkspace() {
    const [documentos, setDocumentos] = useState<AlvoDocumentoConformidade[]>([]);
    const [carregandoDocumentos, setCarregandoDocumentos] = useState(true);
    const [erroDocumentos, setErroDocumentos] = useState("");
    const [templates, setTemplates] = useState<TemplateConformidade[]>([]);
    const [templateSelecionado, setTemplateSelecionado] = useState("");
    const [alvoSelecionadoId, setAlvoSelecionadoId] = useState<string | null>(null);
    const [resultadosPorDocumento, setResultadosPorDocumento] = useState<Record<string, EstadoResultadoCache>>({});
    const [documentosProcessando, setDocumentosProcessando] = useState<Set<string>>(() => new Set());
    const [iniciandoAnalise, setIniciandoAnalise] = useState(false);
    const [versaoConsulta, setVersaoConsulta] = useState(0);
    const [historicoAberto, setHistoricoAberto] = useState(false);
    const [historico, setHistorico] = useState<ResultadoProcessamentoConformidade[]>([]);
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [erroHistorico, setErroHistorico] = useState("");
    const statusAnteriorPorDocumento = useRef<Record<string, StatusProcessamentoConformidade | "absent">>({});
    const analisesAceitasAguardandoResultado = useRef(new Set<string>());
    const notificacoesErro = useRef(new Set<string>());
    const notificacoesConclusao = useRef(new Set<string>());
    const resultadosPorDocumentoRef = useRef<Record<string, EstadoResultadoCache>>({});

    const salvarResultado = useCallback((documentId: string, estado: EstadoResultadoCache) => {
        resultadosPorDocumentoRef.current = { ...resultadosPorDocumentoRef.current, [documentId]: estado };
        setResultadosPorDocumento(resultadosPorDocumentoRef.current);
    }, []);

    const marcarDocumentoProcessando = useCallback((documentId: string, processando: boolean) => {
        setDocumentosProcessando((atuais) => {
            const proximos = new Set(atuais);
            if (processando) proximos.add(documentId);
            else proximos.delete(documentId);
            return proximos;
        });
    }, []);

    useEffect(() => {
        let cancelado = false;

        async function carregarDocumentos() {
            setCarregandoDocumentos(true);
            const [itens, err] = await listarDocumentosConformidade();
            if (cancelado) return;

            if (err) {
                setErroDocumentos(err.message);
                setDocumentos([]);
            } else {
                setErroDocumentos("");
                setDocumentos(itens);
                const documentId = new URLSearchParams(window.location.search).get("documentId");
                if (documentId && itens.some((item) => item.documentId === documentId)) {
                    setAlvoSelecionadoId(itens.find((item) => item.documentId === documentId)?.id ?? null);
                }
            }
            setCarregandoDocumentos(false);
        }

        void carregarDocumentos();
        return () => {
            cancelado = true;
        };
    }, []);

    useEffect(() => {
        void listarTemplatesConformidade().then(setTemplates);
    }, []);

    const documentoSelecionado = useMemo(
        () => documentos.find((documento) => documento.id === alvoSelecionadoId) ?? null,
        [documentos, alvoSelecionadoId]
    );
    const templateAtivo = templates.find((template) => template.id === templateSelecionado) ?? templates[0] ?? null;
    const documentosAgrupados = useMemo(() => {
        const grupos = new Map<string, GrupoDocumentosConformidade>();

        for (const documento of documentos) {
            const grupo = grupos.get(documento.projectId);
            if (grupo) {
                grupo.documentos.push(documento);
                continue;
            }

            grupos.set(documento.projectId, {
                id: documento.projectId,
                title: documento.projectTitle,
                kind: documento.projectKind,
                documentos: [documento],
            });
        }

        return Array.from(grupos.values());
    }, [documentos]);

    useEffect(() => {
        if (!documentoSelecionado?.documentId || !documentoSelecionado.filePath) return;
        const documentId = documentoSelecionado.documentId;

        let cancelado = false;
        let timer: number | undefined;

        async function carregarResultado() {
            const [proximoResultado, err] = await obterResultadoConformidadeTemplate(documentId);
            if (cancelado) return;

            if (err) {
                salvarResultado(documentId, { resultado: null, estado: "error", erro: err.message });
                marcarDocumentoProcessando(documentId, false);
                const chaveErro = `${documentId}:request`;
                if (!notificacoesErro.current.has(chaveErro)) {
                    notificacoesErro.current.add(chaveErro);
                    toast.error(err.message);
                }
                return;
            }

            salvarResultado(documentId, {
                resultado: proximoResultado,
                estado: proximoResultado ? "idle" : "absent",
                erro: "",
            });

            if (!proximoResultado) {
                if (analisesAceitasAguardandoResultado.current.has(documentId)) {
                    marcarDocumentoProcessando(documentId, true);
                    statusAnteriorPorDocumento.current[documentId] = "processing";
                    salvarResultado(documentId, {
                        resultado: {
                            doc_id: documentId,
                            status: "processing",
                            updated_at: new Date().toISOString(),
                            report: null,
                            error: null,
                        },
                        estado: "idle",
                        erro: "",
                    });
                    timer = window.setTimeout(() => void carregarResultado(), intervaloResultadoConformidadeMs);
                    return;
                }
                statusAnteriorPorDocumento.current[documentId] = "absent";
                marcarDocumentoProcessando(documentId, false);
                return;
            }

            const statusAnterior = statusAnteriorPorDocumento.current[documentId];
            statusAnteriorPorDocumento.current[documentId] = proximoResultado.status;

            if (proximoResultado.status === "processing") {
                analisesAceitasAguardandoResultado.current.add(documentId);
                marcarDocumentoProcessando(documentId, true);
            } else {
                analisesAceitasAguardandoResultado.current.delete(documentId);
                marcarDocumentoProcessando(documentId, false);
            }

            if (proximoResultado.status === "completed" && statusAnterior === "processing") {
                if (!notificacoesConclusao.current.has(documentId)) {
                    notificacoesConclusao.current.add(documentId);
                    toast.success("A análise de conformidade com template foi concluída.");
                }
            }

            if (proximoResultado.status === "error") {
                const chaveErro = `${documentId}:backend:${proximoResultado.error ?? "sem-detalhe"}`;
                if (!notificacoesErro.current.has(chaveErro)) {
                    notificacoesErro.current.add(chaveErro);
                    toast.error(proximoResultado.error ?? "A análise de conformidade com template falhou.");
                }
            }

            if (proximoResultado?.status === "processing") {
                timer = window.setTimeout(() => void carregarResultado(), intervaloResultadoConformidadeMs);
            }
        }

        void carregarResultado();
        return () => {
            cancelado = true;
            if (timer) window.clearTimeout(timer);
        };
    }, [documentoSelecionado, marcarDocumentoProcessando, salvarResultado, versaoConsulta]);

    async function iniciarAnaliseTemplate() {
        if (!documentoSelecionado?.documentId || !documentoSelecionado.filePath || documentoSelecionado.novaVersaoEmAnalise || !templateAtivo) return;

        setIniciandoAnalise(true);
        try {
            const [arquivoPdf, arquivoErr] = await baixarArquivoPdfRelease(documentoSelecionado.filePath);
            if (arquivoErr) throw arquivoErr;
            if (!arquivoPdf) throw new Error("O backend não retornou o PDF selecionado.");

            const arquivo = new File([arquivoPdf], documentoSelecionado.fileName || "documento.pdf", {
                type: arquivoPdf.type || "application/pdf",
            });
            const [aceite, err] = await enviarConformidadeTemplate(documentoSelecionado.documentId, arquivo, templateAtivo.id);
            if (err) throw err;
            if (!aceite) throw new Error("A API não confirmou o início da análise de conformidade.");

            salvarResultado(documentoSelecionado.documentId, {
                resultado: {
                    doc_id: aceite.doc_id,
                    status: aceite.status,
                    updated_at: new Date().toISOString(),
                    report: null,
                    error: null,
                },
                estado: "idle",
                erro: "",
            });
            statusAnteriorPorDocumento.current[documentoSelecionado.documentId] = aceite.status;
            if (aceite.status === "processing") {
                analisesAceitasAguardandoResultado.current.add(documentoSelecionado.documentId);
                marcarDocumentoProcessando(documentoSelecionado.documentId, true);
            } else {
                analisesAceitasAguardandoResultado.current.delete(documentoSelecionado.documentId);
                marcarDocumentoProcessando(documentoSelecionado.documentId, false);
            }
            notificacoesErro.current.forEach((chave) => {
                if (chave.startsWith(`${documentoSelecionado.documentId}:`)) notificacoesErro.current.delete(chave);
            });
            notificacoesConclusao.current.delete(documentoSelecionado.documentId);
            setVersaoConsulta((atual) => atual + 1);
        } catch (error) {
            const mensagem = error instanceof Error ? error.message : "Não foi possível iniciar a análise de conformidade.";
            salvarResultado(documentoSelecionado.documentId, { resultado: null, estado: "error", erro: mensagem });
            marcarDocumentoProcessando(documentoSelecionado.documentId, false);
            const chaveErro = `${documentoSelecionado.documentId}:start:${mensagem}`;
            if (!notificacoesErro.current.has(chaveErro)) {
                notificacoesErro.current.add(chaveErro);
                toast.error(mensagem);
            }
        } finally {
            setIniciandoAnalise(false);
        }
    }

    async function abrirHistorico() {
        const documentId = documentoSelecionado?.documentId;
        if (!documentId) return;

        setHistoricoAberto(true);
        setCarregandoHistorico(true);
        setErroHistorico("");
        setHistorico([]);

        const [resultados, err] = await listarHistoricoConformidadeTemplate(documentId);
        if (err) {
            setErroHistorico(err.message);
        } else {
            setHistorico([...resultados].sort((resultadoA, resultadoB) => horarioResultadoHistorico(resultadoB) - horarioResultadoHistorico(resultadoA)));
        }

        setCarregandoHistorico(false);
    }

    const estadoResultadoVisivel = documentoSelecionado?.documentId
        ? resultadosPorDocumento[documentoSelecionado.documentId]
        : undefined;
    const resultadoVisivel = estadoResultadoVisivel?.resultado ?? null;
    const statusResultadoVisivel = documentoSelecionado
        ? estadoResultadoVisivel?.estado ?? "loading"
        : "idle";
    const erroResultadoVisivel = estadoResultadoVisivel?.erro ?? "";
    const analiseProcessando = resultadoVisivel?.status === "processing";
    const relatorio = resultadoVisivel?.status === "completed" ? normalizarRelatorio(resultadoVisivel.report) : null;
    const semDocumentos = !carregandoDocumentos && !erroDocumentos && documentos.length === 0;

    return (
        <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-6 overflow-hidden px-6 py-8 lg:px-8">
            <header className="z-40 -mx-6 -mt-8 border-b border-line bg-panel/95 px-6 py-6 shadow-[0_16px_30px_-26px_var(--chrome-shadow)] backdrop-blur lg:-mx-8 lg:px-8">
                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Conformidade Template
                </span>
                <h1 className="mt-2 font-display text-4xl font-bold text-ink md:text-5xl">Conformidade com template</h1>
                <p className="mt-3 max-w-4xl text-base leading-7 text-muted md:text-lg">
                    Selecione um documento enviado, escolha o template institucional e inicie a conferência.
                </p>
            </header>

            {carregandoDocumentos ? (
                <Estado
                    titulo="Carregando documentos para conformidade..."
                    descricao="Aguarde..."
                    icone={<Loader2 className="animate-spin" size={32} />}
                />
            ) : erroDocumentos ? (
                <Estado titulo={erroDocumentos} icone={<AlertTriangle size={32} />} erro />
            ) : semDocumentos ? (
                <Estado
                    titulo="Nenhum componente de documento está disponível."
                    descricao="Os componentes criados na seção Documentos aparecerão aqui. Envie o PDF correspondente para habilitar a análise com template."
                    icone={<FileWarning size={32} />}
                />
            ) : (
                <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(17rem,0.75fr)_minmax(0,2fr)]">
                    <aside className="grid h-fit self-start gap-4 rounded-lg border border-line bg-panel p-3 shadow-[0_18px_44px_-28px_var(--chrome-shadow)]" aria-label="Documentos enviados">
                        {documentosAgrupados.map((grupo) => (
                            <section className="grid gap-2" key={grupo.id}>
                                <header className="border-b border-line px-1 pb-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">{grupo.kind}</span>
                                    <h2 className="mt-1 font-display text-sm font-bold text-ink">{grupo.title}</h2>
                                </header>
                                {grupo.documentos.map((documento) => (
                                    (() => {
                                        const documentoProcessando = Boolean(documento.documentId && documentosProcessando.has(documento.documentId));
                                        const documentoSelecionado = documento.id === alvoSelecionadoId;

                                        return <button
                                            className={`grid gap-1 rounded-lg border p-3 text-left transition ${
                                                documentoProcessando
                                                    ? documentoSelecionado
                                                        ? "border-brand bg-brand/15 text-ink"
                                                        : "border-brand/60 bg-brand/10 text-ink hover:border-brand"
                                                    : documentoSelecionado
                                                        ? "border-brand bg-subtle-hover text-ink"
                                                        : "border-line bg-input-bg text-muted hover:border-brand hover:text-ink"
                                            }`}
                                            key={documento.id}
                                            type="button"
                                            onClick={() => {
                                                if (documentoSelecionado) {
                                                    setVersaoConsulta((atual) => atual + 1);
                                                    return;
                                                }

                                                setAlvoSelecionadoId(documento.id);
                                            }}
                                        >
                                            <strong className="font-display text-sm">{documento.componentLabel}</strong>
                                        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                                            {documento.fileName ?? "Sem PDF enviado"}
                                        </span>
                                        {documento.uploadedAt ? <small>{formatarData(documento.uploadedAt)}</small> : null}
                                            {documento.novaVersaoEmAnalise ? <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-line bg-panel px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-muted"><Loader2 className="animate-spin motion-reduce:animate-none" size={12} />Nova versão em análise</span> : null}
                                            {documentoProcessando ? <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-brand/40 bg-panel px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink"><Loader2 className="animate-spin motion-reduce:animate-none" size={12} />Em análise</span> : null}
                                        </button>;
                                    })()
                                ))}
                            </section>
                        ))}
                    </aside>

                    <div className="grid min-h-0 content-start gap-4 overflow-y-auto rounded-lg border border-line bg-panel p-5 shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
                        {!documentoSelecionado ? (
                            <Estado titulo="Selecione um documento para iniciar a conformidade com template." icone={<FileCheck2 size={32} />} />
                        ) : null}
                        {documentoSelecionado ? (
                            <div className="grid gap-3 rounded-lg border border-line bg-input-bg p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
                                <label className="grid gap-2 text-sm font-semibold text-ink">
                                    Template de comparação
                                    <select
                                        className="h-11 rounded-lg border border-line bg-panel px-3 text-sm font-normal text-ink outline-none transition focus:border-brand"
                                        value={templateAtivo?.id ?? ""}
                                        onChange={(event) => setTemplateSelecionado(event.target.value)}
                                        disabled={iniciandoAnalise || templates.length === 0}
                                    >
                                        {templates.length === 0 ? <option value="">Nenhum template disponível</option> : null}
                                        {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                                    </select>
                                    {documentoSelecionado.novaVersaoEmAnalise ? <span className="text-xs font-normal leading-5 text-muted">Uma nova versão está sendo analisada em Documentos. A versão anterior permanece visível até ela ficar pronta.</span> : null}
                                </label>
                                <button
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-display text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55 dark:text-preto"
                                    type="button"
                                    disabled={iniciandoAnalise || analiseProcessando || documentoSelecionado.novaVersaoEmAnalise || !documentoSelecionado.documentId || !documentoSelecionado.filePath || !templateAtivo}
                                    onClick={() => void iniciarAnaliseTemplate()}
                                >
                                    {iniciandoAnalise ? <Loader2 className="animate-spin" size={18} /> : <FileCheck2 size={18} />}
                                    {iniciandoAnalise ? "Iniciando análise..." : analiseProcessando ? "Análise em andamento" : documentoSelecionado.novaVersaoEmAnalise ? "Nova versão em análise" : "Iniciar análise"}
                                </button>
                                <button
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-4 font-display text-sm font-semibold text-ink transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                                    type="button"
                                    disabled={!documentoSelecionado.documentId}
                                    onClick={() => void abrirHistorico()}
                                >
                                    <History size={18} />
                                    Histórico
                                </button>
                            </div>
                        ) : null}
                        {documentoSelecionado && (!documentoSelecionado.documentId || !documentoSelecionado.filePath) ? (
                            <Estado
                                titulo="Este componente ainda não possui um PDF enviado para análise."
                                descricao="Envie o PDF correspondente na página Documentos para habilitar a conformidade com template."
                                icone={<FileWarning size={28} />}
                                erro
                            />
                        ) : null}
                        {documentoSelecionado && documentoSelecionado.filePath && statusResultadoVisivel === "loading" && !resultadoVisivel ? (
                            <Estado titulo="Consultando a conformidade com template..." icone={<Loader2 className="animate-spin" size={28} />} />
                        ) : null}
                        {documentoSelecionado && documentoSelecionado.filePath && statusResultadoVisivel === "absent" ? (
                            <Estado titulo="Nenhuma análise de template foi iniciada para este documento." descricao={documentoSelecionado.novaVersaoEmAnalise ? "Aguarde a análise da nova versão enviada em Documentos para iniciar outra verificação." : "Escolha um template e use “Iniciar análise”."} icone={<FileWarning size={28} />} />
                        ) : null}
                        {documentoSelecionado && statusResultadoVisivel === "error" ? <Estado titulo={erroResultadoVisivel} icone={<AlertTriangle size={28} />} erro /> : null}
                        {documentoSelecionado && resultadoVisivel?.status === "processing" ? (
                            <Estado titulo="Comparando o documento com o template..." descricao="A análise será atualizada automaticamente quando for concluída." icone={<Loader2 className="animate-spin" size={28} />} />
                        ) : null}
                        {documentoSelecionado && resultadoVisivel?.status === "error" ? (
                            <Estado titulo="Falha na verificação de conformidade" descricao={resultadoVisivel.error ?? "O backend não informou o motivo da falha."} icone={<AlertTriangle size={28} />} erro />
                        ) : null}
                        {relatorio ? (
                            <>
                                <div className="grid gap-3 lg:auto-rows-fr lg:grid-cols-2">
                                    {relatorio.metadados.length > 0 ? (
                                        <article className="grid h-full content-start gap-3 rounded-lg border border-line bg-input-bg p-4">
                                            <h2 className="font-display text-base font-bold text-ink">Metadados da análise</h2>
                                            <dl className="grid gap-3 sm:grid-cols-2">
                                                {relatorio.metadados.map((metadado) => (
                                                    <div className="min-w-0" key={metadado.rotulo}>
                                                        <dt className="text-xs font-bold uppercase tracking-wide text-muted">{metadado.rotulo}</dt>
                                                        <dd className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-ink" title={metadado.valor}>{metadado.valor}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        </article>
                                    ) : null}
                                    {relatorio.emConformidade !== undefined || (relatorio.secoesPassaram !== undefined && relatorio.secoesTotal !== undefined) || descreverResumoParaUsuario(relatorio.descricao) ? (
                                        <article className="grid h-full content-start gap-3 rounded-lg border border-line bg-input-bg p-4">
                                            <h2 className="font-display text-base font-bold text-ink">Resumo da análise</h2>
                                            <div className="grid gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-start">
                                                {relatorio.emConformidade !== undefined ? (
                                                    <div className={`rounded-lg border px-4 py-3 text-center ${relatorio.emConformidade ? "border-brand/40 bg-subtle-hover" : "border-accent/40 bg-accent/10"}`}>
                                                        <span className="block text-xs font-bold uppercase tracking-wide text-muted">Conformidade geral</span>
                                                        <strong className={`mt-1 block font-display text-sm ${relatorio.emConformidade ? "text-ink" : "text-accent"}`}>
                                                            {relatorio.emConformidade ? "Em conformidade" : "Requer ajustes"}
                                                        </strong>
                                                    </div>
                                                ) : null}
                                                {relatorio.secoesPassaram !== undefined && relatorio.secoesTotal !== undefined ? (
                                                    <div className="rounded-lg bg-panel px-4 py-3 text-center">
                                                        <strong className="font-display text-2xl text-ink">
                                                            {relatorio.secoesPassaram}/{relatorio.secoesTotal}
                                                        </strong>
                                                        <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-muted">Seções compatíveis</span>
                                                    </div>
                                                ) : null}
                                                {descreverResumoParaUsuario(relatorio.descricao) ? <p className="whitespace-pre-wrap text-sm leading-6 text-muted">{descreverResumoParaUsuario(relatorio.descricao)}</p> : null}
                                            </div>
                                        </article>
                                    ) : null}
                                </div>
                                {relatorio.secoes.length > 0 ? (
                                    relatorio.secoes.map((secao) => <SecaoCard key={secao.id} secao={secao} />)
                                ) : (
                                    <Estado titulo="O relatório foi concluído, mas não trouxe seções detalhadas." icone={<FileWarning size={24} />} />
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            )}
            {historicoAberto ? (
                <div className="fixed inset-0 z-50 grid place-items-center bg-preto/45 p-5 backdrop-blur-sm" role="presentation">
                    <section className="grid max-h-[min(42rem,calc(100dvh-2.5rem))] w-full max-w-2xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-line bg-panel shadow-xl" role="dialog" aria-modal="true" aria-labelledby="titulo-historico-conformidade">
                        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                            <div>
                                <h2 id="titulo-historico-conformidade" className="font-display text-xl font-bold text-ink">Histórico de análises</h2>
                                <p className="mt-1 text-sm text-muted">{documentoSelecionado?.fileName ?? "Documento selecionado"}</p>
                            </div>
                            <button className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:bg-input-bg hover:text-ink" type="button" aria-label="Fechar histórico" onClick={() => setHistoricoAberto(false)}>
                                <X size={18} />
                            </button>
                        </header>
                        <div className="min-h-0 overflow-y-auto p-5">
                            {carregandoHistorico ? (
                                <Estado titulo="Carregando histórico de análises..." icone={<Loader2 className="animate-spin" size={28} />} />
                            ) : erroHistorico ? (
                                <Estado titulo="Não foi possível carregar o histórico" descricao={erroHistorico} icone={<AlertTriangle size={28} />} erro />
                            ) : historico.length === 0 ? (
                                <Estado titulo="Nenhuma análise registrada" descricao="Este documento ainda não possui execuções de conformidade com template." icone={<History size={28} />} />
                            ) : (
                                <ol className="grid gap-3">
                                    {historico.map((resultado) => (
                                        <li key={resultado.id} className="grid gap-3 rounded-lg border border-line bg-input-bg p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <strong className="font-display text-base text-ink">Análise {resultado.id.slice(0, 8)}</strong>
                                                <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${classeStatusHistorico(resultado.status)}`}>{rotuloStatusHistorico(resultado.status)}</span>
                                            </div>
                                            <dl className="grid gap-2 text-sm sm:grid-cols-2">
                                                <div><dt className="text-xs font-bold uppercase tracking-wide text-muted">Criada em</dt><dd className="mt-1 text-ink">{formatarData(resultado.created_at)}</dd></div>
                                                <div><dt className="text-xs font-bold uppercase tracking-wide text-muted">Atualizada em</dt><dd className="mt-1 text-ink">{formatarData(resultado.updated_at)}</dd></div>
                                            </dl>
                                            {resultado.error ? <p className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">{resultado.error}</p> : null}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </section>
                </div>
            ) : null}
        </section>
    );
}

function Estado({
    titulo,
    descricao,
    icone,
    erro = false,
}: {
    titulo: string;
    descricao?: string;
    icone: React.ReactNode;
    erro?: boolean;
}) {
    return (
        <div className={`grid place-items-center gap-3 rounded-lg border border-dashed p-6 text-center ${erro ? "border-accent/50 text-accent" : "border-line text-muted"}`}>
            {icone}
            <strong className={erro ? "text-accent" : "text-ink"}>{titulo}</strong>
            {descricao ? <span className="max-w-xl text-sm leading-6 text-muted">{descricao}</span> : null}
        </div>
    );
}
