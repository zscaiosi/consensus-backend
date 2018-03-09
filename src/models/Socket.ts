const mongodbClient = require('mongodb').MongoClient;
const moment = require('moment');

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

function Socket(){

}

Socket.prototype.createRoom = function(payload: RoomCreation, next: Function){

  mongodbClient.connect(`mongodb://localhost:27017/consensus_db`, (err, db) => {

    if (!err) {

      const dbConn = db.db('consensus_db');
      const generatedId = moment(new Date()).format()+"_"+payload.name;

      dbConn.collection('rooms').insert({ _id: generatedId, roomName: payload.name, open: true, ownerName: payload.ownerName, ownerPassword: payload.ownerPassword }, (insertErr, result) => {

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

Socket.prototype.enterRoom = function(name: string, next: Function){

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

module.exports = Socket;