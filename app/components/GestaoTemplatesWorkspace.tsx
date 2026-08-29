"use client";

import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, FilePlus2, FileText, Loader2, Pencil, RefreshCw, Save, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/app/data/provider/AuthProvider";
import {
    atualizarTemplate,
    criarTemplate,
    listarTemplatesAdministracao,
    removerTemplate,
} from "@/app/services/template";
import type { TemplateConformidade } from "@/app/types/Conformidade";

function formatarData(data?: string | null) {
    if (!data) return "Não atualizada";

    const valor = new Date(data);
    return Number.isNaN(valor.getTime()) ? "Não atualizada" : new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(valor);
}

function validarPdf(arquivo: File | null) {
    if (!arquivo) return "Selecione um arquivo PDF.";
    if (arquivo.type === "application/pdf" || arquivo.name.toLocaleLowerCase("pt-BR").endsWith(".pdf")) return null;
    return "Selecione um arquivo no formato PDF.";
}

function nomeSemExtensao(arquivo: File) {
    return arquivo.name.replace(/\.[^/.]+$/, "");
}

export default function GestaoTemplatesWorkspace() {
    const { usuario } = useAuth();
    const [templates, setTemplates] = useState<TemplateConformidade[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState("");
    const [novoNome, setNovoNome] = useState("");
    const [novoArquivo, setNovoArquivo] = useState<File | null>(null);
    const [salvandoNovo, setSalvandoNovo] = useState(false);
    const [templateEditando, setTemplateEditando] = useState<TemplateConformidade | null>(null);
    const [nomeEdicao, setNomeEdicao] = useState("");
    const [arquivoEdicao, setArquivoEdicao] = useState<File | null>(null);
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [templateParaExcluir, setTemplateParaExcluir] = useState<TemplateConformidade | null>(null);
    const [excluindo, setExcluindo] = useState(false);
    const inputNovoArquivo = useRef<HTMLInputElement>(null);
    const inputArquivoEdicao = useRef<HTMLInputElement>(null);

    const carregarTemplates = useCallback(async () => {
        const possuiDados = templates.length > 0;
        if (possuiDados) setAtualizando(true);
        else setCarregando(true);

        const [itens, err] = await listarTemplatesAdministracao();
        if (err) {
            setErro(err.message);
            if (!possuiDados) setTemplates([]);
        } else {
            setTemplates(itens);
            setErro("");
        }

        setCarregando(false);
        setAtualizando(false);
    }, [templates.length]);

    useEffect(() => {
        if (usuario?.access_level !== "ADMIN") return;
        void Promise.resolve().then(carregarTemplates);
    }, [carregarTemplates, usuario?.access_level]);

    if (usuario?.access_level !== "ADMIN") return null;

    function selecionarArquivoNovo(event: ChangeEvent<HTMLInputElement>) {
        const arquivo = event.target.files?.[0] ?? null;
        const erroArquivo = validarPdf(arquivo);
        if (erroArquivo) {
            toast.error(erroArquivo);
            event.target.value = "";
            return;
        }

        setNovoArquivo(arquivo);
    }

    function selecionarArquivoEdicao(event: ChangeEvent<HTMLInputElement>) {
        const arquivo = event.target.files?.[0] ?? null;
        if (!arquivo) return setArquivoEdicao(null);

        const erroArquivo = validarPdf(arquivo);
        if (erroArquivo) {
            toast.error(erroArquivo);
            event.target.value = "";
            return;
        }

        setArquivoEdicao(arquivo);
    }

    async function cadastrarTemplate() {
        const nome = novoNome.trim();
        if (!nome) return toast.error("Informe o nome do template.");

        const erroArquivo = validarPdf(novoArquivo);
        if (erroArquivo) return toast.error(erroArquivo);

        setSalvandoNovo(true);
        const [, err] = await criarTemplate({ nome, arquivo: novoArquivo! });
        setSalvandoNovo(false);

        if (err) return toast.error(err.message);

        setNovoNome("");
        setNovoArquivo(null);
        if (inputNovoArquivo.current) inputNovoArquivo.current.value = "";
        toast.success("Template cadastrado.");
        await carregarTemplates();
    }

    function iniciarEdicao(template: TemplateConformidade) {
        setTemplateEditando(template);
        setNomeEdicao(template.name);
        setArquivoEdicao(null);
        if (inputArquivoEdicao.current) inputArquivoEdicao.current.value = "";
    }

    function cancelarEdicao() {
        setTemplateEditando(null);
        setNomeEdicao("");
        setArquivoEdicao(null);
    }

    async function salvarEdicao() {
        if (!templateEditando) return;

        const nome = nomeEdicao.trim();
        if (!nome && !arquivoEdicao) return toast.error("Informe um nome ou selecione um novo PDF.");

        setSalvandoEdicao(true);
        const [, err] = await atualizarTemplate(templateEditando.id, {
            nome: nome === templateEditando.name ? undefined : nome,
            arquivo: arquivoEdicao,
        });
        setSalvandoEdicao(false);

        if (err) return toast.error(err.message);

        cancelarEdicao();
        toast.success("Template atualizado.");
        await carregarTemplates();
    }

    async function confirmarExclusao() {
        if (!templateParaExcluir) return;

        setExcluindo(true);
        const [, err] = await removerTemplate(templateParaExcluir.id);
        setExcluindo(false);

        if (err) return toast.error(err.message);

        setTemplateParaExcluir(null);
        toast.success("Template excluído.");
        await carregarTemplates();
    }

    return (
        <section className="grid gap-6 p-5 text-ink md:p-7">
            <header className="sticky top-0 z-30 -mx-5 -mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-line bg-background/95 px-5 py-5 shadow-[0_16px_30px_-26px_var(--chrome-shadow)] backdrop-blur md:-mx-7 md:-mt-7 md:px-7">
                <div>
                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Conformidade institucional</span>
                    <h1 className="mt-2 font-display text-3xl font-bold">Templates</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                        Cadastre e mantenha os PDFs institucionais disponíveis para as análises de conformidade.
                    </p>
                </div>
                <button
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 font-semibold transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                    type="button"
                    disabled={carregando || atualizando}
                    onClick={() => void carregarTemplates()}
                >
                    <RefreshCw className={carregando || atualizando ? "animate-spin" : ""} size={17} />
                    Atualizar
                </button>
            </header>

            <form
                className="grid gap-3 rounded-xl border border-line bg-panel p-4 shadow-[0_18px_44px_-28px_var(--chrome-shadow)] lg:grid-cols-[minmax(12rem,1fr)_minmax(15rem,1fr)_auto] lg:items-end"
                onSubmit={(event) => {
                    event.preventDefault();
                    void cadastrarTemplate();
                }}
            >
                <div className="grid gap-2">
                    <label className="grid gap-1.5 text-sm font-semibold">
                        Nome do template
                        <span className="flex items-center gap-2">
                            <span className="relative min-w-0 flex-1">
                                <input
                                    className="h-10 w-full rounded-lg border border-line bg-input-bg px-3 pr-10 text-sm font-normal outline-none transition focus:border-brand"
                                    value={novoNome}
                                    placeholder="Ex.: Modelo de artigo Fiocruz"
                                    onChange={(event) => setNovoNome(event.target.value)}
                                    disabled={salvandoNovo}
                                />
                                {novoNome ? (
                                    <button
                                        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted transition hover:text-ink disabled:cursor-not-allowed"
                                        type="button"
                                        aria-label="Limpar nome do template"
                                        title="Limpar nome"
                                        onClick={() => setNovoNome("")}
                                        disabled={salvandoNovo}
                                    >
                                        <X size={17} />
                                    </button>
                                ) : null}
                            </span>
                            <button
                                className="h-10 shrink-0 rounded-lg border border-line bg-input-bg px-3 text-xs font-semibold text-accent transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                                type="button"
                                onClick={() => novoArquivo && setNovoNome(nomeSemExtensao(novoArquivo))}
                                disabled={!novoArquivo || salvandoNovo}
                            >
                                Usar nome do arquivo
                            </button>
                        </span>
                    </label>
                </div>
                <div className="grid gap-1.5 text-sm font-semibold">
                    <span>PDF institucional</span>
                    <div className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-brand/50 bg-subtle-hover px-2">
                        <input
                            ref={inputNovoArquivo}
                            className="sr-only"
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={selecionarArquivoNovo}
                            disabled={salvandoNovo}
                        />
                        <button
                            className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md bg-brand px-3 text-xs font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55 dark:text-preto"
                            type="button"
                            onClick={() => inputNovoArquivo.current?.click()}
                            disabled={salvandoNovo}
                        >
                            <Upload size={15} />
                            Escolher arquivo
                        </button>
                        <span className="min-w-0 flex-1 truncate text-xs font-normal text-muted" title={novoArquivo?.name}>
                            {novoArquivo?.name ?? "Nenhum PDF selecionado"}
                        </span>
                    </div>
                </div>
                <button
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-display text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55 dark:text-preto"
                    type="submit"
                    disabled={salvandoNovo}
                >
                    {salvandoNovo ? <Loader2 className="animate-spin" size={17} /> : <FilePlus2 size={17} />}
                    {salvandoNovo ? "Cadastrando..." : "Cadastrar template"}
                </button>
            </form>

            {templateEditando ? (
                <form
                    className="grid gap-3 rounded-xl border border-brand/40 bg-panel-soft p-4 lg:grid-cols-[minmax(12rem,1fr)_minmax(15rem,1fr)_auto_auto] lg:items-end"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void salvarEdicao();
                    }}
                >
                    <div className="lg:col-span-4">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Editando template</p>
                        <p className="mt-1 truncate text-sm text-muted" title={templateEditando.original_filename}>{templateEditando.original_filename}</p>
                    </div>
                    <div className="grid gap-2">
                        <label className="grid gap-1.5 text-sm font-semibold">
                            Nome
                            <span className="flex items-center gap-2">
                                <span className="relative min-w-0 flex-1">
                                    {nomeEdicao ? (
                                        <button
                                            className="absolute inset-y-0 right-0 z-10 grid w-10 place-items-center text-muted transition hover:text-ink disabled:cursor-not-allowed"
                                            type="button"
                                            aria-label="Limpar nome do template"
                                            title="Limpar nome"
                                            onClick={() => setNomeEdicao("")}
                                            disabled={salvandoEdicao}
                                        >
                                            <X size={17} />
                                        </button>
                                    ) : null}
                                    <input
                                        className="h-10 w-full rounded-lg border border-line bg-panel px-3 pr-10 text-sm font-normal outline-none transition focus:border-brand"
                                        value={nomeEdicao}
                                        onChange={(event) => setNomeEdicao(event.target.value)}
                                        disabled={salvandoEdicao}
                                    />
                                </span>
                                <button
                                    className="h-10 shrink-0 rounded-lg border border-line bg-panel px-3 text-xs font-semibold text-accent transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                                    type="button"
                                    onClick={() => arquivoEdicao && setNomeEdicao(nomeSemExtensao(arquivoEdicao))}
                                    disabled={!arquivoEdicao || salvandoEdicao}
                                >
                                    Usar nome do arquivo
                                </button>
                            </span>
                        </label>
                    </div>
                    <div className="grid gap-1.5 text-sm font-semibold">
                        <span>Substituir PDF (opcional)</span>
                        <div className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-brand/50 bg-panel px-2">
                            <input
                                ref={inputArquivoEdicao}
                                className="sr-only"
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={selecionarArquivoEdicao}
                                disabled={salvandoEdicao}
                            />
                            <button
                                className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md bg-brand px-3 text-xs font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55 dark:text-preto"
                                type="button"
                                onClick={() => inputArquivoEdicao.current?.click()}
                                disabled={salvandoEdicao}
                            >
                                <Upload size={15} />
                                Escolher arquivo
                            </button>
                            <span className="min-w-0 flex-1 truncate text-xs font-normal text-muted" title={arquivoEdicao?.name}>
                                {arquivoEdicao?.name ?? "Manter PDF atual"}
                            </span>
                        </div>
                    </div>
                    <button
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-display text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55 dark:text-preto"
                        type="submit"
                        disabled={salvandoEdicao}
                    >
                        {salvandoEdicao ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                        Salvar
                    </button>
                    <button
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-panel px-4 text-sm font-semibold transition hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-55"
                        type="button"
                        onClick={cancelarEdicao}
                        disabled={salvandoEdicao}
                    >
                        <X size={17} />
                        Cancelar
                    </button>
                </form>
            ) : null}

            {erro && templates.length === 0 ? (
                <Estado icone={<AlertTriangle size={36} />} titulo="Não foi possível carregar os templates" descricao={erro} erro />
            ) : carregando ? (
                <Estado icone={<Loader2 className="animate-spin" size={36} />} titulo="Carregando templates" descricao="Buscando os templates institucionais." />
            ) : templates.length === 0 ? (
                <Estado icone={<FileText size={36} />} titulo="Nenhum template cadastrado" descricao="Cadastre um PDF institucional para disponibilizá-lo na análise de conformidade." />
            ) : (
                <div className="grid gap-3">
                    {templates.map((template) => (
                        <article key={template.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-panel p-4 shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
                            <div className="flex min-w-0 items-start gap-3">
                                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-panel-soft text-brand"><FileText size={20} /></span>
                                <div className="min-w-0">
                                    <h2 className="truncate font-display text-lg font-bold" title={template.name}>{template.name}</h2>
                                    <p className="mt-1 truncate text-sm text-muted" title={template.original_filename}>{template.original_filename}</p>
                                    <p className="mt-1 text-xs text-muted">Atualizado: {formatarData(template.updated_at ?? template.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 text-sm font-semibold transition hover:border-brand hover:bg-subtle-hover" type="button" onClick={() => iniciarEdicao(template)}>
                                    <Pencil size={16} /> Editar
                                </button>
                                <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-laranja/40 bg-laranja/10 px-3 text-sm font-semibold text-laranja transition hover:bg-laranja/20" type="button" onClick={() => setTemplateParaExcluir(template)}>
                                    <Trash2 size={16} /> Excluir
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {erro && templates.length > 0 ? <p className="rounded-lg border border-laranja/40 bg-laranja/10 px-3 py-2 text-sm text-laranja">{erro} Os templates já exibidos foram mantidos.</p> : null}

            {templateParaExcluir ? (
                <div className="fixed inset-0 z-50 grid place-items-center bg-preto/45 p-5 backdrop-blur-sm" role="presentation">
                    <section className="w-full max-w-md rounded-xl border border-line bg-panel p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="titulo-excluir-template">
                        <h2 id="titulo-excluir-template" className="font-display text-xl font-bold">Excluir template?</h2>
                        <p className="mt-2 text-sm leading-6 text-muted">O template “{templateParaExcluir.name}” será removido do catálogo e deixará de estar disponível para novas análises.</p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button className="h-10 rounded-lg border border-line px-4 text-sm font-semibold transition hover:bg-input-bg disabled:cursor-not-allowed disabled:opacity-55" type="button" disabled={excluindo} onClick={() => setTemplateParaExcluir(null)}>Cancelar</button>
                            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-laranja px-4 text-sm font-semibold text-preto transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55" type="button" disabled={excluindo} onClick={() => void confirmarExclusao()}>
                                {excluindo ? <Loader2 className="animate-spin" size={17} /> : <Trash2 size={17} />}
                                {excluindo ? "Excluindo..." : "Excluir"}
                            </button>
                        </div>
                    </section>
                </div>
            ) : null}
        </section>
    );
}

function Estado({ icone, titulo, descricao, erro = false }: { icone: React.ReactNode; titulo: string; descricao: string; erro?: boolean }) {
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
