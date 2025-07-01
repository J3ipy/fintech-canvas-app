# Conteúdo para /backend/Dockerfile (VERSÃO FINAL E CORRIGIDA)

# Estágio 1: Instalar dependências
FROM node:18-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Estágio 2: Construir a aplicação
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Estágio Final: Rodar a aplicação
FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app ./

# Expor a porta que a API vai usar
EXPOSE 8000

# --- A CORREÇÃO CRÍTICA ESTÁ AQUI ---
# Em vez de chamar o ts-node-dev diretamente,
# agora executamos o nosso script "dev" do package.json,
# que primeiro roda "prisma generate" e depois o servidor.
CMD ["npm", "run", "dev"]
