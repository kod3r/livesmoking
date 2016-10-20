import React from 'react'

class Chat extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      text: '',
    }
    this.setText = this.setText.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
  }

  componentDidUpdate() {
    this.refs.messages.scrollTop = this.refs.messages.scrollHeight
  }

  setText(e) {
    if (e.keyCode === 13) {
      return this.sendMessage(e.target.value)
    }
    return this.setState({
      text: e.target.value
    })
  }

  sendMessage() {
    if (this.state.text.length === 0) {
      return alert('Please enter some text first...')
    }
    this.props.sendMessage(this.state.text)
    this.refs.input.value = ''
    this.setState({ text: '' })
  }

  render() {
    return (
      <div className="chat">
        <h2 className="title">Chat with the others...</h2>
        <div ref="messages" className="message-list">
        { this.props.messages.map((message, i) => {
          const [username, text] = message
          return (
            <div key={i} className={`message${(i % 2 === 0 ? ' odd' : '')}`}>
              <span className="username">{username}:</span>
              <span className="text">{text}</span>
            </div>
          )
        }) }
        </div>
        <div className="composer">
          <input
            ref="input"
            autoFocus
            className="text"
            onKeyUp={this.setText}
            placeholder="Type a message..."
          />
          <button
            className="send"
            onClick={this.sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    )
  }
}

Chat.propTypes = {
  messages: React.PropTypes.array,
  sendMessage: React.PropTypes.func
}

export default Chat
