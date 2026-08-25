"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Archive, BookOpenText, Loader2, RefreshCw, Search, UsersRound } from "lucide-react";

import { useAuth } from "@/app/data/provider/AuthProvider";
import { listarDocumentosOrientando, listarMeusOrientandos } from "@/app/services/orientacao";
import type { DocumentoOrientando } from "@/app/types/Documento";
import type { CartaoOrientando } from "@/app/types/Orientacao";

type MonitoramentoOrientando = {
    orientando: CartaoOrientando;
    documentos: DocumentoOrientando[];
};

type FalhaOrientando = {
    orientandoId: string;
    mensagem: string;
};

function normalizarTexto(valor: string) {
    return valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
}

function textoProjeto(documento: DocumentoOrientando) {
    return documento.projeto_nome?.trim() || "Projeto não informado";
}

function textoGrupo(documento: DocumentoOrientando) {
    return documento.grupo?.trim() || "Grupo não informado";
}

function formatarData(data?: string | null) {
    if (!data) return "Não informada";

    const valor = new Date(data);
    if (Number.isNaN(valor.getTime())) return "Não informada";

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(valor);
}

function normalizarStatus(status?: string | null) {
    return status?.trim().toUpperCase() || null;
}

function timestamp(data?: string | null) {
    if (!data) return Number.NEGATIVE_INFINITY;

    const valor = new Date(data).getTime();
    return Number.isNaN(valor) ? Number.NEGATIVE_INFINITY : valor;
}

function statusMaisRecenteHistorico(documento: DocumentoOrientando) {
    const historico = documento.history ?? [];
    if (historico.length === 0) return null;

    const maisRecente = historico.reduce((atual, item) =>
        timestamp(item.updated_at ?? item.created_at) > timestamp(atual.updated_at ?? atual.created_at) ? item : atual
    );

    return normalizarStatus(maisRecente.status);
}

function statusExibido(documento: DocumentoOrientando) {
    const statusHistorico = statusMaisRecenteHistorico(documento);
    return statusHistorico === "COMPLETED" ? statusHistorico : normalizarStatus(documento.processing_status);
}

function rotuloStatus(status?: string | null) {
    const rotulos: Record<string, string> = {
        IDLE: "Aguardando",
        QUEUED: "Na fila de processamento",
        WAITING_FOR_REVIEW: "Aguardando revisão",
        PROCESSING: "Processando",
        COMPLETED: "Concluído",
        ERROR: "Erro no processamento",
        FAILED: "Falha no processamento",
        PENDING: "Pendente",
        UNDER_CONSTRUCTION: "Em elaboração",
    };

    const statusNormalizado = normalizarStatus(status);
    if (!statusNormalizado) return "Sem status";
    return rotulos[statusNormalizado] ?? "Status indisponível";
}

function classeStatus(status?: string | null) {
    const statusNormalizado = normalizarStatus(status);
    if (statusNormalizado === "COMPLETED") return "border-brand/40 bg-subtle-hover text-ink";
    if (statusNormalizado === "ERROR" || statusNormalizado === "FAILED") return "border-laranja/40 bg-laranja/10 text-laranja";
    if (statusNormalizado === "PROCESSING" || statusNormalizado === "QUEUED" || statusNormalizado === "WAITING_FOR_REVIEW") return "border-accent/40 bg-accent/10 text-accent";
    return "border-line bg-input-bg text-muted";
}

export default function DocumentosOrientandosWorkspace() {
    const { usuario } = useAuth();
    const [monitoramento, setMonitoramento] = useState<MonitoramentoOrientando[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState("");
    const [falhas, setFalhas] = useState<FalhaOrientando[]>([]);
    const [orientandoSelecionadoId, setOrientandoSelecionadoId] = useState("todos");
    const [buscaProjeto, setBuscaProjeto] = useState("");
    const monitoramentoAtual = useRef<MonitoramentoOrientando[]>([]);

    const carregarMonitoramento = useCallback(async () => {
        const possuiDadosAnteriores = monitoramentoAtual.current.length > 0;
        if (possuiDadosAnteriores) setAtualizando(true);
        else setCarregando(true);

        const [orientandos, orientandosErr] = await listarMeusOrientandos();
        if (orientandosErr) {
            setErro(orientandosErr.message);
            setFalhas([]);
            setCarregando(false);
            setAtualizando(false);
            return;
        }

        const anteriorPorOrientandoId = new Map(monitoramentoAtual.current.map((item) => [item.orientando.advisee.id, item] as const));
        const resultados = await Promise.all(
            orientandos.map(async (orientando) => {
                const [documentos, documentosErr] = await listarDocumentosOrientando(orientando.advisee.id);
                return { orientando, documentos, documentosErr };
            })
        );

        const proximasFalhas: FalhaOrientando[] = [];
        const proximoMonitoramento = resultados.map(({ orientando, documentos, documentosErr }) => {
            if (documentosErr) {
                proximasFalhas.push({ orientandoId: orientando.advisee.id, mensagem: documentosErr.message });
                const anterior = anteriorPorOrientandoId.get(orientando.advisee.id);
                return anterior ? { ...anterior, orientando } : { orientando, documentos: [] };
            }

            return { orientando, documentos };
        });

        monitoramentoAtual.current = proximoMonitoramento;
        setMonitoramento(proximoMonitoramento);
        setOrientandoSelecionadoId((atual) =>
            atual !== "todos" && !orientandos.some((orientando) => orientando.advisee.id === atual) ? "todos" : atual
        );
        setFalhas(proximasFalhas);
        setErro("");
        setCarregando(false);
        setAtualizando(false);
    }, []);

    useEffect(() => {
        if (usuario?.access_level !== "ADMIN") return;
        void Promise.resolve().then(carregarMonitoramento);
    }, [carregarMonitoramento, usuario?.access_level]);

    const monitoramentoFiltrado = useMemo(() => {
        const buscaNormalizada = normalizarTexto(buscaProjeto.trim());

        return monitoramento.flatMap(({ orientando, documentos }) => {
            if (orientandoSelecionadoId !== "todos" && orientando.advisee.id !== orientandoSelecionadoId) return [];

            const documentosFiltrados = documentos.filter((documento) => {
                if (!buscaNormalizada) return true;
                return normalizarTexto(textoProjeto(documento)).includes(buscaNormalizada);
            });

            return documentosFiltrados.length > 0 ? [{ orientando, documentos: documentosFiltrados }] : [];
        });
    }, [buscaProjeto, monitoramento, orientandoSelecionadoId]);

    const totalDocumentos = useMemo(
        () => monitoramento.reduce((total, item) => total + item.documentos.length, 0),
        [monitoramento]
    );

    if (usuario?.access_level !== "ADMIN") return null;

    const filtroAtivo = orientandoSelecionadoId !== "todos" || Boolean(buscaProjeto.trim());
    const semResultados = !carregando && !erro && monitoramentoFiltrado.length === 0;
    const semDocumentos = !carregando && !erro && monitoramento.length > 0 && totalDocumentos === 0;

    return (
        <section className="grid gap-5 p-5 text-ink md:p-7">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
                <div>
                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Acompanhamento acadêmico</span>
                    <h1 className="mt-2 font-display text-3xl font-bold">Meus orientandos</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                        Consulte o andamento dos trabalhos vinculados a você. Esta área é apenas para acompanhamento.
                    </p>
                </div>
                <button
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 font-semibold transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                    type="button"
                    disabled={carregando || atualizando}
                    onClick={() => void carregarMonitoramento()}
                >
                    <RefreshCw className={carregando || atualizando ? "animate-spin" : ""} size={17} />
                    Atualizar
                </button>
            </header>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Resumo do acompanhamento">
                <Resumo valor={monitoramento.length} rotulo="Orientandos ativos" />
                <Resumo valor={totalDocumentos} rotulo="Documentos retornados" />
                <Resumo valor={monitoramentoFiltrado.reduce((total, item) => total + item.documentos.length, 0)} rotulo="Exibidos" />
            </div>

            <div className="grid gap-3 rounded-xl border border-line bg-panel p-3 lg:grid-cols-[minmax(13rem,0.45fr)_minmax(0,1fr)]">
                <label className="grid gap-1.5 text-sm font-semibold text-ink">
                    Aluno
                    <select
                        className="h-10 rounded-lg border border-line bg-input-bg px-3 text-sm font-normal outline-none transition focus:border-brand"
                        value={orientandoSelecionadoId}
                        onChange={(event) => setOrientandoSelecionadoId(event.target.value)}
                    >
                        <option value="todos">Todos os alunos</option>
                        {monitoramento.map(({ orientando }) => (
                            <option key={orientando.advisee.id} value={orientando.advisee.id}>
                                {orientando.advisee.username}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="grid gap-1.5 text-sm font-semibold text-ink">
                    Projeto
                    <span className="flex h-10 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 text-muted focus-within:border-brand">
                        <Search size={17} />
                        <input
                            aria-label="Pesquisar por projeto"
                            className="min-w-0 flex-1 bg-transparent text-sm font-normal text-ink outline-none placeholder:text-muted"
                            value={buscaProjeto}
                            placeholder="Pesquisar por nome do projeto"
                            onChange={(event) => setBuscaProjeto(event.target.value)}
                        />
                    </span>
                </label>
            </div>

            {erro && monitoramento.length === 0 ? (
                <Estado icone={<AlertTriangle size={36} />} titulo="Não foi possível carregar o acompanhamento" descricao={erro} erro />
            ) : carregando ? (
                <Estado icone={<Loader2 className="animate-spin" size={36} />} titulo="Carregando documentos" descricao="Buscando os documentos dos seus orientandos." />
            ) : monitoramento.length === 0 ? (
                <Estado icone={<UsersRound size={36} />} titulo="Nenhum orientando ativo" descricao="Quando houver vínculos ativos, os documentos enviados pelos orientandos aparecerão aqui." />
            ) : semDocumentos ? (
                <Estado icone={<BookOpenText size={36} />} titulo="Nenhum documento enviado" descricao="Seus orientandos ativos ainda não possuem documentos retornados pela plataforma." />
            ) : semResultados ? (
                <Estado
                    icone={<Search size={36} />}
                    titulo="Nenhum projeto encontrado"
                    descricao={filtroAtivo ? "Ajuste o aluno selecionado ou o termo pesquisado." : "Não há documentos para exibir."}
                />
            ) : (
                <div className="grid gap-4">
                    {monitoramentoFiltrado.map(({ orientando, documentos }) => (
                        <DocumentosPorOrientando key={orientando.advisee.id} orientando={orientando} documentos={documentos} />
                    ))}
                </div>
            )}

            {erro && monitoramento.length > 0 ? (
                <Aviso descricao={`${erro} Os dados exibidos anteriormente foram mantidos.`} />
            ) : null}
            {falhas.map((falha) => {
                const orientando = monitoramento.find((item) => item.orientando.advisee.id === falha.orientandoId)?.orientando;
                return <Aviso key={falha.orientandoId} descricao={`Não foi possível atualizar os documentos de ${orientando?.advisee.username ?? "um orientando"}: ${falha.mensagem}`} />;
            })}
        </section>
    );
}

function DocumentosPorOrientando({ orientando, documentos }: { orientando: CartaoOrientando; documentos: DocumentoOrientando[] }) {
    const projetos = useMemo(() => {
        const porProjeto = new Map<string, Map<string, DocumentoOrientando[]>>();

        for (const documento of documentos) {
            const projeto = textoProjeto(documento);
            const grupo = textoGrupo(documento);
            const grupos = porProjeto.get(projeto) ?? new Map<string, DocumentoOrientando[]>();
            grupos.set(grupo, [...(grupos.get(grupo) ?? []), documento]);
            porProjeto.set(projeto, grupos);
        }

        return Array.from(porProjeto.entries())
            .sort(([projetoA], [projetoB]) => projetoA.localeCompare(projetoB, "pt-BR"))
            .map(([projeto, grupos]) => ({
                projeto,
                grupos: Array.from(grupos.entries())
                    .sort(([grupoA], [grupoB]) => grupoA.localeCompare(grupoB, "pt-BR"))
                    .map(([grupo, itens]) => ({
                        grupo,
                        documentos: [...itens].sort((a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime()),
                    })),
            }));
    }, [documentos]);

    return (
        <article className="overflow-hidden rounded-xl border border-line bg-panel shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-panel-soft px-4 py-3">
                <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-bold">{orientando.advisee.username}</h2>
                    <p className="truncate text-xs text-muted">{orientando.advisee.email}</p>
                </div>
                <span className="rounded-full border border-line bg-panel px-2.5 py-1 text-xs font-bold text-muted">
                    {documentos.length} {documentos.length === 1 ? "documento" : "documentos"}
                </span>
            </header>

            <div className="grid gap-3 p-3">
                {projetos.map(({ projeto, grupos }) => (
                    <section key={projeto} className="overflow-hidden rounded-lg border border-line">
                        <h3 className="border-b border-line bg-input-bg px-3 py-2 font-display text-sm font-bold">{projeto}</h3>
                        <div className="divide-y divide-line">
                            {grupos.map(({ grupo, documentos: itens }) => (
                                <div key={grupo} className="grid gap-2 px-3 py-2.5">
                                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{grupo}</span>
                                    {itens.map((documento) => {
                                        const status = statusExibido(documento);

                                        return (
                                            <div key={documento.id} className="grid gap-2 text-sm md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                                                <div className="min-w-0">
                                                    <strong className="block truncate font-semibold text-ink">{documento.name}</strong>
                                                    <span className="text-xs text-muted">{documento.tipo_documento?.trim() || "Tipo não informado"} · Atualizado em {formatarData(documento.updated_at ?? documento.created_at)}</span>
                                                </div>
                                                <span className={`w-fit rounded-full border px-2 py-1 text-xs font-bold ${classeStatus(status)}`}>
                                                    {rotuloStatus(status)}
                                                </span>
                                                {documento.is_archived ? (
                                                    <span className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-muted"><Archive size={14} /> Arquivado</span>
                                                ) : (
                                                    <span className="text-xs font-semibold text-brand">Ativo</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </article>
    );
}

function Resumo({ valor, rotulo }: { valor: number; rotulo: string }) {
    return (
        <div className="rounded-lg border border-line bg-panel px-4 py-3">
            <strong className="font-display text-2xl">{valor}</strong>
            <span className="mt-0.5 block text-xs font-semibold text-muted">{rotulo}</span>
        </div>
    );
}

function Aviso({ descricao }: { descricao: string }) {
    return (
        <div className="flex items-start gap-2 rounded-lg border border-laranja/40 bg-laranja/10 px-3 py-2.5 text-sm text-ink">
            <AlertTriangle className="mt-0.5 shrink-0 text-laranja" size={17} />
            <span>{descricao}</span>
        </div>
    );
}

function Estado({ icone, titulo, descricao, erro = false }: { icone: ReactNode; titulo: string; descricao: string; erro?: boolean }) {
    return (
        <div className={`grid min-h-64 place-items-center rounded-xl border p-6 text-center ${erro ? "border-laranja/40 bg-laranja/10" : "border-line bg-panel"}`}>
            <div className="grid max-w-md justify-items-center gap-3">
                <span className={erro ? "text-laranja" : "text-brand"}>{icone}</span>
                <h2 className="font-display text-xl font-bold">{titulo}</h2>
                <p className="text-sm leading-6 text-muted">{descricao}</p>
            </div>
        </div>
    );
}
