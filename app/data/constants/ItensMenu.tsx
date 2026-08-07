import {
    BookCheck,
    Bot,
    BriefcaseBusiness,
    FileCheck2,
    Home,
    ListTree,
    type LucideIcon,
} from "lucide-react";

export type ItemMenu = {
    nome: string;
    href: string;
    icone: LucideIcon;
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
