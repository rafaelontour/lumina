"use client";

import { AlertTriangle, BookOpenCheck, CircleUserRound, Loader2, RefreshCw, UsersRound } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { useAuth } from "@/app/data/provider/AuthProvider";
import { listarMeusOrientandos } from "@/app/services/orientacao";
import type { CartaoOrientando } from "@/app/types/Orientacao";

function rotuloPapel(papel: CartaoOrientando["role_type"]) {
    const rotulos = {
        MAIN_ADVISOR: "Orientação principal",
        CO_ADVISOR: "Coorientação",
        EVALUATOR: "Membro avaliador",
    };
    return rotulos[papel] ?? papel;
}

export default function OrientandosWorkspace() {
    const { usuario } = useAuth();
    const [orientandos, setOrientandos] = useState<CartaoOrientando[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const carregarOrientandos = useCallback(async () => {
        setCarregando(true);
        const [itens, err] = await listarMeusOrientandos();
        if (err) {
            setOrientandos([]);
            setErro(err.message);
        } else {
            setOrientandos(itens);
            setErro("");
        }
        setCarregando(false);
    }, []);

    useEffect(() => {
        if (usuario?.access_level !== "ADMIN") return;
        void Promise.resolve().then(carregarOrientandos);
    }, [carregarOrientandos, usuario?.access_level]);

    if (usuario?.access_level !== "ADMIN") return null;

    return (
        <section className="grid gap-6 p-5 text-ink md:p-7">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Acompanhamento acadêmico</span>
                    <h1 className="mt-2 font-display text-3xl font-bold">Orientandos</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                        Acompanhe os pesquisadores que selecionaram você como orientador na plataforma.
                    </p>
                </div>
                <button
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-input-bg px-3 font-semibold transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                    type="button"
                    disabled={carregando}
                    onClick={() => void carregarOrientandos()}
                >
                    <RefreshCw className={carregando ? "animate-spin" : ""} size={17} />
                    Atualizar
                </button>
            </header>

            {carregando ? (
                <EstadoOrientandos icone={<Loader2 className="animate-spin" size={38} />} titulo="Carregando orientandos" descricao="Buscando os vínculos vinculados à sua conta." />
            ) : erro ? (
                <EstadoOrientandos icone={<AlertTriangle size={38} />} titulo="Não foi possível carregar orientandos" descricao={erro} erro />
            ) : orientandos.length === 0 ? (
                <EstadoOrientandos
                    icone={<UsersRound size={38} />}
                    titulo="Nenhum orientando cadastrado"
                    descricao="Quando uma pessoa selecionar você como orientador, ela aparecerá nesta lista."
                />
            ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                    {orientandos.map((item) => (
                        <article key={item.advisorship_id} className="grid gap-5 rounded-xl border border-line bg-panel p-5 shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
                            <div className="flex items-start gap-3">
                                <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-panel-soft text-brand">
                                    <CircleUserRound size={23} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="truncate font-display text-xl font-bold">{item.advisee.username}</h2>
                                    <p className="mt-1 truncate text-sm text-muted">{item.advisee.email}</p>
                                </div>
                            </div>

                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                <Resumo rotulo="Vínculo" valor={rotuloPapel(item.role_type)} />
                                <Resumo rotulo="Projeto" valor={item.project?.name ?? "Não informado"} />
                                <Resumo rotulo="Tema" valor={item.topic ?? "Não informado"} />
                                <Resumo rotulo="Status" valor={item.status === "ACTIVE" ? "Ativo" : item.status} />
                            </dl>

                            <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
                                <Metrica valor={item.total_documents ?? 0} rotulo="Documentos" />
                                <Metrica valor={item.pending_reviews ?? 0} rotulo="Pendências de revisão" destaque />
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
    return (
        <div className="grid gap-1">
            <dt className="font-display text-xs font-bold uppercase tracking-[0.12em] text-muted">{rotulo}</dt>
            <dd className="text-ink">{valor}</dd>
        </div>
    );
}

function Metrica({ valor, rotulo, destaque = false }: { valor: number; rotulo: string; destaque?: boolean }) {
    return (
        <div className={`rounded-lg p-3 ${destaque ? "bg-panel-soft" : "bg-input-bg"}`}>
            <strong className="block font-display text-2xl">{valor}</strong>
            <span className="mt-1 flex items-center gap-1.5 text-xs text-muted"><BookOpenCheck size={14} />{rotulo}</span>
        </div>
    );
}

function EstadoOrientandos({
    icone,
    titulo,
    descricao,
    erro = false,
}: {
    icone: ReactNode;
    titulo: string;
    descricao: string;
    erro?: boolean;
}) {
    return (
        <div className={`grid min-h-72 place-items-center rounded-xl border p-6 text-center ${erro ? "border-laranja/40 bg-laranja/10" : "border-line bg-panel"}`}>
            <div className="grid max-w-md justify-items-center gap-3">
                <span className={erro ? "text-laranja" : "text-brand"}>{icone}</span>
                <h2 className="font-display text-xl font-bold">{titulo}</h2>
                <p className="text-sm leading-6 text-muted">{descricao}</p>
            </div>
        </div>
    );
}
