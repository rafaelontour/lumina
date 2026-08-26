export type CredenciaisLogin = {
    username: string;
    password: string;
};

export type NivelAcesso = "DEFAULT" | "ADMIN" | "ANALYST" | "AUDITOR";
export type NivelAcessoGerenciavel = Extract<NivelAcesso, "DEFAULT" | "ADMIN">;

export type DadosCadastroUsuario = {
    username: string;
    email: string;
    phone_number: string;
    password: string;
    access_level: "DEFAULT";
};

export type FotoPerfilUsuario = {
    id: string;
    file_path: string;
    type: string;
    created_at: string;
};

export type UsuarioAutenticado = {
    id: string;
    username: string;
    email: string;
    phone_number?: string;
    access_level?: NivelAcesso;
    created_at?: string;
    updated_at?: string | null;
    icon?: FotoPerfilUsuario | null;
};

export type RespostaUsuarios = {
    users: UsuarioAutenticado[];
};

export type DadosAtualizacaoPerfil = {
    id: string;
    username: string;
    email: string;
    phone_number: string;
    access_level?: NivelAcesso;
};
