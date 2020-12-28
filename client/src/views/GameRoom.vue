<template>
    <v-container class="gameContainer">
        <v-row class="secondary mb-2">
            <v-col cols=12 >
                <div class="float-right text--primary">
                    leave
                    <v-btn icon outlined color="error" @click="leaveRoom" >X</v-btn>
                </div>
                
            </v-col>
            
        </v-row>
        <v-row class="secondary">
            <v-col cols=12>
                <!-- <p class="text-overline text--primary d-block" v-if="room">Room id: {{room._id}}</p>
                <p class="text-overline text--primary d-block" v-if="room">User id: {{user._id}}</p> -->
                <p class="text-button text--primary d-block" v-if="user">you: {{user.username}}</p>
                <p class="text-subtitle-2 text--primary">Players {{roomMembers.length}}</p>

                <div v-if="!startGame" class="text--primary">
                    Waiting players...
                </div>
                <div v-else>
                    {{theWord}}
                </div>
            </v-col>
        </v-row>
        <v-row class="secondary" style="max-height: calc(100% - 250px); height: 100%;">
            <!-- Members -->
            <v-col cols=4>
                <div class="chat-members">
                    <v-list three-line class="mb-2 members_list flex-div" fill-height>
                        <template v-for="(item, index) in roomMembers">

                            <v-list-item
                            :key="index"
                            >
                            <!-- <v-list-item-avatar>
                                <v-img :src="item.avatar"></v-img>
                            </v-list-item-avatar> -->

                            <v-list-item-content>
                                <v-list-item-title v-html="item.username"></v-list-item-title>
                                <v-list-item-subtitle v-html="item._id"></v-list-item-subtitle>
                            </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-list>
                    <v-list class="chat_list mb-2 flex-div" fill-height>
                        <template v-for="(item, index) in roomMessages">
                            <v-list-item :key="index" class="bubble">
                                <v-list-item-content>
                                    <span class="d-inline red">{{item.user.username}}</span> 
                                    <span class="d-inline">{{item.text}}</span>                                
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                    </v-list>
                    <div class="chat_msg flex-div">
                        <v-text-field
                            @keyup="updateText"
                            width="200px"
                            label="Message"
                            filled
                            dense
                        />
                        <v-btn @click="sendMessage">Send</v-btn>
                    </div>
                </div>
            </v-col>
            <!-- Canvas -->
            <v-col cols=6></v-col>
            <!-- Drawing Tools -->
            <v-col cols=2></v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import VueScrollTo from 'vue-scrollto';
import store from '../store/index'
import { axiosRequest } from '../helpers';
import VueSocketIOExt from 'vue-socket.io-extended'
import { io } from 'socket.io-client';
Vue.use(VueScrollTo)

@Component({
  name: 'GameRoom',
})
export default class GameRoom extends Vue {
    theWord = '';
    startGame = false;
    roomMembers = [];
    roomMessages = [
        {
            room_id: '',
            user: {username: 'The server'},
            text: 'Welcome to the chatroom'
        }
    ];
    socket;
    messageText;

    get user() {
        return this.$store.getters.user
    }
    get room() {
        return this.$store.getters.room
    }
    scrollBottom() {
        const scrollOpts = {
            container: '.chat_list',
            element: '.bubble:last-child',
            easing: 'ease-in',
            lazy: false,
            offset: 30,
            force: true,
            cancelable: true,
            x: false,
            y: true
        }
        this.$scrollTo('.bubble:last-child', 0, scrollOpts)
    }
    beforeDestroy() {
        console.log('unmounted GameRoom')
    }
    join() {
        const socketUrl: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_SOCKET_URL! : process.env.VUE_APP_SOCKET_URL_PROD!;
        const socket = io(socketUrl + '/game-room', {query: 
          { 
            member: this.user.username
          } 
        });
        this.socket = socket;
    }
    updateText($event){
        this.messageText = $event.target.value
    } 
    socketEvents(){
        this.socket.on('room/data', (data)=>{
            console.log(data);
            this.$store.commit('setUser', data.user);
            this.$store.commit('setRoom', data.room);
        })
        this.socket.on('room/member_join', (members)=>{
            console.log(members)
            this.roomMembers = members;
            if(this.roomMembers.length > 1) {
                //start game
                console.log('game begin')
                this.startGame = true;
            } else {
                //waite one more player
                this.startGame = false;
                console.log('waiting player')
            }
        })
        this.socket.on('room/word', (word)=> {
            this.theWord = word;
        })
        this.socket.on('room/member_leave', (members)=> {
            console.log(members)
            this.roomMembers = members;
            if(members.length < 2) {
                this.startGame = false;
            }
        })
        this.socket.on('room/message', (message)=> {
            console.log(message)
            this.roomMessages.push(message);
            this.scrollBottom()
        })
    }
    mounted() {
        this.join()
        this.socketEvents()
    }
    leaveRoom() {
        this.socket.disconnect();
        this.$store.commit('setUser', null)
        this.$router.push({name: 'Home'})
    }
    sendMessage() {
        if(this.messageText != '') {
            const message = {
                room_id: this.room._id,
                user: this.user,
                text: this.messageText
            };
            this.socket.emit('room/client/message', message)
        }
    }
}
</script>
<style lang="scss" scoped>
.gameContainer {
    height: 100%;
}
.chat_list {
    overflow-y: scroll;
    flex-basis: 33% !important;
}
.members_list {
    overflow-y: scroll;
    flex-basis: 50% !important;
}
.chat-members {
    height: 69vh;
    display: flex;
    flex-direction: column;
    .flex-div {
        flex: 1;
    }
}
</style>