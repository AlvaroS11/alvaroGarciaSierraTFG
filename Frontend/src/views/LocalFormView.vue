<template>
  <v-card class="userForm">
    <v-card-title>Local Information</v-card-title>
    <v-card-text>
      <v-form v-model="valid" @submit.prevent="submitForm">

        <v-text-field v-model="name" label="Name"></v-text-field>
        <v-text-field v-model="family_name" label="family_name"></v-text-field>
        <v-text-field v-model="phone" label="Phone" :rules="[rules.phone]"></v-text-field>
        <small>* The original email will still be used to Sign In</small>
        <v-text-field v-model="email" label="Email" :rules="[rules.email]"></v-text-field>
        <v-select :items="cities" v-model="city" placeholder="City" label="Select your location" @change="city = $event"
          item-title="name" :value="city" />
        <label>
          <br>
          <input type="checkbox" id="cbox1" value="ChangeSettings" v-model="ChangeSettings">
          Change Settings
        </label>
        <br>
        <br>
        <div class="timePick" v-if="ChangeSettings">
          <span> *If you change the local time settings, allready existing events may be deleted </span>
          <br>
          <br>
          <small class="timePick">Select your business starting time</small>
          <br>
          <input class="timePicker" type="time" v-model="startTime">
          <br>
          <br>
          <small>Select your business end Time</small>
          <br>
          <input class="timePicker" type="time" v-model="endTime">
          <br>
          <label>
            <br>
            <input type="checkbox" id="cbox1" value="isBreak" v-model="isBreak">
            There is a break time
          </label>
          <br>
          <br>
          <span v-if="isBreak">
            <small class="timePick">Select your business break time</small>
            <br>
            <input class="timePicker" type="time" v-model="pauseStart">
            <br>
            <span>
              <small class="timePick">Select your business resume time</small>
              <br>
              <input class="timePicker" type="time" v-model="pauseStop">
              <br>
            </span>
          </span>

          <span>
            <small class="timePick">Select the average time your service takes (hh/mm)</small>
            <br>
            <input class="timePicker" type="time" required v-model="timePeriod">
            <br>
          </span>

          <span>
            <small class="timePick">Select the maximum number of people who can attend an appointment.</small>
            <br>
            <input class="timePicker" type="number" required v-model="maxPers">
            <br>
          </span>


        </div>
        <!--  <v-btn type="submit" :disabled="!valid">Update</v-btn>
        -->
        <v-btn type="submit" :disabled="!isFormValid">Update</v-btn>
      </v-form>
    </v-card-text>
  </v-card>


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
import { mapState, mapActions } from 'vuex'
import store from '../components/store'
import { computed } from 'vue'
import { utils } from '../components/methods/utils.js'
import { errorImg, successImg, colors } from '../constants.js'



export default {
  name: "localForm",
  components: {


  },
  data() {
    return {
      name: '',
      family_name: '',
      phone: '',
      email: '',
      city: '',

      ChangeSettings: false,
      startTime: 0,
      endTime: 0,
      isBreak: false,
      pauseStart: 0,
      pauseStop: 0,
      timePeriod: 0,

      maxPers: 0,



      snackbar: false,
      snackbarText: '',
      snackbarTimeout: 4000,

      snackbarColor: "green",
      snackbarClose: "white",
      snackbarImg: errorImg,

      valid: false,
      rules: {
        //required: value => !!value || 'Required.',
        email: value => {
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return pattern.test(value) || 'Invalid email address.'
        },
        phone: value => {
          const phoneNumberRegex = /^\d{10}$/
          const phoneNumberRegex1 = /^\d{11}$/
          const phoneNumberRegex2 = /^\d{9}$/;
          return (phoneNumberRegex.test(value) || phoneNumberRegex1.test(value) || phoneNumberRegex2.test(value)) || 'Invalid phone number.'
        },
        pauseStop: value => {

          return utils.minToTime(value) > utils.minToTime(this.pauseStart) || 'Resume time must be after break time'
        }
      },
      types: computed(() => store.getters.returnTypes),

      cities: computed(() => store.getters.returnCities)
    }
  },
  async created() {
    try {
      if (this.onCreation()) {

        setTimeout(() => {
          this.onCreation()
        }, 1000);
      }
    }
    catch (err) {
      setTimeout(() => {
        this.onCreation()
      }, 1000);
    }
  },


  computed: {
    ...mapState(['locals']),
    isFormValid() {
      // check if any field in the form data is different from the data in the Vuex store
      try {
        const formKeys = ['name', 'family_name', 'email', 'phone', 'city' /*...*/]
        const formValues = formKeys.map(key => this[key])

        // Check if any form value is different from the store value
        return (formValues.some((value, index) => value !== this.locals[0][formKeys[index]]) || this.ChangeSettings) && (this.rules.phone(this.phone) == true)// && this.rules.email(this.email) == true) && this.rules.pauseStop(this.pauseStop) == true
      }
      catch (err) {
        console.log(err)
        return false
      }
    },

  },

  beforeMount() {
  },

  methods: {
    ...mapActions(['updateUser']),

    async onCreation() {
      try {
        this.name = this.locals[0].name
        this.family_name = this.locals[0].family_name
        this.phone = this.locals[0].phone
        this.email = this.locals[0].email
        this.city = this.locals[0].city

        this.startTime = utils.minToTime(this.locals[0].settings.open)

        this.endTime = utils.minToTime(this.locals[0].settings.close)

        this.timePeriod = utils.minToTime(this.locals[0].settings.timePeriod)

        this.maxPers = this.locals[0].settings.peoplePerPeriod

        if (this.locals[0].settings.hasOwnProperty('pauseStart')) {
          this.isBreak = true
          this.pauseStart = utils.minToTime(this.locals[0].settings.pauseStart)
          this.pauseStop = utils.minToTime(this.locals[0].settings.pauseStop)
        }
        if (this.name == "")
          return false

        else
          return true
      } catch (err) {
        return false
      }
    },


    async submitForm() {
      const payload = {
        localId: this.locals[0].localId,
        name: this.name,
        family_name: this.family_name,
        phone: this.phone,
        email: this.email,
        type: this.locals[0].type
      }



      if (this.ChangeSettings) {

        payload.settings = {
          close: utils.toMinutes(this.endTime),
          // close : "fasdfa",
          open: utils.toMinutes(this.startTime),
          timePeriod: utils.toMinutes(this.timePeriod),
          peoplePerPeriod: this.maxPers
        }
        if (payload.settings.close < payload.settings.open) {
          this.snackbarText = 'Ending time must be after starting time'
          this.snackbar = true;
          this.snackbarColor = 'red';
          this.snackbarImg = errorImg;
          return
        }
        if (this.isBreak) {
          payload.settings.pauseStart = utils.toMinutes(this.pauseStart)
          payload.settings.pauseStop = utils.toMinutes(this.pauseStop)

          if (payload.settings.pauseStop < payload.settings.pauseStart) {
            this.snackbarText = 'Resume time must be after break time'
            this.snackbarColor = 'red';
            this.snackbarImg = errorImg
            this.snackbar = true;
            return
          }
        }
        if (isNaN(this.maxPers) || this.maxPers == null || 0 >= this.maxPers > 2000) {
          this.snackbarText = 'Maximum number of people must be a number between 1 and 2000'
        }
      }
      else {
        delete payload.settings
      }



      const headers = new Headers();
      headers.append('authorizationToken', this.$store.state.userInfo.idToken);
      fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/local', {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: headers
      }
      )
        .then(response => {
          if (response.status == 200) {

            store.commit('_updateUserInfo', payload);
            this.snackbarText = 'Succesfully updated settings';
            this.snackbarColor = colors.success;
            this.snackbarImg = successImg
            this.snackbar = true;
          }
          else {
            this.snackbarText = 'Error updating settings';
            this.snackbarColor = colors.error;
            this.snackbarImg = errorImg
            this.snackbar = true;
          }
        })
        .catch(error => {
          this.snackbarText = 'Error updating settings';
          this.snackbarColor = colors.error;
          this.snackbarImg = errorImg
          this.snackbar = true;
        })
    }
  }
}
</script>
      
    
<style>
.userForm {
  margin: auto;
  width: 60%;
  position: relative;
  top: 10rem;
}

.SnackbarText {
  display: flex;
  align-items: center;
  align-self: center;
}
</style>