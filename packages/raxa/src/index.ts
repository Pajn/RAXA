import 'babel-polyfill'
import bugsnag from 'bugsnag'
import {main} from './lib/server/app'

if (process.env.BUGSNAG_API_KEY !== undefined) {
  const metaData = process.env.INSTALLATION
    ? {user: {installation: process.env.INSTALLATION}}
    : undefined

  bugsnag.register(process.env.BUGSNAG_API_KEY, {
    appVersion: process.env.APP_VERSION,
    metaData,
  })
}

if (process.env.NODE_ENV !== 'production') {
  require('source-map-support/register')
}

process.on('unhandledRejection', (reason, p) => {
  console.error(
    'Unhandled Rejection at: Promise ',
    p,
    ' reason: ',
    reason,
    reason && reason.stack,
  )
})

main()
