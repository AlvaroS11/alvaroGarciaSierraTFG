<template>
  <v-card class="userForm">
    <v-card-title>User Information</v-card-title>
    <v-card-text>
      <v-form v-model="valid" @submit.prevent="submitForm">
        <v-text-field v-model="name" label="Name" required></v-text-field>
        <v-text-field v-model="surname" label="Surname" required></v-text-field>
        <v-text-field v-model="phone" label="Phone" :rules="[rules.phone]" required></v-text-field>
        <v-text-field v-model="email" label="Email" :rules="[rules.email]" required></v-text-field>
        <v-btn type="submit" :disabled="!isFormValid">Update</v-btn>
      </v-form>
      <br>
      <small>* The original email will still be used to Sign In</small>

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
import { errorImg, successImg, colors } from '../constants.js'


export default {
  name: "userFormView",


  computed: {
    ...mapState(['userInfo']),

    isFormValid() {
      try{
    const formKeys = ['name','surname', 'email', 'phone', 'city' /*...*/]
    const formValues = formKeys.map(key => this[key])
    
        // Check if any form value is different from the store value
       return formValues.some((value, index) => value !== this.userInfo[formKeys[index]])  && (this.rules.phone(this.phone) == true && this.rules.email(this.email) == true)
      }
      catch(err){
        console.log(err)
        return false
      }
    },

  },
  data() {
    return {
      name: '',
      surname: '',
      phone: '',
      email: '',

      snackbar: false,
      snackbarText: '',
      snackbarTimeout: 4000,
      snackbarColor: "green",
      snackbarClose: "white",
      snackbarImg: errorImg,


      valid: true,
      rules: {
        email: value => {
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return pattern.test(value) || 'Invalid email address.'
        },
        phone: value => {
          const phoneNumberRegex = /^\d{10}$/
          const phoneNumberRegex1 = /^\d{11}$/
          const phoneNumberRegex2 = /^\d{9}$/;
          return (phoneNumberRegex.test(value) || phoneNumberRegex1.test(value) || phoneNumberRegex2.test(value)) || 'Invalid phone number.'
        }
      }
    }
  },
  created() {

    try {
      if (this.onCreation()) {

        console.log(err)

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
  methods: {
    ...mapActions(['updateUser']),

    async onCreation() {
      try{
      this.name = this.userInfo.name
      this.surname = this.userInfo.surname
      this.phone = this.userInfo.phone
      this.email = this.userInfo.email

      if (this.name == "") 
        return false
      else
        return true
    }
    catch(err){
      return false
    }
    },

    async submitForm() {

      const payload = {
        userId: this.$store.state.userInfo.sub,
        name: this.name,
        surname: this.surname,
        phone: this.phone,
        email: this.email,
      }

      const headers = new Headers();
      headers.append('authorizationToken', this.$store.state.userInfo.idToken);
      fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/users', {
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