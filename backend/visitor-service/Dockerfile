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

# Criar diretório para logs e uploads
RUN mkdir -p logs public/uploads

# Expor porta
EXPOSE 3006

# Comando para iniciar a aplicação
CMD ["node", "dist/app.js"]