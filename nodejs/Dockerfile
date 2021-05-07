FROM node:15

WORKDIR /app

COPY . .

RUN npm install

# set your port
ENV PORT 8080
# expose the port to outside world
#EXPOSE  8080

# start command as per package.json
CMD ["npm", "start"]