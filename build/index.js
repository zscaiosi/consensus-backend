var _a = require("./config/config"), httpServer = _a.httpServer, ioServer = _a.ioServer;
var appServer = httpServer();
var SocketController = require('./controllers/SocketController');
var PORT = "8888";
var sc = new SocketController(ioServer);
sc.listenToConnection();
appServer.listen(PORT, function () {
    console.log("Listening to: %s", PORT);
});
