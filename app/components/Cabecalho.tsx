"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Moon, PanelLeftClose, Sun } from "lucide-react";

import logoLaranja from "@/public/lumina_laranja.png";
import logoBranco from "@/public/lumina_branco.png";
import { useTheme } from "../data/provider/ThemeProvider";

interface CabecalhoProps {
    menuRecolhido: boolean;
    aoAlternarMenu: () => void;
}

export default function Cabecalho({ menuRecolhido, aoAlternarMenu }: CabecalhoProps) {
    const { resolvedTheme, setTheme } = useTheme();

    function alternarTema() {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }

    return (
        <header className="col-span-full flex min-h-18 items-center justify-between gap-4 border-b border-line bg-header-bg px-5 py-4 shadow-[0_12px_28px_-24px_var(--chrome-shadow)] backdrop-blur-md md:px-6">
            <div className="flex min-w-0 items-center gap-6">
                <button
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-line bg-input-bg text-ink transition hover:border-brand hover:bg-subtle-hover"
                    type="button"
                    onClick={aoAlternarMenu}
                    aria-label={menuRecolhido ? "Expandir menu lateral" : "Recolher menu lateral"}
                    title={menuRecolhido ? "Expandir menu" : "Recolher menu"}
                >
                    {menuRecolhido ? <Menu size={20} /> : <PanelLeftClose size={20} />}
                </button>

                <Link className="flex min-w-0 items-center" href="/" aria-label="Ir para início">
                    <Image
                        width={166}
                        height={42}
                        src={logoLaranja}
                        className="block h-auto max-h-8 w-auto max-w-41.5 dark:hidden"
                        priority
                        alt="Lumina"
                    />

                    <Image
                        width={166}
                        height={42}
                        src={logoBranco}
                        className="hidden h-auto max-h-8 w-auto max-w-41.5 dark:block"
                        priority
                        alt="Lumina"
                    />
                </Link>
            </div>

            <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-line bg-input-bg px-3 font-semibold text-ink transition hover:border-brand hover:bg-subtle-hover"
                type="button"
                onClick={alternarTema}
                aria-label="Alternar tema"
            >
                <Moon size={18} className="dark:hidden" />
                <Sun size={18} className="hidden dark:block" />
                <span className="hidden sm:inline dark:hidden">Escuro</span>
                <span className="hidden sm:dark:inline">Claro</span>
            </button>
        </header>
    )
}
