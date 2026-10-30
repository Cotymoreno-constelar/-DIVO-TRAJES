import React, { useRef, useState } from 'react';
import { useCloudSync } from '../context/CloudSyncContext';
import { FIREBASE_PROJECT_ID } from '../firebase';
import { VictorTask } from '../types/flow';
import {
  Radio,
  CheckCircle2,
  Upload,
  Download,
  LogOut,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface CloudSyncBannerProps {
  onNotify?: (msg: string) => void;
  compact?: boolean;
}

export const CloudSyncBanner: React.FC<CloudSyncBannerProps> = ({
  onNotify,
  compact = false,
}) => {
  const {
    tasks,
    user,
    authReady,
    isAdminUser,
    syncState,
    lastSavedAt,
    unauthorizedDomain,
    hasPendingLocalEdits,
    signInToCloud,
    signOutFromCloud,
    pushLocalBrowserEditsToCloud,
    importTasksFromJson,
  } = useCloudSync();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingLocal, setIsUploadingLocal] = useState<boolean>(false);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'DIVO · OWL SYSTEM',
      tasks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `divo-owl-respaldo-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify?.('Respaldo .json descargado con todas las modificaciones en vivo');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list: VictorTask[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.tasks)
        ? parsed.tasks
        : [];
      if (list.length === 0) {
        onNotify?.('El archivo no contiene solicitudes válidas.');
        return;
      }
      const count = await importTasksFromJson(list);
      onNotify?.(`Se publicaron ${count} cambios del archivo .json en vivo para todo el equipo.`);
    } catch {
      onNotify?.('No se pudo leer el archivo .json seleccionado.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePushLocalEdits = async () => {
    setIsUploadingLocal(true);
    try {
      const count = await pushLocalBrowserEditsToCloud();
      onNotify?.(
        count > 0
          ? `¡Listo! Se publicaron ${count} cambios previos de este navegador en vivo.`
          : 'Tus cambios ya están sincronizados en vivo.'
      );
    } finally {
      setIsUploadingLocal(false);
    }
  };

  const handleCopyHostname = async () => {
    if (!unauthorizedDomain) return;
    try {
      await navigator.clipboard.writeText(unauthorizedDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      // ignore
    }
  };

  if (!authReady) {
    return null;
  }

  return (
    <div className="space-y-3 no-print">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportFile}
        className="hidden"
      />

      {/* Always-On Public Live Real-Time Sync Bar */}
      <div className="p-3.5 sm:px-5 rounded-2xl bg-emerald-950/25 border border-emerald-500/35 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            {syncState === 'saving' || syncState === 'connecting' ? (
              <RefreshCw className="w-4 h-4 text-emerald-300 animate-spin" />
            ) : (
              <Radio className="w-4 h-4 text-emerald-300" />
            )}
          </div>
          <div className="text-xs min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-semibold text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {syncState === 'connecting'
                    ? 'Conectando tablero público en vivo...'
                    : syncState === 'saving'
                    ? 'Guardando cambios en vivo...'
                    : 'En Vivo · Acceso Público Sincronizado en Tiempo Real'}
                </span>
              </span>
              {lastSavedAt && (
                <span className="text-[11px] font-mono text-emerald-300/80 tabular-nums">
                  · Actualizado {lastSavedAt}
                </span>
              )}
              {isAdminUser && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-400/40 text-[10px] font-mono">
                  Dirección Admin (Coty)
                </span>
              )}
            </div>
            {!compact && (
              <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                Sin inicio de sesión obligatorio: cualquier cambio de estado, fecha límite, observación o nueva tarea se ve en vivo al instante en todas las PCs y celulares.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
          {hasPendingLocalEdits && (
            <button
              onClick={handlePushLocalEdits}
              disabled={isUploadingLocal}
              className="w-full sm:w-auto min-h-[40px] px-3.5 py-1.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isUploadingLocal
                  ? 'Publicando...'
                  : 'Publicar cambios previos de este navegador en vivo'}
              </span>
            </button>
          )}

          {!compact && (
            <>
              <button
                onClick={handleExportJson}
                className="flex-1 sm:flex-initial min-h-[40px] px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                title="Descargar copia de respaldo en archivo .json"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Respaldo .json</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-initial min-h-[40px] px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                title="Importar cambios desde un respaldo .json"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Importar .json</span>
              </button>

              {user ? (
                <button
                  onClick={signOutFromCloud}
                  className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Salir del modo Admin"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Salir Admin</span>
                </button>
              ) : (
                <button
                  onClick={signInToCloud}
                  className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  title="Opcional solo para Dirección (reabrir tareas validadas en estado Finalizado)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Admin Dirección</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Only shown if someone clicks optional "Admin Dirección" on an unauthorized external domain */}
      {unauthorizedDomain && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/40 text-xs space-y-2">
          <div className="flex items-start gap-2 font-semibold text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-snug">
              El tablero público ya está sincronizando en vivo. Para usar el desbloqueo opcional Admin en{' '}
              <code className="font-mono text-white break-all">{unauthorizedDomain}</code>, agregalo en{' '}
              <a
                href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 underline hover:text-cyan-200"
              >
                Firebase Auth → Dominios autorizados
              </a>
              .
            </span>
          </div>
          <button
            onClick={handleCopyHostname}
            className="w-full sm:w-auto min-h-[38px] px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-[11px] font-mono inline-flex items-center justify-center gap-1.5 cursor-pointer break-all"
          >
            {copiedDomain ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dominio copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Copiar {unauthorizedDomain}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
