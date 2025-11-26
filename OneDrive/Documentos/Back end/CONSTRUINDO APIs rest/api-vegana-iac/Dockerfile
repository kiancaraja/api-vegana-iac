# 1. Base: Usar a versão 20 do Node.js (LTS), versão Alpine (mais leve)
FROM node:20-alpine

# 2. Diretório de Trabalho: Define o local de execução dentro do contentor
WORKDIR /usr/src/app

# 3. Copiar ficheiros de dependência para cache. 
#    Isso garante que, se só o código mudar, o Docker não reinstala o npm modules.
COPY package.json package-lock.json ./

# 4. Instalar as dependências
RUN npm install

# 5. Copiar o restante do código do projeto para o contentor
COPY . .

# 6. Porta Exposta: Avisar o Docker que a aplicação correrá na porta 3000
EXPOSE 3000

# 7. Comando de Arranque: Executar o servidor em produção
CMD [ "npm", "start" ]