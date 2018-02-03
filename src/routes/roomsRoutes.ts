const router = require('express').Router();
const socketClient = require("socket.io-client")('http://localhost:8888/');
const SC = require('../controllers/SocketController');

router.get("/create", (req: any, res: any) => {
  const {name} = req.query;

  if (name) {
    const sc = new SC();
    sc.createRoom(name, (status: number, result: any) => {

      console.log("Creating: ", name);
      res.status(status).json({ response: result });

    });
  } else {
    res.status(404).json({ response: '!name' });
  }

});

router.get("/join", (req: any, res: any) => {
    
  const {name} = req.query;

});

module.exports = router;