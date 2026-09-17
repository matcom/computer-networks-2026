import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const base = process.env.SITE_BASE || '/';

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
      description: 'Published course material for Computer Networks 2026.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        es: { label: 'Español', lang: 'es' },
      },
      disable404Route: true,
      pagefind: false,
      expressiveCode: false,
      customCss: ['./src/styles/network.css'],
      sidebar: [
        {
          label: 'Available now',
          translations: { es: 'Disponible ahora' },
          items: [
            { label: 'Workbench', translations: { es: 'Taller' }, slug: 'workbench' },
          ],
        },
        {
          label: 'Part I · From Signals to Local Networks',
          translations: { es: 'Parte I · De señales a redes locales' },
          items: [
            { label: 'Chapter 1 · Internet Architecture', translations: { es: 'Capítulo 1 · Arquitectura de Internet' }, slug: 'chapter-1' },
            { label: 'Chapter 2 · Physical Layer', translations: { es: 'Capítulo 2 · Capa Física' }, slug: 'chapter-2' },
            { label: 'Chapter 3 · Network Performance', translations: { es: 'Capítulo 3 · Rendimiento de Redes' }, slug: 'chapter-3' },
            { label: 'Chapter 4 · Ethernet & Local Networks', translations: { es: 'Capítulo 4 · Ethernet y Redes Locales' }, slug: 'chapter-4' },
          ],
        },
        {
          label: 'Part I context',
          translations: { es: 'Contexto de la Parte I' },
          items: [
            { label: 'Learning Paths', translations: { es: 'Rutas de aprendizaje' }, slug: 'paths' },
            { label: 'History', translations: { es: 'Historia' }, slug: 'history' },
            { label: 'Curiosities', translations: { es: 'Curiosidades' }, slug: 'curiosities' },
          ],
        },
      ],
    }),
  ],
});
