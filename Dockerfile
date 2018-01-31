FROM node:7.4
RUN apt-get update -qq && apt-get install -y build-essential

ENV APP_HOME /quill/
RUN mkdir $APP_HOME
WORKDIR $APP_HOME
ENV NODE_PATH /quill/node_modules/

COPY . .
RUN npm install
RUN npm install -g gulp
