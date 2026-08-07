import axios from "axios";

import type { RespostaTipificacoes, Tipificacao } from "@/app/types/Tipificacao";
import {
    criarErroApi,
    entrarComCredenciaisFixas,
    executarRequisicao,
    montarUrlApi,
    obterStatusErro,
} from "./autenticacao";

async function buscarTipificacoes() {
    return axios.get<RespostaTipificacoes>(montarUrlApi("/typification?limit=100"), {
        withCredentials: true,
    });
}

export async function listarTipificacoes(): Promise<[Tipificacao[], Error | null]> {
    let [response, err] = await executarRequisicao(buscarTipificacoes);

    if (err && obterStatusErro(err) === 401) {
        const [, loginErr] = await entrarComCredenciaisFixas();
        if (loginErr) {
            return [[], criarErroApi(loginErr, "Não foi possível fazer login.")];
        }

        [response, err] = await executarRequisicao(buscarTipificacoes);
    }

    if (err) {
        return [[], criarErroApi(err, "Não foi possível carregar as tipificações.")];
    }

    const tipificacoes = response?.data.typifications;
    return [Array.isArray(tipificacoes) ? tipificacoes : [], null];
}
