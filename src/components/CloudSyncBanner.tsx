import React, { useRef, useState } from 'react';
import { useCloudSync } from '../context/CloudSyncContext';
import { FIREBASE_PROJECT_ID } from '../firebase';
import { VictorTask } from '../types/flow';
import {
  Cloud,
  CloudOff,
  CheckCircle2,
  Upload,
  Download,
  LogOut,
  KeyRound,
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
    memberRole,
    syncState,
    lastSavedAt,
    needsTeamCode,
    unauthorizedDomain,
    hasPendingLocalEdits,
    activeTeamCode,
    signInToCloud,
    signOutFromCloud,
    submitTeamCode,
    pushLocalBrowserEditsToCloud,
    importTasksFromJson,
  } = useCloudSync();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [teamCodeInput, setTeamCodeInput] = useState<string>('DIVO-OWL');
  const [codeError, setCodeError] = useState<boolean>(false);
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
    onNotify?.('Respaldo .json descargado con todas las modificaciones actuales');
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
      onNotify?.(
        memberRole
          ? `Se importaron y guardaron ${count} solicitudes en la nube.`
          : `Se cargaron ${list.length} solicitudes en este navegador.`
      );
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
          ? `¡Listo! Se sincronizaron ${count} cambios previos de este navegador en la nube.`
          : 'Tus cambios locales ya están al día con la nube.'
      );
    } finally {
      setIsUploadingLocal(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(false);
    const ok = await submitTeamCode(teamCodeInput);
    if (!ok) {
      setCodeError(true);
    } else {
      onNotify?.('Acceso al tablero en la nube vinculado correctamente');
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

      {/* Connected to Cloud State */}
      {user && memberRole ? (
        <div className="p-3.5 sm:px-5 rounded-2xl bg-emerald-950/25 border border-emerald-500/35 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
              {syncState === 'saving' || syncState === 'connecting' ? (
                <RefreshCw className="w-4 h-4 text-emerald-300 animate-spin" />
              ) : (
                <Cloud className="w-4 h-4 text-emerald-300" />
              )}
            </div>
            <div className="text-xs min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-semibold text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {syncState === 'saving'
                      ? 'Guardando cambios en la nube...'
                      : 'Guardado automático en la nube activo'}
                  </span>
                </span>
                {lastSavedAt && (
                  <span className="text-[11px] font-mono text-emerald-300/80">
                    · Sincronizado {lastSavedAt}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-800 text-[10px] font-mono">
                  {isAdminUser
                    ? 'Coty · Admin'
                    : memberRole === 'owner'
                    ? 'Propietario'
                    : 'Colaborador'}
                </span>
                {!compact && (
                  <span
                    className="px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono"
                    title="Código de equipo incluido automáticamente al copiar el link de Víctor"
                  >
                    Clave Equipo: {activeTeamCode}
                  </span>
                )}
              </div>
              {!compact && (
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Cada modificación de fecha, estado, observación o nueva tarea queda guardada al instante para todos los dispositivos conectados.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
            {hasPendingLocalEdits && (
              <button
                onClick={handlePushLocalEdits}
                disabled={isUploadingLocal}
                className="w-full sm:w-auto min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isUploadingLocal
                    ? 'Subiendo...'
                    : 'Subir cambios previos de este navegador'}
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
              </>
            )}

            <button
              onClick={signOutFromCloud}
              className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Cerrar sesión en la nube"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      ) : needsTeamCode && user ? (
        /* Collaborator Team Code Verification Step */
        <form
          onSubmit={handleCodeSubmit}
          className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start sm:items-center gap-3 text-xs">
            <KeyRound className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold text-cyan-200 block">
                Vincular cuenta al Tablero Compartido DIVO
              </span>
              <span className="text-neutral-400 text-[11px]">
                Ingresá la clave de equipo de Coty para sincronizar cambios en tiempo real.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={teamCodeInput}
              onChange={(e) => setTeamCodeInput(e.target.value)}
              placeholder="Ej: DIVO-OWL"
              className={`min-h-[42px] px-3 py-1.5 rounded-xl bg-neutral-950 border text-xs font-mono text-neutral-100 flex-1 sm:w-36 focus:outline-none ${
                codeError ? 'border-red-500' : 'border-cyan-500/40'
              }`}
            />
            <button
              type="submit"
              className="min-h-[42px] px-4 py-1.5 rounded-xl bg-cyan-400 text-neutral-950 font-bold text-xs cursor-pointer shrink-0"
            >
              Conectar
            </button>
          </div>
        </form>
      ) : (
        /* Not Signed In Yet — Local Browser Mode with 1-Click Cloud Activation */
        <div className="p-3.5 sm:p-4 sm:px-5 rounded-2xl bg-amber-950/25 border border-amber-500/35 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center shrink-0">
              <CloudOff className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-xs">
              <div className="font-semibold text-amber-200 flex items-center gap-2 flex-wrap">
                <span>Modo Local en este Navegador</span>
                {hasPendingLocalEdits && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px]">
                    Tenés cambios locales listos para subir
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                Para que las modificaciones hechas en el link{' '}
                <strong className="text-amber-200 font-semibold">queden guardadas en la nube</strong>{' '}
                y las vean tanto vos como Víctor en cualquier PC o celular, conectá con Google. Tus cambios actuales se conservan y suben automáticamente.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
            <button
              onClick={signInToCloud}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Cloud className="w-4 h-4 shrink-0" />
              <span>Conectar Google y Guardar en la Nube</span>
            </button>

            {!compact && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleExportJson}
                  className="flex-1 sm:flex-initial min-h-[40px] px-2.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  title="Descargar las modificaciones actuales de este navegador en un archivo .json"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Descargar (.json)</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-initial min-h-[40px] px-2.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  title="Cargar un archivo .json descargado desde otro link o PC"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Importar (.json)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helpful Domain Guidance if opened on an external domain (e.g. Vercel) not yet added in Firebase Auth */}
      {unauthorizedDomain && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-red-950/30 border border-red-500/40 text-xs space-y-2.5">
          <div className="flex items-start gap-2 font-semibold text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">
              Falta autorizar el dominio <code className="font-mono text-amber-300 break-all">{unauthorizedDomain}</code> en Firebase Auth (solo se hace 1 vez)
            </span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            Como estás abriendo la app desde un dominio externo (por ejemplo Vercel), agregá{' '}
            <strong className="font-mono text-white break-all">{unauthorizedDomain}</strong> en{' '}
            <a
              href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 underline hover:text-cyan-200"
            >
              Firebase Console → Authentication → Configuración → Dominios autorizados
            </a>
            , o usá el enlace compartido directo de AI Studio donde ya está autorizado.
          </p>
          <button
            onClick={handleCopyHostname}
            className="w-full sm:w-auto min-h-[40px] px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-[11px] font-mono inline-flex items-center justify-center gap-1.5 cursor-pointer break-all"
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
