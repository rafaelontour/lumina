"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CalendarDays, Loader2, Mail, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { atualizarPerfilUsuario, enviarFotoPerfilUsuario, obterUsuarioAutenticado } from "@/app/services/autenticacao";
import { useAuth } from "@/app/data/provider/AuthProvider";
import AvatarUsuario from "./AvatarUsuario";

function formatarData(data?: string | null) {
    if (!data) return "Não informado";
    const valor = new Date(data);
    return Number.isNaN(valor.getTime()) ? data : valor.toLocaleDateString("pt-BR");
}

function rotuloNivelAcesso(nivel?: string) {
    const rotulos: Record<string, string> = {
        DEFAULT: "Usuário",
        ADMIN: "Administrador",
        ANALYST: "Analista",
        AUDITOR: "Auditor",
    };

    return rotulos[nivel ?? "DEFAULT"] ?? nivel ?? "Usuário";
}

export default function PerfilUsuarioWorkspace() {
    const { usuario, atualizarUsuarioConfirmado } = useAuth();
    const [username, setUsername] = useState(usuario?.username ?? "");
    const [email, setEmail] = useState(usuario?.email ?? "");
    const [telefone, setTelefone] = useState(usuario?.phone_number ?? "");
    const [fotoSelecionada, setFotoSelecionada] = useState<File | null>(null);
    const [previaFoto, setPreviaFoto] = useState<string | null>(null);
    const [salvando, setSalvando] = useState(false);
    const campoFotoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previaFoto) URL.revokeObjectURL(previaFoto);
        };
    }, [previaFoto]);

    function selecionarFoto(arquivo?: File) {
        if (!arquivo) return;
        if (!arquivo.type.startsWith("image/")) {
            toast.error("Selecione uma imagem para a foto de perfil.");
            return;
        }

        setFotoSelecionada(arquivo);
        setPreviaFoto(URL.createObjectURL(arquivo));
    }

    async function salvarPerfil(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!usuario) return;

        const proximoUsername = username.trim();
        const proximoEmail = email.trim();
        const proximoTelefone = telefone.trim();
        if (!proximoUsername || !proximoEmail || !proximoTelefone) {
            toast.error("Preencha nome de usuário, e-mail e telefone.");
            return;
        }

        setSalvando(true);
        try {
            const [usuarioAtualizado, dadosErr] = await atualizarPerfilUsuario({
                id: usuario.id,
                username: proximoUsername,
                email: proximoEmail,
                phone_number: proximoTelefone,
                access_level: usuario.access_level ?? "DEFAULT",
            });
            if (dadosErr || !usuarioAtualizado) throw dadosErr ?? new Error("A API não confirmou a atualização do perfil.");

            atualizarUsuarioConfirmado(usuarioAtualizado);

            if (fotoSelecionada) {
                const [, fotoErr] = await enviarFotoPerfilUsuario(usuario.id, fotoSelecionada);
                if (fotoErr) {
                    toast.error(`Dados salvos, mas não foi possível atualizar a foto: ${fotoErr.message}`);
                    return;
                }

                const [usuarioComFoto, leituraErr] = await obterUsuarioAutenticado();
                if (leituraErr || !usuarioComFoto) {
                    toast.error("A foto foi enviada, mas não foi possível atualizá-la na tela. Atualize a página para conferir.");
                    return;
                }

                atualizarUsuarioConfirmado(usuarioComFoto);
                setFotoSelecionada(null);
                if (campoFotoRef.current) campoFotoRef.current.value = "";
            }

            toast.success("Perfil atualizado com sucesso.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o perfil.");
        } finally {
            setSalvando(false);
        }
    }

    if (!usuario) return null;

    return (
        <section className="grid min-h-full content-start gap-6 px-6 py-8 lg:px-8">
            <header className="sticky top-0 z-20 -mx-6 -mt-8 border-b border-line bg-panel/95 px-6 py-6 shadow-[0_16px_30px_-26px_var(--chrome-shadow)] backdrop-blur lg:-mx-8 lg:px-8">
                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Conta</span>
                <h1 className="mt-2 font-display text-4xl font-bold text-ink md:text-5xl">Meu perfil</h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted md:text-lg">Mantenha seus dados de contato e foto de perfil atualizados.</p>
            </header>

            <form className="mx-auto grid w-full max-w-4xl gap-5" onSubmit={(event) => void salvarPerfil(event)}>
                <article className="grid gap-5 rounded-xl border border-line bg-panel p-5 shadow-[0_18px_44px_-28px_var(--chrome-shadow)] sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                    <AvatarUsuario className="mx-auto size-28 text-2xl sm:mx-0" imagemTemporaria={previaFoto} usuario={usuario} />
                    <div className="grid gap-3 text-center sm:text-left">
                        <div>
                            <h2 className="font-display text-xl font-bold text-ink">Foto de perfil</h2>
                            <p className="mt-1 text-sm leading-6 text-muted">Use uma imagem para facilitar sua identificação na plataforma.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                            <input
                                ref={campoFotoRef}
                                className="sr-only"
                                id="foto-perfil"
                                type="file"
                                accept="image/*"
                                onChange={(event) => selecionarFoto(event.target.files?.[0])}
                            />
                            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-input-bg px-3 text-sm font-semibold text-ink transition hover:border-brand hover:bg-subtle-hover" htmlFor="foto-perfil">
                                <Camera size={17} /> {fotoSelecionada ? "Trocar foto selecionada" : "Escolher foto"}
                            </label>
                            {fotoSelecionada ? <span className="max-w-full self-center overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted">{fotoSelecionada.name}</span> : null}
                        </div>
                    </div>
                </article>

                <article className="grid gap-5 rounded-xl border border-line bg-panel p-5 shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
                    <div>
                        <h2 className="font-display text-xl font-bold text-ink">Dados pessoais</h2>
                        <p className="mt-1 text-sm leading-6 text-muted">Esses dados são usados para identificar e contatar você na plataforma.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="grid gap-2 text-sm font-semibold text-ink">
                            <span className="inline-flex items-center gap-2"><UserRound size={16} className="text-accent" /> Nome de usuário</span>
                            <input className="h-11 rounded-lg border border-line bg-input-bg px-3 font-normal text-ink outline-none transition focus:border-brand" value={username} onChange={(event) => setUsername(event.target.value)} required />
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-ink">
                            <span className="inline-flex items-center gap-2"><Mail size={16} className="text-accent" /> E-mail</span>
                            <input className="h-11 rounded-lg border border-line bg-input-bg px-3 font-normal text-ink outline-none transition focus:border-brand" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-ink">
                            <span className="inline-flex items-center gap-2"><Phone size={16} className="text-accent" /> Telefone</span>
                            <input className="h-11 rounded-lg border border-line bg-input-bg px-3 font-normal text-ink outline-none transition focus:border-brand" type="tel" value={telefone} onChange={(event) => setTelefone(event.target.value)} required />
                        </label>
                        <div className="grid gap-2 text-sm font-semibold text-ink">
                            <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-accent" /> Nível de acesso</span>
                            <div className="flex h-11 items-center rounded-lg border border-line bg-input-bg px-3 font-normal text-muted">{rotuloNivelAcesso(usuario.access_level)}</div>
                        </div>
                    </div>
                </article>

                <article className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-panel p-5 shadow-[0_18px_44px_-28px_var(--chrome-shadow)]">
                    <div className="flex items-center gap-3 text-sm text-muted"><CalendarDays className="text-accent" size={18} /> Conta criada em {formatarData(usuario.created_at)}</div>
                    <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 font-display text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55 dark:text-preto" type="submit" disabled={salvando}>
                        {salvando ? <Loader2 className="animate-spin motion-reduce:animate-none" size={18} /> : <Save size={18} />}
                        {salvando ? "Salvando..." : "Salvar alterações"}
                    </button>
                </article>
            </form>
        </section>
    );
}
