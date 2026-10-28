"use client";

import BotaoComTitulo from "@/app/components/BotaoComTitulo";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";

import { redefinirSenhaUsuario } from "@/app/services/autenticacao";

export default function RedefinirSenhaPage() {
    return <Suspense fallback={<main className="grid min-h-dvh place-items-center text-muted">Carregando…</main>}><FormularioRedefinirSenha /></Suspense>;
}

function FormularioRedefinirSenha() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email")?.trim() ?? "";
    const token = searchParams.get("token") ?? "";
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");
    const [concluido, setConcluido] = useState(false);

    async function enviar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (enviando) return;
        if (!email || !token) {
            setErro("Este link não contém os dados necessários. Solicite uma nova recuperação de senha.");
            return;
        }
        if (novaSenha !== confirmacao) {
            setErro("A confirmação não corresponde à nova senha.");
            setNovaSenha("");
            setConfirmacao("");
            return;
        }

        setEnviando(true);
        setErro("");
        const [, err] = await redefinirSenhaUsuario({ email, token, newPassword: novaSenha });
        setNovaSenha("");
        setConfirmacao("");
        setEnviando(false);
        router.replace("/redefinir-senha", { scroll: false });
        if (err) setErro(err.message);
        else setConcluido(true);
    }

    return (
        <main className="grid min-h-dvh place-items-center bg-background px-5 py-10">
            <section className="w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-[0_18px_44px_-28px_var(--chrome-shadow)] sm:p-8">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent">LuminaIA · Conta</span>
                <h1 className="mt-3 font-display text-3xl font-bold text-ink">Criar nova senha</h1>
                {concluido ? (
                    <div className="mt-5 grid gap-4">
                        <p className="rounded-lg border border-brand/30 bg-subtle-hover p-3 text-sm leading-6" role="status">Senha redefinida. Você já pode entrar com a nova senha.</p>
                        <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-display font-semibold text-background" href="/login">Ir para o login</Link>
                    </div>
                ) : (
                    <>
                        <p className="mt-3 text-sm leading-6 text-muted">Escolha uma senha nova para sua conta.</p>
                        <form className="mt-6 grid gap-4" onSubmit={(event) => void enviar(event)}>
                            <label className="grid gap-2 text-sm font-semibold text-ink">Nova senha<input className="h-11 rounded-lg border border-line bg-input-bg px-3 font-normal outline-none focus:border-brand" type="password" autoComplete="new-password" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} required disabled={enviando} /></label>
                            <label className="grid gap-2 text-sm font-semibold text-ink">Confirmar nova senha<input className="h-11 rounded-lg border border-line bg-input-bg px-3 font-normal outline-none focus:border-brand" type="password" autoComplete="new-password" value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} required disabled={enviando} /></label>
                            {erro ? <p className="rounded-lg border border-accent/40 bg-accent/8 p-3 text-sm text-accent" role="alert">{erro}</p> : null}
                            <BotaoComTitulo className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-display font-semibold text-background disabled:opacity-60" type="submit" disabled={enviando}>
                                {enviando ? <Loader2 className="animate-spin" size={17} /> : <KeyRound size={17} />}{enviando ? "Salvando…" : "Redefinir senha"}
                            </BotaoComTitulo>
                        </form>
                    </>
                )}
                <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline" href="/login"><ArrowLeft size={16} /> Voltar para entrar</Link>
            </section>
        </main>
    );
}
