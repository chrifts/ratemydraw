import { postMessage, leaveRoom } from './helpers/index'
const words = require('../words.json')

module.exports = function(io: any) {
    //selected Chat Namespaces
    // const chatspaces = io.of(/^\/chat-\w+$/);
    // chatspaces.on('connection', socket => {
        
    //     socket.on('ChatSpaceMessage', (msg)=>{
    //         postMessage(io, msg)
    //     })
    //     const chatSpace = socket.nsp;
    //     console.log('connected to ChatSpace: '+chatSpace.name)
    //     socket.broadcast.emit('broadcast', 'hello friends')
    //     socket.on('disconnect', () => {
    //         console.log('disconnected from ChatSpace: '+chatSpace.name)
    //     });
    // })

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
    //GameRoom Namespace    
    const gameroom = io.of((/^\/room-\w+$/));
    gameroom.data = {
        _id: null,
        word: null,
        members: []
    }
    console.log(gameroom);
    gameroom.on('connection', socket => {
        console.log(gameroom);
        ping(socket);
        const user = JSON.parse(socket.request._query.member)
        if(gameroom.data._id == null) {
            gameroom.data._id = socket.request._query.room_id
        }
        gameroom.data.members.push(user)
        gameroom.emit('room/member_join', gameroom.data.members);
        if(gameroom.data.members.length > 1 && gameroom.data.word == null) {
            //GAME BEGIN
            //send word to players
            gameroom.data.word = getWord();
            gameroom.emit('room/word', gameroom.data.word);
        } else {
            gameroom.emit('room/word', gameroom.data.word);
        }      
        console.log('new user joined to ' + socket.nsp.name);
        
        socket.on('disconnect', async () => {
            console.log('user disconnected from: '+socket.nsp.name)
            await leaveRoom(gameroom.data._id, user._id);
            gameroom.data.members = gameroom.data.members.filter(member => member._id !== user._id);
            console.log(gameroom)
            gameroom.emit('room/member_leave', gameroom.data.members);
            if(gameroom.data.members.length == 0) {
                gameroom.removeAllListeners(); // Remove all Listeners for the event emitter
                io._nsps.delete('/room-'+gameroom.data._id);
                console.log(io._nsps)
            }
        });
    });
}
