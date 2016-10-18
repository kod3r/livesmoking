var SimplePeer = require('simple-peer')
var signalhub = require('signalhub')

var getUserMedia = navigator.getUserMedia
  || navigator.webkitGetUserMedia
  || navigator.mozGetUserMedia
  || navigator.msGetUserMedia;

// get video/voice stream
getUserMedia.call(navigator, {
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

hub.subscribe('my-channel')
  .on('data', function (message) {
    peer.signal(JSON.parse(message))
  })

function gotMedia (stream) {
  var peer = new SimplePeer({
    // ...opts,
    initiator: location.hash === '#1',
    stream: stream
  })
  // var peer2 = new SimplePeer({ ...opts })
  peer.once('connect', () => {
    console.log('connect')
  })

  peer.on('signal', function (data) {
    console.log('signal', data)
    hub.broadcast('my-channel', JSON.stringify(data))
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