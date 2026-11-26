// Configuración de Metro. Solo hace falta para que expo-sqlite funcione en el
// navegador (npx expo start --web); en el teléfono no cambia nada.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// En web, SQLite es un archivo .wasm que Metro debe servir como recurso.
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// SQLite en web necesita SharedArrayBuffer, y el navegador solo lo habilita
// si la página viene con estas dos cabeceras ("cross-origin isolation").
const enhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, metroServer) => {
  const siguiente = enhanceMiddleware ? enhanceMiddleware(middleware, metroServer) : middleware;
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return siguiente(req, res, next);
  };
};

module.exports = config;
