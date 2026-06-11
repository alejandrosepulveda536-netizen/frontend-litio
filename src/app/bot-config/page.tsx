"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { Save, Plus, Trash2 } from "lucide-react";

interface Opcion { clave: string; texto: string; respuesta: string }
interface MenuBot {
  nombre?: string; inicial?: string; bienvenida?: string; pie?: string;
  opciones?: Opcion[];
}
interface AutoReply { activo: boolean; umbral: number; cooldown: number }

export default function BotConfigPage() {
  const [autoReply, setAutoReply] = useState<AutoReply>({ activo: false, umbral: 0.5, cooldown: 60 });
  const [menuBot, setMenuBot] = useState<MenuBot>({ bienvenida: "", opciones: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/autoreply").catch(() => null),
      apiFetch("/api/menubot").catch(() => null),
    ]).then(([ar, mb]) => {
      if (ar) setAutoReply(ar);
      if (mb) setMenuBot(mb);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        apiFetch("/api/autoreply", { method: "POST", body: JSON.stringify(autoReply) }),
        apiFetch("/api/menubot", { method: "POST", body: JSON.stringify(menuBot) }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  function addOpcion() {
    setMenuBot(m => ({
      ...m,
      opciones: [...(m.opciones || []), { clave: "", texto: "", respuesta: "" }],
    }));
  }

  function removeOpcion(i: number) {
    setMenuBot(m => ({ ...m, opciones: (m.opciones || []).filter((_, idx) => idx !== i) }));
  }

  function updateOpcion(i: number, field: keyof Opcion, value: string) {
    setMenuBot(m => ({
      ...m,
      opciones: (m.opciones || []).map((o, idx) => idx === i ? { ...o, [field]: value } : o),
    }));
  }

  if (loading) return <AppShell><div className="text-gray-400 text-sm">Cargando configuracion...</div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold mb-5" style={{ color: "#0D1E4A" }}>Configuracion del Bot</h2>

        <form onSubmit={handleSave} className="space-y-5">

          {/* Auto-reply */}
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-sm" style={{ color: "#0D1E4A" }}>Respuesta automatica</p>
                <p className="text-xs text-gray-400 mt-0.5">El bot responde mensajes entrantes automaticamente</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoReply(a => ({ ...a, activo: !a.activo }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${autoReply.activo ? "" : "bg-gray-300"}`}
                style={autoReply.activo ? { background: "#1E60D4" } : {}}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoReply.activo ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Cooldown: <span style={{ color: "#1E60D4" }}>{autoReply.cooldown}s</span>
              </label>
              <input
                type="range" min={10} max={600} step={10}
                value={autoReply.cooldown}
                onChange={e => setAutoReply(a => ({ ...a, cooldown: Number(e.target.value) }))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10s</span><span>5min</span><span>10min</span>
              </div>
            </div>
          </div>

          {/* Menu del bot */}
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
            <p className="font-semibold text-sm mb-4" style={{ color: "#0D1E4A" }}>Menu del bot</p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre del menu</label>
                <input value={menuBot.nombre || ""} onChange={e => setMenuBot(m => ({ ...m, nombre: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                  placeholder="Menu LitioCeldas" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mensaje inicial (para activar el menu)</label>
                <input value={menuBot.inicial || ""} onChange={e => setMenuBot(m => ({ ...m, inicial: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                  placeholder="hola, menu, start..." />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mensaje de bienvenida</label>
                <textarea value={menuBot.bienvenida || ""} onChange={e => setMenuBot(m => ({ ...m, bienvenida: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400 resize-none"
                  rows={3} placeholder="Hola! Bienvenido a LitioCeldas..." />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Pie del menu</label>
                <input value={menuBot.pie || ""} onChange={e => setMenuBot(m => ({ ...m, pie: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                  placeholder="Escribe el numero de la opcion..." />
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opciones del menu</p>
              <button type="button" onClick={addOpcion}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-xs"
                style={{ background: "#1E60D4" }}>
                <Plus size={12} /> Agregar
              </button>
            </div>
            <div className="space-y-3">
              {(menuBot.opciones || []).map((opt, i) => (
                <div key={i} className="flex gap-2 items-start p-3 rounded-lg bg-blue-50">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input value={opt.clave} onChange={e => updateOpcion(i, "clave", e.target.value)}
                      placeholder="Clave (ej: 1)" className="px-2 py-1.5 rounded border border-blue-200 text-xs outline-none" />
                    <input value={opt.texto} onChange={e => updateOpcion(i, "texto", e.target.value)}
                      placeholder="Texto del boton" className="px-2 py-1.5 rounded border border-blue-200 text-xs outline-none" />
                    <input value={opt.respuesta} onChange={e => updateOpcion(i, "respuesta", e.target.value)}
                      placeholder="Respuesta" className="px-2 py-1.5 rounded border border-blue-200 text-xs outline-none" />
                  </div>
                  <button type="button" onClick={() => removeOpcion(i)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(menuBot.opciones || []).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">Sin opciones. Usa el boton Agregar.</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: saved ? "#16a34a" : "#1E60D4" }}>
            <Save size={16} />
            {saving ? "Guardando..." : saved ? "Guardado!" : "Guardar cambios"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
