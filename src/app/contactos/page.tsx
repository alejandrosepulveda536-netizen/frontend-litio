"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { Search } from "lucide-react";

interface Prospecto {
  id?: string; wa_id?: string; nombre?: string; telefono?: string;
  estado?: string; etiqueta?: string; fecha_creacion?: string; notas?: string;
}

const ESTADOS: Record<string, string> = {
  Nuevo: "bg-blue-100 text-blue-700",
  Interesado: "bg-yellow-100 text-yellow-700",
  Cotizado: "bg-purple-100 text-purple-700",
  Convertido: "bg-green-100 text-green-700",
  Perdido: "bg-red-100 text-red-500",
};

export default function ContactosPage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"prospectos" | "clientes">("prospectos");

  useEffect(() => {
    setLoading(true);
    const endpoint = tab === "prospectos" ? "/api/crm/prospectos" : "/api/crm/clientes";
    apiFetch(endpoint)
      .then(d => setProspectos(d.data || []))
      .catch(() => setProspectos([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const filtered = prospectos.filter(p =>
    (p.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.wa_id || p.telefono || "").includes(search) ||
    (p.estado || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: "#0D1E4A" }}>Contactos</h2>
            <div className="flex rounded-lg overflow-hidden border border-blue-200 text-xs font-medium">
              <button
                onClick={() => setTab("prospectos")}
                className={`px-3 py-1.5 transition-colors ${tab === "prospectos" ? "text-white" : "text-gray-600 hover:bg-blue-50"}`}
                style={tab === "prospectos" ? { background: "#1E60D4" } : {}}
              >
                Prospectos
              </button>
              <button
                onClick={() => setTab("clientes")}
                className={`px-3 py-1.5 transition-colors ${tab === "clientes" ? "text-white" : "text-gray-600 hover:bg-blue-50"}`}
                style={tab === "clientes" ? { background: "#1E60D4" } : {}}
              >
                Clientes
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-100 px-3 py-2 shadow-sm">
            <Search size={14} className="text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm outline-none placeholder-gray-400 w-44"
              placeholder="Buscar..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">WhatsApp</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">Sin registros</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id || i} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: "#1E60D4" }}>
                        {(p.nombre || "??").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium" style={{ color: "#0D1E4A" }}>{p.nombre || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 font-mono">
                    {p.wa_id ? `+${p.wa_id}` : p.telefono || "—"}
                  </td>
                  <td className="px-5 py-3">
                    {p.estado && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADOS[p.estado] || "bg-gray-100 text-gray-500"}`}>
                        {p.estado}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 max-w-xs truncate">
                    {p.notas || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && (
            <div className="px-5 py-3 border-t border-blue-50 text-xs text-gray-400">
              {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
