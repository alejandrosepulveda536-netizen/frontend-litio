"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { FileImage, FileText, Download, ExternalLink } from "lucide-react";

interface Mensaje {
  id?: string; wa_id?: string; nombre?: string; tipo_mensaje?: string;
  cuerpo?: string; fecha_envio?: string; link_archivo?: string;
}

export default function ArchivosPage() {
  const [archivos, setArchivos] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Los archivos son mensajes con link_archivo en Supabase
    apiFetch("/api/crm/mensajes")
      .then(d => {
        const msgs: Mensaje[] = d.data || [];
        setArchivos(msgs.filter(m => m.link_archivo));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function isImage(tipo?: string) {
    return tipo?.toLowerCase().includes("imagen") || tipo?.toLowerCase().includes("image") || false;
  }

  return (
    <AppShell>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: "#0D1E4A" }}>Archivos</h2>
          <span className="text-sm text-gray-400">{archivos.length} archivo{archivos.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando archivos...</div>
        ) : archivos.length === 0 ? (
          <div className="bg-white rounded-xl border border-blue-100 shadow-sm py-16 text-center">
            <FileImage size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No hay archivos registrados en Supabase aun</p>
            <p className="text-gray-300 text-xs mt-1">Los archivos que clientes envien por WhatsApp apareceran aqui</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {archivos.map((archivo, i) => (
              <div key={archivo.id || i} className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                {isImage(archivo.tipo_mensaje) && archivo.link_archivo ? (
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={archivo.link_archivo}
                      alt={archivo.cuerpo || "imagen"}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center" style={{ background: "#F2F6FD" }}>
                    {isImage(archivo.tipo_mensaje)
                      ? <FileImage size={36} style={{ color: "#1E60D4" }} />
                      : <FileText size={36} className="text-gray-400" />}
                  </div>
                )}
                <div className="p-2.5">
                  <p className="text-xs font-medium truncate" style={{ color: "#0D1E4A" }}>
                    {archivo.nombre || archivo.wa_id || "Archivo"}
                  </p>
                  <p className="text-xs text-gray-400">{archivo.tipo_mensaje || "Archivo"}</p>
                  {archivo.fecha_envio && (
                    <p className="text-xs text-gray-300">
                      {new Date(archivo.fecha_envio).toLocaleDateString("es-CO")}
                    </p>
                  )}
                  {archivo.link_archivo && (
                    <a
                      href={archivo.link_archivo}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                    >
                      <Download size={11} /> Descargar
                      <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
