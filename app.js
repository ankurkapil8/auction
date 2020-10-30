var express = require("express"); // call express framework
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken'); // JWT token
const e = require("express");
const app = express();
app.set('superSecret', "auction");
var userRoutes = require("./controllers/user");
var adminRoutes = require("./controllers/admin");
var myBid = require("./controllers/mybid");
var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port 3000");
});

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,token');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    req.headers['content-type'] = req.headers['content-type'] || 'application/json';
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/",userRoutes);
app.use("/",adminRoutes);
app.use("/",myBid);
app.use("/", (req, res, next) => {
    return res.status(200).json("Welcome to auction website");
})