<template>

<LoginView></LoginView>
 


</template>

<script>
import LoginView from './views/LoginView.vue';

export default{
components: {LoginView},

  setup () {
  },
}



</script>

<style>
:root {
  height: 100%;
}

body {
  height: 100%;
}

.vuecal {
  height: 100vh;
}
.vuecal__bg {
  height: 100vh;
}
/*
.vuecal__flex.vuecal.vuecal--week-view .vuecal__bg .vuecal__flex {
  height: 90vh;
}
*/

#wrapper {
    min-width: 300px; /* 100px x3 = 300 */
    overflow:scroll;
}
</style>