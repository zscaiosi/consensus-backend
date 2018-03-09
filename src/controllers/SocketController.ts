const moment = require('moment');
const mongodbClient = require('mongodb').MongoClient;
// const {mongodbUrl} = require('../constants.json');
const Participant = require('../models/Participant');
const Socket = require('../models/Socket');

interface Room {
  roomName: string,
  clientId: string,
  clientName: string
}

interface RoomCreation {
  name: string,
  ownerName: string,
  ownerPassword: string
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
      
      //Adiciona à sala desejada
      clientSocket.join(room.roomName);
      //Notifica os participantes da sala sobre a entrada do novo usuário
      this._socket.in(room.roomName).emit('new_client', `${room.clientName} acabou de entrar na sala!`);

      this._socket.in(room.roomName).emit(room.clientId, { roomName: room.roomName, clientId: room.clientId, clientName: room.clientName });
                
      // p.registerParticipation(room.clientId, room.clientName, room.roomName, (status, result) => {

      //   if (status === 200) {
      //     //Adiciona à sala desejada
      //     clientSocket.join(room.roomName);
      //     //Notifica os participantes da sala sobre a entrada do novo usuário
      //     this._socket.in(room.roomName).emit('new_client', `${room.clientName} acabou de entrar na sala!`);

      //     clientSocket.on('new_msg', (msg: string, info: Room) => {
      //       console.log('Msg: ', msg, info);
      //     });

      //   } else {
      //     this._socket.emit(room.clientId, 'A sala solicitada não existe!');
      //   }

      // });
      
    });
    
    clientSocket.on('participant_message_sent', (payload: any) => {

      this._socket.in(payload.info.roomName).emit('participant_message_received', payload);

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

ServerSocketController.prototype.createRoom = function(payload: RoomCreation, next: Function){

  const s = new Socket();

  s.createRoom(payload, next);
}

ServerSocketController.prototype.enterRoom = function(name: string, next: Function){

  const s = new Socket();

  s.enterRoom(name, next);
}


module.exports = ServerSocketController;