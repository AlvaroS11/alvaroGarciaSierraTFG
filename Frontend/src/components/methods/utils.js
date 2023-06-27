export const utils = {
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

toMinutes(time) {
    
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  },

  // function to check if time1 is greater than time2
isTime1SmallerrThanTime2(time1, time2) {
    const minutes1 = this.toMinutes(time1);
    const minutes2 = this.toMinutes(time2);
    
    return minutes1 < minutes2;
  },

  validateTime(time) {
    const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(time);
},

toNumberMonth(date) {
    const month = new Date(date)
    const num = month.getMonth() + 1
    return num
},

getHeight() {
    const windowHeight = window.innerHeight;
    return windowHeight
},

calculateHeight(){
    const windowHeight = window.innerHeight;
    var calcu = (windowHeight/961) * 100 
    return calcu / 2
},

getFirstMondayAndLastSunday(newDate) {
    // Get the current year and month
    const today = new Date(newDate);
    
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
},

minToTime(min){
  var hour = Math.floor(min/60)
  var minutes = min%60

  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  return hour + ":" + minutes 
}
}