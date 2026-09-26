"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Check, Copy, Loader2, Mail, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { criarConviteOrientacao } from "@/app/services/convite";
import type { ConviteCriado } from "@/app/types/Convite";

type ConviteOrientandoDialogProps = {
    emailsOrientandosAtivos: string[];
    aoFechar: () => void;
};

function normalizarEmail(valor: string) {
    return valor.trim().toLocaleLowerCase("pt-BR");
}

function formatarExpiracao(valor: string) {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "Validade informada pelo backend";

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(data);
}

export default function ConviteOrientandoDialog({ emailsOrientandosAtivos, aoFechar }: ConviteOrientandoDialogProps) {
    const [email, setEmail] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [convite, setConvite] = useState<ConviteCriado | null>(null);
    const [link, setLink] = useState("");
    const [copiado, setCopiado] = useState(false);
    const [copiaManual, setCopiaManual] = useState(false);
    const dialogoRef = useRef<HTMLElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const elementoAnteriorRef = useRef<HTMLElement | null>(null);
    const emailsVinculados = useMemo(
        () => new Set(emailsOrientandosAtivos.map(normalizarEmail)),
        [emailsOrientandosAtivos]
    );

    useEffect(() => {
        elementoAnteriorRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        emailRef.current?.focus();

        function controlarTeclado(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
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

    async function criarConvite(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const emailNormalizado = normalizarEmail(email);
        if (!/^\S+@\S+\.\S+$/.test(emailNormalizado)) {
            setErro("Informe um e-mail válido para autorizar o cadastro.");
            return;
        }
        if (emailsVinculados.has(emailNormalizado)) {
            setErro("Já existe um vínculo ativo com esta conta.");
            return;
        }

        setEnviando(true);
        setErro("");
        setCopiaManual(false);
        setCopiado(false);
        const [conviteCriado, err] = await criarConviteOrientacao({
            email: emailNormalizado,
            role_type: "MAIN_ADVISOR",
        });
        setEnviando(false);

        if (err || !conviteCriado) {
            setErro(err?.message ?? "Não foi possível criar o convite.");
            return;
        }

        const url = new URL("/convite", window.location.origin);
        url.searchParams.set("token", conviteCriado.token);
        setConvite(conviteCriado);
        setLink(url.toString());
    }

    async function copiarLink() {
        if (!navigator.clipboard?.writeText) {
            setCopiaManual(true);
            return;
        }

        try {
            await navigator.clipboard.writeText(link);
            setCopiado(true);
            setCopiaManual(false);
            toast.success("Link de convite copiado.");
        } catch {
            setCopiaManual(true);
        }
    }

    return (
        <div
            className="fixed inset-0 z-80 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget && !enviando) aoFechar();
            }}
        >
            <section
                ref={dialogoRef}
                aria-describedby="descricao-convite-orientando"
                aria-labelledby="titulo-convite-orientando"
                aria-modal="true"
                className="w-full max-w-lg rounded-2xl border border-line bg-panel shadow-2xl"
                role="dialog"
            >
                <header className="flex items-start justify-between gap-4 border-b border-line p-5">
                    <div>
                        <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Novo acesso</span>
                        <h2 className="mt-1 font-display text-2xl font-bold" id="titulo-convite-orientando">Convidar orientando</h2>
                        <p className="mt-2 text-sm leading-6 text-muted" id="descricao-convite-orientando">
                            Autorize um e-mail e compartilhe o link gerado pelo canal que preferir.
                        </p>
                    </div>
                    <button
                        aria-label="Fechar convite"
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg transition hover:border-brand hover:bg-subtle-hover disabled:opacity-50"
                        disabled={enviando}
                        onClick={aoFechar}
                        type="button"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="grid gap-5 p-5">
                    {!convite ? (
                        <form className="grid gap-4" onSubmit={(evento) => void criarConvite(evento)}>
                            <label className="grid gap-2 text-sm font-semibold">
                                E-mail do orientando
                                <span className="flex h-12 items-center gap-3 rounded-lg border border-line bg-input-bg px-3 text-muted focus-within:border-brand focus-within:ring-3 focus-within:ring-focus/35">
                                    <Mail size={18} aria-hidden="true" />
                                    <input
                                        ref={emailRef}
                                        autoComplete="email"
                                        className="min-w-0 flex-1 bg-transparent text-base font-normal text-ink outline-none placeholder:text-muted"
                                        disabled={enviando}
                                        name="email-convite"
                                        onChange={(evento) => setEmail(evento.target.value)}
                                        placeholder="aluno@universidade.edu.br"
                                        type="email"
                                        value={email}
                                    />
                                </span>
                            </label>

                            {erro ? <p className="rounded-lg border border-accent/40 bg-accent/8 px-3 py-2.5 text-sm font-medium text-accent" role="alert">{erro}</p> : null}

                            <button
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-display font-semibold text-background transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={enviando}
                                type="submit"
                            >
                                {enviando ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                                {enviando ? "Autorizando…" : "Autorizar e gerar link"}
                            </button>
                        </form>
                    ) : (
                        <div className="grid gap-4">
                            <div className="rounded-xl border border-brand/30 bg-brand/8 p-4">
                                <div className="flex items-center gap-2 font-display font-bold">
                                    <Check className="text-brand" size={19} />
                                    E-mail autorizado
                                </div>
                                <p className="mt-2 break-all text-sm font-semibold">{convite.email}</p>
                                <p className="mt-1 text-xs text-muted">Válido até {formatarExpiracao(convite.expires_at)}.</p>
                            </div>

                            <label className="grid gap-2 text-sm font-semibold">
                                Link de convite
                                <input
                                    className="h-12 w-full rounded-lg border border-line bg-input-bg px-3 font-mono text-xs text-ink outline-none focus:border-brand focus:ring-3 focus:ring-focus/35"
                                    onFocus={(evento) => evento.currentTarget.select()}
                                    readOnly
                                    value={link}
                                />
                            </label>

                            {copiaManual ? (
                                <p className="rounded-lg border border-line bg-panel-soft px-3 py-2.5 text-sm text-muted" role="status">
                                    A cópia automática não está disponível. Selecione o link acima e copie manualmente.
                                </p>
                            ) : null}

                            <div className="flex flex-wrap justify-end gap-3">
                                <button className="h-10 rounded-lg border border-line bg-input-bg px-4 font-semibold transition hover:border-brand hover:bg-subtle-hover" onClick={aoFechar} type="button">
                                    Concluir
                                </button>
                                <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 font-semibold text-background transition hover:bg-brand-strong" onClick={() => void copiarLink()} type="button">
                                    {copiado ? <Check size={17} /> : <Copy size={17} />}
                                    {copiado ? "Link copiado" : "Copiar link"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
