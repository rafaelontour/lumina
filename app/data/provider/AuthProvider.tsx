"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
    encerrarSessao,
    iniciarSessao as iniciarSessaoApi,
    obterUsuarioAutenticado,
} from "@/app/services/autenticacao";
import { criarOrientacaoPrincipal, listarMeusOrientadoresAtivos } from "@/app/services/orientacao";
import type { CredenciaisLogin, UsuarioAutenticado } from "@/app/types/Autenticacao";
import type { CartaoOrientador } from "@/app/types/Orientacao";

type EstadoAutenticacao = "verificando" | "autenticado" | "anonimo";
export type EstadoOnboardingOrientacao = "nao_aplicavel" | "verificando" | "necessaria" | "concluida" | "erro";

type ContextoAutenticacao = {
    estado: EstadoAutenticacao;
    usuario: UsuarioAutenticado | null;
    orientadorPrincipal: CartaoOrientador | null;
    estadoOnboardingOrientacao: EstadoOnboardingOrientacao;
    erroOnboardingOrientacao: string | null;
    iniciarSessao: (credenciais: CredenciaisLogin) => Promise<Error | null>;
    encerrarSessao: () => Promise<Error | null>;
    atualizarUsuarioConfirmado: (usuario: UsuarioAutenticado) => void;
    salvarOrientador: (orientadorId: string) => Promise<Error | null>;
    tentarNovamenteOnboardingOrientacao: () => Promise<void>;
};

const contextoAutenticacao = createContext<ContextoAutenticacao | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [estado, setEstado] = useState<EstadoAutenticacao>("verificando");
    const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
    const [orientadorPrincipal, setOrientadorPrincipal] = useState<CartaoOrientador | null>(null);
    const [estadoOnboardingOrientacao, setEstadoOnboardingOrientacao] = useState<EstadoOnboardingOrientacao>("verificando");
    const [erroOnboardingOrientacao, setErroOnboardingOrientacao] = useState<string | null>(null);

    const verificarOnboardingOrientacao = useCallback(async (usuarioAtual: UsuarioAutenticado) => {
        if ((usuarioAtual.access_level ?? "DEFAULT") !== "DEFAULT") {
            setOrientadorPrincipal(null);
            setErroOnboardingOrientacao(null);
            setEstadoOnboardingOrientacao("nao_aplicavel");
            return;
        }

        setErroOnboardingOrientacao(null);
        setEstadoOnboardingOrientacao("verificando");
        const [orientadores, err] = await listarMeusOrientadoresAtivos();
        if (err) {
            setOrientadorPrincipal(null);
            setErroOnboardingOrientacao(err.message);
            setEstadoOnboardingOrientacao("erro");
            return;
        }

        const principal = orientadores.find((orientador) => orientador.role_type === "MAIN_ADVISOR") ?? null;
        setOrientadorPrincipal(principal);
        setEstadoOnboardingOrientacao(principal ? "concluida" : "necessaria");
    }, []);

    const verificarSessao = useCallback(async () => {
        const [usuarioAtual] = await obterUsuarioAutenticado();
        setUsuario(usuarioAtual);
        setEstado(usuarioAtual ? "autenticado" : "anonimo");
        if (usuarioAtual) {
            await verificarOnboardingOrientacao(usuarioAtual);
        } else {
            setOrientadorPrincipal(null);
            setErroOnboardingOrientacao(null);
            setEstadoOnboardingOrientacao("nao_aplicavel");
        }
        return usuarioAtual;
    }, [verificarOnboardingOrientacao]);

    useEffect(() => {
        function tratarSessaoExpirada() {
            setUsuario(null);
            setOrientadorPrincipal(null);
            setEstado("anonimo");
            setErroOnboardingOrientacao(null);
            setEstadoOnboardingOrientacao("nao_aplicavel");
        }

        window.addEventListener("lumina-sessao-expirada", tratarSessaoExpirada);
        const iniciarVerificacao = window.setTimeout(() => void verificarSessao(), 0);

        return () => {
            window.clearTimeout(iniciarVerificacao);
            window.removeEventListener("lumina-sessao-expirada", tratarSessaoExpirada);
        };
    }, [verificarSessao]);

    const iniciarSessao = useCallback(async (credenciais: CredenciaisLogin) => {
        const [proximoUsuario, err] = await iniciarSessaoApi(credenciais);
        if (err || !proximoUsuario) return err ?? new Error("Não foi possível iniciar a sessão.");

        setUsuario(proximoUsuario);
        setEstado("autenticado");
        await verificarOnboardingOrientacao(proximoUsuario);
        return null;
    }, [verificarOnboardingOrientacao]);

    const sair = useCallback(async () => {
        const [, err] = await encerrarSessao();
        if (err) return err;

        setUsuario(null);
        setOrientadorPrincipal(null);
        setEstado("anonimo");
        setErroOnboardingOrientacao(null);
        setEstadoOnboardingOrientacao("nao_aplicavel");
        return null;
    }, []);

    const atualizarUsuarioConfirmado = useCallback((usuarioAtualizado: UsuarioAutenticado) => {
        setUsuario(usuarioAtualizado);
    }, []);

    const salvarOrientador = useCallback(async (orientadorId: string) => {
        if (!usuario) return new Error("Não foi possível identificar o usuário atual.");

        const [vinculo, err] = await criarOrientacaoPrincipal({
            advisorId: orientadorId,
            adviseeId: usuario.id,
        });
        if (err) return err;
        if (!vinculo) return new Error("A API não confirmou o vínculo com o orientador.");

        await verificarOnboardingOrientacao(usuario);
        return null;
    }, [usuario, verificarOnboardingOrientacao]);

    const tentarNovamenteOnboardingOrientacao = useCallback(async () => {
        if (!usuario) return;
        await verificarOnboardingOrientacao(usuario);
    }, [usuario, verificarOnboardingOrientacao]);

    const value = useMemo<ContextoAutenticacao>(
        () => ({
            estado,
            usuario,
            orientadorPrincipal,
            estadoOnboardingOrientacao,
            erroOnboardingOrientacao,
            iniciarSessao,
            encerrarSessao: sair,
            atualizarUsuarioConfirmado,
            salvarOrientador,
            tentarNovamenteOnboardingOrientacao,
        }),
        [
            estado,
            usuario,
            orientadorPrincipal,
            estadoOnboardingOrientacao,
            erroOnboardingOrientacao,
            iniciarSessao,
            sair,
            atualizarUsuarioConfirmado,
            salvarOrientador,
            tentarNovamenteOnboardingOrientacao,
        ]
    );

    return <contextoAutenticacao.Provider value={value}>{children}</contextoAutenticacao.Provider>;
}

export function useAuth() {
    const contexto = useContext(contextoAutenticacao);
    if (!contexto) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
    return contexto;
}
