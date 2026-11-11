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
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
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
