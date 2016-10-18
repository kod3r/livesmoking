var SimplePeer = require('simple-peer')
var signalhub = require('signalhub')
require('./src/polyfills');


// get video/voice stream
navigator.getUserMedia({
  video: true,
  audio: true
}, gotMedia, function () {

})

const opts = {
  config: {
    iceServers: [
      {
        urls: 'turn:192.168.0.106'
      }
    ]
  }
}

var hub = signalhub('my-app-name', [
  'http://192.168.0.106:3001'
])

function gotMedia (stream) {
  var peer = new SimplePeer({
    // ...opts,
    initiator: location.hash === '#1',
    stream: stream
  })

  hub.subscribe('my-channel')
    .on('data', function (message) {
      const data = JSON.parse(message)
      if (data.userId !== location.hash) {
        peer.signal(data.data)
      }
    })

  // var peer2 = new SimplePeer({ ...opts })
  peer.once('connect', () => {
    console.log('connect')
  })

  peer.on('signal', function (data) {
    console.log('signal', data)
    hub.broadcast('my-channel', JSON.stringify({
      userId: location.hash,
      data
    }))
    // peer2.signal(data)
  })

  // peer2.on('signal', function (data) {
  //   console.log('p2 signal', data)
  //   peer.signal(data)
  // })

  peer.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video')
    video.src = window.URL.createObjectURL(stream)
    video.play()
  })
}
