import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colores } from '@/constants/colores';

type Props = {
  nombre: string;
  valor: number;
  onCambio: (valor: number) => void;
};

const MINIMO = 1;
const MAXIMO = 10;

// "– 8 +" del prototipo: dos botones grandes en vez de diez chiquitos, para
// que se pueda usar en la cancha sin precisión del dedo.
export function SelectorCalificacion({ nombre, valor, onCambio }: Props) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.nombre}>{nombre}</Text>
      <BotonPaso texto="–" etiqueta={`Bajar ${nombre}`} desactivado={valor <= MINIMO} onPress={() => onCambio(valor - 1)} />
      <Text style={estilos.valor} accessibilityLabel={`${nombre}: ${valor}`}>
        {valor}
      </Text>
      <BotonPaso texto="+" etiqueta={`Subir ${nombre}`} desactivado={valor >= MAXIMO} onPress={() => onCambio(valor + 1)} relleno />
    </View>
  );
}

function BotonPaso(props: { texto: string; etiqueta: string; desactivado: boolean; onPress: () => void; relleno?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.etiqueta}
      disabled={props.desactivado}
      onPress={props.onPress}
      style={({ pressed }) => [
        estilos.paso,
        props.relleno ? estilos.pasoRelleno : estilos.pasoClaro,
        props.desactivado && estilos.desactivado,
        pressed && estilos.presionado,
      ]}>
      <Text style={[estilos.pasoTexto, props.relleno && estilos.pasoTextoRelleno]}>{props.texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colores.blanco,
    borderRadius: 16,
    padding: 12,
    paddingLeft: 18,
  },
  nombre: { flex: 1, fontSize: 18, fontWeight: '800', color: Colores.texto },
  valor: { width: 44, textAlign: 'center', fontSize: 30, fontWeight: '900', color: Colores.texto },
  paso: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pasoClaro: { backgroundColor: Colores.fondo, borderWidth: 2, borderColor: Colores.borde },
  pasoRelleno: { backgroundColor: Colores.morado },
  pasoTexto: { fontSize: 28, fontWeight: '800', color: Colores.morado },
  pasoTextoRelleno: { color: Colores.blanco },
  desactivado: { opacity: 0.35 },
  presionado: { opacity: 0.7 },
});
