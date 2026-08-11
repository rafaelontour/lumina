import axios, { type AxiosResponse } from "axios";

import type {
    Ramo,
    RespostaTipificacoes,
    Taxonomia,
    Tipificacao,
    TipificacaoEdicaoRascunho,
    TipificacaoRascunho,
} from "@/app/types/Tipificacao";
import {
    criarErroApi,
    entrarComCredenciaisFixas,
    executarRequisicao,
    montarUrlApi,
    obterStatusErro,
} from "./autenticacao";

async function buscarTipificacoes() {
    return axios.get<RespostaTipificacoes>(montarUrlApi("/typification?limit=100"), {
        withCredentials: true,
    });
}

async function executarRequisicaoAutenticada<T>(
    acao: () => Promise<AxiosResponse<T>>,
    mensagemErro: string
): Promise<[T | null, Error | null]> {
    let [response, err] = await executarRequisicao(acao);

    if (err && obterStatusErro(err) === 401) {
        const [, loginErr] = await entrarComCredenciaisFixas();
        if (loginErr) return [null, criarErroApi(loginErr, "Não foi possível fazer login.")];

        [response, err] = await executarRequisicao(acao);
    }

    if (err) return [null, criarErroApi(err, mensagemErro)];
    return [response?.data ?? null, null];
}

export async function listarTipificacoes(): Promise<[Tipificacao[], Error | null]> {
    const [response, err] = await executarRequisicaoAutenticada(
        buscarTipificacoes,
        "Não foi possível carregar as tipificações."
    );
    if (err) return [[], err];

    const tipificacoes = response?.typifications;
    return [Array.isArray(tipificacoes) ? tipificacoes : [], null];
}

export async function criarTipificacao(nome: string): Promise<[Tipificacao | null, Error | null]> {
    return executarRequisicaoAutenticada(
        () => axios.post<Tipificacao>(montarUrlApi("/typification"), { name: nome, source_ids: [] }, { withCredentials: true }),
        "Não foi possível criar a tipificação."
    );
}

export async function criarTaxonomia({
    title,
    description,
    typificationId,
}: {
    title: string;
    description: string;
    typificationId: string;
}): Promise<[Taxonomia | null, Error | null]> {
    return executarRequisicaoAutenticada(
        () => axios.post<Taxonomia>(
            montarUrlApi("/taxonomy"),
            { title, description, typification_id: typificationId, source_ids: [] },
            { withCredentials: true }
        ),
        "Não foi possível criar a taxonomia."
    );
}

export async function criarRamo({
    title,
    description,
    taxonomyId,
}: {
    title: string;
    description: string;
    taxonomyId: string;
}): Promise<[Ramo | null, Error | null]> {
    return executarRequisicaoAutenticada(
        () => axios.post<Ramo>(
            montarUrlApi("/branch"),
            { title, description, taxonomy_id: taxonomyId },
            { withCredentials: true }
        ),
        "Não foi possível criar o ramo."
    );
}

export async function criarArvoreTipificacao(
    rascunho: TipificacaoRascunho
): Promise<[Tipificacao | null, Error | null]> {
    const [tipificacao, tipificacaoErr] = await criarTipificacao(rascunho.name.trim());
    if (tipificacaoErr || !tipificacao) return [null, tipificacaoErr ?? new Error("Não foi possível criar a tipificação.")];

    for (const taxonomiaRascunho of rascunho.taxonomies) {
        const [taxonomia, taxonomiaErr] = await criarTaxonomia({
            title: taxonomiaRascunho.title.trim(),
            description: taxonomiaRascunho.description.trim(),
            typificationId: tipificacao.id,
        });
        if (taxonomiaErr || !taxonomia) {
            return [null, taxonomiaErr ?? new Error("Não foi possível criar a taxonomia.")];
        }

        for (const ramoRascunho of taxonomiaRascunho.branches) {
            const [, ramoErr] = await criarRamo({
                title: ramoRascunho.title.trim(),
                description: ramoRascunho.description.trim(),
                taxonomyId: taxonomia.id,
            });
            if (ramoErr) return [null, ramoErr];
        }
    }

    return [tipificacao, null];
}

export async function atualizarTipificacao({
    id,
    name,
}: {
    id: string;
    name: string;
}): Promise<[true | null, Error | null]> {
    const [, err] = await executarRequisicaoAutenticada(
        () => axios.put(montarUrlApi("/typification"), { id, name, source_ids: [] }, { withCredentials: true }),
        "Não foi possível atualizar a tipificação."
    );
    return err ? [null, err] : [true, null];
}

export async function atualizarTaxonomia({
    id,
    title,
    description,
    typificationId,
}: {
    id: string;
    title: string;
    description: string;
    typificationId: string;
}): Promise<[true | null, Error | null]> {
    const [, err] = await executarRequisicaoAutenticada(
        () => axios.put(
            montarUrlApi("/taxonomy"),
            { id, title, description, typification_id: typificationId, source_ids: [] },
            { withCredentials: true }
        ),
        "Não foi possível atualizar a taxonomia."
    );
    return err ? [null, err] : [true, null];
}

export async function atualizarRamo({
    id,
    title,
    description,
    taxonomyId,
}: {
    id: string;
    title: string;
    description: string;
    taxonomyId: string;
}): Promise<[true | null, Error | null]> {
    const [, err] = await executarRequisicaoAutenticada(
        () => axios.put(
            montarUrlApi("/branch"),
            { id, title, description, taxonomy_id: taxonomyId },
            { withCredentials: true }
        ),
        "Não foi possível atualizar o ramo."
    );
    return err ? [null, err] : [true, null];
}

async function removerRegistro(path: string, mensagemErro: string): Promise<[true | null, Error | null]> {
    const [, err] = await executarRequisicaoAutenticada(
        () => axios.delete(montarUrlApi(path), { withCredentials: true }),
        mensagemErro
    );
    return err ? [null, err] : [true, null];
}

export function removerTipificacao(id: string) {
    return removerRegistro(`/typification/${encodeURIComponent(id)}`, "Não foi possível remover a tipificação.");
}

export function removerTaxonomia(id: string) {
    return removerRegistro(`/taxonomy/${encodeURIComponent(id)}`, "Não foi possível remover a taxonomia.");
}

export function removerRamo(id: string) {
    return removerRegistro(`/branch/${encodeURIComponent(id)}`, "Não foi possível remover o ramo.");
}

function ramoFoiAlterado(
    ramo: TipificacaoEdicaoRascunho["taxonomies"][number]["branches"][number],
    ramoOriginal: Ramo
) {
    return ramo.title.trim() !== ramoOriginal.title || ramo.description.trim() !== ramoOriginal.description;
}

function taxonomiaFoiAlterada(
    taxonomia: TipificacaoEdicaoRascunho["taxonomies"][number],
    taxonomiaOriginal: Taxonomia
) {
    return taxonomia.title.trim() !== taxonomiaOriginal.title || taxonomia.description.trim() !== taxonomiaOriginal.description;
}

export async function salvarEdicaoArvoreTipificacao(
    original: Tipificacao,
    rascunho: TipificacaoEdicaoRascunho
): Promise<[boolean, Error | null]> {
    let alterou = false;
    const taxonomiasOriginaisPorId = new Map(original.taxonomies.map((taxonomia) => [taxonomia.id, taxonomia]));

    if (rascunho.name.trim() !== original.name) {
        const [, err] = await atualizarTipificacao({ id: original.id, name: rascunho.name.trim() });
        if (err) return [alterou, err];
        alterou = true;
    }

    for (const taxonomiaRascunho of rascunho.taxonomies) {
        const taxonomiaOriginal = taxonomiaRascunho.id
            ? taxonomiasOriginaisPorId.get(taxonomiaRascunho.id)
            : undefined;
        let taxonomyId = taxonomiaRascunho.id;

        if (!taxonomyId) {
            const [taxonomiaCriada, err] = await criarTaxonomia({
                title: taxonomiaRascunho.title.trim(),
                description: taxonomiaRascunho.description.trim(),
                typificationId: original.id,
            });
            if (err || !taxonomiaCriada) {
                return [alterou, err ?? new Error("Não foi possível criar a taxonomia.")];
            }
            taxonomyId = taxonomiaCriada.id;
            alterou = true;
        } else if (taxonomiaOriginal && taxonomiaFoiAlterada(taxonomiaRascunho, taxonomiaOriginal)) {
            const [, err] = await atualizarTaxonomia({
                id: taxonomyId,
                title: taxonomiaRascunho.title.trim(),
                description: taxonomiaRascunho.description.trim(),
                typificationId: original.id,
            });
            if (err) return [alterou, err];
            alterou = true;
        }

        const ramosOriginaisPorId = new Map(taxonomiaOriginal?.branches.map((ramo) => [ramo.id, ramo]));
        for (const ramoRascunho of taxonomiaRascunho.branches) {
            const ramoOriginal = ramoRascunho.id ? ramosOriginaisPorId.get(ramoRascunho.id) : undefined;

            if (!ramoRascunho.id) {
                const [, err] = await criarRamo({
                    title: ramoRascunho.title.trim(),
                    description: ramoRascunho.description.trim(),
                    taxonomyId,
                });
                if (err) return [alterou, err];
                alterou = true;
            } else if (ramoOriginal && ramoFoiAlterado(ramoRascunho, ramoOriginal)) {
                const [, err] = await atualizarRamo({
                    id: ramoRascunho.id,
                    title: ramoRascunho.title.trim(),
                    description: ramoRascunho.description.trim(),
                    taxonomyId,
                });
                if (err) return [alterou, err];
                alterou = true;
            }
        }
    }

    for (const taxonomiaOriginal of original.taxonomies) {
        const taxonomiaRascunho = rascunho.taxonomies.find((taxonomia) => taxonomia.id === taxonomiaOriginal.id);
        const ramosMantidos = new Set(taxonomiaRascunho?.branches.flatMap((ramo) => ramo.id ? [ramo.id] : []));

        for (const ramoOriginal of taxonomiaOriginal.branches) {
            if (!ramosMantidos.has(ramoOriginal.id)) {
                const [, err] = await removerRamo(ramoOriginal.id);
                if (err) return [alterou, err];
                alterou = true;
            }
        }
    }

    const taxonomiasMantidas = new Set(rascunho.taxonomies.flatMap((taxonomia) => taxonomia.id ? [taxonomia.id] : []));
    for (const taxonomiaOriginal of original.taxonomies) {
        if (!taxonomiasMantidas.has(taxonomiaOriginal.id)) {
            const [, err] = await removerTaxonomia(taxonomiaOriginal.id);
            if (err) return [alterou, err];
            alterou = true;
        }
    }

    return [alterou, null];
}

export async function excluirArvoreTipificacao(tipificacao: Tipificacao): Promise<[true | null, Error | null]> {
    for (const taxonomia of tipificacao.taxonomies) {
        for (const ramo of taxonomia.branches) {
            const [, err] = await removerRamo(ramo.id);
            if (err) return [null, err];
        }

        const [, err] = await removerTaxonomia(taxonomia.id);
        if (err) return [null, err];
    }

    return removerTipificacao(tipificacao.id);
}
