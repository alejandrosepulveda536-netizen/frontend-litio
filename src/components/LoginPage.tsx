"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveSession } from "@/lib/auth";

interface Perfil { nombre: string; usuario: string }

const COLORES = ["#1E60D4","#0D3A8C","#2a7d4f","#8b4513","#6b21a8","#b45309","#0e7490","#be185d"];

export default function LoginPage() {
  const router = useRouter();
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [selected, setSelected] = useState<Perfil | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPerfiles, setLoadingPerfiles] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/perfiles")
      .then(d => setPerfiles(d.perfiles || []))
      .catch(() => setPerfiles([]))
      .finally(() => setLoadingPerfiles(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ usuario: selected.usuario, password }),
      });
      if (!data.ok) throw new Error(data.error || "Error al ingresar");
      saveSession(data.token, data.nombre, data.rol);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D1E4A" }}>
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-white">Litio</span>
            <span style={{ color: "#F5C018" }}>Celdas</span>
          </h1>
          <p className="text-blue-300 mt-1 text-sm">WhatsApp Manager</p>
        </div>

        {!selected ? (
          <>
            <p className="text-blue-200 text-center mb-6 text-sm">Selecciona tu perfil</p>
            {loadingPerfiles ? (
              <div className="text-center text-blue-300 text-sm py-8">Cargando perfiles...</div>
            ) : perfiles.length === 0 ? (
              <div className="text-center text-blue-300 text-sm py-8">
                No hay perfiles disponibles.<br />
                <span className="text-xs text-blue-400">Verifica la conexion con el servidor.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {perfiles.map((p, i) => (
                  <button
                    key={p.usuario}
                    onClick={() => setSelected(p)}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border border-blue-800 hover:border-blue-400 transition-all cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ background: COLORES[i % COLORES.length] }}
                    >
                      {p.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-white text-sm font-medium text-center">{p.nombre}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <button
              type="button"
              onClick={() => { setSelected(null); setError(""); setPassword(""); }}
              className="text-blue-300 text-sm hover:text-white flex items-center gap-1 mb-2"
            >
              &larr; Cambiar perfil
            </button>
            <div className="text-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2"
                style={{ background: COLORES[perfiles.findIndex(p => p.usuario === selected.usuario) % COLORES.length] }}
              >
                {selected.nombre.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-white font-medium">{selected.nombre}</p>
              <p className="text-blue-400 text-xs">@{selected.usuario}</p>
            </div>
            <input
              type="password"
              placeholder="Contrasena"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-blue-700 bg-blue-950 text-white placeholder-blue-400 focus:outline-none focus:border-blue-400"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "#1E60D4" }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
