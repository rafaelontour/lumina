"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, FileText, Workflow, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";

import GoogleGeminiEffect from "./GoogleGeminiEffect";
import logoBranco from "@/public/lumina_branco.png";
import logoLaranja from "@/public/lumina_laranja.png";

const entradaConteudo = {
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0 },
};

export default function HomeInicialAnimada() {
    return (
        <section className="grid min-h-full content-center gap-18 overflow-x-clip pt-14">
            <motion.div
                initial={{ opacity: 0, scale: 1.34, y: 155 }}
                animate={{ opacity: [0, 1, 1], scale: [1.34, 1.34, 1], y: [155, 155, -18] }}
                transition={{
                    duration: 1.45,
                    ease: [0.22, 1, 0.36, 1],
                    times: [0, 0.38, 1],
                }}
                className="relative flex justify-center"
            >
                <GoogleGeminiEffect delay={1.45} />
                <motion.div
                    animate={{
                        y: [0, -8, 0],
                        filter: [
                            "drop-shadow(0 16px 28px rgba(0, 0, 0, 0.12))",
                            "drop-shadow(0 26px 44px rgba(0, 0, 0, 0.18))",
                            "drop-shadow(0 16px 28px rgba(0, 0, 0, 0.12))",
                        ],
                    }}
                    transition={{
                        duration: 2.8,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                    className="relative z-10"
                >
                    <Image
                        src={logoLaranja}
                        width={380}
                        height={96}
                        priority
                        alt="Lumina"
                        className="h-auto w-[min(78vw,380px)] dark:hidden"
                    />
                    <Image
                        src={logoBranco}
                        width={380}
                        height={96}
                        priority
                        alt="Lumina"
                        className="hidden h-auto w-[min(78vw,380px)] dark:block"
                    />
                </motion.div>
            </motion.div>

            <div className="grid gap-10 px-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:px-20">
                <div className="max-w-3xl">
                <motion.div
                    variants={entradaConteudo}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 1.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h1 className="max-w-4xl font-display text-5xl font-bold leading-tight text-ink md:text-6xl">
                        Revise trabalhos cientificos com apoio de IA e foco no documento.
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-muted md:text-xl">
                        Envie um PDF, receba uma analise inicial automatica e converse com um
                        revisor academico contextualizado pelo conteudo do arquivo.
                    </p>

                    <Link
                        className="mt-9 inline-flex h-12 items-center gap-2 rounded-lg bg-brand px-5 font-display text-base font-semibold text-background transition hover:bg-brand-strong"
                        href="/oiac-ia"
                    >
                        Acessar Oiac IA
                        <ArrowRight size={18} />
                    </Link>
                </motion.div>
                </div>

                <motion.div
                    variants={entradaConteudo}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 1.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="grid content-center gap-4"
                >
                    <HomeFeature
                        icon={Bot}
                        title="Oiac IA"
                        description="Analise automatica, chat e feedbacks vinculados ao PDF."
                    />
                    <HomeFeature
                        icon={FileText}
                        title="Documento no centro"
                        description="Visualize paginas, navegue por comentarios e mantenha o texto em foco."
                    />
                    <HomeFeature
                        icon={Workflow}
                        title="Documentos"
                        description="Organize TCCs, envie componentes e acompanhe versoes analisadas pela IA."
                    />
                </motion.div>
            </div>
        </section>
    );
}

function HomeFeature({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <article className="grid grid-cols-[30px_minmax(0,1fr)] gap-5 rounded-lg border border-line bg-panel p-6 text-ink shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
            <Icon size={28} className="mt-1 text-accent" />
            <div>
                <h2 className="font-display text-lg font-bold">{title}</h2>
                <p className="mt-2 text-base leading-7 text-muted">{description}</p>
            </div>
        </article>
    );
}
