"use client";

import Link from "next/link";
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    BookCheck,
    Check,
    Bot,
    CheckCircle2,
    ClipboardCheck,
    Edit2,
    FileCheck2,
    FilePlus2,
    FileText,
    FileWarning,
    Loader2,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    UploadCloud,
    X,
} from "lucide-react";

import {
    enviarConformidadeAbnt,
    enviarConformidadeTemplate,
    listarTemplatesConformidade,
} from "@/app/services/conformidade";
import {
    apagarProjetoDocumentoBackend,
    atualizarProjetoDocumentoBackend,
    carregarWorkspaceDocumentos,
    criarDocumentoExterno,
    criarDocumentoProjetoBackend,
    criarProjetoDocumentoBackend,
    enviarReleaseDocumento,
    listarReleasesDocumento,
    listarGruposDocumento,
    montarFonteDocumentoProjeto,
    obterUsuarioAtual,
    releasePossuiAnalise,
    selecionarReleaseAnalisado,
    selecionarTipificacaoDocumento,
} from "@/app/services/documento";
import {
    adicionarIdAnalisePendente,
    listarAnalisesPendentes,
    removerIdAnalisePendente,
    sincronizarIdsAnalisePendente,
    type AnalisePendenteSalva,
} from "@/app/services/filaAnalise";
import { listarTipificacoes } from "@/app/services/tipificacao";
import type {
    ComponenteDocumento,
    DocumentoProjeto,
    GrupoDocumento,
    StatusRevisao,
} from "@/app/types/Documento";

type FiltroDocumento = "Todos" | string;

function resumoGrupo(grupo: GrupoDocumento) {
    if (grupo.items.length === 0) return "Nenhuma seção cadastrada.";
    return grupo.items.map((item) => item.name).join(", ");
}

function ultimaVersao(componente: ComponenteDocumento) {
    return componente.versions[0];
}

function statusComponente(componente: ComponenteDocumento): StatusRevisao {
    const latest = ultimaVersao(componente);
    if (!latest) return "pending";
    return latest.status;
}

function normalizarTexto(valor: string) {
    return valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function documentoCompleto(documento: DocumentoProjeto) {
    return documento.components.every((component) => statusComponente(component) === "ok");
}

function componenteArtigo(componente: ComponenteDocumento) {
    return componente.label.trim().toLowerCase().includes("artigo");
}

function idsDocumentosBackend(documento: DocumentoProjeto) {
    return Array.from(
        new Set(
            documento.components
                .flatMap((componente) => [
                    componente.backendDocumentId,
                    ...componente.versions.map((versao) => versao.externalDocumentId ?? versao.documentId),
                ])
                .filter(Boolean)
        )
    ) as string[];
}

function idsAnalisePendente(documentos: DocumentoProjeto[]) {
    return Array.from(
        new Set(
            documentos.flatMap((documento) =>
                documento.components.flatMap((componente) => {
                    const latest = ultimaVersao(componente);
                    if (latest?.analysisStatus !== "pending") return [];
                    return latest.externalDocumentId ?? latest.documentId;
                })
            )
        )
    ).filter(Boolean);
}

function aplicarPendenciasSalvas(documentos: DocumentoProjeto[], pendencias: AnalisePendenteSalva[]) {
    if (pendencias.length === 0) return documentos;

    const pendenciasPorComponente = new Map(
        pendencias
            .filter((pendencia) => pendencia.projectId && pendencia.componentKey)
            .map((pendencia) => [`${pendencia.projectId}:${pendencia.componentKey}`, pendencia])
    );

    return documentos.map((documento) => ({
        ...documento,
        components: documento.components.map((componente) => {
            const pendencia = pendenciasPorComponente.get(`${documento.id}:${componente.key}`);
            if (!pendencia) return componente;

            const latest = ultimaVersao(componente);
            const latestDocId = latest?.externalDocumentId ?? latest?.documentId;
            if (latestDocId === pendencia.docId) return componente;

            return {
                ...componente,
                backendDocumentId: pendencia.docId,
                versions: [
                    {
                        id: pendencia.releaseId ?? pendencia.docId,
                        documentId: pendencia.docId,
                        externalDocumentId: pendencia.docId,
                        externalReleaseId: pendencia.releaseId,
                        analysisStatus: "pending" as const,
                        analysisCheckedAt: new Date().toISOString(),
                        fileName: pendencia.fileName ?? "Arquivo enviado",
                        uploadedAt: pendencia.uploadedAt ?? new Date().toISOString(),
                        pageCount: 0,
                        feedbackCount: 0,
                        highCount: 0,
                        mediumCount: 0,
                        lowCount: 0,
                        status: "needs_review" as const,
                    },
                    ...componente.versions,
                ],
            };
        }),
    }));
}

type AnalisePendenteDocumento = {
    docId: string;
    releaseId?: string;
};

const intervaloVerificacaoAnaliseMs = 5000;

export default function DocumentosPage() {
    const [documentos, setDocumentos] = useState<DocumentoProjeto[]>([]);
    const [tituloDocumento, setTituloDocumento] = useState("");
    const [gruposDocumento, setGruposDocumento] = useState<GrupoDocumento[]>([]);
    const [grupoSelecionadoId, setGrupoSelecionadoId] = useState("");
    const [filtroDocumento, setFiltroDocumento] = useState<FiltroDocumento>("Todos");
    const [buscaDocumento, setBuscaDocumento] = useState("");
    const [criandoDocumento, setCriandoDocumento] = useState(false);
    const [carregandoGrupos, setCarregandoGrupos] = useState(false);
    const [carregandoDocumentos, setCarregandoDocumentos] = useState(true);
    const [alvoUpload, setAlvoUpload] = useState<string | null>(null);
    const [uploadConfirmado, setUploadConfirmado] = useState<string | null>(null);
    const [erroGrupos, setErroGrupos] = useState("");
    const [erroWorkspace, setErroWorkspace] = useState("");
    const [templates, setTemplates] = useState<string[]>([]);
    const [templatePorComponente, setTemplatePorComponente] = useState<Record<string, string>>({});
    const [documentoParaApagar, setDocumentoParaApagar] = useState<DocumentoProjeto | null>(null);
    const [apagandoDocumento, setApagandoDocumento] = useState(false);
    const [documentoEditandoNomeId, setDocumentoEditandoNomeId] = useState<string | null>(null);
    const [nomeDocumentoEmEdicao, setNomeDocumentoEmEdicao] = useState("");
    const [salvandoNomeDocumento, setSalvandoNomeDocumento] = useState(false);
    const idsAnaliseNestaSessao = useRef(new Set<string>());

    useEffect(() => {
        void listarTemplatesConformidade().then(setTemplates);
    }, []);

    const carregarDocumentos = useCallback(async ({ mostrarCarregamento = false }: { mostrarCarregamento?: boolean } = {}) => {
        if (mostrarCarregamento) setCarregandoDocumentos(true);
        const [resultado, err] = await carregarWorkspaceDocumentos();
        if (err) {
            setErroWorkspace(err.message);
            if (mostrarCarregamento) toast.error(err.message);
            if (mostrarCarregamento) {
                setDocumentos([]);
                await sincronizarIdsAnalisePendente([]);
            }
        } else {
            setErroWorkspace("");
            const pendenciasSalvas = await listarAnalisesPendentes();
            const documentosComPendencias = aplicarPendenciasSalvas(resultado, pendenciasSalvas);
            await sincronizarIdsAnalisePendente([
                ...idsAnalisePendente(documentosComPendencias),
                ...idsAnaliseNestaSessao.current,
            ]);
            setDocumentos(documentosComPendencias);
        }
        if (mostrarCarregamento) setCarregandoDocumentos(false);
    }, []);

    useEffect(() => {
        void Promise.resolve().then(() => carregarDocumentos({ mostrarCarregamento: true }));
    }, [carregarDocumentos]);

    useEffect(() => {
        function recarregarQuandoAnalisePronta() {
            void carregarDocumentos();
        }

        window.addEventListener("lumina-analise-pronta", recarregarQuandoAnalisePronta);
        return () => window.removeEventListener("lumina-analise-pronta", recarregarQuandoAnalisePronta);
    }, [carregarDocumentos]);

    const pendenciasAnalise = useMemo<AnalisePendenteDocumento[]>(() => {
        const pendencias = documentos.flatMap((documento) =>
            documento.components.flatMap((componente) => {
                const latest = ultimaVersao(componente);
                const docId = latest?.externalDocumentId ?? latest?.documentId;
                if (latest?.analysisStatus !== "pending" || !docId) return [];
                return [{ docId, releaseId: latest.externalReleaseId }];
            })
        );

        return Array.from(new Map(pendencias.map((pendencia) => [pendencia.docId, pendencia])).values());
    }, [documentos]);

    const aplicarAnalisePronta = useCallback((docId: string, releaseId: string, feedbackCount: number) => {
        setDocumentos((atuais) =>
            atuais.map((documentoAtual) => ({
                ...documentoAtual,
                components: documentoAtual.components.map((componenteAtual) => ({
                    ...componenteAtual,
                    versions: componenteAtual.versions.map((versao) => {
                        const versaoDocId = versao.externalDocumentId ?? versao.documentId;
                        if (versaoDocId !== docId) return versao;

                        return {
                            ...versao,
                            id: releaseId,
                            externalReleaseId: releaseId,
                            analysisStatus: "ready" as const,
                            analysisCheckedAt: new Date().toISOString(),
                            feedbackCount,
                            status: "ok" as const,
                        };
                    }),
                })),
            }))
        );
    }, []);

    const verificarAnaliseDocumento = useCallback(
        async ({ docId, releaseId }: AnalisePendenteDocumento) => {
            const [releases, err] = await listarReleasesDocumento(docId);
            if (err) return false;

            const releaseAnalisado = selecionarReleaseAnalisado(releases, releaseId);
            if (!releaseAnalisado) return false;

            await removerIdAnalisePendente(docId);
            idsAnaliseNestaSessao.current.delete(docId);
            aplicarAnalisePronta(docId, releaseAnalisado.id, releaseAnalisado.check_tree?.length ?? 0);
            return true;
        },
        [aplicarAnalisePronta]
    );

    useEffect(() => {
        if (pendenciasAnalise.length === 0) return;

        void Promise.allSettled(pendenciasAnalise.map(verificarAnaliseDocumento));
        const interval = window.setInterval(() => {
            void Promise.allSettled(pendenciasAnalise.map(verificarAnaliseDocumento));
        }, intervaloVerificacaoAnaliseMs);

        return () => window.clearInterval(interval);
    }, [pendenciasAnalise, verificarAnaliseDocumento]);

    const totais = useMemo(() => {
        const completos = documentos.filter(documentoCompleto).length;
        return {
            completos,
            emRevisao: documentos.length - completos,
        };
    }, [documentos]);

    const documentosFiltrados = useMemo(() => {
        const buscaNormalizada = normalizarTexto(buscaDocumento.trim());

        return documentos.filter((documento) => {
            const tipoCombina = filtroDocumento === "Todos" || documento.kind === filtroDocumento;
            if (!tipoCombina) return false;
            if (!buscaNormalizada) return true;
            return normalizarTexto(documento.title).includes(buscaNormalizada);
        });
    }, [buscaDocumento, filtroDocumento, documentos]);

    const filtrosDocumento = useMemo<FiltroDocumento[]>(() => {
        const filtrosDinamicos = gruposDocumento.map((grupo) => grupo.name);
        const filtrosSalvos = documentos.map((documento) => documento.kind);
        return ["Todos", ...Array.from(new Set([...filtrosDinamicos, ...filtrosSalvos]))];
    }, [gruposDocumento, documentos]);

    const grupoSelecionado = useMemo(
        () => gruposDocumento.find((grupo) => grupo.id === grupoSelecionadoId) ?? null,
        [gruposDocumento, grupoSelecionadoId]
    );

    async function carregarGruposDocumento() {
        setCarregandoGrupos(true);
        setErroGrupos("");

        const [grupos, err] = await listarGruposDocumento();
        if (err) {
            setGruposDocumento([]);
            setGrupoSelecionadoId("");
            setErroGrupos(err.message);
        } else {
            setGruposDocumento(grupos);
            setGrupoSelecionadoId("");
            if (grupos.length === 0) setErroGrupos("Não há tipos de documentos criados.");
        }

        setCarregandoGrupos(false);
    }

    function abrirCriacaoDocumento() {
        setTituloDocumento("");
        setGrupoSelecionadoId("");
        setCriandoDocumento(true);
        void carregarGruposDocumento();
    }

    async function adicionarDocumento() {
        const titulo = tituloDocumento.trim();
        if (!titulo) {
            toast.error("Informe um nome para salvar o documento.");
            return;
        }

        if (!grupoSelecionado) {
            toast.error("Selecione um tipo de documento antes de nomear o documento.");
            return;
        }

        if (grupoSelecionado.items.length === 0) {
            toast.error("O tipo selecionado não possui seções para envio.");
            return;
        }

        const notificacaoId = "documentos:criar";
        toast.loading("Criando documento...", { id: notificacaoId });
        const [tipificacoes, tipificacoesErr] = await listarTipificacoes();
        if (tipificacoesErr) {
            toast.error(tipificacoesErr.message, { id: notificacaoId });
            return;
        }

        const [projeto, projetoErr] = await criarProjetoDocumentoBackend({
            nome: titulo,
            descricao: `Projeto criado pelo Lumina para ${grupoSelecionado.name}.`,
            documentGroupId: grupoSelecionado.id,
        });

        if (projetoErr) {
            toast.error(projetoErr.message, { id: notificacaoId });
            return;
        }

        if (!projeto) {
            toast.error("A API não retornou o projeto criado.", { id: notificacaoId });
            return;
        }

        const resultados = await Promise.all(
            grupoSelecionado.items.map((item) => {
                const typificationId = selecionarTipificacaoDocumento({
                    tipificacoes,
                    groupId: grupoSelecionado.id,
                    itemId: item.id,
                });

                return criarDocumentoProjetoBackend({
                    projectId: projeto.id,
                    nome: item.name,
                    type: item.id,
                    typificationIds: typificationId ? [typificationId] : undefined,
                });
            })
        );

        const erro = resultados.find(([, err]) => err)?.[1];
        if (erro) {
            toast.error(erro.message, { id: notificacaoId });
            return;
        }

        const novoDocumento: DocumentoProjeto = {
            id: projeto.id,
            title: titulo,
            kind: grupoSelecionado.name,
            groupId: grupoSelecionado.id,
            createdAt: projeto.created_at,
            components: resultados.flatMap(([projectDocument]) => {
                if (!projectDocument) return [];

                const item = grupoSelecionado.items.find((grupoItem) => grupoItem.id === projectDocument.type);

                return [
                    {
                        key: projectDocument.id,
                        projectDocumentId: projectDocument.id,
                        itemId: item?.id ?? projectDocument.type ?? undefined,
                        groupId: grupoSelecionado.id,
                        label: projectDocument.name,
                        description: `Envie o arquivo correspondente à seção ${projectDocument.name}.`,
                        versions: [],
                    },
                ];
            }),
        };

        setDocumentos((atuais) => [novoDocumento, ...atuais.filter((item) => item.id !== novoDocumento.id)]);
        setTituloDocumento("");
        setGrupoSelecionadoId("");
        setCriandoDocumento(false);
        toast.success(`${grupoSelecionado.name} adicionado.`, { id: notificacaoId });
    }

    async function enviarComponente(documentoId: string, componenteKey: string, file: File) {
        const target = `${documentoId}:${componenteKey}`;
        setAlvoUpload(target);
        setUploadConfirmado(null);
        const notificacaoId = `documentos:upload:${target}`;
        toast.loading("Enviando PDF...", { id: notificacaoId });

        try {
            if (!file.name.toLowerCase().endsWith(".pdf")) throw new Error("Envie um arquivo PDF.");

            const documento = documentos.find((item) => item.id === documentoId);
            const componente = documento?.components.find((item) => item.key === componenteKey);

            if (!documento || !componente) throw new Error("Não foi possível localizar a seção do documento.");

            const [[usuario, usuarioErr], [tipificacoes, tipificacoesErr]] = await Promise.all([
                obterUsuarioAtual(),
                listarTipificacoes(),
            ]);

            if (usuarioErr) throw usuarioErr;
            if (tipificacoesErr) throw tipificacoesErr;
            if (!usuario) throw new Error("Não foi possível identificar o usuário atual.");

            const typificationId = selecionarTipificacaoDocumento({
                tipificacoes,
                groupId: documento.groupId,
                itemId: componente.itemId,
            });

            if (!typificationId) throw new Error("Nenhuma tipificação foi encontrada para criar o documento.");

            const criadoEm = new Date().toISOString();
            const [documentoExterno, documentoErr] = await criarDocumentoExterno({
                nome: file.name,
                descricao: `Arquivo enviado para revisão da seção ${componente.label} em ${criadoEm}.`,
                editorId: usuario.id,
                projetoNome: documento.title,
                source: montarFonteDocumentoProjeto(componente.key),
                tipoDocumento: componente.label,
                typificationId,
            });

            if (documentoErr) throw documentoErr;
            if (!documentoExterno) throw new Error("A API não retornou o documento criado.");

            const [releaseExterno, releaseErr] = await enviarReleaseDocumento(documentoExterno.id, file);
            if (releaseErr) throw releaseErr;
            if (!releaseExterno?.id) throw new Error("O backend não retornou o ID do release recebido.");

            setUploadConfirmado(target);

            if (componenteArtigo(componente)) {
                const templateName = templatePorComponente[componenteKey] ?? templates[0];
                void Promise.allSettled([
                    templateName
                        ? enviarConformidadeTemplate(documentoExterno.id, file, templateName)
                        : Promise.resolve(),
                    enviarConformidadeAbnt(documentoExterno.id, file),
                ]);
            }

            const analisePronta = releasePossuiAnalise(releaseExterno ?? undefined);
            if (!analisePronta) {
                idsAnaliseNestaSessao.current.add(documentoExterno.id);
                await adicionarIdAnalisePendente({
                    docId: documentoExterno.id,
                    projectId: documento.id,
                    componentKey: componente.key,
                    releaseId: releaseExterno.id,
                    fileName: file.name,
                    uploadedAt: releaseExterno.created_at,
                });
            }

            setDocumentos((atuais) =>
                atuais.map((documentoAtual) => {
                    if (documentoAtual.id !== documentoId) return documentoAtual;

                    return {
                        ...documentoAtual,
                        components: documentoAtual.components.map((componenteAtual) => {
                            if (componenteAtual.key !== componenteKey) return componenteAtual;

                            return {
                                ...componenteAtual,
                                versions: [
                                    {
                                        id: releaseExterno.id,
                                        documentId: documentoExterno.id,
                                        externalDocumentId: documentoExterno.id,
                                        externalReleaseId: releaseExterno.id,
                                        filePath: releaseExterno.file_path,
                                        analysisStatus: analisePronta ? ("ready" as const) : ("pending" as const),
                                        analysisCheckedAt: new Date().toISOString(),
                                        fileName: file.name,
                                        uploadedAt: releaseExterno.created_at,
                                        pageCount: 0,
                                        feedbackCount: Array.isArray(releaseExterno.check_tree)
                                            ? releaseExterno.check_tree.length
                                            : 0,
                                        highCount: 0,
                                        mediumCount: 0,
                                        lowCount: 0,
                                        status: analisePronta ? ("ok" as const) : ("needs_review" as const),
                                    },
                                    ...componenteAtual.versions.filter((versao) => versao.id !== releaseExterno.id),
                                ],
                            };
                        }),
                    };
                })
            );

            toast.success(
                analisePronta ? "PDF enviado e analisado." : "PDF enviado. A análise foi iniciada.",
                { id: notificacaoId }
            );
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro inesperado no envio.", { id: notificacaoId });
        } finally {
            setAlvoUpload(null);
        }
    }

    function abrirConfirmacaoApagar(documentoId: string) {
        const documento = documentos.find((item) => item.id === documentoId);
        if (!documento) return;
        setDocumentoParaApagar(documento);
    }

    function iniciarEdicaoNomeDocumento(documento: DocumentoProjeto) {
        setDocumentoEditandoNomeId(documento.id);
        setNomeDocumentoEmEdicao(documento.title);
    }

    function cancelarEdicaoNomeDocumento() {
        setDocumentoEditandoNomeId(null);
        setNomeDocumentoEmEdicao("");
    }

    async function salvarNomeDocumento(documentoId: string) {
        const nome = nomeDocumentoEmEdicao.trim();
        if (!nome) {
            toast.error("Informe um nome para o documento.");
            return;
        }

        setSalvandoNomeDocumento(true);
        const notificacaoId = `documentos:renomear:${documentoId}`;
        toast.loading("Atualizando nome do documento...", { id: notificacaoId });

        const [projetoAtualizado, err] = await atualizarProjetoDocumentoBackend({
            projectId: documentoId,
            nome,
        });

        if (err) {
            toast.error(err.message, { id: notificacaoId });
            setSalvandoNomeDocumento(false);
            return;
        }

        const title = projetoAtualizado?.name || nome;
        setDocumentos((atuais) =>
            atuais.map((documentoAtual) =>
                documentoAtual.id === documentoId ? { ...documentoAtual, title } : documentoAtual
            )
        );
        setDocumentoEditandoNomeId(null);
        setNomeDocumentoEmEdicao("");
        setSalvandoNomeDocumento(false);
        toast.success("Nome do documento atualizado.", { id: notificacaoId });
    }

    async function confirmarApagarDocumento() {
        if (!documentoParaApagar) return;

        setApagandoDocumento(true);
        const notificacaoId = `documentos:apagar:${documentoParaApagar.id}`;
        toast.loading("Apagando documento...", { id: notificacaoId });
        const idsParaRemover = idsDocumentosBackend(documentoParaApagar);
        await Promise.allSettled(idsParaRemover.map((docId) => removerIdAnalisePendente(docId)));

        const [, err] = await apagarProjetoDocumentoBackend(documentoParaApagar.id);
        if (err) {
            toast.error(err.message, { id: notificacaoId });
            setApagandoDocumento(false);
            return;
        }

        await carregarDocumentos();
        setDocumentoParaApagar(null);
        setApagandoDocumento(false);
        toast.success("Documento apagado.", { id: notificacaoId });
    }

    return (
        <section className="grid gap-6 px-6 py-8 lg:px-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                        Documentos
                    </span>
                    <h1 className="mt-2 font-display text-4xl font-bold text-ink md:text-5xl">
                        Acompanhamento de documentos
                    </h1>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-muted md:text-lg">
                        Escolha um tipo de documento, salve com um nome e envie as seções exigidas para análise da IA.
                    </p>
                </div>
                <button
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-4 font-display text-sm font-semibold text-background transition hover:bg-brand-strong"
                    type="button"
                    onClick={abrirCriacaoDocumento}
                >
                    <Plus size={18} />
                    Adicionar documento
                </button>
            </header>

            {criandoDocumento ? (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="presentation">
                    <div
                        className="grid max-h-[88vh] w-full max-w-3xl gap-5 overflow-auto rounded-lg border border-line bg-panel p-5 text-ink shadow-[0_22px_70px_-22px_rgba(0,0,0,0.45)]"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="novo-documento-title"
                    >
                        <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
                            <div>
                                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                                    Novo documento
                                </span>
                                <h2 id="novo-documento-title" className="mt-2 font-display text-2xl font-bold">
                                    Escolha o tipo e informe um nome
                                </h2>
                            </div>
                            <button
                                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg text-ink transition hover:border-brand hover:bg-subtle-hover"
                                type="button"
                                onClick={() => setCriandoDocumento(false)}
                                aria-label="Fechar"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="grid gap-3" role="radiogroup" aria-label="Tipo de documento">
                            {carregandoGrupos ? (
                                <EstadoModal icone={<Loader2 className="animate-spin" size={22} />} texto="Carregando tipos de documento..." />
                            ) : erroGrupos ? (
                                <div className="grid gap-3 rounded-lg border border-line bg-input-bg p-4 text-muted">
                                    <div className="flex items-center gap-2">
                                        <FileWarning size={20} className="text-accent" />
                                        <span>{erroGrupos}</span>
                                    </div>
                                    <button
                                        className="inline-flex h-10 w-fit items-center rounded-lg border border-line px-3 font-semibold text-ink transition hover:bg-subtle-hover"
                                        type="button"
                                        onClick={() => void carregarGruposDocumento()}
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            ) : (
                                gruposDocumento.map((grupo) => (
                                    <button
                                        className={`rounded-lg border p-4 text-left transition hover:border-brand hover:bg-subtle-hover ${
                                            grupoSelecionadoId === grupo.id
                                                ? "border-brand bg-panel-soft text-ink"
                                                : "border-line bg-input-bg text-muted"
                                        }`}
                                        key={grupo.id}
                                        type="button"
                                        onClick={() => {
                                            setGrupoSelecionadoId(grupo.id);
                                            setTituloDocumento("");
                                        }}
                                        role="radio"
                                        aria-checked={grupoSelecionadoId === grupo.id}
                                    >
                                        <strong className="font-display text-base text-ink">{grupo.name}</strong>
                                        <span className="mt-2 block text-sm leading-6">{resumoGrupo(grupo)}</span>
                                    </button>
                                ))
                            )}
                        </div>

                        <label className="grid gap-2">
                            <span className="font-display text-sm font-bold text-ink">Nome do documento</span>
                            <input
                                disabled={!grupoSelecionado}
                                value={tituloDocumento}
                                aria-label="Nome do documento"
                                placeholder={grupoSelecionado ? `Ex.: ${grupoSelecionado.name} para revisão` : "Selecione um tipo de documento primeiro"}
                                onChange={(event) => setTituloDocumento(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && tituloDocumento.trim() && grupoSelecionado) adicionarDocumento();
                                }}
                                className="h-11 rounded-lg border border-line bg-input-bg px-3 text-ink outline-none transition focus:border-brand disabled:opacity-60"
                            />
                        </label>

                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                className="h-11 rounded-lg border border-line px-4 font-display text-sm font-semibold text-ink transition hover:bg-subtle-hover"
                                type="button"
                                onClick={() => setCriandoDocumento(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="h-11 rounded-lg bg-brand px-4 font-display text-sm font-semibold text-background transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-55"
                                type="button"
                                disabled={!tituloDocumento.trim() || !grupoSelecionado || grupoSelecionado.items.length === 0}
                                onClick={adicionarDocumento}
                            >
                                Salvar documento
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {documentoParaApagar ? (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !apagandoDocumento) {
                            setDocumentoParaApagar(null);
                        }
                    }}
                >
                    <div
                        className="grid w-full max-w-lg gap-5 rounded-lg border border-line bg-panel p-5 text-ink shadow-[0_22px_70px_-22px_rgba(0,0,0,0.45)]"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="apagar-documento-title"
                    >
                        <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
                            <div>
                                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                                    Apagar documento
                                </span>
                                <h2 id="apagar-documento-title" className="mt-2 font-display text-2xl font-bold">
                                    {documentoParaApagar.title}
                                </h2>
                            </div>
                            <button
                                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg text-ink transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                                type="button"
                                disabled={apagandoDocumento}
                                onClick={() => setDocumentoParaApagar(null)}
                                aria-label="Fechar"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <p className="text-sm leading-6 text-muted">
                            Esta ação remove o documento da sua lista e interrompe o acompanhamento das análises pendentes dele neste navegador.
                        </p>

                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                className="h-11 rounded-lg border border-line px-4 font-display text-sm font-semibold text-ink transition hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                                type="button"
                                disabled={apagandoDocumento}
                                onClick={() => setDocumentoParaApagar(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="inline-flex h-11 items-center gap-2 rounded-lg bg-laranja px-4 font-display text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
                                type="button"
                                disabled={apagandoDocumento}
                                onClick={confirmarApagarDocumento}
                            >
                                {apagandoDocumento ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                Apagar
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo dos documentos">
                <CartaoResumo valor={documentos.length} rotulo="Documentos cadastrados" />
                <CartaoResumo valor={totais.completos} rotulo="Completos" />
                <CartaoResumo valor={totais.emRevisao} rotulo="Em revisão" />
                <CartaoResumo valor={documentosFiltrados.length} rotulo="Exibidos" />
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="flex flex-wrap gap-2" aria-label="Filtrar por tipo de documento">
                    {filtrosDocumento.map((filtro) => (
                        <button
                            className={`h-10 rounded-lg border px-3 font-display text-sm font-semibold transition ${
                                filtroDocumento === filtro
                                    ? "border-brand bg-panel-soft text-ink"
                                    : "border-line bg-input-bg text-muted hover:bg-subtle-hover hover:text-ink"
                            }`}
                            key={filtro}
                            type="button"
                            onClick={() => setFiltroDocumento(filtro)}
                        >
                            {filtro}
                        </button>
                    ))}
                </div>

                <label className="flex h-11 items-center gap-3 rounded-lg border border-line bg-input-bg px-4 text-muted focus-within:border-brand">
                    <Search size={18} />
                    <input
                        aria-label="Pesquisar documentos"
                        value={buscaDocumento}
                        placeholder="Pesquisar por nome do documento"
                        onChange={(event) => setBuscaDocumento(event.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
                    />
                </label>
            </div>

            {carregandoDocumentos ? (
                <EstadoVazio
                    icone={<Loader2 className="animate-spin" size={42} />}
                    titulo="Carregando documentos"
                    descricao="Aguarde enquanto seus documentos são carregados."
                />
            ) : erroWorkspace ? (
                <EstadoVazio
                    icone={<FileWarning size={42} />}
                    titulo="Não foi possível carregar documentos"
                    descricao={erroWorkspace}
                />
            ) : documentos.length === 0 ? (
                <EstadoVazio
                    icone={<ClipboardCheck size={42} />}
                    titulo="Nenhum documento cadastrado"
                    descricao="Adicione um documento, escolha o tipo e salve um nome para liberar os campos de envio."
                />
            ) : documentosFiltrados.length === 0 ? (
                <EstadoVazio
                    icone={<Search size={42} />}
                    titulo="Nenhum documento encontrado"
                    descricao="Ajuste o tipo selecionado ou pesquise por outro termo."
                />
            ) : (
                <div className="grid gap-5">
                    {documentosFiltrados.map((documento) => (
                        <CartaoDocumento
                            key={documento.id}
                            documento={documento}
                            onDelete={abrirConfirmacaoApagar}
                            editandoNome={documentoEditandoNomeId === documento.id}
                            nomeEmEdicao={documentoEditandoNomeId === documento.id ? nomeDocumentoEmEdicao : documento.title}
                            salvandoNome={salvandoNomeDocumento && documentoEditandoNomeId === documento.id}
                            onStartEdit={iniciarEdicaoNomeDocumento}
                            onCancelEdit={cancelarEdicaoNomeDocumento}
                            onChangeTitle={setNomeDocumentoEmEdicao}
                            onSaveTitle={salvarNomeDocumento}
                            alvoUpload={alvoUpload}
                            uploadConfirmado={uploadConfirmado}
                            onUpload={enviarComponente}
                            templates={templates}
                            templatePorComponente={templatePorComponente}
                            onSelecionarTemplate={(componenteKey, templateName) =>
                                setTemplatePorComponente((atual) => ({ ...atual, [componenteKey]: templateName }))
                            }
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

function CartaoDocumento({
    documento,
    onDelete,
    editandoNome,
    nomeEmEdicao,
    salvandoNome,
    onStartEdit,
    onCancelEdit,
    onChangeTitle,
    onSaveTitle,
    alvoUpload,
    uploadConfirmado,
    onUpload,
    templates,
    templatePorComponente,
    onSelecionarTemplate,
}: {
    documento: DocumentoProjeto;
    onDelete: (documentoId: string) => void;
    editandoNome: boolean;
    nomeEmEdicao: string;
    salvandoNome: boolean;
    onStartEdit: (documento: DocumentoProjeto) => void;
    onCancelEdit: () => void;
    onChangeTitle: (nome: string) => void;
    onSaveTitle: (documentoId: string) => void;
    alvoUpload: string | null;
    uploadConfirmado: string | null;
    onUpload: (documentoId: string, componenteKey: string, file: File) => void;
    templates: string[];
    templatePorComponente: Record<string, string>;
    onSelecionarTemplate: (componenteKey: string, templateName: string) => void;
}) {
    const completo = documentoCompleto(documento);
    const okCount = documento.components.filter((component) => statusComponente(component) === "ok").length;

    return (
        <article className="rounded-lg border border-line bg-panel p-5 text-ink shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
                <div>
                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">
                        {documento.kind}
                    </span>
                    {editandoNome ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <input
                                className="h-11 min-w-[min(100%,18rem)] rounded-lg border border-line bg-input-bg px-3 font-display text-xl font-bold text-ink outline-none transition focus:border-brand disabled:opacity-60"
                                value={nomeEmEdicao}
                                disabled={salvandoNome}
                                aria-label="Nome do documento"
                                onChange={(event) => onChangeTitle(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") onSaveTitle(documento.id);
                                    if (event.key === "Escape") onCancelEdit();
                                }}
                                autoFocus
                            />
                            <button
                                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-brand text-background transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-55"
                                type="button"
                                disabled={salvandoNome}
                                onClick={() => onSaveTitle(documento.id)}
                                aria-label="Salvar nome do documento"
                            >
                                {salvandoNome ? <Loader2 className="animate-spin" size={17} /> : <Check size={17} />}
                            </button>
                            <button
                                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg text-muted transition hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-55"
                                type="button"
                                disabled={salvandoNome}
                                onClick={onCancelEdit}
                                aria-label="Cancelar edição do nome"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    ) : (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <h2 className="font-display text-2xl font-bold">{documento.title}</h2>
                            <button
                                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg text-muted transition hover:border-accent hover:text-ink"
                                type="button"
                                onClick={() => onStartEdit(documento)}
                                aria-label="Editar nome do documento"
                            >
                                <Edit2 size={15} />
                            </button>
                        </div>
                    )}
                    <p className="mt-2 text-sm font-semibold text-muted">
                        {okCount} de {documento.components.length} partes aprovadas pela IA
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span
                        className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 font-display text-sm font-semibold ${
                            completo
                                ? "border-brand/40 bg-subtle-hover text-ink"
                                : "border-line bg-input-bg text-muted"
                        }`}
                    >
                        {completo ? <CheckCircle2 size={17} /> : <RotateCcw size={17} />}
                        {completo ? "Completo" : "Em revisão"}
                    </span>
                    <button
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 font-display text-sm font-semibold text-muted transition hover:border-accent hover:text-ink"
                        type="button"
                        onClick={() => onDelete(documento.id)}
                    >
                        <Trash2 size={17} />
                        Apagar
                    </button>
                </div>
            </header>

            <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                {documento.components.map((componente) => {
                    const latest = ultimaVersao(componente);
                    const status = statusComponente(componente);
                    const target = `${documento.id}:${componente.key}`;
                    const enviando = alvoUpload === target;
                    const analisePendente = latest?.analysisStatus === "pending";
                    const analiseIndisponivel = latest?.analysisStatus === "unavailable";
                    const arquivoRecebido = uploadConfirmado === target;
                    const componenteBloqueado = enviando || analisePendente;
                    const podeEnviar = !componenteBloqueado;
                    const podeAnalisar = latest && !componenteBloqueado;
                    const documentoExternoId = latest?.externalDocumentId ?? latest?.documentId;
                    const artigo = componenteArtigo(componente);
                    const exibirConformidade =
                        artigo && !componenteBloqueado && latest?.analysisStatus === "ready" && Boolean(latest.externalDocumentId);

                    return (
                        <section
                            className={`grid gap-4 rounded-lg border bg-input-bg p-4 transition ${
                                componenteBloqueado
                                    ? "border-accent/50 shadow-[0_18px_44px_-30px_var(--chrome-shadow)]"
                                    : "border-line"
                            }`}
                            key={componente.key}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <FileText size={22} className="text-accent" />
                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                        status === "ok"
                                            ? "border-brand/40 bg-subtle-hover text-ink"
                                            : status === "pending"
                                              ? "border-line text-muted"
                                              : "border-accent/40 text-accent"
                                    }`}
                                >
                                    {status === "pending" ? "Pendente" : status === "ok" ? "OK da IA" : "Ajustes"}
                                </span>
                            </div>

                            {artigo && templates.length > 0 && !componenteBloqueado ? (
                                <label className="grid gap-2">
                                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Template</span>
                                    <select
                                        className="h-10 rounded-lg border border-line bg-panel px-3 text-sm text-ink outline-none focus:border-brand"
                                        disabled={componenteBloqueado}
                                        value={templatePorComponente[componente.key] ?? templates[0]}
                                        onChange={(event) => onSelecionarTemplate(componente.key, event.target.value)}
                                    >
                                        {templates.map((templateName) => (
                                            <option key={templateName} value={templateName}>
                                                {templateName}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ) : null}

                            <div>
                                <h3 className="font-display text-lg font-bold">{componente.label}</h3>
                                <p className="mt-2 text-sm leading-6 text-muted">{componente.description}</p>
                            </div>

                            {latest ? (
                                <div className="rounded-lg border border-line bg-panel p-3 text-sm">
                                    <strong className="block overflow-hidden text-ellipsis whitespace-nowrap font-display text-ink">
                                        {latest.fileName}
                                    </strong>
                                    {enviando ? (
                                        <AnimacaoProgressoDocumento
                                            titulo={arquivoRecebido ? "Arquivo recebido" : "Enviando seu arquivo"}
                                        />
                                    ) : null}
                                    {!enviando && analisePendente ? (
                                        <AnimacaoProgressoDocumento titulo="Preparando sua análise" />
                                    ) : null}
                                    {analiseIndisponivel ? (
                                        <em className="mt-2 block text-xs font-bold not-italic text-muted">
                                            {latest.analysisMessage ?? "A análise ainda não ficou disponível."}
                                        </em>
                                    ) : null}
                                </div>
                            ) : arquivoRecebido ? (
                                <div className="rounded-lg border border-line bg-panel p-3 text-sm">
                                    <strong className="block font-display text-ink">Arquivo recebido</strong>
                                    <AnimacaoProgressoDocumento titulo="Preparando sua análise" />
                                </div>
                            ) : enviando ? (
                                <div className="rounded-lg border border-line bg-panel p-3 text-sm">
                                    <strong className="block font-display text-ink">
                                        {arquivoRecebido ? "Arquivo recebido" : "Enviando arquivo"}
                                    </strong>
                                    <AnimacaoProgressoDocumento
                                        titulo={arquivoRecebido ? "Preparando sua análise" : "Aguardando confirmação do backend"}
                                    />
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-line bg-panel p-3 text-sm text-muted">
                                    <strong className="block font-display text-ink">Nenhum arquivo enviado</strong>
                                    <span className="mt-1 block">Envie a primeira versão em PDF para iniciar a análise.</span>
                                </div>
                            )}

                            {!componenteBloqueado ? <div className="grid gap-2">
                                <label
                                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-3 font-display text-sm font-semibold transition ${
                                        podeEnviar
                                            ? "bg-brand text-background hover:bg-brand-strong"
                                            : "cursor-not-allowed bg-muted/20 text-muted"
                                    }`}
                                    aria-disabled={!podeEnviar}
                                >
                                    {enviando ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : latest ? (
                                        <FilePlus2 size={18} />
                                    ) : (
                                        <UploadCloud size={18} />
                                    )}
                                    {enviando ? "Enviando..." : latest ? "Enviar nova versão" : "Enviar PDF"}
                                    <input
                                        className="sr-only"
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        disabled={!podeEnviar}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                            const file = event.target.files?.[0];
                                            event.target.value = "";
                                            if (file) void onUpload(documento.id, componente.key, file);
                                        }}
                                    />
                                </label>

                                {podeAnalisar ? (
                                    <Link
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-3 font-display text-sm font-semibold text-ink transition hover:bg-subtle-hover"
                                        href={`/oiac-ia?externalDocumentId=${encodeURIComponent(documentoExternoId!)}&projectId=${encodeURIComponent(documento.id)}&projectDocumentId=${encodeURIComponent(componente.projectDocumentId ?? componente.key)}&project=${encodeURIComponent(documento.title)}&component=${encodeURIComponent(componente.label)}${latest.externalReleaseId ? `&releaseId=${encodeURIComponent(latest.externalReleaseId)}` : ""}${latest.filePath ? `&filePath=${encodeURIComponent(latest.filePath)}` : ""}`}
                                    >
                                        <Bot size={18} />
                                        Analisar com IA
                                    </Link>
                                ) : null}

                                {exibirConformidade ? (
                                    <Link
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-3 font-display text-sm font-semibold text-ink transition hover:bg-subtle-hover"
                                        href={`/conformidade-template?documentId=${encodeURIComponent(latest.externalDocumentId!)}`}
                                    >
                                        <FileCheck2 size={18} />
                                        Conformidade com template
                                    </Link>
                                ) : null}

                                {exibirConformidade ? (
                                    <Link
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-3 font-display text-sm font-semibold text-ink transition hover:bg-subtle-hover"
                                        href={`/conformidade-abnt?documentId=${encodeURIComponent(latest.externalDocumentId!)}`}
                                    >
                                        <BookCheck size={18} />
                                        Conformidade com ABNT
                                    </Link>
                                ) : null}
                            </div> : null}
                        </section>
                    );
                })}
            </div>
        </article>
    );
}

function AnimacaoProgressoDocumento({ titulo }: { titulo: string }) {
    return (
        <div className="mt-3 grid gap-3" aria-live="polite">
            <div className="flex items-center justify-between gap-3 text-xs font-bold text-accent">
                <span>{titulo}</span>
                <Loader2 className="animate-spin" size={16} />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-subtle-hover">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-bold uppercase text-muted">
                <span className="rounded-md bg-subtle-hover px-2 py-1 text-center text-accent">
                    Recebido
                </span>
                <span className="rounded-md bg-subtle-hover px-2 py-1 text-center text-accent">
                    Lendo
                </span>
                <span className="rounded-md bg-subtle-hover px-2 py-1 text-center">
                    Finalizando
                </span>
            </div>
        </div>
    );
}

function CartaoResumo({ valor, rotulo }: { valor: number; rotulo: string }) {
    return (
        <div className="rounded-lg border border-line bg-panel p-5 shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
            <strong className="font-display text-3xl font-bold text-ink">{valor}</strong>
            <span className="mt-1 block text-sm font-semibold text-muted">{rotulo}</span>
        </div>
    );
}

function EstadoModal({ icone, texto }: { icone: React.ReactNode; texto: string }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-input-bg p-4 text-muted">
            <span className="text-accent">{icone}</span>
            <span>{texto}</span>
        </div>
    );
}

function EstadoVazio({
    icone,
    titulo,
    descricao,
}: {
    icone: React.ReactNode;
    titulo: string;
    descricao: string;
}) {
    return (
        <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-line bg-panel p-8 text-center text-muted">
            <div className="grid justify-items-center gap-3">
                <div className="text-accent">{icone}</div>
                <strong className="font-display text-xl text-ink">{titulo}</strong>
                <span className="max-w-md text-sm leading-6">{descricao}</span>
            </div>
        </div>
    );
}
