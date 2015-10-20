var express = require('express'),
    net = require('net'),
    fs = require('fs'),
    mud = require('./lib/mud'),
    aliases = require('./config/aliases'),
    triggers = require('./config/triggers'),
    config = require('./config/config'),
    substitutions = require('./config/substitutions'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    exphbs = require('express-handlebars'),
	morgan = require('morgan'),
    logger = require('./lib/logger')();

var DEBUG = true;

app.use(express.static('dist'));
app.use(morgan('dev'));

app.engine('.hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.get('/', function (req, res) {
	res.render('index', {
        aliases: JSON.stringify(aliases),
        triggers: JSON.stringify(triggers),
        config: JSON.stringify(config),
        substitutions: JSON.stringify(substitutions)
    });
});

server.listen('3000', function (err) {
	console.log('express server listening on port 3000');
});

io.on('connection', function(socket) {
    var mudSocket = null;
    socket.on('command', function(command) {
        if (DEBUG) {
            console.log('command:', command.command);
            console.log('payload:', command.payload);
        }

        switch (command.command) {
            case 'connect':
                if (!mudSocket) {
                    mudSocket = mud.connectToMud(config, socket, logger, DEBUG);
                }
                break;
            case 'zap':
                if (mudSocket) {
                    mudSocket.end();
                    mudSocket = null;
                }
            break;
            case 'update_aliases':
                fs.writeFileSync('config/aliases.json', JSON.stringify(command.payload, null, 2), 'utf8');
            break;
            case 'update_triggers':
                fs.writeFileSync('config/triggers.json', JSON.stringify(command.payload, null, 2), 'utf8');
            break;
            case 'update_substitutions':
                fs.writeFileSync('config/substitutions.json', JSON.stringify(command.payload, null, 2), 'utf8');
            break;
            case 'update_config':
                fs.writeFileSync('config/config.json', JSON.stringify(command.payload, null, 2), 'utf8');
                config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'));
            break;
            default:
                //noop
            break;
        }
    });

    socket.on('message', function(message) {
        if (DEBUG) {
            console.log(JSON.stringify(message));
        }

        logger.log(message + '\r\n');

        if (!mudSocket) {
            socket.emit('message', {
                type: 'system',
                content: 'Not connected to MUD'
            });
            return;
        }

        //telnet protocol requires each message to end with a new line
        mudSocket.write(message + '\r\n');
    });
});
