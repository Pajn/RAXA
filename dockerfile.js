const globby = require('globby');

console.log(`
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

RUN ./install.sh

COPY packages /app/packages
COPY run.sh .

ENV NODE_ENV=production
ENV RAXA_DATA_DIR=/config

RUN ./run.sh yarn build

CMD [ "node", "packages/raxa/build/index.js" ]
`)
