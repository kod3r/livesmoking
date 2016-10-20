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

class Room extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      streams: [],
      unmuted: []
    }
  }

  componentDidMount() {
    const { room, username } = this.props
    multiPeer.join(room, username, streams => {
      streams.forEach(stream => {
        stream.getTracks().forEach(track => {
          if (track.kind === 'audio' && this.state.unmuted.indexOf(stream.username) === -1) {
            track.enabled = false // eslint-disable-line no-param-reassign
          }
        })
      })
      this.setState({ streams })
    })
  }

  toggleMute(stream) {
    stream.getTracks().forEach(track => {
      if (track.kind === 'audio') {
        if (track.enabled) {
          this.setState({
            unmuted: this.state.unmuted
              .filter(username => username !== stream.username)
          })
        } else {
          this.state.unmuted.push(stream.username)
          this.setState({ unmuted: this.state.unmuted })
        }
        track.enabled = !track.enabled // eslint-disable-line no-param-reassign
      }
    })
  }

  render() {
    const { room } = this.props
    const streams = this.state.streams
    if (streams.length === 0) {
      return (
        <div className="room">
          <div className="empty">
            <h1>No smokers in this room...</h1>
            <p>
              {'It\'s awfully quiet in here,'}
              invite some others to have a virtual smoke with you by sharing the link below...<br />
              <br />
              <span className="link">
                {`${window.location.origin}/room/${room}`}
              </span>
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="room">
        <div className="streams">
          { streams.map((stream, i) =>
            <a
              href="#toggle-mute"
              key={i}
              className={`user${(this.state.unmuted.indexOf(stream.username) > -1 ? ' unmuted' : '')}`}
              onClick={() => this.toggleMute(stream)}
            >
              <h2 className="username">{ stream.username }</h2>
              <video
                className="video"
                src={window.URL.createObjectURL(stream)}
                autoPlay
              />
            </a>
          )}
        </div>
        <div className="chat">
          Chat with the others...
        </div>
      </div>
    )
  }
}

Room.propTypes = {
  room: React.PropTypes.string,
  username: React.PropTypes.string
}

export default Room
