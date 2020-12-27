<template>
  <div class="home" id="main-view" style="overflow-y: scroll;">
    <v-container fluid fill-height >
      <v-row>
        <v-col cols=3></v-col>
        <v-col cols=12 sm=6>
          <v-card height="calc(100vh - 86px)">
            <h1  class="text--primary ">Rate my Draw!</h1>
            <v-row>
              <v-col cols=3></v-col>
              <v-col cols=6>
                <v-text-field
                  @keyup="updateText"
                  width="200p"
                  label="Username"
                  filled
                  dense
                />
                <v-btn class="mb-3" @click="join">Join public</v-btn>
                <v-spacer></v-spacer>
                <v-btn class="mb-3">Join Private</v-btn>
                <v-spacer></v-spacer>
                <v-btn class="mb-3">Create private</v-btn>
                <v-alert type="warning" dismissible v-model="alert.active">
                  {{alert.info}}
                </v-alert>
              </v-col>
            </v-row>
            <v-row>
              
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { axiosRequest } from "../helpers";
import VueSocketIOExt from 'vue-socket.io-extended'
import { io } from 'socket.io-client';
import { MAIN_APP_CONTACT_HANDLER, MAIN_APP_MESSAGES } from '../constants';
import { defaultSocketEvents, customSocketEvents } from '../helpers';

@Component({
  name: 'Home',
})
export default class Home extends Vue {
  username = '';
  alert = {
    active: false,
    info: ''
  }

  updateText($event){
    this.username = $event.target.value
  }

  get user() {
    return this.$store.getters.user;
    
  }
  async join() {
    if(this.username != '') {
      const res = await axiosRequest('POST', (this.$root as any).urlApi + '/join-public', {username: this.username})
      console.log(res)
      if(res.status == 200) {
        const socketUrl: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_SOCKET_URL! : process.env.VUE_APP_SOCKET_URL_PROD!;
        //connect to socket room-id received from server
        const socket = io(socketUrl + '/room-'+res.data.room._id, {query: 
          { 
            member:JSON.stringify(res.data.user),
            room_id:res.data.room._id,
            room_members: JSON.stringify(res.data.room.members)
          } 
        });
        this.$store.commit('setUser', res.data.user)
        Vue.use(VueSocketIOExt, socket);
        defaultSocketEvents(socket, {store: this.$store, context: 'roomSocket'});
        this.$router.push( { name:'GameRoom' } )
      } else {
        this.alert.active = true;
        this.alert.info = 'Error connecting to server...'  
      }     
      
    } else {
      this.alert.active = true;
      this.alert.info = 'Please, insert a username'
    }
    
  }
}
</script>
