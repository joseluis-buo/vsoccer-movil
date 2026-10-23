# VIVA SOCCER Móvil — app móvil (React Native + Expo)

App móvil de la escuela de fútbol infantil VIVA SOCCER, en Tijuana. Consume la
API REST del proyecto hermano `viva_soccer` (Django), que es quien habla con la
base de datos PostgreSQL en Neon. **Esta app nunca se conecta a la base
directamente.**

Dos modos según el rol de la cuenta que inicia sesión:

- **Entrenador** — captura evaluaciones desde la cancha, incluso sin señal.
- **Familia** — el tutor consulta el desempeño de sus hijos.

Los alumnos son menores de edad: no tienen cuenta y su información solo es
visible para su tutor y para el personal de la escuela.

Es el proyecto de la materia *Desarrollo de Aplicaciones Móviles Basadas en
Cómputo en la Nube* (ITT), de un equipo de cuatro, y el código se expone en
clase. Que se pueda explicar: nombres claros en español, componentes cortos y
un comentario donde la razón no sea obvia. Nada de abstracciones que el equipo
no pueda sostener frente al profesor.

## Stack

- React Native + **Expo** con **TypeScript**
- **expo-router** para la navegación
- `expo-sqlite` — cola de captura sin conexión
- `expo-secure-store` — tokens JWT
- `expo-notifications` — notificaciones push
- Gráficas: librería ligera de RN; si pesa de más, se dibuja con SVG

## Reglas que no se rompen

1. **El servidor manda.** El promedio y el folio los calcula el backend. La app
   puede mostrar un promedio tentativo mientras se captura, pero el valor bueno
   es el que regresa la API.
2. **Offline primero en la captura.** Toda evaluación se guarda primero en
   SQLite local con su `client_uuid` y su fecha, y después se intenta enviar.
   La cola se reintenta al recuperar conexión. Reenviar no duplica.
3. **La fecha la manda el teléfono**, no el servidor. Una evaluación capturada
   el lunes y sincronizada el martes es del lunes. Esto es el corazón del modo
   sin conexión.
4. **Nada de URLs ni llaves quemadas en el código.** La URL de la API sale de
   `app.config.ts` y variables de entorno.
5. **El token va en SecureStore**, nunca en AsyncStorage ni en estado
   persistido a disco.
6. **La app no decide permisos.** No se esconden datos con `if` en pantalla: se
   piden a la API, que ya filtra por rol.
7. **Renovación invisible.** El access token dura 15 minutos. Ante un 401, el
   cliente renueva con el refresh y reintenta la petición sin que el usuario se
   entere. Si el refresh también falla, se cierra sesión.
8. **Pensada para la cancha**: botones grandes, buen contraste, legible con
   sol. Nada que exija precisión del dedo.

## La API

Base: `<URL>/api/v1/`. JSON. Todos los errores llegan como
`{"detail": "..."}` con su código HTTP.

**Autenticación**

- `POST /token/` — `{username, password}` → `access`, `refresh`, `rol`,
  `roles`, `nombre`.
  - `rol` es el principal, en orden: administrador, secretaria, entrenador,
    tutor. Con él la app decide a qué modo entrar.
  - `roles` trae todos. Un entrenador puede ser además papá de un alumno; si
    trae más de uno, hay que ofrecer cambio de modo.
  - Usuario sin ningún rol → 403.
- `POST /token/refresh/` — rotación: cada renovación entrega un refresh nuevo.
  Access 15 minutos, refresh 30 días.
- `POST /activar/` — `{codigo, contrasena}` → 201 con los mismos datos del
  login, para que el padre entre directo. Errores: 404 código inexistente,
  409 ya usado o teléfono ocupado, 410 vencido, 400 contraseña débil.
- Límites: 10 intentos por minuto en login, 5 por minuto en activación.

**Modo Entrenador**

- `GET /mis-grupos/` — las categorías y horarios asignados.
- `GET /alumnos/?grupo=MINI-LUN_MIE` — alumnos del grupo, con marca de si ya
  tienen evaluación de hoy. Las claves de grupo combinan categoría (MINI,
  MENOR, MAYOR) y horario (LUN_MIE, MAR_JUE). Grupo ajeno → 403.
- `POST /evaluaciones/` — `{alumno, fecha, pase, recepcion, tiro,
  observaciones, client_uuid}`.
  - Mismo `client_uuid` otra vez → 200 con la que ya existe, no duplica.
  - Ese alumno ya evaluado hoy por otra vía → 409, con quién la capturó.
  - Fecha futura o de más de 7 días atrás → rechazada.
- `PATCH /evaluaciones/<id>/` — corrección, solo el mismo día de la evaluación
  y solo de quien la capturó.
- `GET /alumnos/<id>/evaluaciones/` — histórico: `fecha`, `pase`, `recepcion`,
  `tiro`, `promedio`, `observaciones`, `capturada_por`, `temporada`.

**Modo Familia**

- `GET /mis-hijos/` — cada hijo con categoría y horario (clave y nombre),
  `activo` en false si está dado de baja, y `ultima_evaluacion` (null si aún
  no lo evalúan). Los activos van primero. Solo tutores; otros roles → 403.
- `GET /alumnos/<id>/evaluaciones/` — el mismo histórico, para sus hijos.
  La gráfica de progresión se dibuja con estos datos, agrupando por
  `temporada`, que es el año de la evaluación. No hay endpoint aparte.
- `GET /comunicados/` — avisos generales más los de las categorías de sus
  hijos activos, del más nuevo al más viejo.
- `POST /dispositivos/` — registra el token push de Expo. 201 si es nuevo,
  200 si ya existía. Si el token era de otro usuario, pasa al actual.

**Aislamiento:** un alumno que no le toca al usuario responde 404, nunca 403,
para no revelar que existe.

## Pantallas

Comunes: `01 Splash` · `02 Inicio de sesión` · `03 Activación de cuenta`

Modo Entrenador: `04 Inicio` · `05 Alumnos del grupo` · `06 Captura de
evaluación` · `07a Guardado y sincronizado` · `07b Guardado sin conexión` ·
`08 Ficha del alumno`

Modo Familia: `09 Mis hijos` · `10 Ficha del alumno` · `11 Progresión por
temporada` · `12 Avisos` · `13 Perfil`

El flujo completo entre ellas está en el PDF del prototipo, en esta carpeta.

## Paleta

```
morado          #3D2170   modo Entrenador, elementos principales
morado oscuro   #1B1230
menta           #2EE6A6   modo Familia, acentos y confirmaciones
menta oscuro    #12A87C
fondo claro     #F5F2FB
texto           #1A1A1A
texto suave     #5F5580
```

## Desarrollo

El backend corre en la computadora. Para que el celular lo alcance, Django
debe escuchar en toda la red y la app apuntar a la IP local de la máquina,
**no a localhost**:

```bash
# en la carpeta del backend
python manage.py runserver 0.0.0.0:8000

# la IP de la máquina
hostname -I
```

La app entonces apunta a `http://<esa-ip>:8000/api/v1/`.

```bash
npm install
npx expo start              # QR para Expo Go
npx expo start --tunnel     # si el teléfono no está en la misma red
npx expo start --web        # navegador; ojo: sin SQLite ni push
npx expo start --android    # emulador

npx eas build -p android --profile preview   # APK instalable
```

**La vista web no sirve para probar la cola sin conexión ni las
notificaciones**: `expo-sqlite` y el push solo funcionan en el teléfono. Sirve
para ir armando pantallas rápido.

## Usuarios de prueba

Los crea `python manage.py seed_demo` en el backend.

- `entrenador` / `entrenador` — grupos Mini y Menor en los dos horarios.
  Mayor queda fuera a propósito, para ver que el filtro funciona.
- `5512345678` / `tutor` — papá demo, cuenta ya activa.
- Código sin canjear para probar la activación: el que imprima `seed_demo`.
  **Vence a los 7 días**; si ya venció, vuelve a correr `seed_demo`.
