/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Server, Copy, Check, Terminal, ExternalLink, X, FileCode } from 'lucide-react';

interface DockerConfigGuidesProps {
  onClose: () => void;
}

export default function DockerConfigGuides({ onClose }: DockerConfigGuidesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const configs = [
    {
      title: 'Dockerfile',
      filename: 'Dockerfile',
      language: 'dockerfile',
      code: `# Multi-stage Docker build a kliensoldali SPA optimális kiszolgálásához
FROM node:20-alpine AS build

WORKDIR /app

# Függőségek másolása és telepítése
COPY package*.json ./
RUN npm ci

# Forráskód másolása és fordítása
COPY . .
RUN npm run build

# Gyors, stabil Nginx webszerver a statikus állományok kiszolgálására
FROM nginx:1.25-alpine AS production

# Gyári nginx struktúra felülírása a React routing támogatásához
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`
    },
    {
      title: 'Docker Compose',
      filename: 'docker-compose.yml',
      language: 'yaml',
      code: `version: '3.8'

services:
  docureview:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: docureview_app
    ports:
      - "3000:80"  # A 3000-as porton lesz elérhető a VPS-en kívülről
    restart: always
    environment:
      - NODE_ENV=production
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"`
    },
    {
      title: 'Nginx Konfiguráció',
      filename: 'nginx.conf',
      language: 'nginx',
      code: `server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        # React és egyéb SPA-k esetében elengedhetetlen a fallback router
        try_files $uri $uri/ /index.html;
    }

    # Statikus erőforrások gyorsítótárazása az optimális sebességért
    location ~* \\.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|otf|ttf|svg|map)$ {
        root /usr/share/nginx/html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}`
    }
  ];

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-fade-in" id="docker-guide-modal">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 text-white rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold">VPS Docker Compose Telepítési Útmutató</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
              <Terminal className="w-4 h-4 text-slate-600" />
              Szerver Indítási Lépések a VPS-en
            </h4>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5">
              <li>Hozza létre a lenti három fájlt (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">Dockerfile</code>, <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">docker-compose.yml</code>, <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">nginx.conf</code>) a projekt gyökérkönyvtárában.</li>
              <li>Töltse fel a teljes forráskódot a VPS szerverre (pl. Git-tel vagy SCP-vel).</li>
              <li>A projekt mappájában futtassa a következő parancsot az indításhoz kedvező háttér üzemmódban:</li>
            </ol>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs mt-3 select-all flex justify-between items-center">
              <span>docker compose up --build -d</span>
              <span className="text-[10px] text-slate-500 font-sans font-medium uppercase bg-slate-800 px-1.5 py-0.5 rounded">Terminál parancs</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
              • A Docker image lefordul, és az alkalmazás elérhetővé válik a <strong className="text-slate-700">http://&lt;VPS_IP&gt;:3000</strong> címen!
            </p>
          </div>

          {/* Config Files Slideshow/Visual blocks */}
          <div className="space-y-6">
            {configs.map((cfg, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs" id={`config-block-${idx}`}>
                <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold font-mono text-slate-700">{cfg.filename}</span>
                    <span className="text-[10px] text-slate-500 font-semibold bg-white border border-slate-200 px-1.5 py-0.2 rounded-full">
                      {cfg.title}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(cfg.code, idx)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-white border hover:border-slate-300 rounded-md transition-all font-medium cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Másolva!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kód másolása</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 p-4 overflow-x-auto max-h-60">
                  <pre className="text-xs font-mono text-slate-150 leading-relaxed text-left whitespace-pre">{cfg.code}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>Készült a biztonságos VPS Docker Deploy elvek alapján.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
