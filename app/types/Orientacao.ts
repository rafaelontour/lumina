import type { UsuarioAutenticado } from "./Autenticacao";

export type PapelOrientacao = "MAIN_ADVISOR" | "CO_ADVISOR" | "EVALUATOR";
export type StatusOrientacao = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type ProjetoOrientacao = {
    id: string;
    name: string;
    status: string;
};

export type CartaoOrientador = {
    advisorship_id: string;
    role_type: PapelOrientacao;
    topic?: string | null;
    status: StatusOrientacao;
    advisor: UsuarioAutenticado;
    project?: ProjetoOrientacao | null;
};

export type CartaoOrientando = {
    advisorship_id: string;
    role_type: PapelOrientacao;
    topic?: string | null;
    status: StatusOrientacao;
    advisee: UsuarioAutenticado;
    project?: ProjetoOrientacao | null;
    total_documents?: number;
    pending_reviews?: number;
};

export type VinculoOrientacao = {
    id: string;
    advisor_id: string;
    advisee_id: string;
    role_type: PapelOrientacao;
    status: StatusOrientacao;
};

export type RespostaMeusOrientadores = {
    advisors: CartaoOrientador[];
};

export type RespostaMeusOrientandos = {
    advisees: CartaoOrientando[];
};
