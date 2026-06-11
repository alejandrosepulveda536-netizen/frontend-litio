"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { MessageSquare, Users, Package, FileImage, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/auth";

interface Stats { total: number; hoy: number; grupos: number; archivos: number }
interface Chat {
  id: string; numero: string; nombre?: string; etiqueta?: string;
  ultimo?: { cuerpo?: string; timestamp?: number };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

function formatDate() {
  return new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const s = getSession();
    if (s) setNombre(s.nombre.split(" ")[0]);
    apiFetch("/api/status").then(d => setStats(d.stats || null)).catch(() => {});
    apiFetch("/api/chats").then(d => setChats(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const cards = [
    { label: "Mensajes hoy", value: stats?.hoy ?? 0, Icon: MessageSquare, color: "#1E60D4", bg: "#EEF4FF" },
    { label: "Total mensajes", value: stats?.total ?? 0, Icon: TrendingUp, color: "#0D3A8C", bg: "#E8EFFE" },
    { label: "Grupos activos", value: stats?.grupos ?? 0, Icon: Users, color: "#2a7d4f", bg: "#EDFAF3" },
    { label: "Archivos recibidos", value: stats?.archivos ?? 0, Icon: FileImage, color: "#9a3412", bg: "#FEF3EE" },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl">

        {/* Page header */}
        <div className="mb-7">
          <p className="text-xs font-medium tracking-wide uppercase mb-1" style={{ color: "#5a7bb5" }}>
            {formatDate()}
          </p>
          <h2 className="text-2xl font-bold leading-tight" style={{ color: "#0D1E4A" }}>
            {greeting()}{nombre ? `, ${nombre}` : ""}
          </h2>
          <p className="text-sm mt-1" style={{ color: "#5a7bb5" }}>
            Resumen de actividad de WhatsApp
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {cards.map(({ label, value, Icon, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: bg }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-3xl font-bold tracking-tight" style={{ color: "#0D1E4A" }}>
                {stats === null ? (
                  <span className="inline-block w-10 h-7 bg-gray-100 rounded animate-pulse" />
                ) : value}
              </p>
              <p className="text-xs font-medium mt-1" style={{ color: "#5a7bb5" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Recent chats */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-50 flex items-center justify-between">
            <h3 className="font-semibold text-sm" style={{ color: "#0D1E4A" }}>Chats recientes</h3>
            {chats.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#EEF4FF", color: "#1E60D4" }}>
                {chats.length}
              </span>
            )}
          </div>
          {chats.length === 0 ? (
            <div className="py-14 text-center">
              <MessageSquare size={28} className="mx-auto mb-2" style={{ color: "#d1dff7" }} />
              <p className="text-sm font-medium" style={{ color: "#5a7bb5" }}>
                {stats === null ? "Cargando..." : "Sin chats activos"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-blue-50">
              {chats.slice(0, 12).map((chat) => (
                <div key={chat.id || chat.numero} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50/40 transition-colors">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: "#1E60D4" }}
                  >
                    {(chat.nombre || chat.numero).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#0D1E4A" }}>
                      {chat.nombre || chat.numero}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "#5a7bb5" }}>
                      {chat.ultimo?.cuerpo || "Sin mensajes"}
                    </p>
                  </div>
                  {chat.etiqueta && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0" style={{ background: "#EEF4FF", color: "#1E60D4" }}>
                      {chat.etiqueta}
                    </span>
                  )}
                  {chat.ultimo?.timestamp && (
                    <p className="text-xs shrink-0 tabular-nums" style={{ color: "#5a7bb5" }}>
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
