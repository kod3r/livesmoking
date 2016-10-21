import SimplePeer from 'simple-peer'
import debug from 'debug'
import wrtc, {
  getUserMedia,
  MediaStreamTrack
} from 'react-native-webrtc'

const log = (...args) => console.log(args)

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
      initiator,
      wrtc
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
        console.log('got local stream')
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
      this.stream = new Promise(resolve => {
        MediaStreamTrack.getSources(sourceInfos => {
          let videoSourceId
          for (let i = 0; i < sourceInfos.length; i++) {
            const sourceInfo = sourceInfos[i]
            if(sourceInfo.kind == 'video' && sourceInfo.facing == 'front') {
              videoSourceId = sourceInfo.id
            }
          }
          getUserMedia({
            audio: true,
            video: {
              optional: [
                { sourceId: videoSourceId }
              ]
            }
          }, resolve, (e) => {
            console.error('Error while retrieving stream', e)
          })
        })
      })
    }
    return this.stream
  }
}
