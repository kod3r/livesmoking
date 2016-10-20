import React from 'react'

export default class ConnectionSelector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      channel: 'smoky', // @todo un-hardcode
      username: ''
    }
  }

  setUsername(e) {
    if (e.keyCode === 13) {
      return this.onJoinClicked()
    }
    this.setState({ username: e.target.value })
  }

  onJoinClicked() {
    this.props.onJoinClicked(this.state)
  }

  render() {
    return (
      <div className="select-username">
        <input
          className="input"
          required
          placeholder="Enter a username"
          onKeyUp={::this.setUsername} />
        { this.state.username && (
        <button
          className="button"
          onClick={::this.onJoinClicked}>
          Go!
        </button>
        ) }
      </div>
    )
  }
}
