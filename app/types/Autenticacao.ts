export type CredenciaisLogin = {
    username: string;
    password: string;
};

export type NivelAcesso = "DEFAULT" | "ADMIN" | "ANALYST" | "AUDITOR";

export type UsuarioAutenticado = {
    id: string;
    username: string;
    email: string;
    phone_number?: string;
    access_level?: NivelAcesso;
};
