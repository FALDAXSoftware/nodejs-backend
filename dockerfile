FROM pm291
WORKDIR /usr/share/nginx/html/finrax-nodeJs
COPY package*.json ./
RUN npm install
RUN npm rebuild
EXPOSE 8084
COPY . .
CMD [ "pm2-runtime", "start", "app.js" ]
