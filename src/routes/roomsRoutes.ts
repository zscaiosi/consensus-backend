const router = require('express').Router();
const SC = require('../controllers/SocketController');

router.post("/create", (req: any, res: any) => {
  const {name, ownerName, ownerPassword} = req.body;

  if (name) {
    const sc = new SC();
    sc.createRoom({ name, ownerName, ownerPassword }, (status: number, result: any) => {

      console.log("Creating: ", name);
      res.status(status).json({ response: result });

    });
  } else {
    res.status(404).json({ response: '!name' });
  }

});

router.get("/join", (req: any, res: any) => {  
  const {name} = req.query;

  if (name) {
    const sc = new SC();
    sc.enterRoom(name, (status: number, result: any) => {

      res.status(status).json({ response: result });

    });
  } else {
    res.status(404).json({ response: '!name' });
  }
});

module.exports = router;