FROM node:14.18

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE ${PORT:-4000}

CMD ["yarn", "start"]