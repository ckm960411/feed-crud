FROM node:19-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 80

ENTRYPOINT ["node", "dist/main.js"]
