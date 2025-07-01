# Conteúdo para /frontend/Dockerfile

# Estágio 1: Instalar dependências
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Estágio 2: Construir a aplicação para produção
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Estágio Final: Servir a aplicação
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["npm", "start"]
