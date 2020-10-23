var express = require("express"); // call express framework
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken'); // JWT token
const e = require("express");
const app = express();
app.set('superSecret', "auction");
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
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    req.headers['content-type'] = req.headers['content-type'] || 'application/json';
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var users = [{
    username: "admin",
    password: "admin",
    email: "admin@gmail.com"
}];
var auctionData = [];
var myBid = [
];
// registration api
app.post("/registration", (req, res, next) => {         // registration API
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
        users.push(req.body);
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
app.post('/login', (req, res, next) => {
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

//  add auction (Admin)
app.post('/auction', (req, res, next) => {
    try {
        if (req.body.name == "" || req.body.name == undefined) {
            return res.status(500).json({
                message: "name required"
            });
        }
        if (req.body.description == "" || req.body.description == undefined) {
            return res.status(500).json({
                message: "description required"
            });
        }
        if (req.body.endTime == "" || req.body.endTime == undefined) {
            return res.status(500).json({
                message: "end time required"
            });
        }
        //console.log(req.headers.token);
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        console.log(decoded)
        if (decoded.username == "admin") {
            auctionData.push(req.body);
            return res.status(200).json({
                message: "auction created successfully",
                record: auctionData
            });
        } else {
            return res.status(500).json({
                message: "User don't have admin rights",
            });
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });

    }
})

// edit auction (Admin)
app.put('/auction', (req, res, next) => {
    try {
        if (req.query.name == "" || req.query.name == undefined) {
            return res.status(500).json({
                message: "name required in query string"
            });
        }
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        if (decoded.username == "admin") {
            auctionData.forEach((record, index) => {
                if (record.name == req.query.name) {
                    auctionData[index].description = req.body.description;
                    auctionData[index].endTime = req.body.endTime;
                    auctionData[index].name = req.body.name;
                }
            })
            return res.status(200).json({
                message: "data edited successfully",
                record: auctionData
            });
        } else {
            return res.status(500).json({
                message: "User don't have admin rights",
            });
        }

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
})

//delete auction (Admin)
app.delete('/auction', (req, res, next) => {
    try {
        if (req.query.name == "" || req.query.name == undefined) {
            return res.status(500).json({
                message: "name required in query string"
            });
        }
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        if (decoded.username == "admin") {

            auctionData.forEach((record, index) => {
                if (record.name == req.query.name) {
                    console.log(index);
                    auctionData.splice(index, 1);
                }
            })
        } else {
            return res.status(500).json({
                message: "User don't have admin rights",
            });

        }
        return res.status(200).json({
            message: "record deleted successfully",
            record: auctionData
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }

})

// list of auction (Admin)
app.get('/auction', (req, res, next) => {
    try {
        let data = [];
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        if(decoded.username == "admin"){
            data = auctionData;
            return res.status(200).json({
                record: data
            });
        }else{
            return res.status(500).json({
                message: "User don't have admin rights",
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
})

// function for get my bid list
app.get('/mybid', (req, res, next) => {
    try {
        var myBids = [];
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        var bidObj = myBid.filter(record=>record.username==decoded.username);
        myBids.push(bidObj);
        return res.status(200).json({
            record: myBids
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
})

// function for delete my bid
app.delete('/mybid', (req, res, next) => {
    try {
        var bidIndex = -1;
        if (req.query.auctionName == "" || req.query.auctionName == undefined) {
            return res.status(500).json({
                message: "auctionName required in query string"
            });
        }
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        myBid.forEach((record,index) => {
            if (record.auctionObj.name == req.query.auctionName && record.username == decoded.username) {
                bidIndex = index;
            }
        })
        myBid.splice(bidIndex, 1);
        return res.status(200).json({
            message: "record deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
})
// function for place new bid
app.post("/placebid", (req, res, next) => {
    var bidObj = {
        username:"",
        bidAmount:"",
        isBest:"yes",
        auctionObj:{}
    }
    if (req.body.auctionName == "" || req.body.auctionName == undefined) {
        return res.status(500).json({
            message: "auction name required"
        });
    }
    if (req.body.bidAmount == "" || req.body.bidAmount == undefined) {
        return res.status(500).json({
            message: "Bid amount required"
        });
    }
    var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
    bidObj.username = decoded.username;
    bidObj.bidAmount = req.body.bidAmount;
    var auctionDetail = auctionData.filter(record=>record.name==req.body.auctionName);
    if(auctionDetail == "" || auctionDetail==null || auctionDetail ==undefined){
        return res.status(500).json({
            message: "auction not available"
        });
    }
    bidObj.auctionObj = auctionDetail;
    myBid.push(bidObj);
    return res.status(500).json({
        message: "bid Placed successfully",
        record:bidObj
    });
});

// function for get list of auction for home page
app.get("/auctionList",(req,res,next)=>{
    return res.status(200).json({
        record: auctionData
    });

})

//function for get auction detail with bided details
app.get("/auctionDetails",(req,res,next)=>{
    if (req.query.auctionName == "" || req.query.auctionName == undefined) {
        return res.status(500).json({
            message: "auction name required in query string"
        });
    }
    var auctionDataWithBid = {
        auctionDetails:{},
        bidDetails:[]
    };
    var auctionObj = auctionData.filter(record=>record.name==req.query.auctionName);
    auctionDataWithBid.auctionDetails = auctionObj;
    var bidDetails = [];
    console.log(myBid);
    myBid.forEach(bidData=>{
        bidData.auctionObj.forEach(auction=>{
            if(auction.name == req.query.auctionName){
                bidDetails.push(bidData);
            }
        })
    })
    auctionDataWithBid.bidDetails = bidDetails;
    return res.status(200).json({
        record: auctionDataWithBid
    });
})

app.get("/filterAuction",(req,res,next)=>{
    var returnData = [];
    var searchPrms = {
        auctionName:"",
        amount:""
    }

    if(req.query.auctionName !="" && req.query.auctionName != undefined){
        searchPrms.auctionName = req.query.auctionName
    }
    if(req.query.amount !="" && req.query.amount != undefined){
        searchPrms.amount = req.query.amount
    }
    
    auctionData.forEach(record=>{
        if(searchPrms.auctionName != "" && searchPrms.amount != ""){
            if(searchPrms.auctionName == record.name && searchPrms.amount == record.amount){
                returnData.push(record);
            }
        }else if(searchPrms.auctionName != ""){
            if(searchPrms.auctionName == record.name){
                returnData.push(record);
            }

        }else if(searchPrms.auctionName != ""){
            if(searchPrms.amount == record.amount){
                returnData.push(record);
            }
        }
        });
    //});
    return res.status(200).json({
        record: returnData
    });
})
app.use("/", (req, res, next) => {
    return res.status(200).json("Welcome to auction website");
})