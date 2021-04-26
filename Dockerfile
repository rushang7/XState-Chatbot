FROM node:15-alpine

WORKDIR /app

COPY . .

WORKDIR /app/react-app

RUN npm install

# set your port
ENV PORT 3000
# expose the port to outside world
#EXPOSE  8080

# start command as per package.json
CMD ["npm", "start"]