import React from 'react'
import Signaler from '../signaler'
import MultiPeer from '../multi-peer'

const peerOpts = {
  config: {
    iceServers: [
      {
        urls: 'turn:148.251.12.99:3478'
      }
    ]
  }
}

// const signaler = new Signaler('ws://localhost/signals')
const signaler = new Signaler('wss://livesmoking.koenschmeets.nl/signals')
const multiPeer = new MultiPeer(signaler, peerOpts)

export default class App extends React.Component {
  constructor(props) {
    super(props)
  
    this.state = {
      username: '',
      joint: false,
      streams: []
    }
  }

  setUsername(e) {
    if (e.keyCode === 13) {
      return this.onJoinClicked()
    }
    this.setState({ username: e.target.value })
  }

  onJoinClicked() {
    if (this.state.username === 'webkiit') {
      return alert('GTFO!!!')
    }
    multiPeer.join('smoky', this.state.username, streams =>
      this.setState({ streams })
    )
    this.setState({ joint: true })
  }

  render() {
    return <div>
      { this.state.joint ?
        this.state.streams.map((stream, i) =>
          <video
            key={i}
            style={{height: 200, width: 200}}
            src={window.URL.createObjectURL(stream)}
            autoPlay />
      ) : (
      <div>
        <input required placeholder="Enter a username" onKeyUp={::this.setUsername} />
        { this.state.username && (
        <button onClick={::this.onJoinClicked}>
          Go!
        </button>
        ) }
      </div>
      ) }
    </div>
  }
}
