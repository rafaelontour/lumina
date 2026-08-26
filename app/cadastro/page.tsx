"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, UserPlus, UserRound, Loader2, KeyRound } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import GoogleGeminiEffect from "@/app/components/GoogleGeminiEffect";
import { useAuth } from "@/app/data/provider/AuthProvider";
import { cadastrarUsuarioPadrao } from "@/app/services/autenticacao";
import logoBranco from "@/public/lumina_branco.png";
import logoLaranja from "@/public/lumina_laranja.png";

type DadosFormulario = {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmation: string;
};

const dadosIniciais: DadosFormulario = {
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmation: "",
};

export default function CadastroPage() {
    const router = useRouter();
    const reduzirMovimento = useReducedMotion();
    const { estado } = useAuth();
    const [dados, setDados] = useState<DadosFormulario>(dadosIniciais);
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (estado === "autenticado") router.replace("/");
    }, [estado, router]);

    function atualizarCampo(campo: keyof DadosFormulario, valor: string) {
        setDados((dadosAtuais) => ({ ...dadosAtuais, [campo]: valor }));
    }

    function validarFormulario() {
        if (!dados.username.trim() || !dados.email.trim() || !dados.phoneNumber.trim() || !dados.password || !dados.confirmation) {
            return "Preencha todos os campos para criar sua conta.";
        }

        if (!/^\S+@\S+\.\S+$/.test(dados.email.trim())) {
            return "Informe um e-mail válido.";
        }

        if (dados.password !== dados.confirmation) {
            return "A confirmação de senha deve ser igual à senha informada.";
        }

        return "";
    }

    async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const erroValidacao = validarFormulario();
        if (erroValidacao) {
            setErro(erroValidacao);
            return;
        }

        setEnviando(true);
        setErro("");
        const [, err] = await cadastrarUsuarioPadrao({
            username: dados.username.trim(),
            email: dados.email.trim(),
            phone_number: dados.phoneNumber.trim(),
            password: dados.password,
        });
        setEnviando(false);
        setDados((dadosAtuais) => ({ ...dadosAtuais, password: "", confirmation: "" }));

        if (err) {
            setErro(err.message);
            return;
        }

        toast.success("Conta criada com sucesso. Entre para escolher seu orientador.");
        router.replace("/login");
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
                        Comece a revisar seu trabalho com mais clareza.
                    </p>
                    <p className="mt-6 max-w-lg text-xl leading-8 text-white/76">
                        Crie uma conta de estudante e, no primeiro acesso, selecione seu orientador para usar a plataforma.
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
                        <p className="mt-7 text-base font-bold uppercase tracking-[0.18em] text-accent">Cadastro de usuário</p>
                    </div>
                    <span className="hidden text-base font-bold uppercase tracking-[0.18em] text-accent lg:block">Cadastro de usuário</span>
                    <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Crie sua conta</h1>
                    <p className="mt-4 text-lg leading-7 text-muted">O cadastro cria uma conta de usuário padrão. Depois, escolha seu orientador no primeiro acesso.</p>

                    <form className="mt-8 grid gap-4" onSubmit={(event) => void enviarFormulario(event)}>
                        <CampoCadastro icone={<UserRound size={18} aria-hidden="true" />} label="Usuário">
                            <input className="campo-cadastro" type="text" name="username" autoComplete="username" value={dados.username} onChange={(event) => atualizarCampo("username", event.target.value)} placeholder="Como deseja ser identificado" disabled={enviando} />
                        </CampoCadastro>
                        <CampoCadastro icone={<Mail size={18} aria-hidden="true" />} label="E-mail">
                            <input className="campo-cadastro" type="email" name="email" autoComplete="email" value={dados.email} onChange={(event) => atualizarCampo("email", event.target.value)} placeholder="seu.email@exemplo.com" disabled={enviando} />
                        </CampoCadastro>
                        <CampoCadastro icone={<Phone size={18} aria-hidden="true" />} label="Telefone">
                            <input className="campo-cadastro" type="tel" name="phone" autoComplete="tel" value={dados.phoneNumber} onChange={(event) => atualizarCampo("phoneNumber", event.target.value)} placeholder="(00) 00000-0000" disabled={enviando} />
                        </CampoCadastro>
                        <CampoCadastro icone={<KeyRound size={18} aria-hidden="true" />} label="Senha">
                            <input className="campo-cadastro" type="password" name="new-password" autoComplete="new-password" value={dados.password} onChange={(event) => atualizarCampo("password", event.target.value)} placeholder="Crie uma senha" disabled={enviando} />
                        </CampoCadastro>
                        <CampoCadastro icone={<KeyRound size={18} aria-hidden="true" />} label="Confirme sua senha">
                            <input className="campo-cadastro" type="password" name="password-confirmation" autoComplete="new-password" value={dados.confirmation} onChange={(event) => atualizarCampo("confirmation", event.target.value)} placeholder="Repita sua senha" disabled={enviando} />
                        </CampoCadastro>

                        {erro ? <p className="rounded-lg border border-accent/40 bg-accent/8 px-3 py-2.5 text-base font-medium text-accent" role="alert">{erro}</p> : null}

                        <button className="mt-1 inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-brand px-5 font-display text-lg font-semibold text-background transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={enviando}>
                            {enviando ? <Loader2 className="animate-spin" size={19} /> : <UserPlus size={19} />}
                            {enviando ? "Criando conta…" : "Criar conta"}
                        </button>
                    </form>

                    <p className="mt-7 text-center text-base text-muted">
                        Já possui uma conta?{" "}
                        <Link className="font-semibold text-brand underline-offset-4 transition hover:underline" href="/login">Entrar</Link>
                    </p>
                    <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-ink" href="/login">
                        <ArrowLeft size={16} aria-hidden="true" />
                        Voltar ao login
                    </Link>
                </motion.div>
            </section>
        </main>
    );
}

function CampoCadastro({ children, icone, label }: { children: React.ReactNode; icone: React.ReactNode; label: string }) {
    return (
        <label className="grid gap-2 text-base font-semibold text-ink">
            {label}
            <span className="flex h-12 items-center gap-3 rounded-lg border border-line bg-input-bg px-3 text-muted transition focus-within:border-brand focus-within:ring-3 focus-within:ring-focus/35">
                {icone}
                {children}
            </span>
        </label>
    );
}
