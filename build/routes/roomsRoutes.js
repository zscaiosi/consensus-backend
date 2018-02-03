var router = require('express').Router();
var socketClient = require("socket.io-client")('http://localhost:8888/');
var SC = require('../controllers/SocketController');

router.get("/create", function (req, res) {
    var name = req.query.name;
    if (name) {
        var sc_1 = new SC();
        sc_1.createRoom(name, function (status, result) {
            console.log("Creating: ", name);
            res.status(status).json({ response: result });
        });
    }
    else {
        res.status(404).json({ response: '!name' });
    }
});

module.exports = router;
