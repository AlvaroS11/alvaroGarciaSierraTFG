<template>
    <v-form v-model="valid">
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field v-model="start" label="Start Time" type="time" required></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field v-model="end" label="End Time" type="time" required></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="title" label="Title" required></v-text-field>
        </v-col>

        <v-select
          :items="returnCustomTypes"
          v-model="this.type"
          placeholder="Type"
          @change="this.type = $event"
          :value="this.type" />
        <!--
        <v-col cols="12">
          <v-text-field v-model="type" label="Type"></v-text-field>
        </v-col>-->
        <v-col cols="12">
          <v-textarea v-model="description" label="Description"></v-textarea>
        </v-col>
       
        
      </v-row>
    </v-form>
  </template>
  


  
  <script>
import {utils} from './methods/utils'
import { defineEmits } from 'vue';
import store from './store'
import { mapGetters } from 'vuex'


  export default {
props : {
    selectedEvent : {
        type: Object,
        required : true
    },
    parent: {
      type: Object,
      required: true,
    },
   /* snackbar : {
      type: Boolean,
      required : true
    }*/
},

    data() {
      return {
        valid: false,
        start: '',
        end: '',
        title: '',
        type: '',
        description: '',

        timeStart: ''
      };
    },

    methods: {
      submit() {
        if(!utils.validateTime(this.start) && !utils.validateTime(this.end)){
                const snackbarData = {
                text: "Start and End Times must be completed",
                color: "red",
                timeout: 3000,
            };
              //this.$emit("snackbar", true, snackbarData); // emit the 'snackbar' event with the value 'true' and the snackbar data object
              this.$emit("snackbar", true, snackbarData)
              return
        }
        if(this.title == ""){
          
          const snackbarData = {
                text: "Title is compulsary",
                color: "red",
                timeout: 3000,
            };
              //this.$emit("snackbar", true, snackbarData); // emit the 'snackbar' event with the value 'true' and the snackbar data object
              this.$emit("snackbar", true, snackbarData)
              return
          }
            
            if(utils.isTime1SmallerrThanTime2(this.start, this.end)){
                
              this.timeStart = utils.formatDate(this.selectedEvent.start)
              
              this.start = utils.formatDate(this.selectedEvent.start) + " " + this.start
              this.end = utils.formatDate(this.selectedEvent.end) + " " + this.end
              const data = {
                start : this.start,
                end : this.end,
                type : this.type,
                title: this.title,
                description : this.description,
                sub : this.$store.state.userInfo.sub
              }
              
              this.submitlead(data)
              }
              else {
                

                const snackbarData = {
                text: "End Time must be bigger than Start Time!",
                color: "red",
                timeout: 3000,
            };
              //this.$emit("snackbar", true, snackbarData); // emit the 'snackbar' event with the value 'true' and the snackbar data object
              this.$emit("snackbar", true, snackbarData)
              return
              }
        
      },

    
submitlead(data){

//authenticate and send userId
const info = {
  type : data.type,
  start : data.start,
  end: data.end,
  title : data.title,
  description : this.description,
  custom : true,
  class: 'leisure',
  sub: this.$store.state.userInfo.sub
}   
const headers = new Headers();
headers.append('authorizationToken', this.$store.state.userInfo.idToken);

  fetch('https://zdn41z77wc.execute-api.us-east-1.amazonaws.com/Prod/lead', {
        method: 'POST',
        body: JSON.stringify(info),
        headers: headers
      }).then(response => {
       
        if(!response.redirected){
this.snackbarText = 'Error creating Event, please reload the page' ;
this.snackbarColor = 'red';
this.snackbar = true;
}

else {

const stream = response.json();

return stream; 
}
}).then(values => {

this.$emit("closeDial")
const snackbarData = {
                text: "Succesfully created event",
                color: "green",
                timeout: 3000,
                success : true
            };
this.$emit("snackbar", true, snackbarData)

try{
store.dispatch('addLead', values.body)

}
catch(err){
        // show error message in snackbar

        this.snackbarText = 'Error: ' + err.message;
        this.snackbarColor = 'red';
        this.snackbar = true;
}
      });
    },
  },

  computed: {
  ...mapGetters([
      'returnCustomTypes'
      
    ]),


  }
}

  
  </script>
  