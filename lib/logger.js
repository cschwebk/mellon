var fs = require('fs');

module.exports = function init() {
    var fileName = 'logs/' + Date.now() + '.txt';
    var fd = fs.openSync(fileName, 'w', function(err) {
        console.log(err);
    });
    return {
        log: function(message) {
            fs.write(fd, message, 'utf8', function(err) {
                console.log(err);
            });
        }
    };
};