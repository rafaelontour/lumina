import { MapPin } from "lucide-react";
import { isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import BotaoComTitulo from "@/app/components/BotaoComTitulo";
import type { ReferenciaDocumentoAnaliseRelease } from "@/app/types/Documento";

const prefixoLinkEvidencia = "#lumina-evidencia-";

type MarkdownAnaliseProps = {
    children: string;
    className?: string;
    destacarTitulosSintese?: boolean;
    compacto?: boolean;
    references?: ReferenciaDocumentoAnaliseRelease[];
    onSelecionarEvidencia?: (referencia: ReferenciaDocumentoAnaliseRelease) => void;
};

function normalizarTexto(valor: string) {
    return valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function normalizarMarcadoresTipograficos(valor: string) {
    return valor.replace(/[^\S\r\n]*●[^\S\r\n]*/gu, (_marcador, deslocamento: number) =>
        deslocamento === 0 ? "- " : "\n- ",
    );
}

function escaparExpressaoRegular(valor: string) {
    return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function injetarLinksEvidencia(valor: string, references?: ReferenciaDocumentoAnaliseRelease[]) {
    if (!references?.length) return valor;

    const porChunkId = new Map<string, { indice: number; referencia: ReferenciaDocumentoAnaliseRelease }>();
    references.forEach((referencia, indice) => {
        const chunkId = referencia.chunkId?.trim();
        if (chunkId && !porChunkId.has(chunkId)) {
            porChunkId.set(chunkId, { indice, referencia });
        }
    });

    if (porChunkId.size === 0) return valor;

    const idsOrdenados = [...porChunkId.keys()]
        .sort((a, b) => b.length - a.length)
        .map(escaparExpressaoRegular)
        .join("|");

    const padrao = new RegExp(
        `\`(?:chunk_id:\\s*)?(${idsOrdenados})\`|` +
            `\\[(?:FONTE(?:\\s+\\d+)?\\s*\\]\\s*chunk_id:\\s*|chunk_id:\\s*)?(${idsOrdenados})\\]|` +
            `\\((?:chunk_id:\\s*)?(${idsOrdenados})\\)|` +
            `(?<![A-Za-z0-9_-])(?:chunk_id:\\s*)?(${idsOrdenados})(?![A-Za-z0-9_-])`,
        "g"
    );

    return valor.replace(padrao, (correspondencia, g1, g2, g3, g4) => {
        const chunkId = (g1 ?? g2 ?? g3 ?? g4) as string | undefined;
        const entrada = chunkId ? porChunkId.get(chunkId) : undefined;
        if (!entrada) return correspondencia;
        return `[Página ${entrada.referencia.page + 1}](${prefixoLinkEvidencia}${entrada.indice})`;
    });
}

function textoDosFilhos(children: ReactNode): string {
    if (typeof children === "string" || typeof children === "number") return String(children);
    if (Array.isArray(children)) return children.map(textoDosFilhos).join("");
    if (isValidElement<{ children?: ReactNode }>(children)) return textoDosFilhos(children.props.children);
    return "";
}

function classeTituloSintese(children: ReactNode) {
    const titulo = normalizarTexto(textoDosFilhos(children));

    if (titulo === "pontos atendidos") {
        return "border-emerald-600/35 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300";
    }

    if (titulo === "pontos a aprimorar") {
        return "border-laranja/40 bg-laranja/10 text-laranja";
    }

    if (titulo === "orientacao final") {
        return "border-brand/45 bg-panel-soft text-brand";
    }

    return null;
}

export default function MarkdownAnalise({
    children,
    className = "",
    compacto = false,
    destacarTitulosSintese = false,
    onSelecionarEvidencia,
    references,
}: Readonly<MarkdownAnaliseProps>) {
    const components: Components = {
        p: ({ children: conteudo }) => (
            <p className={compacto ? "leading-6" : "leading-7 md:leading-8"}>{conteudo}</p>
        ),
        strong: ({ children: conteudo }) => <strong className="font-bold text-ink">{conteudo}</strong>,
        ul: ({ children: conteudo }) => (
            <ul className="block list-disc space-y-1 pl-5 marker:text-accent">{conteudo}</ul>
        ),
        ol: ({ children: conteudo }) => (
            <ol className="block list-decimal space-y-1 pl-5 marker:font-bold marker:text-accent">{conteudo}</ol>
        ),
        li: ({ children: conteudo }) => <li className="list-item w-full pl-1 leading-6">{conteudo}</li>,
        h1: ({ children: conteudo }) => {
            const classeDestaque = destacarTitulosSintese ? classeTituloSintese(conteudo) : null;

            if (classeDestaque) {
                return (
                    <h1 className={`mt-1 w-fit rounded-md border px-3 py-1.5 font-display text-base font-bold leading-6 md:text-lg ${classeDestaque}`}>
                        {conteudo}
                    </h1>
                );
            }

            return <h1 className="mt-2 font-display text-lg font-bold leading-7 text-ink md:text-xl">{conteudo}</h1>;
        },
        h2: ({ children: conteudo }) => <h2 className="mt-2 font-display text-lg font-bold leading-7 text-ink">{conteudo}</h2>,
        h3: ({ children: conteudo }) => <h3 className="mt-2 font-display text-base font-bold leading-6 text-ink">{conteudo}</h3>,
        h4: ({ children: conteudo }) => <h4 className="mt-2 font-display text-sm font-bold leading-6 text-ink">{conteudo}</h4>,
        h5: ({ children: conteudo }) => <h5 className="mt-2 font-display text-sm font-bold leading-6 text-ink">{conteudo}</h5>,
        h6: ({ children: conteudo }) => <h6 className="mt-2 font-display text-xs font-bold uppercase tracking-wide text-ink">{conteudo}</h6>,
        blockquote: ({ children: conteudo }) => (
            <blockquote className="border-l-2 border-accent/55 pl-3 text-muted">{conteudo}</blockquote>
        ),
        a: ({ children: conteudo, href }) => {
            if (href?.startsWith(prefixoLinkEvidencia) && onSelecionarEvidencia) {
                const indice = Number(href.slice(prefixoLinkEvidencia.length));
                const referencia = Number.isInteger(indice) ? references?.[indice] : undefined;

                if (referencia) {
                    return (
                        <BotaoComTitulo
                            className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-brand/45 bg-subtle-hover px-2 py-0.5 align-baseline text-xs font-bold text-brand transition hover:border-brand hover:bg-brand hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
                            title={referencia.textSnippet || `Localizar evidência na página ${referencia.page + 1}`}
                            type="button"
                            onClick={() => onSelecionarEvidencia(referencia)}
                        >
                            <MapPin aria-hidden="true" size={13} />
                            {conteudo}
                        </BotaoComTitulo>
                    );
                }
            }

            return (
                <a className="font-semibold text-brand underline underline-offset-2" href={href} rel="noreferrer" target="_blank">
                    {conteudo}
                </a>
            );
        },
        code: ({ children: conteudo }) => (
            <code className="rounded bg-input-bg px-1 py-0.5 font-mono text-[0.9em] text-ink">{conteudo}</code>
        ),
        table: ({ children: conteudo }) => (
            <div className="max-w-full overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[34rem] border-collapse text-left text-sm">{conteudo}</table>
            </div>
        ),
        thead: ({ children: conteudo }) => <thead className="bg-panel-soft text-ink">{conteudo}</thead>,
        tbody: ({ children: conteudo }) => <tbody className="divide-y divide-line">{conteudo}</tbody>,
        tr: ({ children: conteudo }) => <tr>{conteudo}</tr>,
        th: ({ children: conteudo }) => (
            <th className="border-r border-line px-3 py-2 font-display font-bold last:border-r-0">{conteudo}</th>
        ),
        td: ({ children: conteudo }) => (
            <td className="border-r border-line px-3 py-2 align-top last:border-r-0">{conteudo}</td>
        ),
        hr: () => <hr className="border-line" />,
    };

    const conteudoPreparado = normalizarMarcadoresTipograficos(
        onSelecionarEvidencia ? injetarLinksEvidencia(children, references) : children
    );

    return (
        <div className={`grid min-w-0 gap-2 text-ink ${className}`}>
            <ReactMarkdown components={components} remarkPlugins={[remarkGfm]} skipHtml>
                {conteudoPreparado}
            </ReactMarkdown>
        </div>
    );
}
