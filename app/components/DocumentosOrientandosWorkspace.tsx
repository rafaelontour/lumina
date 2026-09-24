"use client";

import dynamic from "next/dynamic";
import { type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
    AlertTriangle,
    Archive,
    Bot,
    ChevronRight,
    Eye,
    FileText,
    FolderKanban,
    Loader2,
    Link2,
    MessageSquare,
    RefreshCw,
    Search,
    Trash2,
    UserPlus,
    UserRound,
    UsersRound,
    X,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { toast } from "sonner";

import AvatarUsuario from "@/app/components/AvatarUsuario";
import ConfirmarRemocaoOrientandoDialog from "@/app/components/ConfirmarRemocaoOrientandoDialog";
import ConviteOrientandoDialog from "@/app/components/ConviteOrientandoDialog";
import LinksAtivosDialog from "@/app/components/LinksAtivosDialog";
import ResultadoAnaliseTipificacao, {
    calcularNotaMediaRelease,
    classeNotaMedia,
    selecionarReleaseMaisRecenteComArquivo,
} from "@/app/components/ResultadoAnaliseTipificacao";
import { useAuth } from "@/app/data/provider/AuthProvider";
import {
    listarGruposDocumento,
    listarProjetosDocumento,
    listarReleasesDocumento,
    selecionarReleaseAnalisado,
} from "@/app/services/documento";
import { baixarArquivoPdfRelease, fonteConversaAvulsaOiac, listarMensagensDocumento } from "@/app/services/oiac";
import { listarDocumentosOrientando, listarMeusOrientandos, listarVinculosOrientacaoAtivos, removerVinculoOrientacao } from "@/app/services/orientacao";
import type { DocumentoOrientando, GrupoDocumento, ProjetoBackend, ReleaseExterno } from "@/app/types/Documento";
import type { MensagemDocumento } from "@/app/types/Oiac";
import type { CartaoOrientando } from "@/app/types/Orientacao";

type MonitoramentoOrientando = {
    orientando: CartaoOrientando;
    documentos: DocumentoOrientando[];
    vinculoCriadoEm: string | null;
};

type FalhaOrientando = {
    orientandoId: string;
    mensagem: string;
};

type ProjetoOrientando = {
    chave: string;
    nome: string;
    documentos: DocumentoOrientando[];
};

type TipoDocumentoProjeto = {
    chave: string;
    nome: string;
};

type EstadoCatalogoGrupos =
    | { status: "aguardando" }
    | { status: "carregando" }
    | { status: "pronto"; grupos: GrupoDocumento[]; projetos: ProjetoBackend[]; avisoProjetos: string }
    | { status: "erro"; mensagem: string };

type EstadoReleaseDocumento =
    | { status: "carregando"; chaveDocumento: string }
    | { status: "pronto"; chaveDocumento: string; release: ReleaseExterno }
    | { status: "indisponivel"; chaveDocumento: string; mensagem: string };

type DocumentoSelecionado = {
    documento: DocumentoOrientando;
    release: ReleaseExterno | null;
    mensagemRelease?: string;
};

type AbaPerfil = "oiac-ia" | "grupo-documentos";

type EstadoMensagensDocumento =
    | { status: "carregando" }
    | { status: "pronto"; mensagens: MensagemDocumento[] }
    | { status: "erro"; mensagem: string };

const DURACAO_ALVO_CONTADOR_MS = 2_000;
const INTERVALO_MINIMO_CONTADOR_MS = 60;
const INTERVALO_MAXIMO_CONTADOR_MS = 180;

const PdfDocumentViewer = dynamic(() => import("@/app/components/PdfDocumentViewer"), {
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

function formatarDataVinculo(data?: string | null) {
    if (!data) return "Data do vínculo não informada";

    const valor = new Date(data);
    if (Number.isNaN(valor.getTime())) return "Data do vínculo não informada";

    return `Vínculo desde ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(valor)}`;
}

function normalizarTexto(valor: string) {
    return valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
}

function criarTiposDocumento(nomes: string[]) {
    const tiposPorChave = new Map<string, TipoDocumentoProjeto>();

    for (const valor of nomes) {
        const nome = valor.trim();
        if (!nome) continue;

        const chave = normalizarTexto(nome);
        if (!tiposPorChave.has(chave)) tiposPorChave.set(chave, { chave, nome });
    }

    return Array.from(tiposPorChave.values());
}

function tiposRetornadosProjeto(documentos: DocumentoOrientando[]) {
    return criarTiposDocumento(documentos.map((documento) => documento.tipo_documento?.trim() || "Tipo não informado"));
}

function chaveTipoDocumento(documento: DocumentoOrientando) {
    return normalizarTexto(documento.tipo_documento?.trim() || "Tipo não informado");
}

function timestamp(data?: string | null) {
    if (!data) return Number.NEGATIVE_INFINITY;

    const valor = new Date(data).getTime();
    return Number.isNaN(valor) ? Number.NEGATIVE_INFINITY : valor;
}

function formatarDataHora(data?: string | null) {
    if (!data) return "Não informada";

    const valor = new Date(data);
    if (Number.isNaN(valor.getTime())) return "Não informada";

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(valor);
}

function chaveVersaoDocumento(documento: DocumentoOrientando) {
    return `${documento.id}:${documento.updated_at ?? documento.created_at}`;
}

function documentoEhConversaAvulsaOiac(documento: DocumentoOrientando) {
    return normalizarTexto(documento.source?.trim() ?? "") === normalizarTexto(fonteConversaAvulsaOiac);
}

function documentoPertenceAGrupo(documento: DocumentoOrientando) {
    if (documentoEhConversaAvulsaOiac(documento)) return false;
    if (normalizarTexto(documento.source?.trim() ?? "").startsWith("documentos:")) return true;
    return Boolean(documento.grupo?.trim() || documento.projeto_nome?.trim());
}

function mensagemFoiEnviadaPelaIa(mensagem: MensagemDocumento) {
    return mensagem.mentions?.some((mention) => mention.type === "AI") ?? false;
}

export default function DocumentosOrientandosWorkspace() {
    const { usuario } = useAuth();
    const [monitoramento, setMonitoramento] = useState<MonitoramentoOrientando[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState("");
    const [avisoVinculos, setAvisoVinculos] = useState("");
    const [falhas, setFalhas] = useState<FalhaOrientando[]>([]);
    const [perfilSelecionado, setPerfilSelecionado] = useState<MonitoramentoOrientando | null>(null);
    const [conviteAberto, setConviteAberto] = useState(false);
    const [linksAtivosAbertos, setLinksAtivosAbertos] = useState(false);
    const [buscaOrientando, setBuscaOrientando] = useState("");
    const [orientandoParaRemover, setOrientandoParaRemover] = useState<MonitoramentoOrientando | null>(null);
    const [removendoVinculoId, setRemovendoVinculoId] = useState<string | null>(null);
    const [erroRemocao, setErroRemocao] = useState("");
    const monitoramentoAtual = useRef<MonitoramentoOrientando[]>([]);

    const carregarMonitoramento = useCallback(async () => {
        const orientadorId = usuario?.id;
        if (!orientadorId) return;

        const possuiDadosAnteriores = monitoramentoAtual.current.length > 0;
        if (possuiDadosAnteriores) setAtualizando(true);
        else setCarregando(true);

        const [orientandos, orientandosErr] = await listarMeusOrientandos();
        if (orientandosErr) {
            setErro(orientandosErr.message);
            setAvisoVinculos("");
            setFalhas([]);
            setCarregando(false);
            setAtualizando(false);
            return;
        }

        const anteriorPorOrientandoId = new Map(monitoramentoAtual.current.map((item) => [item.orientando.advisee.id, item] as const));
        const [[vinculos, vinculosErr], resultados] = await Promise.all([
            listarVinculosOrientacaoAtivos(orientadorId),
            Promise.all(
                orientandos.map(async (orientando) => {
                    const [documentos, documentosErr] = await listarDocumentosOrientando(orientando.advisee.id);
                    return { orientando, documentos, documentosErr };
                })
            ),
        ]);
        const dataVinculoPorId = new Map(vinculos.map((vinculo) => [vinculo.id, vinculo.created_at] as const));

        const proximasFalhas: FalhaOrientando[] = [];
        const proximoMonitoramento = resultados.map(({ orientando, documentos, documentosErr }) => {
            const anterior = anteriorPorOrientandoId.get(orientando.advisee.id);
            const vinculoCriadoEm = dataVinculoPorId.get(orientando.advisorship_id) ?? (vinculosErr ? anterior?.vinculoCriadoEm ?? null : null);

            if (documentosErr) {
                proximasFalhas.push({ orientandoId: orientando.advisee.id, mensagem: documentosErr.message });
                return anterior ? { ...anterior, orientando, vinculoCriadoEm } : { orientando, documentos: [], vinculoCriadoEm };
            }

            return { orientando, documentos, vinculoCriadoEm };
        });

        monitoramentoAtual.current = proximoMonitoramento;
        setMonitoramento(proximoMonitoramento);
        setPerfilSelecionado((perfilAtual) => {
            if (!perfilAtual) return null;
            return proximoMonitoramento.find((item) => item.orientando.advisee.id === perfilAtual.orientando.advisee.id) ?? null;
        });
        setAvisoVinculos(
            vinculosErr
                ? `${vinculosErr.message} As datas indisponíveis foram sinalizadas nos cartões.`
                : proximoMonitoramento.some((item) => !item.vinculoCriadoEm)
                  ? "Não foi possível identificar a data de todos os vínculos."
                  : ""
        );
        setFalhas(proximasFalhas);
        setErro("");
        setCarregando(false);
        setAtualizando(false);
    }, [usuario?.id]);

    useEffect(() => {
        if (usuario?.access_level !== "ADMIN") return;
        void Promise.resolve().then(carregarMonitoramento);
    }, [carregarMonitoramento, usuario?.access_level]);

    const totalDocumentos = useMemo(
        () => monitoramento.reduce((total, item) => total + item.documentos.length, 0),
        [monitoramento]
    );
    const monitoramentoVisivel = useMemo(() => {
        const termo = normalizarTexto(buscaOrientando.trim());
        if (!termo) return monitoramento;

        return monitoramento.filter(({ orientando }) =>
            normalizarTexto(`${orientando.advisee.username} ${orientando.advisee.email}`).includes(termo)
        );
    }, [buscaOrientando, monitoramento]);
    const fecharPerfil = useCallback(() => setPerfilSelecionado(null), []);
    const fecharConvite = useCallback(() => setConviteAberto(false), []);
    const fecharLinksAtivos = useCallback(() => setLinksAtivosAbertos(false), []);
    const fecharRemocao = useCallback(() => {
        setOrientandoParaRemover(null);
        setErroRemocao("");
    }, []);

    if (usuario?.access_level !== "ADMIN") return null;

    const semResultadosBusca = !carregando && monitoramento.length > 0 && monitoramentoVisivel.length === 0;

    function abrirRemocao(item: MonitoramentoOrientando) {
        if (removendoVinculoId) return;
        setErroRemocao("");
        setOrientandoParaRemover(item);
    }

    async function removerOrientando() {
        if (removendoVinculoId || !orientandoParaRemover) return;

        const { advisorship_id: vinculoId, advisee } = orientandoParaRemover.orientando;

        setRemovendoVinculoId(vinculoId);
        setErroRemocao("");
        const [, err] = await removerVinculoOrientacao(vinculoId);
        if (err) {
            setErroRemocao(err.message);
            setRemovendoVinculoId(null);
            return;
        }

        const proximos = monitoramentoAtual.current.filter(
            ({ orientando }) => orientando.advisorship_id !== vinculoId
        );
        monitoramentoAtual.current = proximos;
        setMonitoramento(proximos);
        setPerfilSelecionado((atual) =>
            atual?.orientando.advisorship_id === vinculoId ? null : atual
        );
        setFalhas((atuais) => atuais.filter((falha) => falha.orientandoId !== advisee.id));
        setRemovendoVinculoId(null);
        setOrientandoParaRemover(null);
        toast.success(`${advisee.username} foi removido dos seus orientandos. A conta e os documentos foram preservados.`);
    }

    return (
        <section className="grid gap-5 p-5 text-ink md:p-7">
            <header className="sticky top-0 z-30 -mx-5 -mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-line bg-background px-5 pb-5 pt-5 md:-mx-7 md:-mt-7 md:px-7 md:pt-7">
                <div>
                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Acompanhamento acadêmico</span>
                    <h1 className="mt-2 font-display text-3xl font-bold">Meus orientandos</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                        Consulte o andamento dos trabalhos e gerencie seus vínculos de orientação.
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 font-display font-semibold transition hover:border-brand hover:bg-subtle-hover"
                        type="button"
                        onClick={() => setLinksAtivosAbertos(true)}
                    >
                        <Link2 size={17} />
                        Links ativos
                    </button>
                    <button
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-3 font-display font-semibold text-background transition hover:bg-brand-strong"
                        type="button"
                        onClick={() => setConviteAberto(true)}
                    >
                        <UserPlus size={17} />
                        Convidar orientando
                    </button>
                    <button
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 font-semibold transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                        type="button"
                        disabled={carregando || atualizando}
                        onClick={() => void carregarMonitoramento()}
                    >
                        <RefreshCw className={carregando || atualizando ? "animate-spin" : ""} size={17} />
                        Atualizar
                    </button>
                </div>
            </header>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,0.65fr)_minmax(18rem,1.7fr)]" aria-label="Resumo e pesquisa do acompanhamento">
                <Resumo valor={monitoramento.length} rotulo="Orientandos ativos" />
                <Resumo valor={totalDocumentos} rotulo="Total de documentos" animar />
                <label className="grid min-w-0 gap-1.5 rounded-lg border border-line bg-panel px-4 py-3 sm:col-span-2 lg:col-span-1">
                    <span className="text-xs font-semibold text-muted">Pesquisar orientando</span>
                    <span className="flex min-w-0 items-center gap-2">
                        <Search className="shrink-0 text-muted" size={18} aria-hidden="true" />
                        <input
                            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                            type="search"
                            value={buscaOrientando}
                            onChange={(evento) => setBuscaOrientando(evento.target.value)}
                            placeholder="Busque por nome ou e-mail"
                        />
                    </span>
                </label>
            </div>

            {erro && monitoramento.length === 0 ? (
                <Estado icone={<AlertTriangle size={36} />} titulo="Não foi possível carregar o acompanhamento" descricao={erro} erro />
            ) : carregando ? (
                <Estado icone={<Loader2 className="animate-spin" size={36} />} titulo="Carregando documentos" descricao="Buscando os documentos dos seus orientandos." />
            ) : monitoramento.length === 0 ? (
                <Estado icone={<UsersRound size={36} />} titulo="Nenhum orientando ativo" descricao="Quando houver vínculos ativos, os documentos enviados pelos orientandos aparecerão aqui." />
            ) : semResultadosBusca ? (
                <Estado icone={<Search size={36} />} titulo="Nenhum orientando encontrado" descricao="Tente buscar por outro nome ou e-mail." />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {monitoramentoVisivel.map((item) => (
                        <CartaoOrientandoLista
                            key={item.orientando.advisee.id}
                            orientando={item.orientando}
                            vinculoCriadoEm={item.vinculoCriadoEm}
                            removendo={removendoVinculoId === item.orientando.advisorship_id}
                            remocaoBloqueada={Boolean(removendoVinculoId)}
                            aoVerPerfil={() => setPerfilSelecionado(item)}
                            aoRemover={() => abrirRemocao(item)}
                        />
                    ))}
                </div>
            )}

            {!carregando && !erro && monitoramento.length > 0 && totalDocumentos === 0 ? (
                <Aviso descricao="Seus orientandos ativos ainda não possuem documentos retornados pela plataforma." />
            ) : null}

            {erro && monitoramento.length > 0 ? (
                <Aviso descricao={`${erro} Os dados exibidos anteriormente foram mantidos.`} />
            ) : null}
            {avisoVinculos ? <Aviso descricao={avisoVinculos} /> : null}
            {falhas.map((falha) => {
                const orientando = monitoramento.find((item) => item.orientando.advisee.id === falha.orientandoId)?.orientando;
                return <Aviso key={falha.orientandoId} descricao={`Não foi possível atualizar os documentos de ${orientando?.advisee.username ?? "um orientando"}: ${falha.mensagem}`} />;
            })}

            {perfilSelecionado ? <ModalPerfilOrientando monitoramento={perfilSelecionado} aoFechar={fecharPerfil} /> : null}
            {conviteAberto ? <ConviteOrientandoDialog aoFechar={fecharConvite} /> : null}
            {linksAtivosAbertos ? <LinksAtivosDialog orientadorId={usuario.id} aoFechar={fecharLinksAtivos} /> : null}
            {orientandoParaRemover ? (
                <ConfirmarRemocaoOrientandoDialog
                    orientando={orientandoParaRemover.orientando.advisee}
                    removendo={removendoVinculoId === orientandoParaRemover.orientando.advisorship_id}
                    erro={erroRemocao}
                    aoConfirmar={() => void removerOrientando()}
                    aoFechar={fecharRemocao}
                />
            ) : null}
        </section>
    );
}

function CartaoOrientandoLista({
    orientando,
    vinculoCriadoEm,
    removendo,
    remocaoBloqueada,
    aoVerPerfil,
    aoRemover,
}: {
    orientando: CartaoOrientando;
    vinculoCriadoEm: string | null;
    removendo: boolean;
    remocaoBloqueada: boolean;
    aoVerPerfil: () => void;
    aoRemover: () => void;
}) {
    return (
        <article aria-busy={removendo} className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel p-4 shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
            <div className="flex min-w-0 items-center gap-3">
                <AvatarUsuario className="size-10" usuario={orientando.advisee} />
                <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-bold" title={orientando.advisee.username}>
                        {orientando.advisee.username}
                    </h2>
                    <p className="mt-0.5 truncate text-xs text-muted" title={orientando.advisee.email}>
                        {orientando.advisee.email}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted">{formatarDataVinculo(vinculoCriadoEm)}</p>
                </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-line bg-input-bg px-3 font-display text-sm font-semibold transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                    type="button"
                    disabled={removendo}
                    onClick={aoVerPerfil}
                >
                    Ver perfil
                </button>
                <button
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-accent/35 px-3 font-display text-sm font-semibold text-accent transition hover:bg-accent/8 disabled:cursor-not-allowed disabled:opacity-55"
                    type="button"
                    disabled={remocaoBloqueada}
                    onClick={aoRemover}
                >
                    {removendo ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    {removendo ? "Removendo…" : "Remover orientando"}
                </button>
            </div>
        </article>
    );
}

function ModalPerfilOrientando({ monitoramento, aoFechar }: { monitoramento: MonitoramentoOrientando; aoFechar: () => void }) {
    const [abaAtiva, setAbaAtiva] = useState<AbaPerfil>("oiac-ia");
    const [buscaProjeto, setBuscaProjeto] = useState("");
    const [projetoSelecionadoChave, setProjetoSelecionadoChave] = useState<string | null>(null);
    const [tipoSelecionado, setTipoSelecionado] = useState<{ projetoChave: string; tipoChave: string } | null>(null);
    const [conversaSelecionadaId, setConversaSelecionadaId] = useState<string | null>(null);
    const [mensagensPorDocumento, setMensagensPorDocumento] = useState<Record<string, EstadoMensagensDocumento>>({});
    const [analisesPorDocumento, setAnalisesPorDocumento] = useState<Record<string, EstadoReleaseDocumento>>({});
    const [documentoSelecionado, setDocumentoSelecionado] = useState<DocumentoSelecionado | null>(null);
    const [releasesPorDocumento, setReleasesPorDocumento] = useState<Record<string, EstadoReleaseDocumento>>({});
    const [catalogoGrupos, setCatalogoGrupos] = useState<EstadoCatalogoGrupos>({ status: "aguardando" });
    const dialogoRef = useRef<HTMLElement>(null);
    const tituloRef = useRef<HTMLHeadingElement>(null);
    const idTabsPrincipais = useId().replaceAll(":", "");
    const mensagensPorDocumentoRef = useRef<Record<string, EstadoMensagensDocumento>>({});
    const analisesPorDocumentoRef = useRef<Record<string, EstadoReleaseDocumento>>({});
    const releasesPorDocumentoRef = useRef<Record<string, EstadoReleaseDocumento>>({});
    const catalogoGruposIniciadoRef = useRef(false);
    const componenteMontadoRef = useRef(true);
    const { orientando, documentos, vinculoCriadoEm } = monitoramento;

    useEffect(() => {
        componenteMontadoRef.current = true;
        return () => {
            componenteMontadoRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (abaAtiva !== "grupo-documentos" || catalogoGruposIniciadoRef.current) return;

        catalogoGruposIniciadoRef.current = true;
        setCatalogoGrupos({ status: "carregando" });
        void Promise.all([listarGruposDocumento(), listarProjetosDocumento("advisees")]).then(
            ([[grupos, gruposErr], [projetos, projetosErr]]) => {
            if (!componenteMontadoRef.current) return;

            setCatalogoGrupos(
                gruposErr
                    ? { status: "erro", mensagem: gruposErr.message }
                    : { status: "pronto", grupos, projetos, avisoProjetos: projetosErr?.message ?? "" }
            );
            }
        );
    }, [abaAtiva]);

    useEffect(() => {
        const elementoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        tituloRef.current?.focus();

        function controlarTeclado(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
                aoFechar();
                return;
            }

            if (evento.key !== "Tab") return;

            const elementosFocaveis = Array.from(
                dialogoRef.current?.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
                ) ?? []
            );
            if (elementosFocaveis.length === 0) {
                evento.preventDefault();
                tituloRef.current?.focus();
                return;
            }

            const primeiroElemento = elementosFocaveis[0];
            const ultimoElemento = elementosFocaveis.at(-1);
            if (evento.shiftKey && (document.activeElement === primeiroElemento || document.activeElement === tituloRef.current)) {
                evento.preventDefault();
                ultimoElemento?.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimoElemento) {
                evento.preventDefault();
                primeiroElemento.focus();
            }
        }

        window.addEventListener("keydown", controlarTeclado);
        return () => {
            window.removeEventListener("keydown", controlarTeclado);
            elementoAnterior?.focus();
        };
    }, [aoFechar]);

    const conversas = useMemo(
        () =>
            documentos
                .filter((documento) => normalizarTexto(documento.tipo_documento?.trim() ?? "") === "oiac ia")
                .sort(
                    (documentoA, documentoB) =>
                        timestamp(documentoB.updated_at ?? documentoB.created_at) - timestamp(documentoA.updated_at ?? documentoA.created_at)
                ),
        [documentos]
    );
    const conversaSelecionada = conversas.find((documento) => documento.id === conversaSelecionadaId) ?? null;
    const estadoConversaSelecionada = conversaSelecionada ? mensagensPorDocumento[conversaSelecionada.id] : undefined;
    const estadoAnaliseConversaSelecionada = conversaSelecionada ? analisesPorDocumento[conversaSelecionada.id] : undefined;
    const documentosDeGrupo = useMemo(() => documentos.filter(documentoPertenceAGrupo), [documentos]);

    const selecionarConversa = useCallback((documento: DocumentoOrientando) => {
        setConversaSelecionadaId(documento.id);

        if (!mensagensPorDocumentoRef.current[documento.id]) {
            mensagensPorDocumentoRef.current[documento.id] = { status: "carregando" };
            setMensagensPorDocumento({ ...mensagensPorDocumentoRef.current });

            void listarMensagensDocumento(documento.id).then(([mensagens, mensagensErr]) => {
                if (!componenteMontadoRef.current) return;

                mensagensPorDocumentoRef.current[documento.id] = mensagensErr
                    ? { status: "erro", mensagem: mensagensErr.message }
                    : {
                          status: "pronto",
                          mensagens: [...mensagens].sort(
                              (mensagemA, mensagemB) => timestamp(mensagemA.created_at) - timestamp(mensagemB.created_at)
                          ),
                      };
                setMensagensPorDocumento({ ...mensagensPorDocumentoRef.current });
            });
        }

        const chaveDocumento = chaveVersaoDocumento(documento);
        if (analisesPorDocumentoRef.current[documento.id]?.chaveDocumento === chaveDocumento) return;

        analisesPorDocumentoRef.current[documento.id] = { status: "carregando", chaveDocumento };
        setAnalisesPorDocumento({ ...analisesPorDocumentoRef.current });

        void listarReleasesDocumento(documento.id).then(([releases, releasesErr]) => {
            if (
                !componenteMontadoRef.current ||
                analisesPorDocumentoRef.current[documento.id]?.chaveDocumento !== chaveDocumento
            ) {
                return;
            }

            const releaseComAnalise = selecionarReleaseAnalisado(releases);
            const releaseDisponivel = releaseComAnalise ?? selecionarReleaseMaisRecenteComArquivo(releases);
            analisesPorDocumentoRef.current[documento.id] = releasesErr
                ? { status: "indisponivel", chaveDocumento, mensagem: releasesErr.message }
                : releaseDisponivel
                  ? { status: "pronto", chaveDocumento, release: releaseDisponivel }
                  : {
                        status: "indisponivel",
                        chaveDocumento,
                        mensagem: "Nenhum resultado da IA foi encontrado para este documento.",
                    };
            setAnalisesPorDocumento({ ...analisesPorDocumentoRef.current });
        });
    }, []);

    const projetos = useMemo(() => {
        const projetosPorChave = new Map<string, ProjetoOrientando>();

        for (const documento of documentosDeGrupo) {
            const nome = documento.projeto_nome?.trim();
            if (!nome) continue;

            const chave = normalizarTexto(nome);
            const projeto = projetosPorChave.get(chave) ?? { chave, nome, documentos: [] };
            projeto.documentos.push(documento);
            projetosPorChave.set(chave, projeto);
        }

        return Array.from(projetosPorChave.values())
            .map((projeto) => ({
                ...projeto,
                documentos: [...projeto.documentos].sort(
                    (documentoA, documentoB) =>
                        timestamp(documentoB.updated_at ?? documentoB.created_at) - timestamp(documentoA.updated_at ?? documentoA.created_at)
                ),
            }))
            .sort((projetoA, projetoB) => projetoA.nome.localeCompare(projetoB.nome, "pt-BR"));
    }, [documentosDeGrupo]);

    const projetosFiltrados = useMemo(() => {
        const termo = normalizarTexto(buscaProjeto.trim());
        if (!termo) return projetos;
        return projetos.filter((projeto) => normalizarTexto(projeto.nome).includes(termo));
    }, [buscaProjeto, projetos]);
    const projetoSelecionado = projetos.find((projeto) => projeto.chave === projetoSelecionadoChave) ?? null;
    const configuracaoTipos = useMemo(() => {
        if (!projetoSelecionado) return { tipos: [] as TipoDocumentoProjeto[], carregando: false, aviso: "" };
        if (catalogoGrupos.status === "aguardando" || catalogoGrupos.status === "carregando") {
            return { tipos: [] as TipoDocumentoProjeto[], carregando: true, aviso: "" };
        }

        const gruposRetornados = criarTiposDocumento(
            projetoSelecionado.documentos.flatMap((documento) => (documento.grupo?.trim() ? [documento.grupo] : []))
        );
        const tiposRetornados = criarTiposDocumento(
            projetoSelecionado.documentos.flatMap((documento) =>
                documento.tipo_documento?.trim() ? [documento.tipo_documento] : []
            )
        );
        let grupoCatalogo: GrupoDocumento | undefined;

        if (catalogoGrupos.status === "pronto") {
            const projetosComMesmoNome = catalogoGrupos.projetos.filter(
                (projeto) => normalizarTexto(projeto.name) === projetoSelecionado.chave
            );
            const projetoCatalogo =
                projetosComMesmoNome.find((projeto) => projeto.created_by === orientando.advisee.id) ??
                (projetosComMesmoNome.length === 1 ? projetosComMesmoNome[0] : undefined);
            const grupoDoProjeto = projetoCatalogo?.document_group_id
                ? catalogoGrupos.grupos.find((grupo) => grupo.id === projetoCatalogo.document_group_id)
                : undefined;
            const grupoPeloValorRetornado = catalogoGrupos.grupos.find((grupo) =>
                gruposRetornados.some(
                    (grupoRetornado) =>
                        grupoRetornado.chave === normalizarTexto(grupo.id) ||
                        grupoRetornado.chave === normalizarTexto(grupo.name)
                )
            );
            const gruposCompativeisComTipos = tiposRetornados.length
                ? catalogoGrupos.grupos.filter((grupo) => {
                      const tiposDoGrupo = new Set(grupo.items.map((item) => normalizarTexto(item.name)));
                      return tiposRetornados.every((tipo) => tiposDoGrupo.has(tipo.chave));
                  })
                : [];
            const grupoPelosTipos = gruposCompativeisComTipos.length === 1 ? gruposCompativeisComTipos[0] : undefined;

            grupoCatalogo = grupoDoProjeto ?? grupoPeloValorRetornado ?? grupoPelosTipos;
        }

        if (grupoCatalogo) {
            return {
                tipos: criarTiposDocumento(grupoCatalogo.items.map((item) => item.name)),
                carregando: false,
                aviso: "",
            };
        }

        const complemento = "As tabs exibem apenas os tipos encontrados nos documentos enviados.";
        const detalheProjetos = catalogoGrupos.status === "pronto" && catalogoGrupos.avisoProjetos
            ? `${catalogoGrupos.avisoProjetos} `
            : "";
        return {
            tipos: tiposRetornadosProjeto(projetoSelecionado.documentos),
            carregando: false,
            aviso:
                catalogoGrupos.status === "erro"
                    ? `${catalogoGrupos.mensagem} ${complemento}`
                    : `${detalheProjetos}Não foi possível identificar todos os tipos obrigatórios deste grupo. ${complemento}`,
        };
    }, [catalogoGrupos, orientando.advisee.id, projetoSelecionado]);
    const tipoSelecionadoChaveAtual =
        tipoSelecionado && tipoSelecionado.projetoChave === projetoSelecionado?.chave ? tipoSelecionado.tipoChave : null;
    const tipoAtivoChave =
        tipoSelecionadoChaveAtual && configuracaoTipos.tipos.some((tipo) => tipo.chave === tipoSelecionadoChaveAtual)
            ? tipoSelecionadoChaveAtual
            : configuracaoTipos.tipos[0]?.chave ?? null;
    const fecharDocumento = useCallback(() => setDocumentoSelecionado(null), []);

    useEffect(() => {
        if (!projetoSelecionado) return;

        const documentosPendentes = projetoSelecionado.documentos.filter((documento) => {
            const estadoAtual = releasesPorDocumentoRef.current[documento.id];
            return estadoAtual?.chaveDocumento !== chaveVersaoDocumento(documento);
        });
        if (documentosPendentes.length === 0) return;

        for (const documento of documentosPendentes) {
            releasesPorDocumentoRef.current[documento.id] = {
                status: "carregando",
                chaveDocumento: chaveVersaoDocumento(documento),
            };
        }
        setReleasesPorDocumento({ ...releasesPorDocumentoRef.current });

        void Promise.all(
            documentosPendentes.map(async (documento) => {
                const chaveDocumento = chaveVersaoDocumento(documento);
                const [releases, releasesErr] = await listarReleasesDocumento(documento.id);

                if (releasesErr) {
                    return {
                        documentoId: documento.id,
                        estado: {
                            status: "indisponivel",
                            chaveDocumento,
                            mensagem: releasesErr.message,
                        } satisfies EstadoReleaseDocumento,
                    };
                }

                const release = selecionarReleaseMaisRecenteComArquivo(releases);
                return {
                    documentoId: documento.id,
                    estado: release
                        ? ({ status: "pronto", chaveDocumento, release } satisfies EstadoReleaseDocumento)
                        : ({
                              status: "indisponivel",
                              chaveDocumento,
                              mensagem: "Nenhuma versão em PDF foi encontrada para este documento.",
                          } satisfies EstadoReleaseDocumento),
                };
            })
        ).then((resultados) => {
            if (!componenteMontadoRef.current) return;

            for (const { documentoId, estado } of resultados) {
                if (releasesPorDocumentoRef.current[documentoId]?.chaveDocumento === estado.chaveDocumento) {
                    releasesPorDocumentoRef.current[documentoId] = estado;
                }
            }
            setReleasesPorDocumento({ ...releasesPorDocumentoRef.current });
        });
    }, [projetoSelecionado]);

    const abrirDocumento = useCallback((documento: DocumentoOrientando) => {
        const estadoRelease = releasesPorDocumentoRef.current[documento.id];
        setDocumentoSelecionado({
            documento,
            release: estadoRelease?.status === "pronto" ? estadoRelease.release : null,
            mensagemRelease:
                estadoRelease?.status === "indisponivel"
                    ? estadoRelease.mensagem
                    : "As informações desta versão ainda estão sendo carregadas.",
        });
    }, []);

    const controlarTeclaAbaPrincipal = (evento: ReactKeyboardEvent<HTMLButtonElement>, indiceAtual: number) => {
        const abas: AbaPerfil[] = ["oiac-ia", "grupo-documentos"];
        let proximoIndice: number | null = null;

        if (evento.key === "ArrowRight") proximoIndice = (indiceAtual + 1) % abas.length;
        if (evento.key === "ArrowLeft") proximoIndice = (indiceAtual - 1 + abas.length) % abas.length;
        if (evento.key === "Home") proximoIndice = 0;
        if (evento.key === "End") proximoIndice = abas.length - 1;
        if (proximoIndice === null) return;

        evento.preventDefault();
        const proximaAba = abas[proximoIndice];
        setAbaAtiva(proximaAba);
        document.getElementById(`tab-perfil-${idTabsPrincipais}-${proximoIndice}`)?.focus();
    };

    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-preto/45 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) aoFechar();
            }}
            role="presentation"
        >
            <section
                aria-labelledby="titulo-perfil-orientando"
                aria-modal="true"
                className="grid h-[calc(100dvh-1rem)] w-full max-w-[96rem] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl sm:h-[min(50rem,calc(100dvh-2rem))]"
                ref={dialogoRef}
                role="dialog"
            >
                <header className="flex items-start justify-between gap-4 border-b border-line p-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <AvatarUsuario className="size-14 shrink-0 sm:size-16" usuario={orientando.advisee} />
                        <div className="min-w-0">
                            <h2
                                className="truncate font-display text-xl font-bold outline-none sm:text-2xl"
                                id="titulo-perfil-orientando"
                                ref={tituloRef}
                                tabIndex={-1}
                                title={orientando.advisee.username}
                            >
                                {orientando.advisee.username}
                            </h2>
                            <p className="mt-1 break-all text-sm text-muted" title={orientando.advisee.email}>
                                {orientando.advisee.email}
                            </p>
                            <p className="mt-1 text-sm text-muted">{formatarDataVinculo(vinculoCriadoEm)}</p>
                        </div>
                    </div>
                    <button
                        aria-label="Fechar perfil"
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-input-bg text-muted transition hover:border-brand hover:bg-subtle-hover hover:text-ink"
                        type="button"
                        onClick={aoFechar}
                    >
                        <X size={18} />
                    </button>
                </header>

                <div aria-label="Conteúdo do perfil" className="flex gap-1 border-b border-line bg-input-bg px-4 pt-2 sm:px-5" role="tablist">
                    {([
                        { chave: "oiac-ia", rotulo: "OIAC IA" },
                        { chave: "grupo-documentos", rotulo: "Grupo de documentos" },
                    ] satisfies Array<{ chave: AbaPerfil; rotulo: string }>).map((aba, indice) => {
                        const selecionada = abaAtiva === aba.chave;

                        return (
                            <button
                                aria-controls={`painel-perfil-${idTabsPrincipais}-${aba.chave}`}
                                aria-selected={selecionada}
                                className={`-mb-px min-h-11 border-b-2 px-4 py-2 font-display text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand ${
                                    selecionada
                                        ? "border-brand bg-panel text-brand"
                                        : "border-transparent text-muted hover:border-line hover:text-ink"
                                }`}
                                id={`tab-perfil-${idTabsPrincipais}-${indice}`}
                                key={aba.chave}
                                role="tab"
                                tabIndex={selecionada ? 0 : -1}
                                type="button"
                                onClick={() => setAbaAtiva(aba.chave)}
                                onKeyDown={(evento) => controlarTeclaAbaPrincipal(evento, indice)}
                            >
                                {aba.rotulo}
                            </button>
                        );
                    })}
                </div>

                {abaAtiva === "oiac-ia" ? (
                    <PainelConversasOiac
                        ariaLabelledby={`tab-perfil-${idTabsPrincipais}-0`}
                        conversas={conversas}
                        conversaSelecionada={conversaSelecionada}
                        estadoAnalise={estadoAnaliseConversaSelecionada}
                        estadoConversa={estadoConversaSelecionada}
                        id={`painel-perfil-${idTabsPrincipais}-oiac-ia`}
                        aoSelecionarConversa={selecionarConversa}
                    />
                ) : (
                <div
                    aria-labelledby={`tab-perfil-${idTabsPrincipais}-1`}
                    className="grid min-h-0 overflow-y-auto lg:grid-cols-[minmax(14rem,0.28fr)_minmax(0,1fr)] lg:overflow-hidden"
                    id={`painel-perfil-${idTabsPrincipais}-grupo-documentos`}
                    role="tabpanel"
                >
                    <section
                        aria-labelledby="titulo-projetos-orientando"
                        className="grid min-w-0 content-start gap-4 border-b border-line p-4 sm:p-5 lg:min-h-0 lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:overflow-hidden lg:border-r lg:border-b-0"
                    >
                        <div>
                            <h3 className="font-display text-lg font-bold" id="titulo-projetos-orientando">
                                Projetos
                            </h3>
                            <p className="mt-1 text-sm text-muted">Projetos vinculados aos documentos deste orientando.</p>
                        </div>

                        <label className="grid gap-1.5 text-sm font-semibold text-ink">
                            Buscar projetos
                            <span className="flex h-10 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 focus-within:border-brand">
                                <Search className="shrink-0 text-muted" size={17} />
                                <input
                                    className="min-w-0 flex-1 bg-transparent font-normal outline-none placeholder:text-muted"
                                    type="search"
                                    value={buscaProjeto}
                                    onChange={(evento) => setBuscaProjeto(evento.target.value)}
                                    placeholder="Digite o nome de um projeto"
                                />
                            </span>
                        </label>

                        <div className="lg:min-h-0 lg:overflow-y-auto lg:pr-1">
                            {projetos.length === 0 ? (
                                <EstadoProjetos mensagem="Nenhum projeto informado para este orientando." />
                            ) : projetosFiltrados.length === 0 ? (
                                <EstadoProjetos mensagem="Nenhum projeto encontrado para essa busca." />
                            ) : (
                                <ul className="grid gap-2" aria-label="Projetos do orientando">
                                    {projetosFiltrados.map((projeto) => {
                                        const selecionado = projeto.chave === projetoSelecionado?.chave;

                                        return (
                                            <li key={projeto.chave}>
                                                <button
                                                    aria-controls="historico-projeto-orientando"
                                                    aria-pressed={selecionado}
                                                    className={`flex w-full min-w-0 items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                                                        selecionado
                                                            ? "border-brand bg-subtle-hover text-ink"
                                                            : "border-line bg-input-bg text-ink hover:border-brand hover:bg-subtle-hover"
                                                    }`}
                                                    type="button"
                                                    onClick={() => setProjetoSelecionadoChave(projeto.chave)}
                                                >
                                                    <FolderKanban className="shrink-0 text-brand" size={18} />
                                                    <span className="min-w-0 flex-1">
                                                        <strong className="block max-w-full whitespace-normal [overflow-wrap:anywhere] text-sm font-semibold">
                                                            {projeto.nome}
                                                        </strong>
                                                        <span className="mt-0.5 block text-xs text-muted">
                                                            {projeto.documentos.length} {projeto.documentos.length === 1 ? "documento enviado" : "documentos enviados"}
                                                        </span>
                                                    </span>
                                                    <ChevronRight className="shrink-0 text-muted" size={17} />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </section>

                    <section
                        aria-live="polite"
                        className="grid min-h-72 min-w-0 content-start overflow-y-visible p-4 sm:p-5 lg:min-h-0 lg:overflow-y-auto"
                        id="historico-projeto-orientando"
                    >
                        {projetoSelecionado ? (
                            <HistoricoProjeto
                                projeto={projetoSelecionado}
                                tiposDocumento={configuracaoTipos.tipos}
                                tipoAtivoChave={tipoAtivoChave}
                                carregandoTipos={configuracaoTipos.carregando}
                                avisoTipos={configuracaoTipos.aviso}
                                releasesPorDocumento={releasesPorDocumento}
                                aoSelecionarTipo={(tipoChave) =>
                                    setTipoSelecionado({ projetoChave: projetoSelecionado.chave, tipoChave })
                                }
                                aoVerDocumento={abrirDocumento}
                            />
                        ) : (
                            <EstadoSelecaoProjeto possuiProjetos={projetos.length > 0} />
                        )}
                    </section>
                </div>
                )}
            </section>

            {documentoSelecionado ? (
                <ModalDocumento
                    documento={documentoSelecionado.documento}
                    release={documentoSelecionado.release}
                    mensagemRelease={documentoSelecionado.mensagemRelease}
                    aoFechar={fecharDocumento}
                />
            ) : null}
        </div>
    );
}

function PainelConversasOiac({
    ariaLabelledby,
    conversas,
    conversaSelecionada,
    estadoAnalise,
    estadoConversa,
    id,
    aoSelecionarConversa,
}: {
    ariaLabelledby: string;
    conversas: DocumentoOrientando[];
    conversaSelecionada: DocumentoOrientando | null;
    estadoAnalise?: EstadoReleaseDocumento;
    estadoConversa?: EstadoMensagensDocumento;
    id: string;
    aoSelecionarConversa: (documento: DocumentoOrientando) => void;
}) {
    return (
        <div
            aria-labelledby={ariaLabelledby}
            className="grid min-h-0 overflow-y-auto lg:grid-cols-[minmax(14rem,0.28fr)_minmax(0,1fr)] lg:overflow-hidden"
            id={id}
            role="tabpanel"
        >
            <section className="grid min-w-0 content-start gap-4 border-b border-line p-4 sm:p-5 lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)] lg:overflow-hidden lg:border-r lg:border-b-0">
                <header>
                    <h3 className="font-display text-lg font-bold">Conversas</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">
                        Documentos do tipo OIAC IA deste orientando.
                    </p>
                </header>

                <div className="lg:min-h-0 lg:overflow-y-auto lg:pr-1">
                    {conversas.length === 0 ? (
                        <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-line bg-input-bg p-5 text-center text-muted">
                            <div className="grid justify-items-center gap-2">
                                <MessageSquare size={28} />
                                <p className="text-sm">Nenhum documento do tipo OIAC IA encontrado.</p>
                            </div>
                        </div>
                    ) : (
                        <ul className="grid gap-2" aria-label="Conversas do orientando">
                            {conversas.map((documento) => {
                                const selecionada = conversaSelecionada?.id === documento.id;
                                const avulsa = documentoEhConversaAvulsaOiac(documento);
                                const contexto = avulsa
                                    ? "Conversa avulsa"
                                    : [documento.projeto_nome?.trim(), documento.tipo_documento?.trim()].filter(Boolean).join(" · ") ||
                                      "Documento de grupo";

                                return (
                                    <li key={documento.id}>
                                        <button
                                            aria-controls="transcricao-conversa-orientando"
                                            aria-pressed={selecionada}
                                            className={`grid w-full min-w-0 gap-1 rounded-lg border p-3 text-left transition ${
                                                selecionada
                                                    ? "border-brand bg-subtle-hover text-ink"
                                                    : "border-line bg-input-bg text-ink hover:border-brand hover:bg-subtle-hover"
                                            }`}
                                            type="button"
                                            onClick={() => aoSelecionarConversa(documento)}
                                        >
                                            <span className="block max-w-full whitespace-normal [overflow-wrap:anywhere] font-display text-sm font-bold">
                                                {documento.name}
                                            </span>
                                            <span className="text-xs text-muted">{contexto}</span>
                                            <span className="text-xs font-semibold text-muted">
                                                {formatarDataHora(documento.updated_at ?? documento.created_at)}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>

            <section
                aria-live="polite"
                className="grid min-h-72 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden"
                id="transcricao-conversa-orientando"
            >
                <header className="flex min-w-0 items-center gap-3 border-b border-line p-4 sm:p-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-input-bg text-accent">
                        <Bot size={21} />
                    </span>
                    <div className="min-w-0">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Conversa com a IA</span>
                        <h3 className="mt-0.5 max-w-full whitespace-normal [overflow-wrap:anywhere] font-display text-lg font-bold">
                            {conversaSelecionada?.name ?? "Selecione uma conversa"}
                        </h3>
                    </div>
                </header>

                <div className="min-h-0 overflow-y-auto bg-input-bg/40 p-4 sm:p-5">
                    {!conversaSelecionada ? (
                        <EstadoConversa
                            icone={<MessageSquare size={34} />}
                            titulo="Selecione uma conversa"
                            descricao="Escolha um documento para visualizar as mensagens trocadas entre o orientando e a OIAC IA."
                        />
                    ) : (
                        <div className="flex min-h-full w-full flex-col gap-4">
                            <ResultadoIaConversa estadoRelease={estadoAnalise} />

                            {!estadoConversa || estadoConversa.status === "carregando" ? (
                                <div className="flex items-center gap-2 rounded-lg border border-line bg-panel p-4 text-sm font-semibold text-muted" role="status">
                                    <Loader2 className="animate-spin text-accent" size={18} />
                                    Carregando mensagens da conversa
                                </div>
                            ) : estadoConversa.status === "erro" ? (
                                <div className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-accent" role="alert">
                                    <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                                    <span>{estadoConversa.mensagem}</span>
                                </div>
                            ) : estadoConversa.mensagens.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-line bg-panel p-4 text-center text-sm text-muted">
                                    Nenhuma mensagem foi trocada com a IA neste documento.
                                </div>
                            ) : (
                                estadoConversa.mensagens.map((mensagem) => (
                                    <MensagemConversaOrientando key={mensagem.id} mensagem={mensagem} />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function ResultadoIaConversa({ estadoRelease }: { estadoRelease?: EstadoReleaseDocumento }) {
    if (!estadoRelease || estadoRelease.status === "carregando") {
        return (
            <article className="flex items-center gap-3 rounded-lg border border-line bg-panel p-4 text-sm font-semibold text-muted" role="status">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-input-bg text-accent">
                    <Bot size={19} />
                </span>
                <Loader2 className="animate-spin text-accent" size={18} />
                Carregando resultado da IA
            </article>
        );
    }

    if (estadoRelease.status === "indisponivel") {
        return (
            <article className="grid gap-2 rounded-lg border border-line bg-panel p-4 text-muted">
                <div className="flex items-center gap-2 font-display text-sm font-bold text-ink">
                    <Bot className="text-accent" size={19} />
                    Resultado da OIAC IA
                </div>
                <p className="text-sm leading-6">{estadoRelease.mensagem}</p>
            </article>
        );
    }

    return (
        <article className="rounded-lg border border-line bg-panel p-4 shadow-[0_18px_44px_-32px_var(--chrome-shadow)]">
            <ResultadoAnaliseTipificacao release={estadoRelease.release} />
        </article>
    );
}

function MensagemConversaOrientando({ mensagem }: { mensagem: MensagemDocumento }) {
    const enviadaPelaIa = mensagemFoiEnviadaPelaIa(mensagem);

    return (
        <article
            className={`grid w-fit gap-2 rounded-lg border p-4 shadow-[0_18px_44px_-32px_var(--chrome-shadow)] ${
                enviadaPelaIa
                    ? "max-w-full self-start border-line bg-panel text-ink"
                    : "max-w-[82%] self-end border-brand/35 bg-subtle-hover text-ink"
            }`}
        >
            <div className="flex flex-wrap items-center gap-2">
                <span
                    aria-hidden="true"
                    className={`grid size-9 shrink-0 place-items-center rounded-full border ${
                        enviadaPelaIa ? "border-line bg-input-bg text-accent" : "border-brand/35 bg-panel text-brand"
                    }`}
                >
                    {enviadaPelaIa ? <Bot size={19} /> : <UserRound size={19} />}
                </span>
                <span className="rounded-full border border-line bg-input-bg px-2.5 py-1 font-display text-xs font-bold uppercase tracking-[0.12em]">
                    {enviadaPelaIa ? "OIAC IA" : "Orientando"}
                </span>
                <span className="text-xs font-semibold text-muted">{formatarDataHora(mensagem.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-6">{mensagem.content}</p>
        </article>
    );
}

function EstadoConversa({
    icone,
    titulo,
    descricao,
    erro = false,
    status = false,
}: {
    icone: ReactNode;
    titulo: string;
    descricao: string;
    erro?: boolean;
    status?: boolean;
}) {
    return (
        <div className="grid min-h-64 place-items-center text-center" role={status ? "status" : erro ? "alert" : undefined}>
            <div className={`grid max-w-md justify-items-center gap-3 ${erro ? "text-accent" : "text-muted"}`}>
                {icone}
                <strong className="font-display text-lg text-ink">{titulo}</strong>
                <span className="text-sm leading-6">{descricao}</span>
            </div>
        </div>
    );
}

function EstadoProjetos({ mensagem }: { mensagem: string }) {
    return (
        <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-line bg-input-bg p-5 text-center">
            <div className="grid justify-items-center gap-2 text-muted">
                <FolderKanban size={28} />
                <p className="text-sm">{mensagem}</p>
            </div>
        </div>
    );
}

function EstadoSelecaoProjeto({ possuiProjetos }: { possuiProjetos: boolean }) {
    return (
        <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-line bg-input-bg p-6 text-center">
            <div className="grid max-w-sm justify-items-center gap-3 text-muted">
                {possuiProjetos ? <FileText size={34} /> : <FolderKanban size={34} />}
                <div>
                    <h3 className="font-display text-lg font-bold text-ink">
                        {possuiProjetos ? "Selecione um projeto" : "Nenhum histórico disponível"}
                    </h3>
                    <p className="mt-1 text-sm leading-6">
                        {possuiProjetos
                            ? "Escolha um projeto para visualizar os documentos enviados e seu histórico."
                            : "Este orientando não possui projetos com documentos retornados."}
                    </p>
                </div>
            </div>
        </div>
    );
}

function HistoricoProjeto({
    projeto,
    tiposDocumento,
    tipoAtivoChave,
    carregandoTipos,
    avisoTipos,
    releasesPorDocumento,
    aoSelecionarTipo,
    aoVerDocumento,
}: {
    projeto: ProjetoOrientando;
    tiposDocumento: TipoDocumentoProjeto[];
    tipoAtivoChave: string | null;
    carregandoTipos: boolean;
    avisoTipos: string;
    releasesPorDocumento: Record<string, EstadoReleaseDocumento>;
    aoSelecionarTipo: (tipoChave: string) => void;
    aoVerDocumento: (documento: DocumentoOrientando) => void;
}) {
    const idTabs = useId().replaceAll(":", "");
    const documentosTipoAtivo = tipoAtivoChave
        ? projeto.documentos.filter((documento) => chaveTipoDocumento(documento) === tipoAtivoChave)
        : [];

    const controlarTeclaTab = (evento: ReactKeyboardEvent<HTMLButtonElement>, indiceAtual: number) => {
        let proximoIndice: number | null = null;

        if (evento.key === "ArrowRight") proximoIndice = (indiceAtual + 1) % tiposDocumento.length;
        if (evento.key === "ArrowLeft") proximoIndice = (indiceAtual - 1 + tiposDocumento.length) % tiposDocumento.length;
        if (evento.key === "Home") proximoIndice = 0;
        if (evento.key === "End") proximoIndice = tiposDocumento.length - 1;
        if (proximoIndice === null) return;

        evento.preventDefault();
        const proximoTipo = tiposDocumento[proximoIndice];
        aoSelecionarTipo(proximoTipo.chave);
        document.getElementById(`tab-tipo-${idTabs}-${proximoIndice}`)?.focus();
    };

    return (
        <div className="grid gap-4">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                <div className="min-w-0 flex-1 basis-full sm:basis-0">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Histórico de documentos</span>
                    <h3 className="mt-1 w-full min-w-0 break-all whitespace-normal font-display text-xl font-bold">{projeto.nome}</h3>
                </div>
                <span className="shrink-0 rounded-full border border-line bg-input-bg px-2.5 py-1 text-xs font-bold text-muted">
                    {projeto.documentos.length} {projeto.documentos.length === 1 ? "documento" : "documentos"}
                </span>
            </header>

            {avisoTipos ? <Aviso descricao={avisoTipos} /> : null}

            {carregandoTipos ? (
                <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-line bg-input-bg p-5 text-center" role="status">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
                        <Loader2 className="animate-spin" size={18} />
                        Carregando tipos de documento
                    </span>
                </div>
            ) : tiposDocumento.length === 0 ? (
                <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-line bg-input-bg p-5 text-center text-sm text-muted">
                    Nenhum tipo de documento configurado para este grupo.
                </div>
            ) : (
                <div className="grid min-w-0 gap-4">
                    <div className="min-w-0 overflow-x-auto overflow-y-hidden border-b border-line">
                        <div aria-label="Tipos de documento do projeto" className="flex min-w-max gap-1" role="tablist">
                            {tiposDocumento.map((tipo, indice) => {
                                const selecionado = tipo.chave === tipoAtivoChave;
                                const quantidade = projeto.documentos.filter(
                                    (documento) => chaveTipoDocumento(documento) === tipo.chave
                                ).length;

                                return (
                                    <button
                                        aria-controls={`painel-tipo-${idTabs}`}
                                        aria-selected={selecionado}
                                        className={`-mb-px inline-flex min-h-10 items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand ${
                                            selecionado
                                                ? "border-brand text-brand"
                                                : "border-transparent text-muted hover:border-line hover:text-ink"
                                        }`}
                                        id={`tab-tipo-${idTabs}-${indice}`}
                                        key={tipo.chave}
                                        role="tab"
                                        tabIndex={selecionado ? 0 : -1}
                                        type="button"
                                        onClick={() => aoSelecionarTipo(tipo.chave)}
                                        onKeyDown={(evento) => controlarTeclaTab(evento, indice)}
                                    >
                                        <span>{tipo.nome}</span>
                                        <span className="rounded-full border border-current/25 px-1.5 py-0.5 text-[0.65rem] leading-none">
                                            {quantidade}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div
                        aria-labelledby={`tab-tipo-${idTabs}-${Math.max(
                            0,
                            tiposDocumento.findIndex((tipo) => tipo.chave === tipoAtivoChave)
                        )}`}
                        className="grid gap-3"
                        id={`painel-tipo-${idTabs}`}
                        role="tabpanel"
                        tabIndex={0}
                    >
                        {documentosTipoAtivo.length === 0 ? (
                            <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-line bg-input-bg p-5 text-center">
                                <p className="text-sm text-muted">Nenhum arquivo enviado ainda</p>
                            </div>
                        ) : (
                            <div className="relative">
                                {documentosTipoAtivo.length > 1 ? (
                                    <span
                                        aria-hidden="true"
                                        className="absolute top-[1.625rem] bottom-[1.625rem] left-[0.34375rem] w-px bg-brand/35"
                                    />
                                ) : null}
                                <ul className="grid gap-3" aria-label="Linha do tempo de arquivos enviados">
                                    {documentosTipoAtivo.map((documento, indiceDocumento) => (
                                        <li className="relative pl-8" key={documento.id}>
                                            {indiceDocumento === 0 ? (
                                                <>
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute top-4 -left-1 z-10 size-5 rounded-full border border-brand/60 motion-safe:animate-ping motion-reduce:hidden [animation-duration:1.8s]"
                                                    />
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute top-3 -left-2 z-10 size-7 rounded-full border border-accent/45 motion-safe:animate-ping motion-reduce:hidden [animation-delay:600ms] [animation-duration:1.8s]"
                                                    />
                                                </>
                                            ) : null}
                                            <span
                                                aria-hidden="true"
                                                className={`absolute top-5 left-0 z-20 size-3 rounded-full border-2 border-brand ${
                                                    indiceDocumento === 0 ? "bg-brand shadow-[0_0_0_3px_var(--panel)]" : "bg-panel"
                                                }`}
                                            />
                                            <HistoricoDocumento
                                                documento={documento}
                                                estadoRelease={releasesPorDocumento[documento.id]}
                                                aoVerDocumento={aoVerDocumento}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function NotaMediaDocumento({ estadoRelease }: { estadoRelease?: EstadoReleaseDocumento }) {
    if (!estadoRelease || estadoRelease.status === "carregando") {
        return (
            <span className="absolute top-4 right-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-input-bg px-2.5 py-1 text-xs font-bold text-muted" role="status">
                <Loader2 className="animate-spin" size={13} />
                Calculando média
            </span>
        );
    }

    if (estadoRelease.status === "indisponivel") {
        return (
            <span className="absolute top-4 right-4 inline-flex w-fit rounded-full border border-line bg-input-bg px-2.5 py-1 text-xs font-bold text-muted">
                Nota indisponível
            </span>
        );
    }

    const notaMedia = calcularNotaMediaRelease(estadoRelease.release);
    return (
        <span className="absolute top-4 right-4 grid w-fit gap-1 text-right">
            <span
                className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${
                    notaMedia === null ? "border-line bg-input-bg text-muted" : classeNotaMedia(notaMedia)
                }`}
            >
                {notaMedia === null
                    ? "Sem nota"
                    : `Nota média: ${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(notaMedia)}`}
            </span>
            <span className="text-[0.7rem] text-muted">Média de todos os ramos</span>
        </span>
    );
}

function HistoricoDocumento({
    documento,
    estadoRelease,
    aoVerDocumento,
}: {
    documento: DocumentoOrientando;
    estadoRelease?: EstadoReleaseDocumento;
    aoVerDocumento: (documento: DocumentoOrientando) => void;
}) {
    const carregandoRelease = !estadoRelease || estadoRelease.status === "carregando";

    return (
        <article className="relative grid gap-3 rounded-xl border border-line bg-panel-soft p-4">
            <div className="flex min-w-0 items-start gap-3 pr-48">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-input-bg text-brand">
                    <FileText size={18} />
                </span>
                <div className="min-w-0">
                    <h4 className="break-all whitespace-normal font-display font-bold">{documento.name}</h4>
                    <p className="mt-1 text-xs text-muted">Enviado em {formatarDataHora(documento.created_at)}</p>
                    <p className="mt-0.5 text-xs text-muted">Atualizado em {formatarDataHora(documento.updated_at ?? documento.created_at)}</p>
                    <NotaMediaDocumento estadoRelease={estadoRelease} />
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pr-40 text-xs font-semibold text-muted">
                {documento.grupo?.trim() ? <span className="rounded-md border border-line bg-input-bg px-2 py-1">Grupo: {documento.grupo.trim()}</span> : null}
                {documento.tipo_documento?.trim() ? (
                    <span className="rounded-md border border-line bg-input-bg px-2 py-1">Tipo: {documento.tipo_documento.trim()}</span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-input-bg px-2 py-1">
                    {documento.is_archived ? <Archive size={13} /> : null}
                    {documento.is_archived ? "Arquivado" : "Ativo"}
                </span>
            </div>

            <button
                className="absolute right-4 bottom-4 inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-line bg-input-bg px-3 text-sm font-semibold text-ink transition hover:border-brand hover:bg-subtle-hover disabled:cursor-wait disabled:opacity-55"
                type="button"
                disabled={carregandoRelease}
                onClick={() => aoVerDocumento(documento)}
            >
                <Eye size={16} />
                Ver documento
            </button>
        </article>
    );
}

function ModalDocumento({
    documento,
    release,
    mensagemRelease,
    aoFechar,
}: {
    documento: DocumentoOrientando;
    release: ReleaseExterno | null;
    mensagemRelease?: string;
    aoFechar: () => void;
}) {
    const [carregando, setCarregando] = useState(Boolean(release));
    const [erro, setErro] = useState(release ? "" : mensagemRelease ?? "Nenhuma versão em PDF foi encontrada para este documento.");
    const [urlPdf, setUrlPdf] = useState("");
    const dialogoRef = useRef<HTMLElement>(null);
    const tituloRef = useRef<HTMLHeadingElement>(null);
    const urlPdfRef = useRef("");

    useEffect(() => {
        let cancelado = false;

        async function carregarPdf() {
            if (!release) {
                setErro(mensagemRelease ?? "Nenhuma versão em PDF foi encontrada para este documento.");
                setCarregando(false);
                return;
            }

            setCarregando(true);
            setErro("");
            const [arquivoPdf, arquivoErr] = await baixarArquivoPdfRelease(release.file_path);
            if (cancelado) return;

            if (arquivoErr || !arquivoPdf) {
                setErro(arquivoErr?.message ?? "O backend não retornou o arquivo PDF.");
                setCarregando(false);
                return;
            }

            const proximaUrl = URL.createObjectURL(arquivoPdf);
            if (cancelado) {
                URL.revokeObjectURL(proximaUrl);
                return;
            }

            urlPdfRef.current = proximaUrl;
            setUrlPdf(proximaUrl);
            setCarregando(false);
        }

        void carregarPdf();
        return () => {
            cancelado = true;
            if (urlPdfRef.current) {
                URL.revokeObjectURL(urlPdfRef.current);
                urlPdfRef.current = "";
            }
        };
    }, [mensagemRelease, release]);

    useEffect(() => {
        const elementoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        tituloRef.current?.focus();

        function controlarTeclado(evento: KeyboardEvent) {
            if (evento.key !== "Escape" && evento.key !== "Tab") return;
            evento.stopPropagation();

            if (evento.key === "Escape") {
                evento.preventDefault();
                aoFechar();
                return;
            }

            const elementosFocaveis = Array.from(
                dialogoRef.current?.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
                ) ?? []
            );
            if (elementosFocaveis.length === 0) {
                evento.preventDefault();
                tituloRef.current?.focus();
                return;
            }

            const primeiroElemento = elementosFocaveis[0];
            const ultimoElemento = elementosFocaveis.at(-1);
            if (evento.shiftKey && (document.activeElement === primeiroElemento || document.activeElement === tituloRef.current)) {
                evento.preventDefault();
                ultimoElemento?.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimoElemento) {
                evento.preventDefault();
                primeiroElemento.focus();
            }
        }

        document.addEventListener("keydown", controlarTeclado, true);
        return () => {
            document.removeEventListener("keydown", controlarTeclado, true);
            elementoAnterior?.focus();
        };
    }, [aoFechar]);

    return (
        <div
            className="fixed inset-0 z-[60] grid place-items-center bg-preto/60 p-2 backdrop-blur-sm sm:p-4"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) aoFechar();
            }}
            role="presentation"
        >
            <section
                aria-labelledby="titulo-documento-orientando"
                aria-modal="true"
                className="grid h-[calc(100dvh-1rem)] w-full max-w-[96rem] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl sm:h-[min(54rem,calc(100dvh-2rem))]"
                ref={dialogoRef}
                role="dialog"
            >
                <header className="flex items-start justify-between gap-4 border-b border-line p-4 sm:px-5">
                    <div className="min-w-0">
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Visualização do documento</span>
                        <h2
                            className="mt-1 break-all whitespace-normal font-display text-xl font-bold outline-none"
                            id="titulo-documento-orientando"
                            ref={tituloRef}
                            tabIndex={-1}
                        >
                            {documento.name}
                        </h2>
                    </div>
                    <button
                        aria-label="Fechar documento"
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-input-bg text-muted transition hover:border-brand hover:bg-subtle-hover hover:text-ink"
                        type="button"
                        onClick={aoFechar}
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="min-h-0 overflow-y-auto bg-background lg:overflow-hidden">
                    <div className="grid min-h-full lg:h-full lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
                        <section aria-label="Documento em PDF" className="min-h-[32rem] overflow-hidden border-b border-line lg:min-h-0 lg:border-r lg:border-b-0">
                            {carregando ? (
                                <EstadoDocumentoModal
                                    icone={<Loader2 className="animate-spin" size={38} />}
                                    titulo="Carregando documento"
                                    descricao="Carregando o PDF desta versão."
                                />
                            ) : erro ? (
                                <EstadoDocumentoModal icone={<FileText size={38} />} titulo="Documento indisponível" descricao={erro} />
                            ) : urlPdf ? (
                                <PdfDocumentViewer fileUrl={urlPdf} />
                            ) : (
                                <EstadoDocumentoModal
                                    icone={<FileText size={38} />}
                                    titulo="Documento indisponível"
                                    descricao="Nenhuma versão em PDF foi encontrada para este documento."
                                />
                            )}
                        </section>

                        <aside aria-label="Resultado da análise de tipificação" className="min-w-0 p-4 sm:p-5 lg:min-h-0 lg:overflow-y-auto">
                            <ResultadoAnaliseTipificacao release={release} />
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    );
}

function EstadoDocumentoModal({ icone, titulo, descricao }: { icone: ReactNode; titulo: string; descricao: string }) {
    return (
        <div className="grid h-full min-h-72 place-items-center p-6 text-center">
            <div className="grid max-w-md justify-items-center gap-3">
                <span className="text-brand">{icone}</span>
                <h3 className="font-display text-xl font-bold text-ink">{titulo}</h3>
                <p className="text-sm leading-6 text-muted">{descricao}</p>
            </div>
        </div>
    );
}

function ContadorSequencial({ valor }: { valor: number }) {
    const reduzirMovimento = useReducedMotion();
    const [valorExibido, setValorExibido] = useState(0);

    useEffect(() => {
        if (reduzirMovimento || valor <= 0) return;

        let quadro = 0;
        let valorAtual = 0;
        let instanteUltimoAvanco: number | null = null;
        const intervaloEntreValores = Math.max(
            INTERVALO_MINIMO_CONTADOR_MS,
            Math.min(INTERVALO_MAXIMO_CONTADOR_MS, DURACAO_ALVO_CONTADOR_MS / valor)
        );

        const avancar = (instanteAtual: number) => {
            if (instanteUltimoAvanco === null) instanteUltimoAvanco = instanteAtual;

            if (instanteAtual - instanteUltimoAvanco >= intervaloEntreValores) {
                valorAtual += 1;
                instanteUltimoAvanco = instanteAtual;
                setValorExibido(valorAtual);
            }

            if (valorAtual < valor) {
                quadro = window.requestAnimationFrame(avancar);
            }
        };

        quadro = window.requestAnimationFrame(avancar);
        return () => window.cancelAnimationFrame(quadro);
    }, [reduzirMovimento, valor]);

    return (
        <>
            <span className="sr-only">{valor}</span>
            <span aria-hidden="true">{reduzirMovimento ? valor : valorExibido}</span>
        </>
    );
}

function Resumo({ valor, rotulo, animar = false }: { valor: number; rotulo: string; animar?: boolean }) {
    return (
        <div className="rounded-lg border border-line bg-panel px-4 py-3">
            <strong className="font-display text-2xl">
                {animar ? <ContadorSequencial key={valor} valor={valor} /> : valor}
            </strong>
            <span className="mt-0.5 block text-xs font-semibold text-muted">{rotulo}</span>
        </div>
    );
}

function Aviso({ descricao }: { descricao: string }) {
    return (
        <div className="flex items-start gap-2 rounded-lg border border-laranja/40 bg-laranja/10 px-3 py-2.5 text-sm text-ink">
            <AlertTriangle className="mt-0.5 shrink-0 text-laranja" size={17} />
            <span>{descricao}</span>
        </div>
    );
}

function Estado({ icone, titulo, descricao, erro = false }: { icone: ReactNode; titulo: string; descricao: string; erro?: boolean }) {
    return (
        <div className={`grid min-h-64 place-items-center rounded-xl border p-6 text-center ${erro ? "border-laranja/40 bg-laranja/10" : "border-line bg-panel"}`}>
            <div className="grid max-w-md justify-items-center gap-3">
                <span className={erro ? "text-laranja" : "text-brand"}>{icone}</span>
                <h2 className="font-display text-xl font-bold">{titulo}</h2>
                <p className="text-sm leading-6 text-muted">{descricao}</p>
            </div>
        </div>
    );
}
