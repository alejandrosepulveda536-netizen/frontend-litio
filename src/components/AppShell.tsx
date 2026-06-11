"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { LayoutDashboard, MessageSquare, Users, Bot, FolderOpen, LogOut, Wifi, WifiOff, Boxes } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/chats", label: "Chats", Icon: MessageSquare },
  { href: "/contactos", label: "Contactos", Icon: Users },
  { href: "/inventario", label: "Inventario", Icon: Boxes },
  { href: "/bot-config", label: "Bot Config", Icon: Bot },
  { href: "/archivos", label: "Archivos", Icon: FolderOpen },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<{ nombre: string; rol: string } | null>(null);
  const [stats, setStats] = useState<{ total: number; hoy: number; grupos: number; archivos: number } | null>(null);
  const [status, setStatus] = useState<"ready" | "connecting" | "disconnected">("disconnected");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/"); return; }
    setSession(s);
    apiFetch("/api/status").then(d => {
      setStats(d.stats || null);
      setStatus(d.status === "ready" ? "ready" : d.status === "connecting" ? "connecting" : "disconnected");
    }).catch(() => {});
  }, [router]);

  function handleLogout() {
    clearSession();
    router.replace("/");
  }

  const statusColor = status === "ready" ? "text-green-500" : status === "connecting" ? "text-yellow-500" : "text-red-500";
  const statusLabel = status === "ready" ? "WhatsApp conectado" : status === "connecting" ? "Conectando..." : "Desconectado";

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-30 w-56 flex flex-col transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#0D1E4A" }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: "#1a3366" }}>
          <h1 className="text-xl font-bold">
            <span className="text-white">Litio</span>
            <span style={{ color: "#F5C018" }}>Celdas</span>
          </h1>
          <p className="text-xs text-blue-400 mt-0.5">WA Manager</p>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? "text-white" : "text-blue-300 hover:text-white hover:bg-white/5"
                }`}
                style={active ? { background: "#1E60D4" } : {}}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: "#1a3366" }}>
          {session && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {session.nombre.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{session.nombre}</p>
                <p className="text-blue-400 text-xs capitalize">{session.rol}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-blue-300 hover:text-white text-xs w-full"
          >
            <LogOut size={14} /> Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-blue-100 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-500" onClick={() => setMobileOpen(true)}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="hidden lg:block text-sm font-semibold" style={{ color: "#0D1E4A" }}>
              {NAV.find(n => n.href === pathname)?.label ?? ""}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 text-xs font-medium ${statusColor}`}>
              {status === "ready" ? <Wifi size={14} /> : <WifiOff size={14} />}
              {statusLabel}
            </span>
            {stats && (
              <>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: "#1E60D4" }}>
                  {stats.hoy} hoy
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {stats.total} total
                </span>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
