"use client";

import Link from "next/link";

import { itensMenu } from "../data/constants/ItensMenu";
import { useAuth } from "../data/provider/AuthProvider";
import AvatarUsuario from "./AvatarUsuario";
import MenuItem from "./MenuItem";

export default function MenuLateral() {
    const { usuario } = useAuth();
    const administrador = usuario?.access_level === "ADMIN";
    const itensVisiveis = itensMenu.filter(
        (item) => (!item.apenasAdmin || administrador) && (!item.apenasNaoAdmin || !administrador)
    );

    return (
        <aside
            aria-label="Menu principal"
            className="
                relative z-10 flex min-h-0 flex-col overflow-hidden bg-toolbar-bg px-3 py-3
                shadow-[12px_0_28px_-24px_var(--chrome-shadow)]
                group-[.menu-recolhido]/app:px-2.5
            "
        >
            <nav className="grid gap-2">
                {itensVisiveis.map((item) => (
                    <MenuItem
                        key={item.nome}
                        nome={item.nome}
                        href={item.href}
                        icone={item.icone}
                    />
                ))}
            </nav>
            {usuario ? (
                <Link
                    className="absolute bottom-3 left-3 right-3 h-14 rounded-lg p-2 text-ink no-underline group-[.menu-recolhido]/app:right-0"
                    href="/perfil"
                    title="Ver perfil"
                    aria-label={`Ver perfil de ${usuario.username}`}
                >
                    <AvatarUsuario className="absolute left-[11px] top-2 size-10 group-[.menu-recolhido]/app:left-px" usuario={usuario} />
                    <span className="absolute left-14 top-2 min-w-0 group-[.menu-recolhido]/app:hidden">
                        <strong className="block overflow-hidden text-ellipsis whitespace-nowrap font-display text-sm">{usuario.username}</strong>
                        <span className="mt-0.5 block text-xs font-semibold text-muted">Ver perfil</span>
                    </span>
                </Link>
            ) : null}
        </aside>
    )
}
