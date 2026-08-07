import axios from "axios";

import { executarRequisicao, montarUrlApi } from "./autenticacao";

export async function listarTemplatesConformidade(): Promise<string[]> {
    const [response] = await executarRequisicao(() =>
        axios.get<{ templates?: string[] }>(montarUrlApi("/template-abnt/templates"), {
            withCredentials: true,
            headers: { "Cache-Control": "no-store" },
        })
    );

    const templates = response?.data.templates;
    return Array.isArray(templates) ? templates : [];
}

export async function enviarConformidadeTemplate(docId: string, file: File, templateName: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("template_name", templateName);

    await executarRequisicao(() =>
        axios.post(montarUrlApi(`/template-abnt/${encodeURIComponent(docId)}/template`), formData, {
            withCredentials: true,
        })
    );
}

export async function enviarConformidadeAbnt(docId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    await executarRequisicao(() =>
        axios.post(montarUrlApi(`/template-abnt/${encodeURIComponent(docId)}/abnt`), formData, {
            withCredentials: true,
        })
    );
}
