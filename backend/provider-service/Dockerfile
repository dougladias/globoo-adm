FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Criar diretório para logs
RUN mkdir -p logs

# Expor porta
EXPOSE 3007

# Comando para iniciar a aplicação
CMD ["node", "dist/app.js"]