"use client";

import { forwardRef, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";

function textoVisivel(node: ReactNode): string {
    if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return String(node);
    if (Array.isArray(node)) return node.map(textoVisivel).filter(Boolean).join(" ");
    if (isValidElement<{ children?: ReactNode }>(node)) return textoVisivel(node.props.children);
    return "";
}

const BotaoComTitulo = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button">>(function BotaoComTitulo(
    { children, title, "aria-label": ariaLabel, ...props },
    ref
) {
    const texto = textoVisivel(children).replace(/\s+/g, " ").trim().slice(0, 160);
    const titulo = title?.trim() || ariaLabel?.trim() || texto || "Ação da interface";

    return (
        <button ref={ref} {...props} aria-label={ariaLabel} title={titulo}>
            {children}
        </button>
    );
});

BotaoComTitulo.displayName = "BotaoComTitulo";

export default BotaoComTitulo;
