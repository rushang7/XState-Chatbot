FROM node:10

WORKDIR /usr/app
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080
CMD [ "node", "src/app.js" ]