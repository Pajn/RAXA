const fs = require('fs')
const globby = require('globby')

const isArm = process.argv.includes('--arm')

if (isArm) {
  if (!fs.existsSync('qemu-arm-static')) {
    fs.copyFileSync('/usr/bin/qemu-arm-static', 'qemu-arm-static')
  }
}

const baseImage = isArm ? 'arm32v7/node:8.9-slim' : 'node:8.9-alpine'

const setup = isArm ? 'COPY qemu-arm-static /usr/bin/qemu-arm-static' : ''

const subprojects = ['common', 'raxa', 'web']
const subprojectFiles = globby.sync([
  `packages/{${subprojects.join(',')}}/{package.json,yarn.lock}`,
])

console.log(`
FROM ${baseImage} as build
WORKDIR /app


COPY package.json .
COPY .yarnrc .
COPY yarn.lock .
COPY lerna.json .
COPY install.sh .
${subprojectFiles.map(path => `COPY ${path} /app/${path}`).join('\n')}

${setup}
RUN ./install.sh && yarn cache clean

${subprojects
  .map(project => `COPY packages/${project} /app/packages/${project}`)
  .join('\n')}
COPY run.sh .

ENV NODE_ENV=production
ENV RAXA_DATA_DIR=/config

RUN ./run.sh yarn build
RUN ./run.sh rm -rf node_modules

FROM ${baseImage}
WORKDIR /app

EXPOSE 8000
EXPOSE 9000

COPY package.json .
COPY .yarnrc .
COPY yarn.lock .
COPY lerna.json .
COPY install.sh .
${subprojectFiles.map(path => `COPY ${path} /app/${path}`).join('\n')}

${setup}
RUN SKIP_WEB=1 ./install.sh --concurrency=1 --production && yarn cache clean

COPY --from=build /app /app/

ENV NODE_ENV=production
ENV RAXA_DATA_DIR=/config

RUN RAXA_DATA_DIR=/default-config node packages/raxa/build/index.js --install-defaults

COPY docker-start.sh /app/start.sh
CMD [ "./start.sh" ]
`)
