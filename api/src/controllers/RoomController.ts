const Room = require("../models/room.model");
const ObjectID = require('mongodb').ObjectID;

// function getWord() {
//     const levels = []
//     for (const key in words){
//         levels.push(key)
//     }
//     const randLevelIndex = Math.floor(Math.random() * levels.length);
//     const randWordIndex = Math.floor(Math.random() * words[levels[randLevelIndex]].length)
    
    
//     const randWord = words[levels[randLevelIndex]][randWordIndex];
//     console.log(randWord);
//     this.theWord = randWord;
    
// }
async function createRoom(user){
    let room = await new Room().save();
    console.log('new room created' + room)
    room.addMember(user)
    // room.setWord(getWord())
    //now add the user data {username: username, _id: createdId}
    return room;
}

function join(io: any) {
    const callback = async (req, res) => {
        try {
            let rooms = await Room.find().exec();
            rooms.length == 0 ? rooms = null : rooms = rooms;
            const user = {
                _id: ObjectID(),
                username: req.body.username
            }
            if(rooms) {
                rooms.forEach(async (room) => {
                    if(room.members.length < 8) {
                        room.addMember(user)
                        return res.status(200).json({room: room, user: user });
                    } else {
                        const newRoom = await createRoom(user);
                        return res.status(200).json({room: newRoom, user: user });
                    }
                });
            } else {
                const newRoom = await createRoom(user);
                console.log(newRoom);
                return res.status(200).json({room: newRoom, user: user });
            }
            
            
            
        } catch (error) {
            console.error(error);
            return res.status(500).json(error);
        }
    };
    return callback
} 

export {
    join
}