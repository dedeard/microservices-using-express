FROM node:14.18

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY .. ./

RUN yarn build

EXPOSE 8008

CMD ["yarn", "start"]