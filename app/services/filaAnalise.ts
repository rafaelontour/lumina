"use client";

const databaseName = "lumina-analysis-queue-db";
const storeName = "pending-analysis-doc-ids";

export type AnalisePendenteSalva = {
    docId: string;
    projectId?: string;
    componentKey?: string;
    releaseId?: string;
    fileName?: string;
    uploadedAt?: string;
};

type RegistroAnalisePendente = string | AnalisePendenteSalva;

function normalizarRegistroAnalisePendente(registro: RegistroAnalisePendente): AnalisePendenteSalva | null {
    if (typeof registro === "string") return registro ? { docId: registro } : null;
    if (registro?.docId) return registro;
    return null;
}

function abrirBancoFilaAnalise() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = window.indexedDB.open(databaseName, 1);

        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(storeName)) {
                database.createObjectStore(storeName);
            }
        };

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

async function usarStore<T>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T> | void
) {
    if (typeof window === "undefined" || !window.indexedDB) return null;

    const database = await abrirBancoFilaAnalise();
    return new Promise<T | null>((resolve, reject) => {
        const transaction = database.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = action(store);

        if (request) {
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
        } else {
            resolve(null);
        }

        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => database.close();
    });
}

export async function listarIdsAnalisePendente() {
    const registros = await listarAnalisesPendentes();
    return Array.from(new Set(registros.map((registro) => registro.docId).filter(Boolean)));
}

export async function listarAnalisesPendentes() {
    const registros = await usarStore<RegistroAnalisePendente[]>("readonly", (store) => store.getAll());
    return (registros ?? []).flatMap((registro) => {
        const normalizado = normalizarRegistroAnalisePendente(registro);
        return normalizado ? [normalizado] : [];
    });
}

export async function adicionarIdAnalisePendente(registro: string | AnalisePendenteSalva) {
    const normalizado = normalizarRegistroAnalisePendente(registro);
    if (!normalizado) return;

    await usarStore("readwrite", (store) => {
        store.put(normalizado, normalizado.docId);
    });
}

export async function removerIdAnalisePendente(docId: string) {
    if (!docId) return;
    await usarStore("readwrite", (store) => {
        store.delete(docId);
    });
}

export async function sincronizarIdsAnalisePendente(idsValidos: string[]) {
    const idsValidosSet = new Set(idsValidos.filter(Boolean));
    const idsAtuais = await listarIdsAnalisePendente();

    await Promise.all(
        idsAtuais
            .filter((docId) => !idsValidosSet.has(docId))
            .map((docId) => removerIdAnalisePendente(docId))
    );
}
