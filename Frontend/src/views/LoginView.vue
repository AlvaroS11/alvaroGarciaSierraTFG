<script setup>
import {
  Authenticator,
  // AuthenticatorSignUpFormFields,
  // Vue Composable to get access to validation errors
  useAuthenticator,
  // Amplify UI Primitives to simplify the custom fields
} from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css';

import { toRefs } from 'vue';
import { Auth } from 'aws-amplify';
import UserView from './UserView.vue';
import LocalView from './LocalView.vue';
import store from '../components/store';
import { computed, ref, watch } from 'vue';
import { utils } from '../components/methods/utils';


const { validationErrors } = toRefs(useAuthenticator());


let isLocalBool = false;

const services = {
  async validateCustomSignUp(formData) {
    if (!formData.acknowledgement) {
      return {
        acknowledgement: 'You must agree to the Terms & Conditions',
      };
    }
  },
  async handleSignUp(formData) {

    let { username, password, attributes } = formData;




    let isLocal = "false"
    if (isLocalBool)
      isLocal = "true"
    if (!isLocalBool) {
      return Auth.signUp({
        username,
        password,
        attributes: {
          name: attributes.name,
          family_name: attributes.family_name,
          'custom:isLocal': isLocal,
          'custom:city': city,
          'custom:type': type
        },
        autoSignIn: {
          enabled: true,
        },
      });
    }

    else if (isLocalBool) {

      //NOT WORKING SIEMPRE SE METE AQUÍ AUNQUE NO SEA LOCAL Y AUNQUE NO ESTE MARCADO ISBREAK



      const starting = utils.toMinutes(startTime)
      const ending = utils.toMinutes(endTime)
      const sBreak = utils.toMinutes(stoptTime)
      const sResume = utils.toMinutes(resumeTime)
      const sTime = utils.toMinutes(avgTime)

      const sPers = maxPers

      if (startTime == '') {
        throw new Error('Starting Time is compulsary')
      }
      else if (endTime == '')
        throw new Error('Ending Time is compulsary')
      else if (type == '') {
        throw new Error('The type of your bussiness is compulsary')
      }
      else if (city == '') {
        throw new Error('The city is compulsary')
      }
      else if (avgTime == '00:00') {
        throw new Error('Average Time is compulsary')
      }
      else if (starting > ending)
        throw new Error('Starting Time must be less than Ending Time')
      else if (isBreak.value) {

        if (sBreak == '' || sResume == '' || isNaN(sBreak) || isNaN(sResume)) {
          throw new Error('Uncheck Break Time or select it´s time period')
        }
        else if (sBreak > sResume) {
          throw new Error('Start of Break Time must be less than Resume Time')
        }
      }
      else if (maxPers == null)
        throw new Error('Maximum number of people is compulsary')
      else if (isNaN(maxPers))
        throw new Error('Maximum number of people must be a number')
      else if (maxPers <= 0 || maxPers > 2000)
        throw new Error('Maximum number of people must be between 1 and 2000')







      const settings = {
        timePeriod: sTime,
        pauseStart: sBreak,
        close: ending,
        open: starting,
        pauseStop: sResume,
        maxPers: maxPers
      }
      const customSettings = JSON.stringify(settings)
      return Auth.signUp({
        username,
        password,
        attributes: {
          name: attributes.name,
          family_name: attributes.family_name,
          'custom:isLocal': isLocal,
          'custom:city': city,
          'custom:type': type,
          'custom:settings': customSettings
        },
        autoSignIn: {
          enabled: true,
        },
      });
      //}
    }
  },
};

const types = computed(() => store.getters.returnTypes)

const cities = computed(() => store.getters.returnCities)

let type = ''

let city = ''

let startTime = ''

let stoptTime = ''

let resumeTime = ''

let endTime = ''

let avgTime = '00:00'

let maxPers = 1

let isBreak = ref(false)


watch(isBreak, (currentValue, oldValue) => {
  if (currentValue == false) {
    stoptTime = ''
    resumeTime = ''
  }
})


</script>

<template>
  <authenticator variation="modal" initial-state="signUp" :services="services"
    :login-mechanisms="['email', 'name', 'family_name', 'custom:isLocal', 'custom:settings']">
    <template v-slot:sign-up-fields>
      <authenticator-sign-up-form-fields />
      <amplify-check-box :errorMessage="validationErrors.acknowledgement" />



      <div class="checkBoxBl">
        <v-checkbox v-model="isLocalBool" :label="`I am a store/shop/restaurant *`"></v-checkbox>
      </div>


      <span v-if="isLocalBool">

        <v-select :items="types" v-model="type" placeholder="Local" label="Select your store type" @change="type = $event"
          item-title="name" :value="type" />

        <v-select :items="cities" v-model="city" placeholder="City" label="Select your location" @change="city = $event"
          item-title="name" :value="city" />

        <div class="timePick">
          <small class="timePick">Select your business starting time</small>
          <br>
          <input class="timePicker" type="time" v-model="startTime">
          <br>
          <br>

          <small>Select your business end Time</small>
          <br>
          <input class="timePicker" type="time" v-model="endTime">
          <br>

          <!-- <v-checkbox
          v-model="isBreak"
          :label="'There is a break time'"
        ></v-checkbox>
-->
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
            <input class="timePicker" type="time" v-model="stoptTime">
            <br>
            <span>
              <small class="timePick">Select your business resume time</small>
              <br>
              <input class="timePicker" type="time" v-model="resumeTime">
              <br>
            </span>
          </span>

          <span>
            <small class="timePick">Select the average time your service takes (hh/mm)</small>
            <br>
            <input class="timePicker" type="time" required v-model="avgTime">
            <br>
          </span>

          <span>
            <small class="timePick">Select the maximum number of people who can attend an appointment.</small>
            <br>
            <input class="timePicker" type="number" required v-model="maxPers">
            <br>
          </span>


        </div>
      </span>

      <h6>* You need to mark this option if you want to offer your services to possible clients.
        This option cannot be changed later. Please enter the name of your business in the name box.
      </h6>
    </template>

    <span v-if="store.state.userInfo.isLocal == true">
      <LocalView></LocalView>
    </span>
    <span v-else>
      <Suspense>
        <UserView></UserView>
      </Suspense>

    </span>

    <template v-slot:sign-in-header>
      <h3> Welcome to Book-it </h3>
    </template>
    <template v-slot:sign-in-footer>
      <h3>Already a member? Sign in and start managing your bookings with ease!</h3>
    </template>

    <template v-slot:sign-up-header>
      <h3> Welcome to Book-it </h3>
    </template>
    <template v-slot:sign-up-footer>
      <h3>Join Book-it now and start booking your events!</h3>
    </template>
  </authenticator>
</template>

<style>
.timePick {
  text-align: justify !important;
}

.timePicker {
  text-align: center !important;
}

.checkBoxBl .v-selection-control {
  color: black !important;
}
</style>