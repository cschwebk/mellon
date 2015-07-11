var React = require('react'),
    MessageActionCreators = require('../actions/MessageActionCreators');

var KEYCODES = {
    ArrowUp: 38,
    ArrowDown: 40,
    No1: 97,
    No2: 98,
    No4: 100,
    No6: 102,
    No8: 104,
    No9: 105
}

var Input = React.createClass({
    history: [],
    historyPointer: 0,
    getInitialState: function() {
        return {
            inputValue: ''
        };
    },
    render: function() {
        return (
            <div className='inputContainer'>
                <input
                    type='text'
                    ref='input'
                    onKeyPress={this.handleKeyPress}
                    onKeyUp={this.handleKeyUp}
                    onChange={this.handleChange}
                    value={this.state.inputValue}
                />
            </div>
        );
    },
    handleChange: function(e) {
        this.setState({
            inputValue: e.target.value
        });
    },
    handleKeyUp: function(e) {
        switch (e.keyCode) {
            case KEYCODES.ArrowUp:
                if (this.historyPointer > 0) {
                    this.historyPointer -= 1;
                    this.setState({
                       inputValue: this.history[this.historyPointer]
                    });
                }
                break;
            case KEYCODES.ArrowDown:
                if ((this.historyPointer + 1) <= this.history.length) {
                    this.historyPointer += 1;
                    this.setState({
                       inputValue: this.history[this.historyPointer]
                    });
                } else {
                    this.setState({
                        inputValue: ''
                    });
                }
                break;
            case KEYCODES.No1:
                this.sendMessage('down');
                break;
            case KEYCODES.No2:
                this.sendMessage('south');
                break;
            case KEYCODES.No4:
                this.sendMessage('west');
                break;
            case KEYCODES.No6:
                this.sendMessage('east');
                break;
            case KEYCODES.No8:
                this.sendMessage('north');
                break;
            case KEYCODES.No9:
                this.sendMessage('up');
                break;
        }
    },
    handleKeyPress: function(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                MessageActionCreators.sendMessage(e.target.value)
                this.history.push(e.target.value);
                this.historyPointer = this.history.length;
                this.setState({
                    inputValue: ''
                });
            break;
        }
    },
    sendMessage: function(message) {
        MessageActionCreators.sendMessage(message);
        this.history.push(message);
        this.historyPointer = this.history.length;
        this.setState({
            inputValue: ''
        });
    }
});

module.exports = Input;