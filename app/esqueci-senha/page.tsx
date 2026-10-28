"use client";

import BotaoComTitulo from "@/app/components/BotaoComTitulo";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

import { solicitarRecuperacaoSenha } from "@/app/services/autenticacao";

export default function EsqueciSenhaPage() {
    const [email, setEmail] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    async function enviar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (enviando) return;
        setEnviando(true);
        setMensagem("");
        await solicitarRecuperacaoSenha(email.trim());
        setMensagem("Se este e-mail estiver associado a uma conta, você receberá instruções para redefinir a senha.");
        setEnviando(false);
    }

    return (
        <main className="grid min-h-dvh place-items-center bg-background px-5 py-10">
            <section className="w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-[0_18px_44px_-28px_var(--chrome-shadow)] sm:p-8">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">LuminaIA · Conta</span>
                <h1 className="mt-3 font-display text-3xl font-bold text-ink">Esqueci minha senha</h1>
                <p className="mt-3 text-sm leading-6 text-muted">Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos instruções para criar uma nova senha.</p>
                <form className="mt-6 grid gap-4" onSubmit={(event) => void enviar(event)}>
                    <label className="grid gap-2 text-sm font-semibold text-ink">E-mail
                        <span className="flex h-11 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 focus-within:border-brand">
                            <Mail className="shrink-0 text-muted" size={17} />
                            <input className="min-w-0 flex-1 bg-transparent font-normal outline-none" autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={enviando} />
                        </span>
                    </label>
                    {mensagem ? <p className="rounded-lg border border-brand/30 bg-subtle-hover p-3 text-sm leading-6 text-ink" role="status">{mensagem}</p> : null}
                    <BotaoComTitulo className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-display font-semibold text-background disabled:opacity-60" type="submit" disabled={enviando}>
                        {enviando ? <Loader2 className="animate-spin" size={17} /> : <Mail size={17} />}{enviando ? "Enviando…" : "Enviar instruções"}
                    </BotaoComTitulo>
                </form>
                <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline" href="/login"><ArrowLeft size={16} /> Voltar para entrar</Link>
            </section>
        </main>
    );
}
