var SimplePeer = require('simple-peer')

// get video/voice stream
navigator.getUserMedia({ video: true, audio: true }, gotMedia, function () {})

const opts = {
  config: {
    iceServers: [
      {
        urls: 'turn:192.168.99.100'
      }
    ]
  }
}

function gotMedia (stream) {
  console.log({ ...opts, initiator: true, stream: stream })
  var peer1 = new SimplePeer({ ...opts, initiator: location.hash === '#1', stream: stream })
  // var peer2 = new SimplePeer({ ...opts })

  peer1.on('signal', function (data) {
    console.log('p1 signal', data)
    // peer2.signal(data)
  })

  // peer2.on('signal', function (data) {
  //   console.log('p2 signal', data)
  //   peer1.signal(data)
  // })

  peer1.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video')
    video.src = window.URL.createObjectURL(stream)
    video.play()
  })
}