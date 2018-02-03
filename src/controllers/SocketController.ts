const moment = require('moment');
const mongodbClient = require('mongodb').MongoClient;

interface Room {
  roomName: string,
  clientName: string
}

function ServerSocketController(ioServer?: any){
  //Socket do servidor vinculada ao servidor http express
  this._socket = ioServer;
}

ServerSocketController.prototype.listenToConnection = function(){
  //Espera por uma conexão
  this._socket.on('connection', (clientSocket) => {

    clientSocket.on('enter_room', (room: Room) => {
      console.log(room)

      mongodbClient.connect('mongodb://localhost:27017/usuarios', (err, db) => {

        if (!err) {
    
          const dbConn = db.db('usuarios');
    
          dbConn.collection('rooms').findOne({ name: room.roomName }, (findErr, result) => {
    
            if ( !findErr ) {
              //Adiciona à sala desejada
              clientSocket.join(room.roomName);

              this._socket.in(room.roomName).emit('new_client', `${room.clientName} acabou de entrar na sala!`);
            } else {
              this._socket.emit(room.clientName, 'A sala solicitada não existe!');
            }
    
          });
    
        } else {
          console.log(err);
        }
    
      });
    });

  });

}

ServerSocketController.prototype.createRoom = function(name: string, next: Function){

  mongodbClient.connect('mongodb://localhost:27017/usuarios', (err, db) => {

    if (!err) {

      const dbConn = db.db('usuarios');
      const generatedId = moment(new Date()).format()+"_"+name;

      dbConn.collection('rooms').insert({ _id: generatedId, name: name }, (insertErr, result) => {

        if ( !insertErr ) {
          next(200, result);
        } else {
          next(500, insertErr);
        }

      });

    } else {
      console.log(err);
    }

  });

}

ServerSocketController.prototype.enterRoom = function(name: string){

}


module.exports = ServerSocketController;