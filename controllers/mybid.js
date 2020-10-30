var express = require("express"); // call express framework
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken'); // JWT token
const e = require("express");
const app = express();
var router = express.Router();
var service = require("../db")
var myBid = service.getBid();
var auctionData = service.getAuction();
app.set('superSecret', "auction");

// function for get my bid list
router.get('/mybid', (req, res, next) => {
    try {
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        var myBid = service.getBid();

        var bidObj = myBid.filter(record=>record.username==decoded.username);
        //myBids.push(bidObj);
        return res.status(200).json({
            record: bidObj
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
})

// function for delete my bid
router.delete('/mybid', (req, res, next) => {
    try {
        var bidIndex = -1;
        if (req.body.auctionName == "" || req.body.auctionName == undefined) {
            return res.status(500).json({
                message: "auctionName required in query string"
            });
        }
        var decoded = jwt.verify(req.headers.token, app.get('superSecret'));
        var myBid = service.getBid();

        myBid.forEach((record,index) => {
            if (record.auctionObj.name == req.body.auctionName && record.username == decoded.username) {
                bidIndex = index;
            }
        })
        myBid.splice(bidIndex, 1);
        service.deleteBid(myBid);
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
router.post("/placebid", (req, res, next) => {
    try {
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
        var auctionData = service.getAuction();

        var auctionDetail = auctionData.filter(record=>record.name==req.body.auctionName);
        if(auctionDetail == "" || auctionDetail==null || auctionDetail ==undefined){
            return res.status(500).json({
                message: "auction not available"
            });
        }
        bidObj.auctionObj = auctionDetail;
        //myBid.push(bidObj);
        service.setBid(bidObj);
        return res.status(200).json({
            message: "bid Placed successfully",
            record:bidObj
        });
            
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
});
module.exports = router;
