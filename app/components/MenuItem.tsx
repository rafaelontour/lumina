"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

interface MenuItemProps {
    nome: string;
    href: string;
    icone: LucideIcon;
}

export default function MenuItem({ nome, href, icone: Icone }: MenuItemProps) {
    const pathname = usePathname();
    const estaAtivo = pathname === href;

    return (
        <Link
            href={href}
            title={nome}
            className={`
                grid min-h-11 grid-cols-[22px_minmax(0,1fr)] items-center gap-3 rounded-lg border px-3
                font-semibold text-muted no-underline transition-colors
                group-[.menu-recolhido]/app:grid-cols-1 group-[.menu-recolhido]/app:justify-items-start
  ${estaAtivo ? "border-brand/30 bg-brand/75 text-white dark:text-preto" : "border-transparent hover:border-line hover:bg-subtle-hover hover:text-ink dark:hover:bg-white dark:hover:text-preto"}
            `}
        >
            <Icone className="text-current" size={20} />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap font-display font-semibold group-[.menu-recolhido]/app:hidden">
                {nome}
            </span>
        </Link>
    )
}
