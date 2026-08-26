import axios, { type AxiosError } from "axios";
import { tryit } from "radash";

import type {
    CredenciaisLogin,
    DadosAtualizacaoPerfil,
    DadosCadastroUsuario,
    UsuarioAutenticado,
} from "@/app/types/Autenticacao";

type ErroApiData = {
    detail?: string | Array<{ msg?: string }>;
    message?: string;
    error?: string;
};

export const apiBaseUrl = "/api/backend";

export function montarUrlApi(path: string) {
    return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function lerErroApi(error: unknown, fallback: string) {
    if (!axios.isAxiosError(error)) return fallback;

    const data = (error as AxiosError<ErroApiData>).response?.data;
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail) && data.detail[0]?.msg) return String(data.detail[0].msg);
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    return fallback;
}

export function obterStatusErro(error: unknown) {
    return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export async function executarRequisicao<T>(acao: () => Promise<T>): Promise<[T | null, Error | null]> {
    const [err, result] = await tryit(acao)();
    if (err && obterStatusErro(err) === 401 && typeof window !== "undefined") {
        window.dispatchEvent(new Event("lumina-sessao-expirada"));
    }
    return [result ?? null, err ?? null];
}

export async function obterUsuarioAutenticado(): Promise<[UsuarioAutenticado | null, Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.get<UsuarioAutenticado>(montarUrlApi("/user/my"), {
            withCredentials: true,
            headers: { "Cache-Control": "no-store" },
        })
    );

    if (err) return [null, criarErroApi(err, "Não foi possível verificar a sessão.")];
    return [response?.data ?? null, null];
}

export async function iniciarSessao({ username, password }: CredenciaisLogin): Promise<[UsuarioAutenticado | null, Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.post(montarUrlApi("/auth/sign-in"), new URLSearchParams({ username, password }), {
            withCredentials: true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
    );

    if (err || !response) return [null, criarErroApi(err, "Não foi possível entrar na plataforma.")];
    return obterUsuarioAutenticado();
}

export async function cadastrarUsuarioPadrao(
    dados: Omit<DadosCadastroUsuario, "access_level">
): Promise<[UsuarioAutenticado | null, Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.post<UsuarioAutenticado>(
            montarUrlApi("/user"),
            { ...dados, access_level: "DEFAULT" },
            {
                headers: { "Content-Type": "application/json" },
            }
        )
    );

    if (err || !response?.data) return [null, criarErroApi(err, "Não foi possível criar sua conta.")];
    return [response.data, null];
}

export async function encerrarSessao(): Promise<[true | null, Error | null]> {
    const [, err] = await executarRequisicao(() =>
        axios.post(montarUrlApi("/auth/sign-out"), undefined, { withCredentials: true })
    );

    return err ? [null, criarErroApi(err, "Não foi possível encerrar a sessão.")] : [true, null];
}

export async function atualizarPerfilUsuario(dados: DadosAtualizacaoPerfil): Promise<[UsuarioAutenticado | null, Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.put<UsuarioAutenticado>(montarUrlApi("/user"), dados, {
            withCredentials: true,
        })
    );

    if (err || !response?.data) return [null, criarErroApi(err, "Não foi possível atualizar o perfil.")];
    return [response.data, null];
}

export async function enviarFotoPerfilUsuario(userId: string, arquivo: File): Promise<[true | null, Error | null]> {
    const dados = new FormData();
    dados.append("file", arquivo);

    const [, err] = await executarRequisicao(() =>
        axios.post(montarUrlApi(`/user/${encodeURIComponent(userId)}/icon`), dados, {
            withCredentials: true,
        })
    );

    return err ? [null, criarErroApi(err, "Não foi possível atualizar a foto de perfil.")] : [true, null];
}

export function criarErroApi(error: unknown, fallback: string) {
    return error instanceof Error
        ? new Error(lerErroApi(error, fallback))
        : new Error(fallback);
}
