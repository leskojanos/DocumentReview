# Multi-stage Docker build a kliensoldali SPA optimális kiszolgálásához
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

CMD ["nginx", "-g", "daemon off;"]
