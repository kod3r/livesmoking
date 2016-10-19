import './src/shim'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './src/components/App'
import style from './styles/style.scss'
const styleEl = document.createElement('style')
styleEl.innerHTML = style
document.head.appendChild(styleEl)
const app = document.createElement('div')
document.body.appendChild(app)
ReactDOM.render(<App />, app)
