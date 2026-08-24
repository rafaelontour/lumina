"use client";

import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, UserRoundCheck } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { listarCandidatosOrientacao } from "@/app/services/orientacao";
import type { UsuarioAutenticado } from "@/app/types/Autenticacao";

type OnboardingOrientadorObrigatorioProps = {
    usuario: UsuarioAutenticado;
    erroVerificacao: string | null;
    aoSalvar: (orientadorId: string) => Promise<Error | null>;
    aoTentarNovamenteVerificacao: () => Promise<void>;
};

export default function OnboardingOrientadorObrigatorio({
    usuario,
    erroVerificacao,
    aoSalvar,
    aoTentarNovamenteVerificacao,
}: OnboardingOrientadorObrigatorioProps) {
    const [orientadores, setOrientadores] = useState<UsuarioAutenticado[]>([]);
    const [orientadorSelecionadoId, setOrientadorSelecionadoId] = useState("");
    const [carregando, setCarregando] = useState(!erroVerificacao);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const tituloRef = useRef<HTMLHeadingElement>(null);

    const carregarOrientadores = useCallback(async () => {
        setCarregando(true);
        setErro("");
        const [candidatos, err] = await listarCandidatosOrientacao(usuario.id);
        if (err) {
            setOrientadores([]);
            setErro(err.message);
        } else {
            setOrientadores(candidatos);
        }
        setCarregando(false);
    }, [usuario.id]);

    useEffect(() => {
        tituloRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!erroVerificacao) void Promise.resolve().then(carregarOrientadores);
    }, [carregarOrientadores, erroVerificacao]);

    const mensagemErro = erroVerificacao ?? erro;

    async function salvar() {
        if (!orientadorSelecionadoId) {
            setErro("Selecione um orientador para continuar.");
            return;
        }

        setSalvando(true);
        setErro("");
        const err = await aoSalvar(orientadorSelecionadoId);
        if (err) setErro(err.message);
        setSalvando(false);
    }

    async function tentarNovamente() {
        if (erroVerificacao) {
            await aoTentarNovamenteVerificacao();
            return;
        }
        await carregarOrientadores();
    }

    return (
        <div className="grid min-h-dvh place-items-center bg-background p-4 text-ink">
            <section
                aria-describedby="orientador-obrigatorio-descricao"
                aria-labelledby="orientador-obrigatorio-titulo"
                aria-modal="true"
                className="grid w-full max-w-2xl gap-5 rounded-xl border border-line bg-panel p-6 shadow-[0_28px_90px_-30px_var(--chrome-shadow)] sm:p-8"
                role="dialog"
            >
                <header className="flex items-start gap-4 border-b border-line pb-5">
                    <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-panel-soft text-brand">
                        <UserRoundCheck size={25} />
                    </div>
                    <div>
                        <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-accent">Etapa obrigatória</p>
                        <h1 ref={tituloRef} tabIndex={-1} id="orientador-obrigatorio-titulo" className="mt-1 font-display text-2xl font-bold outline-none">
                            Selecione seu orientador
                        </h1>
                        <p id="orientador-obrigatorio-descricao" className="mt-2 text-sm leading-6 text-muted">
                            Para acessar a plataforma, informe o professor que acompanhará suas atividades acadêmicas.
                        </p>
                    </div>
                </header>

                {carregando ? (
                    <EstadoOrientador icone={<Loader2 className="animate-spin" size={26} />} texto="Carregando orientadores disponíveis..." />
                ) : mensagemErro ? (
                    <div className="grid gap-4 rounded-lg border border-laranja/40 bg-laranja/10 p-4 text-sm text-ink" role="alert">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 shrink-0 text-laranja" size={20} />
                            <span>{mensagemErro}</span>
                        </div>
                        <button
                            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-line bg-input-bg px-3 font-semibold transition hover:bg-subtle-hover"
                            type="button"
                            disabled={salvando}
                            onClick={() => void tentarNovamente()}
                        >
                            <RefreshCw size={16} />
                            Tentar novamente
                        </button>
                    </div>
                ) : orientadores.length === 0 ? (
                    <div className="grid gap-4 rounded-lg border border-line bg-input-bg p-4 text-sm text-muted" role="status">
                        <span>Nenhum orientador está disponível para seleção no momento.</span>
                        <button
                            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-line bg-panel px-3 font-semibold text-ink transition hover:bg-subtle-hover"
                            type="button"
                            onClick={() => void carregarOrientadores()}
                        >
                            <RefreshCw size={16} />
                            Atualizar lista
                        </button>
                    </div>
                ) : (
                    <fieldset className="grid gap-3" disabled={salvando}>
                        <legend className="font-display text-sm font-bold">Orientadores disponíveis</legend>
                        <div className="grid max-h-72 gap-2 overflow-y-auto pr-1" role="radiogroup" aria-label="Orientador">
                            {orientadores.map((orientador) => {
                                const selecionado = orientadorSelecionadoId === orientador.id;
                                return (
                                    <button
                                        aria-checked={selecionado}
                                        className={`flex items-center justify-between gap-4 rounded-lg border p-4 text-left transition ${
                                            selecionado ? "border-brand bg-panel-soft" : "border-line bg-input-bg hover:border-brand hover:bg-subtle-hover"
                                        }`}
                                        key={orientador.id}
                                        role="radio"
                                        type="button"
                                        onClick={() => setOrientadorSelecionadoId(orientador.id)}
                                    >
                                        <span className="grid gap-1">
                                            <strong className="font-display text-base">{orientador.username}</strong>
                                            <span className="text-sm text-muted">{orientador.email}</span>
                                        </span>
                                        {selecionado ? <CheckCircle2 className="shrink-0 text-brand" size={21} aria-hidden="true" /> : null}
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>
                )}

                <div className="flex justify-end border-t border-line pt-5">
                    <button
                        className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-4 font-display text-sm font-semibold text-background transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-55"
                        type="button"
                        disabled={carregando || Boolean(mensagemErro) || orientadores.length === 0 || !orientadorSelecionadoId || salvando}
                        onClick={() => void salvar()}
                    >
                        {salvando ? <Loader2 className="animate-spin" size={17} /> : <UserRoundCheck size={17} />}
                        Salvar orientador
                    </button>
                </div>
            </section>
        </div>
    );
}

function EstadoOrientador({ icone, texto }: { icone: ReactNode; texto: string }) {
    return <div className="grid min-h-36 place-items-center gap-3 text-center text-muted">{icone}<span>{texto}</span></div>;
}
