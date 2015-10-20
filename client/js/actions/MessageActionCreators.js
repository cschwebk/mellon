var MellonDispatcher = require('../dispatcher/MellonDispatcher'),
    MellonConstants = require('../constants/MellonConstants'),
    AliasStore = require('../stores/AliasStore.react'),
    TriggerStore = require('../stores/TriggerStore.react'),
    SubstitutionStore = require("../stores/SubstitutionStore.react"),
    utils = require('../utils/utils');

var ActionTypes = MellonConstants.ActionTypes,
    socket;

function validSocket() {
    return !!socket;
}

function setupConnection() {
    socket = io.connect();
    socket.on('message', function(message) {
        var triggers = TriggerStore.getAll(),
            substitutions = SubstitutionStore.getAll();

        Object.keys(triggers).forEach(function(trigger) {
            if (message.content.indexOf(trigger) > -1) {
                sendMessage(triggers[trigger]);
            }
        });

        if (message.content.match('#client')) {
            MellonDispatcher.dispatch({
                type: ActionTypes.UPDATE_CHARACTER,
                character: message.content
            });
        } else {
            Object.keys(substitutions).forEach(function(substitution) {
                if (message.content.indexOf(substitution) > -1) {
                    message.content = message.content.replace(new RegExp(substitution, 'g'), substitutions[substitution]);
                }
            });

            receiveMessage(message);
        }
    });

    socket.on('update', function(updatedState) {
        switch(updatedState.type) {
            case 'app':
                MellonDispatcher.dispatch({
                    type: ActionTypes.UPDATE_STATE,
                    state: updatedState
                });
            break;
        }
    });
}

function sendCommand(command) {
    if (!validSocket()) {
        setupConnection();
    }

    if (typeof command === 'string') {
        return socket.emit('command', {
            command: command,
            payload: null
        });
    }

    socket.emit('command', command);
}

function sendMessage(content) {
    if (!validSocket()) {
        receiveMessage({
            type: 'system',
            content: 'Remote connection not established'
        });
        return;
    }

    // receiveMessage({
    //     type: 'echo',
    //     content: content + '\r\n'
    // });

    content = replaceAlias(content);

    var splitMessage = content.split(';');

    splitMessage.forEach(function(message) {
        var repeatedCommand = message.match(/^#(\d+) (.+)/);
        if (repeatedCommand) {
            var iterations = repeatedCommand[1],
                command = repeatedCommand[2];

            for (var i = 0; i < iterations; i += 1) {
                sendAndEcho(replaceAlias(command));
            }

            return;
        }

        sendAndEcho(replaceAlias(message));
    });
}

function sendAndEcho(message) {
    receiveMessage({
        type: 'echo',
        content: message + '\r\n'
    });
    socket.emit('message', message);
}

function replaceAlias(content) {
    var aliases = AliasStore.getAll();
    Object.keys(aliases).forEach(function(alias) {
        content = content.replace(new RegExp('^' + alias + '\\b'), aliases[alias]);
    });

    return content;
}

function receiveMessage(message) {
    MellonDispatcher.dispatch({
        type: ActionTypes.RECEIVE_MESSAGE,
        message: utils.createMessage(message.type, message.content)
    });
}

module.exports = {
    sendCommand: sendCommand,
    sendMessage: sendMessage,
    receiveMessage: receiveMessage
};
