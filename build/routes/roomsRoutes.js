var router = require('express').Router();
var SC = require('../controllers/SocketController');
router.post("/create", function (req, res) {
    var name = req.body.name;
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
router.get("/join", function (req, res) {
    var name = req.query.name;
    if (name) {
        var sc_2 = new SC();
        sc_2.enterRoom(name, function (status, result) {
            res.status(status).json({ response: result });
        });
    }
    else {
        res.status(404).json({ response: '!name' });
    }
});
module.exports = router;
