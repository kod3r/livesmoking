import debug from 'debug'
const log = debug('signaler')

export default class Signaler {
  constructor(url) {
    this.url = url
    this.cbs = {}
  }

  getWS() {
    if (!this.ws) {
      this.ws = new Promise(resolve => {
        const ws = new WebSocket(this.url)
        ws.onmessage = (e) => {
          const data = JSON.parse(e.data)
          const [event, payload] = data
          log('event', event, payload)
          this.cbs[event](payload)
        }
        ws.onopen = () => resolve(ws)
      })
    }
    return this.ws
  }

  on(topic, cb) {
    this.cbs[topic] = cb
  }

  send(action, payload) {
    log('action', action, payload)
    return this.getWS()
      .then(ws =>
        ws.send(JSON.stringify([action, payload]))
      )
  }

  join(channel, username) {
    return this.send('join', {
      channel,
      username
    })
  }

  signal(channel, origin, username, signal) {
    return this.send('signal', {
      channel,
      origin,
      username,
      signal
    })
  }
}
