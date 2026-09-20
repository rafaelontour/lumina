import axios from "axios";

import type { RespostaUsuarios, UsuarioAutenticado } from "@/app/types/Autenticacao";
import type { DocumentoOrientando, RespostaDocumentosOrientando } from "@/app/types/Documento";
import type {
    CartaoOrientador,
    CartaoOrientando,
    RespostaMeusOrientadores,
    RespostaMeusOrientandos,
    RespostaVinculosOrientacao,
    VinculoOrientacao,
} from "@/app/types/Orientacao";
import { criarErroApi, executarRequisicao, montarUrlApi } from "./autenticacao";

async function executarRequisicaoProtegida<T>(acao: () => Promise<T>, mensagemErro: string): Promise<[T | null, Error | null]> {
    const [response, err] = await executarRequisicao(acao);
    if (err) return [null, criarErroApi(err, mensagemErro)];
    return [response, null];
}

export async function listarCandidatosOrientacao(usuarioAtualId: string): Promise<[UsuarioAutenticado[], Error | null]> {
    const [response, err] = await executarRequisicaoProtegida(
        () =>
            axios.get<RespostaUsuarios>(montarUrlApi("/user"), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
                params: { limit: 100 },
            }),
        "Não foi possível carregar os orientadores disponíveis."
    );

    if (err) return [[], err];
    const usuarios = response?.data.users;
    return [
        Array.isArray(usuarios)
            ? usuarios.filter((usuario) => usuario.id !== usuarioAtualId && usuario.access_level === "ADMIN")
            : [],
        null,
    ];
}

export async function listarMeusOrientadoresAtivos(): Promise<[CartaoOrientador[], Error | null]> {
    const [response, err] = await executarRequisicaoProtegida(
        () =>
            axios.get<RespostaMeusOrientadores>(montarUrlApi("/advisorship/my-advisors"), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
                params: { status: "ACTIVE" },
            }),
        "Não foi possível verificar seus orientadores."
    );

    if (err) return [[], err];
    const orientadores = response?.data.advisors;
    return [Array.isArray(orientadores) ? orientadores.filter((item) => item.status === "ACTIVE") : [], null];
}

export async function criarOrientacaoPrincipal({
    advisorId,
    adviseeId,
}: {
    advisorId: string;
    adviseeId: string;
}): Promise<[VinculoOrientacao | null, Error | null]> {
    const [response, err] = await executarRequisicaoProtegida(
        () =>
            axios.post<VinculoOrientacao>(
                montarUrlApi("/advisorship"),
                {
                    advisor_id: advisorId,
                    advisee_id: adviseeId,
                    role_type: "MAIN_ADVISOR",
                },
                { withCredentials: true }
            ),
        "Não foi possível salvar o orientador selecionado."
    );

    if (err) return [null, err];
    return [response?.data ?? null, null];
}

export async function listarMeusOrientandos(): Promise<[CartaoOrientando[], Error | null]> {
    const [response, err] = await executarRequisicaoProtegida(
        () =>
            axios.get<RespostaMeusOrientandos>(montarUrlApi("/advisorship/my-advisees"), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
                params: { status: "ACTIVE" },
            }),
        "Não foi possível carregar seus orientandos."
    );

    if (err) return [[], err];
    const orientandos = response?.data.advisees;
    return [Array.isArray(orientandos) ? orientandos.filter((item) => item.status === "ACTIVE") : [], null];
}

export async function listarVinculosOrientacaoAtivos(orientadorId: string): Promise<[VinculoOrientacao[], Error | null]> {
    const [response, err] = await executarRequisicaoProtegida(
        () =>
            axios.get<RespostaVinculosOrientacao>(montarUrlApi("/advisorship"), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
                params: {
                    advisor_id: orientadorId,
                    status: "ACTIVE",
                    limit: 100,
                },
            }),
        "Não foi possível carregar as datas dos vínculos de orientação."
    );

    if (err) return [[], err];
    const vinculos = response?.data.advisorships;
    return [Array.isArray(vinculos) ? vinculos.filter((item) => item.status === "ACTIVE") : [], null];
}

export async function listarDocumentosOrientando(orientandoId: string): Promise<[DocumentoOrientando[], Error | null]> {
    const [response, err] = await executarRequisicaoProtegida(
        () =>
            axios.get<RespostaDocumentosOrientando>(
                montarUrlApi(`/advisorship/advisees/${encodeURIComponent(orientandoId)}/documents`),
                {
                    withCredentials: true,
                    headers: { "Cache-Control": "no-store" },
                }
            ),
        "Não foi possível carregar os documentos deste orientando."
    );

    if (err) return [[], err];
    const documentos = response?.data.documents;
    return [Array.isArray(documentos) ? documentos : [], null];
}
