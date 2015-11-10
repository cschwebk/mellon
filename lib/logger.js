var fs = require('fs');

module.exports = function init() {
    var fileName = 'logs/' + Date.now() + '.txt';
    var writeStream = fs.createWriteStream(fileName, {
        flags: 'w',
        defaultEncoding: 'utf8',
    });

    return {
        log: function(message) {
            writeStream.write(message, function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    };
};
