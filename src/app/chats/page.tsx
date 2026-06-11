"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch, API_URL } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { Send, Search } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface Chat {
  id: string; numero: string; nombre?: string; etiqueta?: string;
  ultimo?: { cuerpo?: string; timestamp?: number };
  total?: number;
}
interface Mensaje {
  de: string; cuerpo?: string; body?: string; timestamp?: number;
  fromMe?: boolean; tipo?: string;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selected, setSelected] = useState<Chat | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const loadChats = useCallback(() => {
    apiFetch("/api/chats").then(d => setChats(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadChats();
    const s = getSession();
    const socket = io(API_URL, { auth: { token: s?.token }, transports: ["websocket"] });
    socketRef.current = socket;
    socket.on("mensaje", () => loadChats());
    socket.on("stats", () => loadChats());
    socket.on("reply_sent", () => loadChats());
    return () => { socket.disconnect(); };
  }, [loadChats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function loadThread(chat: Chat) {
    setSelected(chat);
    setMensajes([]);
    try {
      const msgs = await apiFetch(`/api/chats/${encodeURIComponent(chat.id || chat.numero)}/mensajes`);
      setMensajes(Array.isArray(msgs) ? msgs : []);
    } catch { /* ignore */ }
  }

  async function sendMsg(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || !selected) return;
    setSending(true);
    const chatId = selected.id || selected.numero;
    try {
      await apiFetch("/api/reply", {
        method: "POST",
        body: JSON.stringify({ chatId, texto }),
      });
      setMensajes(prev => [...prev, { de: "yo", cuerpo: texto, fromMe: true, timestamp: Date.now() }]);
      setTexto("");
    } catch { /* ignore */ }
    finally { setSending(false); }
  }

  const filtered = chats.filter(c =>
    (c.nombre || c.numero).toLowerCase().includes(search.toLowerCase())
  );

  const getMensajeCuerpo = (m: Mensaje) => m.cuerpo || m.body || "";
  const esMio = (m: Mensaje) => m.fromMe || m.de === "yo";

  return (
    <AppShell>
      <div
        className="flex overflow-hidden rounded-xl border border-blue-100 shadow-sm bg-white -m-5"
        style={{ height: "calc(100vh - 96px)" }}
      >
        {/* Lista de chats */}
        <div className="w-72 shrink-0 flex flex-col border-r border-blue-100">
          <div className="p-3 border-b border-blue-50">
            <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
              <Search size={14} className="text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm flex-1 outline-none placeholder-gray-400"
                placeholder="Buscar chat..."
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-8">Sin chats activos</p>
            )}
            {filtered.map((chat) => (
              <button
                key={chat.id || chat.numero}
                onClick={() => loadThread(chat)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                  selected?.id === chat.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: "#1E60D4" }}
                >
                  {(chat.nombre || chat.numero).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#0D1E4A" }}>
                    {chat.nombre || chat.numero}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {chat.ultimo?.cuerpo || chat.numero}
                  </p>
                </div>
                {chat.etiqueta && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 shrink-0">
                    {chat.etiqueta}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Hilo */}
        <div className="flex-1 flex flex-col">
          {selected ? (
            <>
              <div className="px-5 py-3 border-b border-blue-100 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "#1E60D4" }}
                >
                  {(selected.nombre || selected.numero).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#0D1E4A" }}>
                    {selected.nombre || selected.numero}
                  </p>
                  <p className="text-xs text-gray-400">{selected.numero}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ background: "#f8faff" }}>
                {mensajes.length === 0 && (
                  <p className="text-center text-gray-400 text-sm mt-10">Sin mensajes en este chat</p>
                )}
                {mensajes.map((m, i) => (
                  <div key={i} className={`flex ${esMio(m) ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-xl text-sm ${
                        esMio(m)
                          ? "text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                      }`}
                      style={esMio(m) ? { background: "#1E60D4" } : {}}
                    >
                      <p>{getMensajeCuerpo(m)}</p>
                      {m.timestamp && (
                        <p className={`text-xs mt-1 ${esMio(m) ? "text-blue-200" : "text-gray-400"}`}>
                          {new Date(m.timestamp).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendMsg} className="p-3 border-t border-blue-100 flex gap-2">
                <input
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                  placeholder="Escribe un mensaje..."
                />
                <button
                  type="submit"
                  disabled={sending || !texto.trim()}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white disabled:opacity-40 shrink-0"
                  style={{ background: "#1E60D4" }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Selecciona un chat para ver los mensajes
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
