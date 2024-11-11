FROM node:18

WORKDIR /app

COPY package*.json .

COPY . .

RUN npm install

RUN mkdir -p var/log

EXPOSE 5005

CMD ["npm", "run", "start:dev"]
