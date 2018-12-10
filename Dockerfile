FROM pm291
WORKDIR /usr/share/nginx/html/faldax-nodejs
COPY package*.json ./
RUN npm install
RUN npm rebuild
EXPOSE 8084
COPY . .
CMD [ "sails", "lift"]
