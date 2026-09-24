"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

import AvatarUsuario from "@/app/components/AvatarUsuario";
import type { UsuarioAutenticado } from "@/app/types/Autenticacao";

type ConfirmarRemocaoOrientandoDialogProps = {
    orientando: UsuarioAutenticado;
    removendo: boolean;
    erro: string;
    aoConfirmar: () => void;
    aoFechar: () => void;
};

export default function ConfirmarRemocaoOrientandoDialog({
    orientando,
    removendo,
    erro,
    aoConfirmar,
    aoFechar,
}: ConfirmarRemocaoOrientandoDialogProps) {
    const dialogoRef = useRef<HTMLElement>(null);
    const cancelarRef = useRef<HTMLButtonElement>(null);
    const elementoAnteriorRef = useRef<HTMLElement | null>(null);
    const removendoRef = useRef(removendo);

    useEffect(() => {
        removendoRef.current = removendo;
    }, [removendo]);

    useEffect(() => {
        elementoAnteriorRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        cancelarRef.current?.focus();

        function controlarTeclado(evento: KeyboardEvent) {
            if (evento.key === "Escape" && !removendoRef.current) {
                evento.preventDefault();
                aoFechar();
                return;
            }
            if (evento.key !== "Tab") return;

            const elementos = dialogoRef.current?.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (!elementos?.length) return;

            const primeiro = elementos[0];
            const ultimo = elementos[elementos.length - 1];
            if (evento.shiftKey && document.activeElement === primeiro) {
                evento.preventDefault();
                ultimo.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault();
                primeiro.focus();
            }
        }

        window.addEventListener("keydown", controlarTeclado);
        return () => {
            window.removeEventListener("keydown", controlarTeclado);
            elementoAnteriorRef.current?.focus();
        };
    }, [aoFechar]);

    return (
        <div
            className="fixed inset-0 z-90 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget && !removendo) aoFechar();
            }}
        >
            <section
                ref={dialogoRef}
                aria-describedby="descricao-remocao-orientando"
                aria-labelledby="titulo-remocao-orientando"
                aria-modal="true"
                className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl"
                role="alertdialog"
            >
                <header className="flex items-start justify-between gap-4 border-b border-line p-5">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                            <Trash2 size={21} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Encerrar vínculo</span>
                            <h2 className="mt-1 font-display text-2xl font-bold" id="titulo-remocao-orientando">
                                Remover orientando?
                            </h2>
                        </div>
                    </div>
                    <button
                        aria-label="Fechar confirmação de remoção"
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-input-bg transition hover:border-brand hover:bg-subtle-hover disabled:opacity-50"
                        disabled={removendo}
                        onClick={aoFechar}
                        type="button"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="grid gap-5 p-5">
                    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-input-bg p-4">
                        <AvatarUsuario className="size-11" usuario={orientando} />
                        <div className="min-w-0">
                            <p className="truncate font-display font-bold" title={orientando.username}>{orientando.username}</p>
                            <p className="mt-0.5 truncate text-sm text-muted" title={orientando.email}>{orientando.email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-accent/35 bg-accent/8 p-4">
                        <AlertTriangle className="mt-0.5 shrink-0 text-accent" size={19} aria-hidden="true" />
                        <div className="text-sm leading-6" id="descricao-remocao-orientando">
                            <p className="font-semibold text-ink">Somente o vínculo acadêmico será removido.</p>
                            <p className="mt-1 text-muted">A conta, os projetos e todos os documentos do orientando serão preservados.</p>
                        </div>
                    </div>

                    {erro ? (
                        <p className="rounded-lg border border-accent/40 bg-accent/8 px-3 py-2.5 text-sm font-medium text-accent" role="alert">
                            {erro}
                        </p>
                    ) : null}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            ref={cancelarRef}
                            className="h-11 rounded-lg border border-line bg-input-bg px-5 font-display font-semibold transition hover:border-brand hover:bg-subtle-hover disabled:cursor-not-allowed disabled:opacity-55"
                            disabled={removendo}
                            onClick={aoFechar}
                            type="button"
                        >
                            Cancelar
                        </button>
                        <button
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 font-display font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={removendo}
                            onClick={aoConfirmar}
                            type="button"
                        >
                            {removendo ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                            {removendo ? "Removendo vínculo…" : "Remover vínculo"}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
