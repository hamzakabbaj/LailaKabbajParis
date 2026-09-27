# Laila Kabbaj · Lecture rapide

Website for Laila Kabbaj, speed-reading trainer in Paris, built with [Astro](https://astro.build).

Live site: https://hamzakabbaj.github.io/LailaKabbajParis/

## See the website on your computer

### 1. Install the tools (once)

You need **Node.js 22.12 or newer**. The easiest way is [nvm](https://github.com/nvm-sh/nvm):

```sh
nvm install      # installs the Node version pinned in .nvmrc
```

### 2. Get the code and its dependencies (once)

```sh
git clone https://github.com/hamzakabbaj/LailaKabbajParis.git
cd LailaKabbajParis
nvm use
npm install
```

### 3. Start the site

```sh
nvm use          # in each new terminal
npm run dev
```

Then open **http://localhost:4321/LailaKabbajParis/** in your browser. Keep the `/LailaKabbajParis/` part: `http://localhost:4321/` alone shows a 404, because the site is published under that folder on GitHub Pages.

The page reloads by itself when you edit a file. Press `Ctrl + C` in the terminal to stop the server.

**On your phone:** run `npm run dev -- --host` instead. The terminal prints a `Network` address (for example `http://192.168.1.20:4321/LailaKabbajParis/`), which you can open on a phone connected to the same Wi-Fi.

## See exactly what will be published

`npm run dev` also shows the **fake testimonials** (examples to replace with real ones). The published site never includes them. To see the real published version:

```sh
npm run build      # builds the site into dist/, without the fake testimonials
npm run preview    # serves it at http://localhost:4321/LailaKabbajParis/
npx astro preview stop   # stops the preview server when you're done
```

## Where to edit the content

| What | File |
| --- | --- |
| Trainings (titles, prices, program, payment link) | `src/data/formations.yaml` |
| Testimonials | `src/data/temoignages.yaml` |
| Name, email, Instagram, motto | `src/site.ts` |
| Home page sections | `src/components/` (one file per section) |
| Legal pages, thank-you page | `src/pages/` |
| Link preview image (WhatsApp, Facebook…) | `public/og-image.jpg` (1200 × 630) |

Before publishing, run `npm run check`: it should report 0 errors.

## Publishing

Every push to the `main` branch publishes the site automatically, in about a minute. You can follow each deploy in the repository's **Actions** tab.
