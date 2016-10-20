import React from 'react'
import ConnectionSelector from './ConnectionSelector'
import Channel from './Channel'

export default class App extends React.Component {
  state = {};

  onJoinClicked(connection) {
    if (connection.username === 'webkiit') {
      return alert('GTFO!!!')
    }
    this.setState(connection)
  }

  render() {
    return <div className="stream">
      { this.state.channel ? (
        <Channel
          channel={this.state.channel}
          username={this.state.username} />
      ) : (
        <ConnectionSelector
          onJoinClicked={::this.onJoinClicked} />
      ) }
    </div>
  }
}
