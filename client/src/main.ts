import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import dotenv from 'dotenv';
import { axiosRequest, getCookies } from './helpers/index'
import VueCookies from "vue-cookies-ts"
Vue.use(VueCookies);

dotenv.config();
import { Plugins } from '@capacitor/core';
import '@capacitor-community/http';
let app: Vue;
const urlApi: string = process.env.NODE_ENV == 'development' ? process.env.VUE_APP_API! : process.env.VUE_APP_API_PROD!;


const init = () => {
  if (!app) {
    app = new Vue({
      router,
      store,
      vuetify,
      components: {
        App,
      },
      data: ()=>({
        urlApi: urlApi,
        platform: {}
      }),
      beforeCreate: async function () {        
        this.$cookies.config(
          {
            expires: '30d',
            path: '/',
          }
        );
        const { Device } = Plugins;
        const info = await Device.getInfo();
        this.$data.platform = info;
      },
      render: function (createElement) {
        return createElement('App');
      }
    }).$mount("#app");
  }
};    


init();
