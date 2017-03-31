import 'babel-polyfill'
import {main} from './lib/server/app'

if (process.env.NODE_ENV !== 'production') {
  require('source-map-support/register')
}

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason, reason && reason.stack)
})

main()
