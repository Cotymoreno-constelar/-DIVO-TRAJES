import React, { useState } from 'react';
import { 
  TEAM_MEMBERS, 
  BRANCH_LOCATIONS 
} from '../data/constelarData';
import { TeamMember } from '../types/flow';
import { 
  Users, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useCloudSync } from '../context/CloudSyncContext';
import { CloudSyncBanner } from './CloudSyncBanner';

interface RACIRow {
  activity: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
}

const RACI_DATA: RACIRow[] = [
  {
    activity: 'Campañas de Google Ads & Llamadas EMMA',
    responsible: 'Tere',
    accountable: 'Coty',
    consulted: 'Yasmín',
    informed: 'Equipo Ateliers'
  },
  {
    activity: 'Meta Ads (Reels, Instagram & Facebook)',
    responsible: 'Valen',
    accountable: 'Coty',
    consulted: 'Bianca',
    informed: 'Yasmín'
  },
  {
    activity: 'Pinterest & Moodboards de Inspiración',
    responsible: 'Bianca',
    accountable: 'Coty',
    consulted: 'Valen',
    informed: 'Asesoras de Ventas'
  },
  {
    activity: 'Presencia en Grupos & Alianzas con Wedding Planners',
    responsible: 'Daniela',
    accountable: 'Yasmín',
    consulted: 'Coty',
    informed: 'Ateliers'
  },
  {
    activity: 'Atención de Chats en Kommo (< 3 min) & Derivación a Sucursal',
    responsible: 'Yasmín / Asesoras',
    accountable: 'Yasmín',
    consulted: 'Coty',
    informed: 'Atelier receptor'
  },
  {
    activity: 'Recepción en Atelier, Pruebas VIP y Medidas en Owl CRM',
    responsible: 'Asesoras de Salón',
    accountable: 'Yasmín',
    consulted: 'Modistas',
    informed: 'Sky Soft'
  },
  {
    activity: 'Control de Stock, Planchado & Entalle en Sky Soft',
    responsible: 'Taller / Administración',
    accountable: 'Coty',
    consulted: 'Yasmín',
    informed: 'Cliente'
  },
  {
    activity: 'Protocolo Post-Venta & Recolección de Fotos de Luz',
    responsible: 'Yasmín',
    accountable: 'Coty',
    consulted: 'Bianca',
    informed: 'Redes Sociales'
  }
];

export const TeamWorkplan: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember>(TEAM_MEMBERS[0]);
  const { syncMeetingDate, updateSyncMeetingDate } = useCloudSync();

  return (
    <div className="space-y-8">
      <CloudSyncBanner compact />
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-amber-100">
              Organigrama y Matriz Operativa de Trabajo
            </h2>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            En la base de tu papel dibujaste tu liderazgo: <span className="font-mono text-amber-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 font-bold">Coty → YASMIN · BIANCA</span>, articulando a Tere en Google Ads, Valen en Meta y Daniela en Grupos. Aquí está la distribución clara de responsabilidades para que cada engranaje funcione en armonía.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/90 flex flex-col gap-1 shrink-0">
          <span className="font-serif font-bold text-amber-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            6 Roles Estratégicos
          </span>
          <p className="text-neutral-400">
            Cada responsable sabe exactamente qué métrica mover y cómo alimenta al siguiente paso del flujograma.
          </p>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEAM_MEMBERS.map(member => {
          const isSelected = selectedMember.id === member.id;
          return (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/10'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-neutral-950 font-serif font-bold text-lg shadow-md`}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-neutral-100">
                      {member.name}
                    </h3>
                    <p className="text-xs text-amber-400/90 font-medium">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-neutral-400 mb-3 font-sans">
                  <strong className="text-neutral-300">Área de Enfoque:</strong> {member.focusArea}
                </div>

                <p className="text-xs text-neutral-300 italic bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                  {member.quote}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-400">
                  {member.responsibilities.length} Tareas Clave
                </span>
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  Ver detalle →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Member Detail Box */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-amber-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedMember.avatarColor} flex items-center justify-center text-neutral-950 font-serif font-bold text-lg shadow-md`}>
              {selectedMember.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-neutral-100">
                Plan de Tareas Semanales para {selectedMember.name}
              </h3>
              <p className="text-xs text-neutral-400">
                {selectedMember.role} · {selectedMember.focusArea}
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
            DIVO Team
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <span className="text-xs uppercase font-semibold text-amber-400 tracking-wider block mb-3">
              Responsabilidades Operativas Innegociables
            </span>
            <ul className="space-y-2.5">
              {selectedMember.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-200 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs uppercase font-semibold text-neutral-300 tracking-wider block">
                  Ritual de Sincronización Semanal
                </span>
                <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-700">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <input
                    type="date"
                    value={syncMeetingDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        void updateSyncMeetingDate(e.target.value);
                      }
                    }}
                    className="bg-transparent text-xs text-amber-300 font-mono focus:outline-none cursor-pointer"
                    title="Modificar fecha del próximo ritual semanal (guardado en la nube)"
                  />
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Reunión de 45 minutos liderada por Coty y coordinada por Yasmín. Se revisan dos números:
                <br />
                1. <strong>Citas generadas en Kommo</strong> (por Tere, Valen, Bianca y Daniela).
                <br />
                2. <strong>Citas concretadas y ventas en Ateliers</strong> (registradas en SkySoft y Owl).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 space-y-1">
              <span className="font-semibold text-amber-300 block">Principio de Trabajo:</span>
              <p className="text-neutral-300">
                "Ningún lead en Kommo espera más de 3 minutos. Ningún cliente en sucursal espera más de 1 minuto para entrar a su probador de luz."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RACI Matrix Table */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-neutral-100">
              Matriz RACI de Responsabilidades (Quién Hace Qué)
            </h3>
            <p className="text-xs text-neutral-400">
              R = Responsable de ejecutar · A = Aprueba / Rinde cuentas · C = Consultado · I = Informado
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Actividad del Flujograma</th>
                <th className="py-2.5 px-3">R (Responsable)</th>
                <th className="py-2.5 px-3">A (Aprueba)</th>
                <th className="py-2.5 px-3">C (Consultado)</th>
                <th className="py-2.5 px-3">I (Informado)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {RACI_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3 px-3 font-medium text-neutral-200">
                    {row.activity}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">
                      {row.responsible}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                      {row.accountable}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-400">
                    {row.consulted}
                  </td>
                  <td className="py-3 px-3 text-neutral-400">
                    {row.informed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
