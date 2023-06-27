:time-step="calculateHeight()"
50"
<template>
  <div :class="this.cssMain" v-if="shouldShow">
    <!--todayButton-->
    <vue-cal class="vuecal--blue-theme" style="height: device-height" ref="calendar" :time-from="7 * 60"
      :time-to="23.5 * 60" :time-step="30" :disable-views="['years']" hide-title-bar events-on-month-view="short"
      :hide-weekends=notshowWeekends :events="events" :snap-to-time="15"
      :editable-events="{ title: false, drag: false, resize: false, delete: false, create: true }"
      :drag-to-create-event="false" 
      :on-event-create="onEventCreate" 
      :on-event-click="onEventClick">



      >
    </vue-cal>


    <v-dialog v-model="showDialog" max-width="40em">
      <v-card>
        <div :class="titleInfoClass">
          <!--<v-icon>{{ selectedEvent.icon }}</v-icon>
          MAYBE IMG OF LOCAL?
        -->
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

            <!--v-if          SI EN ESTE EVENT ESTA CONFIRMADO, NO MOSTRAR ACEPTAR DE NUEVO  -->
            <button
              v-if="!this.selectedEvent.replied && !this.selectedEvent.custom && this.selectedEvent.class != 'deleted'"
              class="button-accept" @click="acceptLead()"><img src="../assets/imgs/Accept.svg"
                class="accept-lead"></button>
            

            <!-- <button class="button-accept" @click="denyLead()"><img src="../imgs/Deny.svg" class="accept-lead"></button>-->
            <button class="button-accept" @click="confirmDeny()"><img src="../assets/imgs/Deny.svg"
                class="accept-lead"></button>

          </div>
        </v-card-text>
      </v-card>
    </v-dialog>


    <v-dialog v-model="showConfirmDelete" max-width="30em">
      <v-card>
        <div class="title-confirm">
          <!--Are you sure you want to delete this appointment at &nbsp; 
      <strong> {{ selectedEvent.start && selectedEvent.start.formatTime() }} </strong>
      -->
          <div class="confirm-del-msg"> Are you sure you want to delete this appointment at &nbsp; <strong> {{
            selectedEvent.start && selectedEvent.start.formatTime() }} </strong> </div>

          <v-spacer />


        </div>

        <p v-html="selectedEvent.description" />
        <span class="deleted-msg"><small><strong> It will be deleted permantly </strong></small></span>


        <br>
        <div style="display:flex; justify-content: center;">
          <button class="button-confirm" @click="denyLead()">Yes, delete event</button>
          <button class="button-confirm-keep" @click="{ this.showConfirmDelete = false; this.showConfirmDelete = false }">No,
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

          <!--QUITAR ITMES this.$store.state.
    [this.$store.state.locals[0].type]
    cambiar placeholder:placeholder="[this.$store.state.locals[0].name].toString()"
    -->
          <v-card-text>
            <v-window v-model="tab">
              <v-window-item value="one">
                <v-select v-if="showEventCreationDialog" :items="[this.$store.state.locals[0].type]"
                  v-model="selectedEvent.type" :placeholder="[this.$store.state.locals[0].type].toString()" disabled
                  @change="selectedEvent.type = $event" :value="selectedEvent.type" />





                <v-select :items="[this.$store.state.locals[0].name]"
                  :placeholder="[this.$store.state.locals[0].name].toString()" disabled item-text />



                <v-select :items="getTimeRanges" v-model="selectedEvent.hours" placeholder="Time"
                  @change="selectedEvent.hours = $event" item-title="readableTimes" return-object
                  :value="selectedEvent.hours" />

              


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

    <LocalFormView>

    </LocalFormView>
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

import VueCal from 'vue-cal'
import "../../css/vuecal.css"

import { useStore } from 'vuex'
import store from './store'
import { computed } from 'vue'
import { mapGetters } from 'vuex'
import { mapActions } from 'vuex'
import { utils } from './methods/utils'


import LocalFormView from '../views/LocalFormView.vue'
import InputLead from './InputLead.vue'

import { errorImg, successImg, colors, snackbarClose } from "../constants.js"



export default {
  components: { VueCal, InputLead, LocalFormView },

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
    snackbarClose: snackbarClose,

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

    activeMonth: '',

    snackbarMessage: 'abcdef',
    snackbarColor: 'green',
    snackbarTimeout: 5000,
    snackbarTop: true,
    snackbarImg: errorImg,


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

      (new_value, old_value) => { (this.activeView = new_value) }


    ),

      this.$watch(
        "$refs.calendar.view.startDate",
        (new_value, old_value) => {

          if (this.$refs.calendar.view.id == 'month') {
            this.activeMonth = utils.toNumberMonth(new_value)
            

            if (this.$refs.calendar.view.id == 'month' && !this.$store.state.userInfo.loadedMonths.includes(this.activeMonth)) {
              const dateHelper = this.$refs.calendar.view.firstCellDate
              const year = dateHelper.getFullYear();
              const month = String(dateHelper.getMonth() + 1).padStart(2, '0'); // add leading zero if needed
              const day = String(dateHelper.getDate()).padStart(2, '0')
              const firstMonday = `${year}-${month}-${day}`;

              const dateHelperLast = this.$refs.calendar.view.lastCellDate
              const yearLast = dateHelperLast.getFullYear();
              const monthLast = String(dateHelperLast.getMonth() + 1).padStart(2, '0'); // add leading zero if needed
              const dayLast = String(dateHelperLast.getDate()).padStart(2, '0')
              const lastSunday = `${yearLast}-${monthLast}-${dayLast}`;

              var dates = {
                firstMonday,
                lastSunday
              }

              store.dispatch('getLocalsEvents', dates)


            }
          }
        }
      )

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
      if (data.success)
        this.snackbarImg = successImg

      /* setTimeout(() => {
         this.snackbar = false;
       }, this.snackbarTimeout);*/
    },



    closeDial() {

      this.showEventCreationDialog = false

    },



    onEventCreate(event, deleteEventFunction) { 

      this.isLoading = false

      this.selectedEvent = event
      this.showEventCreationDialog = true
      this.deleteEventFunction = deleteEventFunction

      this.selectedEvent.day = this.formatDate(this.selectedEvent.start)


      this.selectedEvent.local = {}
      this.selectedEvent.local.localId = this.$store.state.locals[0].localId

      event = null
      return event
    },
    cancelEventCreation() {
      this.deleteEventFunction()
      this.selectedEvent.local = {}
      this.selectedEvent.local.localId = this.$store.state.locals[0].localId
      this.showEventCreationDialog = false

    },
    closeCreationDialog() {

      /* if(!this.selectedEvent.hours){
           this.snackbarText = 'Error: ' + "ALL CAMPS MUST BE SELECTED";
             this.snackbarColor = 'red';
             this.snackbar = true;
       }*/

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
          this.showEventCreationDialog = false
          var hourMin = this.selectedEvent.hours.split(':')
          var time_rest = hourMin[1].split(" ")


          var startH = new Date(this.selectedEvent.start)
          startH.setHours(hourMin[0], time_rest[0])


          this.selectedEvent.start = this.formatDate(startH) + " " + startH.getHours().toString().padStart(2, '0') + ":" + startH.getMinutes().toString().padStart(2, '0');

          var endH = this.getEndTime(this.selectedEvent.start, this.$store.state.locals[0].settings.timePeriod)

          this.selectedEvent.end = endH

          this.selectedEvent.class = 'custom'
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

    submitlead(data) {
      var quitSpaces = data.hours.split(' ')
      const hourMin = quitSpaces[0].split(':')
      const hours = Number(hourMin[0] * 60) + Number(hourMin[1])


      const localSelected = this.$store.state.locals.filter(element => {
        return element.localId == data.local.localId;
      });




      const localName = localSelected[0].name


      const info = {
        type: 'custom',
        start: data.start,
        end: data.end,
        localId: data.local.localId,
        name: data.name,
        title: localName,
        accepted: true,
        hours: hours.toString(),
        sub: this.$store.state.userInfo.sub
      }
      var head = new Headers();
      head.append('authorizationToken', this.$store.state.userInfo.idToken);


      fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead', {
        method: 'POST',
        body: JSON.stringify(info),
        headers: head,
        redirect: 'follow'
      }).then(response => {

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
      }).then(async values => {

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
          await store.dispatch('getTimes', data)
            .then(this.returnAvailableTimes(this.$store.state.locals[0].localId, this.selectedEvent.day))
        }
        this.showEventCreationDialog = false
      })

    },

    confirmDeny() {
      this.showConfirmDelete = true;

    },

    denyLead() {

      const headers = new Headers();
      headers.append('authorizationToken', this.$store.state.userInfo.idToken);


      const data = {
        allow: true,
        accepted: false,
        localId: this.$store.state.locals[0].localId,
        day: utils.formatDate(this.selectedEvent.start),
        timeMinutes: this.selectedEvent.startTimeMinutes
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
          this.showConfirmDelete = false
          this.snackbarText = 'Succesfully denied appointment';
          this.snackbarColor = colors.success;
          this.snackbarImg = successImg
          this.snackbar = true;

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

    acceptLead(accepted) {

      const headers = new Headers();
      headers.append('authorizationToken', this.$store.state.userInfo.idToken);

      const data = {
        allow: true,
        accepted: true,
        localId: this.selectedEvent.localId,

      }
      fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead/' + this.selectedEvent.id, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: headers

        ///ADD AUTH LOCAL

      }).then(response => {
        if (response.status == 200) {

          var data = {
            id: this.selectedEvent.id,
            accepted: true
          }
          store.dispatch('confirmLead', data)
          this.showDialog = false;
          this.snackbarText = 'Succesfully accepted appointment';
          this.snackbarColor = colors.success;
          this.snackbarImg = successImg
          this.snackbar = true;
        } else {
          // show error message in snackbar
          this.snackbarText = 'Error accepting appointment';
          this.snackbarColor = colors.error;
          this.snackbarImg = errorImg
          this.snackbar = true;
        }
      }).catch(error => {
        // show error message in snackbar
        this.snackbarText = 'Error accepting appointment';
        this.snackbarColor = colors.error;
        this.snackbarImg = errorImg
        this.snackbar = true;
      });
    }
  },


  ...mapActions([
    'postLeadC',
    'getTimes'
  ]),
  computed: {
    // Métodos que solo se evaluan si sus dependencias han cambiado (son cacheadas y no se ejecutan si el valor no va a cambiar)
    titleInfoClass() {

      if (this.selectedEvent.accepted === true) {
        return 'TitleInfo healthColor'
      }
      else if (this.selectedEvent.accepted === false) {
        return 'TitleInfo sportColor'
      }
    },


    localSel() {
      //
      return this.selectedEvent.local
    },

    getTimeRanges() {

      try {
        const selectedRanges = this.$store.state.timeRanges.filter(element => {
          return element.day == this.selectedEvent.day;
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
          localId: this.$store.state.locals[0].localId,
          day: this.selectedEvent.day,
        }
        var times = this.returnAvailableTimes(this.$store.state.locals[0].localId, this.selectedEvent.day)



        if (times == -1) {

          this.isLoading = true
          await store.dispatch('getTimes', data)
            .then(times = this.returnAvailableTimes(this.$store.state.locals[0].localId, this.selectedEvent.day))
        }

        this.selectedItems = times
      } catch (err) {

        throw new Error(err)
      }
    }

  }
}
</script>

<style>
@import "../assets/shared.css";
</style>
 