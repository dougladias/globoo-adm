FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3004

# Criar diretórios de uploads
RUN mkdir -p public/uploads/documents public/uploads/templates

CMD ["npm", "start"]