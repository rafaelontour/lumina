import OiacIaChat from "@/app/components/OiacIaChat";
import { cookies } from "next/headers";

const COOKIE_PAINEL_CONVERSAS_RECOLHIDO = "lumina-oiac-conversas-recolhido";

type OiacIaPageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function primeiroParametro(valor: string | string[] | undefined) {
    return Array.isArray(valor) ? valor[0] : valor;
}

export default async function OiacIaPage({ searchParams }: Readonly<OiacIaPageProps>) {
    const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
    const documentoInicialId = primeiroParametro(params.externalDocumentId) ?? primeiroParametro(params.documentId);
    const tituloInicial = primeiroParametro(params.project);
    const projectDocumentIdInicial = primeiroParametro(params.projectDocumentId);
    const releaseIdInicial = primeiroParametro(params.releaseId);
    const filePathInicial = primeiroParametro(params.filePath);
    const conversasRecolhidasInicialmente = cookieStore.get(COOKIE_PAINEL_CONVERSAS_RECOLHIDO)?.value === "true";

    return (
        <OiacIaChat
            conversasRecolhidasInicialmente={conversasRecolhidasInicialmente}
            documentoInicialId={documentoInicialId}
            projectDocumentIdInicial={projectDocumentIdInicial}
            tituloInicial={tituloInicial}
            releaseIdInicial={releaseIdInicial}
            filePathInicial={filePathInicial}
        />
    );
}
