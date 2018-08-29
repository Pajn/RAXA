const fs = require('fs')

const flatMap = (array, fn) =>
  array.reduce((acc, elm) => [...acc, ...fn(elm)], [])

const isArm = process.argv.includes('--arm')

if (isArm) {
  if (!fs.existsSync('qemu-arm-static')) {
    fs.copyFileSync('/usr/bin/qemu-arm-static', 'qemu-arm-static')
  }
}

const baseImage = isArm ? 'arm32v7/node:8.9-slim' : 'node:8.9-alpine'

const setup = isArm
  ? 'COPY qemu-arm-static /usr/bin/qemu-arm-static'
  : 'RUN apk add --no-cache git'

const subprojectFiles = (...projects) =>
  flatMap(projects, project =>
    ['package.json', 'yarn.lock'].map(file => `packages/${project}/${file}`),
  )

console.log(`
FROM ${baseImage} as common
WORKDIR /app/common

COPY .yarnrc /app
COPY packages/common/yarn.lock /app/common/
COPY packages/common/package.json /app/common/

${setup}
RUN yarn

COPY packages/common /app/common

RUN NODE_ENV=production yarn build
RUN rm -rf node_modules

FROM common as raxa
WORKDIR /app/raxa
COPY packages/raxa/yarn.lock /app/raxa/
COPY packages/raxa/package.json /app/raxa/

RUN yarn

COPY packages/raxa /app/raxa

RUN NODE_ENV=production yarn build
RUN rm -rf node_modules

FROM common as web
WORKDIR /app/web
COPY packages/web/yarn.lock /app/web/
COPY packages/web/package.json /app/web/

RUN yarn

COPY packages/web /app/web

RUN NODE_ENV=production REACT_APP_BUILD_DATE=${
  process.env.BUILD_DATE
} REACT_APP_BUILD_HASH=${process.env.GIT_HASH} yarn build
RUN rm -rf node_modules

FROM ${baseImage}
WORKDIR /app

EXPOSE 8000
EXPOSE 9000

COPY .yarnrc .
${subprojectFiles('common', 'raxa', 'web')
  .map(path => `COPY ${path} /app/${path.replace('packages/', '')}`)
  .join('\n')}

${setup}
RUN cd /app/common && yarn --production && cd /app/raxa && yarn --production && yarn cache clean

COPY --from=raxa /app /app
COPY --from=web /app/web/build /app/web/build

ENV NODE_ENV=production
ENV RAXA_DATA_DIR=/config

RUN RAXA_DATA_DIR=/default-config node raxa/build/index.js --install-defaults

COPY docker-start.sh /app/start.sh
CMD [ "./start.sh" ]
`)
