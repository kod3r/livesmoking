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
    this.users = {}
    this.streams = []
  }

  join(channel, username, onUsers, onData) {
    log('join', channel, username)
    this.username = username
    this.channel = channel
    this.onUsers = onUsers
    this.onData = onData
    this.signaler.join(channel, username)
  }

  getUsers() {
    return Object.keys(this.users)
      .filter(username => this.users[username].stream && this.users[username].stream.active)
      .map(username => this.users[username])
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
    peer.on('data', data => {
      this.onData(data)
    })
    peer.on('stream', peerStream => {
      this.users[username].stream = peerStream
      this.onUsers(this.getUsers())
    })
    return peer
  }

  onReceivedPeers(usernames) {
    log('onReceivedPeers', usernames)
    this.getLocalStream()
      .then(stream => {
        usernames.forEach(username => {
          if (!this.users[username]) {
            this.users[username] = {
              username
            }
          }
          this.users[username].peer = this.createPeer(username, stream, false)
        })
      })
  }

  onPeerAdded(username) {
    log('onPeerAdded', username)
    this.getLocalStream()
      .then(stream => {
        if (!this.users[username]) {
          this.users[username] = {
            username
          }
        }
        this.users[username].peer = this.createPeer(username, stream, true)
      })
  }

  onPeerRemoved(username) {
    log('onPeerRemoved', username)
    this.users[username].peer.destroy()
    delete this.users[username]
    this.onUsers(this.getUsers())
  }

  onSignal(data) {
    if ({}.hasOwnProperty.call(this.users, data.origin)) {
      this.users[data.origin].peer.signal(data.signal)
    }
  }

  getLocalStream() {
    if (!this.stream) {
      this.stream = window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      .catch(() => {
        alert('Could not get webcam / audio stream')
      })
    }
    return this.stream
  }
}
