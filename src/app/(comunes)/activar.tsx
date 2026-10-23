import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { activarCuenta } from '@/api/autenticacion';
import { ErrorApi } from '@/api/cliente';
import { AvisoError } from '@/components/AvisoError';
import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Colores } from '@/constants/colores';
import { useSesion } from '@/sesion/SesionContext';

// Los códigos de seed_demo y del sistema web tienen 8 caracteres.
const LARGO_CODIGO = 8;

type ErrorActivacion = {
  titulo: string;
  mensaje: string;
  campo?: 'codigo' | 'contrasena';
};

// Cada código HTTP de POST /activar/ es un caso distinto. El título lo pone
// la app; el mensaje es el "detail" que manda el servidor.
function explicarError(error: unknown): ErrorActivacion {
  if (!(error instanceof ErrorApi)) {
    return { titulo: 'No se pudo activar', mensaje: (error as Error).message };
  }
  const mensaje = error.message;
  switch (error.status) {
    case 404:
      return { titulo: 'Código no encontrado', mensaje, campo: 'codigo' };
    case 409:
      // Puede ser código ya usado o teléfono que ya tiene cuenta: en los dos
      // casos la cuenta ya existe, y el detalle del servidor dice cuál fue.
      return { titulo: 'Ya existe una cuenta', mensaje, campo: 'codigo' };
    case 410:
      return { titulo: 'Código vencido', mensaje, campo: 'codigo' };
    case 400:
      // El servidor antepone el nombre del campo ("contrasena: ..."); se quita al mostrarlo.
      return {
        titulo: 'Contraseña no aceptada',
        mensaje: mensaje.replace(/contrasena: /g, ''),
        campo: 'contrasena',
      };
    case 429:
      return { titulo: 'Demasiados intentos', mensaje };
    case 0:
      return { titulo: 'Sin conexión', mensaje };
    default:
      return { titulo: 'No se pudo activar', mensaje };
  }
}

// 03 · Activación de cuenta
export default function PantallaActivar() {
  const { entrar } = useSesion();
  const [codigo, setCodigo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<ErrorActivacion | null>(null);

  const noCoinciden = confirmacion !== '' && contrasena !== confirmacion;
  const completo = codigo.length === LARGO_CODIGO && contrasena !== '' && contrasena === confirmacion;

  async function alActivar() {
    setEnviando(true);
    setError(null);
    try {
      const datos = await activarCuenta(codigo, contrasena);
      // La API responde igual que el login: el papá entra directo a su modo.
      await entrar(datos);
    } catch (e) {
      setError(explicarError(e));
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} hitSlop={16} style={estilos.volver}>
            <Text style={estilos.textoVolver}>‹ Volver</Text>
          </Pressable>

          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Activa tu cuenta</Text>
            <Text style={estilos.subtitulo}>
              Escribe el código que te entregó la escuela al inscribir a tu hijo o hija.
            </Text>
          </View>

          <CajasDeCodigo valor={codigo} alCambiar={setCodigo} conError={error?.campo === 'codigo'} />

          <CampoTexto
            etiqueta="Crea tu contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            conError={error?.campo === 'contrasena'}
          />

          <CampoTexto
            etiqueta="Confirma tu contraseña"
            value={confirmacion}
            onChangeText={setConfirmacion}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            conError={noCoinciden}
          />

          {noCoinciden ? (
            <Text style={estilos.textoError}>Las contraseñas no coinciden.</Text>
          ) : (
            <Text style={estilos.ayuda}>
              Mínimo 8 caracteres. Que no sea solo números ni se parezca a tu teléfono o tu nombre.
            </Text>
          )}

          {error ? <AvisoError titulo={error.titulo} mensaje={error.mensaje} /> : null}

          <View style={estilos.abajo}>
            <Boton
              titulo="Activar cuenta"
              variante="menta"
              onPress={alActivar}
              cargando={enviando}
              deshabilitado={!completo}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type PropsCajas = {
  valor: string;
  alCambiar: (valor: string) => void;
  conError: boolean;
};

// Se ve como una caja por letra, pero por debajo es un solo TextInput
// invisible encima de las cajas: así el teclado, pegar y borrar funcionan normal.
function CajasDeCodigo({ valor, alCambiar, conError }: PropsCajas) {
  const entrada = useRef<ComponentRef<typeof TextInput>>(null);
  const letras = Array.from({ length: LARGO_CODIGO }, (_, i) => valor[i] ?? '');

  return (
    <View style={estilos.bloqueCodigo}>
      <Text style={estilos.etiqueta}>Código de activación</Text>
      <Pressable style={estilos.filaCajas} onPress={() => entrada.current?.focus()}>
        {letras.map((letra, i) => (
          <View
            key={i}
            style={[
              estilos.caja,
              letra !== '' && estilos.cajaLlena,
              i === valor.length && estilos.cajaActual,
              conError && estilos.cajaError,
            ]}>
            <Text style={estilos.letra}>{letra}</Text>
          </View>
        ))}
        <TextInput
          ref={entrada}
          value={valor}
          // El servidor también acepta minúsculas y espacios, pero así se ve igual que en papel.
          onChangeText={(texto) => alCambiar(texto.replace(/[^0-9a-z]/gi, '').toUpperCase())}
          maxLength={LARGO_CODIGO}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          accessibilityLabel="Código de activación"
          caretHidden
          style={estilos.entradaOculta}
        />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { flexGrow: 1, padding: 24, gap: 20 },
  volver: { alignSelf: 'flex-start', paddingVertical: 8 },
  textoVolver: { fontSize: 18, fontWeight: '700', color: Colores.morado },
  encabezado: { gap: 6 },
  titulo: { fontSize: 32, fontWeight: '800', color: Colores.texto },
  subtitulo: { fontSize: 16, color: Colores.textoSuave, lineHeight: 22 },
  bloqueCodigo: { gap: 8 },
  etiqueta: { fontSize: 16, fontWeight: '700', color: Colores.texto },
  filaCajas: { flexDirection: 'row', gap: 6 },
  caja: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colores.borde,
    backgroundColor: Colores.blanco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaLlena: { borderColor: Colores.mentaOscuro },
  cajaActual: { borderColor: Colores.texto },
  cajaError: { borderColor: Colores.error },
  letra: { fontSize: 22, fontWeight: '700', color: Colores.texto },
  entradaOculta: { ...StyleSheet.absoluteFill, opacity: 0, color: 'transparent' },
  ayuda: { fontSize: 14, color: Colores.textoSuave, lineHeight: 20 },
  textoError: { fontSize: 14, fontWeight: '700', color: Colores.error },
  abajo: { marginTop: 'auto' },
});
