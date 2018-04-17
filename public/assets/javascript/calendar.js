console.log('*** CALENDAR.JS LOADED ***')
$(document).ready(function(){
    $('#calendar').fullCalendar({
        googleCalendarApiKey: 'AIzaSyBDgz9GKw_xbSGjntcTGKhN2-bQ2czRZwM',
        events: {
          googleCalendarId: '5e647khad3btbk7bq06sf4kc6g@group.calendar.google.com',
          className: 'gcal-event' // an option!
        }
    })
})