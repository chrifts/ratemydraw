import { postMessage, leaveRoom } from './helpers/index'
const words = require('../words.json')
import { join } from "./controllers/RoomController";

module.exports = function(io: any) {

    function getWord() {
        const levels = []
        for (const key in words){
            levels.push(key)
        }
        const randLevelIndex = Math.floor(Math.random() * levels.length);
        const randWordIndex = Math.floor(Math.random() * words[levels[randLevelIndex]].length)
        const randWord = words[levels[randLevelIndex]][randWordIndex];
        console.log(randWord);
        return randWord;
    }
    function ping(socket) {
        socket.emit('ping', {info: 'first ping'});
        socket.on('pong', function(data){
            console.log("Pong received from client");
            socket.emit('ping', data);
        });
    }
    function setWord(room, room_id){
        switch (room.size) {
            case 1:
                room.word = getWord();
                gameSpace.to(room_id).emit('room/word', room.word);
                break;
            default:
                if(!room.word){
                    room.word = getWord();
                }
                gameSpace.to(room_id).emit('room/word', room.word);
                break;
        }
    }
    //GameRoom Namespace
    const gameSpace = io.of("/game-room");
    const GAME_STATE = {
        WAITING: 'WAITING',
        PLAYING: 'PLAYING',
        VOTING: 'VOTING',
        ENDED: 'ENDED'
    }

    gameSpace.on('connection', async (socket) => {
        ping(socket)
        const username = socket.request._query.member
        const { room, user } = await join(username);
        socket.user = user;
        socket.join(room.id);
        socket.emit('room/my_data', user);
        gameSpace.to(room.id).emit('room/member_join', room.members)
        const gameSpaceRoom = gameSpace.adapter.rooms.get(room.id)
        setWord(gameSpaceRoom, room.id)
        
        socket.on('disconnect', async () => {
            const updatedRoomMembers = await leaveRoom(room.id, socket.user._id);
            if(updatedRoomMembers) {
                gameSpace.to(room.id).emit('room/member_leave', updatedRoomMembers.members)
            }
            if(gameSpaceRoom.size == 1) {
                setWord(gameSpaceRoom, room.id);
            }
            console.log(gameSpace)
        });
    })
}
