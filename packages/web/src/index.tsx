import bugsnag from 'bugsnag-js/dist/bugsnag.min.js'
import React from 'react'
import ReactDOM from 'react-dom'
import {App} from './app'
import './index.css'

if (process.env.REACT_APP_BUGSNAG_API_KEY !== undefined) {
  const client = bugsnag(process.env.REACT_APP_BUGSNAG_API_KEY)
  ;(client.app as any).version = process.env.REACT_APP_VERSION
  client.metaData = (process.env.REACT_APP_INSTALLATION
    ? {user: {installation: process.env.REACT_APP_INSTALLATION}}
    : undefined) as any
}

ReactDOM.render(<App />, document.getElementById('root'))
