import { BookCheck } from "lucide-react";

import PaginaEmConstrucao from "@/app/components/PaginaEmConstrucao";

export default function ConformidadeAbntPage() {
    return (
        <PaginaEmConstrucao
            titulo="Conformidade ABNT"
            descricao="A validação ABNT reunirá verificações de citações, referências, formatação e elementos normativos do documento."
            icone={BookCheck}
        />
    );
}
