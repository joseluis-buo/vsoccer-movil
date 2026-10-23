import { peticion } from './cliente';

/** Lo que responden POST /token/ y POST /activar/. */
export type DatosDeSesion = {
  access: string;
  refresh: string;
  rol: string;
  roles: string[];
  nombre: string;
};

export function iniciarSesionEnApi(username: string, password: string) {
  return peticion<DatosDeSesion>('token/', {
    metodo: 'POST',
    cuerpo: { username, password },
    publica: true,
  });
}

export function activarCuenta(codigo: string, contrasena: string) {
  return peticion<DatosDeSesion>('activar/', {
    metodo: 'POST',
    cuerpo: { codigo, contrasena },
    publica: true,
  });
}
