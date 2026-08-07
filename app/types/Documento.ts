export type StatusRevisao = "pending" | "needs_review" | "ok";

export type UsuarioApi = {
    id: string;
    username: string;
    email: string;
};

export type DocumentoExterno = {
    id: string;
    name: string;
    identifier?: string;
    description?: string | null;
    project_document_id?: string | null;
    source?: string | null;
    created_at?: string;
    updated_at?: string | null;
};

export type FonteAnaliseRelease = {
    id?: string;
    name: string;
    description?: string | null;
};

export type AvaliacaoCriterioRelease = {
    feedback?: string | null;
    fulfilled?: boolean | null;
    score?: number | null;
};

export type CriterioAnaliseRelease = {
    id?: string;
    title: string;
    description?: string | null;
    evaluation?: AvaliacaoCriterioRelease | null;
};

export type TaxonomiaAnaliseRelease = {
    id?: string;
    title: string;
    description?: string | null;
    branches?: CriterioAnaliseRelease[];
    sources?: FonteAnaliseRelease[];
};

export type TipificacaoAnaliseRelease = {
    id?: string;
    name: string;
    sources?: FonteAnaliseRelease[];
    taxonomies?: TaxonomiaAnaliseRelease[];
};

export type ReleaseExterno = {
    id: string;
    file_path: string;
    created_at: string;
    description?: string | null;
    check_tree?: TipificacaoAnaliseRelease[];
};

export type RespostaReleasesExternos = {
    releases: ReleaseExterno[];
};

export type RespostaDocumentosExternos = {
    documents: DocumentoExterno[];
};

export type ItemGrupoDocumento = {
    name: string;
    icon_path: string | null;
    id: string;
    group_id: string;
    created_at: string;
    updated_at: string | null;
};

export type GrupoDocumento = {
    name: string;
    id: string;
    items: ItemGrupoDocumento[];
    created_at: string;
    updated_at: string | null;
};

export type RespostaGruposDocumento = {
    groups: GrupoDocumento[];
};

export type ProjetoBackend = {
    id: string;
    name: string;
    description: string | null;
    document_group_id: string | null;
    status: string;
    created_at: string;
    updated_at: string | null;
};

export type RespostaProjetosBackend = {
    projects: ProjetoBackend[];
};

export type DocumentoProjetoBackend = {
    id: string;
    project_id: string;
    name: string;
    type: string | null;
    number: string | null;
    status: string | null;
    responsible: string | null;
    responsibles: string[] | null;
    typification_ids: string[] | null;
    sent_to_kanban: boolean;
    created_at: string;
    updated_at: string | null;
};

export type RespostaDocumentosProjetoBackend = {
    documents: DocumentoProjetoBackend[];
};

export type VersaoDocumento = {
    id: string;
    documentId: string;
    externalDocumentId?: string;
    externalReleaseId?: string;
    filePath?: string;
    analysisStatus?: "pending" | "ready" | "unavailable";
    analysisCheckedAt?: string;
    analysisMessage?: string;
    fileName: string;
    uploadedAt: string;
    pageCount: number;
    feedbackCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    status: Exclude<StatusRevisao, "pending">;
};

export type ComponenteDocumento = {
    key: string;
    label: string;
    description: string;
    projectDocumentId?: string;
    backendDocumentId?: string;
    itemId?: string;
    groupId?: string;
    iconPath?: string | null;
    versions: VersaoDocumento[];
};

export type DocumentoProjeto = {
    id: string;
    title: string;
    kind: string;
    groupId?: string;
    createdAt: string;
    components: ComponenteDocumento[];
};
