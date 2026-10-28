"use client";

import BotaoComTitulo from "@/app/components/BotaoComTitulo";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, BookOpen, Check, ExternalLink, FileText, Loader2, Plus, RefreshCw, Trash2, X } from "lucide-react";

import { listarTipificacoes } from "@/app/services/tipificacao";
import { listarGruposDocumento } from "@/app/services/documento";
import {
    atualizarAnexoEstudo,
    criarAnexoEstudo,
    desmarcarAnexoEstudado,
    excluirAnexoEstudo,
    listarAnexosEstudo,
    marcarAnexoEstudado,
    obterGuiaEstudo,
    reordenarAnexosEstudo,
    reordenarItensGrupo,
} from "@/app/services/guiaEstudo";
import type { GrupoDocumento } from "@/app/types/Documento";
import type { AnexoEstudo, AnexoEstudoEdicao, AnexoEstudoEntrada, GuiaEstudo, TipoAnexoEstudo } from "@/app/types/GuiaEstudo";
import type { Tipificacao } from "@/app/types/Tipificacao";

type Props = {
    projectId: string;
    projectOwnerId?: string | null;
    currentUserId?: string;
    group?: GrupoDocumento | null;
    readOnly?: boolean;
    canManageGroup?: boolean;
};

type Draft = {
    kind: TipoAnexoEstudo;
    description: string;
    title: string;
    typificationId: string;
    doi: string;
    url: string;
};

const draftInicial: Draft = { kind: "TYPIFICATION", description: "", title: "", typificationId: "", doi: "", url: "" };

function nomeAnexo(anexo: AnexoEstudo) {
    if (anexo.kind === "TYPIFICATION") return anexo.typification?.name ?? anexo.title ?? "Tipificação indisponível";
    return anexo.title?.trim() || anexo.doi || anexo.url || "Material sem título";
}

function dataEstudo(value?: string | null) {
    if (!value) return "";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(parsed);
}

function linkAnexo(anexo: AnexoEstudo) {
    if (anexo.kind === "DOI") return anexo.doi_url ?? (anexo.doi ? `https://doi.org/${anexo.doi}` : null);
    if (anexo.kind === "LINK") return anexo.url ?? null;
    return null;
}

export default function StudyGuideWorkspace({ projectId, projectOwnerId, currentUserId, group, readOnly = false, canManageGroup = false }: Readonly<Props>) {
    const [aberto, setAberto] = useState(false);
    const [guia, setGuia] = useState<GuiaEstudo | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [mutacao, setMutacao] = useState<string | null>(null);
    const [gerenciadorAberto, setGerenciadorAberto] = useState(false);
    const donoProjeto = Boolean(projectOwnerId && currentUserId && projectOwnerId === currentUserId);

    const carregarGuia = useCallback(async () => {
        setCarregando(true);
        setErro("");
        const [resultado, err] = await obterGuiaEstudo(projectId);
        if (err || !resultado) setErro(err?.message ?? "A API não retornou o guia de estudo.");
        else setGuia(resultado);
        setCarregando(false);
    }, [projectId]);

    async function alternarEstudo(anexo: AnexoEstudo) {
        if (!donoProjeto || mutacao) return;
        setMutacao(anexo.id);
        const [resultado, err] = anexo.studied
            ? await desmarcarAnexoEstudado(projectId, anexo.id)
            : await marcarAnexoEstudado(projectId, anexo.id);
        if (err || !resultado) {
            toast.error(err?.message ?? "Não foi possível atualizar o progresso.");
            await carregarGuia();
        } else setGuia(resultado);
        setMutacao(null);
    }

    return (
        <>
            <article className="mt-4 rounded-lg border border-brand/35 bg-brand/8 p-4 shadow-[0_16px_32px_-26px_var(--brand)]">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="flex items-center gap-2 font-display text-lg font-bold"><BookOpen className="text-accent" size={19} /> Guia de estudo</h3>
                        <p className="mt-1 text-sm text-muted">Materiais compartilhados pelos projetos do mesmo grupo documental.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <BotaoComTitulo className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-semibold hover:border-brand" type="button" onClick={() => { const abrir = !aberto; setAberto(abrir); if (abrir && !guia && !carregando) void carregarGuia(); }}>
                            {aberto ? <X size={16} /> : <BookOpen size={16} />}{aberto ? "Fechar guia" : "Abrir guia"}
                        </BotaoComTitulo>
                        {group && canManageGroup ? <BotaoComTitulo className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3 text-sm font-semibold text-background" type="button" onClick={() => setGerenciadorAberto(true)}><Plus size={16} /> Materiais do grupo</BotaoComTitulo> : null}
                    </div>
                </header>
                {aberto ? (
                    <div className="mt-4 border-t border-brand/25 pt-4">
                        {carregando ? <div className="flex items-center gap-2 py-6 text-sm text-muted" role="status"><Loader2 className="animate-spin" size={17} /> Carregando guia…</div> : erro ? (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/30 p-3 text-sm text-accent" role="alert"><span>{erro}</span><BotaoComTitulo className="inline-flex h-8 items-center gap-2 rounded border border-current px-2" type="button" onClick={() => void carregarGuia()}><RefreshCw size={15} /> Tentar novamente</BotaoComTitulo></div>
                        ) : guia ? (
                            <GuiaConteudo guia={guia} podeMarcar={!readOnly && donoProjeto} mutacao={mutacao} aoAlternar={(anexo) => void alternarEstudo(anexo)} />
                        ) : null}
                    </div>
                ) : null}
            </article>
            {gerenciadorAberto && group ? <GerenciadorMateriais group={group} aoFechar={() => { setGerenciadorAberto(false); setGuia(null); if (aberto) void carregarGuia(); }} /> : null}
        </>
    );
}

function GuiaConteudo({ guia, podeMarcar, mutacao, aoAlternar }: { guia: GuiaEstudo; podeMarcar: boolean; mutacao: string | null; aoAlternar: (anexo: AnexoEstudo) => void }) {
    if (!guia.document_group) return <div className="rounded-lg border border-dashed border-line bg-panel p-5 text-sm text-muted">Este projeto ainda não tem um grupo de documentos. Progresso: 0 de 0 estudados.</div>;

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel p-3">
                <span className="text-sm text-muted">Grupo: <strong className="text-ink">{guia.document_group.name}</strong></span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">{guia.studied_attachments} de {guia.total_attachments} estudados</span>
            </div>
            {guia.items.map((item) => <EtapaGuia key={item.id} item={item} podeMarcar={podeMarcar} mutacao={mutacao} aoAlternar={aoAlternar} />)}
        </div>
    );
}

function EtapaGuia({ item, podeMarcar, mutacao, aoAlternar }: { item: GuiaEstudo["items"][number]; podeMarcar: boolean; mutacao: string | null; aoAlternar: (anexo: AnexoEstudo) => void }) {
    return (
        <section className="rounded-lg border border-line bg-panel p-4">
            <h4 className="font-display text-base font-bold">{item.position}. {item.name}</h4>
            {item.attachments.length === 0 ? <p className="mt-2 rounded-md bg-input-bg p-3 text-sm text-muted">Ainda não há material indicado para esta etapa.</p> : (
                <ul className="mt-3 grid gap-2">
                    {item.attachments.map((anexo) => {
                        const href = linkAnexo(anexo);
                        const typification = anexo.kind === "TYPIFICATION";
                        return (
                            <li className="grid gap-3 rounded-lg border border-line bg-input-bg p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start" key={anexo.id}>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[0.68rem] font-bold uppercase text-brand">{anexo.kind === "TYPIFICATION" ? "Tipificação" : anexo.kind === "DOI" ? "Artigo · DOI" : "Link"}</span>
                                        {href ? <a className="inline-flex min-w-0 items-center gap-1 font-display font-semibold text-brand underline-offset-4 hover:underline" href={href} target="_blank" rel="noreferrer"><span className="break-words">{nomeAnexo(anexo)}</span><ExternalLink size={14} /></a> : typification ? <Link className="font-display font-semibold text-brand underline-offset-4 hover:underline" href="/tipificacoes">{nomeAnexo(anexo)}</Link> : <strong className="break-words font-display">{nomeAnexo(anexo)}</strong>}
                                    </div>
                                    {anexo.description ? <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted">{anexo.description}</p> : null}
                                    {anexo.kind === "DOI" && (anexo.authors.length || anexo.year || anexo.container_title) ? <p className="mt-1 text-xs leading-5 text-muted">{[anexo.authors.join(", "), anexo.year, anexo.container_title].filter(Boolean).join(" · ")}</p> : null}
                                    {anexo.kind === "DOI" && anexo.metadata_source === "MANUAL" ? <p className="mt-1 text-xs text-muted">Os metadados não foram localizados automaticamente.</p> : null}
                                </div>
                                {podeMarcar ? <label className="flex items-center gap-2 text-sm font-semibold text-ink"><input className="size-4 accent-[var(--accent)]" type="checkbox" checked={Boolean(anexo.studied)} disabled={mutacao !== null} onChange={() => aoAlternar(anexo)} />{mutacao === anexo.id ? <Loader2 className="animate-spin" size={15} /> : <Check size={15} />}{anexo.studied ? `Estudado${dataEstudo(anexo.studied_at) ? ` · ${dataEstudo(anexo.studied_at)}` : ""}` : "Estudado"}</label> : anexo.studied ? <span className="text-xs font-semibold text-muted">Estudado{dataEstudo(anexo.studied_at) ? ` em ${dataEstudo(anexo.studied_at)}` : ""}</span> : null}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

function GerenciadorMateriais({ group, aoFechar }: { group: GrupoDocumento; aoFechar: () => void }) {
    const [items, setItems] = useState(() => [...group.items].sort((a, b) => a.position - b.position));
    const [attachments, setAttachments] = useState<Record<string, AnexoEstudo[]>>({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [activeItemId, setActiveItemId] = useState(group.items[0]?.id ?? "");
    const [draft, setDraft] = useState<Draft>(draftInicial);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [typifications, setTypifications] = useState<Tipificacao[]>([]);
    const [typificationError, setTypificationError] = useState("");
    const [busy, setBusy] = useState(false);

    const consultarAnexos = useCallback(() => Promise.all(group.items.map(async (item) => {
            const [list, err] = await listarAnexosEstudo(item.id);
            if (err) return { itemId: item.id, list: [] as AnexoEstudo[], error: err.message };
            return { itemId: item.id, list, error: "" };
        })), [group.items]);

    const aplicarAnexos = useCallback((result: Awaited<ReturnType<typeof consultarAnexos>>) => {
        setAttachments(Object.fromEntries(result.map(({ itemId, list }) => [itemId, list])));
        const failure = result.find((entry) => entry.error);
        setLoadError(failure?.error ?? "");
        if (failure) {
            toast.error(failure.error);
        }
        setLoading(false);
    }, []);

    const loadAttachments = useCallback(async () => {
        aplicarAnexos(await consultarAnexos());
    }, [aplicarAnexos, consultarAnexos]);

    useEffect(() => {
        let active = true;
        void consultarAnexos().then((result) => {
            if (active) aplicarAnexos(result);
        });
        return () => { active = false; };
    }, [aplicarAnexos, consultarAnexos]);

    async function recarregarAnexos() {
        setLoading(true);
        await loadAttachments();
    }
    useEffect(() => {
        if (draft.kind !== "TYPIFICATION") return;
        let active = true;
        void listarTipificacoes().then(([itemsResult, err]) => {
            if (!active) return;
            setTypifications(itemsResult);
            setTypificationError(err?.message ?? "");
        });
        return () => { active = false; };
    }, [draft.kind]);

    const activeItem = items.find((item) => item.id === activeItemId) ?? items[0];
    const activeAttachments = attachments[activeItem?.id ?? ""] ?? [];

    function beginEdit(anexo: AnexoEstudo) {
        setEditingId(anexo.id);
        setDraft({
            kind: anexo.kind,
            description: anexo.description ?? "",
            title: anexo.title ?? "",
            typificationId: anexo.typification?.id ?? "",
            doi: anexo.doi ?? "",
            url: anexo.url ?? "",
        });
    }

    function resetForm() { setDraft(draftInicial); setEditingId(null); }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!activeItem || busy) return;
        const input: AnexoEstudoEntrada = { kind: draft.kind, description: draft.description.trim() || null };
        if (draft.kind === "TYPIFICATION") {
            if (!draft.typificationId) return toast.error("Selecione uma tipificação.");
            input.typification_id = draft.typificationId;
        } else if (draft.kind === "DOI") {
            if (!draft.doi.trim()) return toast.error("Informe o DOI do artigo.");
            input.doi = draft.doi.trim();
            input.title = draft.title.trim() || null;
        } else {
            if (!draft.url.trim() || !draft.title.trim()) return toast.error("Informe o título e o link externo.");
            input.url = draft.url.trim();
            input.title = draft.title.trim();
        }

        setBusy(true);
        const [saved, err] = editingId
            ? await atualizarAnexoEstudo({ ...input, id: editingId } as AnexoEstudoEdicao)
            : await criarAnexoEstudo(activeItem.id, input);
        if (err || !saved) {
            toast.error(err?.message ?? "A API não confirmou o material.");
            setBusy(false);
            return;
        }
        setAttachments((current) => {
            const list = current[activeItem.id] ?? [];
            const next = editingId ? list.map((item) => item.id === saved.id ? saved : item) : [...list, saved];
            return { ...current, [activeItem.id]: next.sort((a, b) => a.position - b.position) };
        });
        if (draft.kind === "DOI" && saved.metadata_source === "MANUAL") toast.message("Material salvo, mas não encontramos metadados no Crossref. Você pode completar o título.");
        else toast.success(editingId ? "Material atualizado." : "Material adicionado.");
        resetForm();
        setBusy(false);
    }

    async function moverAnexo(index: number, delta: -1 | 1) {
        if (!activeItem) return;
        const next = [...activeAttachments];
        const target = index + delta;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        setLoadingId(activeItem.id);
        const [ordered, err] = await reordenarAnexosEstudo(activeItem.id, next.map((item) => item.id));
        setLoadingId(null);
        if (err || !ordered) { toast.error(err?.message ?? "Não foi possível reordenar."); await recarregarAnexos(); }
        else setAttachments((current) => ({ ...current, [activeItem.id]: ordered }));
    }

    async function remover(anexo: AnexoEstudo) {
        if (!window.confirm(`Excluir “${nomeAnexo(anexo)}” deste grupo? O material deixará de aparecer nos projetos que usam o grupo.`)) return;
        setLoadingId(anexo.id);
        const [, err] = await excluirAnexoEstudo(anexo.id);
        setLoadingId(null);
        if (err) { toast.error(err.message); await recarregarAnexos(); return; }
        setAttachments((current) => ({ ...current, [activeItem!.id]: (current[activeItem!.id] ?? []).filter((item) => item.id !== anexo.id) }));
        if (editingId === anexo.id) resetForm();
        toast.success("Material excluído.");
    }

    async function moverEtapa(index: number, delta: -1 | 1) {
        const next = [...items];
        const target = index + delta;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        setBusy(true);
        const [result, err] = await reordenarItensGrupo(group.id, next.map((item) => item.id));
        setBusy(false);
        if (err || !result) {
            toast.error(err?.message ?? "Não foi possível reordenar as etapas.");
            const [groups, groupsErr] = await listarGruposDocumento();
            const canonicalGroup = groups?.find((item) => item.id === group.id);
            if (!groupsErr && canonicalGroup) {
                setItems([...canonicalGroup.items].sort((a, b) => a.position - b.position));
            }
            return;
        }
        setItems([...result.items].sort((a, b) => a.position - b.position));
    }

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) aoFechar(); }}>
            <section aria-labelledby="titulo-gerenciador-guia" aria-modal="true" className="grid max-h-[94dvh] w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl" role="dialog">
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-4 sm:p-6">
                    <div><span className="text-xs font-bold uppercase tracking-[0.15em] text-accent">Guia compartilhado do grupo</span><h2 className="mt-1 font-display text-2xl font-bold" id="titulo-gerenciador-guia">{group.name}</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-muted">Alterações nas etapas e materiais são compartilhadas por todos os projetos deste grupo.</p></div>
                    <BotaoComTitulo className="grid size-10 place-items-center rounded-lg border border-line hover:border-accent" type="button" aria-label="Fechar gerenciador" onClick={aoFechar}><X size={18} /></BotaoComTitulo>
                </header>
                <div className="grid min-h-0 overflow-y-auto lg:grid-cols-[minmax(15rem,0.35fr)_minmax(0,1fr)] lg:overflow-hidden">
                    <nav aria-label="Etapas do grupo" className="grid content-start gap-2 border-b border-line p-4 lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-b-0">
                        {items.length === 0 ? <p className="text-sm text-muted">Este grupo não tem etapas ativas.</p> : items.map((item, index) => (
                            <div className={`flex items-center gap-1 rounded-lg border p-1 ${activeItem?.id === item.id ? "border-brand bg-subtle-hover" : "border-line bg-input-bg"}`} key={item.id}>
                                <BotaoComTitulo className="min-w-0 flex-1 px-2 py-2 text-left text-sm font-semibold" type="button" onClick={() => { setActiveItemId(item.id); resetForm(); }}><span className="mr-1 text-muted">{item.position}.</span>{item.name}</BotaoComTitulo>
                                <BotaoComTitulo className="grid size-8 shrink-0 place-items-center rounded hover:bg-panel disabled:opacity-35" type="button" aria-label={`Mover ${item.name} para cima`} disabled={index === 0 || busy} onClick={() => void moverEtapa(index, -1)}><ArrowUp size={15} /></BotaoComTitulo>
                                <BotaoComTitulo className="grid size-8 shrink-0 place-items-center rounded hover:bg-panel disabled:opacity-35" type="button" aria-label={`Mover ${item.name} para baixo`} disabled={index === items.length - 1 || busy} onClick={() => void moverEtapa(index, 1)}><ArrowDown size={15} /></BotaoComTitulo>
                            </div>
                        ))}
                    </nav>
                    <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
                        {!activeItem ? <p className="text-sm text-muted">Selecione uma etapa para configurar materiais.</p> : <>
                            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-display text-xl font-bold">{activeItem.position}. {activeItem.name}</h3>{loading || loadingId ? <span className="inline-flex items-center gap-2 text-xs text-muted"><Loader2 className="animate-spin" size={15} />Atualizando</span> : null}</div>
                            {loading ? <p className="mt-4 text-sm text-muted">Carregando materiais…</p> : loadError ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/30 p-4 text-sm text-accent" role="alert"><span>{loadError}</span><BotaoComTitulo className="inline-flex h-9 items-center gap-2 rounded border border-current px-3" type="button" onClick={() => void recarregarAnexos()}><RefreshCw size={15} /> Tentar novamente</BotaoComTitulo></div> : activeAttachments.length === 0 ? <p className="mt-3 rounded-lg border border-dashed border-line p-4 text-sm text-muted">Nenhum material indicado para esta etapa.</p> : (
                                <ol className="mt-3 grid gap-2">
                                    {activeAttachments.map((item, index) => <li className="flex min-w-0 items-start gap-2 rounded-lg border border-line bg-input-bg p-3" key={item.id}>
                                        <span className="mt-0.5 text-xs font-bold text-muted">{item.position}.</span><div className="min-w-0 flex-1"><strong className="block break-words text-sm">{nomeAnexo(item)}</strong><span className="mt-0.5 block text-xs text-muted">{item.kind === "DOI" ? [item.doi, item.year, item.container_title].filter(Boolean).join(" · ") : item.kind === "LINK" ? item.url : "Tipificação"}</span>{item.description ? <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{item.description}</p> : null}{item.kind === "DOI" && item.metadata_source === "MANUAL" ? <p className="mt-1 text-xs text-accent">Metadados do Crossref não encontrados; preencha o título, se souber.</p> : null}</div>
                                        <div className="flex shrink-0 gap-1"><BotaoComTitulo className="grid size-8 place-items-center rounded border border-line hover:border-brand disabled:opacity-35" type="button" aria-label={`Mover ${nomeAnexo(item)} para cima`} disabled={index === 0 || Boolean(loadingId)} onClick={() => void moverAnexo(index, -1)}><ArrowUp size={15} /></BotaoComTitulo><BotaoComTitulo className="grid size-8 place-items-center rounded border border-line hover:border-brand disabled:opacity-35" type="button" aria-label={`Mover ${nomeAnexo(item)} para baixo`} disabled={index === activeAttachments.length - 1 || Boolean(loadingId)} onClick={() => void moverAnexo(index, 1)}><ArrowDown size={15} /></BotaoComTitulo><BotaoComTitulo className="grid size-8 place-items-center rounded border border-line hover:border-brand" type="button" aria-label={`Editar ${nomeAnexo(item)}`} onClick={() => beginEdit(item)}><FileText size={15} /></BotaoComTitulo><BotaoComTitulo className="grid size-8 place-items-center rounded border border-line text-accent hover:border-accent" type="button" aria-label={`Excluir ${nomeAnexo(item)}`} disabled={loadingId === item.id} onClick={() => void remover(item)}><Trash2 size={15} /></BotaoComTitulo></div>
                                    </li>)}
                                </ol>
                            )}
                            <form className="mt-5 grid gap-3 rounded-xl border border-line bg-panel p-4" onSubmit={(event) => void salvar(event)}>
                                <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-display font-bold">{editingId ? "Editar material" : "Adicionar material"}</h4>{editingId ? <span className="rounded-full border border-line px-2 py-1 text-xs text-muted">Tipo fixo: {draft.kind}</span> : null}</div>
                                {!editingId ? <label className="grid gap-1 text-sm font-semibold">Tipo de material<select className="h-10 rounded-lg border border-line bg-input-bg px-3 font-normal" value={draft.kind} onChange={(event) => setDraft({ ...draftInicial, kind: event.target.value as TipoAnexoEstudo, description: draft.description })}><option value="TYPIFICATION">Tipificação</option><option value="DOI">Artigo por DOI</option><option value="LINK">Livro, capítulo ou outro link</option></select></label> : null}
                                {draft.kind === "TYPIFICATION" ? <div className="grid gap-2">{typificationError ? <p className="text-xs text-accent">{typificationError}</p> : null}<label className="grid gap-1 text-sm font-semibold">Tipificação<select className="h-10 rounded-lg border border-line bg-input-bg px-3 font-normal" value={draft.typificationId} onChange={(event) => setDraft((current) => ({ ...current, typificationId: event.target.value }))}><option value="">Selecione</option>{typifications.length === 0 ? <option value="" disabled>Nenhuma tipificação disponível</option> : typifications.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div> : null}
                                {draft.kind === "DOI" ? <><label className="grid gap-1 text-sm font-semibold">DOI<input className="h-10 rounded-lg border border-line bg-input-bg px-3 font-normal" value={draft.doi} onChange={(event) => setDraft((current) => ({ ...current, doi: event.target.value }))} placeholder="https://doi.org/10..." required /></label><label className="grid gap-1 text-sm font-semibold">Título (opcional)<input className="h-10 rounded-lg border border-line bg-input-bg px-3 font-normal" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label><p className="text-xs leading-5 text-muted">O backend consulta o Crossref ao salvar; essa etapa pode levar alguns segundos.</p></> : null}
                                {draft.kind === "LINK" ? <><label className="grid gap-1 text-sm font-semibold">Título<input className="h-10 rounded-lg border border-line bg-input-bg px-3 font-normal" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} required /></label><label className="grid gap-1 text-sm font-semibold">Link externo<input className="h-10 rounded-lg border border-line bg-input-bg px-3 font-normal" type="url" value={draft.url} onChange={(event) => setDraft((current) => ({ ...current, url: event.target.value }))} placeholder="https://…" required /></label></> : null}
                                <label className="grid gap-1 text-sm font-semibold">O que o aluno deve fazer?<textarea className="min-h-20 rounded-lg border border-line bg-input-bg p-3 font-normal" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Descrição ou orientação (opcional)" /></label>
                                <div className="flex flex-wrap justify-end gap-2">{editingId ? <BotaoComTitulo className="h-10 rounded-lg border border-line px-3 text-sm font-semibold" type="button" disabled={busy} onClick={resetForm}>Cancelar</BotaoComTitulo> : null}<BotaoComTitulo className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-background disabled:opacity-55" type="submit" disabled={busy || loading}><Plus size={16} />{busy ? "Salvando…" : editingId ? "Salvar alterações" : "Adicionar material"}</BotaoComTitulo></div>
                            </form>
                        </>}
                    </div>
                </div>
            </section>
        </div>
    );
}
