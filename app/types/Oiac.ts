export type TipoMentionMensagem = "USER" | "MESSAGE" | "SOURCE" | "TYPIFICATION" | "TAXONOMY" | "BRANCH" | "AI";

export type MentionMensagem = {
    id: string;
    type: TipoMentionMensagem;
    label?: string | null;
};

export type MensagemDocumento = {
    id: string;
    content: string;
    mentions?: MentionMensagem[] | null;
    document_id: string;
    release_id?: string | null;
    created_at: string;
    updated_at?: string | null;
};

export type RespostaMensagensDocumento = {
    messages: MensagemDocumento[];
};

export type ConversaOiac = {
    id: string;
    name: string;
    title?: string | null;
    identifier?: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string | null;
    source?: string | null;
};

export type RespostaConversasOiac = {
    documents: ConversaOiac[];
};

export type ItemConversaAgrupadaOiac = {
    id: string;
    label: string;
    description?: string;
    backendDocumentId?: string;
    projectDocumentId?: string;
    releaseId?: string;
    filePath?: string;
    fileName?: string;
    updatedAt?: string;
    available: boolean;
    unavailableReason?: string;
};

export type GrupoConversasAgrupadasOiac = {
    id: string;
    name: string;
    projectId: string;
    projectName: string;
    items: ItemConversaAgrupadaOiac[];
};

export type ProjetoConversasAgrupadasOiac = {
    id: string;
    name: string;
    groups: GrupoConversasAgrupadasOiac[];
};
