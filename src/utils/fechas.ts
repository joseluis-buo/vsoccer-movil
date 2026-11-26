const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * "2026-10-07" → "7 oct 2026". Se separa a mano a propósito: new Date("2026-10-07")
 * lo toma como medianoche UTC y en Tijuana se vería como el día anterior.
 */
export function formatearFecha(fecha: string, conAnio = true) {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);
  const texto = `${dia} ${MESES[mes - 1]}`;
  return conAnio ? `${texto} ${anio}` : texto;
}

/** Fecha y hora ISO con zona (p. ej. `publicado` de un aviso) → "7 oct 2026" en hora local. */
export function formatearFechaHora(fechaHora: string) {
  const d = new Date(fechaHora);
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * La fecha de hoy SEGÚN EL TELÉFONO, como "2026-11-11" (regla 3 de CLAUDE.md).
 * No se usa toISOString(): da la fecha en UTC, y en Tijuana a partir de las
 * 4 o 5 de la tarde ya sería "mañana" y el servidor la rechazaría por futura.
 */
export function fechaDeHoy() {
  return fechaLocal(new Date());
}

/** El día de `momento` en la hora del teléfono, como "2026-11-11". */
export function fechaLocal(momento: Date) {
  const mes = String(momento.getMonth() + 1).padStart(2, '0');
  const dia = String(momento.getDate()).padStart(2, '0');
  return `${momento.getFullYear()}-${mes}-${dia}`;
}

/** Fecha y hora ISO → "hoy a las 10:42" o "25 nov a las 18:05", en hora local. */
export function formatearMomento(fechaHora: string) {
  const momento = new Date(fechaHora);
  const hora = `${momento.getHours()}:${String(momento.getMinutes()).padStart(2, '0')}`;
  const dia = fechaLocal(momento) === fechaDeHoy() ? 'hoy' : formatearFecha(fechaLocal(momento), false);
  return `${dia} a las ${hora}`;
}

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "Miércoles 11 de noviembre, 2026", para el encabezado del Inicio. */
export function hoyEnTexto() {
  const hoy = new Date();
  return `${DIAS[hoy.getDay()]} ${hoy.getDate()} de ${MESES_LARGOS[hoy.getMonth()]}, ${hoy.getFullYear()}`;
}
