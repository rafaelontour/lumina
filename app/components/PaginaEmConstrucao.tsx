import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface PaginaEmConstrucaoProps {
    titulo: string;
    descricao: string;
    icone: LucideIcon;
}

export default function PaginaEmConstrucao({
    titulo,
    descricao,
    icone: Icone,
}: Readonly<PaginaEmConstrucaoProps>) {
    return (
        <section className="grid min-h-full place-items-center px-6 py-10 lg:px-8">
            <div className="grid w-full max-w-3xl gap-6 rounded-lg border border-line bg-panel p-8 text-ink shadow-[0_22px_60px_-34px_var(--chrome-shadow)]">
                <div className="grid size-14 place-items-center rounded-lg border border-line bg-input-bg text-accent">
                    <Icone size={28} />
                </div>

                <div>
                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                        Lumina
                    </span>
                    <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{titulo}</h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-muted md:text-lg">{descricao}</p>
                </div>

                <Link
                    href="/tipificacoes"
                    className="inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-brand px-4 font-display text-sm font-semibold text-background transition hover:bg-brand-strong"
                >
                    Ver tipificações
                    <ArrowRight size={17} />
                </Link>
            </div>
        </section>
    );
}
