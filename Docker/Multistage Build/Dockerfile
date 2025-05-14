#### Stage 1: Node.js-Basisimage zum Bauen der App
FROM node:lts AS build-stage
# Arbeitsverzeichnis der PWA im Container festlegen
WORKDIR /app
# Abhängigkeiten installieren "ci gleichbedeutend install", dabei gilt zu beachten, dass package.json und 
# package-lock.json kopiert werden, um den Build-Cache besser zu nutzen.
COPY package*.json ./
RUN npm ci
# Quellcode kopieren
COPY . .
# Anwendung in als Production bauen - Ergebnis wird in /app/www erstellt
RUN npm run build

#### Stage 2: Nginx als Webserver in einem Alpine-Linux OS
FROM nginx:alpine AS production-stage
# Nginx Konfigurationsdatei kopieren
COPY --from=build-stage /app/www /usr/share/nginx/html
# Standardmäßig verwendet Nginx Port 80
EXPOSE 80
# Nginx im Vordergrund laufen lassen, solange Nginx läuft
CMD ["nginx", "-g", "daemon off;"]
