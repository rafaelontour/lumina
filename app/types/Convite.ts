import type { UsuarioAutenticado } from "./Autenticacao";
import type { PapelOrientacao, VinculoOrientacao } from "./Orientacao";

export type StatusConvite = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export type DadosCriacaoConvite = {
    email: string;
    role_type?: PapelOrientacao;
    project_id?: string | null;
    topic?: string | null;
};

export type ConviteCriado = {
    id: string;
    email: string;
    inviter_id: string;
    token: string;
    project_id?: string | null;
    role_type: PapelOrientacao | string;
    topic?: string | null;
    status: StatusConvite | string;
    expires_at: string;
    created_at: string;
    updated_at?: string | null;
    accepted_at?: string | null;
    rejected_at?: string | null;
};

export type RespostaListaConvites = {
    invitations: ConviteCriado[];
};

export type ConvitePublico = {
    token: string;
    email: string;
    status: StatusConvite | string;
    is_valid: boolean;
    is_expired: boolean;
    user_exists: boolean;
    inviter_name: string;
    inviter_email: string;
    project_title?: string | null;
    topic?: string | null;
    role_type: PapelOrientacao | string;
    expires_at: string;
};

export type DadosCadastroPorConvite = {
    username: string;
    phone_number: string;
    password: string;
};

export type CadastroPorConviteConcluido = {
    message: string;
    user: UsuarioAutenticado;
    invitation: ConviteCriado;
    advisorship?: VinculoOrientacao | null;
};

export type AceiteConviteConcluido = {
    message: string;
    invitation: ConviteCriado;
    advisorship?: VinculoOrientacao | null;
};
