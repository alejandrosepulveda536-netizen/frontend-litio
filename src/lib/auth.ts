export function saveSession(token: string, nombre: string, rol: string) {
  sessionStorage.setItem('ltc_token', token);
  sessionStorage.setItem('ltc_nombre', nombre);
  sessionStorage.setItem('ltc_rol', rol);
}

export function clearSession() {
  sessionStorage.removeItem('ltc_token');
  sessionStorage.removeItem('ltc_nombre');
  sessionStorage.removeItem('ltc_rol');
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  const token = sessionStorage.getItem('ltc_token');
  if (!token) return null;
  return {
    token,
    nombre: sessionStorage.getItem('ltc_nombre') || '',
    rol: sessionStorage.getItem('ltc_rol') || '',
  };
}
