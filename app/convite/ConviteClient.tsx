"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarClock, Check, Loader2, Mail, UserRound, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import GoogleGeminiEffect from "@/app/components/GoogleGeminiEffect";
import { consultarConvite, recusarConvite } from "@/app/services/convite";
import type { ConvitePublico } from "@/app/types/Convite";
import logoBranco from "@/public/lumina_branco.png";
import logoLaranja from "@/public/lumina_laranja.png";

type EstadoConvite =
    | { status: "carregando" }
    | { status: "pronto"; convite: ConvitePublico }
    | { status: "indisponivel"; mensagem: string }
    | { status: "erro"; mensagem: string }
    | { status: "recusado" };

function formatarExpiracao(valor: string) {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "data não informada";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(data);
}

function conviteEstaDisponivel(convite: ConvitePublico) {
    return convite.is_valid && !convite.is_expired && convite.status === "PENDING";
}

export default function ConviteClient({ codigo }: { codigo: string }) {
    const reduzirMovimento = useReducedMotion();
    const [estado, setEstado] = useState<EstadoConvite>(codigo ? { status: "carregando" } : {
        status: "indisponivel",
        mensagem: "Este link não contém um código de convite válido.",
    });
    const [recusando, setRecusando] = useState(false);

    useEffect(() => {
        if (!codigo) return;
        let ativo = true;

        void consultarConvite(codigo).then(([convite, err]) => {
            if (!ativo) return;
            if (err || !convite) {
                setEstado({
                    status: "erro",
                    mensagem: "Não foi possível validar este convite. Confira o link ou solicite um novo ao orientador.",
                });
                return;
            }

            if (!conviteEstaDisponivel(convite)) {
                setEstado({
                    status: "indisponivel",
                    mensagem: "Este convite não está mais disponível. Solicite uma nova autorização ao orientador.",
                });
                return;
            }

            setEstado({ status: "pronto", convite });
        });

        return () => {
            ativo = false;
        };
    }, [codigo]);

    const destinoPrincipal = useMemo(() => {
        if (estado.status !== "pronto") return "/login";
        const parametros = new URLSearchParams({ convite: codigo });
        return `${estado.convite.user_exists ? "/login" : "/cadastro"}?${parametros}`;
    }, [codigo, estado]);

    async function recusar() {
        if (!window.confirm("Deseja recusar este convite? Esta ação não poderá ser desfeita.")) return;
        setRecusando(true);
        const [, err] = await recusarConvite(codigo);
        setRecusando(false);
        if (err) {
            setEstado({ status: "erro", mensagem: err.message });
            return;
        }
        setEstado({ status: "recusado" });
    }

    return (
        <main className="grid min-h-dvh bg-background lg:grid-cols-2">
            <section className="relative hidden overflow-hidden bg-[#0a6974] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
                <GoogleGeminiEffect />
                <Image src={logoBranco} width={174} height={44} alt="Lumina" priority className="relative z-10 h-auto w-38" />
                <div className="relative z-10 max-w-xl">
                    <p className="font-display text-5xl font-bold leading-tight xl:text-6xl">Seu vínculo acadêmico começa aqui.</p>
                    <p className="mt-6 max-w-lg text-xl leading-8 text-white/76">Confira o convite recebido e escolha como continuar na plataforma.</p>
                </div>
                <p className="relative z-10 text-base text-white/60">Lumina · Assistente de revisão científica</p>
            </section>

            <section className="grid min-h-dvh place-items-center overflow-y-auto px-6 py-12 sm:px-10 lg:px-16">
                <motion.div
                    className="w-full max-w-lg"
                    initial={reduzirMovimento ? false : { opacity: 0, x: 24 }}
                    animate={reduzirMovimento ? undefined : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="lg:hidden">
                        <Image src={logoLaranja} width={174} height={44} alt="Lumina" priority className="h-auto w-34 dark:hidden" />
                        <Image src={logoBranco} width={174} height={44} alt="Lumina" priority className="hidden h-auto w-34 dark:block" />
                    </div>
                    <span className="mt-7 block font-display text-xs font-bold uppercase tracking-[0.18em] text-accent lg:mt-0">Convite de orientação</span>

                    {estado.status === "carregando" ? (
                        <EstadoConvite icone={<Loader2 className="animate-spin" size={30} />} titulo="Validando convite" descricao="Aguarde enquanto conferimos os dados recebidos." />
                    ) : estado.status === "pronto" ? (
                        <div className="mt-3">
                            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Você recebeu um convite</h1>
                            <p className="mt-4 text-lg leading-7 text-muted">
                                <strong className="text-ink">{estado.convite.inviter_name}</strong> autorizou seu acesso ao Lumina como orientando.
                            </p>

                            <dl className="mt-7 grid gap-3 rounded-2xl border border-line bg-panel p-5 shadow-sm">
                                <Detalhe icone={<Mail size={18} />} rotulo="E-mail autorizado" valor={estado.convite.email} />
                                <Detalhe icone={<CalendarClock size={18} />} rotulo="Validade" valor={formatarExpiracao(estado.convite.expires_at)} />
                                {estado.convite.project_title ? <Detalhe rotulo="Projeto" valor={estado.convite.project_title} /> : null}
                                {estado.convite.topic ? <Detalhe rotulo="Tema" valor={estado.convite.topic} /> : null}
                            </dl>

                            <div className="mt-6 grid gap-3">
                                <Link className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 font-display font-semibold text-background transition hover:bg-brand-strong" href={destinoPrincipal}>
                                    {estado.convite.user_exists ? "Entrar e aceitar convite" : "Criar conta e aceitar"}
                                    <ArrowRight size={18} />
                                </Link>
                                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-input-bg px-4 font-semibold transition hover:border-accent hover:text-accent disabled:opacity-60" disabled={recusando} onClick={() => void recusar()} type="button">
                                    {recusando ? <Loader2 className="animate-spin" size={17} /> : <X size={17} />}
                                    {recusando ? "Recusando…" : "Recusar convite"}
                                </button>
                            </div>
                        </div>
                    ) : estado.status === "recusado" ? (
                        <EstadoConvite icone={<Check size={30} />} titulo="Convite recusado" descricao="O convite foi recusado e não poderá mais ser utilizado." />
                    ) : (
                        <EstadoConvite icone={<X size={30} />} titulo="Convite indisponível" descricao={estado.mensagem} />
                    )}

                    <Link className="mt-7 inline-flex text-sm font-semibold text-brand underline-offset-4 hover:underline" href="/login">Ir para o login</Link>
                </motion.div>
            </section>
        </main>
    );
}

function EstadoConvite({ icone, titulo, descricao }: { icone: React.ReactNode; titulo: string; descricao: string }) {
    return (
        <div className="mt-6 rounded-2xl border border-line bg-panel p-6 text-center shadow-sm" role="status">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand/10 text-brand">{icone}</span>
            <h1 className="mt-4 font-display text-3xl font-bold">{titulo}</h1>
            <p className="mt-3 leading-7 text-muted">{descricao}</p>
        </div>
    );
}

function Detalhe({ icone, rotulo, valor }: { icone?: React.ReactNode; rotulo: string; valor: string }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 text-brand">{icone ?? <UserRound size={18} />}</span>
            <div className="min-w-0">
                <dt className="text-xs font-bold uppercase tracking-wide text-muted">{rotulo}</dt>
                <dd className="mt-0.5 break-words font-semibold text-ink">{valor}</dd>
            </div>
        </div>
    );
}
