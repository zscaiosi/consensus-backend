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
            var p = new Participant(room.clientId, room.clientName, room.roomName);
            clientSocket.join(room.roomName);
            _this._socket["in"](room.roomName).emit('new_client', room.clientName + " acabou de entrar na sala!");
            _this._socket["in"](room.roomName).emit(room.clientId, "Voc\u00EA, " + room.clientName + ", acabou de entrar na sala!");
            clientSocket.on('new_msg', function (payload) {
                console.log('Msg: ', payload.msg, payload.info);
                _this._socket["in"](payload.info.roomName).emit('new_msg_response', { msg: 'Cheogu nova mensagem!', from: room.clientName });
            });
        });
        clientSocket.on('exit_room', function (room) {
            console.log("Exit: ", room);
            var p = new Participant(room.clientId, room.clientName, room.roomName);
            p.registerExit(room.clientId, room.clientName, room.roomName, function (status, result) {
                if (status === 200) {
                    _this._socket.leave(room.roomName);
                    _this._socket["in"](room.roomName).emit('client_left', room.clientName + " acabou de sair da sala!");
                }
                else {
                    _this._socket.emit(room.clientId, room.clientName + ", n\u00E3o foi poss\u00EDvel registrar sua sa\u00EDda, por favor, tente novamente! \n Error: " + result);
                }
            });
        });
    });
};
ServerSocketController.prototype.createRoom = function (payload, next) {
    mongodbClient.connect("mongodb://localhost:27017/consensus_db", function (err, db) {
        if (!err) {
            var dbConn = db.db('consensus_db');
            var generatedId = moment(new Date()).format() + "_" + payload.name;
            dbConn.collection('rooms').insert({ _id: generatedId, roomName: payload.name, open: true, ownerName: payload.ownerName, ownerPassword: payload.ownerPassword }, function (insertErr, result) {
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
