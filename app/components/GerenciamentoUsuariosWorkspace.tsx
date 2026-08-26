"use client";

import { AlertTriangle, Loader2, RefreshCw, Search, ShieldCheck, ShieldPlus, Trash2, UsersRound } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/app/data/provider/AuthProvider";
import { atualizarNivelAcessoUsuario, listarUsuarios, removerUsuario } from "@/app/services/usuario";
import type { NivelAcessoGerenciavel, UsuarioAutenticado } from "@/app/types/Autenticacao";

function rotuloNivelAcesso(nivel: UsuarioAutenticado["access_level"]) {
    return nivel === "ADMIN" ? "Orientador (administrador)" : "Orientando (usuário padrão)";
}

export default function GerenciamentoUsuariosWorkspace() {
    const { usuario: usuarioAtual } = useAuth();
    const [usuarios, setUsuarios] = useState<UsuarioAutenticado[]>([]);
    const [consulta, setConsulta] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<UsuarioAutenticado | null>(null);
    const [excluindo, setExcluindo] = useState(false);
    const [usuarioParaAlterarAcesso, setUsuarioParaAlterarAcesso] = useState<UsuarioAutenticado | null>(null);
    const [nivelAcessoSelecionado, setNivelAcessoSelecionado] = useState<NivelAcessoGerenciavel>("DEFAULT");
    const [atualizandoAcesso, setAtualizandoAcesso] = useState(false);
    const idCarregamento = useRef(0);
    const buscaId = useId();

    const carregarUsuarios = useCallback(async (termo: string) => {
        const requisicaoAtual = ++idCarregamento.current;
        setCarregando(true);
        setErro("");
        setUsuarios([]);
        const [resultado, err] = await listarUsuarios(termo);

        if (requisicaoAtual !== idCarregamento.current) return;
        if (err) {
            setErro(err.message);
        } else {
            setUsuarios(resultado);
        }
        setCarregando(false);
    }, []);

    useEffect(() => {
        const espera = window.setTimeout(() => void carregarUsuarios(consulta), consulta ? 250 : 0);
        return () => window.clearTimeout(espera);
    }, [carregarUsuarios, consulta]);

    async function confirmarExclusao() {
        if (!usuarioParaExcluir || usuarioParaExcluir.id === usuarioAtual?.id) return;

        setExcluindo(true);
        const [, err] = await removerUsuario(usuarioParaExcluir.id);
        setExcluindo(false);

        if (err) {
            toast.error(err.message);
            return;
        }

        setUsuarios((usuariosAtuais) => usuariosAtuais.filter((usuario) => usuario.id !== usuarioParaExcluir.id));
        setUsuarioParaExcluir(null);
        toast.success(`Usuário ${usuarioParaExcluir.username} removido da plataforma.`);
    }

    function abrirAlteracaoAcesso(usuario: UsuarioAutenticado) {
        if (usuario.id === usuarioAtual?.id) return;
        setNivelAcessoSelecionado(usuario.access_level === "ADMIN" ? "ADMIN" : "DEFAULT");
        setUsuarioParaAlterarAcesso(usuario);
    }

    async function confirmarAlteracaoAcesso() {
        if (!usuarioParaAlterarAcesso || usuarioParaAlterarAcesso.id === usuarioAtual?.id) return;

        setAtualizandoAcesso(true);
        const [usuarioAtualizado, err] = await atualizarNivelAcessoUsuario({
            usuario: usuarioParaAlterarAcesso,
            nivelAcesso: nivelAcessoSelecionado,
        });
        setAtualizandoAcesso(false);

        if (err || !usuarioAtualizado) {
            toast.error(err?.message ?? "Não foi possível atualizar o nível de acesso.");
            return;
        }

        setUsuarios((usuariosAtuais) => usuariosAtuais.map((usuario) => usuario.id === usuarioAtualizado.id ? usuarioAtualizado : usuario));
        setUsuarioParaAlterarAcesso(null);
        toast.success(`Nível de acesso de ${usuarioAtualizado.username} atualizado.`);
    }

    return (
        <div className="min-h-full bg-background text-ink">
            <header className="sticky top-0 z-20 border-b border-line bg-background/95 px-5 py-4 backdrop-blur sm:px-7">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-accent">
                            <ShieldCheck size={18} aria-hidden="true" />
                            <span className="font-display text-xs font-bold uppercase tracking-[0.18em]">Área administrativa</span>
                        </div>
                        <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Gerenciar usuários</h1>
                        <p className="mt-1 text-sm text-muted">Localize, remova contas e ajuste permissões quando necessário para testes.</p>
                    </div>
                    <button
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-semibold transition hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        disabled={carregando}
                        onClick={() => void carregarUsuarios(consulta)}
                    >
                        <RefreshCw className={carregando ? "animate-spin" : ""} size={16} aria-hidden="true" />
                        Atualizar
                    </button>
                </div>
            </header>

            <main className="mx-auto grid max-w-6xl gap-5 p-5 sm:p-7">
                <label className="flex h-12 items-center gap-3 rounded-lg border border-line bg-input-bg px-3 focus-within:border-brand focus-within:ring-3 focus-within:ring-focus/35" htmlFor={buscaId}>
                    <Search className="shrink-0 text-muted" size={19} aria-hidden="true" />
                    <span className="sr-only">Buscar usuário</span>
                    <input
                        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
                        id={buscaId}
                        type="search"
                        value={consulta}
                        onChange={(event) => setConsulta(event.target.value)}
                        placeholder="Buscar por nome, e-mail ou outro dado"
                    />
                </label>

                {carregando ? (
                    <EstadoPainel icone={<Loader2 className="animate-spin text-brand" size={28} />} texto="Carregando usuários…" />
                ) : erro ? (
                    <section className="grid justify-items-center gap-4 rounded-xl border border-accent/35 bg-panel p-8 text-center" role="alert">
                        <AlertTriangle className="text-accent" size={30} aria-hidden="true" />
                        <div>
                            <h2 className="font-display text-lg font-bold">Não foi possível carregar os usuários</h2>
                            <p className="mt-1 text-sm text-muted">{erro}</p>
                        </div>
                        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 text-sm font-semibold transition hover:bg-subtle-hover" type="button" onClick={() => void carregarUsuarios(consulta)}>
                            <RefreshCw size={16} aria-hidden="true" />
                            Tentar novamente
                        </button>
                    </section>
                ) : usuarios.length === 0 ? (
                    <EstadoPainel icone={<UsersRound className="text-muted" size={30} />} texto={consulta ? "Nenhum usuário corresponde à busca." : "Nenhum usuário está disponível."} />
                ) : (
                    <section className="overflow-hidden rounded-xl border border-line bg-panel">
                        <div className="hidden grid-cols-[minmax(13rem,1.35fr)_minmax(15rem,1.6fr)_minmax(8rem,.8fr)_auto] gap-4 border-b border-line bg-panel-soft px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted md:grid">
                            <span>Usuário</span>
                            <span>Contato</span>
                            <span>Acesso</span>
                            <span className="text-right">Ação</span>
                        </div>
                        <ul className="divide-y divide-line">
                            {usuarios.map((usuario) => {
                                const contaAtual = usuario.id === usuarioAtual?.id;
                                return (
                                    <li className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(13rem,1.35fr)_minmax(15rem,1.6fr)_minmax(8rem,.8fr)_auto] md:items-center md:gap-4" key={usuario.id}>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <strong className="truncate font-display text-base">{usuario.username}</strong>
                                                {contaAtual ? <span className="rounded-full bg-brand/12 px-2 py-0.5 text-xs font-bold text-brand">Sua conta</span> : null}
                                            </div>
                                            <span className="mt-1 block text-sm text-muted md:hidden">{usuario.email}</span>
                                        </div>
                                        <div className="min-w-0 text-sm text-muted">
                                            <span className="block truncate">{usuario.email}</span>
                                            <span className="mt-1 block">{usuario.phone_number || "Telefone não informado"}</span>
                                        </div>
                                        <span className="w-fit rounded-full bg-panel-soft px-2.5 py-1 text-xs font-bold text-ink">{rotuloNivelAcesso(usuario.access_level)}</span>
                                        <div className="flex justify-end">
                                            {contaAtual ? (
                                                <span className="text-xs font-semibold text-muted">Conta atual</span>
                                            ) : (
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <button
                                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold transition hover:bg-subtle-hover"
                                                        type="button"
                                                        onClick={() => abrirAlteracaoAcesso(usuario)}
                                                    >
                                                        <ShieldPlus size={16} aria-hidden="true" />
                                                        Alterar acesso
                                                    </button>
                                                    <button
                                                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-accent/40 px-3 text-sm font-semibold text-accent transition hover:bg-accent/10"
                                                        type="button"
                                                        onClick={() => setUsuarioParaExcluir(usuario)}
                                                    >
                                                        <Trash2 size={16} aria-hidden="true" />
                                                        Remover
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                )}
            </main>

            {usuarioParaExcluir ? (
                <ConfirmacaoRemocaoUsuario
                    carregando={excluindo}
                    usuario={usuarioParaExcluir}
                    onCancelar={() => !excluindo && setUsuarioParaExcluir(null)}
                    onConfirmar={() => void confirmarExclusao()}
                />
            ) : null}

            {usuarioParaAlterarAcesso ? (
                <ConfirmacaoAlteracaoAcesso
                    carregando={atualizandoAcesso}
                    nivelSelecionado={nivelAcessoSelecionado}
                    usuario={usuarioParaAlterarAcesso}
                    onCancelar={() => !atualizandoAcesso && setUsuarioParaAlterarAcesso(null)}
                    onConfirmar={() => void confirmarAlteracaoAcesso()}
                    onNivelSelecionado={setNivelAcessoSelecionado}
                />
            ) : null}
        </div>
    );
}

function EstadoPainel({ icone, texto }: { icone: React.ReactNode; texto: string }) {
    return <section className="grid min-h-56 place-items-center gap-3 rounded-xl border border-line bg-panel p-8 text-center text-muted" role="status">{icone}<span>{texto}</span></section>;
}

function ConfirmacaoRemocaoUsuario({
    carregando,
    usuario,
    onCancelar,
    onConfirmar,
}: {
    carregando: boolean;
    usuario: UsuarioAutenticado;
    onCancelar: () => void;
    onConfirmar: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-preto/45 p-5 backdrop-blur-sm" role="presentation">
            <section aria-describedby="descricao-remocao-usuario" aria-labelledby="titulo-remocao-usuario" aria-modal="true" className="w-full max-w-md rounded-xl border border-line bg-panel p-5 shadow-xl" role="dialog">
                <div className="flex size-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <AlertTriangle size={23} aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold" id="titulo-remocao-usuario">Remover usuário?</h2>
                <p className="mt-2 text-sm leading-6 text-muted" id="descricao-remocao-usuario">
                    A conta de <strong className="text-ink">{usuario.username}</strong> ({usuario.email}) será removida da plataforma. Esta ação não pode ser desfeita.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button className="h-10 rounded-lg border border-line px-4 text-sm font-semibold transition hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={carregando} onClick={onCancelar}>
                        Cancelar
                    </button>
                    <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={carregando} onClick={onConfirmar}>
                        {carregando ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
                        {carregando ? "Removendo…" : "Remover usuário"}
                    </button>
                </div>
            </section>
        </div>
    );
}

function ConfirmacaoAlteracaoAcesso({
    carregando,
    nivelSelecionado,
    usuario,
    onCancelar,
    onConfirmar,
    onNivelSelecionado,
}: {
    carregando: boolean;
    nivelSelecionado: NivelAcessoGerenciavel;
    usuario: UsuarioAutenticado;
    onCancelar: () => void;
    onConfirmar: () => void;
    onNivelSelecionado: (nivel: NivelAcessoGerenciavel) => void;
}) {
    const selectId = "nivel-acesso-usuario";
    const nivelAtualGerenciavel = usuario.access_level === "ADMIN" ? "ADMIN" : "DEFAULT";
    const nivelAlterado = nivelSelecionado !== nivelAtualGerenciavel;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-preto/45 p-5 backdrop-blur-sm" role="presentation">
            <section aria-describedby="descricao-alteracao-acesso" aria-labelledby="titulo-alteracao-acesso" aria-modal="true" className="w-full max-w-md rounded-xl border border-line bg-panel p-5 shadow-xl" role="dialog">
                <div className="flex size-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <ShieldPlus size={23} aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold" id="titulo-alteracao-acesso">Alterar nível de acesso</h2>
                <p className="mt-2 text-sm leading-6 text-muted" id="descricao-alteracao-acesso">
                    Escolha se <strong className="text-ink">{usuario.username}</strong> ({usuario.email}) será orientando ou orientador e confirme para aplicar a alteração.
                </p>
                <label className="mt-5 grid gap-2 text-sm font-semibold" htmlFor={selectId}>
                    Novo nível de acesso
                    <select
                        className="h-11 rounded-lg border border-line bg-input-bg px-3 text-base font-normal text-ink outline-none focus:border-brand focus:ring-3 focus:ring-focus/35"
                        disabled={carregando}
                        id={selectId}
                        value={nivelSelecionado}
                        onChange={(event) => onNivelSelecionado(event.target.value as NivelAcessoGerenciavel)}
                    >
                        <option value="DEFAULT">Orientando (usuário padrão)</option>
                        <option value="ADMIN">Orientador (administrador)</option>
                    </select>
                </label>
                <div className="mt-6 flex justify-end gap-3">
                    <button className="h-10 rounded-lg border border-line px-4 text-sm font-semibold transition hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={carregando} onClick={onCancelar}>
                        Cancelar
                    </button>
                    <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-background transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={carregando || !nivelAlterado} onClick={onConfirmar}>
                        {carregando ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <ShieldPlus size={16} aria-hidden="true" />}
                        {carregando ? "Salvando…" : "Confirmar alteração"}
                    </button>
                </div>
            </section>
        </div>
    );
}
