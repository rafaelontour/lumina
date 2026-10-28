import axios from "axios";

import type { GrupoDocumento } from "@/app/types/Documento";
import type { AnexoEstudo, AnexoEstudoEdicao, AnexoEstudoEntrada, GuiaEstudo } from "@/app/types/GuiaEstudo";
import { criarErroApi, executarRequisicao, montarUrlApi } from "./autenticacao";

async function requisicao<T>(acao: () => Promise<{ data: T }>, fallback: string): Promise<[T | null, Error | null]> {
    const [response, err] = await executarRequisicao(acao);
    if (err) return [null, criarErroApi(err, fallback)];
    return [response?.data ?? null, null];
}

export async function listarAnexosEstudo(itemId: string): Promise<[AnexoEstudo[], Error | null]> {
    const [data, err] = await requisicao<AnexoEstudo[]>(
        () => axios.get(montarUrlApi(`/document-group/item/${encodeURIComponent(itemId)}/attachments`), { withCredentials: true, headers: { "Cache-Control": "no-store" } }),
        "Não foi possível carregar os materiais desta etapa."
    );
    return [Array.isArray(data) ? data : [], err];
}

export async function criarAnexoEstudo(itemId: string, input: AnexoEstudoEntrada): Promise<[AnexoEstudo | null, Error | null]> {
    return requisicao(
        () => axios.post(montarUrlApi(`/document-group/item/${encodeURIComponent(itemId)}/attachment`), input, { withCredentials: true }),
        "Não foi possível adicionar este material."
    );
}

export async function atualizarAnexoEstudo(input: AnexoEstudoEdicao): Promise<[AnexoEstudo | null, Error | null]> {
    return requisicao(
        () => axios.put(montarUrlApi("/document-group/attachment"), input, { withCredentials: true }),
        "Não foi possível atualizar este material."
    );
}

export async function excluirAnexoEstudo(attachmentId: string): Promise<[true | null, Error | null]> {
    const [, err] = await executarRequisicao(() =>
        axios.delete(montarUrlApi(`/document-group/attachment/${encodeURIComponent(attachmentId)}`), { withCredentials: true })
    );
    return err ? [null, criarErroApi(err, "Não foi possível excluir este material.")] : [true, null];
}

export async function reordenarItensGrupo(groupId: string, itemIds: string[]): Promise<[GrupoDocumento | null, Error | null]> {
    return requisicao(
        () => axios.put(montarUrlApi(`/document-group/${encodeURIComponent(groupId)}/items/order`), { item_ids: itemIds }, { withCredentials: true }),
        "Não foi possível atualizar a ordem das etapas."
    );
}

export async function reordenarAnexosEstudo(itemId: string, attachmentIds: string[]): Promise<[AnexoEstudo[] | null, Error | null]> {
    return requisicao(
        () => axios.put(montarUrlApi(`/document-group/item/${encodeURIComponent(itemId)}/attachments/order`), { attachment_ids: attachmentIds }, { withCredentials: true }),
        "Não foi possível atualizar a ordem dos materiais."
    );
}

export async function obterGuiaEstudo(projectId: string): Promise<[GuiaEstudo | null, Error | null]> {
    return requisicao(
        () => axios.get(montarUrlApi(`/project/${encodeURIComponent(projectId)}/study-guide`), { withCredentials: true, headers: { "Cache-Control": "no-store" } }),
        "Não foi possível carregar o guia de estudo."
    );
}

export async function marcarAnexoEstudado(projectId: string, attachmentId: string): Promise<[GuiaEstudo | null, Error | null]> {
    return requisicao(
        () => axios.put(montarUrlApi(`/project/${encodeURIComponent(projectId)}/study-guide/attachment/${encodeURIComponent(attachmentId)}/studied`), undefined, { withCredentials: true }),
        "Não foi possível marcar o material como estudado."
    );
}

export async function desmarcarAnexoEstudado(projectId: string, attachmentId: string): Promise<[GuiaEstudo | null, Error | null]> {
    return requisicao(
        () => axios.delete(montarUrlApi(`/project/${encodeURIComponent(projectId)}/study-guide/attachment/${encodeURIComponent(attachmentId)}/studied`), { withCredentials: true }),
        "Não foi possível atualizar o progresso do guia."
    );
}
