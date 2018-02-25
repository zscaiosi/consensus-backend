var mongodbClientP = require('mongodb').MongoClient;
var momentP = require('moment');
function ParticipantModel(id, name, currentRoom) {
    this._id = id;
    this._name = name;
    this._currentRoom = currentRoom;
}
ParticipantModel.prototype.registerParticipation = function (clientId, clientName, roomName, next) {
    mongodbClientP.connect("mongodb://localhost:27017/consensus_db", function (err, db) {
        if (!err) {
            var dbConn = db.db('consensus_db');
            db.collection('participants').insert({
                _id: clientId, clientName: clientName, room: { roomName: roomName }, connectionDateTime: momentP().format(), connected: true, disconnectionDateTime: ""
            }, function (insertErr, result) {
                if (!insertErr) {
                    next(200, result);
                }
                else {
                    next(500, result);
                }
            });
        }
        else {
            next(500, err);
        }
        db.close();
    });
};
ParticipantModel.prototype.registerExit = function (clientId, clientName, roomName, next) {
    mongodbClientP.connect("mongodb://localhost:27017/consensus_db", function (err, db) {
        if (!err) {
            var dbConn = db.db('consensus_db');
            db.collection('participants').findOneAndUpdate({ _id: clientId, clientName: clientName, room: { roomName: roomName }, connected: true }, { $set: {
                    clientName: clientName + "_disconnected",
                    room: { roomName: null },
                    connected: false,
                    disconnectionDateTime: momentP().format()
                }
            }, function (updateErr, result) {
                if (!updateErr) {
                    next(200, result);
                }
                else {
                    next(500, updateErr);
                }
            });
        }
        else {
            next(500, err);
        }
        db.close();
    });
};
module.exports = ParticipantModel;
