var
    io = require('socket.io-client'),
    ioClient = io.connect('http://127.0.0.1:8081');

ioClient.on('foo', function(msg) {
    console.info(msg);
});
