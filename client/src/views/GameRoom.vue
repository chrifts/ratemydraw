<template>
    <v-container>
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
        <v-row>
            <!-- Members -->
            <v-col cols=3>
                 <v-list three-line>
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
            </v-col>
            <!-- Canvas -->
            <v-col cols=6></v-col>
            <!-- Drawing Tools -->
            <v-col cols=3></v-col>
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
    socket;

    get user() {
        return this.$store.getters.user
    }

    beforeDestroy() {
        console.log('unmounted GameRoom')
    }
    join() {
        const socketUrl: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_SOCKET_URL! : process.env.VUE_APP_SOCKET_URL_PROD!;
        //connect to socket room-id received from server
        const socket = io(socketUrl + '/game-room', {query: 
          { 
            member: this.user.username
            // room_id:res.data.room._id,
            // room_members: JSON.stringify(res.data.room.members)
          } 
        });
        this.socket = socket;
    }
    mounted() {
        this.join()
        this.socket.on('room/my_data', (my_data)=>{
            console.log(my_data);
            this.$store.commit('setUser', my_data);
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
    }
    leaveRoom() {
        this.socket.disconnect();
        this.$store.commit('setUser', null)
        this.$router.push({name: 'Home'})
    }
}
</script>
<style lang="scss" scoped>

</style>