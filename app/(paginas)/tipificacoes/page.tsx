"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, GitBranch, Layers3, Loader2, Pencil, Plus, Save, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

import {
    criarArvoreTipificacao,
    criarRamo,
    criarTaxonomia,
    atualizarRamo,
    atualizarTaxonomia,
    atualizarTipificacao,
    excluirArvoreTipificacao,
    listarTipificacoes,
    removerRamo,
    removerTaxonomia,
} from "@/app/services/tipificacao";
import type {
    Ramo,
    RamoRascunho,
    Taxonomia,
    TaxonomiaRascunho,
    Tipificacao,
    TipificacaoRascunho,
} from "@/app/types/Tipificacao";

let sequenciaRascunho = 0;

function criarChaveRascunho(prefixo: string) {
    sequenciaRascunho += 1;
    return `${prefixo}-${sequenciaRascunho}`;
}

function criarRamoRascunho(): RamoRascunho {
    return { chave: criarChaveRascunho("ramo"), title: "", description: "" };
}

function criarTaxonomiaRascunho(): TaxonomiaRascunho {
    return {
        chave: criarChaveRascunho("taxonomia"),
        title: "",
        description: "",
        branches: [criarRamoRascunho()],
    };
}

function criarTipificacaoRascunho(): TipificacaoRascunho {
    return { name: "", taxonomies: [criarTaxonomiaRascunho()] };
}

type FormularioContextual =
    | { tipo: "tipificacao"; tipificacao: Tipificacao; nome: string }
    | { tipo: "taxonomia"; tipificacao: Tipificacao; taxonomia?: Taxonomia; title: string; description: string }
    | { tipo: "ramo"; tipificacao: Tipificacao; taxonomia: Taxonomia; ramo?: Ramo; title: string; description: string };

type RemocaoPendente =
    | { tipo: "taxonomia"; tipificacao: Tipificacao; taxonomia: Taxonomia }
    | { tipo: "ramo"; tipificacao: Tipificacao; taxonomia: Taxonomia; ramo: Ramo };

function validarTipificacaoRascunho(rascunho: TipificacaoRascunho) {
    if (!rascunho.name.trim()) return "Informe o nome da tipificação.";
    if (rascunho.taxonomies.length === 0) return "Adicione ao menos uma taxonomia.";

    for (const [indiceTaxonomia, taxonomia] of rascunho.taxonomies.entries()) {
        const numeroTaxonomia = indiceTaxonomia + 1;
        if (!taxonomia.title.trim()) return `Informe o título da taxonomia ${numeroTaxonomia}.`;
        if (!taxonomia.description.trim()) return `Informe a descrição da taxonomia ${numeroTaxonomia}.`;
        if (taxonomia.branches.length === 0) return `Adicione ao menos um ramo à taxonomia ${numeroTaxonomia}.`;

        for (const [indiceRamo, ramo] of taxonomia.branches.entries()) {
            const numeroRamo = indiceRamo + 1;
            if (!ramo.title.trim()) return `Informe o título do ramo ${numeroRamo} da taxonomia ${numeroTaxonomia}.`;
            if (!ramo.description.trim()) return `Informe a descrição do ramo ${numeroRamo} da taxonomia ${numeroTaxonomia}.`;
        }
    }

    return null;
}

export default function TipificacoesPage() {
    const [tipificacoes, setTipificacoes] = useState<Tipificacao[]>([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [taxonomiaSelecionada, setTaxonomiaSelecionada] = useState<Taxonomia | null>(null);
    const [taxonomiaEmDestaque, setTaxonomiaEmDestaque] = useState<string | null>(null);
    const [criacaoAberta, setCriacaoAberta] = useState(false);
    const [rascunho, setRascunho] = useState<TipificacaoRascunho>(criarTipificacaoRascunho);
    const [erroRascunho, setErroRascunho] = useState("");
    const [salvandoRascunho, setSalvandoRascunho] = useState(false);
    const [formularioContextual, setFormularioContextual] = useState<FormularioContextual | null>(null);
    const [erroFormulario, setErroFormulario] = useState("");
    const [salvandoFormulario, setSalvandoFormulario] = useState(false);
    const [remocaoPendente, setRemocaoPendente] = useState<RemocaoPendente | null>(null);
    const [removendoRegistro, setRemovendoRegistro] = useState(false);
    const [tipificacaoParaExcluir, setTipificacaoParaExcluir] = useState<Tipificacao | null>(null);
    const [excluindoTipificacao, setExcluindoTipificacao] = useState(false);
    const [editorCompletoObsoleto] = useState(false);
    const [rascunhoEdicao, setRascunhoEdicao] = useState<TipificacaoRascunho | null>(null);
    const [tipificacaoOriginal] = useState<Tipificacao | null>(null);
    const erroEdicao = "";
    const salvandoEdicao = false;

    const carregarTipificacoes = useCallback(async (mostrarCarregamento = true) => {
        if (mostrarCarregamento) setCarregando(true);
        setErro("");

        const [result, err] = await listarTipificacoes();
        if (err) {
            setErro(err.message);
            toast.error(err.message, { id: "tipificacoes:carregar" });
        } else {
            setTipificacoes(result);
            setTaxonomiaSelecionada((atual) => {
                if (!atual) return null;
                return result.flatMap((tipificacao) => tipificacao.taxonomies).find((taxonomia) => taxonomia.id === atual.id) ?? null;
            });
        }

        if (mostrarCarregamento) setCarregando(false);
        return err;
    }, []);

    const fecharCriacao = useCallback(() => {
        if (salvandoRascunho) return;
        setCriacaoAberta(false);
        setErroRascunho("");
        setRascunho(criarTipificacaoRascunho());
    }, [salvandoRascunho]);

    const fecharFormularioContextual = useCallback((forcar = false) => {
        if (salvandoFormulario && !forcar) return;
        setFormularioContextual(null);
        setErroFormulario("");
    }, [salvandoFormulario]);

    useEffect(() => {
        async function iniciarCarregamento() {
            await carregarTipificacoes();
        }

        void iniciarCarregamento();
    }, [carregarTipificacoes]);

    useEffect(() => {
        if (!taxonomiaSelecionada) return;

        function fecharComEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setTaxonomiaSelecionada(null);
            }
        }

        window.addEventListener("keydown", fecharComEscape);
        return () => window.removeEventListener("keydown", fecharComEscape);
    }, [taxonomiaSelecionada]);

    useEffect(() => {
        if (!criacaoAberta) return;

        function fecharComEscape(event: KeyboardEvent) {
            if (event.key === "Escape" && !salvandoRascunho) fecharCriacao();
        }

        window.addEventListener("keydown", fecharComEscape);
        return () => window.removeEventListener("keydown", fecharComEscape);
    }, [criacaoAberta, fecharCriacao, salvandoRascunho]);

    useEffect(() => {
        if (!formularioContextual) return;

        function fecharComEscape(event: KeyboardEvent) {
            if (event.key === "Escape" && !salvandoFormulario) fecharFormularioContextual();
        }

        window.addEventListener("keydown", fecharComEscape);
        return () => window.removeEventListener("keydown", fecharComEscape);
    }, [fecharFormularioContextual, formularioContextual, salvandoFormulario]);

    function abrirCriacao() {
        setRascunho(criarTipificacaoRascunho());
        setErroRascunho("");
        setCriacaoAberta(true);
    }

    function abrirEdicaoTipificacao(tipificacao: Tipificacao) {
        setFormularioContextual({ tipo: "tipificacao", tipificacao, nome: tipificacao.name });
        setErroFormulario("");
    }

    function abrirFormularioTaxonomia(tipificacao: Tipificacao, taxonomia?: Taxonomia) {
        setFormularioContextual({
            tipo: "taxonomia",
            tipificacao,
            taxonomia,
            title: taxonomia?.title ?? "",
            description: taxonomia?.description ?? "",
        });
        setErroFormulario("");
    }

    function abrirFormularioRamo(tipificacao: Tipificacao, taxonomia: Taxonomia, ramo?: Ramo) {
        setFormularioContextual({
            tipo: "ramo",
            tipificacao,
            taxonomia,
            ramo,
            title: ramo?.title ?? "",
            description: ramo?.description ?? "",
        });
        setErroFormulario("");
    }

    function fecharEdicao(...args: unknown[]) { void args; }
    function atualizarTaxonomiaEdicao(...args: unknown[]) { void args; }
    function atualizarRamoEdicao(...args: unknown[]) { void args; }
    function solicitarRemocaoTaxonomia(...args: unknown[]) { void args; }
    function solicitarRemocaoRamo(...args: unknown[]) { void args; }
    function adicionarTaxonomiaEdicao(...args: unknown[]) { void args; }
    function adicionarRamoEdicao(...args: unknown[]) { void args; }
    function salvarEdicaoTipificacao(...args: unknown[]) { void args; }

    function atualizarTaxonomiaRascunho(chave: string, campo: "title" | "description", valor: string) {
        setRascunho((atual) => ({
            ...atual,
            taxonomies: atual.taxonomies.map((taxonomia) =>
                taxonomia.chave === chave ? { ...taxonomia, [campo]: valor } : taxonomia
            ),
        }));
    }

    function atualizarRamoRascunho(chaveTaxonomia: string, chaveRamo: string, campo: "title" | "description", valor: string) {
        setRascunho((atual) => ({
            ...atual,
            taxonomies: atual.taxonomies.map((taxonomia) =>
                taxonomia.chave === chaveTaxonomia
                    ? {
                        ...taxonomia,
                        branches: taxonomia.branches.map((ramo) =>
                            ramo.chave === chaveRamo ? { ...ramo, [campo]: valor } : ramo
                        ),
                    }
                    : taxonomia
            ),
        }));
    }

    function adicionarTaxonomia() {
        setRascunho((atual) => ({ ...atual, taxonomies: [...atual.taxonomies, criarTaxonomiaRascunho()] }));
    }

    function removerTaxonomiaRascunho(chave: string) {
        setRascunho((atual) => ({
            ...atual,
            taxonomies: atual.taxonomies.length > 1
                ? atual.taxonomies.filter((taxonomia) => taxonomia.chave !== chave)
                : atual.taxonomies,
        }));
    }

    function adicionarRamo(chaveTaxonomia: string) {
        setRascunho((atual) => ({
            ...atual,
            taxonomies: atual.taxonomies.map((taxonomia) =>
                taxonomia.chave === chaveTaxonomia
                    ? { ...taxonomia, branches: [...taxonomia.branches, criarRamoRascunho()] }
                    : taxonomia
            ),
        }));
    }

    function removerRamoRascunho(chaveTaxonomia: string, chaveRamo: string) {
        setRascunho((atual) => ({
            ...atual,
            taxonomies: atual.taxonomies.map((taxonomia) =>
                taxonomia.chave === chaveTaxonomia && taxonomia.branches.length > 1
                    ? { ...taxonomia, branches: taxonomia.branches.filter((ramo) => ramo.chave !== chaveRamo) }
                    : taxonomia
            ),
        }));
    }

    async function salvarTipificacao(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (salvandoRascunho) return;

        const erroValidacao = validarTipificacaoRascunho(rascunho);
        if (erroValidacao) {
            setErroRascunho(erroValidacao);
            toast.error(erroValidacao, { id: "tipificacoes:criar" });
            return;
        }

        const notificacaoId = "tipificacoes:criar";
        setSalvandoRascunho(true);
        setErroRascunho("");
        toast.loading("Criando tipificação e árvore de critérios...", { id: notificacaoId });

        const [, criacaoErr] = await criarArvoreTipificacao(rascunho);
        const recargaErr = await carregarTipificacoes(false);

        setSalvandoRascunho(false);
        setCriacaoAberta(false);
        setRascunho(criarTipificacaoRascunho());

        if (criacaoErr) {
            toast.error(criacaoErr.message, { id: notificacaoId });
            return;
        }

        if (recargaErr) {
            toast.error("Tipificação criada, mas não foi possível atualizar a lista.", { id: notificacaoId });
            return;
        }

        toast.success("Tipificação criada com suas taxonomias e ramos.", { id: notificacaoId });
    }

    async function salvarFormularioContextual(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (salvandoFormulario || !formularioContextual) return;

        const temDescricao = formularioContextual.tipo !== "tipificacao";
        const nomeOuTitulo = formularioContextual.tipo === "tipificacao"
            ? formularioContextual.nome.trim()
            : formularioContextual.title.trim();
        const descricao = formularioContextual.tipo === "tipificacao" ? "" : formularioContextual.description.trim();
        if (!nomeOuTitulo || (temDescricao && !descricao)) {
            const mensagem = temDescricao
                ? "Informe o título e a descrição."
                : "Informe o nome da tipificação.";
            setErroFormulario(mensagem);
            toast.error(mensagem, { id: "tipificacoes:salvar-contextual" });
            return;
        }

        const notificacaoId = "tipificacoes:salvar-contextual";
        setSalvandoFormulario(true);
        setErroFormulario("");
        toast.loading("Salvando alteração...", { id: notificacaoId });

        let salvamentoErr: Error | null = null;
        let mensagemSucesso = "Alteração salva com sucesso.";

        if (formularioContextual.tipo === "tipificacao") {
            [, salvamentoErr] = await atualizarTipificacao({
                id: formularioContextual.tipificacao.id,
                name: nomeOuTitulo,
            });
        } else if (formularioContextual.tipo === "taxonomia") {
            mensagemSucesso = formularioContextual.taxonomia ? "Taxonomia atualizada com sucesso." : "Taxonomia adicionada com sucesso.";
            if (formularioContextual.taxonomia) {
                [, salvamentoErr] = await atualizarTaxonomia({
                    id: formularioContextual.taxonomia.id,
                    title: nomeOuTitulo,
                    description: formularioContextual.description.trim(),
                    typificationId: formularioContextual.tipificacao.id,
                });
            } else {
                [, salvamentoErr] = await criarTaxonomia({
                    title: nomeOuTitulo,
                    description: formularioContextual.description.trim(),
                    typificationId: formularioContextual.tipificacao.id,
                });
            }
        } else {
            mensagemSucesso = formularioContextual.ramo ? "Ramo atualizado com sucesso." : "Ramo adicionado com sucesso.";
            if (formularioContextual.ramo) {
                [, salvamentoErr] = await atualizarRamo({
                    id: formularioContextual.ramo.id,
                    title: nomeOuTitulo,
                    description: formularioContextual.description.trim(),
                    taxonomyId: formularioContextual.taxonomia.id,
                });
            } else {
                [, salvamentoErr] = await criarRamo({
                    title: nomeOuTitulo,
                    description: formularioContextual.description.trim(),
                    taxonomyId: formularioContextual.taxonomia.id,
                });
            }
        }

        const recargaErr = await carregarTipificacoes(false);
        setSalvandoFormulario(false);
        fecharFormularioContextual(true);

        if (salvamentoErr) {
            toast.error(salvamentoErr.message, { id: notificacaoId });
            return;
        }
        if (recargaErr) {
            toast.error("Alteração salva, mas não foi possível atualizar a lista.", { id: notificacaoId });
            return;
        }
        toast.success(mensagemSucesso, { id: notificacaoId });
    }

    async function confirmarRemocaoPendente() {
        if (removendoRegistro || !remocaoPendente) return;

        const notificacaoId = "tipificacoes:remover-contextual";
        setRemovendoRegistro(true);
        toast.loading(`Removendo ${remocaoPendente.tipo}...`, { id: notificacaoId });
        const [, remocaoErr] = remocaoPendente.tipo === "taxonomia"
            ? await removerTaxonomia(remocaoPendente.taxonomia.id)
            : await removerRamo(remocaoPendente.ramo.id);
        const recargaErr = await carregarTipificacoes(false);

        setRemovendoRegistro(false);
        setRemocaoPendente(null);

        if (remocaoErr) {
            toast.error(remocaoErr.message, { id: notificacaoId });
            return;
        }
        if (recargaErr) {
            toast.error("Item removido, mas não foi possível atualizar a lista.", { id: notificacaoId });
            return;
        }
        toast.success(`${remocaoPendente.tipo === "taxonomia" ? "Taxonomia" : "Ramo"} removido com sucesso.`, { id: notificacaoId });
    }

    async function confirmarExclusaoTipificacao() {
        if (excluindoTipificacao || !tipificacaoParaExcluir) return;

        const notificacaoId = "tipificacoes:excluir";
        setExcluindoTipificacao(true);
        toast.loading("Excluindo tipificação e sua árvore de critérios...", { id: notificacaoId });

        const [, exclusaoErr] = await excluirArvoreTipificacao(tipificacaoParaExcluir);
        const recargaErr = await carregarTipificacoes(false);

        setExcluindoTipificacao(false);
        setTipificacaoParaExcluir(null);

        if (exclusaoErr) {
            toast.error(exclusaoErr.message, { id: notificacaoId });
            return;
        }

        if (recargaErr) {
            toast.error("Tipificação excluída, mas não foi possível atualizar a lista.", { id: notificacaoId });
            return;
        }

        toast.success("Tipificação excluída com sucesso.", { id: notificacaoId });
    }

    const tipificacoesFiltradas = useMemo(() => {
        const buscaNormalizada = busca.trim().toLowerCase();
        if (!buscaNormalizada) return tipificacoes;

        return tipificacoes.filter((tipificacao) => tipificacao.name.toLowerCase().includes(buscaNormalizada));
    }, [busca, tipificacoes]);

    const totais = useMemo(() => {
        const totalTaxonomias = tipificacoes.reduce(
            (total, tipificacao) => total + tipificacao.taxonomies.length,
            0
        );
        const totalRamos = tipificacoes.reduce(
            (total, tipificacao) =>
                total + tipificacao.taxonomies.reduce((subtotal, taxonomia) => subtotal + taxonomia.branches.length, 0),
            0
        );

        return {
            tipificacoes: tipificacoes.length,
            taxonomias: totalTaxonomias,
            ramos: totalRamos,
            exibidas: tipificacoesFiltradas.length,
        };
    }, [tipificacoes, tipificacoesFiltradas.length]);

    const tipificacaoDaTaxonomiaSelecionada = useMemo(
        () => taxonomiaSelecionada
            ? tipificacoes.find((tipificacao) => tipificacao.taxonomies.some((taxonomia) => taxonomia.id === taxonomiaSelecionada.id)) ?? null
            : null,
        [taxonomiaSelecionada, tipificacoes]
    );

    return (
        <section className="grid gap-6 px-6 py-8 lg:px-8">
            <header className="sticky top-0 z-40 -mx-6 -mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-line bg-panel/95 px-6 py-6 shadow-[0_16px_30px_-26px_var(--chrome-shadow)] backdrop-blur lg:-mx-8 lg:px-8">
                <div>
                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                        Tipificações
                    </span>
                    <h1 className="mt-2 font-display text-4xl font-bold text-ink md:text-5xl">
                        Árvore de verificação
                    </h1>
                    <p className="mt-3 max-w-none whitespace-nowrap text-base leading-7 text-muted md:text-lg">
                        Visualize as tipificações cadastradas, suas taxonomias e os ramos usados na análise dos
                        documentos.
                    </p>
                </div>
                <button
                    className="inline-flex h-12 items-center gap-2 rounded-lg bg-brand px-5 font-display text-base font-bold text-white shadow-[0_12px_28px_-16px_var(--brand)] transition hover:bg-brand-strong dark:text-preto"
                    type="button"
                    onClick={abrirCriacao}
                >
                    <Plus size={20} />
                    Nova tipificação
                </button>
            </header>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo das tipificações">
                <CartaoResumo valor={totais.tipificacoes} rotulo="Tipificações" />
                <CartaoResumo valor={totais.taxonomias} rotulo="Taxonomias" />
                <CartaoResumo valor={totais.ramos} rotulo="Ramos" />
                <CartaoResumo valor={totais.exibidas} rotulo="Exibidas" />
            </div>

            <label className="flex h-12 items-center gap-3 rounded-lg border border-line bg-input-bg px-4 text-muted shadow-[0_14px_34px_-28px_var(--chrome-shadow)] focus-within:border-brand">
                <Search size={18} />
                <input
                    aria-label="Pesquisar tipificações"
                    value={busca}
                    placeholder="Pesquisar por nome da tipificação"
                    onChange={(event) => setBusca(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
                />
            </label>

            {carregando ? (
                <EstadoVazio
                    icone={<Loader2 className="animate-spin" size={42} />}
                    titulo="Carregando tipificações"
                    descricao="Aguarde enquanto os dados são buscados na API."
                />
            ) : erro ? (
                <EstadoVazio
                    icone={<AlertCircle size={42} />}
                    titulo="Não foi possível carregar"
                    descricao={erro}
                />
            ) : tipificacoesFiltradas.length === 0 ? (
                <EstadoVazio
                    icone={<Search size={42} />}
                    titulo="Nenhuma tipificação encontrada"
                    descricao="Ajuste a pesquisa para visualizar outros itens."
                />
            ) : (
                <div className="grid gap-5">
                    {tipificacoesFiltradas.map((tipificacao) => (
                        <article
                            className="rounded-lg border border-line bg-panel p-5 text-ink shadow-[0_18px_44px_-28px_var(--chrome-shadow)]"
                            key={tipificacao.id}
                        >
                            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
                                <div>
                                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                                        Tipificação
                                    </span>
                                    <h2 className="mt-2 font-display text-2xl font-bold">{tipificacao.name}</h2>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm font-semibold text-muted">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-input-bg px-3 py-2">
                                        <Layers3 size={16} />
                                        {tipificacao.taxonomies.length} taxonomia(s)
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-input-bg px-3 py-2">
                                        <GitBranch size={16} />
                                        {contarRamos(tipificacao)} ramo(s)
                                    </span>
                                    <button
                                        className="inline-flex items-center gap-2 rounded-full border border-line bg-input-bg px-3 py-2 text-ink transition hover:border-brand hover:bg-subtle-hover"
                                        type="button"
                                        onClick={() => abrirEdicaoTipificacao(tipificacao)}
                                    >
                                        <Pencil size={16} />
                                        Editar nome
                                    </button>
                                    <button
                                        className="inline-flex items-center gap-2 rounded-full border border-line bg-input-bg px-3 py-2 text-ink transition hover:border-brand hover:bg-subtle-hover"
                                        type="button"
                                        onClick={() => abrirFormularioTaxonomia(tipificacao)}
                                    >
                                        <Plus size={16} />
                                        Taxonomia
                                    </button>
                                    <button
                                        className="inline-flex items-center gap-2 rounded-full border border-line bg-input-bg px-3 py-2 text-accent transition hover:border-accent hover:bg-accent/10"
                                        type="button"
                                        onClick={() => setTipificacaoParaExcluir(tipificacao)}
                                    >
                                        <Trash2 size={16} />
                                        Excluir
                                    </button>
                                </div>
                            </header>

                            <div
                                className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
                                onMouseLeave={() => setTaxonomiaEmDestaque(null)}
                            >
                                {tipificacao.taxonomies.map((taxonomia) => (
                                    <div
                                        className="relative p-1"
                                        key={taxonomia.id}
                                        onMouseEnter={() => setTaxonomiaEmDestaque(taxonomia.id)}
                                        onFocus={() => setTaxonomiaEmDestaque(taxonomia.id)}
                                        onBlur={() => setTaxonomiaEmDestaque(null)}
                                    >
                                        <AnimatePresence>
                                            {taxonomiaEmDestaque === taxonomia.id ? (
                                                <motion.span
                                                    className="absolute inset-0 rounded-lg bg-subtle-hover ring-1 ring-brand/25 shadow-[0_24px_58px_-26px_var(--chrome-shadow)]"
                                                    layoutId="taxonomia-hover"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ type: "spring", stiffness: 190, damping: 24, mass: 0.9 }}
                                                />
                                            ) : null}
                                        </AnimatePresence>

                                        <div
                                            className="relative z-10 h-full w-full rounded-md border border-line bg-input-bg p-3.5 text-left text-ink transition hover:border-brand focus-visible:border-brand"
                                            role="button"
                                            tabIndex={0}
                                            aria-haspopup="dialog"
                                            onClick={() => setTaxonomiaSelecionada(taxonomia)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    setTaxonomiaSelecionada(taxonomia);
                                                }
                                            }}
                                        >
                                            <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3">
                                                <ShieldCheck size={21} className="mt-1 text-accent" />
                                                <div>
                                                    <span className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                                                        Taxonomia
                                                    </span>
                                                    <h3 className="mt-1 font-display text-lg font-bold">
                                                        {taxonomia.title}
                                                    </h3>
                                                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                                                        {taxonomia.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                                                <GitBranch size={16} />
                                                Ver {taxonomia.branches.length} ramo(s)
                                            </span>
                                        <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                                            <button
                                                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 text-xs font-bold text-ink transition hover:border-brand"
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    abrirFormularioTaxonomia(tipificacao, taxonomia);
                                                }}
                                            >
                                                <Pencil size={14} />
                                                Editar taxonomia
                                            </button>
                                            <button
                                                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 text-xs font-bold text-accent transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-45"
                                                type="button"
                                                disabled={tipificacao.taxonomies.length === 1}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setRemocaoPendente({ tipo: "taxonomia", tipificacao, taxonomia });
                                                }}
                                            >
                                                <Trash2 size={14} />
                                                Remover
                                            </button>
                                        </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {criacaoAberta ? (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) fecharCriacao();
                    }}
                >
                    <form
                        className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg border border-line bg-panel p-5 text-ink shadow-[0_22px_70px_-22px_rgba(0,0,0,0.45)]"
                        aria-labelledby="creation-modal-title"
                        aria-modal="true"
                        onSubmit={(event) => void salvarTipificacao(event)}
                        role="dialog"
                    >
                        <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
                            <div>
                                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                                    Nova estrutura
                                </span>
                                <h2 id="creation-modal-title" className="mt-2 font-display text-2xl font-bold">
                                    Criar tipificação
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Monte as taxonomias e os ramos que serão usados na árvore de verificação.
                                </p>
                            </div>
                            <button
                                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg text-ink transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                disabled={salvandoRascunho}
                                onClick={fecharCriacao}
                                aria-label="Cancelar criação"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="mt-5 grid gap-5">
                            {erroRascunho ? (
                                <p className="rounded-lg border border-accent/45 bg-accent/10 px-4 py-3 text-sm font-semibold text-ink" role="alert">
                                    {erroRascunho}
                                </p>
                            ) : null}

                            <label className="grid gap-2">
                                <span className="text-sm font-bold">Nome da tipificação</span>
                                <input
                                    className="h-11 rounded-lg border border-line bg-input-bg px-3 text-ink outline-none transition focus:border-brand"
                                    value={rascunho.name}
                                    disabled={salvandoRascunho}
                                    onChange={(event) => setRascunho((atual) => ({ ...atual, name: event.target.value }))}
                                    placeholder="Ex.: Avaliação de edital científico"
                                />
                            </label>

                            <div className="grid gap-4">
                                {rascunho.taxonomies.map((taxonomia, indiceTaxonomia) => (
                                    <fieldset className="rounded-lg border border-line bg-input-bg p-4" key={taxonomia.chave}>
                                        <legend className="px-1 font-display text-base font-bold">
                                            Taxonomia {indiceTaxonomia + 1}
                                        </legend>
                                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                                            <label className="grid gap-2">
                                                <span className="text-sm font-semibold">Título</span>
                                                <input
                                                    className="h-10 rounded-lg border border-line bg-panel px-3 text-ink outline-none transition focus:border-brand"
                                                    value={taxonomia.title}
                                                    disabled={salvandoRascunho}
                                                    onChange={(event) => atualizarTaxonomiaRascunho(taxonomia.chave, "title", event.target.value)}
                                                    placeholder="Nome da taxonomia"
                                                />
                                            </label>
                                            <button
                                                className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-bold text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-45"
                                                type="button"
                                                disabled={salvandoRascunho || rascunho.taxonomies.length === 1}
                                                onClick={() => removerTaxonomiaRascunho(taxonomia.chave)}
                                            >
                                                <Trash2 size={16} />
                                                Remover
                                            </button>
                                        </div>
                                        <label className="mt-3 grid gap-2">
                                            <span className="text-sm font-semibold">Descrição</span>
                                            <textarea
                                                className="min-h-20 rounded-lg border border-line bg-panel px-3 py-2 text-ink outline-none transition focus:border-brand"
                                                value={taxonomia.description}
                                                disabled={salvandoRascunho}
                                                onChange={(event) => atualizarTaxonomiaRascunho(taxonomia.chave, "description", event.target.value)}
                                                placeholder="Descreva o que esta taxonomia avalia"
                                            />
                                        </label>

                                        <div className="mt-4 grid gap-3 border-t border-line pt-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <strong className="font-display text-sm">Ramos</strong>
                                                <button
                                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-bold text-muted transition hover:border-brand hover:text-ink"
                                                    type="button"
                                                    disabled={salvandoRascunho}
                                                    onClick={() => adicionarRamo(taxonomia.chave)}
                                                >
                                                    <Plus size={16} />
                                                    Adicionar ramo
                                                </button>
                                            </div>
                                            {taxonomia.branches.map((ramo, indiceRamo) => (
                                                <div className="grid gap-3 rounded-lg border border-line bg-panel p-3" key={ramo.chave}>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-sm font-bold text-muted">Ramo {indiceRamo + 1}</span>
                                                        <button
                                                            className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-subtle-hover hover:text-accent disabled:cursor-not-allowed disabled:opacity-45"
                                                            type="button"
                                                            disabled={salvandoRascunho || taxonomia.branches.length === 1}
                                                            onClick={() => removerRamoRascunho(taxonomia.chave, ramo.chave)}
                                                            aria-label={`Remover ramo ${indiceRamo + 1}`}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <label className="grid gap-2">
                                                        <span className="text-sm font-semibold">Título</span>
                                                        <input
                                                            className="h-10 rounded-lg border border-line bg-input-bg px-3 text-ink outline-none transition focus:border-brand"
                                                            value={ramo.title}
                                                            disabled={salvandoRascunho}
                                                            onChange={(event) => atualizarRamoRascunho(taxonomia.chave, ramo.chave, "title", event.target.value)}
                                                            placeholder="Nome do ramo"
                                                        />
                                                    </label>
                                                    <label className="grid gap-2">
                                                        <span className="text-sm font-semibold">Descrição</span>
                                                        <textarea
                                                            className="min-h-20 rounded-lg border border-line bg-input-bg px-3 py-2 text-ink outline-none transition focus:border-brand"
                                                            value={ramo.description}
                                                            disabled={salvandoRascunho}
                                                            onChange={(event) => atualizarRamoRascunho(taxonomia.chave, ramo.chave, "description", event.target.value)}
                                                            placeholder="Descreva o critério avaliado neste ramo"
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </fieldset>
                                ))}
                            </div>

                            <button
                                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-line bg-input-bg px-3 text-sm font-bold text-muted transition hover:border-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                disabled={salvandoRascunho}
                                onClick={adicionarTaxonomia}
                            >
                                <Plus size={17} />
                                Adicionar taxonomia
                            </button>
                        </div>

                        <footer className="mt-5 flex flex-wrap justify-end gap-3 border-t border-line pt-4">
                            <button
                                className="h-10 rounded-lg border border-line bg-input-bg px-4 text-sm font-bold text-muted transition hover:border-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                disabled={salvandoRascunho}
                                onClick={fecharCriacao}
                            >
                                Cancelar
                            </button>
                            <button
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white transition hover:bg-brand-strong dark:text-preto disabled:cursor-not-allowed disabled:opacity-50"
                                type="submit"
                                disabled={salvandoRascunho}
                            >
                                {salvandoRascunho ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                                {salvandoRascunho ? "Criando..." : "Criar tipificação"}
                            </button>
                        </footer>
                    </form>
                </div>
            ) : null}

            {formularioContextual ? (
                <div
                    className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) fecharFormularioContextual();
                    }}
                >
                    <form
                        className="w-full max-w-lg rounded-lg border border-line bg-panel p-5 text-ink shadow-[0_22px_70px_-22px_rgba(0,0,0,0.45)]"
                        aria-modal="true"
                        onSubmit={(event) => void salvarFormularioContextual(event)}
                        role="dialog"
                    >
                        <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
                            <div>
                                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                                    {formularioContextual.tipo === "tipificacao" ? "Tipificação" : formularioContextual.tipo === "taxonomia" ? "Taxonomia" : "Ramo"}
                                </span>
                                <h2 className="mt-2 font-display text-2xl font-bold">
                                    {formularioContextual.tipo === "tipificacao"
                                        ? "Editar nome"
                                        : formularioContextual.tipo === "taxonomia"
                                            ? formularioContextual.taxonomia ? "Editar taxonomia" : "Adicionar taxonomia"
                                            : formularioContextual.ramo ? "Editar ramo" : "Adicionar ramo"}
                                </h2>
                            </div>
                            <button
                                className="inline-flex size-10 items-center justify-center rounded-lg border border-line bg-input-bg text-ink transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                disabled={salvandoFormulario}
                                onClick={() => fecharFormularioContextual()}
                                aria-label="Cancelar"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="mt-5 grid gap-4">
                            {erroFormulario ? <p className="rounded-lg border border-accent/45 bg-accent/10 px-4 py-3 text-sm font-semibold" role="alert">{erroFormulario}</p> : null}
                            {formularioContextual.tipo === "tipificacao" ? (
                                <label className="grid gap-2">
                                    <span className="text-sm font-bold">Nome da tipificação</span>
                                    <input
                                        className="h-11 rounded-lg border border-line bg-input-bg px-3 outline-none focus:border-brand"
                                        value={formularioContextual.nome}
                                        disabled={salvandoFormulario}
                                        onChange={(event) => setFormularioContextual((atual) => atual?.tipo === "tipificacao" ? { ...atual, nome: event.target.value } : atual)}
                                    />
                                </label>
                            ) : (
                                <>
                                    <label className="grid gap-2">
                                        <span className="text-sm font-bold">Título</span>
                                        <input
                                            className="h-11 rounded-lg border border-line bg-input-bg px-3 outline-none focus:border-brand"
                                            value={formularioContextual.title}
                                            disabled={salvandoFormulario}
                                            onChange={(event) => setFormularioContextual((atual) => atual?.tipo === "tipificacao" || !atual ? atual : { ...atual, title: event.target.value })}
                                        />
                                    </label>
                                    <label className="grid gap-2">
                                        <span className="text-sm font-bold">Descrição</span>
                                        <textarea
                                            className="min-h-24 rounded-lg border border-line bg-input-bg px-3 py-2 outline-none focus:border-brand"
                                            value={formularioContextual.description}
                                            disabled={salvandoFormulario}
                                            onChange={(event) => setFormularioContextual((atual) => atual?.tipo === "tipificacao" || !atual ? atual : { ...atual, description: event.target.value })}
                                        />
                                    </label>
                                </>
                            )}
                        </div>

                        <footer className="mt-5 flex justify-end gap-3 border-t border-line pt-4">
                            <button className="h-10 rounded-lg border border-line bg-input-bg px-4 text-sm font-bold text-muted disabled:opacity-50" type="button" disabled={salvandoFormulario} onClick={() => fecharFormularioContextual()}>
                                Cancelar
                            </button>
                            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white disabled:opacity-50 dark:text-preto" type="submit" disabled={salvandoFormulario}>
                                {salvandoFormulario ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                                {salvandoFormulario ? "Salvando..." : "Salvar"}
                            </button>
                        </footer>
                    </form>
                </div>
            ) : null}

            {editorCompletoObsoleto && rascunhoEdicao && tipificacaoOriginal ? (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !remocaoPendente) fecharEdicao();
                    }}
                >
                    <form
                        className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg border border-line bg-panel p-5 text-ink shadow-[0_22px_70px_-22px_rgba(0,0,0,0.45)]"
                        aria-labelledby="edit-modal-title"
                        aria-modal="true"
                        onSubmit={(event) => void salvarEdicaoTipificacao(event)}
                        role="dialog"
                    >
                        <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
                            <div>
                                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                                    Editar estrutura
                                </span>
                                <h2 id="edit-modal-title" className="mt-2 font-display text-2xl font-bold">
                                    {tipificacaoOriginal.name}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Atualize a tipificação, suas taxonomias e seus ramos. As remoções de itens salvos pedem confirmação.
                                </p>
                            </div>
                            <button
                                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg text-ink transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                disabled={salvandoEdicao}
                                onClick={() => fecharEdicao()}
                                aria-label="Cancelar edição"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="mt-5 grid gap-5">
                            {erroEdicao ? (
                                <p className="rounded-lg border border-accent/45 bg-accent/10 px-4 py-3 text-sm font-semibold text-ink" role="alert">
                                    {erroEdicao}
                                </p>
                            ) : null}

                            <label className="grid gap-2">
                                <span className="text-sm font-bold">Nome da tipificação</span>
                                <input
                                    className="h-11 rounded-lg border border-line bg-input-bg px-3 text-ink outline-none transition focus:border-brand"
                                    value={rascunhoEdicao.name}
                                    disabled={salvandoEdicao}
                                    onChange={(event) => setRascunhoEdicao((atual) => atual ? { ...atual, name: event.target.value } : atual)}
                                />
                            </label>

                            <div className="grid gap-4">
                                {rascunhoEdicao.taxonomies.map((taxonomia, indiceTaxonomia) => (
                                    <fieldset className="rounded-lg border border-line bg-input-bg p-4" key={taxonomia.chave}>
                                        <legend className="px-1 font-display text-base font-bold">
                                            Taxonomia {indiceTaxonomia + 1}
                                        </legend>
                                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                                            <label className="grid gap-2">
                                                <span className="text-sm font-semibold">Título</span>
                                                <input
                                                    className="h-10 rounded-lg border border-line bg-panel px-3 text-ink outline-none transition focus:border-brand"
                                                    value={taxonomia.title}
                                                    disabled={salvandoEdicao}
                                                    onChange={(event) => atualizarTaxonomiaEdicao(taxonomia.chave, "title", event.target.value)}
                                                    placeholder="Nome da taxonomia"
                                                />
                                            </label>
                                            <button
                                                className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-bold text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-45"
                                                type="button"
                                                disabled={salvandoEdicao || rascunhoEdicao.taxonomies.length === 1}
                                                onClick={() => solicitarRemocaoTaxonomia(taxonomia)}
                                            >
                                                <Trash2 size={16} />
                                                Remover
                                            </button>
                                        </div>
                                        <label className="mt-3 grid gap-2">
                                            <span className="text-sm font-semibold">Descrição</span>
                                            <textarea
                                                className="min-h-20 rounded-lg border border-line bg-panel px-3 py-2 text-ink outline-none transition focus:border-brand"
                                                value={taxonomia.description}
                                                disabled={salvandoEdicao}
                                                onChange={(event) => atualizarTaxonomiaEdicao(taxonomia.chave, "description", event.target.value)}
                                                placeholder="Descreva o que esta taxonomia avalia"
                                            />
                                        </label>

                                        <div className="mt-4 grid gap-3 border-t border-line pt-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <strong className="font-display text-sm">Ramos</strong>
                                                <button
                                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-bold text-muted transition hover:border-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                                                    type="button"
                                                    disabled={salvandoEdicao}
                                                    onClick={() => adicionarRamoEdicao(taxonomia.chave)}
                                                >
                                                    <Plus size={16} />
                                                    Adicionar ramo
                                                </button>
                                            </div>
                                            {taxonomia.branches.map((ramo, indiceRamo) => (
                                                <div className="grid gap-3 rounded-lg border border-line bg-panel p-3" key={ramo.chave}>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-sm font-bold text-muted">Ramo {indiceRamo + 1}</span>
                                                        <button
                                                            className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-subtle-hover hover:text-accent disabled:cursor-not-allowed disabled:opacity-45"
                                                            type="button"
                                                            disabled={salvandoEdicao || taxonomia.branches.length === 1}
                                                            onClick={() => solicitarRemocaoRamo(taxonomia.chave, ramo)}
                                                            aria-label={`Remover ramo ${indiceRamo + 1}`}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <label className="grid gap-2">
                                                        <span className="text-sm font-semibold">Título</span>
                                                        <input
                                                            className="h-10 rounded-lg border border-line bg-input-bg px-3 text-ink outline-none transition focus:border-brand"
                                                            value={ramo.title}
                                                            disabled={salvandoEdicao}
                                                            onChange={(event) => atualizarRamoEdicao(taxonomia.chave, ramo.chave, "title", event.target.value)}
                                                            placeholder="Nome do ramo"
                                                        />
                                                    </label>
                                                    <label className="grid gap-2">
                                                        <span className="text-sm font-semibold">Descrição</span>
                                                        <textarea
                                                            className="min-h-20 rounded-lg border border-line bg-input-bg px-3 py-2 text-ink outline-none transition focus:border-brand"
                                                            value={ramo.description}
                                                            disabled={salvandoEdicao}
                                                            onChange={(event) => atualizarRamoEdicao(taxonomia.chave, ramo.chave, "description", event.target.value)}
                                                            placeholder="Descreva o critério avaliado neste ramo"
                                                        />
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </fieldset>
                                ))}
                            </div>

                            <button
                                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-line bg-input-bg px-3 text-sm font-bold text-muted transition hover:border-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                disabled={salvandoEdicao}
                                onClick={adicionarTaxonomiaEdicao}
                            >
                                <Plus size={17} />
                                Adicionar taxonomia
                            </button>
                        </div>

                        <footer className="mt-5 flex flex-wrap justify-end gap-3 border-t border-line pt-4">
                            <button
                                className="h-10 rounded-lg border border-line bg-input-bg px-4 text-sm font-bold text-muted transition hover:border-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                disabled={salvandoEdicao}
                                onClick={() => fecharEdicao()}
                            >
                                Cancelar
                            </button>
                            <button
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white transition hover:bg-brand-strong dark:text-preto disabled:cursor-not-allowed disabled:opacity-50"
                                type="submit"
                                disabled={salvandoEdicao}
                            >
                                {salvandoEdicao ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                                {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                            </button>
                        </footer>
                    </form>
                </div>
            ) : null}

            {remocaoPendente ? (
                <ConfirmacaoDialogo
                    carregando={removendoRegistro}
                    descricao={`Remover ${remocaoPendente.tipo === "taxonomia" ? "a taxonomia" : "o ramo"} “${remocaoPendente.tipo === "taxonomia" ? remocaoPendente.taxonomia.title : remocaoPendente.ramo.title}”? Esta ação não pode ser desfeita.`}
                    titulo={`Remover ${remocaoPendente.tipo === "taxonomia" ? "taxonomia" : "ramo"}`}
                    onCancelar={() => !removendoRegistro && setRemocaoPendente(null)}
                    onConfirmar={() => void confirmarRemocaoPendente()}
                />
            ) : null}

            {tipificacaoParaExcluir ? (
                <ConfirmacaoDialogo
                    carregando={excluindoTipificacao}
                    descricao={`Excluir “${tipificacaoParaExcluir.name}” e todas as suas taxonomias e ramos? Esta ação não pode ser desfeita.`}
                    titulo="Excluir tipificação"
                    textoConfirmar="Excluir tipificação"
                    onCancelar={() => !excluindoTipificacao && setTipificacaoParaExcluir(null)}
                    onConfirmar={() => void confirmarExclusaoTipificacao()}
                />
            ) : null}

            {taxonomiaSelecionada ? (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setTaxonomiaSelecionada(null);
                        }
                    }}
                >
                    <div
                        className="max-h-[86vh] w-full max-w-3xl overflow-auto rounded-lg border border-line bg-panel p-5 text-ink shadow-[0_22px_70px_-22px_rgba(0,0,0,0.45)]"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="taxonomy-modal-title"
                    >
                        <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
                            <div>
                                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                                    Ramos da taxonomia
                                </span>
                                <h2 id="taxonomy-modal-title" className="mt-2 font-display text-2xl font-bold">
                                    {taxonomiaSelecionada.title}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-muted">{taxonomiaSelecionada.description}</p>
                            </div>
                            <button
                                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg text-ink transition hover:border-brand hover:bg-subtle-hover"
                                type="button"
                                onClick={() => setTaxonomiaSelecionada(null)}
                                aria-label="Fechar"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="mt-4 grid gap-3">
                            {tipificacaoDaTaxonomiaSelecionada ? (
                                <button
                                    className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-line bg-input-bg px-3 text-sm font-bold text-ink transition hover:border-brand"
                                    type="button"
                                    onClick={() => abrirFormularioRamo(tipificacaoDaTaxonomiaSelecionada, taxonomiaSelecionada)}
                                >
                                    <Plus size={16} />
                                    Adicionar ramo
                                </button>
                            ) : null}
                            {taxonomiaSelecionada.branches.length === 0 ? (
                                <span className="rounded-lg border border-dashed border-line p-4 text-muted">
                                    Nenhum ramo cadastrado.
                                </span>
                            ) : (
                                taxonomiaSelecionada.branches.map((ramo) => (
                                    <article className="rounded-lg border border-line bg-input-bg p-4" key={ramo.id}>
                                        <div className="flex items-start justify-between gap-3">
                                            <strong className="font-display text-base">{ramo.title}</strong>
                                            {tipificacaoDaTaxonomiaSelecionada ? (
                                                <div className="flex shrink-0 gap-2">
                                                    <button
                                                        className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-subtle-hover hover:text-ink"
                                                        type="button"
                                                        onClick={() => abrirFormularioRamo(tipificacaoDaTaxonomiaSelecionada, taxonomiaSelecionada, ramo)}
                                                        aria-label={`Editar ramo ${ramo.title}`}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-subtle-hover hover:text-accent disabled:cursor-not-allowed disabled:opacity-45"
                                                        type="button"
                                                        disabled={taxonomiaSelecionada.branches.length === 1}
                                                        onClick={() => setRemocaoPendente({ tipo: "ramo", tipificacao: tipificacaoDaTaxonomiaSelecionada, taxonomia: taxonomiaSelecionada, ramo })}
                                                        aria-label={`Remover ramo ${ramo.title}`}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-muted">{ramo.description}</p>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

function CartaoResumo({ valor, rotulo }: { valor: number; rotulo: string }) {
    return (
        <div className="rounded-lg border border-line bg-panel p-5 shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
            <strong className="font-display text-3xl font-bold text-ink">{valor}</strong>
            <span className="mt-1 block text-sm font-semibold text-muted">{rotulo}</span>
        </div>
    );
}

function ConfirmacaoDialogo({
    titulo,
    descricao,
    textoConfirmar = "Remover",
    carregando = false,
    onCancelar,
    onConfirmar,
}: {
    titulo: string;
    descricao: string;
    textoConfirmar?: string;
    carregando?: boolean;
    onCancelar: () => void;
    onConfirmar: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-4" role="presentation">
            <div
                className="w-full max-w-md rounded-lg border border-line bg-panel p-5 text-ink shadow-[0_22px_70px_-22px_rgba(0,0,0,0.45)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmacao-dialogo-titulo"
            >
                <h2 id="confirmacao-dialogo-titulo" className="font-display text-xl font-bold">
                    {titulo}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">{descricao}</p>
                <div className="mt-5 flex justify-end gap-3">
                    <button
                        className="h-10 rounded-lg border border-line bg-input-bg px-4 text-sm font-bold text-muted transition hover:border-brand hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        disabled={carregando}
                        onClick={onCancelar}
                    >
                        Cancelar
                    </button>
                    <button
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition hover:bg-accent/85 disabled:cursor-not-allowed disabled:opacity-50 dark:text-preto"
                        type="button"
                        disabled={carregando}
                        onClick={onConfirmar}
                    >
                        {carregando ? <Loader2 className="animate-spin" size={17} /> : <Trash2 size={17} />}
                        {carregando ? "Excluindo..." : textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}

function EstadoVazio({
    icone,
    titulo,
    descricao,
}: {
    icone: React.ReactNode;
    titulo: string;
    descricao: string;
}) {
    return (
        <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-line bg-panel p-8 text-center text-muted">
            <div className="grid justify-items-center gap-3">
                <div className="text-accent">{icone}</div>
                <strong className="font-display text-xl text-ink">{titulo}</strong>
                <span className="max-w-md text-sm leading-6">{descricao}</span>
            </div>
        </div>
    );
}

function contarRamos(tipificacao: Tipificacao) {
    return tipificacao.taxonomies.reduce((total, taxonomia) => total + taxonomia.branches.length, 0);
}
