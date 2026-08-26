"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import AnalisePollingProvider from "./AnalisePollingProvider";
import Cabecalho from "./Cabecalho";
import MenuLateral from "./MenuLateral";
import OnboardingOrientadorObrigatorio from "./OnboardingOrientadorObrigatorio";
import { AuthProvider, useAuth } from "../data/provider/AuthProvider";
import { useTheme } from "../data/provider/ThemeProvider";

interface AppShellProps {
    children: React.ReactNode;
    menuRecolhidoInicial: boolean;
}

export default function AppShell({ children, menuRecolhidoInicial }: Readonly<AppShellProps>) {
    return (
        <AuthProvider>
            <ConteudoAppShell menuRecolhidoInicial={menuRecolhidoInicial}>{children}</ConteudoAppShell>
        </AuthProvider>
    );
}

function ConteudoAppShell({ children, menuRecolhidoInicial }: Readonly<AppShellProps>) {
    const [menuRecolhido, setMenuRecolhido] = useState(menuRecolhidoInicial);
    const pathname = usePathname();
    const { resolvedTheme } = useTheme();
    const {
        estado,
        usuario,
        estadoOnboardingOrientacao,
        erroOnboardingOrientacao,
        salvarOrientador,
        tentarNovamenteOnboardingOrientacao,
    } = useAuth();
    const rotaPublica = pathname === "/login" || pathname === "/cadastro";

    function alternarMenu() {
        setMenuRecolhido((valorAtual) => {
            const proximoValor = !valorAtual;
            document.cookie = `lumina-menu-recolhido=${proximoValor}; path=/; max-age=31536000; samesite=lax`;
            return proximoValor;
        });
    }

    if (rotaPublica) {
        return <ComToaster theme={resolvedTheme}>{children}</ComToaster>;
    }

    if (estado === "verificando") {
        return (
            <ComToaster theme={resolvedTheme}>
                <TelaVerificandoSessao />
            </ComToaster>
        );
    }

    if (estado === "anonimo") {
        return (
            <ComToaster theme={resolvedTheme}>
                <RedirecionarParaLogin />
            </ComToaster>
        );
    }

    if (estadoOnboardingOrientacao === "verificando") {
        return (
            <ComToaster theme={resolvedTheme}>
                <TelaVerificandoSessao texto="Verificando seu vínculo de orientação…" />
            </ComToaster>
        );
    }

    if (usuario && (estadoOnboardingOrientacao === "necessaria" || estadoOnboardingOrientacao === "erro")) {
        return (
            <ComToaster theme={resolvedTheme}>
                <OnboardingOrientadorObrigatorio
                    usuario={usuario}
                    erroVerificacao={erroOnboardingOrientacao}
                    aoSalvar={salvarOrientador}
                    aoTentarNovamenteVerificacao={tentarNovamenteOnboardingOrientacao}
                />
            </ComToaster>
        );
    }

    if (usuario?.access_level === "ADMIN" && (pathname === "/documentos" || pathname === "/orientandos")) {
        return (
            <ComToaster theme={resolvedTheme}>
                <RedirecionarParaMeusOrientandos />
            </ComToaster>
        );
    }

    if ((pathname === "/orientandos" || pathname === "/documentos/orientandos" || pathname === "/templates" || pathname === "/usuarios") && usuario?.access_level !== "ADMIN") {
        return (
            <ComToaster theme={resolvedTheme}>
                <RedirecionarParaInicio />
            </ComToaster>
        );
    }

    return (
        <ComToaster theme={resolvedTheme}>
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
        </div>
        </ComToaster>
    );
}

function TelaVerificandoSessao({ texto = "Verificando sua sessão…" }: { texto?: string }) {
    return (
        <div className="grid h-dvh place-items-center bg-background px-6 text-center text-muted">
            <div className="grid justify-items-center gap-3">
                <Loader2 className="animate-spin text-brand" size={28} />
                <span className="text-sm font-semibold">{texto}</span>
            </div>
        </div>
    );
}

function RedirecionarParaLogin() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/login");
    }, [router]);

    return <TelaVerificandoSessao />;
}

function RedirecionarParaInicio() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/");
    }, [router]);

    return <TelaVerificandoSessao texto="Verificando seu acesso…" />;
}

function RedirecionarParaMeusOrientandos() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/documentos/orientandos");
    }, [router]);

    return <TelaVerificandoSessao texto="Abrindo seus orientandos…" />;
}

function ComToaster({ children, theme }: { children: React.ReactNode; theme: "light" | "dark" }) {
    return (
        <>
            {children}
            <Toaster
                closeButton
                duration={5000}
                position="top-right"
                theme={theme}
                toastOptions={{
                    style: {
                        background: "var(--panel)",
                        border: "1px solid var(--line)",
                        boxShadow: "0 18px 44px -28px var(--chrome-shadow)",
                        color: "var(--ink)",
                    },
                }}
            />
        </>
    );
}
