import axios from "axios";

import type {
    AceiteProcessamentoConformidade,
    AlvoDocumentoConformidade,
    RespostaListaResultadosConformidade,
    RespostaListaTemplatesConformidade,
    ResultadoProcessamentoConformidade,
    ResultadoConformidadeAbnt,
    ResultadoConformidadeTemplate,
    TemplateConformidade,
} from "@/app/types/Conformidade";
import {
    criarErroApi,
    executarRequisicao,
    montarUrlApi,
    obterStatusErro,
} from "./autenticacao";
import { carregarWorkspaceDocumentos } from "./documento";

async function executarRequisicaoProtegida<T>(acao: () => Promise<T>, mensagemErro: string): Promise<[T | null, Error | null]> {
    const [response, err] = await executarRequisicao(acao);

    if (err) return [null, criarErroApi(err, mensagemErro)];
    return [response, null];
}

export async function listarTemplatesConformidade(): Promise<TemplateConformidade[]> {
    const [response] = await executarRequisicao(() =>
        axios.get<RespostaListaTemplatesConformidade>(montarUrlApi("/templates"), {
            withCredentials: true,
            headers: { "Cache-Control": "no-store" },
        })
    );

    const templates = response?.data.templates;
    return Array.isArray(templates)
        ? templates.filter((template): template is TemplateConformidade =>
            Boolean(template?.id && template.name && template.original_filename && template.file_path && template.created_at)
        )
        : [];
}

export async function enviarConformidadeTemplate(
    docId: string,
    file: File,
    templateId: string
): Promise<[AceiteProcessamentoConformidade | null, Error | null]> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("template_id", templateId);

    const [response, err] = await executarRequisicaoProtegida(
        () =>
            axios.post<AceiteProcessamentoConformidade>(
                montarUrlApi(`/templates/${encodeURIComponent(docId)}/conformidade`),
                formData,
                { withCredentials: true, timeout: 120000 }
            ),
        "Não foi possível iniciar a análise de conformidade com template."
    );

    if (err) return [null, err];
    if (!response?.data?.doc_id) {
        return [null, new Error("A API não confirmou o início da análise de conformidade com template.")];
    }
    return [response.data, null];
}

export async function enviarConformidadeAbnt(
    docId: string,
    file: File
): Promise<[AceiteProcessamentoConformidade | null, Error | null]> {
    const formData = new FormData();
    formData.append("file", file);

    const [response, err] = await executarRequisicaoProtegida(
        () => axios.post<AceiteProcessamentoConformidade>(
            montarUrlApi(`/abnt/${encodeURIComponent(docId)}/conformidade`),
            formData,
            { withCredentials: true, timeout: 120000 }
        ),
        "Não foi possível iniciar a análise de conformidade ABNT."
    );

    if (err) return [null, err];
    if (!response?.data?.doc_id) {
        return [null, new Error("A API não confirmou o início da análise de conformidade ABNT.")];
    }

    return [response.data, null];
}

function obterHorarioResultado(resultado: ResultadoProcessamentoConformidade): number {
    const atualizadoEm = Date.parse(resultado.updated_at);
    if (!Number.isNaN(atualizadoEm)) return atualizadoEm;

    const criadoEm = Date.parse(resultado.created_at);
    return Number.isNaN(criadoEm) ? Number.NEGATIVE_INFINITY : criadoEm;
}

function obterResultadoMaisRecente(resultados: ResultadoProcessamentoConformidade[]) {
    return resultados.reduce<ResultadoProcessamentoConformidade | null>((maisRecente, resultado) => {
        if (!maisRecente || obterHorarioResultado(resultado) > obterHorarioResultado(maisRecente)) {
            return resultado;
        }

        return maisRecente;
    }, null);
}

export function filtrarResultadosConformidadeAbntDaVersao(
    resultados: ResultadoProcessamentoConformidade[],
    versaoEnviadaEm?: string
) {
    const horarioVersao = versaoEnviadaEm ? Date.parse(versaoEnviadaEm) : Number.NaN;
    if (Number.isNaN(horarioVersao)) return resultados;

    return resultados.filter((resultado) => {
        const horarioResultado = Date.parse(resultado.created_at);
        return Number.isNaN(horarioResultado) || horarioResultado >= horarioVersao;
    });
}

export function selecionarResultadoConformidadeAbnt(
    resultados: ResultadoProcessamentoConformidade[],
    opcoes?: { priorizarProcessamento?: boolean }
): ResultadoConformidadeAbnt | null {
    if (resultados.length === 0) return null;

    const resultadosTerminais = resultados.filter((resultado) => resultado.status !== "processing");
    const resultado = opcoes?.priorizarProcessamento
        ? obterResultadoMaisRecente(resultados)
        : obterResultadoMaisRecente(resultadosTerminais) ?? obterResultadoMaisRecente(resultados);
    if (!resultado?.doc_id || !resultado.status) return null;

    return {
        doc_id: resultado.doc_id,
        status: resultado.status,
        updated_at: resultado.updated_at,
        report: resultado.report && typeof resultado.report === "object" ? resultado.report : null,
        error: typeof resultado.error === "string" ? resultado.error : null,
    };
}

export async function obterResultadoConformidadeTemplate(
    docId: string
): Promise<[ResultadoConformidadeTemplate | null, Error | null]> {
    const [resultados, err] = await listarHistoricoConformidadeTemplate(docId);
    if (err) return [null, err];

    if (resultados.length === 0) return [null, null];

    const resultado = obterResultadoMaisRecente(resultados);
    if (!resultado?.doc_id || !resultado.status) {
        return [null, new Error("A API retornou um resultado de conformidade inválido.")];
    }

    return [
        {
            doc_id: resultado.doc_id,
            status: resultado.status,
            updated_at: resultado.updated_at,
            report: resultado.report && typeof resultado.report === "object" ? resultado.report : null,
            error: typeof resultado.error === "string" ? resultado.error : null,
        },
        null,
    ];
}

export async function listarHistoricoConformidadeTemplate(
    docId: string
): Promise<[ResultadoProcessamentoConformidade[], Error | null]> {
    const requisicao = () =>
        axios.get<RespostaListaResultadosConformidade>(
            montarUrlApi(`/templates/${encodeURIComponent(docId)}/conformidade`),
            {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
            }
        );

    const [response, err] = await executarRequisicao(requisicao);

    if (err) {
        if (obterStatusErro(err) === 404) return [[], null];
        return [[], criarErroApi(err, "Não foi possível consultar a conformidade com template.")];
    }

    const resultados = response?.data?.results;
    if (!Array.isArray(resultados)) {
        return [[], new Error("A API retornou um resultado de conformidade inválido.")];
    }

    return [resultados.filter((resultado) => resultado.doc_id === docId), null];
}

export async function obterResultadoConformidadeAbnt(
    docId: string,
    opcoes?: { priorizarProcessamento?: boolean; versaoEnviadaEm?: string }
): Promise<[ResultadoConformidadeAbnt | null, Error | null]> {
    const [resultados, err] = await listarHistoricoConformidadeAbnt(docId);
    if (err) return [null, err];

    const resultado = selecionarResultadoConformidadeAbnt(
        filtrarResultadosConformidadeAbntDaVersao(resultados, opcoes?.versaoEnviadaEm),
        opcoes
    );
    return [resultado, null];
}

export async function listarHistoricoConformidadeAbnt(
    docId: string
): Promise<[ResultadoProcessamentoConformidade[], Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.get<RespostaListaResultadosConformidade>(
            montarUrlApi(`/abnt/${encodeURIComponent(docId)}/conformidade`),
            {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
            }
        )
    );

    if (err) {
        if (obterStatusErro(err) === 404) return [[], null];
        return [[], criarErroApi(err, "Não foi possível consultar a conformidade ABNT.")];
    }

    const resultados = response?.data?.results;
    if (!Array.isArray(resultados)) {
        return [[], new Error("A API retornou um resultado de conformidade ABNT inválido.")];
    }

    return [resultados.filter((resultado) => resultado.doc_id === docId), null];
}

export async function listarDocumentosConformidade(): Promise<[AlvoDocumentoConformidade[], Error | null]> {
    const [documentos, err] = await carregarWorkspaceDocumentos();
    if (err) return [[], err];

    return [
        documentos.flatMap((documento) =>
            documento.components.flatMap((componente) => {
                const versaoAtual = componente.versions[0];
                const novaVersaoEmAnalise = versaoAtual?.analysisStatus === "pending";
                const versao = novaVersaoEmAnalise
                    ? componente.ultimaVersaoPronta ?? versaoAtual
                    : versaoAtual;
                const documentId = componente.projectDocumentId ?? componente.key;

                return [{
                    id: `${documento.id}:${componente.key}`,
                    projectId: documento.id,
                    projectTitle: documento.title,
                    projectKind: documento.kind,
                    componentKey: componente.key,
                    componentLabel: componente.label,
                    documentId,
                    releaseId: versao?.externalReleaseId,
                    filePath: versao?.filePath,
                    fileName: versao?.fileName,
                    uploadedAt: versao?.uploadedAt,
                    novaVersaoEmAnalise,
                }];
            })
        ),
        null,
    ];
}

export async function listarDocumentosConformidadeAbnt(): Promise<[AlvoDocumentoConformidade[], Error | null]> {
    const [documentos, err] = await listarDocumentosConformidade();
    if (err) return [[], err];

    return [
        documentos.filter((documento) => Boolean(documento.documentId && documento.filePath)),
        null,
    ];
}
