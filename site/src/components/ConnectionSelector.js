import React from 'react'

class ConnectionSelector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      room: this.props.room || 'smoky', // @todo un-hardcode
      username: ''
    }
    this.onJoinClicked = this.onJoinClicked.bind(this)
    this.setUsername = this.setUsername.bind(this)
  }

  onJoinClicked() {
    this.props.onJoinClicked(this.state)
  }

  setUsername(e) {
    if (e.keyCode === 13) {
      return this.onJoinClicked()
    }
    return this.setState({ username: e.target.value })
  }

  render() {
    return (
      <div className="connection-selector">
        <input
          className="username"
          required
          autoFocus
          placeholder="Enter a username"
          onKeyUp={this.setUsername}
        />
        { this.state.username && (
        <button
          className="go"
          onClick={this.onJoinClicked}
        >
          Go! / ⏎
        </button>
        ) }
      </div>
    )
  }
}

ConnectionSelector.propTypes = {
  room: React.PropTypes.string,
  onJoinClicked: React.PropTypes.func
}

export default ConnectionSelector
