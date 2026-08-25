export type StatusProcessamentoConformidade = "processing" | "completed" | "error";

export type RespostaListaTemplatesConformidade = {
    templates: TemplateConformidade[];
};

export type TemplateConformidade = {
    id: string;
    name: string;
    original_filename: string;
    file_path: string;
    created_at: string;
    updated_at?: string | null;
};

export type ResultadoConformidadeTemplate = {
    id?: string;
    doc_id: string;
    status: StatusProcessamentoConformidade;
    updated_at: string;
    report: Record<string, unknown> | null;
    error: string | null;
};

export type ResultadoConformidadeAbnt = {
    id?: string;
    doc_id: string;
    status: StatusProcessamentoConformidade;
    updated_at: string;
    report: Record<string, unknown> | null;
    error: string | null;
};

export type ResultadoProcessamentoConformidade = {
    id: string;
    doc_id: string;
    status: StatusProcessamentoConformidade;
    file_path: string;
    created_at: string;
    updated_at: string;
    report?: Record<string, unknown> | null;
    error?: string | null;
};

export type RespostaListaResultadosConformidade = {
    count: number;
    results: ResultadoProcessamentoConformidade[];
};

export type AceiteProcessamentoConformidade = {
    doc_id: string;
    status: StatusProcessamentoConformidade;
};

export type ComparacaoDeterministicaTemplate = {
    field: string;
    template_value: string;
    article_value: string;
    match: boolean;
};

export type AvaliacaoVisualTemplate = {
    criteria_item: string;
    justification: string;
};

export type CriterioRelatorioTemplate = {
    id: string;
    title: string;
    match: boolean;
    is_visual: boolean;
    checks: ComparacaoDeterministicaTemplate[];
    criteria: AvaliacaoVisualTemplate[];
};

export type SecaoRelatorioTemplate = {
    id: string;
    title: string;
    template_pages: number[];
    article_pages: number[];
    match: boolean;
    criteria: CriterioRelatorioTemplate[];
};

export type RelatorioConformidadeTemplate = {
    metadata?: {
        approach?: string;
        model?: string;
        template_file?: string;
        article_file?: string;
    };
    summary?: {
        is_compliant?: boolean;
        sections_total?: number;
        sections_passed?: number;
        description?: string;
    };
    sections: SecaoRelatorioTemplate[];
};

export type AlvoDocumentoConformidade = {
    id: string;
    projectId: string;
    projectTitle: string;
    projectKind: string;
    componentKey: string;
    componentLabel: string;
    documentId?: string;
    releaseId?: string;
    filePath?: string;
    fileName?: string;
    uploadedAt?: string;
    novaVersaoEmAnalise?: boolean;
};
