import * as Network from 'expo-network';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useSesion } from '@/sesion/SesionContext';

import { enviarPendientes } from './envio';

/**
 * Envía la cola sola, sin que el entrenador vaya a Sincronizar (regla 2:
 * "la cola se reintenta al recuperar conexión"). Se monta una vez, en el
 * layout del modo Entrenador, y dispara el envío:
 *   - al entrar al modo Entrenador (p. ej. al abrir la app),
 *   - cuando el teléfono recupera la red,
 *   - cuando la app vuelve al frente.
 *
 * Si la red está bien pero el servidor estaba caído y regresa, no hay
 * evento de red: para ese caso también se envía cuando una petición a la
 * API vuelve a funcionar (ver copiaLocal.ts y la captura).
 *
 * Enviar con la cola vacía no hace ninguna petición, y si se dispara dos
 * veces a la vez, enviarPendientes comparte el mismo envío.
 */
export function useEnvioAutomatico() {
  const { perfil } = useSesion();
  const usuario = perfil?.usuario;

  useEffect(() => {
    if (!usuario) return;
    // Los errores ya quedan anotados en cada fila de la cola; aquí no hay
    // nadie a quien mostrárselos.
    const enviar = () => {
      enviarPendientes(usuario).catch(() => {});
    };

    enviar();

    const red = Network.addNetworkStateListener((estado) => {
      // isInternetReachable puede tardar en saberse (null); mientras, basta isConnected.
      if (estado.isInternetReachable ?? estado.isConnected) enviar();
    });
    const app = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') enviar();
    });

    return () => {
      red.remove();
      app.remove();
    };
  }, [usuario]);
}
