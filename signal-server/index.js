var WebSocketServer = require('uws').Server
var wss = new WebSocketServer({
  port: process.env.SIGNAL_SERVER_PORT || 3001
})

const connections = {
  coolrunning: {},
  smoky: {}
}

wss.on('connection', ws => {
  console.log('new connection')
  ws.on('message', message => {
    const [action, data] = JSON.parse(message)
    switch (action) {
      case 'join':
        // save the channel / username on the connection object
        // for easy disconnecting later
        ws._channelName = data.channel
        ws._userName = data.username
        // store the connection
        connections[data.channel][data.username] = ws
        // "reply" with the peers
        const filteredUsernames = Object.keys(connections[data.channel])
          .filter(username => username !== data.username)
        const peersEvt = JSON.stringify(['peers', filteredUsernames])
        ws.send(peersEvt)
        // broadcast join event to others
        Object.keys(connections[data.channel]).forEach(username => {
          if (username === data.username) {
            return
          }
          const joinEvt = JSON.stringify(['join', data.username])
          connections[data.channel][username].send(joinEvt)
        })
        break
      case 'signal':
        const payload = {
          origin: data.origin,
          signal: data.signal
        }
        const signalEvt = JSON.stringify(['signal', payload])
        connections[data.channel][data.username].send(signalEvt)
        break
      // case 'broadcast':
      //   Object.keys(connections[data.channel]).forEach(username => {
      //     if (username === data.username) {
      //       return
      //     }
      //     const event = JSON.stringify(['broadcast', {
      //       username: data.username,
      //       signal: data.payload
      //     }])
      //     const ws = connections[data.channel][username]
      //     ws.send(event)
      //   })
      //   break
    }
  })
  ws.on('close', () => {
    console.log('closing connection')
    const channelName = ws._channelName
    const userName = ws._userName
    delete connections[channelName][userName]
  })
})
