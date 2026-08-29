"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, BookCheck, CheckCircle2, ChevronDown, Eye, FileCheck2, FileText, FileWarning, History, Loader2, X, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
    enviarConformidadeAbnt,
    filtrarResultadosConformidadeAbntDaVersao,
    listarDocumentosConformidadeAbnt,
    listarHistoricoConformidadeAbnt,
    selecionarResultadoConformidadeAbnt,
} from "@/app/services/conformidade";
import { baixarArquivoPdfRelease } from "@/app/services/oiac";
import type {
    AlvoDocumentoConformidade,
    ResultadoConformidadeAbnt,
    ResultadoProcessamentoConformidade,
    StatusProcessamentoConformidade,
} from "@/app/types/Conformidade";

const intervaloResultadoConformidadeMs = 5000;
const intervaloAtualizacaoDocumentosMs = 5000;

type EstadoResultadoCache = {
    resultado: ResultadoConformidadeAbnt | null;
    estado: "idle" | "absent" | "error" | "pending";
    erro: string;
    versaoJaAnalisada: boolean;
    possuiAnaliseHistorica?: boolean;
    elegibilidadeResolvida: boolean;
};

type GrupoDocumentosConformidade = {
    id: string;
    title: string;
    kind: string;
    documentos: AlvoDocumentoConformidade[];
};

type RelatorioAbntEstruturado = {
    metadados: Array<{ chave: string; rotulo: string; valor: string }>;
    emConformidade?: boolean;
    criteriosTotal?: number;
    criteriosAprovados?: number;
    descricao?: string;
    criterios: Array<{ item: string; norma: string; justificativa: string; match?: boolean }>;
};

function formatarData(data: string) {
    const valor = new Date(data);
    return Number.isNaN(valor.getTime()) ? data : valor.toLocaleString("pt-BR");
}

function horarioResultadoHistorico(resultado: ResultadoProcessamentoConformidade) {
    const horario = Date.parse(resultado.updated_at);
    if (!Number.isNaN(horario)) return horario;

    const criadoEm = Date.parse(resultado.created_at);
    return Number.isNaN(criadoEm) ? Number.NEGATIVE_INFINITY : criadoEm;
}

function rotuloStatus(status: StatusProcessamentoConformidade) {
    const rotulos: Record<StatusProcessamentoConformidade, string> = {
        processing: "Em processamento",
        completed: "Concluída",
        error: "Com erro",
    };

    return rotulos[status];
}

function classeStatus(status: StatusProcessamentoConformidade) {
    if (status === "completed") return "border-brand/40 bg-subtle-hover text-ink";
    if (status === "error") return "border-accent/40 bg-accent/10 text-accent";
    return "border-line bg-panel text-muted";
}

function rotuloCampo(chave: string) {
    return chave
        .replace(/[_-]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (letra) => letra.toUpperCase());
}

function comoRegistro(valor: unknown): Record<string, unknown> | null {
    return valor && typeof valor === "object" && !Array.isArray(valor) ? valor as Record<string, unknown> : null;
}

function comoTexto(valor: unknown, fallback = "Não informado") {
    return typeof valor === "string" && valor.trim() ? valor : fallback;
}

function descreverAbordagem(valor: string) {
    return /^Abordagem híbrida por seção/i.test(valor.trim())
        ? "O documento foi verificado por critérios de conteúdo e apresentação conforme a referência ABNT."
        : valor;
}

function rotuloMetadado(chave: string) {
    const rotulos: Record<string, string> = {
        approach: "Método de análise",
        model: "Modelo utilizado",
        article_file: "Arquivo analisado",
        template_file: "Referência utilizada",
    };

    return rotulos[chave] ?? rotuloCampo(chave);
}

function nomeArquivoSeguro(caminho: string) {
    const ultimoSegmento = caminho.trim().split(/[\\/]/).at(-1)?.split(/[?#]/)[0]?.trim();
    return ultimoSegmento || "Arquivo analisado";
}

function normalizarRelatorioAbnt(valor: Record<string, unknown> | null): RelatorioAbntEstruturado | null {
    const relatorio = comoRegistro(valor);
    if (!relatorio) return null;

    const metadata = comoRegistro(relatorio.metadata);
    const summary = comoRegistro(relatorio.summary);
    const criterios = Array.isArray(relatorio.criteria)
        ? relatorio.criteria.flatMap((valorCriterio) => {
            const criterio = comoRegistro(valorCriterio);
            if (!criterio) return [];
            return [{
                item: comoTexto(criterio.criteria_item),
                norma: comoTexto(criterio.standard),
                justificativa: comoTexto(criterio.justification),
                match: typeof criterio.match === "boolean" ? criterio.match : undefined,
            }];
        })
        : [];
    const metadados = metadata
        ? Object.entries(metadata).flatMap(([chave, valorMetadado]) => {
            if (typeof valorMetadado !== "string" || !valorMetadado.trim()) return [];
            return [{
                chave,
                rotulo: rotuloMetadado(chave),
                valor: chave === "approach" ? descreverAbordagem(valorMetadado) : valorMetadado,
            }];
        })
        : [];
    const emConformidade = typeof summary?.is_compliant === "boolean" ? summary.is_compliant : undefined;
    const criteriosTotal = typeof summary?.criteria_total === "number" ? summary.criteria_total : undefined;
    const criteriosAprovados = typeof summary?.criteria_passed === "number" ? summary.criteria_passed : undefined;
    const descricao = typeof summary?.description === "string" ? summary.description : undefined;

    if (metadados.length === 0 && emConformidade === undefined && criteriosTotal === undefined && !descricao && criterios.length === 0) return null;

    return { metadados, emConformidade, criteriosTotal, criteriosAprovados, descricao, criterios };
}

function IndicadorConformidadeAbnt({ match }: { match?: boolean }) {
    if (match === undefined) return null;

    const conforme = match === true;

    return (
        <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
                conforme
                    ? "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-red-600/40 bg-red-500/10 text-red-700 dark:text-red-300"
            }`}
        >
            {conforme ? <CheckCircle2 aria-hidden="true" size={15} /> : <XCircle aria-hidden="true" size={15} />}
            {conforme ? "Em conformidade" : "Não conforme"}
        </span>
    );
}

function RelatorioAbnt({ relatorio }: { relatorio: RelatorioAbntEstruturado }) {
    const possuiResumo = relatorio.emConformidade !== undefined || relatorio.criteriosTotal !== undefined || relatorio.descricao;

    return (
        <div className="grid gap-4">
            {relatorio.metadados.length > 0 || possuiResumo ? (
                <div className="grid gap-3 lg:auto-rows-fr lg:grid-cols-2">
                    {relatorio.metadados.length > 0 ? (
                        <section className="grid h-full content-start gap-3 rounded-lg border border-line bg-panel p-4">
                            <h3 className="font-display text-base font-bold text-ink">Metadados da análise</h3>
                            <dl className="grid gap-3 sm:grid-cols-2">
                                {relatorio.metadados.map((metadado) => (
                                    <div className="min-w-0" key={metadado.rotulo}>
                                        <dt className="text-xs font-bold uppercase tracking-wide text-muted">{metadado.rotulo}</dt>
                                        {metadado.chave === "article_file" ? (
                                            <dd className="mt-1">
                                                <span aria-label={`Arquivo analisado: ${nomeArquivoSeguro(metadado.valor)}`} className="inline-flex max-w-full items-center gap-2 rounded-md border border-line bg-input-bg px-2.5 py-1.5 text-sm text-ink">
                                                    <FileText aria-hidden="true" className="shrink-0 text-accent" size={16} />
                                                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">{nomeArquivoSeguro(metadado.valor)}</span>
                                                </span>
                                            </dd>
                                        ) : <dd className="mt-1 text-sm leading-6 text-ink">{metadado.valor}</dd>}
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ) : null}
                    {possuiResumo ? (
                        <section className="grid h-full content-start gap-3 rounded-lg border border-line bg-panel p-4">
                            <h3 className="font-display text-base font-bold text-ink">Resumo da análise</h3>
                            <div className="grid gap-3">
                                <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
                                    {relatorio.emConformidade !== undefined ? (
                                        <div className={`rounded-lg border px-4 py-3 text-center ${relatorio.emConformidade ? "border-brand/40 bg-subtle-hover" : "border-accent/40 bg-accent/10"}`}>
                                            <span className="block text-xs font-bold uppercase tracking-wide text-muted">Conformidade geral</span>
                                            <strong className={`mt-1 block font-display text-sm ${relatorio.emConformidade ? "text-ink" : "text-accent"}`}>{relatorio.emConformidade ? "Em conformidade" : "Requer ajustes"}</strong>
                                        </div>
                                    ) : null}
                                    {relatorio.criteriosTotal !== undefined ? (
                                        <div className="rounded-lg bg-input-bg px-4 py-3 text-center">
                                            <strong className="font-display text-2xl text-ink">{relatorio.criteriosAprovados ?? 0}/{relatorio.criteriosTotal}</strong>
                                            <span className="mt-1 block text-xs font-bold uppercase tracking-wide text-muted">Critérios atendidos</span>
                                        </div>
                                    ) : null}
                                </div>
                                {relatorio.descricao ? <p className="whitespace-pre-wrap text-sm leading-6 text-muted">{relatorio.descricao}</p> : null}
                            </div>
                        </section>
                    ) : null}
                </div>
            ) : null}
            {relatorio.criterios.length > 0 ? (
                <section className="grid gap-3 rounded-lg border border-line bg-panel p-4">
                    <h3 className="font-display text-base font-bold text-ink">Critérios avaliados</h3>
                    <ol className="grid gap-3">
                        {relatorio.criterios.map((criterio, indice) => (
                            <li key={`${criterio.item}-${indice}`}>
                                <details className="group rounded-lg border border-line bg-input-bg">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                                        <strong className="min-w-0 text-base text-ink">{criterio.item}</strong>
                                        <div className="ml-auto flex shrink-0 items-center justify-end gap-3">
                                            <IndicadorConformidadeAbnt match={criterio.match} />
                                            <ChevronDown aria-hidden="true" className="transition group-open:rotate-180" size={18} />
                                        </div>
                                    </summary>
                                    <div className="grid gap-3 border-t border-line p-4">
                                        <div className="grid gap-1"><strong className="text-base text-ink">Norma ou referência</strong><span className="whitespace-pre-wrap text-sm leading-6 text-muted">{criterio.norma}</span></div>
                                        <div className="grid gap-1"><strong className="text-base text-ink">Justificativa</strong><span className="whitespace-pre-wrap text-sm leading-6 text-muted">{criterio.justificativa}</span></div>
                                    </div>
                                </details>
                            </li>
                        ))}
                    </ol>
                </section>
            ) : null}
        </div>
    );
}

function ValorRelatorio({ valor, profundidade = 0 }: { valor: unknown; profundidade?: number }) {
    if (valor === null || valor === undefined) return <span className="text-muted">Não informado</span>;
    if (typeof valor === "string" || typeof valor === "number" || typeof valor === "boolean") {
        return <span className="whitespace-pre-wrap text-sm leading-6 text-ink">{String(valor)}</span>;
    }

    if (Array.isArray(valor)) {
        if (valor.length === 0) return <span className="text-sm text-muted">Nenhum item informado.</span>;

        return (
            <ol className="grid gap-3">
                {valor.map((item, indice) => (
                    <li className="rounded-md border border-line bg-panel p-3" key={indice}>
                        <ValorRelatorio valor={item} profundidade={profundidade + 1} />
                    </li>
                ))}
            </ol>
        );
    }

    if (typeof valor === "object") {
        const entradas = Object.entries(valor as Record<string, unknown>);
        if (entradas.length === 0) return <span className="text-sm text-muted">Nenhum detalhe informado.</span>;

        return (
            <dl className={`grid gap-3 ${profundidade === 0 ? "sm:grid-cols-2" : ""}`}>
                {entradas.map(([chave, item]) => (
                    <div className="grid gap-1" key={chave}>
                        <dt className="text-xs font-bold uppercase tracking-wide text-muted">{rotuloCampo(chave)}</dt>
                        <dd className="rounded-md border border-line bg-input-bg p-3">
                            <ValorRelatorio valor={item} profundidade={profundidade + 1} />
                        </dd>
                    </div>
                ))}
            </dl>
        );
    }

    return <span className="text-sm text-muted">Formato de detalhe não reconhecido.</span>;
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

export default function ConformidadeAbntWorkspace() {
    const [documentos, setDocumentos] = useState<AlvoDocumentoConformidade[]>([]);
    const [carregandoDocumentos, setCarregandoDocumentos] = useState(true);
    const [erroDocumentos, setErroDocumentos] = useState("");
    const [alvoSelecionadoId, setAlvoSelecionadoId] = useState<string | null>(null);
    const [resultadosPorDocumento, setResultadosPorDocumento] = useState<Record<string, EstadoResultadoCache>>({});
    const [documentosProcessando, setDocumentosProcessando] = useState<Set<string>>(() => new Set());
    const [iniciandoAnalise, setIniciandoAnalise] = useState(false);
    const [versaoConsulta, setVersaoConsulta] = useState(0);
    const [historicoAberto, setHistoricoAberto] = useState(false);
    const [historico, setHistorico] = useState<ResultadoProcessamentoConformidade[]>([]);
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [erroHistorico, setErroHistorico] = useState("");
    const resultadosPorDocumentoRef = useRef<Record<string, EstadoResultadoCache>>({});
    const statusAnteriorPorDocumento = useRef<Record<string, StatusProcessamentoConformidade | "absent">>({});
    const analisesAceitasAguardandoResultado = useRef(new Set<string>());
    const versoesComAnaliseAceita = useRef(new Set<string>());
    const notificacoes = useRef(new Set<string>());

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

    const notificarUmaVez = useCallback((chave: string, tipo: "success" | "error", mensagem: string) => {
        if (notificacoes.current.has(chave)) return;

        notificacoes.current.add(chave);
        toast[tipo](mensagem);
    }, []);

    useEffect(() => {
        let cancelado = false;

        async function carregarDocumentos() {
            setCarregandoDocumentos(true);
            const [itens, err] = await listarDocumentosConformidadeAbnt();
            if (cancelado) return;

            if (err) {
                setErroDocumentos(err.message);
                setDocumentos([]);
            } else {
                setErroDocumentos("");
                setDocumentos(itens);

                const estadosIniciais = await Promise.all(itens.map(async (documento) => {
                    if (!documento.documentId || !documento.filePath) return null;

                    const [resultados, resultadosErr] = await listarHistoricoConformidadeAbnt(documento.documentId);
                    if (resultadosErr) return null;

                    const resultadosDaVersao = filtrarResultadosConformidadeAbntDaVersao(resultados, documento.uploadedAt, documento.filePath);
                    return [documento.documentId, {
                        resultado: null,
                        estado: "pending",
                        erro: "",
                        versaoJaAnalisada: resultadosDaVersao.length > 0,
                        possuiAnaliseHistorica: resultados.length > 0,
                        elegibilidadeResolvida: true,
                    }] as const;
                }));
                if (cancelado) return;

                const cacheInicial: Record<string, EstadoResultadoCache> = {};
                for (const estado of estadosIniciais) {
                    if (estado) cacheInicial[estado[0]] = estado[1];
                }
                resultadosPorDocumentoRef.current = { ...cacheInicial, ...resultadosPorDocumentoRef.current };
                setResultadosPorDocumento(resultadosPorDocumentoRef.current);
            }

            setCarregandoDocumentos(false);
        }

        void carregarDocumentos();
        return () => {
            cancelado = true;
        };
    }, []);

    useEffect(() => {
        if (!documentos.some((documento) => documento.novaVersaoEmAnalise)) return;

        const timer = window.setTimeout(async () => {
            const [itens, err] = await listarDocumentosConformidadeAbnt();
            if (err) return;

            setDocumentos(itens);
            setAlvoSelecionadoId((alvoAtual) => itens.some((item) => item.id === alvoAtual) ? alvoAtual : null);
        }, intervaloAtualizacaoDocumentosMs);

        return () => window.clearTimeout(timer);
    }, [documentos]);

    const documentoSelecionado = useMemo(
        () => documentos.find((documento) => documento.id === alvoSelecionadoId) ?? null,
        [documentos, alvoSelecionadoId]
    );
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
        const versaoEnviadaEm = documentoSelecionado.uploadedAt;
        const caminhoArquivo = documentoSelecionado.filePath;
        let cancelado = false;
        let timer: number | undefined;

        async function carregarResultado() {
            const [resultados, err] = await listarHistoricoConformidadeAbnt(documentId);
            if (cancelado) return;

            if (err) {
                const analiseJaAceita = versoesComAnaliseAceita.current.has(documentId);
                salvarResultado(documentId, {
                    resultado: null,
                    estado: "error",
                    erro: err.message,
                    versaoJaAnalisada: analiseJaAceita,
                    elegibilidadeResolvida: false,
                });
                analisesAceitasAguardandoResultado.current.delete(documentId);
                marcarDocumentoProcessando(documentId, false);
                notificarUmaVez(`${documentId}:request:${err.message}`, "error", err.message);
                return;
            }

            const resultadosDaVersao = filtrarResultadosConformidadeAbntDaVersao(resultados, versaoEnviadaEm, caminhoArquivo);
            const resultadosParaExibicao = resultadosDaVersao.length > 0 ? resultadosDaVersao : resultados;
            const resultadoConsultado = selecionarResultadoConformidadeAbnt(resultadosParaExibicao, {
                priorizarProcessamento: analisesAceitasAguardandoResultado.current.has(documentId),
            });
            const resultadoAnterior = resultadosPorDocumentoRef.current[documentId]?.resultado;
            const manterRelatorioAnterior = resultadoConsultado?.status === "processing" && resultadoAnterior?.status === "completed";
            const proximoResultado = manterRelatorioAnterior ? resultadoAnterior : resultadoConsultado;
            const versaoJaAnalisada = versoesComAnaliseAceita.current.has(documentId) || resultadosDaVersao.length > 0;

            salvarResultado(documentId, {
                resultado: proximoResultado,
                estado: proximoResultado ? "idle" : "absent",
                erro: "",
                versaoJaAnalisada,
                possuiAnaliseHistorica: resultados.length > 0,
                elegibilidadeResolvida: true,
            });

            if (!resultadoConsultado) {
                if (analisesAceitasAguardandoResultado.current.has(documentId)) {
                    marcarDocumentoProcessando(documentId, true);
                    statusAnteriorPorDocumento.current[documentId] = "processing";
                    salvarResultado(documentId, {
                        resultado: resultadoAnterior?.status === "completed" ? resultadoAnterior : {
                            doc_id: documentId,
                            status: "processing",
                            updated_at: new Date().toISOString(),
                            report: null,
                            error: null,
                        },
                        estado: "idle",
                        erro: "",
                        versaoJaAnalisada: true,
                        possuiAnaliseHistorica: true,
                        elegibilidadeResolvida: true,
                    });
                    timer = window.setTimeout(() => void carregarResultado(), intervaloResultadoConformidadeMs);
                    return;
                }

                statusAnteriorPorDocumento.current[documentId] = "absent";
                marcarDocumentoProcessando(documentId, false);
                return;
            }

            const statusAnterior = statusAnteriorPorDocumento.current[documentId];
            statusAnteriorPorDocumento.current[documentId] = resultadoConsultado.status;

            if (resultadoConsultado.status === "processing") {
                if (!analisesAceitasAguardandoResultado.current.has(documentId)) {
                    marcarDocumentoProcessando(documentId, false);
                    return;
                }

                marcarDocumentoProcessando(documentId, true);
                timer = window.setTimeout(() => void carregarResultado(), intervaloResultadoConformidadeMs);
                return;
            }

            analisesAceitasAguardandoResultado.current.delete(documentId);
            marcarDocumentoProcessando(documentId, false);
            if (resultadoConsultado.status === "completed" && statusAnterior === "processing") {
                notificarUmaVez(`${documentId}:completed:${resultadoConsultado.updated_at}`, "success", "A análise de conformidade ABNT foi concluída.");
            }
            if (resultadoConsultado.status === "error") {
                notificarUmaVez(
                    `${documentId}:backend:${resultadoConsultado.updated_at}:${resultadoConsultado.error ?? "sem-detalhe"}`,
                    "error",
                    resultadoConsultado.error ?? "A análise de conformidade ABNT falhou."
                );
            }
        }

        void carregarResultado();
        return () => {
            cancelado = true;
            if (timer) window.clearTimeout(timer);
        };
    }, [documentoSelecionado, marcarDocumentoProcessando, notificarUmaVez, salvarResultado, versaoConsulta]);

    async function iniciarAnaliseAbnt() {
        if (!documentoSelecionado?.documentId || !documentoSelecionado.filePath || iniciandoAnalise) return;
        const documentId = documentoSelecionado.documentId;
        const estadoAtual = resultadosPorDocumentoRef.current[documentId];
        if (!estadoAtual?.elegibilidadeResolvida || estadoAtual.versaoJaAnalisada) return;

        setIniciandoAnalise(true);
        try {
            const [arquivoPdf, arquivoErr] = await baixarArquivoPdfRelease(documentoSelecionado.filePath);
            if (arquivoErr) throw arquivoErr;
            if (!arquivoPdf) throw new Error("O backend não retornou o PDF selecionado.");

            const arquivo = new File([arquivoPdf], documentoSelecionado.fileName || "documento.pdf", {
                type: arquivoPdf.type || "application/pdf",
            });
            const [aceite, err] = await enviarConformidadeAbnt(documentId, arquivo);
            if (err) throw err;
            if (!aceite) throw new Error("A API não confirmou o início da análise de conformidade ABNT.");

            const resultadoAnterior = resultadosPorDocumentoRef.current[documentId]?.resultado;
            salvarResultado(documentId, {
                resultado: aceite.status === "processing" && resultadoAnterior?.status === "completed" ? resultadoAnterior : {
                    doc_id: aceite.doc_id,
                    status: aceite.status,
                    updated_at: new Date().toISOString(),
                    report: null,
                    error: null,
                },
                estado: "idle",
                erro: "",
                versaoJaAnalisada: true,
                possuiAnaliseHistorica: true,
                elegibilidadeResolvida: true,
            });
            statusAnteriorPorDocumento.current[documentId] = aceite.status;
            versoesComAnaliseAceita.current.add(documentId);
            if (aceite.status === "processing") analisesAceitasAguardandoResultado.current.add(documentId);
            else analisesAceitasAguardandoResultado.current.delete(documentId);
            marcarDocumentoProcessando(documentId, aceite.status === "processing");
            for (const chave of notificacoes.current) {
                if (chave.startsWith(`${documentId}:`)) notificacoes.current.delete(chave);
            }
            notificarUmaVez(`${documentId}:accepted`, "success", "A análise de conformidade ABNT foi iniciada.");
            setVersaoConsulta((atual) => atual + 1);
        } catch (error) {
            const mensagem = error instanceof Error ? error.message : "Não foi possível iniciar a análise de conformidade ABNT.";
            salvarResultado(documentId, {
                resultado: null,
                estado: "error",
                erro: mensagem,
                versaoJaAnalisada: false,
                elegibilidadeResolvida: true,
            });
            analisesAceitasAguardandoResultado.current.delete(documentId);
            marcarDocumentoProcessando(documentId, false);
            notificarUmaVez(`${documentId}:start:${mensagem}`, "error", mensagem);
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
        const [resultados, err] = await listarHistoricoConformidadeAbnt(documentId);
        if (err) setErroHistorico(err.message);
        else setHistorico([...resultados].sort((a, b) => horarioResultadoHistorico(b) - horarioResultadoHistorico(a)));
        setCarregandoHistorico(false);
    }

    const estadoResultadoVisivel = documentoSelecionado?.documentId
        ? resultadosPorDocumento[documentoSelecionado.documentId]
        : undefined;
    const resultadoVisivel = estadoResultadoVisivel?.resultado ?? null;
    const statusResultadoVisivel = documentoSelecionado
        ? estadoResultadoVisivel?.estado === "pending" ? "loading" : estadoResultadoVisivel?.estado ?? "loading"
        : "idle";
    const semDocumentos = !carregandoDocumentos && !erroDocumentos && documentos.length === 0;
    const analiseProcessando = Boolean(documentoSelecionado?.documentId && documentosProcessando.has(documentoSelecionado.documentId)) || resultadoVisivel?.status === "processing";
    const versaoJaAnalisada = Boolean(estadoResultadoVisivel?.versaoJaAnalisada);
    const elegibilidadeResolvida = Boolean(estadoResultadoVisivel?.elegibilidadeResolvida);
    const relatorioAbnt = resultadoVisivel?.status === "completed" ? normalizarRelatorioAbnt(resultadoVisivel.report) : null;

    return (
        <section className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-6 overflow-hidden px-6 py-8 lg:px-8">
            <header className="z-40 -mx-6 -mt-8 border-b border-line bg-panel/95 px-6 py-6 shadow-[0_16px_30px_-26px_var(--chrome-shadow)] backdrop-blur lg:-mx-8 lg:px-8">
                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Conformidade ABNT</span>
                <h1 className="mt-2 font-display text-4xl font-bold text-ink md:text-5xl">Conformidade com ABNT</h1>
                <p className="mt-3 max-w-4xl text-base leading-7 text-muted md:text-lg">
                    Selecione um documento enviado para verificar sua conformidade com a referência ABNT institucional.
                </p>
            </header>

            {carregandoDocumentos ? (
                <div className="grid min-h-0 place-items-center rounded-lg border border-dashed border-line p-6 text-center text-muted">
                    <div className="inline-flex items-center gap-3">
                        <Loader2 className="animate-spin text-accent motion-reduce:animate-none" size={28} />
                        <strong className="font-display text-lg text-ink">Carregando documentos para conformidade...</strong>
                    </div>
                </div>
            ) : erroDocumentos ? (
                <Estado titulo={erroDocumentos} icone={<AlertTriangle size={32} />} erro />
            ) : semDocumentos ? (
                <Estado titulo="Nenhum PDF enviado está disponível." descricao="Envie um PDF na página Documentos para habilitar a análise ABNT." icone={<FileWarning size={32} />} />
            ) : (
                <div className="grid min-h-0 grid-rows-[minmax(0,1fr)] gap-5 overflow-hidden xl:grid-cols-[minmax(17rem,0.75fr)_minmax(0,2fr)]">
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
                                        const documentoAnalisado = !documentoProcessando && Boolean(documento.documentId && resultadosPorDocumento[documento.documentId]?.possuiAnaliseHistorica);
                                        const documentoSelecionado = documento.id === alvoSelecionadoId;

                                        return <button
                                            className={`grid gap-1 rounded-lg border p-3 text-left transition ${documentoProcessando ? documentoSelecionado ? "border-brand bg-brand/15 text-ink" : "border-brand/60 bg-brand/10 text-ink hover:border-brand" : documentoSelecionado ? "border-brand bg-subtle-hover text-ink" : "border-line bg-input-bg text-muted hover:border-brand hover:text-ink"}`}
                                            key={documento.id}
                                            type="button"
                                            onClick={() => setAlvoSelecionadoId(documento.id)}
                                        >
                                        <strong className="font-display text-sm">{documento.componentLabel}</strong>
                                        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm" title={documento.fileName}>{documento.fileName}</span>
                                        {documento.uploadedAt ? <small>{formatarData(documento.uploadedAt)}</small> : null}
                                            {documento.novaVersaoEmAnalise ? <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-line bg-panel px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-muted"><Loader2 className="animate-spin motion-reduce:animate-none" size={12} />Nova versão em análise</span> : null}
                                            {documentoProcessando ? <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-brand/40 bg-panel px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink"><Loader2 className="animate-spin motion-reduce:animate-none" size={12} />Em análise</span> : null}
                                            {documentoAnalisado ? <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-brand/40 bg-subtle-hover px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink"><FileCheck2 size={12} />Analisado</span> : null}
                                        </button>;
                                    })()
                                ))}
                            </section>
                        ))}
                    </aside>

                    <div className="grid min-h-0 content-start gap-4 overflow-y-auto rounded-lg border border-line bg-panel p-5 pb-10 shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
                        {!documentoSelecionado ? <Estado titulo="Selecione um documento para iniciar a conformidade ABNT." icone={<BookCheck size={32} />} /> : null}
                        {documentoSelecionado ? (
                            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-input-bg p-4">
                                <div className="min-w-0 flex-1">
                                    <strong className="block truncate font-display text-sm text-ink" title={documentoSelecionado.fileName}>{documentoSelecionado.fileName}</strong>
                                    <span className="mt-1 block text-sm text-muted">{documentoSelecionado.novaVersaoEmAnalise ? "Uma nova versão foi enviada em Documentos. Você já pode iniciar uma análise para ela; o último relatório permanece visível como referência." : versaoJaAnalisada ? "Esta versão já possui uma análise ABNT. Envie uma nova versão em Documentos para habilitar outra análise." : "A referência ABNT é definida pelo sistema."}</span>
                                </div>
                                <button
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-display text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55 dark:text-preto"
                                    type="button"
                                    disabled={iniciandoAnalise || analiseProcessando || versaoJaAnalisada || !elegibilidadeResolvida || !documentoSelecionado.documentId || !documentoSelecionado.filePath}
                                    onClick={() => void iniciarAnaliseAbnt()}
                                >
                                    {iniciandoAnalise || analiseProcessando ? <Loader2 className="animate-spin motion-reduce:animate-none" size={18} /> : <FileCheck2 size={18} />}
                                    {iniciandoAnalise ? "Iniciando análise..." : analiseProcessando ? "Análise em andamento" : versaoJaAnalisada ? "Análise já realizada" : "Iniciar análise"}
                                </button>
                                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-4 font-display text-sm font-semibold text-ink transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55" type="button" disabled={!documentoSelecionado.documentId} onClick={() => void abrirHistorico()}>
                                    <History size={18} /> Histórico
                                </button>
                            </div>
                        ) : null}
                        {documentoSelecionado && statusResultadoVisivel === "loading" && !resultadoVisivel ? <Estado titulo="Consultando a conformidade ABNT..." icone={<Loader2 className="animate-spin motion-reduce:animate-none" size={28} />} /> : null}
                        {documentoSelecionado && statusResultadoVisivel === "absent" ? <Estado titulo="Nenhuma análise ABNT foi iniciada para esta versão." descricao={documentoSelecionado.novaVersaoEmAnalise ? "Aguarde a análise da nova versão enviada em Documentos para iniciar outra verificação." : "Use “Iniciar análise” para começar a verificação."} icone={<FileWarning size={28} />} /> : null}
                        {documentoSelecionado && statusResultadoVisivel === "error" ? <Estado titulo={estadoResultadoVisivel?.erro ?? "Não foi possível consultar a conformidade ABNT."} icone={<AlertTriangle size={28} />} erro /> : null}
                        {documentoSelecionado && resultadoVisivel?.status === "processing" ? <Estado titulo="Verificando a conformidade ABNT..." descricao="A análise será atualizada automaticamente quando for concluída." icone={<Loader2 className="animate-spin motion-reduce:animate-none" size={28} />} /> : null}
                        {documentoSelecionado && resultadoVisivel?.status === "error" ? <Estado titulo="Falha na verificação de conformidade ABNT" descricao={resultadoVisivel.error ?? "O backend não informou o motivo da falha."} icone={<AlertTriangle size={28} />} erro /> : null}
                        {documentoSelecionado && resultadoVisivel?.status === "completed" ? (
                            resultadoVisivel.report ? (
                                <article className="grid gap-4 rounded-lg border border-line bg-input-bg p-4">
                                    <header>
                                        <h2 className="font-display text-xl font-bold text-ink">Resultado da análise</h2>
                                        <p className="mt-1 text-sm text-muted">Concluída em {formatarData(resultadoVisivel.updated_at)}</p>
                                    </header>
                                    {relatorioAbnt ? <RelatorioAbnt relatorio={relatorioAbnt} /> : <ValorRelatorio valor={resultadoVisivel.report} />}
                                </article>
                            ) : <Estado titulo="A análise foi concluída, mas não trouxe detalhes estruturados." descricao={`Atualizada em ${formatarData(resultadoVisivel.updated_at)}.`} icone={<FileWarning size={28} />} />
                        ) : null}
                    </div>
                </div>
            )}

            {historicoAberto ? (
                <div className="fixed inset-0 z-50 grid place-items-center bg-preto/45 p-5 backdrop-blur-sm" role="presentation">
                    <section className="grid max-h-[min(42rem,calc(100dvh-2.5rem))] w-full max-w-2xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-line bg-panel shadow-xl" role="dialog" aria-modal="true" aria-labelledby="titulo-historico-abnt">
                        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                            <div className="min-w-0 flex-1">
                                <h2 className="font-display text-xl font-bold text-ink" id="titulo-historico-abnt">Histórico de análises ABNT</h2>
                                <p className="mt-1 truncate text-sm text-muted" title={documentoSelecionado?.fileName}>{documentoSelecionado?.fileName ?? "Documento selecionado"}</p>
                            </div>
                            <button aria-label="Fechar histórico" className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:bg-input-bg hover:text-ink" type="button" onClick={() => setHistoricoAberto(false)}><X size={18} /></button>
                        </header>
                        <div className="min-h-0 overflow-y-auto p-5">
                            {carregandoHistorico ? <Estado titulo="Carregando histórico de análises..." icone={<Loader2 className="animate-spin motion-reduce:animate-none" size={28} />} /> : null}
                            {!carregandoHistorico && erroHistorico ? <Estado titulo="Não foi possível carregar o histórico" descricao={erroHistorico} icone={<AlertTriangle size={28} />} erro /> : null}
                            {!carregandoHistorico && !erroHistorico && historico.length === 0 ? <Estado titulo="Nenhuma análise registrada" descricao="Este documento ainda não possui execuções de conformidade ABNT." icone={<History size={28} />} /> : null}
                            {!carregandoHistorico && !erroHistorico && historico.length > 0 ? (
                                <ol className="grid gap-3">
                                    {historico.map((resultado) => (
                                        (() => {
                                            const emVisualizacao = resultado.id === resultadoVisivel?.id
                                                || (!resultadoVisivel?.id && resultado.updated_at === resultadoVisivel?.updated_at && resultado.status === resultadoVisivel.status);

                                            return <li className={`grid gap-3 rounded-lg border p-4 ${emVisualizacao ? "border-brand bg-subtle-hover shadow-[0_0_0_1px_var(--brand)]" : "border-line bg-input-bg"}`} key={resultado.id}>
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <strong className="font-display text-base text-ink">Análise {resultado.id.slice(0, 8)}</strong>
                                                <div className="flex flex-wrap items-center justify-end gap-2">
                                                    {emVisualizacao ? <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-panel px-2.5 py-1 text-xs font-bold text-ink"><Eye size={13} />Em visualização</span> : null}
                                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${classeStatus(resultado.status)}`}>{rotuloStatus(resultado.status)}</span>
                                                </div>
                                            </div>
                                            <dl className="grid gap-2 text-sm sm:grid-cols-2">
                                                <div><dt className="text-xs font-bold uppercase tracking-wide text-muted">Criada em</dt><dd className="mt-1 text-ink">{formatarData(resultado.created_at)}</dd></div>
                                                <div><dt className="text-xs font-bold uppercase tracking-wide text-muted">Atualizada em</dt><dd className="mt-1 text-ink">{formatarData(resultado.updated_at)}</dd></div>
                                            </dl>
                                            {resultado.error ? <p className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">{resultado.error}</p> : null}
                                            </li>;
                                        })()
                                    ))}
                                </ol>
                            ) : null}
                        </div>
                    </section>
                </div>
            ) : null}
        </section>
    );
}
