import SimplePeer from 'simple-peer'
import debug from 'debug'

const log = debug('signaler')

export default class MultiPeer {
  constructor(signaler, peerOpts) {
    this.signaler = signaler
    this.signaler.on('peers', this.onReceivedPeers.bind(this))
    this.signaler.on('join', this.onPeerAdded.bind(this))
    this.signaler.on('leave', this.onPeerRemoved.bind(this))
    this.signaler.on('signal', this.onSignal.bind(this))
    this.peerOpts = peerOpts
    this.peers = {}
    this.streams = []
  }

  join(channel, username, onStreams) {
    log('join', channel, username)
    this.username = username
    this.channel = channel
    this.onStreams = onStreams
    this.signaler.join(channel, username)
  }

  createPeer(username, stream, initiator) {
    const peer = new SimplePeer({
      ...this.peerOpts,
      stream,
      initiator
    })
    peer.on('signal', data => {
      this.signaler.signal('smoky', this.username, username, data)
    })
    peer.on('stream', remoteStream => {
      remoteStream.username = username // eslint-disable-line no-param-reassign
      this.streams.push(remoteStream)
      this.onStreams(this.streams)
    })
    return peer
  }

  onReceivedPeers(usernames) {
    log('onReceivedPeers', usernames)
    this.getLocalStream()
      .then(stream => {
        usernames.forEach(username => {
          this.peers[username] = this.createPeer(username, stream, false)
        })
      })
  }

  onPeerAdded(username) {
    log('onPeerAdded', username)
    this.getLocalStream()
      .then(stream => {
        this.peers[username] = this.createPeer(username, stream, true)
      })
  }

  onPeerRemoved(username) {
    log('onPeerRemoved', username)
    this.peers[username].destroy()
    delete this.peers[username]
    this.streams = this.streams.filter(stream => stream.username !== username)
    this.onStreams(this.streams)
  }

  onSignal(data) {
    if (this.peers[data.origin]) {
      this.peers[data.origin].signal(data.signal)
    }
  }

  getLocalStream() {
    if (!this.stream) {
      this.stream = new Promise(resolve => {
        window.navigator.getUserMedia({
          video: true,
          audio: true
        }, resolve, () => {
          alert('Could not get webcam / audio stream')
        })
      })
    }
    return this.stream
  }
}
