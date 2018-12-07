FROM node:8.9.4
WORKDIR /faldax-app
COPY . /faldax-app
RUN npm install
RUN npm install -g sails
EXPOSE 8084
