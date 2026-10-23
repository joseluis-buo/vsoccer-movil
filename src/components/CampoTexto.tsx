import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colores } from '@/constants/colores';

type Props = TextInputProps & {
  etiqueta: string;
  conError?: boolean;
  /** Algo a la derecha dentro del campo, p. ej. el botón "Mostrar". */
  accesorio?: ReactNode;
};

export function CampoTexto({ etiqueta, conError, accesorio, style, ...props }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View style={[estilos.caja, conError && estilos.cajaError]}>
        <TextInput
          placeholderTextColor={Colores.textoSuave}
          style={[estilos.entrada, style]}
          {...props}
        />
        {accesorio}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 8 },
  etiqueta: { fontSize: 16, fontWeight: '700', color: Colores.texto },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colores.borde,
    backgroundColor: Colores.blanco,
    paddingHorizontal: 16,
  },
  cajaError: { borderColor: Colores.error },
  entrada: { flex: 1, fontSize: 18, color: Colores.texto, paddingVertical: 12 },
});
