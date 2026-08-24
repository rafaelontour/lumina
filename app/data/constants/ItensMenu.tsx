import {
    BookCheck,
    Bot,
    BriefcaseBusiness,
    FileCheck2,
    Files,
    Home,
    ListTree,
    UsersRound,
    type LucideIcon,
} from "lucide-react";

export type ItemMenu = {
    nome: string;
    href: string;
    icone: LucideIcon;
    apenasAdmin?: boolean;
    apenasNaoAdmin?: boolean;
};

export const itensMenu: ItemMenu[] = [
    {
        nome: "Início",
        href: "/",
        icone: Home,
    },
    {
        nome: "Oiac IA",
        href: "/oiac-ia",
        icone: Bot,
    }, 
    {
        nome: "Documentos",
        href: "/documentos",
        icone: BriefcaseBusiness,
        apenasNaoAdmin: true,
    },
    {
        nome: "Meus orientandos",
        href: "/documentos/orientandos",
        icone: UsersRound,
        apenasAdmin: true,
    },
    {
        nome: "Templates",
        href: "/templates",
        icone: Files,
        apenasAdmin: true,
    },
    {
        nome: "Tipificações",
        href: "/tipificacoes",
        icone: ListTree,
    },
    {
        nome: "Conformidade Template",
        href: "/conformidade-template",
        icone: FileCheck2,
    },
    {
       nome: "Conformidade ABNT",
       href: "/conformidade-abnt",
       icone: BookCheck,
    }
]
