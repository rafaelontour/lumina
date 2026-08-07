"use client";

import { useState, type CSSProperties } from "react";
import { Toaster } from "sonner";
import AnalisePollingProvider from "./AnalisePollingProvider";
import Cabecalho from "./Cabecalho";
import MenuLateral from "./MenuLateral";
import { useTheme } from "../data/provider/ThemeProvider";

interface AppShellProps {
    children: React.ReactNode;
    menuRecolhidoInicial: boolean;
}

export default function AppShell({ children, menuRecolhidoInicial }: Readonly<AppShellProps>) {
    const [menuRecolhido, setMenuRecolhido] = useState(menuRecolhidoInicial);
    const { resolvedTheme } = useTheme();

    function alternarMenu() {
        setMenuRecolhido((valorAtual) => {
            const proximoValor = !valorAtual;
            document.cookie = `lumina-menu-recolhido=${proximoValor}; path=/; max-age=31536000; samesite=lax`;
            return proximoValor;
        });
    }

    return (
        <div
            style={{
                "--largura-menu": menuRecolhido ? "64px" : "248px",
            } as CSSProperties}
            className={`
                group/app grid h-dvh min-h-0 overflow-hidden transition-[grid-template-columns] duration-200
                grid-cols-[var(--largura-menu)_minmax(0,1fr)] grid-rows-[72px_minmax(0,1fr)]
                ${menuRecolhido ? "menu-recolhido" : ""}
            `}
        >
            <Cabecalho
                menuRecolhido={menuRecolhido}
                aoAlternarMenu={alternarMenu}
            />
            <MenuLateral />
            <main className="min-h-0 min-w-0 overflow-auto bg-background">
                <AnalisePollingProvider>{children}</AnalisePollingProvider>
            </main>
            <Toaster
                closeButton
                duration={5000}
                position="top-right"
                theme={resolvedTheme}
                toastOptions={{
                    style: {
                        background: "var(--panel)",
                        border: "1px solid var(--line)",
                        boxShadow: "0 18px 44px -28px var(--chrome-shadow)",
                        color: "var(--ink)",
                    },
                }}
            />
        </div>
    );
}
