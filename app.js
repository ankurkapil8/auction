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
var users = [];
var auctionData = [];
var myBid = [
    {
        auctionName:"auction1",
        price:"30",
        time:"14:30",
        isbest:"Yes"
    },
    {
        auctionName:"auction2",
        price:"40",
        time:"15:30",
        isbest:"No"
    },
    {
        auctionName:"auction2",
        price:"50",
        time:"16:00",
        isbest:"Yes"
    }


];
// registration api
app.post("/registration", (req, res, next) => {         // registration API
    try {
        if(req.body.username == "" || req.body.username == undefined){
            return res.status(500).json({
                message: "username required"
            });            
        }
        if(req.body.email == "" || req.body.email == undefined){
            return res.status(500).json({
                message: "email required"
            });            
        }
        if(req.body.password == "" || req.body.password == undefined){
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

  app.post('/login',(req,res,next)=>{
      try {
        if(req.body.username == "" || req.body.username == undefined){
            return res.status(500).json({
                message: "username required"
            });            
        }
        if(req.body.password == "" || req.body.password == undefined){
            return res.status(500).json({
                message: "password required"
            });            
        }
        let isValidUser = false;
        users.forEach(record=>{
            if(record.username == req.body.username && record.password == req.body.password){
                isValidUser = true;
            }
        })
        if(isValidUser){
            var token = jwt.sign(req.body, app.get('superSecret'), {expiresIn: '2h'}); //set jwt token
            return res.status(200).json({
                message: "user login successfully",
                jwtToken:token 
              });
        }else{
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

  // add auction
app.post('/auction',(req,res,next)=>{
    try {
        if(req.body.name == "" || req.body.name == undefined){
            return res.status(500).json({
                message: "name required"
            });            
        }
        if(req.body.description == "" || req.body.description == undefined){
            return res.status(500).json({
                message: "description required"
            });            
        }
        if(req.body.endTime == "" || req.body.endTime == undefined){
            return res.status(500).json({
                message: "end time required"
            });            
        }
        auctionData.push(req.body);
        return res.status(200).json({
            message: "auction created successfully",
            record:auctionData
        });
            
    } catch (error) {
        return res.status(500).json({
            message: error.message
          });
              
      }
    })

    // edit auction
    app.put('/auction',(req,res,next)=>{
        try {
            if(req.query.name == "" || req.query.name == undefined){
                return res.status(500).json({
                    message: "name required in query string"
                });            
            }
            auctionData.forEach((record,index)=>{
                if(record.name == req.query.name){
                    auctionData[index].description = req.body.description;
                    auctionData[index].endTime = req.body.endTime;
                    auctionData[index].name = req.body.name;
                }
            })
            return res.status(200).json({
                message: "data edited successfully",
                record:auctionData
              });
        } catch (error){
            return res.status(500).json({
                message: error.message
              });
        }
    })

    //delete auction
    app.delete('/auction',(req,res,next)=>{
        try {
            if(req.query.name == "" || req.query.name == undefined){
                return res.status(500).json({
                    message: "name required in query string"
                });            
            }
            auctionData.forEach((record,index)=>{
                if(record.name == req.query.name){
                    console.log(index);
                    auctionData.splice(index, 1);
                }
            })
            return res.status(200).json({
                message: "record deleted successfully",
                record:auctionData
            });            
                
        } catch (error) {
            return res.status(500).json({
                message: error.message
              });
        }

    })

    // list of auction
app.get('/auction',(req,res,next)=>{
    try{
        let data = [];
        if(req.query.name !="" && req.query.name !=undefined){
            auctionData.forEach(record=>{
                if(record.name ==req.query.name ){
                    data.push(record);
                }
            })
        }else{
            data = auctionData;
        }
        return res.status(200).json({
            record:data
        });            
    }catch (error) {
        return res.status(500).json({
            message: error.message
          });
    }
})

// my bid list
app.get('/mybid',(req,res,next)=>{
    try{
        return res.status(200).json({
            record:myBid
        });            
    }catch (error) {
        return res.status(500).json({
            message: error.message
          });
    }
})

// delete my bid
app.delete('/mybid',(req,res,next)=>{
    try{
        if(req.query.index == "" || req.query.index == undefined){
            return res.status(500).json({
                message: "index required in query string"
            });            
        }
        myBid.splice(req.query.index, 1);

        return res.status(200).json({
            message: "record deleted successfully",
            record:myBid
        });            

    }catch (error) {
        return res.status(500).json({
            message: error.message
          });
    }
})


app.use("/",(req,res,next)=>{
    return res.status(200).json("Welcome to auction website");            
})