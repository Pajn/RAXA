import React from 'react'
import ReactDOM from 'react-dom'
import {App} from './app'
import './index.css'

if (process.env.NODE_ENV !== 'production') {
  window['Perf'] = require('react-addons-perf')
}

ReactDOM.render(<App />, document.getElementById('root'))
