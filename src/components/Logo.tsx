import { StyleSheet, Text, View } from 'react-native';

import { Colores } from '@/constants/colores';

export function Logo() {
  return (
    <View style={estilos.fila}>
      <View style={estilos.circulo}>
        <Text style={estilos.iniciales}>VS</Text>
      </View>
      <Text style={estilos.nombre}>VIVA SOCCER</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  circulo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colores.morado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciales: { color: Colores.menta, fontSize: 18, fontWeight: '900' },
  nombre: { color: Colores.morado, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
});
