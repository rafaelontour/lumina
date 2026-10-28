export type TipoAnexoEstudo = "TYPIFICATION" | "DOI" | "LINK";

export type AnexoEstudo = {
    id: string;
    document_group_item_id: string;
    kind: TipoAnexoEstudo;
    position: number;
    description?: string | null;
    title?: string | null;
    typification?: { id: string; name: string } | null;
    doi?: string | null;
    doi_url?: string | null;
    authors: string[];
    year?: number | null;
    container_title?: string | null;
    metadata_source?: string | null;
    url?: string | null;
    studied?: boolean;
    studied_at?: string | null;
};

export type AnexoEstudoEntrada = {
    kind: TipoAnexoEstudo;
    description?: string | null;
    title?: string | null;
    typification_id?: string | null;
    doi?: string | null;
    url?: string | null;
};

export type AnexoEstudoEdicao = AnexoEstudoEntrada & { id: string };

export type ItemGuiaEstudo = {
    id: string;
    name: string;
    icon_path?: string | null;
    position: number;
    attachments: AnexoEstudo[];
};

export type GuiaEstudo = {
    project_id: string;
    document_group: { id: string; name: string } | null;
    items: ItemGuiaEstudo[];
    total_attachments: number;
    studied_attachments: number;
};
