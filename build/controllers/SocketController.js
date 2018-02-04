var moment = require('moment');
var mongodbClient = require('mongodb').MongoClient;
var Participant = require('../models/Participant');
function ServerSocketController(ioServer) {
    this._socket = ioServer;
}
ServerSocketController.prototype.listenToConnection = function () {
    var _this = this;
    this._socket.on('connection', function (clientSocket) {
        clientSocket.on('enter_room', function (room) {
            console.log("Enter: ", room);
            mongodbClient.connect("mongodb://localhost:27017/consensus_db", function (err, db) {
                if (!err) {
                    var dbConn = db.db('consensus_db');
                    dbConn.collection('rooms').findOne({ roomName: room.roomName, open: true }, function (findErr, result) {
                        if (!findErr) {
                            clientSocket.join(room.roomName);
                            _this._socket["in"](room.roomName).emit('new_client', room.clientName + " acabou de entrar na sala!");
                        }
                        else {
                            _this._socket.emit(room.clientName, 'A sala solicitada não existe!');
                        }
                        db.close();
                    });
                }
                else {
                    console.log(err);
                }
            });
        });
        clientSocket.on('exit_room', function (room) {
            console.log("Exit: ", room);
            var p = new Participant(room.clientId, room.clientName, room.roomName);
            p.registerExit();
        });
    });
};
ServerSocketController.prototype.createRoom = function (name, next) {
    mongodbClient.connect("mongodb://localhost:27017/consensus_db", function (err, db) {
        if (!err) {
            var dbConn = db.db('consensus_db');
            var generatedId = moment(new Date()).format() + "_" + name;
            dbConn.collection('rooms').insert({ _id: generatedId, roomName: name, open: true }, function (insertErr, result) {
                if (!insertErr) {
                    next(200, result);
                }
                else {
                    next(500, insertErr);
                }
                db.close();
            });
        }
        else {
            console.log(err);
        }
    });
};
ServerSocketController.prototype.enterRoom = function (name, next) {
    mongodbClient.connect("mongodb://localhost:27017/consensus_db", function (err, db) {
        if (!err) {
            var dbConn = db.db('consensus_db');
            dbConn.collection('rooms').findOne({ roomName: name, open: true }, function (findErr, result) {
                if (!findErr) {
                    next(200, result);
                }
                else {
                    next(500, findErr);
                }
                db.close();
            });
        }
        else {
            console.log(err);
        }
    });
};
module.exports = ServerSocketController;
