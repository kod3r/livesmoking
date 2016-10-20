import './src/shim'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './src/components/App'
import style from './styles/style.scss'
import createHistory from 'history/createBrowserHistory'

const history = createHistory()

// add style
const styleEl = document.createElement('style')
styleEl.innerHTML = style
document.head.appendChild(styleEl)

// render app
const app = document.createElement('div')
document.body.appendChild(app)


class WithHistory extends React.Component {
  getChildContext() {
    return {
      history
    }
  }

  render() {
    return this.props.children
  }
}

WithHistory.childContextTypes = {
  history: React.PropTypes.object
}

ReactDOM.render((
  <WithHistory>
    <App />
  </WithHistory>
), app)