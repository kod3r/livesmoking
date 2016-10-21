import React, { Component } from 'react'

import ReactNative, {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  Dimensions
} from 'react-native'
import wrtc, {
  RTCView
} from 'react-native-webrtc'
import SimplePeer from 'simple-peer'
import Signaler from '../signaler'
import MultiPeer from '../multi-peer'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  streams: {
    flex: 1,
    paddingTop: 30,
    flexDirection: 'row'
  },
  user: {
    flex: 1,
    flexDirection: 'column',
  },
  username: {
    color: 'black',
    height: 30
  },
  stream: {
  },
  chat: {
    backgroundColor: 'black'
  },
  message: {
    color: 'white'
  },
  text: {
    height: 50,
    padding: 10,
    backgroundColor: 'white',
    color: 'black'
  }
})

const peerOpts = {
  config: {
    iceServers: [
      {
        urls: 'turn:148.251.12.99:3478'
      }
    ]
  }
}
const signaler = new Signaler('wss://livesmoking.koenschmeets.nl/signals')
const multiPeer = new MultiPeer(signaler, peerOpts)

class Room extends Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      users: [],
      text: ''
    }
    this.inputFocused = this.inputFocused.bind(this)
    this.inputBlurred = this.inputBlurred.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
  }

  componentDidMount() {
    const { room, username } = this.props
    multiPeer.join(room, username, users => {
      console.log('got users', users.length)
      this.setState({ users })
    }, data => {
      const message = JSON.parse(data.toString())
      this.state.messages.push(message)
      this.setState({ messages: this.state.messages })
    })
  }

  inputFocused() {
    let scrollResponder = this.refs.SCROLLVIEW.getScrollResponder()
    scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
      ReactNative.findNodeHandle(this.refs.TEXT),
      0,
      true
    )
  }

  inputBlurred() {
    this.refs.SCROLLVIEW.scrollTo({
      x: 0,
      y: 0,
      animated: true
    })
  }

  onKeyPress(e) {
    const { messages, users, text } = this.state
    if (e.nativeEvent.key === 'Enter') {
      const message = ['mobilevespa', text]
      messages.push(message)
      this.setState({
        messages: messages,
        text: ''
      })
      users.forEach(user => {
        user.peer.send(new Buffer(JSON.stringify(message)))
      })
    }
  }

  render() {
    const { messages, users, text } = this.state
    var { height, width } = Dimensions.get('window')
    return (
      <ScrollView
        ref="SCROLLVIEW"
        alwaysBounceVertical={false}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.streams} style={{height: ((height / 3) * 2), backgroundColor: 'grey'}}>
          { users.map(user => {
            return (
              <View
                style={[styles.user, {width: width / 2, height: 150}]}
                key={user.username}
              >
                <Text style={styles.username}>{ user.username }</Text>
                <RTCView
                  streamURL={user.stream.toURL()}
                  style={[styles.stream, {width: width / 2, height: 120}]}
                />
              </View>
            )
          }) }
        </ScrollView>
        <View style={[styles.chat, {height: height / 3}]}>
          <ScrollView style={{height: (height / 3) - 50}}>
          { messages.map((message, i) => {
            const [username, text] = message
            return <Text style={styles.message} key={i}>{ username + ' says: ' + text }</Text>
          })}
          </ScrollView>
          <TextInput
            ref="TEXT"
            style={styles.text}
            onFocus={this.inputFocused}
            onBlur={this.inputBlurred}
            onKeyPress={this.onKeyPress}
            onChangeText={(text) => this.setState({ text })}
            value={text}
            placeholder="Type a message..."
          />
        </View>
      </ScrollView>
    )
  }
}

export default Room