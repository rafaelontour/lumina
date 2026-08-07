import axios, { type AxiosError } from "axios";
import { tryit } from "radash";

type ErroApiData = {
    detail?: string | Array<{ msg?: string }>;
    message?: string;
    error?: string;
};

export const apiBaseUrl = "/api/backend";

export const credenciaisLogin = {
    username: "rafael@gmail.com",
    password: "12345",
};

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
    return [result ?? null, err ?? null];
}

export async function entrarComCredenciaisFixas() {
    return executarRequisicao(async () => {
        await axios.post(montarUrlApi("/auth/sign-in"), new URLSearchParams(credenciaisLogin), {
            withCredentials: true,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        return true;
    });
}

export function criarErroApi(error: unknown, fallback: string) {
    return error instanceof Error
        ? new Error(lerErroApi(error, error.message || fallback))
        : new Error(fallback);
}
