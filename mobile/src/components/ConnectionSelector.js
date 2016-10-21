import React, { Component } from 'react'

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight
} from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  username: {
    borderColor: 'grey',
    borderWidth: 2,
    height: 40,
    margin: 20,
    marginTop: 200,
    padding: 10
  },
  go: {
    backgroundColor: 'green',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 20,
    marginRight: 20
  },
  goLabel: {
    color: 'white'
  }
})

class ConnectionSelector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      room: this.props.room || 'smoky', // @todo un-hardcode
      username: ''
    }
    this.onJoinClicked = this.onJoinClicked.bind(this)
    this.setUsername = this.setUsername.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
  }

  onJoinClicked() {
    this.props.onJoinClicked(this.state)
  }

  setUsername(username) {
    this.setState({ username })
  }

  onKeyPress(e) {
    if (e.nativeEvent.key === 'Enter') {
      this.onJoinClicked()
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.username}
          placeholder="Enter a username"
          onChangeText={this.setUsername}
          onKeyPress={this.onKeyPress}
        />
        { this.state.username ? (
        <TouchableHighlight
          onPress={this.onJoinClicked}
          style={styles.go}
        >
          <Text style={styles.goLabel}>Go!</Text>
        </TouchableHighlight>
        ) : null }
      </View>
    )
  }
}

ConnectionSelector.propTypes = {
  room: React.PropTypes.string,
  onJoinClicked: React.PropTypes.func
}

export default ConnectionSelector
