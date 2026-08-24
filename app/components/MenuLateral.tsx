"use client";

import { itensMenu } from "../data/constants/ItensMenu";
import { useAuth } from "../data/provider/AuthProvider";
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
                relative z-10 min-h-0 overflow-hidden bg-toolbar-bg px-3 py-3
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
        </aside>
    )
}
