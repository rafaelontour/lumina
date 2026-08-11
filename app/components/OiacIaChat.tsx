"use client";

import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Bot,
    Check,
    Edit2,
    ExternalLink,
    FileText,
    Loader2,
    MessageSquare,
    Plus,
    Send,
    Trash2,
    UploadCloud,
    UserRound,
    X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import { normalizarArvoreAnaliseRelease } from "@/app/services/documento";
import {
    apagarConversaOiac,
    atualizarNomeDocumentoOiac,
    baixarArquivoPdfOiac,
    criarConversaAvulsaComPdf,
    enviarMensagemIa,
    listarConversasAgrupadasOiac,
    listarConversasAvulsasOiac,
    listarReleasesDocumentoHandoffOiac,
    listarMensagensDocumento,
    listarReleasesConversaOiac,
    selecionarReleasePreview,
} from "@/app/services/oiac";
import type { FonteAnaliseRelease, ReleaseExterno, TipificacaoAnaliseRelease } from "@/app/types/Documento";
import type {
    ConversaOiac,
    ItemConversaAgrupadaOiac,
    MensagemDocumento,
    ProjetoConversasAgrupadasOiac,
} from "@/app/types/Oiac";

interface OiacIaChatProps {
    documentoInicialId?: string;
    projectDocumentIdInicial?: string;
    releaseIdInicial?: string;
    filePathInicial?: string;
    tituloInicial?: string;
}

type AbaConversasOiac = "avulsas" | "grupos";
type TipoConversaSelecionada = AbaConversasOiac | null;

type ContextoPreviewSelecionado = {
    releaseId?: string;
    filePath?: string;
    projectDocumentId?: string;
};

type AnaliseInicialOiac = {
    contextKey: string;
    releaseId: string;
    content?: string;
    tipificacoes: TipificacaoAnaliseRelease[];
};

type AnaliseInicialPendenteOiac = {
    contextKey: string;
    releaseId: string;
};

const intervaloAtualizacaoAnaliseMs = 3000;

const PdfDocumentViewer = dynamic(() => import("./PdfDocumentViewer"), {
    ssr: false,
    loading: () => (
        <div className="grid min-h-80 place-items-center text-center text-muted">
            <div className="grid justify-items-center gap-3">
                <Loader2 className="animate-spin text-accent" size={34} />
                <span className="text-sm font-semibold">Preparando visualizador...</span>
            </div>
        </div>
    ),
});

function mensagemDaIa(mensagem: MensagemDocumento) {
    return mensagem.mentions?.some((mention) => mention.type === "AI") ?? false;
}

function ordenarMensagens(mensagens: MensagemDocumento[]) {
    return [...mensagens].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
}

function formatarData(valor?: string) {
    if (!valor) return "";
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(valor));
}

function linhaTituloTopico(linha: string) {
    return /^\d+\.\s+\S/.test(linha.trim());
}

function linhaTituloMarkdown(linha: string) {
    return /^#{1,6}\s+\S/.test(linha.trim());
}

function tituloMensagem(linha: string) {
    return linha.trim().replace(/^#{1,6}\s+/, "");
}

function obterAnaliseInicial(release: ReleaseExterno | undefined, contextKey: string): AnaliseInicialOiac | null {
    const tipificacoes = normalizarArvoreAnaliseRelease(release?.check_tree);
    if (!release || tipificacoes.length === 0) return null;

    return { contextKey, releaseId: release.id, content: release.description?.trim() || undefined, tipificacoes };
}

function selecionarReleaseAnalise(releases: ReleaseExterno[], releaseIdPreferido?: string) {
    if (releaseIdPreferido) return releases.find((release) => release.id === releaseIdPreferido);
    return selecionarReleasePreview(releases);
}

function criarMensagemLocalUsuario({
    docId,
    content,
    createdAt,
}: {
    docId: string;
    content: string;
    createdAt: string;
}): MensagemDocumento {
    return {
        id: `local-user-${crypto.randomUUID()}`,
        content,
        document_id: docId,
        release_id: null,
        created_at: createdAt,
        mentions: [
            {
                id: `local-mention-${crypto.randomUUID()}`,
                type: "USER",
                label: "Usuário",
            },
        ],
    };
}

export default function OiacIaChat({
    documentoInicialId,
    filePathInicial,
    projectDocumentIdInicial,
    releaseIdInicial,
    tituloInicial,
}: Readonly<OiacIaChatProps>) {
    const documentoInicialAvulso = Boolean(documentoInicialId && !projectDocumentIdInicial);
    const [abaConversas, setAbaConversas] = useState<AbaConversasOiac>(
        documentoInicialId && projectDocumentIdInicial ? "grupos" : "avulsas"
    );
    const [conversas, setConversas] = useState<ConversaOiac[]>([]);
    const [conversasAgrupadas, setConversasAgrupadas] = useState<ProjetoConversasAgrupadasOiac[]>([]);
    const [conversaSelecionada, setConversaSelecionada] = useState<ConversaOiac | null>(
        documentoInicialId
            ? {
                  id: documentoInicialId,
                  name: tituloInicial || "Conversa do documento",
                  identifier: documentoInicialId,
              }
            : null
    );
    const [tipoConversaSelecionada, setTipoConversaSelecionada] = useState<TipoConversaSelecionada>(
        documentoInicialId ? (documentoInicialAvulso ? "avulsas" : "grupos") : null
    );
    const [contextoPreviewSelecionado, setContextoPreviewSelecionado] = useState<ContextoPreviewSelecionado>({
        releaseId: releaseIdInicial,
        filePath: filePathInicial,
        projectDocumentId: projectDocumentIdInicial,
    });
    const [mensagens, setMensagens] = useState<MensagemDocumento[]>([]);
    const [mensagem, setMensagem] = useState("");
    const [carregandoConversas, setCarregandoConversas] = useState(true);
    const [carregandoConversasAgrupadas, setCarregandoConversasAgrupadas] = useState(true);
    const [carregandoMensagens, setCarregandoMensagens] = useState(false);
    const [erroMensagens, setErroMensagens] = useState("");
    const [enviandoMensagem, setEnviandoMensagem] = useState(false);
    const [criandoConversa, setCriandoConversa] = useState(false);
    const [mensagemEmEnvio, setMensagemEmEnvio] = useState<{ content: string; createdAt: string } | null>(null);
    const [carregandoPreview, setCarregandoPreview] = useState(Boolean(documentoInicialId));
    const [releasePreview, setReleasePreview] = useState<ReleaseExterno | null>(null);
    const [analiseInicial, setAnaliseInicial] = useState<AnaliseInicialOiac | null>(null);
    const [analiseInicialPendente, setAnaliseInicialPendente] = useState<AnaliseInicialPendenteOiac | null>(null);
    const [urlPreviewPdf, setUrlPreviewPdf] = useState("");
    const [erroPreview, setErroPreview] = useState("");
    const [contagemPaginasPreview, setContagemPaginasPreview] = useState<{ fileUrl: string; total: number }>({
        fileUrl: "",
        total: 0,
    });
    const [editandoNomeConversa, setEditandoNomeConversa] = useState(false);
    const [nomeConversaEmEdicao, setNomeConversaEmEdicao] = useState("");
    const [salvandoNomeConversa, setSalvandoNomeConversa] = useState(false);
    const finalMensagensRef = useRef<HTMLDivElement | null>(null);
    const urlPreviewPdfRef = useRef("");

    const mensagensOrdenadas = useMemo(() => ordenarMensagens(mensagens), [mensagens]);
    const conversaSelecionadaId = conversaSelecionada?.id;
    const releasePreviewPreferidaId = contextoPreviewSelecionado.releaseId;
    const filePathPreviewPreferido = contextoPreviewSelecionado.filePath;
    const projectDocumentPreviewFallbackId = contextoPreviewSelecionado.projectDocumentId;
    const contextKeyAnaliseInicial = `${conversaSelecionadaId ?? ""}:${releasePreviewPreferidaId ?? ""}`;
    const analiseInicialAtual =
        analiseInicial?.contextKey === contextKeyAnaliseInicial ? analiseInicial : null;
    const analiseInicialPendenteAtual =
        analiseInicialPendente?.contextKey === contextKeyAnaliseInicial ? analiseInicialPendente : null;
    const conversaSelecionadaEhAvulsa = tipoConversaSelecionada === "avulsas";
    const totalPaginasAtual = contagemPaginasPreview.fileUrl === urlPreviewPdf ? contagemPaginasPreview.total : 0;

    const limparUrlPreviewPdf = useCallback(() => {
        if (urlPreviewPdfRef.current) {
            URL.revokeObjectURL(urlPreviewPdfRef.current);
            urlPreviewPdfRef.current = "";
        }
        setUrlPreviewPdf("");
    }, []);

    const carregarConversas = useCallback(async () => {
        setCarregandoConversas(true);

        const [resultado, err] = await listarConversasAvulsasOiac();
        if (err) {
            toast.error(err.message);
        } else {
            if (documentoInicialAvulso && documentoInicialId && !resultado.some((conversa) => conversa.id === documentoInicialId)) {
                setConversas([
                          {
                              id: documentoInicialId,
                              name: tituloInicial || "Conversa do documento",
                              identifier: documentoInicialId,
                          },
                    ...resultado,
                ]);
            } else {
                setConversas(resultado);
            }
        }

        setCarregandoConversas(false);
    }, [documentoInicialAvulso, documentoInicialId, tituloInicial]);

    const carregarConversasAgrupadas = useCallback(async () => {
        setCarregandoConversasAgrupadas(true);

        const [resultado, err] = await listarConversasAgrupadasOiac();
        if (err) {
            toast.error(err.message);
            setConversasAgrupadas([]);
        } else {
            setConversasAgrupadas(resultado);
        }

        setCarregandoConversasAgrupadas(false);
    }, []);

    const carregarMensagens = useCallback(async (docId: string) => {
        setCarregandoMensagens(true);
        setErroMensagens("");

        const [resultado, err] = await listarMensagensDocumento(docId);
        if (err) {
            toast.error(err.message);
            setMensagens([]);
            setErroMensagens(err.message);
        } else {
            setMensagens(resultado);
        }

        setCarregandoMensagens(false);
    }, []);

    const carregarPreview = useCallback(async (
        docId: string,
        releaseIdPreferido?: string,
        filePathPreferido?: string,
        projectDocumentIdFallback?: string
    ) => {
        setCarregandoPreview(true);
        setErroPreview("");
        limparUrlPreviewPdf();
        setReleasePreview(null);

        let erroReleases: Error | null = null;
        let releaseSelecionada: ReleaseExterno | undefined;
        let releaseComArquivo: ReleaseExterno | null = null;

        if (filePathPreferido) {
            releaseComArquivo = {
                id: releaseIdPreferido ?? "handoff",
                file_path: filePathPreferido,
                created_at: new Date(0).toISOString(),
                description: null,
            };
        } else {
            const [releases, err] = await listarReleasesConversaOiac(docId);
            erroReleases = err;
            releaseSelecionada = selecionarReleasePreview(releases, releaseIdPreferido);
            releaseComArquivo = releaseSelecionada?.file_path ? releaseSelecionada : null;
        }

        if (!releaseComArquivo && projectDocumentIdFallback) {
            const [releasesHandoff, handoffErr] = await listarReleasesDocumentoHandoffOiac(
                projectDocumentIdFallback,
                docId
            );
            const releaseHandoff = selecionarReleasePreview(releasesHandoff, releaseIdPreferido);
            releaseComArquivo = releaseHandoff?.file_path ? releaseHandoff : null;

            if (!releaseComArquivo && handoffErr) {
                setErroPreview(handoffErr.message);
                setCarregandoPreview(false);
                return;
            }
        }

        if (!releaseComArquivo) {
            if (erroReleases) setErroPreview(erroReleases.message);
            setReleasePreview(releaseSelecionada ?? null);
            setCarregandoPreview(false);
            return;
        }

        const [arquivoPdf, arquivoErr] = await baixarArquivoPdfOiac(releaseComArquivo.file_path);
        if (arquivoErr) {
            setErroPreview(arquivoErr.message);
            setCarregandoPreview(false);
            return;
        }

        if (!arquivoPdf) {
            setErroPreview("O backend não retornou o arquivo PDF.");
            setCarregandoPreview(false);
            return;
        }

        const urlArquivo = URL.createObjectURL(arquivoPdf);
        urlPreviewPdfRef.current = urlArquivo;
        setUrlPreviewPdf(urlArquivo);
        setReleasePreview(releaseComArquivo);
        setCarregandoPreview(false);
    }, [limparUrlPreviewPdf]);

    useEffect(() => {
        void Promise.resolve().then(carregarConversas);
    }, [carregarConversas]);

    useEffect(() => {
        void Promise.resolve().then(carregarConversasAgrupadas);
    }, [carregarConversasAgrupadas]);

    useEffect(() => {
        if (!conversaSelecionadaId) {
            void Promise.resolve().then(() => {
                setReleasePreview(null);
                setErroPreview("");
                limparUrlPreviewPdf();
                setCarregandoPreview(false);
            });
            return;
        }

        void Promise.resolve().then(() => carregarMensagens(conversaSelecionadaId));
        void Promise.resolve().then(() =>
            carregarPreview(
                conversaSelecionadaId,
                releasePreviewPreferidaId,
                filePathPreviewPreferido,
                projectDocumentPreviewFallbackId
            )
        );
    }, [
        carregarMensagens,
        carregarPreview,
        conversaSelecionadaId,
        filePathPreviewPreferido,
        limparUrlPreviewPdf,
        projectDocumentPreviewFallbackId,
        releasePreviewPreferidaId,
    ]);

    useEffect(() => {
        let ativo = true;
        let temporizador: number | undefined;
        let releaseIdEmConsulta = releasePreviewPreferidaId;

        const agendarAtualizacao = () => {
            if (!ativo) return;
            temporizador = window.setTimeout(() => {
                void carregarAnalise();
            }, intervaloAtualizacaoAnaliseMs);
        };

        const carregarAnalise = async () => {
            if (!conversaSelecionadaId) return;

            const [releases, err] = await listarReleasesConversaOiac(conversaSelecionadaId);
            if (!ativo) return;

            if (err) {
                agendarAtualizacao();
                return;
            }

            const releaseSelecionada = selecionarReleaseAnalise(releases, releaseIdEmConsulta);
            if (!releaseSelecionada) {
                setAnaliseInicial(null);
                setAnaliseInicialPendente(null);
                return;
            }

            releaseIdEmConsulta = releaseSelecionada.id;
            const analise = obterAnaliseInicial(releaseSelecionada, contextKeyAnaliseInicial);
            if (analise) {
                setAnaliseInicial(analise);
                setAnaliseInicialPendente(null);
                return;
            }

            setAnaliseInicial(null);
            setAnaliseInicialPendente({ contextKey: contextKeyAnaliseInicial, releaseId: releaseSelecionada.id });
            agendarAtualizacao();
        };

        if (!conversaSelecionadaId) {
            void Promise.resolve().then(() => {
                if (!ativo) return;
                setAnaliseInicial(null);
                setAnaliseInicialPendente(null);
            });
            return () => {
                ativo = false;
            };
        }

        void Promise.resolve().then(() => {
            if (!ativo) return;
            setAnaliseInicial(null);
            setAnaliseInicialPendente(
                releasePreviewPreferidaId
                    ? { contextKey: contextKeyAnaliseInicial, releaseId: releasePreviewPreferidaId }
                    : null
            );
            void carregarAnalise();
        });

        return () => {
            ativo = false;
            if (temporizador) window.clearTimeout(temporizador);
        };
    }, [contextKeyAnaliseInicial, conversaSelecionadaId, releasePreviewPreferidaId]);

    useEffect(() => {
        finalMensagensRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    }, [
        analiseInicialAtual?.releaseId,
        analiseInicialPendenteAtual?.releaseId,
        mensagensOrdenadas.length,
        carregandoMensagens,
        mensagemEmEnvio,
    ]);

    useEffect(() => () => {
        if (urlPreviewPdfRef.current) URL.revokeObjectURL(urlPreviewPdfRef.current);
    }, []);

    async function criarConversa(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        setCriandoConversa(true);
        const notificacaoId = "oiac:criar-conversa";
        toast.loading("Criando conversa...", { id: notificacaoId });

        const [novaConversa, err] = await criarConversaAvulsaComPdf(file);
        if (err) {
            toast.error(err.message, { id: notificacaoId });
        } else if (novaConversa) {
            setConversas((atuais) => [novaConversa, ...atuais.filter((item) => item.id !== novaConversa.id)]);
            setAbaConversas("avulsas");
            setContextoPreviewSelecionado({});
            setConversaSelecionada(novaConversa);
            setTipoConversaSelecionada("avulsas");
            toast.success("Conversa criada.", { id: notificacaoId });
        } else {
            toast.error("A API não retornou a conversa criada.", { id: notificacaoId });
        }

        setCriandoConversa(false);
    }

    function selecionarConversaAvulsa(conversa: ConversaOiac) {
        setEditandoNomeConversa(false);
        setNomeConversaEmEdicao("");
        setContextoPreviewSelecionado({});
        setConversaSelecionada(conversa);
        setTipoConversaSelecionada("avulsas");
    }

    function selecionarConversaAgrupada(item: ItemConversaAgrupadaOiac, projectName: string) {
        if (!item.available || !item.backendDocumentId) return;

        setEditandoNomeConversa(false);
        setNomeConversaEmEdicao("");
        setContextoPreviewSelecionado({
            releaseId: item.releaseId,
            filePath: item.filePath,
            projectDocumentId: item.projectDocumentId,
        });
        setTipoConversaSelecionada("grupos");
        setConversaSelecionada({
            id: item.backendDocumentId,
            name: item.label,
            identifier: item.backendDocumentId,
            description: `${projectName} • ${item.label}`,
            updated_at: item.updatedAt,
        });
    }

    function iniciarEdicaoNomeConversa() {
        if (!conversaSelecionada || !conversaSelecionadaEhAvulsa) return;
        setNomeConversaEmEdicao(conversaSelecionada.name);
        setEditandoNomeConversa(true);
    }

    function cancelarEdicaoNomeConversa() {
        setEditandoNomeConversa(false);
        setNomeConversaEmEdicao("");
    }

    async function salvarNomeConversa() {
        if (!conversaSelecionada || !conversaSelecionadaEhAvulsa) return;

        const nome = nomeConversaEmEdicao.trim();
        if (!nome) {
            toast.error("Informe um nome para a conversa.");
            return;
        }

        setSalvandoNomeConversa(true);
        const notificacaoId = `oiac:renomear-conversa:${conversaSelecionada.id}`;
        toast.loading("Atualizando nome da conversa...", { id: notificacaoId });

        const [documentoAtualizado, err] = await atualizarNomeDocumentoOiac(conversaSelecionada.id, nome);
        if (err) {
            toast.error(err.message, { id: notificacaoId });
            setSalvandoNomeConversa(false);
            return;
        }

        const name = documentoAtualizado?.name || nome;
        setConversas((atuais) =>
            atuais.map((conversa) =>
                conversa.id === conversaSelecionada.id
                    ? { ...conversa, ...documentoAtualizado, name }
                    : conversa
            )
        );
        setConversaSelecionada((atual) =>
            atual?.id === conversaSelecionada.id ? { ...atual, ...documentoAtualizado, name } : atual
        );
        setEditandoNomeConversa(false);
        setNomeConversaEmEdicao("");
        setSalvandoNomeConversa(false);
        toast.success("Nome da conversa atualizado.", { id: notificacaoId });
    }

    async function enviarMensagem(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const conteudo = mensagem.trim();
        if (!conteudo) {
            toast.error("Digite uma mensagem para enviar.");
            return;
        }
        if (!conversaSelecionada) return;

        setEnviandoMensagem(true);
        const notificacaoId = `oiac:enviar-mensagem:${conversaSelecionada.id}`;
        toast.loading("Enviando mensagem...", { id: notificacaoId });
        setMensagem("");
        const createdAt = new Date().toISOString();
        setMensagemEmEnvio({ content: conteudo, createdAt });

        const mensagemUsuario = criarMensagemLocalUsuario({
            docId: conversaSelecionada.id,
            content: conteudo,
            createdAt,
        });

        const [mensagemCriada, err] = await enviarMensagemIa(conversaSelecionada.id, conteudo);
        if (err) {
            toast.error(err.message, { id: notificacaoId });
            setMensagem(conteudo);
            setMensagemEmEnvio(null);
        } else if (mensagemCriada) {
            setMensagens((atuais) => [
                ...atuais,
                mensagemUsuario,
                ...(atuais.some((item) => item.id === mensagemCriada.id) ? [] : [mensagemCriada]),
            ]);
            setMensagemEmEnvio(null);
            toast.dismiss(notificacaoId);
        } else {
            setMensagens((atuais) => [...atuais, mensagemUsuario]);
            setMensagemEmEnvio(null);
            toast.dismiss(notificacaoId);
        }

        setEnviandoMensagem(false);
    }

    async function apagarConversaSelecionada() {
        if (!conversaSelecionada) return;

        const confirmado = window.confirm(`Apagar a conversa "${conversaSelecionada.name}"?`);
        if (!confirmado) return;

        const conversaId = conversaSelecionada.id;
        const notificacaoId = `oiac:apagar-conversa:${conversaId}`;
        toast.loading("Apagando conversa...", { id: notificacaoId });
        const [, err] = await apagarConversaOiac(conversaId);

        if (err) {
            toast.error(err.message, { id: notificacaoId });
            return;
        }

        setConversas((atuais) => atuais.filter((conversa) => conversa.id !== conversaId));
        setConversaSelecionada(null);
        setTipoConversaSelecionada(null);
        setEditandoNomeConversa(false);
        setNomeConversaEmEdicao("");
        setMensagens([]);
        setErroMensagens("");
        setMensagem("");
        setMensagemEmEnvio(null);
        setReleasePreview(null);
        setAnaliseInicial(null);
        setContextoPreviewSelecionado({});
        setErroPreview("");
        setCarregandoPreview(false);
        toast.success("Conversa apagada.", { id: notificacaoId });
    }

    return (
        <section className="grid h-full min-h-0 grid-cols-[320px_minmax(0,1fr)] bg-background text-ink">
            <aside className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] border-r border-line bg-toolbar-bg">
                <header className="grid gap-4 border-b border-line p-4">
                    <div>
                        <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                            Oiac IA
                        </span>
                        <h1 className="mt-2 font-display text-2xl font-bold">Conversas</h1>
                    </div>

                    <label
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-3 font-display text-sm font-semibold transition ${
                            criandoConversa
                                ? "cursor-not-allowed bg-muted/20 text-muted"
                                : "bg-brand text-background hover:bg-brand-strong dark:text-preto"
                        }`}
                        aria-disabled={criandoConversa}
                    >
                        {criandoConversa ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        {criandoConversa ? "Enviando PDF..." : "Nova conversa"}
                        <input
                            className="sr-only"
                            type="file"
                            accept="application/pdf,.pdf"
                            disabled={criandoConversa}
                            onChange={criarConversa}
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-input-bg p-1" aria-label="Tipo de conversa">
                        <BotaoAbaConversas
                            ativo={abaConversas === "avulsas"}
                            label="Individuais"
                            onClick={() => setAbaConversas("avulsas")}
                        />
                        <BotaoAbaConversas
                            ativo={abaConversas === "grupos"}
                            label="Documentos"
                            onClick={() => setAbaConversas("grupos")}
                        />
                    </div>
                </header>

                <div className="min-h-0 overflow-auto p-3">
                    {abaConversas === "avulsas" ? (
                        carregandoConversas ? (
                            <EstadoLista texto="Carregando conversas..." icone={<Loader2 className="animate-spin" size={20} />} />
                        ) : conversas.length === 0 ? (
                            <EstadoLista texto="Nenhuma conversa individual." icone={<MessageSquare size={20} />} />
                        ) : (
                            <div className="grid gap-2">
                                {conversas.map((conversa) => {
                                    const ativa = conversaSelecionada?.id === conversa.id;

                                    return (
                                        <button
                                            key={conversa.id}
                                            type="button"
                                            onClick={() => selecionarConversaAvulsa(conversa)}
                                            className={`grid gap-1 rounded-lg border p-3 text-left transition ${
                                                ativa
                                                    ? "border-brand bg-panel-soft text-ink"
                                                    : "border-line bg-input-bg text-muted hover:border-brand hover:bg-subtle-hover hover:text-ink"
                                            }`}
                                        >
                                            <span className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-sm font-bold">
                                                {conversa.name}
                                            </span>
                                            <span className="text-xs font-semibold">
                                                {formatarData(conversa.updated_at ?? conversa.created_at)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        <ListaConversasAgrupadas
                            carregando={carregandoConversasAgrupadas}
                            conversaSelecionadaId={conversaSelecionada?.id}
                            projetos={conversasAgrupadas}
                            onSelect={selecionarConversaAgrupada}
                        />
                    )}
                </div>
            </aside>

            <main className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
                <header className="flex min-h-18 items-center justify-between gap-4 border-b border-line bg-header-bg px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-input-bg text-accent">
                            <Bot size={21} />
                        </div>
                        <div className="min-w-0 flex-1">
                            {editandoNomeConversa && conversaSelecionadaEhAvulsa ? (
                                <div className="flex min-w-0 items-center gap-2">
                                    <input
                                        className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-input-bg px-3 font-display text-lg font-bold text-ink outline-none transition focus:border-brand disabled:opacity-60"
                                        value={nomeConversaEmEdicao}
                                        disabled={salvandoNomeConversa}
                                        autoFocus
                                        onChange={(event) => setNomeConversaEmEdicao(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                void salvarNomeConversa();
                                            }

                                            if (event.key === "Escape") {
                                                cancelarEdicaoNomeConversa();
                                            }
                                        }}
                                    />
                                    <button
                                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-brand text-white transition hover:bg-brand-strong dark:text-preto disabled:cursor-not-allowed disabled:opacity-50"
                                        type="button"
                                        disabled={salvandoNomeConversa || !nomeConversaEmEdicao.trim()}
                                        onClick={() => void salvarNomeConversa()}
                                        aria-label="Salvar nome da conversa"
                                    >
                                        {salvandoNomeConversa ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                    </button>
                                    <button
                                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                                        type="button"
                                        disabled={salvandoNomeConversa}
                                        onClick={cancelarEdicaoNomeConversa}
                                        aria-label="Cancelar edição do nome da conversa"
                                    >
                                        <X size={18} />
                                    </button>
                                    {totalPaginasAtual > 0 ? (
                                        <span className="shrink-0 text-sm font-semibold text-muted">
                                            {totalPaginasAtual} {totalPaginasAtual === 1 ? "página" : "páginas"}
                                        </span>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="flex min-w-0 items-center gap-2">
                                    <h2 className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-xl font-bold">
                                        {conversaSelecionada?.name ?? "Selecione ou crie uma conversa"}
                                    </h2>
                                    {totalPaginasAtual > 0 ? (
                                        <span className="shrink-0 text-sm font-semibold text-muted">
                                            {totalPaginasAtual} {totalPaginasAtual === 1 ? "página" : "páginas"}
                                        </span>
                                    ) : null}
                                    {conversaSelecionadaEhAvulsa ? (
                                        <button
                                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg text-muted transition hover:border-accent hover:text-accent"
                                            type="button"
                                            onClick={iniciarEdicaoNomeConversa}
                                            aria-label="Editar nome da conversa"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    ) : null}
                                </div>
                            )}
                            <span className="text-sm font-semibold text-muted">
                                {conversaSelecionada ? "Documento pronto para conversa" : "Envie um PDF para começar"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {conversaSelecionada ? (
                            <button
                                className="inline-flex size-10 items-center justify-center rounded-lg border border-line bg-input-bg text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                                type="button"
                                disabled={enviandoMensagem || criandoConversa}
                                onClick={() => void apagarConversaSelecionada()}
                                aria-label="Apagar conversa"
                            >
                                <Trash2 size={18} />
                            </button>
                        ) : null}
                    </div>
                </header>

                {!conversaSelecionada ? (
                    <div className="min-h-0 overflow-auto px-5 py-6">
                        <EstadoChat
                            icone={<UploadCloud size={42} />}
                            titulo="Inicie uma conversa"
                            descricao={
                                conversas.length > 0
                                    ? "Inicie uma conversa ou selecione uma conversa existente na lista."
                                    : "Inicie uma conversa para começar."
                            }
                        />
                    </div>
                ) : (
                    <div className="grid min-h-0 grid-cols-2 overflow-hidden">
                        <section className="grid min-h-0 border-r border-line bg-panel" aria-label="Visualização do documento">
                            {carregandoPreview ? (
                                <EstadoDocumento
                                    icone={<Loader2 className="animate-spin" size={42} />}
                                    titulo="Carregando PDF"
                                    descricao="Buscando a versão do documento para visualização."
                                />
                            ) : erroPreview ? (
                                <EstadoDocumento
                                    icone={<FileText size={42} />}
                                    titulo="PDF indisponível"
                                    descricao={erroPreview}
                                />
                            ) : urlPreviewPdf ? (
                                <PdfDocumentViewer
                                    key={`${conversaSelecionada.id}:${releasePreview?.id ?? "latest"}`}
                                    fileUrl={urlPreviewPdf}
                                    onPageCountChange={(total) => setContagemPaginasPreview({ fileUrl: urlPreviewPdf, total })}
                                />
                            ) : (
                                <EstadoDocumento
                                    icone={<FileText size={42} />}
                                    titulo="PDF indisponível"
                                    descricao="Nenhuma versão com arquivo foi encontrada para esta conversa."
                                />
                            )}
                        </section>

                        <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] bg-background" aria-label="Conversa com a IA">
                            <div className="min-h-0 overflow-auto px-5 py-6">
                                {carregandoMensagens ? (
                                    <EstadoChat
                                        icone={<Loader2 className="animate-spin" size={42} />}
                                        titulo="Carregando conversa"
                                        descricao="Buscando as mensagens salvas para este documento."
                                    />
                                ) : erroMensagens ? (
                                    <EstadoChat
                                        icone={<MessageSquare size={42} />}
                                        titulo="Não foi possível carregar a conversa"
                                        descricao={erroMensagens}
                                    />
                                ) : mensagensOrdenadas.length === 0 &&
                                  !mensagemEmEnvio &&
                                  !analiseInicialAtual &&
                                  !analiseInicialPendenteAtual ? (
                                    <EstadoChat
                                        icone={<FileText size={42} />}
                                        titulo="PDF enviado"
                                        descricao="Escreva a primeira mensagem para conversar com a IA sobre este arquivo."
                                    />
                                ) : (
                                    <ListaMensagens
                                        analiseInicial={analiseInicialAtual}
                                        analiseInicialPendente={analiseInicialPendenteAtual}
                                        mensagens={mensagensOrdenadas}
                                        mensagemEmEnvio={mensagemEmEnvio}
                                        finalMensagensRef={finalMensagensRef}
                                    />
                                )}
                            </div>

                            <form className="border-t border-line bg-header-bg p-4" onSubmit={enviarMensagem}>
                                <div className="flex w-full items-end gap-3">
                                    <textarea
                                        className="max-h-40 min-h-13 flex-1 resize-none rounded-lg border border-line bg-input-bg px-4 py-3 text-lg text-ink outline-none transition placeholder:text-muted focus:border-brand disabled:opacity-60"
                                        value={mensagem}
                                        rows={1}
                                        placeholder="Digite sua mensagem"
                                        disabled={enviandoMensagem}
                                        onChange={(event) => setMensagem(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" && !event.shiftKey) {
                                                event.preventDefault();
                                                event.currentTarget.form?.requestSubmit();
                                            }
                                        }}
                                    />
                                    <button
                                        className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand text-background transition hover:bg-brand-strong dark:text-preto disabled:cursor-not-allowed disabled:opacity-55"
                                        type="submit"
                                        disabled={!mensagem.trim() || enviandoMensagem}
                                        aria-label="Enviar mensagem"
                                    >
                                        {enviandoMensagem ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
            </main>
        </section>
    );
}

function EstadoLista({ icone, texto }: { icone: React.ReactNode; texto: string }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-line p-3 text-sm font-semibold text-muted">
            <span className="text-accent">{icone}</span>
            <span>{texto}</span>
        </div>
    );
}

function BotaoAbaConversas({
    ativo,
    label,
    onClick,
}: {
    ativo: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className={`h-9 rounded-md px-3 font-display text-xs font-bold transition ${
                ativo ? "bg-brand/75 text-white dark:text-preto" : "text-muted hover:bg-subtle-hover hover:text-ink"
            }`}
            aria-pressed={ativo}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

function ListaConversasAgrupadas({
    carregando,
    conversaSelecionadaId,
    onSelect,
    projetos,
}: {
    carregando: boolean;
    conversaSelecionadaId?: string;
    onSelect: (item: ItemConversaAgrupadaOiac, projectName: string) => void;
    projetos: ProjetoConversasAgrupadasOiac[];
}) {
    if (carregando) {
        return <EstadoLista texto="Carregando documentos..." icone={<Loader2 className="animate-spin" size={20} />} />;
    }

    if (projetos.length === 0) {
        return <EstadoLista texto="Nenhum documento disponível." icone={<FileText size={20} />} />;
    }

    return (
        <div className="grid gap-3">
            {projetos.map((projeto) => (
                <section className="grid gap-2 rounded-lg border border-line bg-panel p-3" key={projeto.id}>
                    <div className="min-w-0">
                        <h3 className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-display text-sm font-bold text-ink">
                            {projeto.name}
                        </h3>
                    </div>

                    {projeto.groups.map((grupo) => (
                        <div className="grid gap-2" key={grupo.id}>
                            <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                                {grupo.name}
                            </span>
                            <div className="grid gap-1">
                                {grupo.items.map((item) => {
                                    const ativa = item.backendDocumentId && conversaSelecionadaId === item.backendDocumentId;

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            disabled={!item.available}
                                            onClick={() => onSelect(item, projeto.name)}
                                            className={`grid gap-1 rounded-lg border p-3 text-left transition ${
                                                ativa
                                                    ? "border-brand bg-panel-soft text-ink"
                                                    : item.available
                                                      ? "border-line bg-input-bg text-muted hover:border-brand hover:bg-subtle-hover hover:text-ink"
                                                      : "cursor-not-allowed border-line bg-input-bg text-muted opacity-60"
                                            }`}
                                            title={item.available ? item.label : item.unavailableReason}
                                        >
                                            <span className="overflow-hidden text-ellipsis whitespace-nowrap font-display text-sm font-bold">
                                                {item.label}
                                            </span>
                                            <span className="text-xs font-semibold">
                                                {item.available
                                                    ? item.fileName || formatarData(item.updatedAt) || "PDF disponível"
                                                    : "Sem PDF"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </section>
            ))}
        </div>
    );
}

function ConteudoMensagem({ content }: { content: string }) {
    return (
        <div className="grid gap-3 text-justify text-base leading-7 md:text-lg md:leading-8">
            {content.split("\n").map((linha, indice) => {
                const titulo = linhaTituloTopico(linha) || linhaTituloMarkdown(linha);

                return titulo ? (
                    <strong
                        className="mt-2 block font-display text-lg font-bold leading-7 text-ink md:text-xl md:leading-8"
                        key={`${indice}-${linha}`}
                    >
                        {tituloMensagem(linha)}
                    </strong>
                ) : (
                    <p className="whitespace-pre-wrap indent-6" key={`${indice}-${linha}`}>
                        {linha || " "}
                    </p>
                );
            })}
        </div>
    );
}

function ListaMensagens({
    analiseInicial,
    analiseInicialPendente,
    finalMensagensRef,
    mensagemEmEnvio,
    mensagens,
}: {
    analiseInicial: AnaliseInicialOiac | null;
    analiseInicialPendente: AnaliseInicialPendenteOiac | null;
    finalMensagensRef: React.RefObject<HTMLDivElement | null>;
    mensagemEmEnvio: { content: string; createdAt: string } | null;
    mensagens: MensagemDocumento[];
}) {
    return (
        <div className="flex min-h-full w-full flex-col gap-4">
            {analiseInicial ? (
                <article className="grid w-fit max-w-full self-start gap-2 rounded-lg border border-line bg-panel p-4 text-ink shadow-[0_18px_44px_-32px_var(--chrome-shadow)]">
                    <CabecalhoMensagem ia data="" />
                    {analiseInicial.content ? <ConteudoMensagem content={analiseInicial.content} /> : null}
                    <ArvoreAnaliseRelease tipificacoes={analiseInicial.tipificacoes} />
                </article>
            ) : null}
            {analiseInicialPendente ? (
                <article
                    className="grid w-fit max-w-full self-start gap-2 rounded-lg border border-line bg-panel p-4 text-ink shadow-[0_18px_44px_-32px_var(--chrome-shadow)]"
                    role="status"
                    aria-live="polite"
                >
                    <CabecalhoMensagem ia data="" />
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                        <Loader2 className="animate-spin text-accent" size={18} />
                        <span>A Oiac IA está analisando este documento.</span>
                    </div>
                </article>
            ) : null}
            {mensagens.map((item) => {
                const ia = mensagemDaIa(item);

                return (
                    <article
                        className={`grid gap-2 rounded-lg border p-4 shadow-[0_18px_44px_-32px_var(--chrome-shadow)] ${
                            ia
                                ? "w-fit max-w-full self-start border-line bg-panel text-ink"
                                : "w-fit max-w-[82%] self-end border-brand/35 bg-subtle-hover text-ink"
                        }`}
                        key={item.id}
                    >
                        <CabecalhoMensagem ia={ia} data={item.created_at} />
                        <ConteudoMensagem content={item.content} />
                    </article>
                );
            })}
            {mensagemEmEnvio ? (
                <>
                    <article className="grid max-w-[82%] justify-self-end gap-2 rounded-lg border border-brand/35 bg-subtle-hover p-4 text-ink shadow-[0_18px_44px_-32px_var(--chrome-shadow)]">
                        <CabecalhoMensagem ia={false} data={mensagemEmEnvio.createdAt} />
                        <ConteudoMensagem content={mensagemEmEnvio.content} />
                    </article>

                    <article
                        className="grid w-fit max-w-full self-start gap-2 rounded-lg border border-line bg-panel p-4 text-ink shadow-[0_18px_44px_-32px_var(--chrome-shadow)]"
                        role="status"
                        aria-live="polite"
                    >
                        <CabecalhoMensagem ia data="" />
                        <AnimacaoIaPensando />
                    </article>
                </>
            ) : null}
            <div ref={finalMensagensRef} />
        </div>
    );
}

function FontesAnalise({ fontes }: { fontes?: FonteAnaliseRelease[] }) {
    if (!fontes?.length) return null;

    return (
        <div className="grid gap-1 border-l-2 border-accent/45 pl-3 text-sm leading-6 text-muted">
            <span className="font-bold text-ink">Fontes</span>
            {fontes.map((fonte, indice) => (
                <div key={fonte.id ?? `${fonte.name}-${indice}`}>
                    <strong className="text-ink">{fonte.name}</strong>
                    {fonte.description ? <span>{`: ${fonte.description}`}</span> : null}
                </div>
            ))}
        </div>
    );
}

function StatusAvaliacao({ fulfilled, score }: { fulfilled?: boolean | null; score?: number | null }) {
    const rotulo = fulfilled === true ? "Atendido" : fulfilled === false ? "Não atendido" : "Não avaliado";
    const classe =
        fulfilled === true
            ? "border-emerald-600/35 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300"
            : fulfilled === false
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-line bg-input-bg text-muted";

    return (
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className={`rounded-full border px-2 py-1 ${classe}`}>{rotulo}</span>
            {typeof score === "number" ? <span className="text-muted">Nota: {score}</span> : null}
        </div>
    );
}

function ArvoreAnaliseRelease({ tipificacoes }: { tipificacoes: TipificacaoAnaliseRelease[] }) {
    return (
        <div className="grid gap-5 border-t border-line pt-4">
            <h3 className="font-display text-lg font-bold text-ink">Avaliação detalhada</h3>
            {tipificacoes.map((tipificacao, indiceTipificacao) => (
                <section className="grid gap-4 border-l-2 border-brand/55 pl-4" key={tipificacao.id ?? `${tipificacao.name}-${indiceTipificacao}`}>
                    <div className="grid gap-2">
                        <h4 className="font-display text-base font-bold text-ink md:text-lg">{tipificacao.name}</h4>
                        <FontesAnalise fontes={tipificacao.sources} />
                    </div>

                    {tipificacao.taxonomies?.map((taxonomia, indiceTaxonomia) => (
                        <section className="grid gap-3 border-t border-line pt-4" key={taxonomia.id ?? `${taxonomia.title}-${indiceTaxonomia}`}>
                            <div className="grid gap-1">
                                <h5 className="font-display text-base font-bold text-ink">{taxonomia.title}</h5>
                                {taxonomia.description ? <p className="text-justify text-sm leading-6 text-muted">{taxonomia.description}</p> : null}
                            </div>
                            <FontesAnalise fontes={taxonomia.sources} />

                            <div className="grid gap-4">
                                {taxonomia.branches?.map((criterio, indiceCriterio) => (
                                    <section
                                        className="grid gap-2 border-l border-line pl-4"
                                        key={criterio.id ?? `${criterio.title}-${indiceCriterio}`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <strong className="font-display text-sm font-bold text-ink md:text-base">
                                                {criterio.title}
                                            </strong>
                                            <StatusAvaliacao
                                                fulfilled={criterio.evaluation?.fulfilled}
                                                score={criterio.evaluation?.score}
                                            />
                                        </div>
                                        {criterio.description ? <p className="text-justify text-sm leading-6 text-muted">{criterio.description}</p> : null}
                                        {criterio.evaluation?.feedback ? (
                                            <div className="grid gap-1 text-sm leading-6 text-ink">
                                                <span className="font-bold">Feedback da Oiac IA</span>
                                                <p className="whitespace-pre-wrap text-justify indent-6">{criterio.evaluation.feedback}</p>
                                            </div>
                                        ) : null}
                                    </section>
                                ))}
                            </div>
                        </section>
                    ))}
                </section>
            ))}
        </div>
    );
}

function CabecalhoMensagem({ data, ia }: { data: string; ia: boolean }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <span
                className={`grid size-10 shrink-0 place-items-center rounded-full border ${
                    ia ? "border-line bg-input-bg text-accent" : "border-brand/35 bg-panel text-brand"
                }`}
                aria-hidden="true"
            >
                {ia ? <Bot size={22} /> : <UserRound size={22} />}
            </span>
            <span className="rounded-full border border-line bg-input-bg px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.14em] text-ink">
                {ia ? "Oiac IA" : "Usuário"}
            </span>
            {data ? <span className="text-xs font-semibold text-muted">{formatarData(data)}</span> : null}
        </div>
    );
}

function AnimacaoIaPensando() {
    return (
        <div
            className="inline-flex h-9 w-fit items-end gap-1 rounded-lg border border-line bg-input-bg px-3 py-2"
            role="status"
            aria-label="A IA está preparando a resposta"
        >
            <span className="size-2 rounded-full bg-accent motion-safe:animate-bounce" />
            <span className="size-2 rounded-full bg-accent motion-safe:animate-bounce [animation-delay:140ms]" />
            <span className="size-2 rounded-full bg-accent motion-safe:animate-bounce [animation-delay:280ms]" />
        </div>
    );
}

function EstadoChat({
    icone,
    titulo,
    descricao,
}: {
    icone: React.ReactNode;
    titulo: string;
    descricao: string;
}) {
    return (
        <div className="grid min-h-80 place-items-center text-center text-muted">
            <div className="grid justify-items-center gap-3">
                <div className="text-accent">{icone}</div>
                <strong className="font-display text-xl text-ink">{titulo}</strong>
                <span className="max-w-md text-sm leading-6">{descricao}</span>
            </div>
        </div>
    );
}

function EstadoDocumento({
    descricao,
    icone,
    titulo,
}: {
    descricao: string;
    icone: React.ReactNode;
    titulo: string;
}) {
    return (
        <div className="grid min-h-0 place-items-center p-6 text-center text-muted">
            <div className="grid max-w-md justify-items-center gap-3">
                <div className="text-accent">{icone}</div>
                <strong className="font-display text-xl text-ink">{titulo}</strong>
                <span className="text-sm leading-6">{descricao}</span>
                {titulo === "PDF indisponível" ? (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-input-bg px-3 py-2 text-xs font-bold text-muted">
                        <ExternalLink size={15} />
                        Verifique a versão do documento
                    </span>
                ) : null}
            </div>
        </div>
    );
}
