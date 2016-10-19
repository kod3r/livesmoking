import SimplePeer from 'simple-peer'

export default class MultiPeer {
  constructor(signaler, peerOpts) {
    this.signaler = signaler
    this.signaler.on('peers', ::this.onReceivedPeers)
    this.signaler.on('join', ::this.onPeerAdded)
    this.signaler.on('leave', ::this.onPeerRemoved)
    this.signaler.on('signal', ::this.onSignal)
    this.peerOpts = peerOpts
    this.peers = {}
    this.streams = []
  }

  join(channel, username, onStreams) {
    this.username = username
    this.channel = channel
    this.onStreams = onStreams
    this.signaler.join(channel, username)
  }

  leave() {

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
    peer.on('stream', stream => {
      stream.username = username
      this.streams.push(stream)
      this.onStreams(this.streams)
    })
    return peer
  }

  onReceivedPeers(usernames) {
    this.getLocalStream()
      .then(stream => {
        usernames.forEach(username => {
          this.peers[username] = this.createPeer(username, stream, false)
        })
      })
  }

  onPeerAdded(username) {
    this.getLocalStream()
      .then(stream => {
        this.peers[username] = this.createPeer(username, stream, true)
      })
  }

  onPeerRemoved(username) {
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
        }, resolve, err => {
          alert('Could not get webcam / audio stream')
        })
      })
    }
    return this.stream
  }
}
