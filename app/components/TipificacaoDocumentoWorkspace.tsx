"use client";

import BotaoComTitulo from "@/app/components/BotaoComTitulo";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import {
    AlertTriangle,
    BookOpen,
    Check,
    ChevronRight,
    CircleCheck,
    CircleX,
    FileText,
    FileUp,
    GitBranch,
    Layers3,
    Loader2,
    Pencil,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";

import MarkdownAnalise from "@/app/components/MarkdownAnalise";
import {
    confirmarItemSugestao,
    criarSessaoSugestao,
    descartarItemSugestao,
    descartarPendentesSessao,
    listarSessoesSugestao,
    obterSessaoSugestao,
} from "@/app/services/sugestaoTipificacao";
import type {
    ItemSugestaoTipificacao,
    SessaoSugestaoDetalhe,
    SessaoSugestaoResumo,
    StatusItemSugestao,
    StatusSessaoSugestao,
    TipoItemSugestao,
} from "@/app/types/SugestaoTipificacao";
import type { Tipificacao } from "@/app/types/Tipificacao";

type TipificacaoDocumentoWorkspaceProps = {
    tipificacoes: Tipificacao[];
    aoFechar: () => void;
    aoArvoreAlterada: () => Promise<unknown> | unknown;
    modoInicial?: ModoDocumento;
    tipificacaoAlvoInicial?: string;
};

type ModoDocumento = "create" | "enrich";
type AbaSessoes = "pending" | "completed";
type MutacaoAtiva = { tipo: "confirmar" | "descartar" | "descartar-todos"; itemId?: string } | null;
type ConfirmacaoDescarte = { tipo: "item"; item: ItemSugestaoTipificacao } | { tipo: "sessao" } | null;

const rotuloStatusSessao: Record<StatusSessaoSugestao, string> = {
    processing: "Processando",
    ready: "Em revisão",
    failed: "Falhou",
    completed: "Concluída",
};

const rotuloTipoItem: Record<TipoItemSugestao, string> = {
    source: "Fonte",
    typification: "Tipificação",
    taxonomy: "Taxonomia",
    branch: "Ramo",
};

const rotuloStatusItem: Record<StatusItemSugestao, string> = {
    pending: "Pendente",
    confirmed: "Confirmado",
    discarded: "Descartado",
};

const iconeTipoItem = {
    source: BookOpen,
    typification: Layers3,
    taxonomy: ShieldCheck,
    branch: GitBranch,
};

function formatarData(data: string) {
    const valor = new Date(data);
    return Number.isNaN(valor.getTime()) ? data : valor.toLocaleString("pt-BR");
}

function arquivoParecePdf(arquivo: File) {
    return arquivo.type === "application/pdf" || (!arquivo.type && arquivo.name.toLowerCase().endsWith(".pdf"));
}

function classesStatusSessao(status: StatusSessaoSugestao) {
    if (status === "ready") return "border-brand/30 bg-brand/10 text-brand-strong dark:text-brand";
    if (status === "completed") return "border-emerald-600/35 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400";
    if (status === "failed") return "border-accent/35 bg-accent/10 text-accent";
    return "border-amber-600/35 bg-amber-500/10 text-amber-700 dark:text-amber-400";
}

function classesStatusItem(status: StatusItemSugestao) {
    if (status === "confirmed") return "border-emerald-600/35 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400";
    if (status === "discarded") return "border-accent/30 bg-accent/8 text-accent";
    return "border-line bg-input-bg text-muted";
}

function resumoDaSessao(detalhe: SessaoSugestaoDetalhe): SessaoSugestaoResumo {
    return {
        id: detalhe.id,
        mode: detalhe.mode,
        status: detalhe.status,
        target_typification_id: detalhe.target_typification_id,
        target_typification_name: detalhe.target_typification_name,
        original_filename: detalhe.original_filename,
        file_path: detalhe.file_path,
        page_count: detalhe.page_count,
        error_message: detalhe.error_message,
        generation_model: detalhe.generation_model,
        created_by: detalhe.created_by,
        created_at: detalhe.created_at,
        processing_started_at: detalhe.processing_started_at,
        processing_finished_at: detalhe.processing_finished_at,
    };
}

function ordenarItens(itens: ItemSugestaoTipificacao[]) {
    return [...itens].sort((a, b) => a.position - b.position || a.proposed_title.localeCompare(b.proposed_title, "pt-BR"));
}

export default function TipificacaoDocumentoWorkspace({
    tipificacoes,
    aoFechar,
    aoArvoreAlterada,
    modoInicial = "create",
    tipificacaoAlvoInicial = "",
}: Readonly<TipificacaoDocumentoWorkspaceProps>) {
    const [modo, setModo] = useState<ModoDocumento>(modoInicial);
    const [tipificacaoAlvo, setTipificacaoAlvo] = useState(tipificacaoAlvoInicial);
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [erroEnvio, setErroEnvio] = useState("");
    const [enviando, setEnviando] = useState(false);
    const arquivoRef = useRef<HTMLInputElement>(null);

    const [sessoes, setSessoes] = useState<SessaoSugestaoResumo[]>([]);
    const [carregandoSessoes, setCarregandoSessoes] = useState(true);
    const [erroSessoes, setErroSessoes] = useState("");
    const [sessaoSelecionadaId, setSessaoSelecionadaId] = useState<string | null>(null);
    const [abaSessoes, setAbaSessoes] = useState<AbaSessoes>("pending");
    const [detalhe, setDetalhe] = useState<SessaoSugestaoDetalhe | null>(null);
    const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
    const [erroDetalhe, setErroDetalhe] = useState("");
    const sequenciaDetalhe = useRef(0);

    const [itemEmEdicao, setItemEmEdicao] = useState<ItemSugestaoTipificacao | null>(null);
    const [tituloEdicao, setTituloEdicao] = useState("");
    const [descricaoEdicao, setDescricaoEdicao] = useState("");
    const [erroEdicao, setErroEdicao] = useState("");
    const [mutacaoAtiva, setMutacaoAtiva] = useState<MutacaoAtiva>(null);
    const [confirmacaoDescarte, setConfirmacaoDescarte] = useState<ConfirmacaoDescarte>(null);

    const carregarSessoes = useCallback(async (mostrarCarregamento = true) => {
        if (mostrarCarregamento) setCarregandoSessoes(true);
        setErroSessoes("");
        const [resultado, err] = await listarSessoesSugestao();
        if (err) setErroSessoes(err.message);
        else setSessoes(resultado);
        if (mostrarCarregamento) setCarregandoSessoes(false);
        return err;
    }, []);

    const carregarDetalhe = useCallback(async (sessionId: string, mostrarCarregamento = true) => {
        const sequencia = ++sequenciaDetalhe.current;
        if (mostrarCarregamento) setCarregandoDetalhe(true);
        setErroDetalhe("");
        const [resultado, err] = await obterSessaoSugestao(sessionId);
        if (sequencia !== sequenciaDetalhe.current) return err;

        if (err || !resultado) {
            setErroDetalhe(err?.message ?? "A API não retornou os detalhes desta geração.");
        } else {
            setDetalhe(resultado);
            setAbaSessoes(resultado.status === "completed" ? "completed" : "pending");
            setSessoes((atuais) => {
                const resumo = resumoDaSessao(resultado);
                return atuais.some((sessao) => sessao.id === resumo.id)
                    ? atuais.map((sessao) => sessao.id === resumo.id ? resumo : sessao)
                    : [resumo, ...atuais];
            });
        }
        if (mostrarCarregamento) setCarregandoDetalhe(false);
        return err;
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => void carregarSessoes(), 0);
        return () => window.clearTimeout(timer);
    }, [carregarSessoes]);

    useEffect(() => {
        if (!sessaoSelecionadaId) return;
        if (detalhe?.id === sessaoSelecionadaId) return;
        const timer = window.setTimeout(() => void carregarDetalhe(sessaoSelecionadaId), 0);
        return () => window.clearTimeout(timer);
    }, [carregarDetalhe, detalhe?.id, sessaoSelecionadaId]);

    useEffect(() => {
        if (!detalhe || detalhe.id !== sessaoSelecionadaId || detalhe.status !== "processing") return;
        const timer = window.setTimeout(() => void carregarDetalhe(detalhe.id, false), 3000);
        return () => window.clearTimeout(timer);
    }, [carregarDetalhe, detalhe, sessaoSelecionadaId]);

    useEffect(() => {
        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key !== "Escape" || enviando || mutacaoAtiva) return;
            if (confirmacaoDescarte) setConfirmacaoDescarte(null);
            else if (itemEmEdicao) setItemEmEdicao(null);
            else aoFechar();
        }
        window.addEventListener("keydown", fecharComEscape);
        return () => window.removeEventListener("keydown", fecharComEscape);
    }, [aoFechar, confirmacaoDescarte, enviando, itemEmEdicao, mutacaoAtiva]);

    const itens = useMemo(() => detalhe?.items ?? [], [detalhe]);
    const itensPorId = useMemo(() => new Map(itens.map((item) => [item.id, item])), [itens]);
    const filhosPorPai = useMemo(() => {
        const mapa = new Map<string, ItemSugestaoTipificacao[]>();
        for (const item of itens) {
            if (!item.parent_item_id) continue;
            const filhos = mapa.get(item.parent_item_id) ?? [];
            filhos.push(item);
            mapa.set(item.parent_item_id, filhos);
        }
        for (const [pai, filhos] of mapa) mapa.set(pai, ordenarItens(filhos));
        return mapa;
    }, [itens]);
    const itensRaiz = useMemo(() => ordenarItens(itens.filter((item) => !item.parent_item_id)), [itens]);
    const pendentes = itens.filter((item) => item.status === "pending").length;
    const sessoesPendentes = useMemo(() => sessoes.filter((sessao) => sessao.status !== "completed"), [sessoes]);
    const sessoesConcluidas = useMemo(() => sessoes.filter((sessao) => sessao.status === "completed"), [sessoes]);
    const sessoesVisiveis = abaSessoes === "pending" ? sessoesPendentes : sessoesConcluidas;
    const idTabsSessoes = useId().replaceAll(":", "");

    function selecionarSessao(sessionId: string) {
        sequenciaDetalhe.current += 1;
        const sessao = sessoes.find((item) => item.id === sessionId);
        setAbaSessoes(sessao?.status === "completed" ? "completed" : "pending");
        setSessaoSelecionadaId(sessionId);
        setDetalhe((atual) => atual?.id === sessionId ? atual : null);
        setErroDetalhe("");
        setItemEmEdicao(null);
        setConfirmacaoDescarte(null);
    }

    async function enviarDocumento(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (enviando) return;
        if (!arquivo) {
            setErroEnvio("Selecione um documento PDF.");
            return;
        }
        if (!arquivoParecePdf(arquivo)) {
            setErroEnvio("O documento selecionado precisa ser um arquivo PDF.");
            return;
        }
        if (modo === "enrich" && !tipificacaoAlvo) {
            setErroEnvio("Selecione a tipificação que será enriquecida.");
            return;
        }

        setEnviando(true);
        setErroEnvio("");
        const [sessao, err] = await criarSessaoSugestao({
            arquivo,
            tipificacaoId: modo === "enrich" ? tipificacaoAlvo : undefined,
        });
        setEnviando(false);
        if (err || !sessao) {
            setErroEnvio(err?.message ?? "A API não confirmou o início da geração.");
            return;
        }

        setArquivo(null);
        if (arquivoRef.current) arquivoRef.current.value = "";
        setSessaoSelecionadaId(sessao.id);
        setDetalhe(sessao);
        setSessoes((atuais) => [resumoDaSessao(sessao), ...atuais.filter((item) => item.id !== sessao.id)]);
        toast.success("Documento enviado. A geração da árvore foi iniciada.");
        void carregarSessoes(false);
    }

    function abrirEdicao(item: ItemSugestaoTipificacao) {
        setItemEmEdicao(item);
        setTituloEdicao(item.proposed_title);
        setDescricaoEdicao(item.proposed_description ?? "");
        setErroEdicao("");
    }

    async function recarregarAposMutacao(recarregarArvore: boolean) {
        if (!sessaoSelecionadaId) return;
        await carregarDetalhe(sessaoSelecionadaId, false);
        await carregarSessoes(false);
        if (recarregarArvore) await aoArvoreAlterada();
    }

    async function confirmar(item: ItemSugestaoTipificacao, edicao?: { title: string; description: string }) {
        if (!detalhe || mutacaoAtiva) return;
        const pai = item.parent_item_id ? itensPorId.get(item.parent_item_id) : null;
        if (pai && pai.status !== "confirmed") {
            toast.error("Confirme o item pai antes de aplicar esta sugestão.");
            return;
        }
        if (edicao && !edicao.title.trim()) {
            setErroEdicao("Informe o título que será aplicado.");
            return;
        }

        setMutacaoAtiva({ tipo: "confirmar", itemId: item.id });
        const [, err] = await confirmarItemSugestao({
            sessionId: detalhe.id,
            itemId: item.id,
            edicao: edicao ? { title: edicao.title.trim(), description: edicao.description } : undefined,
        });
        if (err) {
            toast.error(err.message);
            await recarregarAposMutacao(false);
            setMutacaoAtiva(null);
            return;
        }

        setItemEmEdicao(null);
        toast.success("Sugestão confirmada e aplicada à árvore real.");
        await recarregarAposMutacao(true);
        setMutacaoAtiva(null);
    }

    async function executarDescarte() {
        if (!detalhe || !confirmacaoDescarte || mutacaoAtiva) return;
        const confirmacao = confirmacaoDescarte;
        setConfirmacaoDescarte(null);
        setMutacaoAtiva(confirmacao.tipo === "item"
            ? { tipo: "descartar", itemId: confirmacao.item.id }
            : { tipo: "descartar-todos" });

        const [, err] = confirmacao.tipo === "item"
            ? await descartarItemSugestao({ sessionId: detalhe.id, itemId: confirmacao.item.id })
            : await descartarPendentesSessao(detalhe.id);
        if (err) toast.error(err.message);
        else toast.success(confirmacao.tipo === "item" ? "Sugestão descartada." : "Sugestões pendentes descartadas.");
        await recarregarAposMutacao(false);
        setMutacaoAtiva(null);
    }

    return (
        <div className="fixed inset-0 z-[70] grid bg-black/60 p-0 backdrop-blur-sm md:p-4" role="presentation">
            <section
                aria-labelledby="titulo-geracao-documento"
                aria-modal="true"
                className="m-auto grid h-full max-h-none w-full max-w-[96rem] grid-rows-[auto_minmax(0,1fr)] overflow-hidden border border-line bg-background text-ink shadow-2xl md:max-h-[94vh] md:rounded-2xl"
                role="dialog"
            >
                <header className="flex items-start justify-between gap-4 border-b border-line bg-panel px-5 py-4">
                    <div className="min-w-0">
                        <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Criação assistida</span>
                        <h2 className="mt-1 font-display text-2xl font-bold" id="titulo-geracao-documento">Gerar tipificação a partir de documento</h2>
                        <p className="mt-1 text-sm text-muted">Envie um PDF, revise cada sugestão e escolha explicitamente o que entra na árvore real.</p>
                    </div>
                    <BotaoComTitulo
                        aria-label="Fechar geração por documento"
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg transition hover:border-brand hover:bg-subtle-hover"
                        disabled={enviando || Boolean(mutacaoAtiva)}
                        onClick={aoFechar}
                        type="button"
                    >
                        <X size={19} />
                    </BotaoComTitulo>
                </header>

                <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[22rem_minmax(0,1fr)]">
                    <aside className="min-h-0 overflow-y-auto border-b border-line bg-panel p-4 lg:border-b-0 lg:border-r">
                        <form className="grid gap-4 rounded-xl border border-line bg-input-bg p-4" onSubmit={(evento) => void enviarDocumento(evento)}>
                            <div>
                                <h3 className="font-display text-base font-bold">Novo documento</h3>
                                <p className="mt-1 text-xs leading-5 text-muted">O envio gera sugestões; nada é aplicado automaticamente.</p>
                            </div>
                            <fieldset className="grid gap-2">
                                <legend className="text-sm font-bold">Objetivo</legend>
                                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-line bg-panel p-3">
                                    <input checked={modo === "create"} disabled={enviando} name="modo-documento" onChange={() => setModo("create")} type="radio" />
                                    <span><strong className="block text-sm">Criar nova tipificação</strong><small className="text-muted">O backend propõe uma árvore do zero.</small></span>
                                </label>
                                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-line bg-panel p-3">
                                    <input checked={modo === "enrich"} disabled={enviando} name="modo-documento" onChange={() => setModo("enrich")} type="radio" />
                                    <span><strong className="block text-sm">Enriquecer uma existente</strong><small className="text-muted">As sugestões entram sob uma tipificação escolhida.</small></span>
                                </label>
                            </fieldset>
                            {modo === "enrich" ? (
                                <label className="grid gap-1.5 text-sm font-bold">
                                    Tipificação alvo
                                    <select
                                        className="h-11 min-w-0 rounded-lg border border-line bg-panel px-3 font-normal outline-none focus:border-brand"
                                        disabled={enviando}
                                        onChange={(evento) => setTipificacaoAlvo(evento.target.value)}
                                        value={tipificacaoAlvo}
                                    >
                                        <option value="">Selecione uma tipificação</option>
                                        {tipificacoes.map((tipificacao) => <option key={tipificacao.id} value={tipificacao.id}>{tipificacao.name}</option>)}
                                    </select>
                                </label>
                            ) : null}
                            <label className="grid gap-1.5 text-sm font-bold">
                                Documento normativo (PDF)
                                <input
                                    ref={arquivoRef}
                                    accept="application/pdf,.pdf"
                                    className="min-w-0 rounded-lg border border-line bg-panel p-2 text-xs font-normal file:mr-2 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:font-bold file:text-white"
                                    disabled={enviando}
                                    onChange={(evento) => {
                                        setArquivo(evento.target.files?.[0] ?? null);
                                        setErroEnvio("");
                                    }}
                                    type="file"
                                />
                            </label>
                            {erroEnvio ? <p className="rounded-lg border border-accent/35 bg-accent/10 p-2 text-xs font-semibold" role="alert">{erroEnvio}</p> : null}
                            <BotaoComTitulo className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-display font-bold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-55 dark:text-preto" disabled={enviando} type="submit">
                                {enviando ? <Loader2 className="animate-spin" size={18} /> : <FileUp size={18} />}
                                {enviando ? "Enviando…" : "Enviar e gerar sugestões"}
                            </BotaoComTitulo>
                        </form>

                        <div className="mt-5 flex items-center justify-between gap-3">
                            <h3 className="font-display font-bold">Gerações anteriores</h3>
                            <BotaoComTitulo aria-label="Atualizar gerações" className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-input-bg hover:border-brand disabled:opacity-50" disabled={carregandoSessoes} onClick={() => void carregarSessoes()} type="button">
                                <RefreshCw className={carregandoSessoes ? "animate-spin" : ""} size={16} />
                            </BotaoComTitulo>
                        </div>
                        <div className="mt-3 grid gap-3">
                            {carregandoSessoes ? <EstadoCompacto texto="Carregando gerações…" carregando /> : null}
                            {!carregandoSessoes && erroSessoes ? <EstadoCompacto texto={erroSessoes} erro /> : null}
                            {!carregandoSessoes && !erroSessoes ? (
                                <>
                                    <div aria-label="Filtrar gerações anteriores" className="grid grid-cols-2 rounded-lg border border-line bg-input-bg p-1" role="tablist">
                                        {(["pending", "completed"] as const).map((aba) => {
                                            const selecionada = abaSessoes === aba;
                                            const quantidade = aba === "pending" ? sessoesPendentes.length : sessoesConcluidas.length;
                                            const rotulo = aba === "pending" ? "Pendentes" : "Concluídas";
                                            return (
                                                <BotaoComTitulo
                                                    aria-controls={`painel-sessoes-${idTabsSessoes}-${aba}`}
                                                    aria-selected={selecionada}
                                                    className={`rounded-md px-2 py-2 text-xs font-bold transition ${selecionada ? "bg-brand text-white shadow-sm dark:text-preto" : "text-muted hover:bg-subtle-hover hover:text-ink"}`}
                                                    id={`tab-sessoes-${idTabsSessoes}-${aba}`}
                                                    key={aba}
                                                    onClick={() => setAbaSessoes(aba)}
                                                    role="tab"
                                                    type="button"
                                                >
                                                    {rotulo} ({quantidade})
                                                </BotaoComTitulo>
                                            );
                                        })}
                                    </div>
                                    <div
                                        aria-labelledby={`tab-sessoes-${idTabsSessoes}-${abaSessoes}`}
                                        className="grid gap-2"
                                        id={`painel-sessoes-${idTabsSessoes}-${abaSessoes}`}
                                        role="tabpanel"
                                        tabIndex={0}
                                    >
                                        {sessoes.length === 0 ? <EstadoCompacto texto="Nenhuma geração encontrada." /> : null}
                                        {sessoes.length > 0 && sessoesVisiveis.length === 0 ? <EstadoCompacto texto={abaSessoes === "pending" ? "Nenhuma geração pendente." : "Nenhuma geração concluída."} /> : null}
                                        {sessoesVisiveis.map((sessao) => (
                                            <BotaoComTitulo
                                                className={`grid min-w-0 gap-2 rounded-lg border p-3 text-left transition ${sessaoSelecionadaId === sessao.id ? "border-brand bg-brand/8" : "border-line bg-input-bg hover:border-brand/55"}`}
                                                key={sessao.id}
                                                onClick={() => selecionarSessao(sessao.id)}
                                                type="button"
                                            >
                                                <span className="flex min-w-0 items-center justify-between gap-2">
                                                    <strong className="truncate text-sm" title={sessao.original_filename}>{sessao.original_filename}</strong>
                                                    <ChevronRight className="shrink-0 text-muted" size={15} />
                                                </span>
                                                <span className="flex flex-wrap items-center gap-2">
                                                    <StatusSessao status={sessao.status} />
                                                    <small className="text-muted">{sessao.mode === "enrich" ? "Enriquecimento" : "Nova árvore"}</small>
                                                </span>
                                                {sessao.mode === "enrich" ? <small className="truncate text-muted" title={sessao.target_typification_name ?? sessao.target_typification_id ?? ""}>Alvo: {sessao.target_typification_name ?? sessao.target_typification_id ?? "indisponível"}</small> : null}
                                                <small className="text-muted">{formatarData(sessao.created_at)}</small>
                                            </BotaoComTitulo>
                                        ))}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </aside>

                    <main className="min-h-0 overflow-y-auto p-4 md:p-6">
                        {!sessaoSelecionadaId ? (
                            <EstadoPrincipal icone={<Sparkles size={34} />} titulo="Selecione ou crie uma geração" descricao="As sugestões aparecem aqui para revisão antes de modificar a árvore." />
                        ) : carregandoDetalhe ? (
                            <EstadoPrincipal icone={<Loader2 className="animate-spin" size={34} />} titulo="Carregando sugestões" descricao="Buscando o estado mais recente no backend." />
                        ) : erroDetalhe ? (
                            <EstadoPrincipal icone={<AlertTriangle size={34} />} titulo="Não foi possível carregar esta geração" descricao={erroDetalhe} acao={() => sessaoSelecionadaId && void carregarDetalhe(sessaoSelecionadaId)} />
                        ) : detalhe ? (
                            <DetalheSessao
                                detalhe={detalhe}
                                filhosPorPai={filhosPorPai}
                                itensPorId={itensPorId}
                                itensRaiz={itensRaiz}
                                mutacaoAtiva={mutacaoAtiva}
                                pendentes={pendentes}
                                aoConfirmar={(item) => void confirmar(item)}
                                aoDescartar={(item) => setConfirmacaoDescarte({ tipo: "item", item })}
                                aoDescartarTodos={() => setConfirmacaoDescarte({ tipo: "sessao" })}
                                aoEditar={abrirEdicao}
                            />
                        ) : null}
                    </main>
                </div>
            </section>

            {itemEmEdicao ? (
                <EditarSugestaoDialog
                    descricao={descricaoEdicao}
                    erro={erroEdicao}
                    item={itemEmEdicao}
                    processando={mutacaoAtiva?.tipo === "confirmar" && mutacaoAtiva.itemId === itemEmEdicao.id}
                    titulo={tituloEdicao}
                    aoAlterarDescricao={setDescricaoEdicao}
                    aoAlterarTitulo={setTituloEdicao}
                    aoConfirmar={() => void confirmar(itemEmEdicao, { title: tituloEdicao, description: descricaoEdicao })}
                    aoFechar={() => setItemEmEdicao(null)}
                />
            ) : null}

            {confirmacaoDescarte ? (
                <ConfirmarDescarteDialog
                    todos={confirmacaoDescarte.tipo === "sessao"}
                    titulo={confirmacaoDescarte.tipo === "item" ? confirmacaoDescarte.item.proposed_title : undefined}
                    aoConfirmar={() => void executarDescarte()}
                    aoFechar={() => setConfirmacaoDescarte(null)}
                />
            ) : null}
        </div>
    );
}

function StatusSessao({ status }: { status: StatusSessaoSugestao }) {
    return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${classesStatusSessao(status)}`}>{rotuloStatusSessao[status]}</span>;
}

function EstadoCompacto({ texto, carregando = false, erro = false }: { texto: string; carregando?: boolean; erro?: boolean }) {
    return <div className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${erro ? "border-accent/35 bg-accent/10" : "border-line bg-input-bg text-muted"}`}>{carregando ? <Loader2 className="animate-spin" size={15} /> : null}{texto}</div>;
}

function EstadoPrincipal({ icone, titulo, descricao, acao }: { icone: React.ReactNode; titulo: string; descricao: string; acao?: () => void }) {
    return (
        <div className="grid min-h-[24rem] place-items-center rounded-xl border border-dashed border-line bg-panel p-8 text-center">
            <div className="grid max-w-lg justify-items-center gap-3 text-muted">
                <span className="text-accent">{icone}</span>
                <h3 className="font-display text-xl font-bold text-ink">{titulo}</h3>
                <p className="text-sm leading-6">{descricao}</p>
                {acao ? <BotaoComTitulo className="mt-2 rounded-lg bg-brand px-4 py-2 font-bold text-white dark:text-preto" onClick={acao} type="button">Tentar novamente</BotaoComTitulo> : null}
            </div>
        </div>
    );
}

function DetalheSessao({
    detalhe,
    filhosPorPai,
    itensPorId,
    itensRaiz,
    mutacaoAtiva,
    pendentes,
    aoConfirmar,
    aoDescartar,
    aoDescartarTodos,
    aoEditar,
}: {
    detalhe: SessaoSugestaoDetalhe;
    filhosPorPai: Map<string, ItemSugestaoTipificacao[]>;
    itensPorId: Map<string, ItemSugestaoTipificacao>;
    itensRaiz: ItemSugestaoTipificacao[];
    mutacaoAtiva: MutacaoAtiva;
    pendentes: number;
    aoConfirmar: (item: ItemSugestaoTipificacao) => void;
    aoDescartar: (item: ItemSugestaoTipificacao) => void;
    aoDescartarTodos: () => void;
    aoEditar: (item: ItemSugestaoTipificacao) => void;
}) {
    return (
        <div className="grid gap-5">
            <header className="rounded-xl border border-line bg-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                        <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Documento analisado</span>
                        <h3 className="mt-2 break-words font-display text-2xl font-bold">{detalhe.original_filename}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                            <StatusSessao status={detalhe.status} />
                            <span>{detalhe.mode === "enrich" ? "Enriquecimento" : "Nova árvore"}</span>
                            {detalhe.page_count != null ? <span>• {detalhe.page_count} página(s)</span> : null}
                            {detalhe.generation_model ? <span>• Modelo {detalhe.generation_model}</span> : null}
                        </div>
                        {detalhe.mode === "enrich" ? <p className="mt-2 text-sm text-muted">Alvo: <strong className="text-ink">{detalhe.target_typification_name ?? detalhe.target_typification_id ?? "indisponível"}</strong></p> : null}
                    </div>
                    {detalhe.status === "ready" && pendentes > 0 ? (
                        <BotaoComTitulo className="inline-flex h-10 items-center gap-2 rounded-lg border border-accent/40 bg-accent/8 px-3 text-sm font-bold text-accent transition hover:bg-accent/15 disabled:opacity-50" disabled={Boolean(mutacaoAtiva)} onClick={aoDescartarTodos} type="button"><Trash2 size={16} />Descartar {pendentes} pendente(s)</BotaoComTitulo>
                    ) : null}
                </div>
                {detalhe.status === "processing" ? <p className="mt-4 flex items-center gap-2 rounded-lg border border-amber-600/35 bg-amber-500/10 p-3 text-sm"><Loader2 className="animate-spin" size={17} />O backend está processando o documento. Você pode fechar esta janela e voltar depois.</p> : null}
                {detalhe.status === "failed" ? <p className="mt-4 rounded-lg border border-accent/35 bg-accent/10 p-3 text-sm" role="alert"><strong>Falha na geração:</strong> {detalhe.error_message || "O backend não informou o motivo."}</p> : null}
                {detalhe.status === "ready" && pendentes > 0 ? <p className="mt-4 rounded-lg border border-brand/30 bg-brand/8 p-3 text-sm leading-6"><strong>Atenção:</strong> cada confirmação modifica imediatamente a árvore real. Fechar ou abandonar a revisão não desfaz itens já confirmados.</p> : null}
            </header>

            {detalhe.status !== "processing" && detalhe.status !== "failed" && itensRaiz.length === 0 ? (
                <EstadoPrincipal icone={<FileText size={32} />} titulo="Nenhuma sugestão disponível" descricao="Esta sessão não possui itens de árvore para apresentar." />
            ) : null}

            {itensRaiz.length > 0 ? (
                <section className="grid gap-3" aria-label="Sugestões da árvore">
                    {itensRaiz.map((item) => (
                        <ItemSugestao
                            filhosPorPai={filhosPorPai}
                            item={item}
                            itensPorId={itensPorId}
                            key={item.id}
                            mutacaoAtiva={mutacaoAtiva}
                            nivel={0}
                            aoConfirmar={aoConfirmar}
                            aoDescartar={aoDescartar}
                            aoEditar={aoEditar}
                        />
                    ))}
                </section>
            ) : null}

            {(detalhe.excluded_rules?.length ?? 0) > 0 ? (
                <details className="rounded-xl border border-dashed border-line bg-panel p-4">
                    <summary className="cursor-pointer font-display font-bold">Fora do escopo da árvore ({detalhe.excluded_rules?.length})</summary>
                    <p className="mt-2 text-sm text-muted">Regras identificadas como formatação ou orientação textual. Elas não podem ser confirmadas como itens da árvore.</p>
                    <div className="mt-4 grid gap-3">
                        {detalhe.excluded_rules?.map((regra, indice) => (
                            <article className="rounded-lg border border-line bg-input-bg p-3" key={`${regra.title}-${indice}`}>
                                <h4 className="font-bold">{regra.title}</h4>
                                <MarkdownAnalise className="mt-2 text-sm text-muted" compacto>{regra.quote}</MarkdownAnalise>
                                {regra.pages?.length ? <p className="mt-2 text-xs font-semibold text-muted">Página(s): {regra.pages.join(", ")}</p> : null}
                            </article>
                        ))}
                    </div>
                </details>
            ) : null}
        </div>
    );
}

function ItemSugestao({
    item,
    filhosPorPai,
    itensPorId,
    mutacaoAtiva,
    nivel,
    aoConfirmar,
    aoDescartar,
    aoEditar,
}: {
    item: ItemSugestaoTipificacao;
    filhosPorPai: Map<string, ItemSugestaoTipificacao[]>;
    itensPorId: Map<string, ItemSugestaoTipificacao>;
    mutacaoAtiva: MutacaoAtiva;
    nivel: number;
    aoConfirmar: (item: ItemSugestaoTipificacao) => void;
    aoDescartar: (item: ItemSugestaoTipificacao) => void;
    aoEditar: (item: ItemSugestaoTipificacao) => void;
}) {
    const Icone = iconeTipoItem[item.kind];
    const filhos = filhosPorPai.get(item.id) ?? [];
    const pai = item.parent_item_id ? itensPorId.get(item.parent_item_id) : null;
    const paiBloqueia = Boolean(pai && pai.status !== "confirmed");
    const processando = mutacaoAtiva?.itemId === item.id;
    const snapshot = Object.entries(item.target_snapshot ?? {}).filter(([, valor]) => ["string", "number", "boolean"].includes(typeof valor));

    return (
        <div className={nivel > 0 ? "ml-3 border-l-2 border-line pl-3 md:ml-6 md:pl-5" : ""}>
            <article className={`rounded-xl border bg-panel p-4 shadow-[0_16px_38px_-30px_var(--chrome-shadow)] ${item.status === "discarded" ? "border-line opacity-65" : item.status === "confirmed" ? "border-emerald-600/35" : "border-line"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-input-bg text-accent"><Icone size={19} /></span>
                        <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-line bg-input-bg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">{rotuloTipoItem[item.kind]}</span>
                                <span className="rounded-full border border-line bg-input-bg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">{item.operation === "create" ? "Criar" : "Atualizar"}</span>
                                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${classesStatusItem(item.status)}`}>{rotuloStatusItem[item.status]}</span>
                            </div>
                            <h4 className="mt-2 break-words font-display text-lg font-bold">{item.final_title || item.proposed_title}</h4>
                            {item.parent_entity_title ? <p className="mt-1 text-xs text-muted">Sob item existente: {item.parent_entity_title}</p> : null}
                        </div>
                    </div>
                    {item.status === "pending" ? (
                        <div className="flex flex-wrap gap-2">
                            <BotaoComTitulo className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-input-bg px-3 text-xs font-bold hover:border-brand disabled:cursor-not-allowed disabled:opacity-45" disabled={Boolean(mutacaoAtiva) || paiBloqueia} onClick={() => aoEditar(item)} type="button"><Pencil size={15} />Editar</BotaoComTitulo>
                            <BotaoComTitulo className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-bold text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-45 dark:text-preto" disabled={Boolean(mutacaoAtiva) || paiBloqueia} onClick={() => aoConfirmar(item)} type="button">{processando && mutacaoAtiva?.tipo === "confirmar" ? <Loader2 className="animate-spin" size={15} /> : <Check size={15} />}Confirmar e aplicar</BotaoComTitulo>
                            <BotaoComTitulo aria-label={`Descartar ${item.proposed_title}`} className="inline-flex size-9 items-center justify-center rounded-lg border border-accent/35 bg-accent/8 text-accent hover:bg-accent/15 disabled:opacity-45" disabled={Boolean(mutacaoAtiva)} onClick={() => aoDescartar(item)} type="button"><Trash2 size={15} /></BotaoComTitulo>
                        </div>
                    ) : null}
                </div>

                {paiBloqueia ? <p className="mt-3 rounded-lg border border-amber-600/35 bg-amber-500/10 p-2 text-xs font-semibold">Confirme o item pai antes de aplicar esta sugestão.</p> : null}
                {item.proposed_description ? <div className="mt-3"><span className="text-xs font-bold uppercase tracking-wide text-muted">Descrição proposta</span><MarkdownAnalise className="mt-1 text-sm text-muted" compacto>{item.final_description || item.proposed_description}</MarkdownAnalise></div> : null}
                {item.rationale ? <div className="mt-3"><span className="text-xs font-bold uppercase tracking-wide text-muted">Justificativa</span><MarkdownAnalise className="mt-1 text-sm text-muted" compacto>{item.rationale}</MarkdownAnalise></div> : null}
                {item.similarity_note || item.similar_to_id ? <p className="mt-3 rounded-lg border border-amber-600/35 bg-amber-500/10 p-2 text-xs"><strong>Possível correspondência:</strong> {item.similarity_note || item.similar_to_id}</p> : null}
                {snapshot.length ? (
                    <details className="mt-3 rounded-lg border border-line bg-input-bg p-3 text-xs">
                        <summary className="cursor-pointer font-bold">Valores atuais da entidade</summary>
                        <dl className="mt-2 grid gap-2">{snapshot.map(([chave, valor]) => <div className="grid gap-0.5" key={chave}><dt className="font-semibold text-muted">{chave}</dt><dd className="break-words">{String(valor)}</dd></div>)}</dl>
                    </details>
                ) : null}
                {(item.evidence?.length ?? 0) > 0 ? (
                    <details className="mt-3 rounded-lg border border-line bg-input-bg p-3">
                        <summary className="cursor-pointer text-xs font-bold">Evidências do PDF ({item.evidence?.length})</summary>
                        <div className="mt-3 grid gap-3">{item.evidence?.map((evidencia, indice) => <blockquote className="border-l-2 border-accent pl-3 text-sm" key={`${item.id}-evidencia-${indice}`}><MarkdownAnalise compacto>{evidencia.quote}</MarkdownAnalise>{evidencia.pages?.length ? <footer className="mt-1 text-xs font-semibold text-muted">Página(s): {evidencia.pages.join(", ")}</footer> : null}</blockquote>)}</div>
                    </details>
                ) : null}
                {item.status === "confirmed" ? <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><CircleCheck size={15} />Aplicado na árvore{item.applied_entity_id ? ` (${item.applied_entity_id})` : ""}.</p> : null}
                {item.status === "discarded" ? <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-accent"><CircleX size={15} />Sugestão descartada; nenhuma reversão de itens já confirmados foi realizada.</p> : null}
            </article>
            {filhos.length > 0 ? <div className="mt-3 grid gap-3">{filhos.map((filho) => <ItemSugestao aoConfirmar={aoConfirmar} aoDescartar={aoDescartar} aoEditar={aoEditar} filhosPorPai={filhosPorPai} item={filho} itensPorId={itensPorId} key={filho.id} mutacaoAtiva={mutacaoAtiva} nivel={nivel + 1} />)}</div> : null}
        </div>
    );
}

function EditarSugestaoDialog({ item, titulo, descricao, erro, processando, aoAlterarTitulo, aoAlterarDescricao, aoConfirmar, aoFechar }: {
    item: ItemSugestaoTipificacao;
    titulo: string;
    descricao: string;
    erro: string;
    processando: boolean;
    aoAlterarTitulo: (valor: string) => void;
    aoAlterarDescricao: (valor: string) => void;
    aoConfirmar: () => void;
    aoFechar: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-4 backdrop-blur-sm" role="presentation">
            <section aria-labelledby="titulo-editar-sugestao" aria-modal="true" className="w-full max-w-xl rounded-2xl border border-line bg-panel p-5 shadow-2xl" role="dialog">
                <header className="flex items-start justify-between gap-3 border-b border-line pb-4"><div><span className="text-xs font-bold uppercase tracking-wide text-accent">{rotuloTipoItem[item.kind]}</span><h3 className="mt-1 font-display text-xl font-bold" id="titulo-editar-sugestao">Revisar antes de aplicar</h3></div><BotaoComTitulo aria-label="Cancelar edição" className="grid size-9 place-items-center rounded-lg border border-line" disabled={processando} onClick={aoFechar} type="button"><X size={17} /></BotaoComTitulo></header>
                <div className="mt-4 grid gap-4">
                    <p className="rounded-lg border border-brand/30 bg-brand/8 p-3 text-sm">Ao confirmar, esta alteração entra imediatamente na árvore real.</p>
                    <label className="grid gap-1.5 text-sm font-bold">Título<input className="h-11 rounded-lg border border-line bg-input-bg px-3 font-normal outline-none focus:border-brand" disabled={processando} onChange={(evento) => aoAlterarTitulo(evento.target.value)} value={titulo} /></label>
                    {item.kind !== "typification" ? <label className="grid gap-1.5 text-sm font-bold">Descrição<textarea className="min-h-28 rounded-lg border border-line bg-input-bg p-3 font-normal outline-none focus:border-brand" disabled={processando} onChange={(evento) => aoAlterarDescricao(evento.target.value)} value={descricao} /></label> : null}
                    {erro ? <p className="text-sm font-semibold text-accent" role="alert">{erro}</p> : null}
                </div>
                <footer className="mt-5 flex justify-end gap-3 border-t border-line pt-4"><BotaoComTitulo className="h-10 rounded-lg border border-line px-4 font-bold" disabled={processando} onClick={aoFechar} type="button">Cancelar</BotaoComTitulo><BotaoComTitulo className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 font-bold text-white disabled:opacity-50 dark:text-preto" disabled={processando} onClick={aoConfirmar} type="button">{processando ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}Confirmar e aplicar</BotaoComTitulo></footer>
            </section>
        </div>
    );
}

function ConfirmarDescarteDialog({ todos, titulo, aoConfirmar, aoFechar }: { todos: boolean; titulo?: string; aoConfirmar: () => void; aoFechar: () => void }) {
    return (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="presentation">
            <section aria-labelledby="titulo-confirmar-descarte" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-line bg-panel p-5 shadow-2xl" role="alertdialog">
                <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent"><AlertTriangle size={19} /></span><div><h3 className="font-display text-xl font-bold" id="titulo-confirmar-descarte">{todos ? "Descartar todas as pendentes?" : "Descartar esta sugestão?"}</h3><p className="mt-2 text-sm leading-6 text-muted">{todos ? "Todos os itens ainda pendentes serão descartados." : `“${titulo}” e possíveis descendentes pendentes poderão ser descartados.`} Itens já confirmados permanecem aplicados na árvore real.</p></div></div>
                <footer className="mt-5 flex justify-end gap-3 border-t border-line pt-4"><BotaoComTitulo autoFocus className="h-10 rounded-lg border border-line px-4 font-bold" onClick={aoFechar} type="button">Cancelar</BotaoComTitulo><BotaoComTitulo className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 font-bold text-white" onClick={aoConfirmar} type="button"><Trash2 size={16} />Descartar</BotaoComTitulo></footer>
            </section>
        </div>
    );
}
