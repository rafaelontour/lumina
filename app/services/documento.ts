import axios from "axios";

import type {
    CriterioAnaliseRelease,
    ComponenteDocumento,
    DocumentoExterno,
    DocumentoProjeto,
    DocumentoProjetoBackend,
    GrupoDocumento,
    ProjetoBackend,
    ReleaseExterno,
    RespostaDocumentosExternos,
    RespostaDocumentosProjetoBackend,
    RespostaGruposDocumento,
    RespostaProjetosBackend,
    RespostaReleasesExternos,
    FonteAnaliseRelease,
    TaxonomiaAnaliseRelease,
    TipificacaoAnaliseRelease,
    UsuarioApi,
} from "@/app/types/Documento";
import type { Tipificacao } from "@/app/types/Tipificacao";
import {
    criarErroApi,
    entrarComCredenciaisFixas,
    executarRequisicao,
    montarUrlApi,
    obterStatusErro,
} from "./autenticacao";

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

export function montarFonteDocumentoProjeto(projectDocumentId: string) {
    return `documentos:${projectDocumentId}`;
}

type RegistroDesconhecido = Record<string, unknown>;

function comoRegistro(valor: unknown): RegistroDesconhecido | null {
    return valor && typeof valor === "object" && !Array.isArray(valor) ? (valor as RegistroDesconhecido) : null;
}

function comoTexto(valor: unknown) {
    return typeof valor === "string" ? valor : undefined;
}

function comoId(valor: unknown) {
    return typeof valor === "string" ? valor : undefined;
}

function comoLista(valor: unknown) {
    return Array.isArray(valor) ? valor : [];
}

function normalizarFontesAnalise(valor: unknown): FonteAnaliseRelease[] {
    return comoLista(valor).flatMap((item) => {
        const fonte = comoRegistro(item);
        if (!fonte) return [];

        return [{
            id: comoId(fonte.id),
            name: comoTexto(fonte.name) ?? "Fonte sem nome",
            description: comoTexto(fonte.description),
        }];
    });
}

function normalizarCriteriosAnalise(valor: unknown): CriterioAnaliseRelease[] {
    return comoLista(valor).flatMap((item) => {
        const criterio = comoRegistro(item);
        if (!criterio) return [];

        const avaliacao = comoRegistro(criterio.evaluation);
        return [{
            id: comoId(criterio.id),
            title: comoTexto(criterio.title) ?? "Critério sem título",
            description: comoTexto(criterio.description),
            evaluation: avaliacao
                ? {
                      feedback: comoTexto(avaliacao.feedback),
                      fulfilled: typeof avaliacao.fulfilled === "boolean" ? avaliacao.fulfilled : undefined,
                      score: typeof avaliacao.score === "number" ? avaliacao.score : undefined,
                  }
                : undefined,
        }];
    });
}

function normalizarTaxonomiasAnalise(valor: unknown): TaxonomiaAnaliseRelease[] {
    return comoLista(valor).flatMap((item) => {
        const taxonomia = comoRegistro(item);
        if (!taxonomia) return [];

        return [{
            id: comoId(taxonomia.id),
            title: comoTexto(taxonomia.title) ?? "Taxonomia sem título",
            description: comoTexto(taxonomia.description),
            branches: normalizarCriteriosAnalise(taxonomia.branches),
            sources: normalizarFontesAnalise(taxonomia.sources),
        }];
    });
}

export function normalizarArvoreAnaliseRelease(valor: unknown): TipificacaoAnaliseRelease[] {
    return comoLista(valor).flatMap((item) => {
        const tipificacao = comoRegistro(item);
        if (!tipificacao) return [];

        return [{
            id: comoId(tipificacao.id),
            name: comoTexto(tipificacao.name) ?? "Tipificação sem nome",
            sources: normalizarFontesAnalise(tipificacao.sources),
            taxonomies: normalizarTaxonomiasAnalise(tipificacao.taxonomies),
        }];
    });
}

export async function obterUsuarioAtual(): Promise<[UsuarioApi | null, Error | null]> {
    let [response, err] = await executarRequisicao(() =>
        axios.get<UsuarioApi>(montarUrlApi("/user/my"), { withCredentials: true })
    );

    if (err && obterStatusErro(err) === 401) {
        const [, loginErr] = await entrarComCredenciaisFixas();
        if (loginErr) return [null, criarErroApi(loginErr, "Não foi possível fazer login.")];

        [response, err] = await executarRequisicao(() =>
            axios.get<UsuarioApi>(montarUrlApi("/user/my"), { withCredentials: true })
        );
    }

    if (err) return [null, criarErroApi(err, "Não foi possível identificar o usuário atual.")];
    return [response?.data ?? null, null];
}

export async function listarGruposDocumento(): Promise<[GrupoDocumento[], Error | null]> {
    let [response, err] = await executarRequisicao(() =>
        axios.get<RespostaGruposDocumento>(montarUrlApi("/document-group"), {
            withCredentials: true,
            headers: { "Cache-Control": "no-store" },
        })
    );

    if (err && obterStatusErro(err) === 401) {
        const [, loginErr] = await entrarComCredenciaisFixas();
        if (loginErr) return [[], criarErroApi(loginErr, "Não foi possível fazer login.")];

        [response, err] = await executarRequisicao(() =>
            axios.get<RespostaGruposDocumento>(montarUrlApi("/document-group"), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
            })
        );
    }

    if (err) return [[], criarErroApi(err, "Não foi possível carregar os tipos de documento.")];

    const grupos = response?.data.groups;
    return [Array.isArray(grupos) ? grupos : [], null];
}

export async function listarProjetosDocumento(): Promise<[ProjetoBackend[], Error | null]> {
    const [response, err] = await refazerComLogin(
        () =>
            axios.get<RespostaProjetosBackend>(montarUrlApi("/project"), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
                params: { limit: 100 },
            }),
        "Não foi possível carregar os projetos."
    );

    if (err) return [[], err];
    const projetos = response?.data.projects;
    return [Array.isArray(projetos) ? projetos : [], null];
}

export async function criarProjetoDocumentoBackend({
    nome,
    descricao,
    documentGroupId,
}: {
    nome: string;
    descricao?: string;
    documentGroupId?: string;
}): Promise<[ProjetoBackend | null, Error | null]> {
    const [response, err] = await refazerComLogin(
        () =>
            axios.post<ProjetoBackend>(
                montarUrlApi("/project"),
                {
                    name: nome,
                    description: descricao ?? null,
                    document_group_id: documentGroupId ?? null,
                },
                { withCredentials: true }
            ),
        "Não foi possível criar o projeto."
    );

    if (err) return [null, err];
    return [response?.data ?? null, null];
}

export async function atualizarProjetoDocumentoBackend({
    projectId,
    nome,
}: {
    projectId: string;
    nome: string;
}): Promise<[ProjetoBackend | null, Error | null]> {
    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) return [null, new Error("Informe um nome para o projeto.")];

    const [response, err] = await refazerComLogin(
        () =>
            axios.put<ProjetoBackend>(
                montarUrlApi("/project"),
                {
                    id: projectId,
                    name: nomeNormalizado,
                },
                { withCredentials: true }
            ),
        "Não foi possível atualizar o nome do projeto."
    );

    if (err) return [null, err];
    return [response?.data ?? null, null];
}

export async function apagarProjetoDocumentoBackend(projectId: string): Promise<[boolean, Error | null]> {
    const [, err] = await refazerComLogin(
        () => axios.delete(montarUrlApi(`/project/${encodeURIComponent(projectId)}`), { withCredentials: true }),
        "Não foi possível apagar o projeto."
    );

    if (err) return [false, err];
    return [true, null];
}

export async function listarDocumentosProjetoBackend(projectId: string): Promise<[DocumentoProjetoBackend[], Error | null]> {
    const [response, err] = await refazerComLogin(
        () =>
            axios.get<RespostaDocumentosProjetoBackend>(
                montarUrlApi(`/project-document/by-project/${encodeURIComponent(projectId)}`),
                {
                    withCredentials: true,
                    headers: { "Cache-Control": "no-store" },
                }
            ),
        "Não foi possível carregar os documentos do projeto."
    );

    if (err) return [[], err];
    const documentos = response?.data.documents;
    return [Array.isArray(documentos) ? documentos : [], null];
}

export async function criarDocumentoProjetoBackend({
    projectId,
    nome,
    type,
    typificationIds,
}: {
    projectId: string;
    nome: string;
    type?: string;
    typificationIds?: string[];
}): Promise<[DocumentoProjetoBackend | null, Error | null]> {
    const [response, err] = await refazerComLogin(
        () =>
            axios.post<DocumentoProjetoBackend>(
                montarUrlApi("/project-document"),
                {
                    project_id: projectId,
                    name: nome,
                    type: type ?? null,
                    status: "PENDING",
                    typification_ids: typificationIds ?? null,
                },
                { withCredentials: true }
            ),
        "Não foi possível criar o documento do projeto."
    );

    if (err) return [null, err];
    return [response?.data ?? null, null];
}

export async function criarDocumentoExterno({
    nome,
    descricao,
    editorId,
    projetoNome,
    source,
    tipoDocumento,
    typificationId,
}: {
    nome: string;
    descricao: string;
    editorId: string;
    projetoNome?: string;
    source?: string;
    tipoDocumento?: string;
    typificationId: string;
}): Promise<[DocumentoExterno | null, Error | null]> {
    const [response, err] = await refazerComLogin(
        () =>
            axios.post<DocumentoExterno>(
                montarUrlApi("/doc"),
                {
                    name: nome,
                    identifier: crypto.randomUUID(),
                    description: descricao,
                    tipo_documento: tipoDocumento ?? null,
                    projeto_nome: projetoNome ?? null,
                    source: source ?? null,
                    typification_ids: [typificationId],
                    editors_ids: [editorId],
                },
                { withCredentials: true }
            ),
        "Não foi possível criar o documento na API."
    );

    if (err) return [null, err];
    return [response?.data ?? null, null];
}

export async function listarDocumentosExternosPorFonte(source: string): Promise<[DocumentoExterno[], Error | null]> {
    const [response, err] = await refazerComLogin(
        () =>
            axios.get<RespostaDocumentosExternos>(montarUrlApi("/doc"), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
                params: {
                    limit: 100,
                    source,
                    archived: false,
                },
            }),
        "Não foi possível carregar os documentos enviados."
    );

    if (err) return [[], err];
    const documentos = response?.data.documents;
    return [Array.isArray(documentos) ? documentos : [], null];
}

export async function enviarReleaseDocumento(
    documentId: string,
    file: File
): Promise<[ReleaseExterno | null, Error | null]> {
    const formData = new FormData();
    formData.append("file", file);

    const [response, err] = await refazerComLogin(
        () =>
            axios.post<ReleaseExterno>(montarUrlApi(`/doc/${encodeURIComponent(documentId)}/release`), formData, {
                withCredentials: true,
                timeout: 120000,
            }),
        "Não foi possível enviar o arquivo para a API."
    );

    if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
        return [null, new Error("O backend demorou demais para responder ao envio do arquivo.")];
    }

    if (err) return [null, err];
    return [response?.data ?? null, null];
}

export async function listarReleasesDocumento(documentId: string): Promise<[ReleaseExterno[], Error | null]> {
    let [response, err] = await executarRequisicao(() =>
        axios.get<RespostaReleasesExternos>(montarUrlApi(`/doc/${documentId}/release`), {
            withCredentials: true,
            headers: { "Cache-Control": "no-store" },
        })
    );

    if (err && obterStatusErro(err) === 401) {
        const [, loginErr] = await entrarComCredenciaisFixas();
        if (loginErr) return [[], criarErroApi(loginErr, "Não foi possível fazer login.")];

        [response, err] = await executarRequisicao(() =>
            axios.get<RespostaReleasesExternos>(montarUrlApi(`/doc/${documentId}/release`), {
                withCredentials: true,
                headers: { "Cache-Control": "no-store" },
            })
        );
    }

    if (err) return [[], criarErroApi(err, "Não foi possível verificar a análise da IA.")];

    const releases = response?.data.releases;
    return [Array.isArray(releases) ? releases : [], null];
}

export function selecionarTipificacaoDocumento({
    tipificacoes,
    groupId,
    itemId,
}: {
    tipificacoes: Tipificacao[];
    groupId?: string;
    itemId?: string;
}) {
    const porItem = tipificacoes.find((tipificacao) => tipificacao.document_group_item_id === itemId);
    if (porItem) return porItem.id;

    const porGrupo = tipificacoes.find((tipificacao) => tipificacao.document_group_id === groupId);
    if (porGrupo) return porGrupo.id;

    return tipificacoes[0]?.id;
}

export function releasePossuiAnalise(release?: ReleaseExterno) {
    return Array.isArray(release?.check_tree) && release.check_tree.length > 0;
}

export function selecionarReleaseAnalisado(releases: ReleaseExterno[], releaseIdPreferido?: string) {
    const preferido = releases.find((release) => release.id === releaseIdPreferido);
    if (releasePossuiAnalise(preferido)) return preferido;
    return releases.find(releasePossuiAnalise);
}

function documentoMaisRecente(documentos: DocumentoExterno[]) {
    return [...documentos].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    )[0];
}

function ultimaRelease(releases: ReleaseExterno[]) {
    return releases[0];
}

function ordenarDocumentosProjetoPorGrupo(
    projectDocuments: DocumentoProjetoBackend[],
    grupo?: GrupoDocumento
) {
    const ordemItens = new Map((grupo?.items ?? []).map((item, index) => [item.id, index]));

    return [...projectDocuments].sort((a, b) => {
        const ordemA = a.type ? ordemItens.get(a.type) : undefined;
        const ordemB = b.type ? ordemItens.get(b.type) : undefined;

        if (ordemA !== undefined || ordemB !== undefined) {
            return (ordemA ?? Number.MAX_SAFE_INTEGER) - (ordemB ?? Number.MAX_SAFE_INTEGER);
        }

        const numeroA = Number(a.number);
        const numeroB = Number(b.number);
        if (Number.isFinite(numeroA) || Number.isFinite(numeroB)) {
            return (Number.isFinite(numeroA) ? numeroA : Number.MAX_SAFE_INTEGER) -
                (Number.isFinite(numeroB) ? numeroB : Number.MAX_SAFE_INTEGER);
        }

        return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
    });
}

export async function carregarWorkspaceDocumentos(): Promise<[DocumentoProjeto[], Error | null]> {
    const [[projetos, projetosErr], [grupos, gruposErr]] = await Promise.all([
        listarProjetosDocumento(),
        listarGruposDocumento(),
    ]);

    if (projetosErr) return [[], projetosErr];
    if (gruposErr) return [[], gruposErr];

    const gruposPorId = new Map(grupos.map((grupo) => [grupo.id, grupo]));

    try {
        const documentos = await Promise.all(
            projetos.map(async (projeto) => {
                const [projectDocuments, projectDocumentsErr] = await listarDocumentosProjetoBackend(projeto.id);
                if (projectDocumentsErr) throw projectDocumentsErr;

                const grupo = projeto.document_group_id ? gruposPorId.get(projeto.document_group_id) : undefined;
                const itensPorId = new Map((grupo?.items ?? []).map((item) => [item.id, item]));

                const projectDocumentsOrdenados = ordenarDocumentosProjetoPorGrupo(projectDocuments, grupo);
                const components: ComponenteDocumento[] = await Promise.all(
                    projectDocumentsOrdenados.map(async (projectDocument) => {
                        const item = projectDocument.type ? itensPorId.get(projectDocument.type) : undefined;
                        const [documentosExternos, documentosExternosErr] = await listarDocumentosExternosPorFonte(
                            montarFonteDocumentoProjeto(projectDocument.id)
                        );
                        if (documentosExternosErr) throw documentosExternosErr;

                        const backendDocument = documentoMaisRecente(documentosExternos);
                        const [releases, releasesErr]: [ReleaseExterno[], Error | null] = backendDocument
                            ? await listarReleasesDocumento(backendDocument.id)
                            : [[], null];
                        if (releasesErr) throw releasesErr;

                        const latestRelease = ultimaRelease(releases);
                        const releaseAnalisado = selecionarReleaseAnalisado(releases, latestRelease?.id);
                        const analysisReady = Boolean(releaseAnalisado);

                        return {
                            key: projectDocument.id,
                            projectDocumentId: projectDocument.id,
                            backendDocumentId: backendDocument?.id,
                            itemId: item?.id ?? projectDocument.type ?? undefined,
                            groupId: grupo?.id,
                            iconPath: item?.icon_path ?? null,
                            label: projectDocument.name,
                            description: `Envie o arquivo correspondente à seção ${projectDocument.name}.`,
                            versions:
                                backendDocument && latestRelease
                                    ? [
                                          {
                                              id: latestRelease.id,
                                              documentId: backendDocument.id,
                                              externalDocumentId: backendDocument.id,
                                              externalReleaseId: latestRelease.id,
                                              filePath: latestRelease.file_path,
                                              analysisStatus: analysisReady ? "ready" as const : "pending" as const,
                                              analysisCheckedAt: new Date().toISOString(),
                                              fileName: backendDocument.name || projectDocument.name,
                                              uploadedAt: latestRelease.created_at,
                                              pageCount: 0,
                                              feedbackCount: releaseAnalisado?.check_tree?.length ?? 0,
                                              highCount: 0,
                                              mediumCount: 0,
                                              lowCount: 0,
                                              status: analysisReady ? "ok" as const : "needs_review" as const,
                                          },
                                      ]
                                    : [],
                        };
                    })
                );

                return {
                    id: projeto.id,
                    title: projeto.name,
                    kind: grupo?.name ?? "Documento",
                    groupId: projeto.document_group_id ?? undefined,
                    createdAt: projeto.created_at,
                    components,
                };
            })
        );

        return [documentos, null];
    } catch (error) {
        return [[], error instanceof Error ? error : new Error("Não foi possível montar o workspace de documentos.")];
    }
}
