var express = require("express");
var rooms = require("../routes/roomsRoutes");
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var loggerMiddleware = function (req, res, next) {
    console.log("body %s, ip %s, originalUrl %s ", req.body, req.ip, req.originalUrl);
    next();
};
module.exports = {
    httpServer: function () {
        app.use(loggerMiddleware);
        app.use(cors());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(bodyParser.text());
        app.use("/room", rooms);
        return http;
    },
    ioServer: io
};
