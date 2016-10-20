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
      case 'join':
        // check if the channel exists
        if (!connections[data.channel]) {
          return
        }

        // save the channel / username on the connection object
        // for easy disconnecting later
        ws._channelName = data.channel
        ws._userName = data.username

        // get the current users in the channel
        const others = Object.keys(connections[data.channel])

        // store the connection
        connections[data.channel][data.username] = ws

        log('sending peers event to ' + data.username + ' in channel ' + data.channel)
        const peersEvt = JSON.stringify(['peers', others])
        ws.send(peersEvt)

        // broadcast join event to others
        others.forEach(username => {
          const joinEvt = JSON.stringify(['join', data.username])
          log('sending join event to ' + username + ' in channel ' + data.channel)
          safeSend(data.channel, username, joinEvt)
        })
        break
      case 'signal':
        const payload = {
          origin: data.origin,
          signal: data.signal
        }
        const signalEvt = JSON.stringify(['signal', payload])
        log('sending signal event to ' + data.username + ' in channel ' + data.channel)
        safeSend(data.channel, data.username, signalEvt)
        break
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
    Object.keys(connections[channel]).forEach(activeUsername => {
      // log('sending leave event to ' + activeUsername)
      // const leaveEvt = JSON.stringify(['leave', username])
      // safeSend(channel, activeUsername, leaveEvt)
    })
  })
})
