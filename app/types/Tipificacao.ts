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
