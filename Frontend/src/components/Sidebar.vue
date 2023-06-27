<template>
  <div class="sidebar" :class="isOpened ? 'open' : ''" :style="cssVars">
    <div class="logo-details" style="margin: 6px 14px 0 14px;">
      <img v-if="menuLogo" :src="menuLogo" alt="menu-logo" class="menu-logo icon">
      <i v-else class="bx icon" :class="menuIcon" />
      <div class="logo_name">
        {{ menuTitle }}
      </div>
      <i class="bx" :class="isOpened ? 'bx-menu-alt-right' : 'bx-menu'" :style="{
        paddingLeft: isMobile ? '145%' : '',
        paddingBottom: isMobile ? '75px' : ''
      }" id="btn" @click="isOpened = !isOpened" />
    </div>

    <div v-if="!isMobile || isOpened"
      style="display: flex ; flex-direction:column; justify-content: space-between; flex-grow: 1; max-height: calc(100% - 60px); ">
      <div id="my-scroll" style="margin: 6px 14px 0 14px;">
        <menu>
          <ul class="nav-list" style="overflow: visible;">
            <li v-if="isSearch" @click="isOpened = true">
              <i class="bx bx-search" />
              <input type="text" :placeholder="searchPlaceholder"
                @input="$emit('search-input-emit', $event.target.value)">
              <span class="tooltip">{{ searchTooltip }}</span>
            </li>

            <li>
            <v-switch class="bx" :class="isOpened ? 'open' : ''" :style="'open'"
              color="blue" label="Weekends" hide-details="true" v-model="showWeekendesVar"
              > </v-switch>
              
            </li>

            <li>
              <a @click="goToForm">
                <i class="bx" :class="'bx-cog'" />
                <span class="links_name">Settings</span>

              </a>
              <span class="tooltip">Settings</span>

            </li>



            <span v-for="(menuItem, index) in menuItems" :key="index">
              <ul>
              <li>
                  <a :href="menuItem.link">
                    <i class="bx" :class="menuItem.icon || 'bx-square-rounded'" />
                    <span class="links_name">{{ menuItem.name }}</span>
                  </a>

                  <span class="tooltip">{{ menuItem.tooltip || menuItem.name }}</span>

                </li>
              </ul>

            </span>


            <li>
              <a>
                <i class="bx" :class="'bx-pie-chart-alt-2' || 'bx-square-rounded'" />
                <span class="links_name"> In development... </span>
              </a>

              <span class="tooltip">Analytics</span>
            </li>

          </ul>
        </menu>
      </div>

      <div v-if="isLoggedIn" class="profile">
        <div class="profile-details">
          <img v-if="profileImg" :src="profileImg" alt="profileImg">
          <i v-else class="bx bxs-user-rectangle" />
          <div class="name_job">
            <div class="name">
              {{ profileName }}
            </div>

          </div>
        </div>
        <i v-if="isExitButton" class="bx bx-log-out" id="log_out" @click.stop="resetStore" />
      </div>
    </div>

  </div>
</template>
  
<script>
import { mapActions } from 'vuex'
import store from './store'
import { Auth } from 'aws-amplify'


export default {
  name: 'Sidebar',
  props: {
    isMenuOpen: {
      type: Boolean,
      default: false,
    },
    menuTitle: {
      type: String,
      default: 'Dashboard',
    },
    menuLogo: {
      type: String,
      default: '/favicon.ico',
    },
    menuIcon: {
      type: String,
      default: 'bxl-c-plus-plus',
    },
    isPaddingLeft: {
      type: Boolean,
      default: true,
    },
    menuOpenedPaddingLeftBody: {
      type: String,
      default: '250px'
    },
    menuClosedPaddingLeftBody: {
      type: String,
      default: '78px'
    },

    isMobile: {
      type: Boolean,
      default: false
    },

    menuItems: {
      type: Array,
      default: () => [
        {
          link: '/',
          name: 'Calendar',
          tooltip: 'Calendar',
          icon: 'bxs-calendar',
        },
        {
          link: '/',
          name: 'In development...',
          tooltip: 'In development...',
          icon: 'bx-user',
        },
        {
          link: '#',
          name: 'Notifications',
          tooltip: 'Messages',
          icon: 'bx-chat',
        },
      ],
    },

    isSearch: {
      type: Boolean,
      default: true,
    },
    searchPlaceholder: {
      type: String,
      default: 'In development',
    },
    searchTooltip: {
      type: String,
      default: 'Search',
    },

    profileImg: {
      type: String,
    },
    profileName: {
      type: String,
      default: 'Profile Name',
    },
    isExitButton: {
      type: Boolean,
      default: true,
    },
    isLoggedIn: {
      type: Boolean,
      default: true,
    },

    bgColor: {
      type: String,
      default: '#11101d',
    },
    secondaryColor: {
      type: String,
      default: '#1d1b31',
    },
    homeSectionColor: {
      type: String,
      default: '#e4e9f7',
    },
    logoTitleColor: {
      type: String,
      default: '#fff',
    },
    iconsColor: {
      type: String,
      default: '#fff',
    },
    itemsTooltipColor: {
      type: String,
      default: '#e4e9f7',
    },
    searchInputTextColor: {
      type: String,
      default: '#fff',
    },
    menuItemsHoverColor: {
      type: String,
      default: '#fff',
    },
    menuItemsTextColor: {
      type: String,
      default: '#fff',
    },
    menuFooterTextColor: {
      type: String,
      default: '#fff',
    },
    sidebarHeight: {
      type: String,
      default: "100%"
    }
  },
  data() {
    return {
      local: 'In development...', owner: 'POST ID', start: '2023-01-15 16:30', end: '2023-01-15 17:30', class: 'health',
      lastKey: null,

      isOpened: false,

      showWeekendesVar: false
    }
  },
  mounted() {
    this.isOpened = this.isMenuOpen
    /*   if(this.isMobile)   
         this.sidebarHeight = "10%"
       else 
         this.sidebarHeight = "100%"
     */
  },
  computed: {
    cssVars() {
      var height = "100%"
      var withH = "5rem"
      if (this.isOpened) {
        height = "100%"
        withH = "250px"
      }
      else if (this.isMobile) {
        height = this.sidebarHeight
        withH = "3rem"
      }
      else {
        withH = "5rem"
      }
      return {
        '--bg-color': this.bgColor,
        '--secondary-color': this.secondaryColor,
        '--home-section-color': this.homeSectionColor,
        '--logo-title-color': this.logoTitleColor,
        '--icons-color': this.iconsColor,
        '--items-tooltip-color': this.itemsTooltipColor,
        '--serach-input-text-color': this.searchInputTextColor,
        '--menu-items-hover-color': this.menuItemsHoverColor,
        '--menu-items-text-color': this.menuItemsTextColor,
        '--menu-footer-text-color': this.menuFooterTextColor,
        'height': height,
        'width': withH

      }
      
    },
  },
  watch: {
    isOpened() {
    },
    showWeekendesVar: function(val) {
      this.$emit('showWeek', this.showWeekendesVar)
    }
  },

  methods: {
    ...mapActions([
      'postLead',
      'resetStore'
    ]),

    goToForm() {

      this.$emit('calendarOpt')
    },

    resetStore() {
      Auth.signOut()
        .then(() => {
          store.dispatch('resetStore')
        })
    },

    getFirstMondayAndLastSunday() {
      // Get the current year and month
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      // Get the first day of the month
      const firstDayOfMonth = new Date(year, month - 1, 1);
      let firstMonday = new Date();
      if (firstDayOfMonth.getDay() === 1) {
        // First day is a Monday
        firstMonday = firstDayOfMonth.getDate();
      }
      else {
        // First day is some other day

        firstMonday.setDate(2 - firstDayOfMonth.getDay());
        firstMonday = firstMonday.toISOString().substring(0, 10)
      }

      // Get the last day of the month
      const lastDayOfMonth = new Date(year, month, 0);

      // Check if the last day is a Sunday
      if (lastDayOfMonth.getDay() === 0) {
        // Last day is a Sunday, return it
        var lastSunday = lastDayOfMonth.toISOString().substring(0, 10);
      } else {
        // Last day is not a Sunday, find the first Sunday of the next month
        var daysForward = (7 - lastDayOfMonth.getDay()) % 7;
        var lastSunday = new Date(year, month, daysForward + 1).toISOString().substring(0, 10);
      }

      return {
        firstMonday,
        lastSunday
      };
    }
  }

}
</script>
  
  headers: {
    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
  },

  
<style>
/* Google Font Link */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap');
@import url('https://unpkg.com/boxicons@2.0.7/css/boxicons.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

body {
  transition: all 0.5s ease;
}

.bx.bx-menu-mobile {
  padding-left: 145%;
  padding-bottom: 75px;

  content: "\eac1";
}

.menu-logo {
  width: 30px;
  margin: 0 10px 0 10px;
}

.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;

  min-height: min-content;
  /* overflow-y: auto; */
  width: 5rem;
  background: var(--bg-color);
  /* padding: 6px 14px 0 14px; */
  z-index: 99;
  transition: all 0.5s ease;
}

.sidebar.open {
  width: 250px;
}

.sidebar .logo-details {
  height: 60px;
  display: flex;
  align-items: center;
  position: relative;
}

.sidebar .logo-details .icon {
  opacity: 0;
  transition: all 0.5s ease;
}

.sidebar .logo-details .logo_name {
  opacity: 0;
  pointer-events: none;
  color: var(--logo-title-color);
  font-size: 20px;
  font-weight: 600;
  transition: all 0.5s ease;
}

.sidebar.open .logo-details .icon,
.sidebar.open .logo-details .logo_name {
  opacity: 1;
}

.sidebar .logo-details #btn {
  position: absolute;
  top: 45%;
  right: 0;
  transform: translateY(-50%);
  font-size: 22px;
  transition: all 0.4s ease;
  font-size: 23px;
  text-align: center;
  cursor: pointer;
  transition: all 0.5s ease;
}

.sidebar.open .logo-details #btn {
  text-align: right;
}

.sidebar i {
  color: var(--icons-color);
  height: 60px;
  min-width: 50px;
  font-size: 28px;
  text-align: center;
  line-height: 60px;
}

.sidebar .nav-list {
  margin-top: 20px;
  /* margin-bottom: 60px; */
  /* height: 100%; */
  /* min-height: min-content; */
}

.sidebar li {
  position: relative;
  margin: 8px 0;
  list-style: none;
}

.sidebar li .tooltip {
  position: absolute;
  top: -20px;
  left: calc(100% + 15px);
  z-index: 3;
  background: var(--items-tooltip-color);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 400;
  opacity: 0;
  white-space: nowrap;
  pointer-events: none;
  transition: 0s;
}

.sidebar li:hover .tooltip {
  opacity: 1;
  pointer-events: auto;
  transition: all 0.4s ease;
  top: 50%;
  transform: translateY(-50%);
}

.sidebar.open li .tooltip {
  display: none;
}

.sidebar input {
  font-size: 15px;
  color: var(--serach-input-text-color);
  font-weight: 400;
  outline: none;
  height: 50px;
  width: 100%;
  width: 50px;
  border: none;
  border-radius: 12px;
  transition: all 0.5s ease;
  background: var(--secondary-color);
}

.sidebar.open input {
  padding: 0 20px 0 50px;
  width: 100%;
}

.sidebar .bx-search {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  font-size: 22px;
  background: var(--secondary-color);
  color: var(--icons-color);
}

.sidebar.open .bx-search:hover {
  background: var(--secondary-color);
  color: var(--icons-color);
}

.sidebar .bx-search:hover {
  background: var(--menu-items-hover-color);
  color: var(--bg-color);
}

.sidebar li a {
  display: flex;
  height: 100%;
  width: 100%;
  border-radius: 12px;
  align-items: center;
  text-decoration: none;
  transition: all 0.4s ease;
  background: var(--bg-color);
}

.sidebar li a:hover {
  background: var(--menu-items-hover-color);
}

.sidebar li a .links_name {
  color: var(--menu-items-text-color);
  font-size: 15px;
  font-weight: 400;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: 0.4s;
}

.sidebar.open li a .links_name {
  opacity: 1;
  pointer-events: auto;
}

.sidebar li a:hover .links_name,
.sidebar li a:hover i {
  transition: all 0.5s ease;
  color: var(--bg-color);
}

.sidebar li i {
  height: 50px;
  line-height: 50px;
  font-size: 18px;
  border-radius: 12px;
}

.sidebar div.profile {
  position: relative;
  height: 60px;
  width: 78px;
  /* left: 0;
      bottom: 0; */
  padding: 10px 14px;
  background: var(--secondary-color);
  transition: all 0.5s ease;
  overflow: hidden;
}

.sidebar.open div.profile {
  /* width: 250px;
      transition: all 0.5s ease;*/
  width: 100%;

}

.sidebar div .profile-details {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  height: 100%;
}

.sidebar div img {
  height: 45px;
  width: 45px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 10px;
}

.sidebar div.profile .name,
.sidebar div.profile .job {
  font-size: 15px;
  font-weight: 400;
  color: var(--menu-footer-text-color);
  white-space: nowrap;
}

.sidebar div.profile .job {
  font-size: 12px;
}

.sidebar .profile #log_out {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  background: var(--secondary-color);
  width: 100%;
  height: 60px;
  line-height: 60px;
  border-radius: 0px;
  transition: all 0.5s ease;
}

.sidebar.open .profile #log_out {
  width: 50px;
  background: var(--secondary-color);
  opacity: 0;
}

.sidebar.open .profile:hover #log_out {
  opacity: 1;
}

.sidebar.open .profile #log_out:hover {
  opacity: 1;
  color: red;
}

.sidebar .profile #log_out:hover {
  color: red;
}

.home-section {
  position: relative;
  background: var(--home-section-color);
  min-height: 100vh;
  top: 0;
  left: 78px;
  width: calc(100% - 78px);
  transition: all 0.5s ease;
  z-index: 2;
}

.sidebar.open~.home-section {
  left: 250px;
  width: calc(100% - 250px);
}

.home-section .text {
  display: inline-block;
  color: var(--bg-color);
  font-size: 25px;
  font-weight: 500;
  margin: 18px;
}

.my-scroll-active {
  overflow-y: auto;
}

#my-scroll {
  overflow-y: auto;
  height: calc(100% - 60px);
}

#my-scroll::-webkit-scrollbar {
  display: none;
  /* background-color: rgba(255, 255, 255, 0.2); 
      width: 10px;
      border-radius:5px  */
}

/* #my-scroll::-webkit-scrollbar-thumb{
      background-color: red;
      border-radius:5px 
    }
    #my-scroll::-webkit-scrollbar-button:vertical:start:decrement{
      display:none;
    }
    #my-scroll::-webkit-scrollbar-button:vertical:end:increment{
      display:none;
    } */

.sidebar.open .profile #log_out {
  opacity: 1;
}

@media (max-width: 420px) {
  .sidebar li .tooltip {
    display: none;
  }
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.v-input__details{
    min-height: none !important;
  }

 .v-selection-control {
     color: white !important  
}

.v-label {
  opacity: 1 !important
}
</style>