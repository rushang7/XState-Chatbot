FROM nikolaik/python-nodejs:python3.9-nodejs15

WORKDIR /app

COPY . .


WORKDIR /app/nodejs

RUN npm install

WORKDIR /app/react-app

RUN npm install

# set your port
ENV PORT 3000
# expose the port to outside world
EXPOSE  3000

# start command as per package.json
CMD ["npm", "start"]