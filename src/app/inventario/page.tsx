"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { Plus, Package, ArrowDownCircle, ArrowUpCircle, BarChart3, Save, FileDown } from "lucide-react";

interface Producto {
  id?: string; nombre?: string; descripcion?: string; categoria?: string;
  precio_unitario?: number; costo_unitario?: number; activo?: boolean;
}
interface Movimiento {
  id?: string; producto_id?: string; cantidad?: number; tipo?: string;
  fecha?: string; nota?: string; productos?: { id: string; nombre: string };
}
interface StockItem {
  id?: string; nombre?: string; categoria?: string; precio_unitario?: number;
  inventario_fisico?: { stock_fisico: number }[];
  stock_calculado?: number;
}

type Tab = "productos" | "movimientos" | "stock";

function fichaUrl(nombre: string): string | null {
  const n = (nombre || "").toUpperCase().replace(/\s+/g, "_");
  const map: Record<string, string> = {
    "EVE_25P": "LitioCeldas_EVE_25P.pdf",
    "EVE_26V": "LitioCeldas_EVE_26V.pdf",
    "EVE_33V": "LitioCeldas_EVE_33V.pdf",
    "EVE_35V": "LitioCeldas_EVE_35V.pdf",
    "EVE_40P": "LitioCeldas_EVE_40P.pdf",
    "EVE_50E": "LitioCeldas_EVE_50E.pdf",
    "EVE_MB31": "LitioCeldas_EVE_MB31.pdf",
    "DMEGC_26E": "LitioCeldas_DMEGC_26E.pdf",
    "DMEGC_29E": "LitioCeldas_DMEGC_29E.pdf",
  };
  const key = Object.keys(map).find(k => n.includes(k));
  return key ? `/fichas/${map[key]}` : null;
}

export default function InventarioPage() {
  const [tab, setTab] = useState<Tab>("productos");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNuevoProducto, setShowNuevoProducto] = useState(false);
  const [showNuevoMov, setShowNuevoMov] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState<Producto>({ activo: true });
  const [nuevoMov, setNuevoMov] = useState({ producto_id: "", cantidad: 1, tipo: "entrada", nota: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (tab === "productos") {
      apiFetch("/api/crm/productos")
        .then(d => setProductos(d.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === "movimientos") {
      apiFetch("/api/crm/inventario")
        .then(d => setMovimientos(d.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      apiFetch("/api/crm/inventario-fisico")
        .then(d => {
          const prods: StockItem[] = d.prods || [];
          const movs: { producto_id: string; cantidad: number; tipo: string }[] = d.movs || [];
          const calcMap: Record<string, number> = {};
          movs.forEach(m => {
            if (!calcMap[m.producto_id]) calcMap[m.producto_id] = 0;
            calcMap[m.producto_id] += m.tipo === "entrada" ? m.cantidad : -m.cantidad;
          });
          setStock(prods.map(p => ({ ...p, stock_calculado: calcMap[p.id || ""] || 0 })));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab]);

  async function guardarProducto() {
    setSaving(true);
    try {
      await apiFetch("/api/crm/productos", { method: "POST", body: JSON.stringify(nuevoProducto) });
      setShowNuevoProducto(false);
      setNuevoProducto({ activo: true });
      setTab("productos");
      setLoading(true);
      const d = await apiFetch("/api/crm/productos");
      setProductos(d.data || []);
    } catch { /* ignore */ }
    finally { setSaving(false); setLoading(false); }
  }

  async function guardarMovimiento() {
    setSaving(true);
    try {
      await apiFetch("/api/crm/inventario", {
        method: "POST",
        body: JSON.stringify({ ...nuevoMov, fecha: new Date().toISOString() }),
      });
      setShowNuevoMov(false);
      setNuevoMov({ producto_id: "", cantidad: 1, tipo: "entrada", nota: "" });
      const d = await apiFetch("/api/crm/inventario");
      setMovimientos(d.data || []);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  const TABS: { key: Tab; label: string; Icon: typeof Package }[] = [
    { key: "productos", label: "Productos", Icon: Package },
    { key: "movimientos", label: "Movimientos", Icon: ArrowDownCircle },
    { key: "stock", label: "Stock", Icon: BarChart3 },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold" style={{ color: "#0D1E4A" }}>Inventario</h2>
            <div className="flex rounded-lg overflow-hidden border border-blue-200 text-xs font-medium">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-3 py-1.5 transition-colors ${tab === key ? "text-white" : "text-gray-600 hover:bg-blue-50"}`}
                  style={tab === key ? { background: "#1E60D4" } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {tab === "productos" && (
            <button
              onClick={() => setShowNuevoProducto(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: "#1E60D4" }}
            >
              <Plus size={15} /> Nuevo producto
            </button>
          )}
          {tab === "movimientos" && (
            <button
              onClick={() => setShowNuevoMov(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: "#1E60D4" }}
            >
              <Plus size={15} /> Registrar movimiento
            </button>
          )}
        </div>

        {/* Modal nuevo producto */}
        {showNuevoProducto && (
          <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h3 className="font-bold text-base mb-4" style={{ color: "#0D1E4A" }}>Nuevo producto</h3>
              <div className="space-y-3">
                {[
                  { label: "Nombre", field: "nombre" as keyof Producto, required: true },
                  { label: "Categoria", field: "categoria" as keyof Producto },
                  { label: "Descripcion", field: "descripcion" as keyof Producto },
                ].map(({ label, field, required }) => (
                  <div key={field}>
                    <label className="block text-xs text-gray-500 mb-1">{label}{required ? " *" : ""}</label>
                    <input
                      value={(nuevoProducto[field] as string) || ""}
                      onChange={e => setNuevoProducto(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Precio venta</label>
                    <input
                      type="number" min={0}
                      value={nuevoProducto.precio_unitario || ""}
                      onChange={e => setNuevoProducto(p => ({ ...p, precio_unitario: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Costo</label>
                    <input
                      type="number" min={0}
                      value={nuevoProducto.costo_unitario || ""}
                      onChange={e => setNuevoProducto(p => ({ ...p, costo_unitario: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={guardarProducto} disabled={saving || !nuevoProducto.nombre}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: "#1E60D4" }}
                >
                  <Save size={14} /> {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => setShowNuevoProducto(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal nuevo movimiento */}
        {showNuevoMov && (
          <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
              <h3 className="font-bold text-base mb-4" style={{ color: "#0D1E4A" }}>Registrar movimiento</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Producto *</label>
                  <select
                    value={nuevoMov.producto_id}
                    onChange={e => setNuevoMov(m => ({ ...m, producto_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="">Seleccionar...</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                    <select
                      value={nuevoMov.tipo}
                      onChange={e => setNuevoMov(m => ({ ...m, tipo: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                    >
                      <option value="entrada">Entrada</option>
                      <option value="salida">Salida</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
                    <input
                      type="number" min={1}
                      value={nuevoMov.cantidad}
                      onChange={e => setNuevoMov(m => ({ ...m, cantidad: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nota</label>
                  <input
                    value={nuevoMov.nota}
                    onChange={e => setNuevoMov(m => ({ ...m, nota: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-400"
                    placeholder="Compra, ajuste, devolucion..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={guardarMovimiento} disabled={saving || !nuevoMov.producto_id}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: "#1E60D4" }}
                >
                  <Save size={14} /> {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => setShowNuevoMov(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabla productos */}
        {tab === "productos" && (
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripcion</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Costo</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">Cargando...</td></tr>
                ) : productos.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">Sin productos registrados</td></tr>
                ) : productos.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#F2F6FD" }}>
                          <Package size={14} style={{ color: "#1E60D4" }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#0D1E4A" }}>{p.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{p.categoria || "—"}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 max-w-xs truncate">{p.descripcion || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-700 font-mono">
                      {p.precio_unitario != null && p.precio_unitario > 0 ? `$${p.precio_unitario.toLocaleString("es-CO")}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 font-mono">
                      {p.costo_unitario != null && p.costo_unitario > 0 ? `$${p.costo_unitario.toLocaleString("es-CO")}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.activo !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.activo !== false ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {fichaUrl(p.nombre || "") ? (
                        <a
                          href={fichaUrl(p.nombre || "") as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: "#F2F6FD", color: "#1E60D4" }}
                          title="Descargar ficha tecnica"
                        >
                          <FileDown size={13} /> PDF
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && productos.length > 0 && (
              <div className="px-5 py-3 border-t border-blue-50 text-xs text-gray-400 flex items-center gap-2">
                <span>{productos.length} producto{productos.length !== 1 ? "s" : ""}</span>
                <span className="text-gray-300">|</span>
                <span>{productos.filter(p => fichaUrl(p.nombre || "")).length} con ficha tecnica disponible</span>
              </div>
            )}
          </div>
        )}

        {/* Tabla movimientos */}
        {tab === "movimientos" && (
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cantidad</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nota</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">Cargando...</td></tr>
                ) : movimientos.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">Sin movimientos registrados</td></tr>
                ) : movimientos.map((m, i) => (
                  <tr key={m.id || i} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: "#0D1E4A" }}>
                      {m.productos?.nombre || m.producto_id || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.tipo === "entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {m.tipo === "entrada"
                          ? <ArrowDownCircle size={11} />
                          : <ArrowUpCircle size={11} />}
                        {m.tipo === "entrada" ? "Entrada" : "Salida"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-mono font-semibold" style={{ color: m.tipo === "entrada" ? "#16a34a" : "#dc2626" }}>
                      {m.tipo === "entrada" ? "+" : "-"}{m.cantidad}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{(m as { nota?: string }).nota || "—"}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {m.fecha ? new Date(m.fecha).toLocaleDateString("es-CO") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && movimientos.length > 0 && (
              <div className="px-5 py-3 border-t border-blue-50 text-xs text-gray-400">
                {movimientos.length} movimiento{movimientos.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}

        {/* Stock */}
        {tab === "stock" && (
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock calculado</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock fisico</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">Cargando...</td></tr>
                ) : stock.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">Sin datos de stock</td></tr>
                ) : stock.map((s, i) => {
                  const fisico = s.inventario_fisico?.[0]?.stock_fisico ?? null;
                  const calculado = s.stock_calculado ?? 0;
                  const bajo = calculado <= 5;
                  return (
                    <tr key={s.id || i} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium" style={{ color: "#0D1E4A" }}>{s.nombre}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{s.categoria || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`text-sm font-bold font-mono ${bajo ? "text-red-600" : "text-green-700"}`}>
                          {calculado}
                        </span>
                        {bajo && (
                          <span className="ml-2 text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded">Stock bajo</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-gray-600">
                        {fisico != null ? fisico : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600 font-mono">
                        {s.precio_unitario != null ? `$${s.precio_unitario.toLocaleString("es-CO")}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!loading && stock.length > 0 && (
              <div className="px-5 py-3 border-t border-blue-50 text-xs text-gray-400">
                {stock.length} producto{stock.length !== 1 ? "s" : ""} en inventario
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
