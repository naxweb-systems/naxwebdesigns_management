import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'config-plugin',
      closeBundle() {
        // Replace placeholder with actual env value in config.json
        const configPath = path.resolve(__dirname, 'dist/config.json');
        if (fs.existsSync(configPath)) {
          let configContent = fs.readFileSync(configPath, 'utf8');
          configContent = configContent.replace(
            '%VITE_APP_PASSCODE%',
            process.env.VITE_APP_PASSCODE || ''
          );
          fs.writeFileSync(configPath, configContent);
        }
      }
    }
  ],
})
