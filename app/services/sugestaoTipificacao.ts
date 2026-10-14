import axios from "axios";

import type {
    EdicaoConfirmacaoSugestao,
    ItemSugestaoTipificacao,
    RespostaListaSessoesSugestao,
    SessaoSugestaoDetalhe,
    SessaoSugestaoResumo,
} from "@/app/types/SugestaoTipificacao";
import { criarErroApi, executarRequisicao, montarUrlApi } from "./autenticacao";

async function executarSugestao<T>(
    acao: () => Promise<{ data: T }>,
    mensagemErro: string
): Promise<[T | null, Error | null]> {
    const [response, err] = await executarRequisicao(acao);
    if (err || !response) return [null, criarErroApi(err, mensagemErro)];
    return [response.data, null];
}

export async function criarSessaoSugestao({
    arquivo,
    tipificacaoId,
}: {
    arquivo: File;
    tipificacaoId?: string;
}): Promise<[SessaoSugestaoDetalhe | null, Error | null]> {
    const dados = new FormData();
    dados.append("file", arquivo);
    if (tipificacaoId) dados.append("typification_id", tipificacaoId);

    return executarSugestao(
        () => axios.post<SessaoSugestaoDetalhe>(montarUrlApi("/tree-suggestion"), dados, {
            withCredentials: true,
            timeout: 120000,
        }),
        "Não foi possível iniciar a geração da tipificação."
    );
}

export async function listarSessoesSugestao(): Promise<[SessaoSugestaoResumo[], Error | null]> {
    const [data, err] = await executarSugestao(
        () => axios.get<RespostaListaSessoesSugestao>(montarUrlApi("/tree-suggestion?limit=100"), {
            withCredentials: true,
            headers: { "Cache-Control": "no-store" },
        }),
        "Não foi possível carregar as gerações por documento."
    );
    if (err) return [[], err];
    return [Array.isArray(data?.sessions) ? data.sessions : [], null];
}

export function obterSessaoSugestao(sessionId: string): Promise<[SessaoSugestaoDetalhe | null, Error | null]> {
    return executarSugestao(
        () => axios.get<SessaoSugestaoDetalhe>(
            montarUrlApi(`/tree-suggestion/${encodeURIComponent(sessionId)}`),
            { withCredentials: true, headers: { "Cache-Control": "no-store" } }
        ),
        "Não foi possível carregar os detalhes desta geração."
    );
}

export function confirmarItemSugestao({
    sessionId,
    itemId,
    edicao,
}: {
    sessionId: string;
    itemId: string;
    edicao?: EdicaoConfirmacaoSugestao;
}): Promise<[ItemSugestaoTipificacao | null, Error | null]> {
    return executarSugestao(
        () => axios.post<ItemSugestaoTipificacao>(
            montarUrlApi(`/tree-suggestion/${encodeURIComponent(sessionId)}/items/${encodeURIComponent(itemId)}/confirm`),
            edicao,
            { withCredentials: true }
        ),
        "Não foi possível confirmar e aplicar esta sugestão."
    );
}

export function descartarItemSugestao({
    sessionId,
    itemId,
}: {
    sessionId: string;
    itemId: string;
}): Promise<[SessaoSugestaoDetalhe | null, Error | null]> {
    return executarSugestao(
        () => axios.post<SessaoSugestaoDetalhe>(
            montarUrlApi(`/tree-suggestion/${encodeURIComponent(sessionId)}/items/${encodeURIComponent(itemId)}/discard`),
            undefined,
            { withCredentials: true }
        ),
        "Não foi possível descartar esta sugestão."
    );
}

export function descartarPendentesSessao(sessionId: string): Promise<[SessaoSugestaoDetalhe | null, Error | null]> {
    return executarSugestao(
        () => axios.post<SessaoSugestaoDetalhe>(
            montarUrlApi(`/tree-suggestion/${encodeURIComponent(sessionId)}/discard`),
            undefined,
            { withCredentials: true }
        ),
        "Não foi possível descartar as sugestões pendentes."
    );
}
