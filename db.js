var users = [{
    username: "admin",
    password: "admin",
    email: "admin@gmail.com"
}];

var myBid = [];
var auctionData = [];

module.exports = {
    getUsers: function() {
       return users    
    },
    setUsers : function(obj){
        users.push(obj);
    },
    getBid:function(){
        return myBid
    },
    setBid:function(obj){
        myBid.push(obj);
    },
    getAuction: function(){
        return auctionData;
    },
    setAuction:function(obj){
        auctionData.push(obj);
    },
    editAuction:function(auctions){
        auctionData = [...auctions]
    }
    
  };