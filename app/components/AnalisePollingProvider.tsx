"use client";

import { CheckCircle2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
    listarIdsAnalisePendente,
    removerIdAnalisePendente,
} from "@/app/services/filaAnalise";
import {
    listarReleasesDocumento,
    selecionarReleaseAnalisado,
} from "@/app/services/documento";

type AvisoAnalise = {
    docId: string;
};

const intervaloPollingMs = 7000;
const maxFalhasPorDocumento = 5;

export default function AnalisePollingProvider({ children }: { children: React.ReactNode }) {
    const [aviso, setAviso] = useState<AvisoAnalise | null>(null);
    const falhasPorDocumento = useRef(new Map<string, number>());

    const verificarAnalises = useCallback(async () => {
        const ids = await listarIdsAnalisePendente();
        if (ids.length === 0) return;

        await Promise.allSettled(
            ids.map(async (docId) => {
                const [releases, err] = await listarReleasesDocumento(docId);

                if (err) {
                    const falhas = (falhasPorDocumento.current.get(docId) ?? 0) + 1;
                    falhasPorDocumento.current.set(docId, falhas);
                    if (falhas >= maxFalhasPorDocumento) {
                        await removerIdAnalisePendente(docId);
                        falhasPorDocumento.current.delete(docId);
                    }
                    return;
                }

                falhasPorDocumento.current.delete(docId);
                const releaseAnalisado = selecionarReleaseAnalisado(releases);
                if (!releaseAnalisado) return;

                await removerIdAnalisePendente(docId);
                setAviso({ docId });
                window.dispatchEvent(new CustomEvent("lumina-analise-pronta", { detail: { docId } }));
            })
        );
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            void verificarAnalises();
        }, intervaloPollingMs);

        return () => window.clearInterval(interval);
    }, [verificarAnalises]);

    useEffect(() => {
        if (!aviso) return;
        const timeout = window.setTimeout(() => setAviso(null), 6000);
        return () => window.clearTimeout(timeout);
    }, [aviso]);

    return (
        <>
            {children}
            {aviso ? (
                <div
                    className="fixed bottom-5 right-5 z-70 flex max-w-sm items-start gap-3 rounded-lg border border-line bg-panel p-4 text-ink shadow-[0_22px_70px_-22px_rgba(0,0,0,0.45)]"
                    role="status"
                    aria-live="polite"
                >
                    <CheckCircle2 className="mt-0.5 shrink-0 text-accent" size={20} />
                    <div className="min-w-0">
                        <strong className="block font-display text-sm">Análise pronta</strong>
                        <span className="mt-1 block text-sm leading-5 text-muted">
                            A análise do documento já está disponível.
                        </span>
                    </div>
                    <button
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-subtle-hover hover:text-ink"
                        type="button"
                        onClick={() => setAviso(null)}
                        aria-label="Fechar aviso"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : null}
        </>
    );
}
