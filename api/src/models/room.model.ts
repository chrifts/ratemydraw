import mongoose = require("mongoose");

//define schema
const RoomSchema = new mongoose.Schema({
    privateId: String,
    members: Array, //user _id
    word: String,
    messages:[
        {
            from: String, 
            to: String, 
            message: String,
            timestamp: Number
        }
    ]
});

//define schema level methods to create access token and refresh token:
RoomSchema.methods = {
    addMember(user) {
        this.members.push(user)
        this.save();
    }
};


RoomSchema.pre("save", async function (next) {
  //code...
    return next();
});

module.exports = mongoose.model("GameRoom", RoomSchema);