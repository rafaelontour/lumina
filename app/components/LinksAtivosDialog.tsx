"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CalendarClock, Check, Copy, Link2, Loader2, Mail, RefreshCw, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { cancelarConvite, listarConvitesAtivos } from "@/app/services/convite";
import type { ConviteCriado } from "@/app/types/Convite";

type LinksAtivosDialogProps = {
    orientadorId: string;
    aoFechar: () => void;
};

function formatarExpiracao(valor: string) {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "Validade não informada";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(data);
}

function criarLink(codigo: string) {
    const url = new URL("/convite", window.location.origin);
    url.searchParams.set("token", codigo);
    return url.toString();
}

function conviteEstaAtivo(convite: ConviteCriado, orientadorId: string) {
    const expiracao = new Date(convite.expires_at).getTime();
    return convite.inviter_id === orientadorId
        && convite.status === "PENDING"
        && Number.isFinite(expiracao)
        && expiracao > Date.now()
        && Boolean(convite.token.trim());
}

export default function LinksAtivosDialog({ orientadorId, aoFechar }: LinksAtivosDialogProps) {
    const [convites, setConvites] = useState<ConviteCriado[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState("");
    const [excluindoId, setExcluindoId] = useState<string | null>(null);
    const [copiadoId, setCopiadoId] = useState<string | null>(null);
    const [copiaManualId, setCopiaManualId] = useState<string | null>(null);
    const dialogoRef = useRef<HTMLElement>(null);
    const fecharRef = useRef<HTMLButtonElement>(null);
    const elementoAnteriorRef = useRef<HTMLElement | null>(null);
    const excluindoRef = useRef<string | null>(null);

    useEffect(() => {
        excluindoRef.current = excluindoId;
    }, [excluindoId]);

    const carregar = useCallback(async () => {
        setAtualizando(!carregando);
        setErro("");
        const [retornados, err] = await listarConvitesAtivos(orientadorId);
        if (err) {
            setErro(err.message);
        } else {
            setConvites(
                retornados
                    .filter((convite) => conviteEstaAtivo(convite, orientadorId))
                    .sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime())
            );
        }
        setCarregando(false);
        setAtualizando(false);
    }, [carregando, orientadorId]);

    useEffect(() => {
        void Promise.resolve().then(carregar);
        // A primeira carga ocorre somente quando o diálogo é aberto.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        elementoAnteriorRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        fecharRef.current?.focus();

        function controlarTeclado(evento: KeyboardEvent) {
            if (evento.key === "Escape" && !excluindoRef.current) {
                evento.preventDefault();
                aoFechar();
                return;
            }
            if (evento.key !== "Tab") return;

            const elementos = dialogoRef.current?.querySelectorAll<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
            );
            if (!elementos?.length) return;
            const primeiro = elementos[0];
            const ultimo = elementos[elementos.length - 1];
            if (evento.shiftKey && document.activeElement === primeiro) {
                evento.preventDefault();
                ultimo.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault();
                primeiro.focus();
            }
        }

        window.addEventListener("keydown", controlarTeclado);
        return () => {
            window.removeEventListener("keydown", controlarTeclado);
            elementoAnteriorRef.current?.focus();
        };
    }, [aoFechar]);

    async function copiar(convite: ConviteCriado) {
        const link = criarLink(convite.token);
        if (!navigator.clipboard?.writeText) {
            setCopiaManualId(convite.id);
            return;
        }

        try {
            await navigator.clipboard.writeText(link);
            setCopiadoId(convite.id);
            setCopiaManualId(null);
            toast.success("Link de convite copiado.");
        } catch {
            setCopiaManualId(convite.id);
        }
    }

    async function excluir(convite: ConviteCriado) {
        const confirmou = window.confirm(`Excluir o link destinado a ${convite.email}? Ele deixará de funcionar imediatamente.`);
        if (!confirmou) return;

        setExcluindoId(convite.id);
        setErro("");
        const [, err] = await cancelarConvite(convite.id);
        setExcluindoId(null);
        if (err) {
            setErro(err.message);
            return;
        }

        setConvites((atuais) => atuais.filter((item) => item.id !== convite.id));
        toast.success("Link de convite excluído.");
    }

    return (
        <div
            className="fixed inset-0 z-80 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget && !excluindoId) aoFechar();
            }}
        >
            <section
                ref={dialogoRef}
                aria-describedby="descricao-links-ativos"
                aria-labelledby="titulo-links-ativos"
                aria-modal="true"
                className="grid max-h-[min(46rem,calc(100dvh-2rem))] w-full max-w-3xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl"
                role="dialog"
            >
                <header className="flex items-start justify-between gap-4 border-b border-line p-5">
                    <div>
                        <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Convites pendentes</span>
                        <h2 className="mt-1 font-display text-2xl font-bold" id="titulo-links-ativos">Links ativos</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted" id="descricao-links-ativos">
                            Links já utilizados deixam automaticamente esta lista. Você também pode excluir um link antes do uso.
                        </p>
                    </div>
                    <button
                        ref={fecharRef}
                        aria-label="Fechar links ativos"
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg transition hover:border-brand hover:bg-subtle-hover disabled:opacity-50"
                        disabled={Boolean(excluindoId)}
                        onClick={aoFechar}
                        type="button"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="min-h-0 overflow-y-auto p-5">
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-panel-soft px-4 py-3">
                        <p className="text-sm text-muted">Somente convites pendentes e dentro da validade são exibidos.</p>
                        <button
                            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 text-sm font-semibold transition hover:border-brand hover:bg-subtle-hover disabled:opacity-55"
                            disabled={carregando || atualizando || Boolean(excluindoId)}
                            onClick={() => void carregar()}
                            type="button"
                        >
                            <RefreshCw className={atualizando ? "animate-spin" : ""} size={16} />
                            Atualizar
                        </button>
                    </div>

                    {erro ? (
                        <div className="mb-4 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/8 p-4 text-sm text-accent" role="alert">
                            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                            <p>{erro}</p>
                        </div>
                    ) : null}

                    {carregando ? (
                        <div className="grid min-h-48 place-items-center text-center text-muted">
                            <div className="grid justify-items-center gap-3"><Loader2 className="animate-spin text-brand" size={30} /><p>Carregando links ativos…</p></div>
                        </div>
                    ) : convites.length === 0 ? (
                        <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-line p-6 text-center">
                            <div><Link2 className="mx-auto text-muted" size={32} /><h3 className="mt-3 font-display text-lg font-bold">Nenhum link ativo</h3><p className="mt-2 text-sm text-muted">Crie um novo convite para autorizar o cadastro de um orientando.</p></div>
                        </div>
                    ) : (
                        <ul
                            className="grid max-h-[min(24rem,48dvh)] gap-4 overflow-y-auto overscroll-contain pr-2"
                            aria-label="Links de convite ativos"
                        >
                            {convites.map((convite) => {
                                const link = criarLink(convite.token);
                                const excluindo = excluindoId === convite.id;
                                return (
                                    <li className="rounded-xl border border-line bg-input-bg p-4" key={convite.id}>
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="flex items-center gap-2 break-all font-display font-bold"><Mail className="shrink-0 text-brand" size={17} />{convite.email}</p>
                                                <p className="mt-2 flex items-center gap-2 text-xs text-muted"><CalendarClock size={15} />Válido até {formatarExpiracao(convite.expires_at)}</p>
                                            </div>
                                            <button
                                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-accent/35 px-3 text-sm font-semibold text-accent transition hover:bg-accent/8 disabled:opacity-55"
                                                disabled={Boolean(excluindoId)}
                                                onClick={() => void excluir(convite)}
                                                type="button"
                                            >
                                                {excluindo ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                                {excluindo ? "Excluindo…" : "Excluir link"}
                                            </button>
                                        </div>

                                        <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                                            <input className="h-10 min-w-0 rounded-lg border border-line bg-panel px-3 font-mono text-xs text-ink outline-none focus:border-brand focus:ring-3 focus:ring-focus/35" onFocus={(evento) => evento.currentTarget.select()} readOnly value={link} />
                                            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-background transition hover:bg-brand-strong" onClick={() => void copiar(convite)} type="button">
                                                {copiadoId === convite.id ? <Check size={16} /> : <Copy size={16} />}
                                                {copiadoId === convite.id ? "Copiado" : "Copiar"}
                                            </button>
                                        </div>
                                        {copiaManualId === convite.id ? <p className="mt-2 text-xs text-muted" role="status">A cópia automática falhou. Selecione o link e copie manualmente.</p> : null}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}
