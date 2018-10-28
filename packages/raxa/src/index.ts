import '@babel/polyfill'
import bugsnag from 'bugsnag'
import 'make-promises-safe'
import {installDefaults, main} from './lib/server/app'

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

if (process.argv.includes('--install-defaults')) {
  installDefaults()
} else {
  main()
}
