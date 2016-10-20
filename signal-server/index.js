const WebSocketServer = require('uws').Server
const debug = require('debug')
const log = debug('signal-server')

const wss = new WebSocketServer({
  port: process.env.SIGNAL_SERVER_PORT || 3001
})

const connections = {
  coolrunning: {},
  smoky: {}
}

function safeSend(channel, username, event) {
  if (connections[channel] && connections[channel][username]) {
    connections[channel][username].send(event)
  }
}

wss.on('connection', ws => {
  log('new connection')
  ws.on('message', message => {
    const [action, data] = JSON.parse(message)
    switch (action) {
      case 'join': {
        const [channel, username] = data

        // check if the channel exists
        if (!connections[channel]) {
          return
        }

        // save the channel / username on the connection object
        // for easy disconnecting later
        ws._channelName = channel
        ws._userName = username

        // get the current users in the channel
        const others = Object.keys(connections[channel])

        // store the connection
        connections[channel][username] = ws

        log(`sending peers event to ${username} in channel ${channel}`)
        const peersEvt = JSON.stringify(['peers', others])
        ws.send(peersEvt)

        // broadcast join event to others
        others.forEach(other => {
          const joinEvt = JSON.stringify(['join', username])
          log(`sending join event to ${other} in channel ${channel}`)
          safeSend(channel, other, joinEvt)
        })
        break
      }
      case 'signal': {
        const [channel, origin, username, signal] = data
        const payload = {
          channel,
          origin,
          signal
        }
        const signalEvt = JSON.stringify(['signal', payload])
        log(`sending signal event from ${origin} to ${username} in channel ${channel}`)
        safeSend(channel, username, signalEvt)
        break
      }
    }
  })
  ws.on('close', () => {
    const channel = ws._channelName
    const username = ws._userName
    if (!connections[channel] || !connections[channel][username]) {
      log(`coulnd't find channel ${channel} or username ${username}`)
      return
    }
    delete connections[channel][username]
    // send leave event to other users
    Object.keys(connections[channel]).forEach(other => {
      log('sending leave event to ' + other)
      const leaveEvt = JSON.stringify(['leave', username])
      safeSend(channel, other, leaveEvt)
    })
  })
})
