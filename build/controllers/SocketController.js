var moment = require('moment');
var mongodbClient = require('mongodb').MongoClient;
function ServerSocketController(ioServer) {
    this._socket = ioServer;
}
ServerSocketController.prototype.listenToConnection = function () {
    var _this = this;
    this._socket.on('connection', function (clientSocket) {
        clientSocket.on('enter_room', function (room) {
            console.log(room);
            mongodbClient.connect('mongodb://localhost:27017/usuarios', function (err, db) {
                if (!err) {
                    var dbConn = db.db('usuarios');
                    dbConn.collection('rooms').findOne({ name: room.roomName }, function (findErr, result) {
                        if (!findErr) {
                            clientSocket.join(room.roomName);
                            console.log("SUCESSO!");
                            _this._socket["in"](room.roomName).emit('new_client', room.clientName + " acabou de entrar na sala!");
                        }
                        else {
                            _this._socket.emit(room.clientName, 'A sala solicitada não existe!');
                        }
                    });
                }
                else {
                    console.log(err);
                }
            });
        });
    });
};
ServerSocketController.prototype.createRoom = function (name, next) {
    mongodbClient.connect('mongodb://localhost:27017/usuarios', function (err, db) {
        if (!err) {
            var dbConn = db.db('usuarios');
            var generatedId = moment(new Date()).format() + "_" + name;
            dbConn.collection('rooms').insert({ _id: generatedId, name: name }, function (insertErr, result) {
                if (!insertErr) {
                    next(200, result);
                }
                else {
                    next(500, insertErr);
                }
            });
        }
        else {
            console.log(err);
        }
    });
};
ServerSocketController.prototype.enterRoom = function (name) {
};
module.exports = ServerSocketController;
