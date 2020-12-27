<template>
    <v-container v-if="user">
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
                <p class="text-button text--primary d-block">you: {{user.username}}</p>
                <p class="text-subtitle-2 text--primary">Players {{roomMembers.length}}</p>
                <div v-if="!startGame" class="text--primary">
                    Waiting players...
                </div>
                <div v-else>
                    {{theWord}}
                </div>
            </v-col>
        </v-row>
        
    </v-container>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import VueScrollTo from 'vue-scrollto';
import store from '../store/index'
import { axiosRequest, defaultSocketEvents } from '../helpers';
import { io } from 'socket.io-client';
Vue.use(VueScrollTo)

@Component({
  name: 'GameRoom',
})
export default class GameRoom extends Vue {
    theWord = '';
    startGame = false;
    roomMembers = [];

    get user() {
        return this.$store.getters.user
    }
    mounted() {
        
        if(!this.user) {
            this.$router.push({name: 'Home'})
            return;
        }
        this.$socket.client.on('room/member_join', (members)=>{
            console.log(members)
            this.roomMembers = members;
            if(this.roomMembers.length > 1) {
                //start game
                console.log('game begin')
                this.startGame = true;
            } else {
                //waite one more player
                console.log('waiting player')
            }
        })
        this.$socket.client.on('room/word', (word)=> {
            this.theWord = word;
        })
        this.$socket.client.on('room/member_leave', (members)=> {
            console.log(members)
            this.roomMembers = members;
        })
    }
    leaveRoom() {
        this.$socket.client.disconnect();
        this.$router.push({name: 'Home'})
    }
}
</script>
<style lang="scss" scoped>

</style>