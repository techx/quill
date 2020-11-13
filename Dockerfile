FROM node:10.16.0-buster


WORKDIR /usr/app/src
EXPOSE 3000

# Load Source
COPY . .

# Install node_modules
RUN npm install
RUN ./node_modules/.bin/gulp build

CMD node app.js
