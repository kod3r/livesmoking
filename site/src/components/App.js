import React from 'react'
import ConnectionSelector from './ConnectionSelector'
import Room from './Room'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.onJoinClicked = this.onJoinClicked.bind(this)
  }

  componentDidMount() {
    this.context.history.listen(() => {
      this.forceUpdate()
    })
  }

  onJoinClicked(connection) {
    if (connection.username === 'webkiit') {
      return alert('GTFO!!!')
    }
    const { room, username } = connection
    return this.context.history.push(`/room/${room}/${username}`)
  }

  renderPage() {
    const urlSegments = this.context.history.location.pathname.split('/')
    urlSegments.shift()
    if (urlSegments[0] === '') {
      return <ConnectionSelector onJoinClicked={this.onJoinClicked} />
    }
    switch (urlSegments.shift()) {
      case 'room': {
        const [room, username] = urlSegments
        if (!username) {
          return <ConnectionSelector room={room} onJoinClicked={this.onJoinClicked} />
        }
        if (room && username) {
          return <Room room={room} username={username} />
        }
        break
      }
      default:
        return null
    }
    return null
  }

  render() {
    return (
      <div className="app">
        { this.renderPage() }
      </div>
    )
  }
}

App.contextTypes = {
  history: React.PropTypes.object
}

export default App
