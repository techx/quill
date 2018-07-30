FROM node:8

 # Create app directory
WORKDIR /usr/src/app

 # Install app dependencies
COPY package*.json ./

RUN npm install -g bower gulp
RUN npm install --only=production

 # Bundle app source
COPY . .

EXPOSE 8080
CMD [ "gulp", "server" ]
