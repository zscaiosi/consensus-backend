const moment = require('moment');
const mongodbClient = require('mongodb').MongoClient;
// const {mongodbUrl} = require('../constants.json');
const Participant = require('../models/Participant');

interface Room {
  roomName: string,
  clientId: string,
  clientName: string
}

function ServerSocketController(ioServer?: any){
  //Socket do servidor vinculada ao servidor http express
  this._socket = ioServer;
}

ServerSocketController.prototype.listenToConnection = function(){
  //Espera por uma conexão
  this._socket.on('connection', (clientSocket) => {
    // Quando recebe uma mensagem para entrada em sala
    clientSocket.on('enter_room', (room: Room) => {
      console.log("Enter: ", room);

      const p = new Participant(room.clientId, room.clientName, room.roomName);
      p.registerParticipation(room.clientId, room.clientName, room.roomName, (status, result) => {

        if (status === 200) {
          //Adiciona à sala desejada
          clientSocket.join(room.roomName);
          //Notifica os participantes da sala sobre a entrada do novo usuário
          this._socket.in(room.roomName).emit('new_client', `${room.clientName} acabou de entrar na sala!`);
        } else {
          this._socket.emit(room.clientId, 'A sala solicitada não existe!');
        }

      });
      
    });
    
    // Quando recebe uma mensagem para saída de sala
    clientSocket.on('exit_room', (room: Room) => {
      console.log("Exit: ", room);

      const p = new Participant(room.clientId, room.clientName, room.roomName);
      p.registerExit(room.clientId, room.clientName, room.roomName, (status, result) => {

        if (status === 200) {
          // Abandona a sala
          this._socket.leave(room.roomName);
          // Notifica os participantes da sala sobre a saída do usuário
          this._socket.in(room.roomName).emit('client_left', `${room.clientName} acabou de sair da sala!`);
        } else {
          this._socket.emit(room.clientId, `${room.clientName}, não foi possível registrar sua saída, por favor, tente novamente! \n Error: ${result}`);
        }

      });

    });


  });

}

ServerSocketController.prototype.createRoom = function(name: string, next: Function){

  mongodbClient.connect(`mongodb://localhost:27017/consensus_db`, (err, db) => {

    if (!err) {

      const dbConn = db.db('consensus_db');
      const generatedId = moment(new Date()).format()+"_"+name;

      dbConn.collection('rooms').insert({ _id: generatedId, roomName: name, open: true }, (insertErr, result) => {

        if ( !insertErr ) {
          next(200, result);
        } else {
          next(500, insertErr);
        }
        db.close();
      });

    } else {
      console.log(err);
    }

  });

}

ServerSocketController.prototype.enterRoom = function(name: string, next: Function){

  mongodbClient.connect(`mongodb://localhost:27017/consensus_db`, (err, db) => {

    if ( !err ) {

      const dbConn = db.db('consensus_db');
      
      dbConn.collection('rooms').findOne({ roomName: name, open: true }, (findErr, result) => {

        if ( !findErr ) {
          next(200, result);
        } else {
          next(500, findErr);
        }
        db.close();
      });
    } else {
      console.log(err);
    }

  });

}


module.exports = ServerSocketController;