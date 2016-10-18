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
        urls: 'turn:koenschmeets.nl:3478'
      }
    ]
  }
}

var hub = signalhub('livesmoking', [
  'https://livesmoking.koenschmeets.nl/signal'
])

class App extends React.Component {
  state = {
    username: '',
    joint: false,
    peers: []
  }

  setUsername = (e) => {
    if (e.keyCode === 13) {
      return this.join()
    }
    this.setState({ username: e.target.value })
  };

  join = () => {
    if (this.state.username === 'webkiit') {
      return alert('GTFO!!!')
    }

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
          if (data.username !== this.state.username) {
            console.log(data.username + ' joined')
            peer.signal(data.data)
          }
        })

      peer.on('signal', data => {
        console.log('signal', data)
        hub.broadcast('smokers', JSON.stringify({
          username: this.state.username,
          data
        }))
      })

      peer.on('stream', stream => {
        const peers = this.state.peers
        peers.push(window.URL.createObjectURL(stream))
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
      { this.state.joint ? this.state.peers.map(src => <video key={src} src={src} autoPlay />) : (
      <div>
        <input required placeholder="Enter a username" onKeyUp={this.setUsername} />
        <button onClick={this.join}>Go!</button>
      </div>
      ) }
    </div>
  }
}

ReactDOM.render(<App />, document.getElementById('app'))