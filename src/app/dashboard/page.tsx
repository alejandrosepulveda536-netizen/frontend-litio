"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { MessageSquare, Users, Package, FileImage } from "lucide-react";

interface Stats { total: number; hoy: number; grupos: number; archivos: number }
interface Chat {
  id: string; numero: string; nombre?: string; etiqueta?: string;
  ultimo?: { cuerpo?: string; timestamp?: number };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    apiFetch("/api/status").then(d => setStats(d.stats || null)).catch(() => {});
    apiFetch("/api/chats").then(d => setChats(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const cards = [
    { label: "Mensajes hoy", value: stats?.hoy ?? 0, Icon: MessageSquare, color: "#1E60D4" },
    { label: "Total mensajes", value: stats?.total ?? 0, Icon: Package, color: "#0D3A8C" },
    { label: "Grupos activos", value: stats?.grupos ?? 0, Icon: Users, color: "#2a7d4f" },
    { label: "Archivos recibidos", value: stats?.archivos ?? 0, Icon: FileImage, color: "#8b4513" },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl">
        <h2 className="text-xl font-bold mb-5" style={{ color: "#0D1E4A" }}>Dashboard</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(({ label, value, Icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{label}</p>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + "22" }}>
                  <Icon size={18} style={{ color }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: "#0D1E4A" }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-blue-100 shadow-sm">
          <div className="px-5 py-4 border-b border-blue-50">
            <h3 className="font-semibold text-sm" style={{ color: "#0D1E4A" }}>Chats recientes</h3>
          </div>
          {chats.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              {stats === null ? "Cargando..." : "Sin chats activos"}
            </div>
          ) : (
            <div className="divide-y divide-blue-50">
              {chats.slice(0, 12).map((chat) => (
                <div key={chat.id || chat.numero} className="flex items-center gap-3 px-5 py-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: "#1E60D4" }}
                  >
                    {(chat.nombre || chat.numero).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#0D1E4A" }}>
                      {chat.nombre || chat.numero}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {chat.ultimo?.cuerpo || "Sin mensajes"}
                    </p>
                  </div>
                  {chat.etiqueta && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 shrink-0">
                      {chat.etiqueta}
                    </span>
                  )}
                  {chat.ultimo?.timestamp && (
                    <p className="text-xs text-gray-400 shrink-0">
                      {new Date(chat.ultimo.timestamp).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
