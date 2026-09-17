import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const base = process.env.SITE_BASE || '/';

const workbench = {
  label: 'Workbench',
  translations: { es: 'Taller' },
  collapsed: true,
  items: [
    { label: 'Prepare · Laboratory Bootcamp', translations: { es: 'Preparación · Taller de laboratorio' }, slug: 'workbench' },
  ],
};

const partI = {
  label: 'Part I — From Signals to Local Networks',
  translations: { es: 'Parte I — De señales a redes locales' },
  collapsed: false,
  items: [
    { label: 'Chapter 1 · Internet Architecture', translations: { es: 'Capítulo 1 · Arquitectura de Internet' }, slug: 'chapter-1' },
    { label: 'Chapter 2 · Physical Layer', translations: { es: 'Capítulo 2 · Capa física' }, slug: 'chapter-2' },
    { label: 'Chapter 3 · Network Performance', translations: { es: 'Capítulo 3 · Rendimiento de red' }, slug: 'chapter-3' },
    { label: 'Chapter 4 · Ethernet & Local Networks', translations: { es: 'Capítulo 4 · Ethernet y redes locales' }, slug: 'chapter-4' },
  ],
};

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base,
  output: 'static',
  integrations: [
    starlight({
      title: {
        en: 'Computer Networks 2026',
        es: 'Redes de Computadoras 2026',
      },
      description: 'Internet systems, protocols, measurement, and networked computing for the CC degree.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        es: { label: 'Español', lang: 'es' },
      },
      disable404Route: true,
      pagefind: false,
      expressiveCode: false,
      customCss: ['./src/styles/network.css'],
      components: {
        SiteTitle: './src/components/InstitutionalSiteTitle.astro',
        ThemeProvider: './src/components/NoTheme.astro',
        ThemeSelect: './src/components/NoTheme.astro',
      },
      sidebar: [
        {
          label: 'The Book',
          translations: { es: 'El libro' },
          items: [
            { label: 'Contents', translations: { es: 'Contenido' }, slug: 'modules' },
            workbench,
            partI,
          ],
        },
        {
          label: 'Learning Paths',
          translations: { es: 'Rutas de aprendizaje' },
          items: [
            { label: 'Overview', translations: { es: 'Vista general' }, slug: 'paths' },
          ],
        },
        {
          label: 'Explore',
          translations: { es: 'Explorar' },
          items: [
            { label: 'History of Networking', translations: { es: 'Historia de las redes' }, slug: 'history' },
            { label: 'Curiosities', translations: { es: 'Curiosidades' }, slug: 'curiosities' },
          ],
        },
      ],
    }),
  ],
});
