const Room = require("../models/room.model");
const ObjectID = require('mongodb').ObjectID;

async function createRoom(user){
    let room = await new Room().save();
    room.addMember(user)
    return room;
}

async function join(username, room_max_player) {
    try {
        const user = {
            _id: ObjectID().toString(),
            username: username
        }

        let rooms = await Room.find().exec();
        
        if(rooms.length > 0) {
            var i = 0;
            for await (const room of rooms) {
                if(room.members.length < room_max_player) {
                    room.addMember(user)
                    
                    i++;
                    return {room: room, user: user }
                } else if(rooms[i+1]) {
                    //check for the next room
                    i++; 
                    continue;
                }else {
                    const newRoom = await createRoom(user)
                    i++;
                    return {room: newRoom, user: user };
                }
                                
            }
        } else {
            const newRoom = await createRoom(user);
            return {room: newRoom, user: user }
        }
    } catch (error) {
        console.error(error);
        throw new Error(error)
    }
} 

export {
    join
}