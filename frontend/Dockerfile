FROM node:14.18 as build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build


FROM nginx as server

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

COPY --from=build /app/nginx.conf /etc/nginx/

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]