import type { ExpoConfig } from 'expo/config';

// La URL de la API NO se escribe aquí: sale de la variable de entorno API_URL.
// En desarrollo vive en .env.local (ver README); en un build de EAS se define
// en eas.json o en los secretos del proyecto. Cuando el backend esté en
// Railway basta con cambiar esa variable.
const apiUrl = process.env.API_URL;

const config: ExpoConfig = {
  name: 'VIVA SOCCER',
  slug: 'vsoccer-movil',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'vsoccermovil',
  // La app está pensada para leerse con sol: siempre en modo claro.
  userInterfaceStyle: 'light',
  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#3D2170',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      // 01 · Splash: fondo morado mientras se revisa si hay sesión guardada.
      'expo-splash-screen',
      {
        backgroundColor: '#3D2170',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    apiUrl,
  },
};

export default config;
