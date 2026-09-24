"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Loader2, Mail, Phone, UserPlus, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import GoogleGeminiEffect from "@/app/components/GoogleGeminiEffect";
import { useAuth } from "@/app/data/provider/AuthProvider";
import { cadastrarComConvite, consultarConvite } from "@/app/services/convite";
import type { ConvitePublico } from "@/app/types/Convite";
import logoBranco from "@/public/lumina_branco.png";
import logoLaranja from "@/public/lumina_laranja.png";

type DadosFormulario = {
    username: string;
    phoneNumber: string;
    password: string;
    confirmation: string;
};

const dadosIniciais: DadosFormulario = {
    username: "",
    phoneNumber: "",
    password: "",
    confirmation: "",
};

type EstadoConviteCadastro =
    | { status: "sem-codigo" }
    | { status: "carregando"; codigo: string }
    | { status: "pronto"; codigo: string; convite: ConvitePublico }
    | { status: "bloqueado"; mensagem: string };

export default function CadastroPage() {
    return (
        <Suspense fallback={<TelaCarregando texto="Preparando o cadastro…" />}>
            <ConteudoCadastro />
        </Suspense>
    );
}

function ConteudoCadastro() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const codigoConvite = searchParams.get("convite")?.trim() ?? "";
    const reduzirMovimento = useReducedMotion();
    const { estado, iniciarSessao } = useAuth();
    const [estadoConvite, setEstadoConvite] = useState<EstadoConviteCadastro>(
        codigoConvite ? { status: "carregando", codigo: codigoConvite } : { status: "sem-codigo" }
    );
    const [dados, setDados] = useState<DadosFormulario>(dadosIniciais);
    const [emailDireto, setEmailDireto] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (estado === "autenticado") router.replace("/");
    }, [estado, router]);

    useEffect(() => {
        const codigo = codigoConvite;
        if (!codigo) return;
        let ativo = true;
        void consultarConvite(codigo).then(([convite, err]) => {
            if (!ativo) return;
            if (err || !convite || !convite.is_valid || convite.is_expired || convite.status !== "PENDING") {
                setEstadoConvite({ status: "bloqueado", mensagem: "Este convite não está disponível. Solicite uma nova autorização ao seu orientador." });
                return;
            }
            if (convite.user_exists) {
                setEstadoConvite({ status: "bloqueado", mensagem: "Este e-mail já possui conta. Entre na plataforma para aceitar o convite." });
                return;
            }
            setEstadoConvite({ status: "pronto", codigo, convite });
        });

        return () => {
            ativo = false;
        };
    }, [codigoConvite]);

    function atualizarCampo(campo: keyof DadosFormulario, valor: string) {
        setDados((dadosAtuais) => ({ ...dadosAtuais, [campo]: valor }));
    }

    function validarFormulario() {
        if (!dados.username.trim() || !dados.phoneNumber.trim() || !dados.password || !dados.confirmation) {
            return "Preencha todos os campos para criar sua conta.";
        }
        if (dados.password !== dados.confirmation) {
            return "A confirmação de senha deve ser igual à senha informada.";
        }
        return "";
    }

    async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (estadoConvite.status !== "pronto") return;
        const erroValidacao = validarFormulario();
        if (erroValidacao) {
            setErro(erroValidacao);
            return;
        }

        setEnviando(true);
        setErro("");
        const username = dados.username.trim();
        const email = estadoConvite.convite.email.trim();
        const password = dados.password;
        const [, err] = await cadastrarComConvite(estadoConvite.codigo, {
            username,
            phone_number: dados.phoneNumber.trim(),
            password,
        });

        if (err) {
            setDados((atuais) => ({ ...atuais, password: "", confirmation: "" }));
            setEnviando(false);
            setErro(err.message);
            return;
        }

        const erroSessao = await iniciarSessao({ username: email, password });
        setDados((atuais) => ({ ...atuais, password: "", confirmation: "" }));
        setEnviando(false);
        if (erroSessao) {
            setErro("Sua conta foi criada, mas não foi possível iniciar a sessão automaticamente. Entre com as credenciais que acabou de definir.");
            return;
        }

        toast.success("Conta criada e convite aceito com sucesso.");
        router.replace("/");
    }

    function verificarEmailAutorizado(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(emailDireto.trim())) {
            setErro("Informe um e-mail válido.");
            return;
        }
        setErro("A validação direta pelo e-mail ainda não está disponível no backend. Se você recebeu um link, abra-o para concluir o cadastro.");
    }

    if (estado === "verificando" || estadoConvite.status === "carregando") {
        return <TelaCarregando texto={estado === "verificando" ? "Verificando sua sessão…" : "Validando autorização de cadastro…"} />;
    }

    return (
        <main className="grid min-h-dvh bg-background lg:grid-cols-2">
            <section className="relative hidden overflow-hidden bg-[#0a6974] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
                <GoogleGeminiEffect />
                <Image src={logoBranco} width={174} height={44} alt="Lumina" priority className="relative z-10 h-auto w-38" />
                <div className="relative z-10 max-w-xl">
                    <p className="font-display text-5xl font-bold leading-tight xl:text-6xl">Comece seu trabalho já conectado ao seu orientador.</p>
                    <p className="mt-6 max-w-lg text-xl leading-8 text-white/76">Sua autorização cria a conta e o vínculo acadêmico no mesmo passo.</p>
                </div>
                <p className="relative z-10 text-base text-white/60">Lumina · Assistente de revisão científica</p>
            </section>

            <section className="grid min-h-dvh place-items-center overflow-y-auto px-6 py-12 sm:px-10 lg:px-16">
                <motion.div
                    className="w-full max-w-md"
                    initial={reduzirMovimento ? false : { opacity: 0, x: 24 }}
                    animate={reduzirMovimento ? undefined : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="lg:hidden">
                        <Image src={logoLaranja} width={174} height={44} alt="Lumina" priority className="h-auto w-34 dark:hidden" />
                        <Image src={logoBranco} width={174} height={44} alt="Lumina" priority className="hidden h-auto w-34 dark:block" />
                    </div>
                    <span className="mt-7 block text-base font-bold uppercase tracking-[0.18em] text-accent lg:mt-0">Cadastro de usuário</span>

                    {estadoConvite.status === "pronto" ? (
                        <>
                            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Crie sua conta</h1>
                            <p className="mt-4 text-lg leading-7 text-muted">Seu vínculo com <strong className="text-ink">{estadoConvite.convite.inviter_name}</strong> será criado automaticamente.</p>

                            <form className="mt-8 grid gap-4" onSubmit={(evento) => void enviarFormulario(evento)}>
                                <CampoCadastro icone={<UserRound size={18} />} label="Usuário">
                                    <input className="campo-cadastro" type="text" autoComplete="username" value={dados.username} onChange={(evento) => atualizarCampo("username", evento.target.value)} placeholder="Como deseja ser identificado" disabled={enviando} />
                                </CampoCadastro>
                                <CampoCadastro icone={<Mail size={18} />} label="E-mail autorizado">
                                    <input className="campo-cadastro cursor-not-allowed opacity-80" type="email" value={estadoConvite.convite.email} readOnly aria-readonly="true" />
                                </CampoCadastro>
                                <CampoCadastro icone={<Phone size={18} />} label="Telefone">
                                    <input className="campo-cadastro" type="tel" autoComplete="tel" value={dados.phoneNumber} onChange={(evento) => atualizarCampo("phoneNumber", evento.target.value)} placeholder="(00) 00000-0000" disabled={enviando} />
                                </CampoCadastro>
                                <CampoCadastro icone={<KeyRound size={18} />} label="Senha">
                                    <input className="campo-cadastro" type="password" autoComplete="new-password" value={dados.password} onChange={(evento) => atualizarCampo("password", evento.target.value)} placeholder="Crie uma senha" disabled={enviando} />
                                </CampoCadastro>
                                <CampoCadastro icone={<KeyRound size={18} />} label="Confirme sua senha">
                                    <input className="campo-cadastro" type="password" autoComplete="new-password" value={dados.confirmation} onChange={(evento) => atualizarCampo("confirmation", evento.target.value)} placeholder="Repita sua senha" disabled={enviando} />
                                </CampoCadastro>

                                {erro ? <MensagemErro mensagem={erro} /> : null}
                                <button className="mt-1 inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-brand px-5 font-display text-lg font-semibold text-background transition hover:bg-brand-strong disabled:opacity-60" type="submit" disabled={enviando}>
                                    {enviando ? <Loader2 className="animate-spin" size={19} /> : <UserPlus size={19} />}
                                    {enviando ? "Criando conta…" : "Criar conta e aceitar convite"}
                                </button>
                            </form>
                        </>
                    ) : estadoConvite.status === "sem-codigo" ? (
                        <>
                            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Confirme sua autorização</h1>
                            <p className="mt-4 text-lg leading-7 text-muted">Informe o e-mail previamente autorizado pelo seu orientador.</p>
                            <form className="mt-8 grid gap-4" onSubmit={verificarEmailAutorizado}>
                                <CampoCadastro icone={<Mail size={18} />} label="E-mail autorizado">
                                    <input className="campo-cadastro" type="email" autoComplete="email" value={emailDireto} onChange={(evento) => setEmailDireto(evento.target.value)} placeholder="seu.email@exemplo.com" />
                                </CampoCadastro>
                                {erro ? <MensagemErro mensagem={erro} /> : null}
                                <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 font-display font-semibold text-background transition hover:bg-brand-strong" type="submit">
                                    Verificar autorização
                                    <UserPlus size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="mt-5 rounded-2xl border border-line bg-panel p-6 shadow-sm">
                            <h1 className="font-display text-3xl font-bold">Cadastro indisponível</h1>
                            <p className="mt-3 leading-7 text-muted">{estadoConvite.mensagem}</p>
                        </div>
                    )}

                    <p className="mt-7 text-center text-base text-muted">Já possui uma conta? <Link className="font-semibold text-brand underline-offset-4 hover:underline" href="/login">Entrar</Link></p>
                    <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-ink" href="/login"><ArrowLeft size={16} />Voltar ao login</Link>
                </motion.div>
            </section>
        </main>
    );
}

function TelaCarregando({ texto }: { texto: string }) {
    return <main className="grid min-h-dvh place-items-center bg-background px-6 text-center text-muted"><div className="grid justify-items-center gap-3"><Loader2 className="animate-spin text-brand" size={28} /><span className="text-sm font-semibold">{texto}</span></div></main>;
}

function MensagemErro({ mensagem }: { mensagem: string }) {
    return <p className="rounded-lg border border-accent/40 bg-accent/8 px-3 py-2.5 text-sm font-medium text-accent" role="alert">{mensagem}</p>;
}

function CampoCadastro({ children, icone, label }: { children: React.ReactNode; icone: React.ReactNode; label: string }) {
    return <label className="grid gap-2 text-base font-semibold text-ink">{label}<span className="flex h-12 items-center gap-3 rounded-lg border border-line bg-input-bg px-3 text-muted transition focus-within:border-brand focus-within:ring-3 focus-within:ring-focus/35">{icone}{children}</span></label>;
}
