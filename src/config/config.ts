const express = require("express");
const rooms = require("../routes/roomsRoutes");
const bodyParser = require('body-parser');
const cors = require('cors');
//Configurando servidor http express e vinculando socket.io
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const loggerMiddleware = (req, res, next) => {
  console.log("body %s, ip %s, originalUrl %s ", req.body, req.ip, req.originalUrl);
  next();
}


module.exports = {
  httpServer: function(){
    //Middlewares setup
    app.use(loggerMiddleware);
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(bodyParser.text());
    app.use("/room", rooms);
    return http;
    
  },
  ioServer: io
}