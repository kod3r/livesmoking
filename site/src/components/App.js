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
      streams: [],
      unmuted: []
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
    multiPeer.join('smoky', this.state.username, streams => {
      streams.map(stream => {
        stream.getTracks().map(track => {
          if (track.kind === 'audio' && this.state.unmuted.indexOf(stream.username) === -1) {
            track.enabled = false
          }
        })
      })
      this.setState({ streams })
    })
    this.setState({ joint: true })
  }

  toggleMute(stream) {
    stream.getTracks().map(track => {
      if (track.kind === 'audio') {
        if (track.enabled) {
          this.setState({ unmuted: this.state.unmuted.filter(username => username !== stream.username) })
        } else {
          this.state.unmuted.push(stream.username)
          this.setState({ unmuted: this.state.unmuted })
        }
        track.enabled = !track.enabled
      }
    })
  }

  render() {
    return <div className="stream">
      { this.state.joint ?
        this.state.streams.map((stream, i) =>
          <div
            key={i}
            className={'user' + (this.state.unmuted.indexOf(stream.username) > -1 ? ' unmuted' : '')}
            onClick={() => this.toggleMute(stream)}
          >
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
