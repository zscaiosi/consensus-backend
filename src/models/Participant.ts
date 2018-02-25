const mongodbClientP = require('mongodb').MongoClient;
const momentP = require('moment');

function ParticipantModel(id: string, name: string, currentRoom?: string){
  this._id = id;
  this._name = name;
  this._currentRoom = currentRoom;
}

ParticipantModel.prototype.registerParticipation = function(clientId: string, clientName: string, roomName: string, next: any){
  mongodbClientP.connect(`mongodb://localhost:27017/consensus_db`, (err, db) => {

  if (!err) {

    const dbConn = db.db('consensus_db');
    db.collection('participants').insert({
      _id: clientId, clientName, room: { roomName }, connectionDateTime: momentP().format(), connected: true, disconnectionDateTime: ""
    },
    (insertErr, result) => {

      if (!insertErr) {
        next(200, result);
      } else {
        next(500, result);
      }

    });
  // Se não foi possível conectar-se
  } else {
    next(500, err);
  }
  db.close();
  });
}

ParticipantModel.prototype.registerExit = function(clientId: string, clientName: string, roomName: string, next: any){
  mongodbClientP.connect(`mongodb://localhost:27017/consensus_db`, (err, db) => {

    if (!err) {

      const dbConn = db.db('consensus_db');
      db.collection('participants').findOneAndUpdate(
        // Procura pelo cliente específico, na sala específica e então o retira da sala e o desconecta
        { _id: clientId, clientName, room: { roomName }, connected: true },
        { $set: {
            clientName: clientName+"_disconnected",
            room: { roomName: null },
            connected: false,
            disconnectionDateTime: momentP().format()
          }
        },
        (updateErr, result) => {
          
          if (!updateErr) {
            next(200, result);
          } else {
            next(500, updateErr);
          }
          
        });
    // Se não foi possível conectar-se
    } else {
      next(500, err);
    }
    db.close();
  });
}

module.exports = ParticipantModel;