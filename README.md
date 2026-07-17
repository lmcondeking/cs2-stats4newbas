# Stats4Newbas V2 — Primera entrega organizada

## Incluye
- Home actual mejorada y organizada.
- Perfil individual completo.
- Comparador, gráficos, badges, análisis automático, mapas y dashboard visual.
- Parser de demos y ranking histórico.
- Base de estilos globales premium.
- Estructura correcta para Next.js App Router.

## Antes de ejecutar
1. Copiar los JSON de partidas dentro de `data/matches/`.
2. Copiar los avatares dentro de `public/avatars/` con estos nombres:
   - `conde.png`
   - `Ari.png`
   - `tomi.png`
   - `nico.png`
   - `ludo.png`
   - `tenedor.png`
   - `default.png`
3. Instalar dependencias: `npm install`.
4. Ejecutar: `npm run dev`.

## Para procesar demos
El script espera una carpeta `demos/` y genera JSON dentro de `data/matches/`.
Ejecutar desde la raíz:

```bash
node scripts/process-all-demos.js
```

Nota: si el script fue movido a `scripts/`, puede ser necesario ajustar sus rutas relativas de `__dirname` hacia la raíz del proyecto. La opción más simple es dejar una copia del script en la raíz al procesar demos, o adaptar `demoFolder` y `outputFolder`.
