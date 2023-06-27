<template>

<div v-if="!isMobile">
<Sidebar @calendarOpt = changeView @showWeek = showWeekend :profileName = "profileName">

</Sidebar>
</div>
<div v-else>
  <Sidebar @calendarOpt = changeView @showWeek = showWeekend  :profileName = "profileName" :sidebar-height="this.height" :is-mobile="true">

</Sidebar> 
</div>



<CalendarMainLocal :shouldShow="showCalendarr" :notshow-weekends="!showWeekends">

</CalendarMainLocal>

</template>

<script>
import CalendarMainLocal from './CalendarMainLocal.vue'
import Sidebar from './Sidebar.vue'
import store from './store'
import { computed } from 'vue'


export default{
  components: {CalendarMainLocal, Sidebar},

  data: () => ({
    showCalendarr : true,

   profileName:  computed(() => store.state.userInfo.name),

   isMobile : false,

   height : '45.75px',

   showWeekends: false

  }),

  methods: {
    changeView(){ 
      this.showCalendarr = !this.showCalendarr
    },

    showWeekend(show){
      this.showWeekends = show
    }
  },

  mounted(){
    this.isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
    if(window.innerWidth <= 350) {
      this.height = '38.72px'
    }
    else
      this.height = '45.75px'
  }
}
</script>

<style>
.vuecal__menu {
  padding-left: 50px;
}
</style>