"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import GoogleGeminiEffect from "@/app/components/GoogleGeminiEffect";
import { useAuth } from "@/app/data/provider/AuthProvider";
import { aceitarConvite, consultarConvite } from "@/app/services/convite";
import type { ConvitePublico } from "@/app/types/Convite";
import logoBranco from "@/public/lumina_branco.png";
import logoLaranja from "@/public/lumina_laranja.png";

export default function LoginPage() {
    return (
        <Suspense fallback={<TelaCarregandoLogin />}>
            <ConteudoLogin />
        </Suspense>
    );
}

function ConteudoLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const codigoConvite = searchParams.get("convite")?.trim() ?? "";
    const reduzirMovimento = useReducedMotion();
    const { encerrarSessao, estado, iniciarSessao, restaurarSessao, usuario } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [convite, setConvite] = useState<ConvitePublico | null>(null);
    const [avisoConvite, setAvisoConvite] = useState("");
    const aceitandoConvite = useRef(false);

    useEffect(() => {
        const codigo = codigoConvite;
        if (!codigo) return;

        let ativo = true;
        void consultarConvite(codigo).then(([conviteAtual, err]) => {
            if (!ativo) return;
            if (err || !conviteAtual || !conviteAtual.is_valid || conviteAtual.is_expired || conviteAtual.status !== "PENDING") {
                setAvisoConvite("Este convite não está mais disponível. Você ainda pode entrar normalmente.");
                return;
            }
            if (!conviteAtual.user_exists) {
                setAvisoConvite("Este e-mail ainda não possui conta. Crie sua conta para aceitar o convite.");
            }
            setConvite(conviteAtual);
        });

        return () => {
            ativo = false;
        };
    }, [codigoConvite]);

    useEffect(() => {
        if (estado === "autenticado" && codigoConvite === "") router.replace("/");
    }, [codigoConvite, estado, router]);

    useEffect(() => {
        if (
            estado !== "autenticado" ||
            !usuario ||
            !codigoConvite ||
            !convite?.user_exists ||
            aceitandoConvite.current
        ) return;

        aceitandoConvite.current = true;
        void (async () => {
            if (usuario.email.trim().toLocaleLowerCase("pt-BR") !== convite.email.trim().toLocaleLowerCase("pt-BR")) {
                await encerrarSessao();
                setErro(`Entre com a conta associada a ${convite.email}.`);
                aceitandoConvite.current = false;
                return;
            }

            const [, err] = await aceitarConvite(codigoConvite);
            if (err) {
                setErro(err.message);
                aceitandoConvite.current = false;
                return;
            }

            await restaurarSessao();
            toast.success("Convite aceito e vínculo criado com sucesso.");
            router.replace("/");
        })();
    }, [codigoConvite, convite, encerrarSessao, estado, restaurarSessao, router, usuario]);

    async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!username.trim() || !password) {
            setErro("Informe seu usuário ou e-mail e sua senha.");
            return;
        }

        setEnviando(true);
        setErro("");
        const err = await iniciarSessao({ username: username.trim(), password });
        setEnviando(false);

        if (err) {
            setErro(err.message);
            return;
        }

        if (!codigoConvite || !convite?.user_exists) {
            toast.success("Login realizado com sucesso. Boas-vindas ao Lumina!");
            router.replace("/");
        }
    }

    if (estado === "verificando") {
        return (
            <main className="grid min-h-dvh place-items-center bg-background px-6 text-center text-muted">
                <div className="grid justify-items-center gap-3">
                    <Loader2 className="animate-spin text-brand" size={28} />
                    <span className="text-sm font-semibold">Verificando sua sessão…</span>
                </div>
            </main>
        );
    }

    return (
        <main className="grid min-h-dvh bg-background lg:grid-cols-2">
            <section className="relative hidden overflow-hidden bg-[#0a6974] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
                <GoogleGeminiEffect />
                <div className="relative z-10 flex items-center gap-3">
                    <Image src={logoBranco} width={174} height={44} alt="Lumina" priority className="h-auto w-38" />
                    <span className="h-7 w-px bg-white/30" />
                    <span className="font-display text-base font-semibold tracking-wide text-white/80">Revisão científica</span>
                </div>

                <motion.div
                    className="relative z-10 max-w-xl"
                    initial={reduzirMovimento ? false : { opacity: 0, y: 28 }}
                    animate={reduzirMovimento ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                        className="mb-8 size-16 rounded-2xl border border-white/25 bg-white/10"
                        animate={reduzirMovimento ? undefined : { y: [0, -10, 0], rotate: [0, 3, 0] }}
                        transition={{ duration: 3.8, ease: "easeInOut", repeat: Infinity }}
                    />
                    <p className="font-display text-5xl font-bold leading-tight xl:text-6xl">
                        Seu trabalho científico, analisado com mais clareza.
                    </p>
                    <p className="mt-6 max-w-lg text-xl leading-8 text-white/76">
                        Organize documentos, acompanhe análises e mantenha a revisão acadêmica em um só lugar.
                    </p>
                </motion.div>

                <p className="relative z-10 text-base text-white/60">Lumina · Assistente de revisão científica</p>
            </section>

            <section className="grid min-h-dvh place-items-center px-6 py-12 sm:px-10 lg:px-16">
                <motion.div
                    className="w-full max-w-md"
                    initial={reduzirMovimento ? false : { opacity: 0, x: 24 }}
                    animate={reduzirMovimento ? undefined : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: reduzirMovimento ? 0 : 0.12 }}
                >
                    <div className="lg:hidden">
                        <Image src={logoLaranja} width={174} height={44} alt="Lumina" priority className="h-auto w-34 dark:hidden" />
                        <Image src={logoBranco} width={174} height={44} alt="Lumina" priority className="hidden h-auto w-34 dark:block" />
                        <p className="mt-7 text-base font-bold uppercase tracking-[0.18em] text-accent">Acesso à plataforma</p>
                    </div>
                    <div className="hidden lg:block">
                        <span className="text-base font-bold uppercase tracking-[0.18em] text-accent">Acesso à plataforma</span>
                    </div>
                    <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-ink">Entrar no Lumina</h1>
                    <p className="mt-4 text-lg leading-7 text-muted">Use sua conta para acessar seus documentos e análises.</p>

                    {codigoConvite && convite ? (
                        <div className="mt-6 rounded-xl border border-brand/30 bg-brand/8 p-4 text-sm leading-6">
                            <p className="font-display font-bold">Convite de {convite.inviter_name}</p>
                            <p className="mt-1 text-muted">Entre com a conta de <strong className="text-ink">{convite.email}</strong> para criar o vínculo.</p>
                        </div>
                    ) : avisoConvite ? (
                        <p className="mt-6 rounded-xl border border-line bg-panel p-4 text-sm leading-6 text-muted" role="status">{avisoConvite}</p>
                    ) : null}

                    <form className="mt-9 grid gap-5" onSubmit={(event) => void enviarFormulario(event)}>
                        <label className="grid gap-2 text-base font-semibold text-ink">
                            Usuário ou e-mail
                            <span className="flex h-12 items-center gap-3 rounded-lg border border-line bg-input-bg px-3 transition focus-within:border-brand focus-within:ring-3 focus-within:ring-focus/35">
                                <UserRound className="shrink-0 text-muted" size={18} aria-hidden="true" />
                                <input
                                    className="min-w-0 flex-1 bg-transparent text-lg font-normal text-ink outline-none placeholder:text-muted"
                                    type="text"
                                    name="username"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    placeholder="seu.email@exemplo.com"
                                    disabled={enviando}
                                />
                            </span>
                        </label>

                        <label className="grid gap-2 text-base font-semibold text-ink">
                            Senha
                            <span className="flex h-12 items-center gap-3 rounded-lg border border-line bg-input-bg px-3 transition focus-within:border-brand focus-within:ring-3 focus-within:ring-focus/35">
                                <KeyRound className="shrink-0 text-muted" size={18} aria-hidden="true" />
                                <input
                                    className="min-w-0 flex-1 bg-transparent text-lg font-normal text-ink outline-none placeholder:text-muted"
                                    type={mostrarSenha ? "text" : "password"}
                                    name="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Digite sua senha"
                                    disabled={enviando}
                                />
                                <button
                                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-subtle-hover hover:text-ink focus-visible:outline-3 focus-visible:outline-focus"
                                    type="button"
                                    aria-label="Mantenha pressionado para mostrar a senha"
                                    title="Mantenha pressionado para mostrar a senha"
                                    disabled={enviando}
                                    onPointerDown={(event) => {
                                        event.currentTarget.setPointerCapture(event.pointerId);
                                        setMostrarSenha(true);
                                    }}
                                    onPointerUp={() => setMostrarSenha(false)}
                                    onPointerCancel={() => setMostrarSenha(false)}
                                    onPointerLeave={() => setMostrarSenha(false)}
                                    onLostPointerCapture={() => setMostrarSenha(false)}
                                    onKeyDown={(event) => {
                                        if (event.key === " " || event.key === "Enter") setMostrarSenha(true);
                                    }}
                                    onKeyUp={(event) => {
                                        if (event.key === " " || event.key === "Enter") setMostrarSenha(false);
                                    }}
                                    onBlur={() => setMostrarSenha(false)}
                                >
                                    {mostrarSenha ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                                </button>
                            </span>
                        </label>

                        {erro ? <p className="rounded-lg border border-accent/40 bg-accent/8 px-3 py-2.5 text-base font-medium text-accent" role="alert">{erro}</p> : null}

                        <button
                            className="mt-1 inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-brand px-5 font-display text-lg font-semibold text-background transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
                            type="submit"
                            disabled={enviando}
                        >
                            {enviando ? <Loader2 className="animate-spin" size={19} /> : <ArrowRight size={19} />}
                            {enviando ? "Entrando…" : "Entrar"}
                        </button>
                    </form>

                    <p className="mt-7 text-center text-base text-muted">
                        Não tem uma conta?{" "}
                        <Link className="font-semibold text-brand underline-offset-4 transition hover:underline" href={codigoConvite && convite && !convite.user_exists ? `/cadastro?${new URLSearchParams({ convite: codigoConvite })}` : "/cadastro"}>
                            Cadastre-se
                        </Link>
                    </p>
                </motion.div>
            </section>
        </main>
    );
}

function TelaCarregandoLogin() {
    return (
        <main className="grid min-h-dvh place-items-center bg-background px-6 text-center text-muted">
            <div className="grid justify-items-center gap-3">
                <Loader2 className="animate-spin text-brand" size={28} />
                <span className="text-sm font-semibold">Preparando o acesso…</span>
            </div>
        </main>
    );
}
