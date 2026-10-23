import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { iniciarSesionEnApi } from '@/api/autenticacion';
import { AvisoError } from '@/components/AvisoError';
import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Logo } from '@/components/Logo';
import { Colores } from '@/constants/colores';
import { useSesion } from '@/sesion/SesionContext';

// 02 · Inicio de sesión
export default function PantallaLogin() {
  const { entrar } = useSesion();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completo = usuario.trim() !== '' && contrasena !== '';

  async function alEntrar() {
    setEnviando(true);
    setError(null);
    try {
      const datos = await iniciarSesionEnApi(usuario.trim(), contrasena);
      // Al guardar la sesión, la navegación lleva sola al modo que corresponde.
      await entrar(datos);
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.pantalla}>
      <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <Logo />

          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Inicia sesión</Text>
            <Text style={estilos.subtitulo}>Entrenadores y familias usan la misma cuenta de la escuela.</Text>
          </View>

          <CampoTexto
            etiqueta="Usuario"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            returnKeyType="next"
          />

          <CampoTexto
            etiqueta="Contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry={!mostrar}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={() => completo && alEntrar()}
            accesorio={
              <Pressable onPress={() => setMostrar(!mostrar)} hitSlop={16}>
                <Text style={estilos.mostrar}>{mostrar ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            }
          />

          {error ? <AvisoError mensaje={error} /> : null}

          <Boton titulo="Entrar" onPress={alEntrar} cargando={enviando} deshabilitado={!completo} />

          <Link href="/activar" style={estilos.enlace}>
            Activar cuenta con código
          </Link>

          <Text style={estilos.pie}>¿Olvidaste tu contraseña? Contacta a la escuela.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: Colores.fondo },
  contenido: { flexGrow: 1, padding: 24, paddingTop: 40, gap: 20 },
  encabezado: { gap: 6, marginTop: 12 },
  titulo: { fontSize: 32, fontWeight: '800', color: Colores.texto },
  subtitulo: { fontSize: 16, color: Colores.textoSuave, lineHeight: 22 },
  mostrar: { fontSize: 16, fontWeight: '700', color: Colores.morado, paddingLeft: 12 },
  enlace: {
    alignSelf: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: Colores.morado,
    textDecorationLine: 'underline',
    padding: 12,
  },
  pie: { marginTop: 'auto', textAlign: 'center', fontSize: 14, color: Colores.textoSuave },
});
