const {httpServer, ioServer} = require("./config/config");
const appServer = httpServer();
const SocketController = require('./controllers/SocketController');

const PORT = "8888";
//Instancia um SocketController vinculado com um Server Socket vinculado ao express e agiarda por novas conexões
const sc = new SocketController(ioServer);
sc.listenToConnection();

appServer.listen(PORT, () => {
  console.log("Listening to: %s", PORT);
});