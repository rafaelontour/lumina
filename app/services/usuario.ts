import axios from "axios";

import type { NivelAcessoGerenciavel, RespostaUsuarios, UsuarioAutenticado } from "@/app/types/Autenticacao";
import { criarErroApi, executarRequisicao, montarUrlApi } from "./autenticacao";

export async function listarUsuarios(consulta = ""): Promise<[UsuarioAutenticado[], Error | null]> {
    const [response, err] = await executarRequisicao(() =>
        axios.get<RespostaUsuarios>(montarUrlApi("/user"), {
            withCredentials: true,
            headers: { "Cache-Control": "no-store" },
            params: { limit: 100, ...(consulta.trim() ? { q: consulta.trim() } : {}) },
        })
    );

    if (err) return [[], criarErroApi(err, "Não foi possível carregar os usuários.")];
    const usuarios = response?.data.users;
    return [Array.isArray(usuarios) ? usuarios : [], null];
}

export async function removerUsuario(userId: string): Promise<[true | null, Error | null]> {
    const [, err] = await executarRequisicao(() =>
        axios.delete(montarUrlApi(`/user/${encodeURIComponent(userId)}`), { withCredentials: true })
    );

    return err ? [null, criarErroApi(err, "Não foi possível remover o usuário.")] : [true, null];
}

export async function atualizarNivelAcessoUsuario({
    usuario,
    nivelAcesso,
}: {
    usuario: UsuarioAutenticado;
    nivelAcesso: NivelAcessoGerenciavel;
}): Promise<[UsuarioAutenticado | null, Error | null]> {
    if (!usuario.phone_number) {
        return [null, new Error("Não foi possível atualizar o acesso porque o telefone do usuário não está disponível.")];
    }

    const [response, err] = await executarRequisicao(() =>
        axios.put<UsuarioAutenticado>(
            montarUrlApi("/user"),
            {
                id: usuario.id,
                username: usuario.username,
                email: usuario.email,
                phone_number: usuario.phone_number,
                access_level: nivelAcesso,
            },
            { withCredentials: true }
        )
    );

    if (err || !response?.data) return [null, criarErroApi(err, "Não foi possível atualizar o nível de acesso.")];
    return [response.data, null];
}
