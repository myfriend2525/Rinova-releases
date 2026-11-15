// Enlaces de descarga de Rinova. Es el único archivo que hay que tocar para cambiar enlaces.
//
// - releases: repositorio público donde se publican los APK.
// - apk: APK para teléfonos actuales (arm64). Siempre apunta a la última versión.
// - apkLegacy: APK para teléfonos antiguos (armeabi-v7a).
// La web pregunta a GitHub por la última versión solo para mostrar su número junto al botón.
window.RINOVA_LINKS = {
  releases: 'https://github.com/myfriend2525/Rinova-releases',
  apk: 'https://github.com/myfriend2525/Rinova-releases/releases/latest/download/Rinova.apk',
  apkLegacy: 'https://github.com/myfriend2525/Rinova-releases/releases/latest/download/Rinova-armeabi-v7a.apk',
};
