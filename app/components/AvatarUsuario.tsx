"use client";
/* eslint-disable @next/next/no-img-element -- a imagem é autenticada pelo cookie do navegador no proxy interno. */

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import BotaoComTitulo from "@/app/components/BotaoComTitulo";
import { montarUrlApi } from "@/app/services/autenticacao";
import type { UsuarioAutenticado } from "@/app/types/Autenticacao";

type AvatarUsuarioProps = {
    usuario: Pick<UsuarioAutenticado, "username" | "icon">;
    className?: string;
    imagemTemporaria?: string | null;
    visualizavel?: boolean;
};

function obterIniciais(nome: string) {
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    return (partes.length > 1 ? `${partes[0][0]}${partes.at(-1)?.[0] ?? ""}` : partes[0]?.slice(0, 2) ?? "LU").toUpperCase();
}

function obterOrigemImagem(caminho?: string | null) {
    if (!caminho?.trim()) return null;
    if (caminho.startsWith("blob:")) return caminho;

    try {
        const url = new URL(caminho, "http://lumina.local");
        return montarUrlApi(`${url.pathname}${url.search}`);
    } catch {
        return null;
    }
}

export default function AvatarUsuario({ usuario, className = "size-10", imagemTemporaria, visualizavel = false }: AvatarUsuarioProps) {
    const origem = imagemTemporaria ?? obterOrigemImagem(usuario.icon?.file_path);
    const [origemComErro, setOrigemComErro] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const botaoAvatarRef = useRef<HTMLButtonElement>(null);
    const botaoFecharRef = useRef<HTMLButtonElement>(null);
    const imagemComErro = Boolean(origem && origemComErro === origem);

    useEffect(() => {
        if (!modalAberto) return;

        const botaoAvatar = botaoAvatarRef.current;
        botaoFecharRef.current?.focus();
        return () => botaoAvatar?.focus();
    }, [modalAberto]);

    const fecharComTeclado = (evento: KeyboardEvent<HTMLElement>) => {
        if (evento.key === "Escape") {
            evento.preventDefault();
            evento.stopPropagation();
            setModalAberto(false);
            return;
        }

        if (evento.key === "Tab") {
            evento.preventDefault();
            evento.stopPropagation();
            botaoFecharRef.current?.focus();
        }
    };

    if (origem && !imagemComErro) {
        const avatar = (
            <img
                alt={visualizavel ? "" : `Foto de perfil de ${usuario.username}`}
                className={`${className} shrink-0 rounded-full border border-line bg-input-bg object-cover`}
                src={origem}
                onError={() => setOrigemComErro(origem)}
            />
        );

        return (
            <>
                {visualizavel ? (
                    <BotaoComTitulo
                        aria-label={`Ampliar foto de perfil de ${usuario.username}`}
                        className="shrink-0 cursor-zoom-in rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        ref={botaoAvatarRef}
                        type="button"
                        onClick={() => setModalAberto(true)}
                    >
                        {avatar}
                    </BotaoComTitulo>
                ) : avatar}
                {visualizavel && modalAberto
                    ? createPortal(
                          <div
                              className="fixed inset-0 z-[100] grid place-items-center bg-preto/75 p-4 backdrop-blur-sm sm:p-8"
                              onMouseDown={(evento) => {
                                  if (evento.target === evento.currentTarget) setModalAberto(false);
                              }}
                              onKeyDown={fecharComTeclado}
                              role="presentation"
                          >
                              <section
                                  aria-label={`Foto de perfil de ${usuario.username}`}
                                  aria-modal="true"
                                  className="relative grid max-h-[min(90dvh,56rem)] max-w-[min(90vw,56rem)] place-items-center rounded-xl border border-line bg-panel p-2 shadow-2xl sm:p-3"
                                  onKeyDown={fecharComTeclado}
                                  role="dialog"
                              >
                                  <BotaoComTitulo
                                      aria-label="Fechar foto ampliada"
                                      className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full border border-line bg-panel/95 text-ink shadow-md transition hover:border-brand hover:bg-subtle-hover"
                                      ref={botaoFecharRef}
                                      type="button"
                                      onClick={() => setModalAberto(false)}
                                  >
                                      <X size={20} />
                                  </BotaoComTitulo>
                                  <img
                                      alt={`Foto de perfil de ${usuario.username}`}
                                      className="max-h-[calc(90dvh-2rem)] max-w-full rounded-lg object-contain sm:max-h-[calc(90dvh-3rem)]"
                                      src={origem}
                                      onError={() => {
                                          setOrigemComErro(origem);
                                          setModalAberto(false);
                                      }}
                                  />
                              </section>
                          </div>,
                          document.body
                      )
                    : null}
            </>
        );
    }

    return (
        <span
            aria-label={`Perfil de ${usuario.username}`}
            className={`${className} grid shrink-0 place-items-center rounded-full border border-brand/35 bg-brand/15 font-display text-sm font-bold text-ink`}
        >
            {obterIniciais(usuario.username)}
        </span>
    );
}
