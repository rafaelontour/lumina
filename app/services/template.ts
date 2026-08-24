import axios, { type AxiosResponse } from "axios";

import type {
    RespostaListaTemplatesConformidade,
    TemplateConformidade,
} from "@/app/types/Conformidade";
import { criarErroApi, executarRequisicao, montarUrlApi } from "./autenticacao";

async function executarRequisicaoAutenticada<T>(
    acao: () => Promise<AxiosResponse<T>>,
    mensagemErro: string
): Promise<[T | null, Error | null]> {
    const [response, err] = await executarRequisicao(acao);
    if (err) return [null, criarErroApi(err, mensagemErro)];

    return [response?.data ?? null, null];
}

export async function listarTemplatesAdministracao(): Promise<[TemplateConformidade[], Error | null]> {
    const [resposta, err] = await executarRequisicaoAutenticada(
        () => axios.get<RespostaListaTemplatesConformidade>(montarUrlApi("/templates?limit=100"), { withCredentials: true }),
        "Não foi possível carregar os templates."
    );

    if (err) return [[], err];
    return [Array.isArray(resposta?.templates) ? resposta.templates : [], null];
}

export async function criarTemplate({ nome, arquivo }: { nome: string; arquivo: File }) {
    const dados = new FormData();
    dados.append("name", nome.trim());
    dados.append("file", arquivo);

    return executarRequisicaoAutenticada(
        () => axios.post<TemplateConformidade>(montarUrlApi("/templates"), dados, { withCredentials: true }),
        "Não foi possível cadastrar o template."
    );
}

export async function atualizarTemplate(
    templateId: string,
    { nome, arquivo }: { nome?: string; arquivo?: File | null }
) {
    const dados = new FormData();
    const nomeNormalizado = nome?.trim();

    if (nomeNormalizado) dados.append("name", nomeNormalizado);
    if (arquivo) dados.append("file", arquivo);
    if (!nomeNormalizado && !arquivo) {
        return [null, new Error("Altere o nome ou selecione um novo PDF antes de salvar.")] as const;
    }

    return executarRequisicaoAutenticada(
        () => axios.put<TemplateConformidade>(montarUrlApi(`/templates/${encodeURIComponent(templateId)}`), dados, { withCredentials: true }),
        "Não foi possível atualizar o template."
    );
}

export async function removerTemplate(templateId: string): Promise<[true | null, Error | null]> {
    const [, err] = await executarRequisicaoAutenticada(
        () => axios.delete(montarUrlApi(`/templates/${encodeURIComponent(templateId)}`), { withCredentials: true }),
        "Não foi possível excluir o template."
    );

    return err ? [null, err] : [true, null];
}
