<template>

<span v-if="this.$store.state.userInfo.isLocal == false">

  <UserCalendar>


  </UserCalendar>

</span>

</template>

<script>
import { defineComponent } from 'vue';

import UserCalendar from '../components/UserCalendar.vue'
import store from '../components/store'


export default defineComponent({
  name: 'userView',

  data: () => ({
    session : null,
    accessToken : null,
    idToken : null,
    sub : null,
    groups : null
  }),

  components: {
    UserCalendar,
  },

  async setup () {
    try{
      await store.dispatch('userAuth')
    }
    catch(err){
      
    }
  }
})
</script>