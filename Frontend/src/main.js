import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './components/store'

import  AmplifyVue from '@aws-amplify/ui-vue';
import awsExports from './aws-exports';
import {Auth} from 'aws-amplify'
import "@aws-amplify/ui-vue/styles.css"


Auth.configure(awsExports)


//loadFonts()
createApp(App)
  .use(AmplifyVue)
  .use(store)
  .use(vuetify)
  .mount('#app')
