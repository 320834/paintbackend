const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);

const port = 3001;

const io = socketIO(server);

//Global
const connectedUsers = new Set();

io.on("connection", socket => {
  console.log("User Connected");
  connectedUsers.add(socket.id);

  io.emit("socketConnect", Array.from(connectedUsers.values()));

  socket.on("draw", data => {
    io.emit("drawReceive", [socket.id, data[0], data[1], data[2], data[3]]);
  });

  socket.on("mouseDown", socketID => {
    io.emit("mouseDownReceive", socketID);
  });

  socket.on("mouseUp", socketID => {
    io.emit("mouseUpReceive", socketID);
  });

  socket.on("clear", socketID => {
    console.log("clear");
    io.emit("clearReceive", socketID);
  });

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    io.emit("disconnectUser", socket.id);
    connectedUsers.delete(socket.id);
    console.log("User Disconnected");
  });
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://173.72.102.109:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//Routes
app.get("/getdata", function(req, res) {
  let rawdata = fs.readFileSync("data.json");
  let jsonObj = JSON.parse(rawdata);
  res.json(jsonObj);
});

app.post("/postdata", function(req, res) {
  //console.log(req.body);

  //Read from file
  let rawdata = fs.readFileSync("data.json");
  let jsonObj = JSON.parse(rawdata);

  //Add to object
  jsonObj[jsonObj.length] = req.body;

  //Add new object to file
  fs.writeFile("data.json", JSON.stringify(jsonObj, null, 4), err => {
    if (err) {
      console.error(err);
    }
  });

  res.send("Posted to database");
});

app.post("/clearPost", function(req, res) {
  fs.writeFile("data.json", "[]", err => {
    if (err) {
      console.error(err);
    }
  });
  res.send("Sucessfully cleared");
});

server.listen(port, function() {
  console.log("Listening on port ", port);
});
