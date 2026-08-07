import axios from "axios";

import type { DocumentoExterno, ReleaseExterno, UsuarioApi } from "@/app/types/Documento";
import type { Tipificacao } from "@/app/types/Tipificacao";
import type {
    ConversaOiac,
    GrupoConversasAgrupadasOiac,
    MensagemDocumento,
    ProjetoConversasAgrupadasOiac,
    RespostaConversasOiac,
    RespostaMensagensDocumento,
} from "@/app/types/Oiac";
import {
    criarErroApi,
    entrarComCredenciaisFixas,
    executarRequisicao,
    montarUrlApi,
    obterStatusErro,
} from "./autenticacao";
import {
    carregarWorkspaceDocumentos,
    listarDocumentosExternosPorFonte,
    listarReleasesDocumento,
    montarFonteDocumentoProjeto,
    obterUsuarioAtual,
} from "./documento";
import { listarTipificacoes } from "./tipificacao";

export const fonteConversaAvulsaOiac = "oiac-ia-avulsa";

type DocumentoOiacAtualizavel = ConversaOiac &
    Record<string, unknown> & {
        editors?: Array<{ id?: string | null }> | null;
        typifications?: Array<{ id?: string | null }> | null;
    };

function normalizarConversaOiac(conversa: ConversaOiac): ConversaOiac {
    const title = conversa.title?.trim();
    const name = title || conversa.name?.trim() || "Conversa sem título";
    return { ...conversa, name, title: title || conversa.title };
}

async function refazerComLogin<T>(acao: () => Promise<T>, mensagemErro: string): Promise<[T | null, Error | null]> {
    let [response, err] = await executarRequisicao(acao);

    if (err && obterStatusErro(err) === 401) {
        const [, loginErr] = await entrarComCredenciaisFixas();
        if (loginErr) return [null, criarErroApi(loginErr, "Não foi possível fazer login.")];

        [response, err] = await executarRequisicao(acao);
    }

    if (err) return [null, criarErroApi(err, mensagemErro)];
    return [response, null];
}

export async function listarConversasAvulsasOiac(): Promise<[ConversaOiac[], Error | null]> {
    const [response, err] = await refazerComLogin(
        () =>
            axios.get<RespostaConversasOiac>(montarUrlApi("/doc"), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
                params: {
                    limit: 100,
                    source: fonteConversaAvulsaOiac,
                    archived: false,
                },
            }),
        "Não foi possível carregar as conversas."
    );

    if (err) return [[], err];
    const conversas = response?.data.documents;
    return [Array.isArray(conversas) ? conversas.map(normalizarConversaOiac) : [], null];
}

export async function listarConversasAgrupadasOiac(): Promise<[ProjetoConversasAgrupadasOiac[], Error | null]> {
    const [documentos, err] = await carregarWorkspaceDocumentos();
    if (err) return [[], err];

    return [
        documentos.map((documento) => {
            const groupId = documento.groupId ?? `${documento.id}:sem-grupo`;
            const group: GrupoConversasAgrupadasOiac = {
                id: groupId,
                name: documento.kind,
                projectId: documento.id,
                projectName: documento.title,
                items: documento.components.map((componente) => {
                    const latest = componente.versions[0];
                    const backendDocumentId = componente.backendDocumentId ?? latest?.externalDocumentId ?? latest?.documentId;
                    const filePath = latest?.filePath;
                    const available = Boolean(backendDocumentId && latest?.externalReleaseId && filePath);

                    return {
                        id: componente.key,
                        label: componente.label,
                        description: componente.description,
                        backendDocumentId,
                        projectDocumentId: componente.projectDocumentId ?? componente.key,
                        releaseId: latest?.externalReleaseId,
                        filePath,
                        fileName: latest?.fileName,
                        updatedAt: latest?.uploadedAt,
                        available,
                        unavailableReason: available ? undefined : "Envie um PDF em Documentos para conversar com a IA.",
                    };
                }),
            };

            return {
                id: documento.id,
                name: documento.title,
                groups: [group],
            };
        }),
        null,
    ];
}

export async function listarMensagensDocumento(docId: string): Promise<[MensagemDocumento[], Error | null]> {
    const [response, err] = await refazerComLogin(
        () =>
            axios.get<RespostaMensagensDocumento>(montarUrlApi(`/doc/${encodeURIComponent(docId)}/messages`), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
                params: { limit: 100 },
            }),
        "Não foi possível carregar as mensagens."
    );

    if (err) return [[], err];
    const mensagens = response?.data.messages;
    return [Array.isArray(mensagens) ? mensagens : [], null];
}

export async function obterDocumentoOiac(docId: string): Promise<[ConversaOiac | null, Error | null]> {
    const [response, err] = await refazerComLogin(
        () =>
            axios.get<ConversaOiac>(montarUrlApi(`/doc/${encodeURIComponent(docId)}`), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
            }),
        "Não foi possível carregar as informações do documento."
    );

    if (err) return [null, err];
    return [response?.data ? normalizarConversaOiac(response.data) : null, null];
}

export async function atualizarNomeDocumentoOiac(
    docId: string,
    nome: string
): Promise<[ConversaOiac | null, Error | null]> {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) return [null, new Error("Informe um nome para a conversa.")];

    const [documentoAtual, documentoErr] = await refazerComLogin(
        () =>
            axios.get<DocumentoOiacAtualizavel>(montarUrlApi(`/doc/${encodeURIComponent(docId)}`), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
            }),
        "Não foi possível carregar as informações do documento."
    );

    if (documentoErr) return [null, documentoErr];
    if (!documentoAtual?.data) return [null, new Error("A API não retornou o documento para atualização.")];

    const documento = documentoAtual.data;
    const typificationIds = documento.typifications?.map((tipificacao) => tipificacao.id).filter(Boolean) ?? [];
    const editorsIds = documento.editors?.map((editor) => editor.id).filter(Boolean) ?? [];

    const [response, err] = await refazerComLogin(
        () =>
            axios.put<ConversaOiac>(
                montarUrlApi("/doc"),
                {
                    ...documento,
                    name: nomeNormalizado,
                    typification_ids: typificationIds,
                    editors_ids: editorsIds,
                },
                { withCredentials: true }
            ),
        "Não foi possível atualizar o nome da conversa."
    );

    if (err) return [null, err];
    return [response?.data ? normalizarConversaOiac(response.data) : null, null];
}

export async function listarReleasesConversaOiac(docId: string) {
    return listarReleasesDocumento(docId);
}

export async function listarReleasesDocumentoHandoffOiac(
    projectDocumentId: string,
    docIdPreferido?: string
): Promise<[ReleaseExterno[], Error | null]> {
    const [documentos, documentosErr] = await listarDocumentosExternosPorFonte(
        montarFonteDocumentoProjeto(projectDocumentId)
    );
    if (documentosErr) return [[], documentosErr];

    const documento =
        (docIdPreferido ? documentos.find((item) => item.id === docIdPreferido) : undefined) ?? documentos[0];
    if (!documento) return [[], null];

    return listarReleasesDocumento(documento.id);
}

export function selecionarReleasePreview(releases: ReleaseExterno[], releaseIdPreferido?: string) {
    const preferido = releaseIdPreferido ? releases.find((release) => release.id === releaseIdPreferido) : undefined;
    return preferido ?? releases[0];
}

export function montarUrlPreviewPdf(filePath?: string | null) {
    const caminho = filePath?.trim();
    if (!caminho) return "";
    if (/^https?:\/\//i.test(caminho)) return caminho;

    const [pathname, query = ""] = (caminho.startsWith("/") ? caminho : `/${caminho}`).split("?");
    const caminhoCodificado = pathname
        .split("/")
        .map((segmento) => encodeURIComponent(decodeURIComponent(segmento)))
        .join("/");

    return montarUrlApi(`${caminhoCodificado}${query ? `?${query}` : ""}`);
}

export async function baixarArquivoPdfOiac(filePath?: string | null): Promise<[Blob | null, Error | null]> {
    const url = montarUrlPreviewPdf(filePath);
    if (!url) return [null, new Error("Nenhuma versão com arquivo foi encontrada para esta conversa.")];

    const [response, err] = await refazerComLogin(
        () =>
            axios.get<Blob>(url, {
                withCredentials: true,
                responseType: "blob",
                headers: {
                    Accept: "application/pdf",
                    "Cache-Control": "no-store",
                },
            }),
        "Não foi possível carregar o PDF."
    );

    if (err) return [null, err];
    const blob = response?.data;
    if (!blob) return [null, new Error("O backend não retornou o arquivo PDF.")];
    return [blob, null];
}

export async function enviarMensagemIa(docId: string, content: string): Promise<[MensagemDocumento | null, Error | null]> {
    const [response, err] = await refazerComLogin(
        () =>
            axios.post<MensagemDocumento>(
                montarUrlApi(`/doc/${encodeURIComponent(docId)}/message/ai`),
                { content },
                { withCredentials: true }
            ),
        "Não foi possível enviar a mensagem."
    );

    if (err) return [null, err];
    return [response?.data ?? null, null];
}

export async function apagarConversaOiac(docId: string): Promise<[boolean, Error | null]> {
    const [, err] = await refazerComLogin(
        () =>
            axios.delete(montarUrlApi(`/doc/${encodeURIComponent(docId)}`), {
                withCredentials: true,
            }),
        "Não foi possível apagar a conversa."
    );

    if (err) return [false, err];
    return [true, null];
}

async function criarDocumentoConversaAvulsa({
    file,
    usuario,
    tipificacao,
}: {
    file: File;
    usuario: UsuarioApi;
    tipificacao: Tipificacao;
}) {
    return refazerComLogin(
        () =>
            axios.post<DocumentoExterno>(
                montarUrlApi("/doc"),
                {
                    name: file.name.replace(/\.pdf$/i, "") || "Conversa",
                    identifier: crypto.randomUUID(),
                    description: `Conversa criada a partir do arquivo ${file.name}.`,
                    tipo_documento: "Oiac IA",
                    projeto_nome: "Oiac IA",
                    source: fonteConversaAvulsaOiac,
                    typification_ids: [tipificacao.id],
                    editors_ids: [usuario.id],
                },
                { withCredentials: true }
            ),
        "Não foi possível criar a conversa."
    );
}

async function enviarArquivoConversa(docId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return refazerComLogin(
        () =>
            axios.post<ReleaseExterno>(montarUrlApi(`/doc/${encodeURIComponent(docId)}/release`), formData, {
                withCredentials: true,
                timeout: 120000,
            }),
        "Não foi possível enviar o PDF."
    );
}

export async function criarConversaAvulsaComPdf(file: File): Promise<[ConversaOiac | null, Error | null]> {
    if (!file.name.toLowerCase().endsWith(".pdf")) return [null, new Error("Envie um arquivo PDF.")];

    const [[usuario, usuarioErr], [tipificacoes, tipificacoesErr]] = await Promise.all([
        obterUsuarioAtual(),
        listarTipificacoes(),
    ]);

    if (usuarioErr) return [null, usuarioErr];
    if (tipificacoesErr) return [null, tipificacoesErr];
    if (!usuario) return [null, new Error("Não foi possível identificar o usuário atual.")];
    if (tipificacoes.length === 0) return [null, new Error("Nenhuma tipificação foi encontrada para criar a conversa.")];

    const [documento, documentoErr] = await criarDocumentoConversaAvulsa({
        file,
        usuario,
        tipificacao: tipificacoes[0],
    });

    if (documentoErr) return [null, documentoErr];
    if (!documento?.data) return [null, new Error("A API não retornou a conversa criada.")];

    const [, releaseErr] = await enviarArquivoConversa(documento.data.id, file);
    if (releaseErr) return [null, releaseErr];

    return [normalizarConversaOiac(documento.data), null];
}
