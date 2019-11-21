FROM node:10.17.0

WORKDIR /usr/app/src
# EXPOSE 3000

# Load Source
COPY . .

# Install Gulp
RUN npm install -g gulp

# Install node_modules
RUN npm install

# Build Using Gulp
RUN gulp build

CMD node app.js