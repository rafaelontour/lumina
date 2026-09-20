"use client";

import { useState } from "react";
import { Bot, ChevronDown, FileWarning } from "lucide-react";

import { normalizarArvoreAnaliseRelease } from "@/app/services/documento";
import type { FonteAnaliseRelease, ReleaseExterno, TaxonomiaAnaliseRelease } from "@/app/types/Documento";

type ClassificacaoAvaliacao = "atendido" | "parcialmente_atendido" | "nao_atendido" | "nao_avaliado";

function timestamp(data?: string | null) {
    if (!data) return Number.NEGATIVE_INFINITY;

    const valor = new Date(data).getTime();
    return Number.isNaN(valor) ? Number.NEGATIVE_INFINITY : valor;
}

export function selecionarReleaseMaisRecenteComArquivo(releases: ReleaseExterno[]) {
    return [...releases]
        .filter((release) => Boolean(release.file_path?.trim()))
        .sort((releaseA, releaseB) => timestamp(releaseB.created_at) - timestamp(releaseA.created_at))[0];
}

export function calcularNotaMediaRelease(release?: ReleaseExterno | null) {
    if (!release) return null;

    const notas = normalizarArvoreAnaliseRelease(release.check_tree).flatMap((tipificacao) =>
        (tipificacao.taxonomies ?? []).flatMap((taxonomia) =>
            (taxonomia.branches ?? []).flatMap((criterio) => {
                const nota = criterio.evaluation?.score;
                return typeof nota === "number" && Number.isFinite(nota) ? [nota] : [];
            })
        )
    );

    if (notas.length === 0) return null;
    return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

export function classeNotaMedia(nota: number) {
    if (nota < 5) return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300";
    if (nota < 7) return "border-amber-500/45 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    return "border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300";
}

function formatarNota(nota: number) {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(nota);
}

function classificarAvaliacao(score?: number | null, fulfilled?: boolean | null): ClassificacaoAvaliacao {
    if (typeof score === "number" && Number.isFinite(score)) {
        if (score < 5) return "nao_atendido";
        if (score <= 7) return "parcialmente_atendido";
        return "atendido";
    }

    return fulfilled === true ? "atendido" : fulfilled === false ? "nao_atendido" : "nao_avaliado";
}

function StatusAvaliacao({ fulfilled, score }: { fulfilled?: boolean | null; score?: number | null }) {
    const classificacao = classificarAvaliacao(score, fulfilled);
    const { rotulo, classe } =
        classificacao === "atendido"
            ? {
                  rotulo: "Atendido",
                  classe: "border-emerald-600/35 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
              }
            : classificacao === "parcialmente_atendido"
              ? {
                    rotulo: "Parcialmente atendido",
                    classe: "border-laranja/40 bg-laranja/10 text-laranja",
                }
              : classificacao === "nao_atendido"
                ? {
                      rotulo: "Não atendido",
                      classe: "border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-300",
                  }
                : { rotulo: "Não avaliado", classe: "border-line bg-input-bg text-muted" };

    return (
        <span className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className={`rounded-full border px-2 py-1 ${classe}`}>{rotulo}</span>
            {typeof score === "number" && Number.isFinite(score) ? (
                <span className="text-muted">Nota: {new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(score)}</span>
            ) : null}
        </span>
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

function contagemTaxonomia(taxonomia: TaxonomiaAnaliseRelease) {
    return (taxonomia.branches ?? []).reduce(
        (contagem, criterio) => {
            const classificacao = classificarAvaliacao(criterio.evaluation?.score, criterio.evaluation?.fulfilled);
            if (classificacao === "atendido") contagem.atendidos += 1;
            if (classificacao === "parcialmente_atendido") contagem.parcialmenteAtendidos += 1;
            if (classificacao === "nao_atendido") contagem.naoAtendidos += 1;
            return contagem;
        },
        { atendidos: 0, parcialmenteAtendidos: 0, naoAtendidos: 0 }
    );
}

function TaxonomiaAnalise({ taxonomia }: { taxonomia: TaxonomiaAnaliseRelease }) {
    const [aberta, setAberta] = useState(false);
    const contagem = contagemTaxonomia(taxonomia);

    return (
        <section className="grid gap-3 border-t border-line pt-4">
            <button
                aria-expanded={aberta}
                className="flex w-full min-w-0 items-start justify-between gap-3 text-left outline-none transition hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/70"
                type="button"
                onClick={() => setAberta((valorAtual) => !valorAtual)}
            >
                <span className="min-w-0 flex-1 break-words font-display text-base font-bold text-ink">{taxonomia.title}</span>
                <ChevronDown className={`mt-0.5 shrink-0 transition-transform ${aberta ? "rotate-180" : ""}`} size={18} />
            </button>

            <div className="flex flex-wrap gap-1.5 text-[0.7rem] font-bold">
                <span className="rounded-full border border-emerald-600/35 bg-emerald-600/10 px-2 py-1 text-emerald-700 dark:text-emerald-300">
                    {contagem.atendidos} atendidos
                </span>
                <span className="rounded-full border border-laranja/40 bg-laranja/10 px-2 py-1 text-laranja">
                    {contagem.parcialmenteAtendidos} parciais
                </span>
                <span className="rounded-full border border-red-500/35 bg-red-500/10 px-2 py-1 text-red-700 dark:text-red-300">
                    {contagem.naoAtendidos} não atendidos
                </span>
            </div>

            {aberta ? (
                <div className="grid gap-4">
                    {taxonomia.description ? <p className="text-sm leading-6 text-muted">{taxonomia.description}</p> : null}
                    <FontesAnalise fontes={taxonomia.sources} />
                    {(taxonomia.branches ?? []).map((criterio, indiceCriterio) => (
                        <section className="grid gap-2 border-l border-line pl-3" key={criterio.id ?? `${criterio.title}-${indiceCriterio}`}>
                            <div className="grid gap-2">
                                <strong className="break-words font-display text-sm font-bold text-ink">{criterio.title}</strong>
                                <StatusAvaliacao fulfilled={criterio.evaluation?.fulfilled} score={criterio.evaluation?.score} />
                            </div>
                            {criterio.description ? <p className="text-sm leading-6 text-muted">{criterio.description}</p> : null}
                            {criterio.evaluation?.feedback ? (
                                <div className="grid gap-1 text-sm leading-6 text-ink">
                                    <span className="font-bold">Feedback da Oiac IA</span>
                                    <p className="whitespace-pre-wrap">{criterio.evaluation.feedback}</p>
                                </div>
                            ) : null}
                        </section>
                    ))}
                </div>
            ) : null}
        </section>
    );
}

export default function ResultadoAnaliseTipificacao({ release }: { release: ReleaseExterno | null }) {
    const tipificacoes = normalizarArvoreAnaliseRelease(release?.check_tree);
    const notaMedia = calcularNotaMediaRelease(release);

    if (!release || tipificacoes.length === 0) {
        return (
            <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-line bg-input-bg p-6 text-center">
                <div className="grid max-w-sm justify-items-center gap-3 text-muted">
                    <FileWarning size={34} />
                    <div>
                        <h3 className="font-display text-lg font-bold text-ink">Análise de tipificação indisponível</h3>
                        <p className="mt-1 text-sm leading-6">Esta versão do documento ainda não possui um resultado de análise retornado pela IA.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid content-start gap-5">
            <header className="grid gap-2 border-b border-line pb-4">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                    <Bot size={16} />
                    Resultado da IA
                </span>
                <h3 className="font-display text-xl font-bold text-ink">Análise de tipificação</h3>
                <div className="grid w-fit gap-1">
                    <span
                        className={`w-fit rounded-full border px-3 py-1 text-sm font-bold ${
                            notaMedia === null ? "border-line bg-input-bg text-muted" : classeNotaMedia(notaMedia)
                        }`}
                    >
                        {notaMedia === null ? "Sem nota" : `Nota média: ${formatarNota(notaMedia)}`}
                    </span>
                    <span className="text-xs text-muted">Média de todos os ramos</span>
                </div>
            </header>

            {release.description?.trim() ? (
                <section className="grid gap-2 rounded-xl border border-line bg-panel-soft p-4">
                    <h4 className="font-display text-sm font-bold text-ink">Resumo da análise</h4>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-muted">{release.description.trim()}</p>
                </section>
            ) : null}

            <section className="grid gap-3 rounded-xl border border-brand/30 bg-subtle-hover p-4">
                <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-accent">Tipificação utilizada</span>
                <div className="flex flex-wrap gap-2">
                    {tipificacoes.map((tipificacao, indiceTipificacao) => (
                        <span
                            className="rounded-full border border-brand/35 bg-panel px-3 py-1 text-sm font-bold text-ink"
                            key={tipificacao.id ?? `${tipificacao.name}-${indiceTipificacao}`}
                        >
                            {tipificacao.name}
                        </span>
                    ))}
                </div>
            </section>

            {tipificacoes.map((tipificacao, indiceTipificacao) => (
                <section className="grid gap-4 border-l-2 border-brand/55 pl-4" key={tipificacao.id ?? `${tipificacao.name}-${indiceTipificacao}`}>
                    <h4 className="break-words font-display text-lg font-bold text-ink">{tipificacao.name}</h4>
                    <FontesAnalise fontes={tipificacao.sources} />
                    {(tipificacao.taxonomies ?? []).map((taxonomia, indiceTaxonomia) => (
                        <TaxonomiaAnalise key={taxonomia.id ?? `${taxonomia.title}-${indiceTaxonomia}`} taxonomia={taxonomia} />
                    ))}
                </section>
            ))}
        </div>
    );
}
