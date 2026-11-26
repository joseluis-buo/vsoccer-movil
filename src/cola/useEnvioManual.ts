import { useState } from 'react';

import { enviarPendientes, textoDelResumen } from './envio';

/**
 * El botón "Enviar" (Inicio) y "Reintentar todas" (Sincronizar): manda la
 * cola y deja un mensaje con lo que pasó ("Sin conexión: 1 sigue en el
 * teléfono").
 *
 * El mensaje recuerda cuántas pendientes quedaron. Si después la cola cambia
 * por otro lado (p. ej. se envió sola al volver la señal), el mensaje ya no
 * describe lo que hay y deja de mostrarse.
 */
export function useEnvioManual(usuario: string, pendientesAhora: number) {
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ texto: string; pendientes: number } | null>(null);

  async function enviar() {
    setEnviando(true);
    setResultado(null);
    try {
      const resumen = await enviarPendientes(usuario);
      setResultado({ texto: textoDelResumen(resumen), pendientes: resumen.sinEnviar });
    } catch (e) {
      setResultado({ texto: `No se pudo enviar: ${(e as Error).message}`, pendientes: pendientesAhora });
    }
    setEnviando(false);
  }

  const vigente = resultado !== null && resultado.pendientes === pendientesAhora;
  return { enviando, resultado: vigente ? resultado.texto : null, enviar };
}
