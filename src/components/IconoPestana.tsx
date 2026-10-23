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
