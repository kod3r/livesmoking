import React from 'react'
import Signaler from '../signaler'
import MultiPeer from '../multi-peer'
import Chat from './Chat'

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
      users: [],
      unmuted: [],
      messages: []
    }
    this.sendMessage = this.sendMessage.bind(this)
  }

  componentDidMount() {
    const { room, username } = this.props
    multiPeer.join(room, username, users => {
      users.forEach(user => {
        user.stream.getTracks().forEach(track => {
          if (track.kind === 'audio' && this.state.unmuted.indexOf(user.username) === -1) {
            track.enabled = false // eslint-disable-line no-param-reassign
          }
        })
      })
      this.setState({ users })
    }, data => {
      const message = JSON.parse(data.toString())
      this.state.messages.push(message)
      this.setState({ messages: this.state.messages })
    })
  }

  toggleMute(user) {
    user.stream.getTracks().forEach(track => {
      if (track.kind === 'audio') {
        if (track.enabled) {
          this.setState({
            unmuted: this.state.unmuted
              .filter(unmutedUsername => unmutedUsername !== user.username)
          })
        } else {
          this.state.unmuted.push(user.username)
          this.setState({ unmuted: this.state.unmuted })
        }
        track.enabled = !track.enabled // eslint-disable-line no-param-reassign
      }
    })
  }

  sendMessage(text) {
    const message = [this.props.username, text]
    this.state.messages.push(message)
    this.setState({ messages: this.state.messages })
    this.state.users.forEach(user => {
      user.peer.send(new Buffer(JSON.stringify(message)))
    })
  }

  render() {
    const { room } = this.props
    const users = this.state.users
    if (users.length === 0) {
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
        <div className="users">
          { users.map((user, i) => {
            return (
              <div
                key={i}
                className={`user${(this.state.unmuted.indexOf(user.username) > -1 ? ' unmuted' : '')}`}
                onClick={() => this.toggleMute(user)}
              >
                <h2 className="username">{ user.username }</h2>
                <video
                  className="video"
                  src={window.URL.createObjectURL(user.stream)}
                  autoPlay
                />
              </div>
            )
          } ) }
        </div>
        <Chat
          messages={this.state.messages}
          sendMessage={this.sendMessage}
        />
      </div>
    )
  }
}

Room.propTypes = {
  room: React.PropTypes.string,
  username: React.PropTypes.string
}

export default Room
