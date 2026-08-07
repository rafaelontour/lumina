"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, GitBranch, Layers3, Loader2, Search, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

import { listarTipificacoes } from "@/app/services/tipificacao";
import type { Taxonomia, Tipificacao } from "@/app/types/Tipificacao";

export default function TipificacoesPage() {
    const [tipificacoes, setTipificacoes] = useState<Tipificacao[]>([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [taxonomiaSelecionada, setTaxonomiaSelecionada] = useState<Taxonomia | null>(null);
    const [taxonomiaEmDestaque, setTaxonomiaEmDestaque] = useState<string | null>(null);

    useEffect(() => {
        async function carregarTipificacoes() {
            setCarregando(true);
            setErro("");

            const [result, err] = await listarTipificacoes();
            if (err) {
                setErro(err.message);
                toast.error(err.message, { id: "tipificacoes:carregar" });
            } else {
                setTipificacoes(result);
            }

            setCarregando(false);
        }

        void carregarTipificacoes();
    }, []);

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

    const tipificacoesFiltradas = useMemo(() => {
        const buscaNormalizada = busca.trim().toLowerCase();
        if (!buscaNormalizada) return tipificacoes;

        return tipificacoes.filter((tipificacao) => {
            if (tipificacao.name.toLowerCase().includes(buscaNormalizada)) return true;

            return tipificacao.taxonomies.some(
                (taxonomia) =>
                    taxonomia.title.toLowerCase().includes(buscaNormalizada) ||
                    taxonomia.branches.some((ramo) => ramo.title.toLowerCase().includes(buscaNormalizada))
            );
        });
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

    return (
        <section className="grid gap-6 px-6 py-8 lg:px-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                        Tipificações
                    </span>
                    <h1 className="mt-2 font-display text-4xl font-bold text-ink md:text-5xl">
                        Árvore de verificação
                    </h1>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-muted md:text-lg">
                        Visualize as tipificações cadastradas, suas taxonomias e os ramos usados na análise dos
                        documentos.
                    </p>
                </div>
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
                    placeholder="Pesquisar por tipificação, taxonomia ou ramo"
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

                                        <button
                                            className="relative z-10 h-full w-full rounded-md border border-line bg-input-bg p-3.5 text-left text-ink transition hover:border-brand focus-visible:border-brand"
                                            type="button"
                                            aria-haspopup="dialog"
                                            onClick={() => setTaxonomiaSelecionada(taxonomia)}
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
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}

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
                            {taxonomiaSelecionada.branches.length === 0 ? (
                                <span className="rounded-lg border border-dashed border-line p-4 text-muted">
                                    Nenhum ramo cadastrado.
                                </span>
                            ) : (
                                taxonomiaSelecionada.branches.map((ramo) => (
                                    <article className="rounded-lg border border-line bg-input-bg p-4" key={ramo.id}>
                                        <strong className="font-display text-base">{ramo.title}</strong>
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
