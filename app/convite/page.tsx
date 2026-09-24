import ConviteClient from "./ConviteClient";

type ConvitePageProps = {
    searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ConvitePage({ searchParams }: ConvitePageProps) {
    const parametros = await searchParams;
    const codigo = Array.isArray(parametros.token) ? parametros.token[0] : parametros.token;

    return <ConviteClient codigo={codigo?.trim() ?? ""} />;
}
