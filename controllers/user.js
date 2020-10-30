var express = require("express"); // call express framework
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken'); // JWT token
const e = require("express");
const app = express();
var router = express.Router();
var service = require("../db")
app.set('superSecret', "auction");
router.post("/registration", (req, res, next) => {         // registration API
    try {
        if (req.body.username == "" || req.body.username == undefined) {
            return res.status(500).json({
                message: "username required"
            });
        }
        if (req.body.email == "" || req.body.email == undefined) {
            return res.status(500).json({
                message: "email required"
            });
        }
        if (req.body.password == "" || req.body.password == undefined) {
            return res.status(500).json({
                message: "password required"
            });
        }
        service.setUsers(req.body);
        console.log(service.getUsers());
        return res.status(200).json({
            message: "registration successfull"
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
});

// login api with jwt token
router.post('/login', (req, res, next) => {
    try {
        if (req.body.username == "" || req.body.username == undefined) {
            return res.status(500).json({
                message: "username required"
            });
        }
        if (req.body.password == "" || req.body.password == undefined) {
            return res.status(500).json({
                message: "password required"
            });
        }
        let isValidUser = false;
        var users = service.getUsers();
        users.forEach(record => {
            if (record.username == req.body.username && record.password == req.body.password) {
                isValidUser = true;
            }
        })
        if (isValidUser) {
            var token = jwt.sign(req.body, app.get('superSecret'), { expiresIn: '2h' }); //set jwt token
            return res.status(200).json({
                message: "user login successfully",
                jwtToken: token
            });
        } else {
            return res.status(404).json({
                message: "user not exist"
            });
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });

    }
})
module.exports = router;
