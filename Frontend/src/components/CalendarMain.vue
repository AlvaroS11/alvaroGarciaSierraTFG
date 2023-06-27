:time-step="calculateHeight()"
50"
<template>
  <div :class="this.cssMain" v-if="shouldShow">

    <vue-cal class="vuecal--blue-theme" style="height: device-height" ref="calendar" :time-from="7 * 60"
      :time-to="23.5 * 60" :time-step="30" :disable-views="['years']" hide-title-bar events-on-month-view="short"
      :hide-weekends=notshowWeekends :events="events" :snap-to-time="15"
      :editable-events="{ title: false, drag: false, resize: false, delete: false, create: true }"
      :drag-to-create-event="false" :on-event-create="onEventCreate" :on-event-click="onEventClick">



      >
    </vue-cal>


    <v-dialog v-model="showDialog" max-width="40em">
      <v-card>
        <div :class="titleInfoClass">
          <span>{{ selectedEvent.title }}</span>
          <v-spacer />


          <strong>{{ selectedEvent.start && selectedEvent.start.format('DD/MM/YYYY') }}</strong>

        </div>

        <v-card-text>
          <p v-html="selectedEvent.description" />
          <div class="lead-info">
            <strong>Event details:</strong>
            <ul>
              <li>Event starts at: {{ selectedEvent.start && selectedEvent.start.formatTime() }}</li>
              <li>Event ends at: {{ selectedEvent.end && selectedEvent.end.formatTime() }}</li>
            </ul>
          </div>
          <div class="lead-interact">

            <button class="button-accept" @click="confirmDeny()"><img src="../assets/imgs/Deny.svg" class="accept-lead"></button>

          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirmDelete" max-width="30em">
      <v-card>
        <div class="title-confirm">
          <div class="confirm-del-msg"> Are you sure you want to delete this appointment at &nbsp; <strong> {{
            selectedEvent.start && selectedEvent.start.formatTime() }} </strong> </div>

          <v-spacer />


        </div>

        <p v-html="selectedEvent.description" />
        <span class="deleted-msg"><small><strong> It will be deleted permantly </strong></small></span>


        <br>
        <div style="display:flex; justify-content: center;">
          <button class="button-confirm" @click="denyLead()">Yes, delete event</button>
          <button class="button-confirm-keep"
            @click="{ this.showConfirmDelete = false; this.showConfirmDelete = false }">No,
            keep event</button>
        </div>
      </v-card>
    </v-dialog>



    <v-dialog v-model="showEventCreationDialog" :persistent="true" max-width="420">
      <v-card>
        <v-card-title>

          <div class="TitleInfo">
            <v-input v-model="selectedEvent.title" placeholder="Event Title" />
          </div>

        </v-card-title>
        <v-card-text>

          <v-tabs v-model="tab" bg-color="primary">
            <v-tab value="one">Book appointment</v-tab>
            <v-tab value="two">Save event</v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="tab">
              <v-window-item value="one">
                <v-select v-if="showEventCreationDialog" :items="returnTypes" v-model="selectedEvent.type"
                  placeholder="Type" @change="selectedEvent.type = $event" :value="selectedEvent.type" />


                <suspense>
                  <v-select :items="returnLocalsByType(selectedEvent.type)" v-model="selectedEvent.local"
                    placeholder="Local" @change="selectedEvent.local = $event" item-title="name" return-object
                    :value="selectedEvent.local" />
                </suspense>


                <v-select :items="getTimeRanges" v-model="selectedEvent.hours" placeholder="Time"
                  @change="selectedEvent.hours = $event" item-title="readableTimes" return-object
                  :value="selectedEvent.hours" />

              <!--
          <v-progress-circular v-if="isLoading"
           
          :value ="isLoading"  
             :width="6"></v-progress-circular>
    -->

              </v-window-item>

              <v-window-item value="two">
                <input-lead ref="customLead" :parent="this" :selected-event="selectedEvent" @snackbar="handleSnackbar"
                  @closeDial="closeDial"> </input-lead>
              </v-window-item>


            </v-window>
          </v-card-text>
          <v-btn @click="cancelEventCreation()">Cancel</v-btn>
          <v-btn @click="closeCreationDialog()">Save</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
  <div v-else>

    <UserFormView>

    </UserFormView>
  </div>

  <div class="text-center">
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor">
      <div class="SnackbarText">

        <img :src=snackbarImg alt="Error warning" width="30" height="30" style="margin-right: 10px;" />
        {{ snackbarText }}
      </div>
      <template v-slot:actions>
        <v-btn :color="snackbarClose" variant="text" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
// Documentation: https://antoniandre.github.io/vue-cal
//https://vuex.vuejs.org/guide/#the-simplest-store

import VueCal from 'vue-cal'
import "../../css/vuecal.css"
import Sidebar from "./Sidebar.vue"


import store from './store'
import { computed } from 'vue'
import { mapGetters } from 'vuex'
import { mapActions } from 'vuex'
import { utils } from './methods/utils'
import InputLead from './InputLead.vue'


import UserFormView from '../views/userFormView.vue'
import {snackbarClose, errorImg, successImg, colors } from "../constants.js"



export default {
  components: { VueCal, Sidebar, InputLead, UserFormView },
  props: {
    shouldShow: {
      type: Boolean,
      default: true
    },
    notshowWeekends: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    snackbarClose : snackbarClose,

    selectedEvent: null,
    showEventCreationDialog: false,
    eventsCssClasses: ['leisure', 'sport', 'health'],
    isLoading: false,
    isMobile: false,
    cssMain: "main",


    defStart: null,
    defEnd: null,

    date: null,

    selectedItems: [],

    tab: null,

    minutes: 0,

    activeView: 'week',


    snackbarMessage: 'abcdef',
    snackbarColor: 'green',
    snackbarTimeout: 5000,
    snackbarTop: true,
    snackbarImg : errorImg,


    boolSnack: true,

    snackbar: false,
    snackbarText: `Hello, I'm a snackbar`,
    snackbarColor: 'green',
    snackbarTimeout: 5000,


    selectedEvent: {
      "local": {
        "localId": -1
      },
    },
    showDialog: false,
    showConfirmDelete: false,
    events: computed(() => store.state.leads),
  }),

  mounted() {
    this.isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
    if (this.isMobile)
      this.cssMain = "mainMobile"
    else
      this.cssMain = "main"

    this.$watch(
      "$refs.calendar.view.id",
      (new_value, old_value) => (this.activeView = new_value)
    );
  },

  methods: {


    calculateHeight() {
      const windowHeight = window.innerHeight;

      var calcu = (windowHeight / 961) * 100

      this.minutes = calcu
      return calcu / 2
    },



    onEventClick(event, e) {
      this.selectedEvent = event
      this.showDialog = true

      // Prevent navigating to narrower view (default vue-cal behavior).

      e.stopPropagation()
    },



    handleSnackbar(value, data) {

      this.snackbar = value;
      this.snackbarText = data.text;
      this.snackbarColor = data.color;
      this.snackbarTimeout = data.timeout;
      this.snackbarImg = errorImg
      if(data.success) 
        this.snackbarImg = successImg

      /* setTimeout(() => {
         this.snackbar = false;
       }, this.snackbarTimeout);*/
    },

    onEventCreate(event, deleteEventFunction) {  
      this.isLoading = false

      this.selectedEvent = event
      this.showEventCreationDialog = true
      this.deleteEventFunction = deleteEventFunction
      this.selectedEvent.day = this.formatDate(this.selectedEvent.start)
      this.selectedEvent.local = {}
      this.selectedEvent.local.localId = -1
      event = null
      return event
    },

    closeDial() {

      this.showEventCreationDialog = false

    },

    cancelEventCreation() {
      this.deleteEventFunction()
      this.selectedEvent.local = {}
      this.selectedEvent.local.localId = -1
      this.showEventCreationDialog = false

    },
    closeCreationDialog() {
      if (this.tab == "two") {

        this.$refs.customLead.submit()
      }
      else {

        if (!this.selectedEvent.hasOwnProperty('hours')) {
          this.snackbarText = 'Error: ' + "All fields must be completed";
          this.snackbarColor = 'red';
          this.snackbar = true;
          return
        }

        try {
          var hourMin = this.selectedEvent.hours.split(':')
          var time_rest = hourMin[1].split(" ")
          var startH = new Date(this.selectedEvent.start)
          startH.setHours(hourMin[0], time_rest[0])


          this.selectedEvent.start = this.formatDate(startH) + " " + startH.getHours().toString().padStart(2, '0') + ":" + startH.getMinutes().toString().padStart(2, '0');

          var endH = this.getEndTime(this.selectedEvent.start, this.selectedEvent.local.settings.timePeriod)

          this.selectedEvent.end = endH
          this.submitlead(this.selectedEvent)
          this.selectedEvent = {}
        }
        catch (error) {
          this.selectedEvent = {}
          this.snackbarText = 'ERROR';
          this.snackbarColor = 'red';
          this.snackbar = true;
        }
      }
    },



    denyLead() {


      const headers = new Headers();
      headers.append('authorizationToken', this.$store.state.userInfo.idToken);

      const data = {
        allow: true,
        accepted: false,
        localId: this.selectedEvent.localId,
        day: utils.formatDate(this.selectedEvent.start),
        user: true,
        sub: this.$store.state.userInfo.sub
      }


      if (this.selectedEvent.custom == true)
        data.custom = true

      fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead/' + this.selectedEvent.id, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: headers
      }).then(response => {
        if (response.status == 200) {

          var data = {
            id: this.selectedEvent.id,
            accepted: false
          }
          store.dispatch('confirmLead', data)
          this.showDialog = false
          this.snackbarText = 'Succesfully denied appointment';
          this.snackbarColor = colors.success;
          this.snackbarImg = successImg
          this.snackbar = true;
          this.showConfirmDelete = false

        } else {
          // show error message in snackbar
          this.snackbarText = 'Error denying appointment';
          this.snackbarColor = colors.error;
          this.snackbarImg = errorImg
          this.snackbar = true;
        }
      }).catch(error => {
        // show error message in snackbar
        this.snackbarText = 'Error denying appointment';
        this.snackbarColor = colors.error;
        this.snackbarImg = errorImg
        this.snackbar = true;
      });




    },



    saveMinutes(minuStart) {

      this.selectedEvent.minutes = minuStart
    },

    handleWeekendsToggle() {
      this.notshowWeekends = !this.notshowWeekends
    },

    formatDate(date) {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2)
        month = '0' + month;
      if (day.length < 2)
        day = '0' + day;

      return [year, month, day].join('-');
    },

    formatDateAndTime(date) {

      const dformat = [date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0')
      ].join('-') + ' ' +
        [date.getHours().toString().padStart(2, '0'),
        date.getMinutes().toString().padStart(2, '0')].join(':');
      return dformat
    },

    getEndTime(startTime, minutes) {
      var endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + Number(minutes))
      endTime = this.formatDateAndTime(endTime)

      return endTime;
    },

    fetchTimes() {


      const data = {
        localId: this.selectedEvent.local.localId,
        day: this.selectedEvent.day,
      }
      store.dispatch('getTimes', data)
    },

    submitlead(data) {

      var quitSpaces = data.hours.split(' ')
      const hourMin = quitSpaces[0].split(':')
      const hours = Number(hourMin[0] * 60) + Number(hourMin[1])


      const localSelected = this.$store.state.locals.filter(element => {
        return element.localId == data.local.localId;
      });

      const localName = localSelected[0].name


      const headers = new Headers();
      headers.append('authorizationToken', this.$store.state.userInfo.idToken);

      const info = {
        type: data.type,
        start: data.start,
        end: data.end,
        localId: data.local.localId,
        name: data.name,
        title: localName,
        accepted: false,
        hours: hours.toString(),
        sub: this.$store.state.userInfo.sub,
        userName: this.$store.state.userInfo.name
      }


      fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead', {
        method: 'POST',
        body: JSON.stringify(info),
        headers: headers
      })

        .then(response => {

          if (!response.redirected) {
            this.snackbarText = 'Error creating Event, please reload the page';
            this.snackbarColor = colors.error;
            this.snackbarImg = errorImg
            this.snackbar = true;
          }

          else {

            const stream = response.json();

            return stream;
          }
        }).then(values => {

          try {
            store.dispatch('addLead', values.body)
            this.snackbarText = 'Succesfully created event';
            this.snackbarColor = colors.success;
            this.snackbarImg = successImg
            this.snackbar = true;
          } catch (err) {
            this.snackbarText = 'Error creating Event, please try again or reload the page';
            this.snackbarColor = 'red';
            this.snackbar = true;

            const data = {
              localId: info.localId,
              day: this.formatDate(info.start)
            }
            store.dispatch('getTimes', data)
          }
          this.showEventCreationDialog = false
        })
    },
    confirmDeny() {
      this.showConfirmDelete = true;

    },

  },


  ...mapActions([
    'postLeadC',
    'getTimes'
  ]),
  computed: {
    // Métodos que solo se evaluan si sus dependencias han cambiado (son cacheadas y no se ejecutan si el valor no va a cambiar)
    titleInfoClass() {
      // Check the value of selectedEvent.title and return the appropriate class name

      if (this.selectedEvent.class === 'custom') {
        return 'TitleInfo customColor';
      }
      else if (this.selectedEvent.class === 'health') {
        //if()
        return 'TitleInfo healthColor'
      }
      else if (this.selectedEvent.class === 'sport') {
        return 'TitleInfo sportColor'

      }
      else if (this.selectedEvent.class === 'leisure') {
        return 'TitleInfo leisureColor'
      }
      else {
        return 'TitleInfo';
      }
    },


    localSel() {
      //
      return this.selectedEvent.local
    },

    getTimeRanges() {

      try {
        const selectedRanges = this.$store.state.timeRanges.filter(element => {
          return element.localId == this.selectedEvent.local.localId && element.day == this.selectedEvent.day;
        });

        if (selectedRanges.length > 0) {
          return Object.values(selectedRanges[0].readableTimes);
        } else {
          return [];
        }
      }
      catch (err) {
        return []
      }

    },

    gettingLeads() {

      this.events = store.state.leads

      return store.state.leads
    },

    ...mapGetters([
      'returnLocalsByType',
      'returnLocals',
      'returnAvailableTimes',
      'returnTypes'

    ]),
  },

  watch: {
    async localSel() {
      try {
        const data = {
          localId: this.selectedEvent.local.localId,
          day: this.selectedEvent.day,
        }
        var times = this.returnAvailableTimes(this.selectedEvent.local.localId, this.selectedEvent.day)

        if (times == -1) {
          this.isLoading = true
          await store.dispatch('getTimes', data)
            .then(times = this.returnAvailableTimes(this.selectedEvent.local.localId, this.selectedEvent.day))
        }

        this.selectedItems = times
      } catch (err) {

      }
    }

  }
}
</script>

<style>
@import "../assets/shared.css";

.vuecal__event.leisure-accepted {
  /* background-color: rgba(253, 156, 66, 0.9);border: 1px solid rgb(233, 136, 46);color: #fff;*/
  background: linear-gradient(to right,
      rgba(253, 156, 66, 0.9) 0%,
      rgba(253, 156, 66, 0.9) 50%,
      green 0%,
      green 100%);
}

.vuecal__event.leisure-denied {
  /* background-color: rgba(253, 156, 66, 0.9);border: 1px solid rgb(233, 136, 46);color: #fff;*/
  background: linear-gradient(to right,
      rgba(253, 156, 66, 0.9) 0%,
      rgba(253, 156, 66, 0.9) 50%,
      red 0%,
      red 100%);
}

.vuecal__event.leisure {
  background-color: rgba(253, 156, 66, 0.9);
  border: 1px solid rgb(233, 136, 46);
  color: #fff;
}

.vuecal__event.health-accepted {
  background: linear-gradient(to right,
      rgba(164, 230, 210, 0.9) 0%,
      rgba(164, 230, 210, 0.9) 50%,
      green 0%,
      green 100%);
}

.vuecal__event.health-denied {
  background: linear-gradient(to right,
      rgba(164, 230, 210, 0.9) 0%,
      rgba(164, 230, 210, 0.9) 50%,
      red 0%,
      red 100%);
}

.vuecal__event.health {
  background-color: rgba(164, 230, 210, 0.9);
  border: 1px solid rgb(144, 210, 190);
}

.vuecal__event.sport-accepted {
  background: linear-gradient(to right,
      rgba(255, 102, 102, 0.9) 0%,
      rgba(255, 102, 102, 0.9) 50%,
      green 0%,
      green 100%);
}

.vuecal__event.sport-denied {
  background: linear-gradient(to right,
      rgba(255, 102, 102, 0.9) 0%,
      rgba(255, 102, 102, 0.9) 50%,
      red 0%,
      red 100%);
}


.vuecal__event.sport {
  background-color: rgba(255, 102, 102, 0.9);
  border: 1px solid rgb(235, 82, 82);
  color: #fff;
}

.vuecal__event.custom {
  background-color: rgba(164, 179, 230, 0.9);
  border: 1px solid rgb(144, 210, 190);
}


.vuecal__event {
  cursor: pointer;
}
</style>
 