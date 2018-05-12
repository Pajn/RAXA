import React from 'react'
import ReactDOM from 'react-dom'
import {App} from './app'
import './index.css'

if (process.env.REACT_APP_BUGSNAG_API_KEY !== undefined) {
  const s = document.createElement('script')
  s.async = true
  s.setAttribute(
    'src',
    'https://d2wy8f7a9ursnm.cloudfront.net/v4/bugsnag.min.js',
  )
  s.onload = () => {
    const bugsnagClient = (window as any).bugsnag(
      process.env.REACT_APP_BUGSNAG_API_KEY,
    )
    bugsnagClient.app.version = process.env.REACT_APP_VERSION
    bugsnagClient.metaData = process.env.REACT_APP_INSTALLATION
      ? {user: {installation: process.env.REACT_APP_INSTALLATION}}
      : undefined
    ;(window as any).bugsnagClient = bugsnagClient
  }
  document.body.appendChild(s)
}

ReactDOM.render(<App />, document.getElementById('root'))
