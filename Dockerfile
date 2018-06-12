FROM node:8

WORKDIR /usr/app/src

# Load Source
COPY . .

# Install Bower
RUN npm install -g bower
# Install Gulp
RUN npm install -g gulp

# Install node_modules
RUN npm install

# Install bower dependencies
RUN bower --allow-root install

# Build Using Gulp
RUN gulp build

CMD node app.js
