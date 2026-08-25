"use client";
/* eslint-disable @next/next/no-img-element -- a imagem é autenticada pelo cookie do navegador no proxy interno. */

import { useState } from "react";

import { montarUrlApi } from "@/app/services/autenticacao";
import type { UsuarioAutenticado } from "@/app/types/Autenticacao";

type AvatarUsuarioProps = {
    usuario: Pick<UsuarioAutenticado, "username" | "icon">;
    className?: string;
    imagemTemporaria?: string | null;
};

function obterIniciais(nome: string) {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    return (partes.length > 1 ? `${partes[0][0]}${partes.at(-1)?.[0] ?? ""}` : partes[0]?.slice(0, 2) ?? "LU").toUpperCase();
}

function obterOrigemImagem(caminho?: string | null) {
    if (!caminho?.trim()) return null;
    if (caminho.startsWith("blob:")) return caminho;

    try {
        const url = new URL(caminho, "http://lumina.local");
        return montarUrlApi(`${url.pathname}${url.search}`);
    } catch {
        return null;
    }
}

export default function AvatarUsuario({ usuario, className = "size-10", imagemTemporaria }: AvatarUsuarioProps) {
    const origem = imagemTemporaria ?? obterOrigemImagem(usuario.icon?.file_path);
    const [origemComErro, setOrigemComErro] = useState<string | null>(null);
    const imagemComErro = Boolean(origem && origemComErro === origem);

    if (origem && !imagemComErro) {
        return (
            <img
                alt={`Foto de perfil de ${usuario.username}`}
                className={`${className} shrink-0 rounded-full border border-line bg-input-bg object-cover`}
                src={origem}
                onError={() => setOrigemComErro(origem)}
            />
        );
    }

    return (
        <span
            aria-label={`Perfil de ${usuario.username}`}
            className={`${className} grid shrink-0 place-items-center rounded-full border border-brand/35 bg-brand/15 font-display text-sm font-bold text-ink`}
        >
            {obterIniciais(usuario.username)}
        </span>
    );
}
