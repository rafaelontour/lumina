import axios from "axios";

import type {
    AceiteConviteConcluido,
    CadastroPorConviteConcluido,
    ConviteCriado,
    ConvitePublico,
    DadosCadastroPorConvite,
    DadosCriacaoConvite,
    RespostaListaConvites,
} from "@/app/types/Convite";
import { criarErroApi, executarRequisicao, montarUrlApi } from "./autenticacao";

function caminhoConvite(codigo: string, sufixo = "") {
    return `/invitations/${encodeURIComponent(codigo)}${sufixo}`;
}

export async function criarConviteOrientacao(
    dados: DadosCriacaoConvite
): Promise<[ConviteCriado | null, Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.post<ConviteCriado>(
            montarUrlApi("/invitations"),
            {
                email: dados.email,
                role_type: dados.role_type ?? "MAIN_ADVISOR",
                project_id: dados.project_id ?? null,
                topic: dados.topic ?? null,
            },
            { withCredentials: true }
        )
    );

    if (err || !response?.data) {
        return [null, criarErroApi(err, "Não foi possível autorizar este e-mail.")];
    }

    return [response.data, null];
}

export async function listarConvitesAtivos(
    orientadorId: string
): Promise<[ConviteCriado[], Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.get<RespostaListaConvites>(montarUrlApi("/invitations"), {
            withCredentials: true,
            headers: { "Cache-Control": "no-store" },
            params: {
                inviter_id: orientadorId,
                status: "PENDING",
                limit: 100,
            },
        })
    );

    if (err) {
        return [[], criarErroApi(err, "Não foi possível carregar os links ativos.")];
    }

    const convites = response?.data.invitations;
    return [Array.isArray(convites) ? convites : [], null];
}

export async function cancelarConvite(
    conviteId: string
): Promise<[true | null, Error | null]> {
    const [, err] = await executarRequisicao(() =>
        axios.delete(montarUrlApi(`/invitations/${encodeURIComponent(conviteId)}`), {
            withCredentials: true,
        })
    );

    return err
        ? [null, criarErroApi(err, "Não foi possível excluir este link de convite.")]
        : [true, null];
}

export async function consultarConvite(codigo: string): Promise<[ConvitePublico | null, Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.get<ConvitePublico>(montarUrlApi(caminhoConvite(codigo)), {
            headers: { "Cache-Control": "no-store" },
        })
    );

    if (err || !response?.data) {
        return [null, criarErroApi(err, "Não foi possível consultar este convite.")];
    }

    return [response.data, null];
}

export async function cadastrarComConvite(
    codigo: string,
    dados: DadosCadastroPorConvite
): Promise<[CadastroPorConviteConcluido | null, Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.post<CadastroPorConviteConcluido>(
            montarUrlApi(caminhoConvite(codigo, "/register")),
            dados,
            { withCredentials: true }
        )
    );

    if (err || !response?.data) {
        return [null, criarErroApi(err, "Não foi possível criar sua conta com este convite.")];
    }

    const { message, user, invitation, advisorship } = response.data;
    return [{ message, user, invitation, advisorship }, null];
}

export async function aceitarConvite(
    codigo: string
): Promise<[AceiteConviteConcluido | null, Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.post<AceiteConviteConcluido>(
            montarUrlApi(caminhoConvite(codigo, "/accept")),
            undefined,
            { withCredentials: true }
        )
    );

    if (err || !response?.data) {
        return [null, criarErroApi(err, "Não foi possível aceitar este convite.")];
    }

    return [response.data, null];
}

export async function recusarConvite(codigo: string): Promise<[true | null, Error | null]> {
    const [, err] = await executarRequisicao(() =>
        axios.post(montarUrlApi(caminhoConvite(codigo, "/reject")))
    );

    return err
        ? [null, criarErroApi(err, "Não foi possível recusar este convite.")]
        : [true, null];
}
