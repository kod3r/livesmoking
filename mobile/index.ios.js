/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import './shim'
import React, { Component } from 'react'
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native'
import ConnectionSelector from './src/components/ConnectionSelector'
import Room from './src/components/Room'

export default class LiveSmoking extends Component {
  constructor(props) {
    super(props)
    this.state = {
      room: 'smoky',
      username: 'vespakoen'
    }
    this.onJoinClicked = this.onJoinClicked.bind(this)
  }

  onJoinClicked(connection) {
    this.setState(connection)
  }

  render() {
    const { room, username } = this.state
    if (room) {
      return <Room room={room} username={username} />
    }
    return <ConnectionSelector onJoinClicked={this.onJoinClicked} />
  }
}

AppRegistry.registerComponent('LiveSmoking', () => LiveSmoking)
