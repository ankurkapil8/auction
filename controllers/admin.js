var express = require("express"); // call express framework
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken'); // JWT token
const e = require("express");
const app = express();
var router = express.Router();
app.set('superSecret', "auction");

var service = require("../db")
var myBid = service.getBid();
var auctionData = service.getAuction();
var users = service.getUsers();
//  add auction (Admin)
router.post('/auction', (req, res, next) => {
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
        if (decoded.username == "admin") {
            service.setAuction(req.body);
            var auctionData = service.getAuction();
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
router.put('/auction', (req, res, next) => {
    try {
        if (req.query.name == "" || req.query.name == undefined) {
            return res.status(500).json({
                message: "name required in query string"
            });
        }
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        if (decoded.username == "admin") {
            auctionData = service.getAuction();
            auctionData.forEach((record, index) => {
                if (record.name == req.query.name) {
                    auctionData[index].description = req.body.description;
                    auctionData[index].endTime = req.body.endTime;
                    auctionData[index].name = req.body.name;
                }
            })
            service.editAuction(auctionData);
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
router.delete('/auction', (req, res, next) => {
    try {
        if (req.body.name == "" || req.body.name == undefined) {
            return res.status(500).json({
                message: "name required "
            });
        }
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        if (decoded.username == "admin") {
            auctionData = service.getAuction();
            auctionData.forEach((record, index) => {
                if (record.name == req.body.name) {
                    console.log(index);
                    auctionData.splice(index, 1);
                }
            })
            service.editAuction(auctionData);

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
router.get('/auction', (req, res, next) => {
    try {
        let data = [];
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        if(decoded.username == "admin"){
            auctionData = service.getAuction();
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
router.get("/auctionList",(req,res,next)=>{
    auctionData = service.getAuction();
    return res.status(200).json({
        record: auctionData
    });

})

//function for get auction detail with bided details
router.get("/auctionDetails",(req,res,next)=>{
    if (req.query.auctionName == "" || req.query.auctionName == undefined) {
        return res.status(500).json({
            message: "auction name required in query string"
        });
    }
    var auctionDataWithBid = {
        auctionDetails:{},
        bidDetails:[]
    };
    auctionData = service.getAuction();

    var auctionObj = auctionData.filter(record=>record.name==req.query.auctionName);
    auctionDataWithBid.auctionDetails = auctionObj;
    var bidDetails = [];
    myBid = service.getBid();
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

router.get("/filterAuction",(req,res,next)=>{
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
    auctionData = service.getAuction();
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

module.exports = router;
