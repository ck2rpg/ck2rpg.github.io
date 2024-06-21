let monthList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
  
  function startClock() {
    let clock = {};
    clock.year = getRandomInt(1, 1000)
    clock.month = getRandomInt(1, 12)
    clock.day = getRandomInt(1, 28);
    clock.hour = 9;
    clock.minutes = 55;
    clock.ampm = "am"
  }
  
  function passDay() {
    addDays(1)
  }
  
  function addMonths(m) {
    clock.month += m
    if (clock.month === 13) {
      clock.month = 1;
      clock.year += 1;
    }
  }
  
  function addDays(d) {
    clock.day += d
    if (clock.month === 9 || clock.month === 4 || clock.month === 6 || clock.month === 11) {
      if (clock.day === 31) {
        addMonths(1)
        clock.day = 1
      }
    } else if (clock.month === 2) {
      if (clock.day === 29) {
        addMonths(1)
        clock.day = 1
      }
    } else {
      if (clock.day === 32) {
        addMonths(1)
        clock.day = 1
      }
    }
  }
  
  function addMinutes(m) {
    clock.minutes += m;
    if (clock.minutes === 60) {
      hour()
      if (clock.hour === 12) {
        ampm()
        if (clock.ampm === "am") {
          addDays(1)
        }
      }
      if (clock.hour === 13) {
        clock.hour = 1
      }
    }
  }
  
  function hour() {
    clock.minutes = 0;
    clock.hour += 1;
  }
  
  function ampm() {
    if (clock.ampm === "am") {
      clock.ampm = "pm"
    } else {
      clock.ampm = "am"
    }
  }
  