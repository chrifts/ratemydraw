<template>
  <div :class="{'fixed-bottom':$vuetify.breakpoint.mobile}">
    <!-- DESKTOP -->
    <v-bottom-navigation
      style="justify-content: space-around !important"
      id="theNavBar"
      background-color="secondary--lighten2"
      :class="{'d-none' : chatSelected && $vuetify.breakpoint.mobile }">
      <template v-if="loggedIn && !loading && !$vuetify.breakpoint.mobile">
        <v-btn  color="icons" text :to="'/'">
          {{appName}}
        </v-btn>
        <v-badge
          class="dotPosition"
          inline
          dot
          :color="mainSocketStatus == 'connected' ? 'green' : 'red'"
          >
          <span  class="text-subtitle-1 text--disabled" title='Main socket status'>
            {{mainSocketStatus}}  
          </span>
        </v-badge>
      </template>  
      <SwitchSocket v-if="loggedIn && !$vuetify.breakpoint.mobile"/>
      <v-spacer v-if="!$vuetify.breakpoint.mobile"></v-spacer>
      <template v-if="!loggedIn && !loading" class="v-bottom-navigation">
        <v-btn
          color="icons"
          text
          v-for="item in itemsNoAuth"
          :key="item.title"
          :to="item.link"
        >
          {{ $vuetify.breakpoint.mobile ? '' : item.title }}
          <v-icon center color="icons">{{ item.icon }}</v-icon>
        </v-btn>
      </template>
      <!-- Notifications -->
      <template v-if="loggedIn && !loading"  class="v-bottom-navigation">
        <v-menu
          :close-on-content-click="false"
          z-index="1000"
          offset-y
          v-model="isOpen"
          :class="{'top-fix-vmenu' : isWK}"
          >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="icons"
              icon
              v-bind="attrs"
              v-on="on"
            >
              {{ $vuetify.breakpoint.mobile ? '' : 'Notifications' }}
              <v-badge
                color="red"
                overlap
                :content="totalNotifications"
                :value="hasNotifications"
              >
                
                <v-icon>mdi-bell</v-icon>
              </v-badge>
            </v-btn>
            
          </template>
          <v-list class="not-list" v-if="Object.keys(mainNotifications).length > 0">
            <!-- loop notification type -->
            <template v-for="(data, notifType) in mainNotifications">
              <v-list-item
                :key="notifType"
                v-if="Object.keys(data).length > 0"
               >
              
                  <!-- <span>{{parseNotificationType(notifType)}}</span> -->                
                  <v-list style="width: 100%">
                    <!-- Loop users -->
                    <v-list-item
                      v-for="(el, ix) in data"
                      :key="ix"
                    >
                    {{debugFromTempate(el)}}
                      <div v-if="el.length > 0" :class="{'unread' : el[(el.length - 1)].status == 'unread', 'read' : el[(el.length - 1)].status == 'read'}">
                        <span v-if="el[(el.length - 1)].status == 'unread'" class="badge-notif">
                          <v-icon x-small color="red">mdi-circle</v-icon> 
                        </span>
                        <v-list-item-title v-if="notifType == NEW_MESSAGE">{{ el.length }} new {{el.length > 1 ? 'messages' : 'message'}} from 
                        </v-list-item-title>
                        <v-list-item-title v-if="notifType == CONTACT_REQUEST"> 
                          <!-- <span v-if="el[0].message.status == 'connecteds'"> accepted from</span> -->
                          
                          <!-- {{el[0].status}} -->
                          {{parseNotificationType(el[0].message.status)}} 
                        </v-list-item-title>
                        <v-list-item-subtitle>{{ el[0].extraDataFrom.email }}</v-list-item-subtitle>
                        <v-btn class="removeNot" icon @click="deleteNotif(el[0])">X</v-btn>  
                      </div> 
                    </v-list-item>
                  </v-list>
              </v-list-item>
            </template>
          </v-list>
          <v-list v-else>
            <v-list-item>
              <v-list-item-title :class="{'top-fix-vmenu' : isWK}"> 
                No notifications
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn color="icons" text v-for="item in itemsAuth" :key="item.title" :to="item.link">
          {{ $vuetify.breakpoint.mobile ? '' : item.title }}
          <v-icon center color="icons">{{ item.icon }}</v-icon>
        </v-btn>
      </template>  
      <Theme v-if="!$vuetify.breakpoint.mobile" />
      <v-btn color="icons" text  to="cristihanschweizer" v-if="!$vuetify.breakpoint.mobile || !loggedIn">
          Developer
          <v-icon center color="icons">mdi-account-circle</v-icon>
      </v-btn>
    </v-bottom-navigation>
    <div v-if="mainLoading">
      <v-progress-linear
        height="8"
        indeterminate
        color="red darken-2"
      ></v-progress-linear>
      Loading...
      <div v-if="timePassed">
        Stuck?
        <Logout :reload="true"/>
      </div>
    </div>    
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import store from '../store/index'
import { Watch, Prop, Model } from 'vue-property-decorator';
import { CONTACT_REQUEST, NEW_MESSAGE } from "../constants";
import { axiosRequest } from '../helpers';
import SwitchSocket from '@/components/SwitchSocket.vue'
import Logout from '@/components/Logout.vue'
import Theme from '@/components/Theme.vue'

@Component({
  name: 'NavBar',
  components: {
    SwitchSocket,
    Logout,
    Theme
  }
})
export default class NavBar extends Vue {
  @Model('change') socketStatus!: string;
  @Model('change') isWK!: any;

  timePassed = false;
  NEW_MESSAGE = NEW_MESSAGE;
  CONTACT_REQUEST = CONTACT_REQUEST;
  isOpen = false;
  mainSocketStatus = this.mainAppSocketStatus;
  chatSelected = this.selectedChat;
  loading = false;
  loggedIn = this.userLoggedIn;
  appName = process.env.VUE_APP_NAME;
  mainNotifications = this.mainNotif;
  readed = false;
  hasNotifications = false;
  totalNotifications = 0;

  async deleteNotif(item){
    const body = {
      _id: item._id,
      type: item.type,
      from: item.from,
      notStatus: item.status,
    }
    
    try {
      this.$store.commit('deleteNot', body)
      const res = await axiosRequest('POST', (this.$root as any).urlApi + '/user/remove-notification', body, {headers:{"x-auth-token":this.$cookies.get('jwt')}})  
      console.log(res)
    } catch (error) {
      throw new Error(error);
    }
  }

  deleteKey(type) {
    delete this.mainNotifications[type]
    this.mainNotifications = [...this.mainNotifications]
  }

  @Watch('isOpen')
  onOpenNotif(val){
    if(!val) {
      this.readNotifications(this.mainNotifications)
    }
  }
  @Watch('$store.state.mainAppSocketStatus')
  onSocketStatusChange(ss: any) {
    this.mainSocketStatus = ss;
  }
  

  get itemsNoAuth() {
    const menuItems = [
      {
        title: "Register",
        icon: "add",
        link: "/register"
      },
      {
        title: "Login",
        icon: "send",
        link: "/login"
      }
      
    ];
    return menuItems;
  }
  debugFromTempate(q) {
    console.log(q);
  }
  get itemsAuth() {
    const menuItems = [
      {
        title: "Home",
        icon: "home",
        link: "/"
      },
      {
        title: "Chat",
        icon: "message",
        link: "/chat"
      },
      {
        title: "Profile",
        icon: "mdi-account",
        link: "/profile"
      }
    ];
    return menuItems;
  }

  get mainNotif() {
   return this.$store.getters.mainNotifs
  }
  get mainLoading() {
    return this.$store.getters.mainLoading;
  }

  get mainAppSocketStatus() {
    return this.$store.getters.mainAppSocketStatus;
  }

  get userLoggedIn() {
    return this.$store.getters.user;
  }

  get selectedChat() {
    return this.$store.getters.selectedChat;
  }

  async readNotifications(data) {
    const currentNotifications = this.totalNotifications;
    if(this.totalNotifications > 0) {
      this.hasNotifications = false;
      this.totalNotifications = 0;
      const res = await axiosRequest('POST', (this.$root as any).urlApi + '/user/read-notifications', {notifications: data}, {headers:{"x-auth-token":this.$cookies.get('jwt')}})
      if(res.status == 500) {
        this.hasNotifications = true;
        this.totalNotifications = currentNotifications;
      } else {
        this.$store.commit('readNotifications', data)
      }      
    }
  }

  parseNotificationType(data) {
    let type;
    switch (data) {
      case 'new contact from':
        type = 'New contact request from'
        break;
      case 'resend':
        type = 'User has resend contact request'
        break;
      case 'connecteds':
        type = 'You have a new contact!'
        break;
      case 'rejected':
        type = 'Contact has rejected your request'
        break;
      default:
        break;
    }
    return type;
  }

  @Watch('$store.state.mainLoading')
  onMainLoading(val: any) {
    this.loading = val;
    if(val) {
      setTimeout(() => {
        this.timePassed = true;
      }, 8000);
    } else {
      this.timePassed = false;
    }
  }

  mounted() {
    if(this.mainLoading) {
      setTimeout(() => {
        this.timePassed = true;
      }, 8000);
    } else {
      this.timePassed = false;
    }
  }

  @Watch('$store.state.mainNotifications', { deep : true, immediate: true })
  onMainNotificationsChange(val: any) {
    
    let totalN = 0;
    Object.entries(val).forEach(([type, contacts])=> {
      if(Object.keys(contacts as {}).length > 0) {
        Object.entries(contacts as {}).forEach(([ix, contact])=> {
          (contact as []).forEach(notification => {
            if((notification as any).status == 'unread') {
              totalN++;
            }
          });
        })
        if(totalN > 0) {
          this.hasNotifications = true;
          this.totalNotifications = totalN;
        }
      } 
    })
    if(totalN < 1) {
      this.hasNotifications = false;
      this.totalNotifications = 0;
    }
    const notf = val
    Object.entries(notf).forEach(([type, contacts])=> {       
      if(Object.keys(notf[type]).length < 1) {
        delete notf[type]
      }
    })
    console.log(notf)
    this.mainNotifications = notf;
  }

  @Watch('$store.state.user')
  onUser(val: any) {
    this.loggedIn = val;
  }
  @Watch('$store.state.selectedChat')
  onChangeChat(val: any) {
    this.chatSelected = val;
    if(val && val._id){
      this.$store.commit('readChat', val._id);
    }
    
  }
}
</script>
<style lang="scss">
.badge-notif {
  position: absolute;
  left: 10px;
  top: 25px;
}
.dotPosition .v-badge__wrapper span {
  position: relative;
  top: 19px !important;
  margin: 0 5px;
}
  .not-list {
    width: 100%;
  }
</style>
<style lang="scss" scoped>
#theNavBar {
  a, button {
    max-width: 100px;
    width: 100%;
  }
}
.fixed-bottom {
  position: fixed;
  bottom: 0px;
  width: 100%;
}
.removeNot {
  position: absolute;
  right: 10px;
  top: 20px;
  
}
.unread {
  background-color: var(--v-secondary-base);
  padding: 20px 60px;
  width: 100%;
}
.read {
  padding: 20px 60px;
  width: 100%;
}
.v-menu__content {
    .not-list {
      .v-list-item {
        padding: 0 !important;
      }
    }
  }
@media (max-width: 599px) {
  #theNavBar {
    a, button {
      max-width: 65px;
      width: 100%;
    }
  }
  .top-fix-vmenu {
    padding-top: 20px;
  }
  .v-toolbar__content, .v-toolbar__extension, .v-toolbar__items {
    width: 100% !important;
  }
  .v-item-group.v-bottom-navigation .v-btn {
    min-width: 60px !important;
  }
  .v-toolbar__content, .v-toolbar__extension {
    padding: 0 !important;
  }
  .v-menu__content {
    .not-list {
      padding-top: 20px !important;
      background-color: var(--v-primary-base) !important;
    }
  }
  .v-menu__content {
    background-color: var(--v-primary-base) !important;
    max-width: 100%;
    width: 100%;
    left: 0 !important;
    top: 0 !important;
    height: calc(100% - 57px) !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
}
</style>
