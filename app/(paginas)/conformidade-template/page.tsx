import { FileCheck2 } from "lucide-react";

import PaginaEmConstrucao from "@/app/components/PaginaEmConstrucao";

export default function ConformidadeTemplatePage() {
    return (
        <PaginaEmConstrucao
            titulo="Conformidade Template"
            descricao="Esta tela concentrará verificações de estrutura, presença de seções obrigatórias e aderência ao template institucional."
            icone={FileCheck2}
        />
    );
}
