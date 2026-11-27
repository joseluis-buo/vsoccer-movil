import { View, type ColorValue } from 'react-native';

type Props = {
  forma: 'cuadro' | 'circulo';
  color: ColorValue;
  activo: boolean;
};

// Íconos simples como los del prototipo: cuadro o círculo, relleno si la pestaña está activa.
export function IconoPestana({ forma, color, activo }: Props) {
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: forma === 'circulo' ? 12 : 7,
        borderWidth: 2,
        borderColor: activo ? color : '#7A7290',
        backgroundColor: activo ? color : 'transparent',
      }}
    />
  );
}

/**
 * Alto de la barra de pestañas. La de fábrica (49 px) corta la etiqueta bajo
 * el ícono; aquí cabe completa. `abajo` es el margen seguro del teléfono
 * (la rayita del iPhone), que se suma para no taparla.
 */
export function altoDeLaBarra(abajo: number) {
  return { height: 66 + abajo, paddingTop: 2, paddingBottom: 4 + abajo };
}
