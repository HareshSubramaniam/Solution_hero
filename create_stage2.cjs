const fs = require('fs');
const path = require('path');

const files = {
  "artifacts/community-hero/package.json": `{
  "name": "@workspace/community-hero",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --config vite.config.ts --host 0.0.0.0",
    "build": "vite build --config vite.config.ts",
    "serve": "vite preview --config vite.config.ts --host 0.0.0.0",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@replit/vite-plugin-cartographer": "catalog:",
    "@replit/vite-plugin-dev-banner": "catalog:",
    "@replit/vite-plugin-runtime-error-modal": "catalog:",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "catalog:",
    "@tanstack/react-query": "catalog:",
    "@types/node": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@vitejs/plugin-react": "catalog:",
    "@workspace/api-client-react": "workspace:*",
    "class-variance-authority": "catalog:",
    "clsx": "catalog:",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "catalog:",
    "input-otp": "^1.4.2",
    "lucide-react": "catalog:",
    "next-themes": "^0.4.6",
    "react": "catalog:",
    "react-day-picker": "^9.11.1",
    "react-dom": "catalog:",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.2",
    "sonner": "^2.0.7",
    "tailwind-merge": "catalog:",
    "tailwindcss": "catalog:",
    "tw-animate-css": "^1.4.0",
    "vaul": "^1.1.2",
    "vite": "catalog:",
    "wouter": "^3.3.5",
    "zod": "catalog:"
  },
  "dependencies": {
    "@types/canvas-confetti": "^1.9.0",
    "@types/leaflet": "^1.9.21",
    "canvas-confetti": "^1.9.4",
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0"
  }
}`,
  "artifacts/community-hero/tsconfig.json": `{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "noEmit": true,
    "jsx": "preserve",
    "lib": ["esnext", "dom", "dom.iterable"],
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "references": [
    { "path": "../../lib/api-client-react" }
  ]
}`,
  "artifacts/community-hero/vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    },
    dedupe: ["react", "react-dom"],
  },
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: "0.0.0.0",
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
});`,
  "artifacts/community-hero/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>CommunityHero</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  "artifacts/community-hero/src/App.tsx": `import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <WouterRouter>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 relative z-0">
              <Switch>
                <Route path="/" component={Landing} />
                <Route>
                  <div className="p-8 text-center text-xl font-bold">404 - Not found</div>
                </Route>
              </Switch>
            </main>
          </div>
          <Toaster />
        </WouterRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;`,
  "artifacts/community-hero/src/index.css": `@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-primary: 221 83% 53%;
}

body {
  @apply font-sans antialiased bg-gray-950 text-white;
}`,
  "artifacts/community-hero/src/main.tsx": `import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);`,
  "artifacts/community-hero/src/pages/Landing.tsx": `import { Link } from "wouter";
export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center text-center p-4">
      <h1 className="text-5xl font-bold mb-4">CommunityHero</h1>
      <p className="text-xl text-gray-400 mb-8">Spot it. Report it. Fix it. Together.</p>
      <Link href="/auth">
        <button className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold">Get Started</button>
      </Link>
    </div>
  );
}`,
  "artifacts/community-hero/src/lib/utils.ts": `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
  "lib/api-client-react/package.json": `{
  "name": "@workspace/api-client-react",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "dependencies": { "@tanstack/react-query": "catalog:" },
  "peerDependencies": { "react": ">=18" }
}`,
  "lib/api-client-react/tsconfig.json": `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["dom", "es2022"]
  },
  "include": ["src"]
}`,
  "lib/api-client-react/src/index.ts": `export * from "./generated/api";`,
  "lib/api-client-react/src/generated/api.ts": `// Mock API client
import { useQuery } from '@tanstack/react-query';
export function useGetDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => ({
      totalIssues: 0,
      resolvedIssues: 0,
      activeReporters: 0,
      resolutionRate: 0,
      avgResolutionDays: 0,
    })
  });
}`,
  "lib/api-zod/package.json": `{
  "name": "@workspace/api-zod",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "dependencies": { "zod": "catalog:" }
}`,
  "lib/api-zod/tsconfig.json": `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}`,
  "lib/api-zod/src/index.ts": `// mock zod exports`,
  "scripts/package.json": `{
  "name": "@workspace/scripts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": { "hello": "tsx ./src/hello.ts", "typecheck": "tsc -p tsconfig.json --noEmit" },
  "devDependencies": { "@types/node": "catalog:", "tsx": "catalog:" }
}`,
  "scripts/tsconfig.json": `{
  "extends": "../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src", "types": ["node"] },
  "include": ["src"]
}`,
  "scripts/src/hello.ts": `console.log("Hello from @workspace/scripts");`
};

for (const [p, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}
console.log("Stage 2 files created.");
