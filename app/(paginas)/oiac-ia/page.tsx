import OiacIaChat from "@/app/components/OiacIaChat";

type OiacIaPageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function primeiroParametro(valor: string | string[] | undefined) {
    return Array.isArray(valor) ? valor[0] : valor;
}

export default async function OiacIaPage({ searchParams }: Readonly<OiacIaPageProps>) {
    const params = await searchParams;
    const documentoInicialId = primeiroParametro(params.externalDocumentId) ?? primeiroParametro(params.documentId);
    const tituloInicial = primeiroParametro(params.project);
    const projectDocumentIdInicial = primeiroParametro(params.projectDocumentId);
    const releaseIdInicial = primeiroParametro(params.releaseId);
    const filePathInicial = primeiroParametro(params.filePath);

    return (
        <OiacIaChat
            documentoInicialId={documentoInicialId}
            projectDocumentIdInicial={projectDocumentIdInicial}
            tituloInicial={tituloInicial}
            releaseIdInicial={releaseIdInicial}
            filePathInicial={filePathInicial}
        />
    );
}
