<template>

<span v-if="this.$store.state.userInfo.isLocal">

  <LocalCalendar>


  </LocalCalendar>

</span>

</template>

<script>
import { defineComponent } from 'vue';

import { Auth } from 'aws-amplify';

import LocalCalendar from '../components/LocalCalendar.vue';


import store from '../components/store'


export default defineComponent({
  name: 'LocalView',

  data: () => ({
    session : null,
    accessToken : null,
    idToken : null,
    sub : null,
    groups : null
  }),

  components: {
    LocalCalendar,
  },

  setup () {
    try{
      //store.dispatch('userAuth')
    }
    catch(err){
      
    }
  }
})
</script>