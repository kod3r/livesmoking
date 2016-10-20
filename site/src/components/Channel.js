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

export default class Channel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    	streams: [],
    	unmuted: []
    }
  }

  componentDidMount() {
  	const { channel, username } = this.props
  	multiPeer.join(channel, username, streams => {
  	  streams.map(stream => {
  	    stream.getTracks().map(track => {
  	      if (track.kind === 'audio' && this.state.unmuted.indexOf(stream.username) === -1) {
  	        track.enabled = false
  	      }
  	    })
  	  })
  	  this.setState({ streams })
  	})
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
    return (
      <div className="channel">
      	{ this.state.streams.map((stream, i) =>
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
        ) }
      </div>
    )
  }
}
