FROM node:16-alpine

RUN mkdir -p /usr/src/backend
WORKDIR /usr/src/backend

COPY package.json .

RUN npm install

COPY index.js ./

EXPOSE 8080
CMD ["npm", "run", "start"]