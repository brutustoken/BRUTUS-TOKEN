# Dockerfile para producción con Vite
FROM node:20-alpine AS build
WORKDIR /app

# Copiar package.json y package-lock.json primero para aprovechar cache
COPY client/package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY client/ .

COPY .env* .

RUN ls -a
# Construir la aplicación
RUN npm run build

# Etapa 2: Servidor de producción (Runtime)
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve
COPY --from=build /app/docs ./build

EXPOSE 3000

# Arrancar la app
CMD ["serve", "-s", "build", "-l", "3000"]
