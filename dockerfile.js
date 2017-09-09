const globby = require('globby');

console.log(`
FROM node:8-alpine as build
WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY lerna.json .
COPY install.sh .
${globby.sync(['packages/*/{package.json,yarn.lock}']).map(path =>
  `COPY ${path} /app/${path}`
).join('\n')}

RUN ./install.sh && yarn cache clean

COPY packages /app/packages
COPY run.sh .

ENV NODE_ENV=production
ENV RAXA_DATA_DIR=/config

RUN ./run.sh yarn build
RUN ./run.sh rm -rf node_modules

FROM node:8-alpine
WORKDIR /app

EXPOSE 8000
EXPOSE 9000

COPY package.json .
COPY yarn.lock .
COPY lerna.json .
COPY install.sh .
${globby.sync(['packages/*/{package.json,yarn.lock}']).map(path =>
  `COPY ${path} /app/${path}`
).join('\n')}

RUN SKIP_WEB=1 ./install.sh --production && yarn cache clean

COPY --from=build /app /app/

ENV NODE_ENV=production
ENV RAXA_DATA_DIR=/config

CMD [ "node", "packages/raxa/build/index.js" ]
`)
