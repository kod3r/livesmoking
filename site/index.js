import SimplePeer from 'simple-peer'
import signalhub from 'signalhub'
import React from 'react'
import ReactDOM from 'react-dom'
import './src/polyfills'

const noop = function () {}

const opts = {
  config: {
    iceServers: [
      {
        urls: 'turn:192.168.0.106'
      }
    ]
  }
}

var hub = signalhub('livesmoking', [
  'http://192.168.0.106:3001'
])

class App extends React.Component {
  state = {
    username: '',
    joint: false,
    peers: []
  }

  setUsername = (e) => {
    this.setState({ username: e.target.value })
  };

  join = () => {
    // get video/voice stream
    navigator.getUserMedia({
      video: true,
      audio: true
    }, stream => {
      var peer = new SimplePeer({
        ...opts,
        initiator: location.hash === '#1',
        stream: stream
      })

      hub.subscribe('smokers')
        .on('data', message => {
          const data = JSON.parse(message)
          if (data.userId !== this.state.username) {
            peer.signal(data.data)
          }
        })

      peer.on('signal', function (data) {
        console.log('signal', data)
        hub.broadcast('smokers', JSON.stringify({
          userId: this.state.username,
          data
        }))
      })

      peer.on('stream', function (stream) {
        const peers = this.state.peers
        this.state.peers.push(window.URL.createObjectURL(stream))
        this.setState({
          peers: peers
        })
      })
    }, noop)
    this.setState({
      joint: true
    })
  };

  render() {
    return <div>
      { this.state.joint && this.state.peers.map(src => <video src={src} autoplay />) }
      <input placeholder="Enter a username" onChange={this.setUsername} />
      <button onClick={this.join}>Go!</button>
    </div>
  }
}

ReactDOM.render(<App />, document.getElementById('app'))