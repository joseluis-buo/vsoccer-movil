# VIVA SOCCER Móvil

App móvil (React Native + Expo) de la escuela de fútbol infantil VIVA SOCCER.
Consume la API REST del proyecto hermano `viva_soccer` (Django). Las reglas del
proyecto están en [CLAUDE.md](CLAUDE.md).

## Estado actual

- Navegación con expo-router en tres zonas: comunes, `(entrenador)` y `(familia)`.
- Inicio de sesión (02) y activación de cuenta (03) funcionando contra la API.
- La sesión sobrevive a cerrar la app y el token se renueva solo.
- Las demás pantallas están vacías: solo muestran su número y título.

## Estructura

```
src/
  app/                 rutas (cada archivo es una pantalla)
    _layout.tsx        decide qué zona se puede ver según la sesión
    index.tsx          manda a login, al modo Entrenador o al modo Familia
    (comunes)/         02 login · 03 activar
    (entrenador)/      pestañas Inicio · Grupos · Sincronizar · Perfil
    (familia)/         pestañas Hijos · Progreso · Avisos · Perfil
  api/cliente.ts       ÚNICO punto por donde pasan las peticiones a la API
  api/autenticacion.ts POST /token/ y POST /activar/
  sesion/              tokens en SecureStore, modos y contexto de sesión
  components/          botones, campos y piezas reutilizables
```

## Apuntar la app al backend

La URL de la API **no está escrita en el código**. `app.config.ts` la lee de la
variable `API_URL`, y Expo carga esa variable del archivo `.env.local`
(que no se sube a git).

```bash
cp .env.example .env.local
```

### Por qué `localhost` no sirve desde el teléfono

`localhost` siempre significa "esta misma máquina". En la computadora apunta a
la computadora, pero **en el teléfono apunta al propio teléfono**, donde no hay
ningún Django corriendo. Por eso la app tiene que usar la IP de la computadora
en la red Wi-Fi, y Django tiene que aceptar conexiones de toda la red, no solo
de sí mismo.

1. Saca la IP de la computadora:

   ```bash
   hostname -I          # Linux: la primera, p. ej. 192.168.0.201
   ipconfig getifaddr en0   # macOS
   ipconfig             # Windows: "Dirección IPv4"
   ```

2. Ponla en `.env.local`:

   ```
   API_URL=http://192.168.0.201:8000/api/v1/
   ```

3. Arranca Django escuchando en toda la red **y permitiendo esa IP**. Por
   defecto el backend solo acepta `127.0.0.1` y `localhost`; si no agregas la
   IP, Django responde `400 Bad Request` y la app muestra
   "El servidor respondió 400 sin más detalle".

   ```bash
   # en la carpeta del backend
   DJANGO_ALLOWED_HOSTS=192.168.0.201,localhost,127.0.0.1 python manage.py runserver 0.0.0.0:8000
   ```

   (o agrega `DJANGO_ALLOWED_HOSTS=...` al `.env` del backend).

4. El teléfono y la computadora deben estar en la **misma red Wi-Fi**. Prueba
   desde el navegador del teléfono: `http://192.168.0.201:8000/api/v1/token/`
   debe abrir una página de Django REST Framework (aunque diga
   "Method GET not allowed", eso significa que sí llega). Si no carga, revisa
   el firewall de la computadora (puerto 8000).

Si cambias `.env.local`, reinicia `npx expo start` para que tome el valor.

### Cuando el backend esté en Railway

Solo cambia la variable:

```
API_URL=https://vivasoccer.up.railway.app/api/v1/
```

Para un APK de EAS, la variable se define en el perfil de `eas.json`
(`"env": { "API_URL": "..." }`) o como variable del proyecto en expo.dev.

## Correr la app

```bash
npm install
npx expo start              # QR para Expo Go
npx expo start --tunnel     # si el teléfono no está en la misma red (solo el bundle; la API sigue necesitando IP alcanzable)
npx expo start --android    # emulador
```

La vista web (`npx expo start --web`) sirve para armar pantallas rápido, y
también se puede iniciar sesión (el backend permite CORS desde el puerto 8081
en desarrollo). Ahí el token se guarda en `localStorage` porque SecureStore no
existe en el navegador: es menos seguro y **solo es para desarrollo**. En el
teléfono siempre se usa SecureStore. La cola sin conexión y el push no
funcionan en web.

## Usuarios de prueba

Los crea `python manage.py seed_demo` en el backend:

| Usuario      | Contraseña   | Entra a        |
| ------------ | ------------ | -------------- |
| `entrenador` | `entrenador` | Modo Entrenador |
| `5512345678` | `tutor`      | Modo Familia    |
| `admin`      | `admin`      | Modo Entrenador |
| `secretaria` | `secretaria` | No entra: la app le indica que use el sistema web |

`seed_demo` imprime también un código de activación sin canjear (vence a los
7 días).

## Verificar antes de entregar

```bash
npx tsc --noEmit
npx expo lint
```
