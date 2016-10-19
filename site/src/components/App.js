import React from 'react'
import Signaler from '../signaler'
import MultiPeer from '../multi-peer'

const peerOpts = {
  config: {
    iceServers: [
      {
        urls: process.env.SITE_TURN_SERVER
      }
    ]
  }
}

const signaler = new Signaler(process.env.SITE_SIGNAL_SERVER)
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
    return <div className="stream">
      { this.state.joint ?
        this.state.streams.map((stream, i) =>
          <div key={i} className="user">
            <h2 className="username">{ stream.username }</h2>
            <video
              className="video"
              src={window.URL.createObjectURL(stream)}
              autoPlay />
          </div>
      ) : (
      <div className="select-username">
        <input
          className="input"
          required
          placeholder="Enter a username"
          onKeyUp={::this.setUsername} />
        { this.state.username && (
        <button
          className="button"
          onClick={::this.onJoinClicked}>
          Go!
        </button>
        ) }
      </div>
      ) }
    </div>
  }
}
