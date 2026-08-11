import { z } from "zod";

export const RamoSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
});

export const TaxonomiaSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    branches: z.array(RamoSchema),
});

export const TipificacaoSchema = z.object({
    id: z.string(),
    name: z.string(),
    document_group_id: z.string().nullable(),
    document_group_item_id: z.string().nullable(),
    taxonomies: z.array(TaxonomiaSchema),
});

export const RespostaTipificacoesSchema = z.object({
    typifications: z.array(TipificacaoSchema),
});

export type Ramo = z.infer<typeof RamoSchema>;
export type Taxonomia = z.infer<typeof TaxonomiaSchema>;
export type Tipificacao = z.infer<typeof TipificacaoSchema>;
export type RespostaTipificacoes = z.infer<typeof RespostaTipificacoesSchema>;

export interface RamoRascunho {
    chave: string;
    title: string;
    description: string;
}

export interface TaxonomiaRascunho {
    chave: string;
    title: string;
    description: string;
    branches: RamoRascunho[];
}

export interface TipificacaoRascunho {
    name: string;
    taxonomies: TaxonomiaRascunho[];
}

export interface RamoEdicaoRascunho extends RamoRascunho {
    id?: string;
}

export interface TaxonomiaEdicaoRascunho extends Omit<TaxonomiaRascunho, "branches"> {
    id?: string;
    branches: RamoEdicaoRascunho[];
}

export interface TipificacaoEdicaoRascunho extends Omit<TipificacaoRascunho, "taxonomies"> {
    id: string;
    taxonomies: TaxonomiaEdicaoRascunho[];
}
