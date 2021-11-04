import { LightningElement, api, track } from 'lwc';
import { parseUserInput } from 'c/dateTimeHelper';
import { getWeekdayNames } from 'c/dateTimeHelper'

import firstDayOfWeek from '@salesforce/i18n/firstDayOfWeek';
import dateFormat from '@salesforce/i18n/dateTime.shortDateFormat';
import timeZone from '@salesforce/i18n/timeZone';
import locale from '@salesforce/i18n/locale';


export default class DatePicker extends LightningElement {


  @api value = "";//format yyyy-MM-dd'
  @api min = "";//format yyyy-MM-dd'
  @api label = "";
  @api placeholder = "";
  @api styleClass = "";
  @api format = "";
  @api compact = false;
  @api showTodayHyperlink = false;


  //numeric day (ie 15 or 31)
  @api date = 0
  @api month = 1
  @api monthName = "January";
  @api year = 2020
  @api selectedDate = new Date();
  @api minDate = new Date();
  @api setFocus = false;


  @api extendedYearRange = false; //If true, you must set start and stop year values (1900 and 2100 for eg)
  @api startYear = 0; //if extendedYearRange is true, this will determine the first year in the list
  @api finishYear = 0; //if extendedYearRange is true, this will determine the last year in the list
  @api years = [];

  _open = false;
  _over = false;
  _setFocus = false; //The internal state of setFocus." 
  _namesOfWeekdays = []; //The names of the week days based on locale.
  _today = ""; //The date string (yyyy-MM-dd) of today based on the Aura time zone.
  // _windowTimeout = {}; //probably not needed in lwc
  // _gridOver = false;
  _error = false;
  _errorMessage = "This field is required.";
  _format = dateFormat;
  _datestr = ""

  @track dayGrid = [[7],[7],[7],[7],[7],[7]];



  @api
  reInit(){
  }

  connectedCallback(){
    this._datestr = this.value;
    this._format = this.format ? this.format : dateFormat;
    this.initialize();
  }

  goToToday(){
  }

  initialize() {
    // for (var i = 0; i < 41; i++) {
    //   var cellCmp = component.find(i);
    //   if (cellCmp) {
    //     cellCmp.addEventHandler("dateCellClick", component.getReference("c.handleClick"));
    //   }
    // }

    //var format = component.get("v.formatSpecifier");
    // datestr = component.get("v.value");
    //var langLocale = $A.get("$Locale.langLocale");

    //var currentDate = helper.parseInputDate(component, datestr);
    //let currentDate = this.parseInput(this._datestr);
    let dates = parseUserInput(this._datestr,this._format);
    if (dates.dateObj == undefined || !dates.dateObj){
      dates.dateObj = new Date();
    }

    this.setDateValues(dates.dateObj, dates.dateObj.getDate());

    //used prevent dates earlier than min being selected
    if (this.min) {
      let mindates = parseUserInput(this.min,this._format);
      this.minDate = mindates.dateObj;
    }

    // Set the first day of week
    this._namesOfWeekdays = this.indexArray(getWeekdayNames());
    this.generateYearOptions(dates.dateObj);

    // var setFocus = component.get("v.setFocus");
    // if (!setFocus) {
    //   component.set("v._setFocus", false);
    // }
    this.renderGrid();

    //addition caspar 2016-12-14
    this.date = dates.dateObj.getDate()
    // if (!$A.util.isEmpty(datestr)) {
    //   $A.util.removeClass(component.find("clear-button"), "slds-hide");
    // }
  }

  setDateValues(dateObj,dateNum) {
    var paddedMonth = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    console.log(paddedMonth);
    this.year = dateObj.getFullYear();
    this.month = dateObj.getMonth();
    this.monthName = this.l10n.months.longhand[dateObj.getMonth()];
    this.date = dateNum;
    this.selectedDate = dateObj;

    this.validateSelectedDate( dateObj);
  }

  validateSelectedDate(selectedDate) {
    let minDate = this.minDate;
    if (selectedDate && minDate > selectedDate) {
      this._error = true;
      this._errorMessage = `Date cannot be before ${minDate.getMonth() + 1}/${minDate.getDate()}/${minDate.getFullYear()}`;
    } else {
      this._error = false;
      this._errorMessage = "";
    }
  }

  // updateNameOfWeekDays() {
  //   var firstDayOfWeek = $A.get("$Locale.firstDayOfWeek") - 1; // The week days in Java is 1 - 7
  //   var namesOfWeekDays = $A.get("$Locale.nameOfWeekdays");
  //   var days = [];
  //   if (this.isNumber(firstDayOfWeek) && $A.util.isArray(namesOfWeekDays)) {
  //     for (var i = firstDayOfWeek; i < namesOfWeekDays.length; i++) {
  //       days.push(namesOfWeekDays[i]);
  //     }
  //     for (var j = 0; j < firstDayOfWeek; j++) {
  //       days.push(namesOfWeekDays[j]);
  //     }
  //     component.set("v._namesOfWeekdays", days);
  //   } else {
  //     component.set("v._namesOfWeekdays", namesOfWeekDays);
  //   }
  // }

  goToPreviousMonth(event) {
    this.changeMonth(-1);
  }
  goToNextMonth(event) {
    this.changeMonth(1);
  }

  changeMonth(monthChange) {
    //month change is an integer : either 1 or -1

    let currentMonth = this.month;
    let currentYear =  !this.year ? this.dateObj.current.year() : this.year;
    let currentDay = this.date;

    let currentDate = new Date(currentYear, currentMonth, currentDay);
    let targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthChange, 1);


    let daysInMonth = this.numDays(currentMonth, currentYear);
    if (daysInMonth < currentDay) { // The target month doesn't have the current date. Just set it to the last date.
      currentDay = daysInMonth;
    }
    this.setDateValues(targetDate, currentDay);
    this.generateMonth();
  }

  handleYearChange(event) {
    console.log("year change");
    let newYear = event.currentTarget.value;
    this.changeYear(newYear, this.date);
  }

  changeYear( newYear, date) {
    let currentMonth = this.month;
    let currentYear = this.year;
    if (!currentYear) {
      currentYear = this.dateObj.current.year();
    }

    let currentDate = new Date(currentYear, currentMonth, date);
    let targetDate = new Date(newYear, currentDate.getMonth(), 1);

    let daysInMonth = this.numDays(currentMonth, currentYear);

    if (daysInMonth < date) {
      // The target month doesn't have the current date. Just set it to the last date.
      date = daysInMonth;
    }
    this.setDateValues(targetDate, date);
    this.generateMonth();

    
  }


  generateYearOptions(fullDate) {
    //@todo
    //let years = [];
    this.years = [];
    let startYear = this.startYear;
    let finishYear = this.finishYear;
    if (
      !this.extendedYearRange || !startYear || !finishYear || startYear >= finishYear ) {
      startYear = fullDate.getFullYear() - 1;
      finishYear = startYear + 10;
    }
    let thisYear = fullDate.getFullYear();

    for (var i = startYear; i <= finishYear; i++) {
      this.years.push({ class: "optionClass", label: i, value: i });
    }
    console.log(this.years);
    try {
      const option = (this.years.find(element => element.value == thisYear));
      option.selected = true;
    } catch (e) {
    }

  }

  parseInput(){
    let dates = parseUserInput(this._datestr,this._format);
    console.log(`dates: ${dates}`);

    if (dates.apiValue && this._value !== dates.apiValue ) {
      //emit an event!
      const datechange = new CustomEvent('datechange', {
        detail: { date: dates.apiValue }
      });
      this.dispatchEvent(datechange);
    }

    this._value = dates.displayDate ? dates.displayDate : this._value;
  }

  get outerDivClass(){
    return `date-input-form-element slds-form-element ${this._error ? ' slds-has-error ' : ' '}`;
  }

  get outerDivClass2(){
    let staticCSS = ' slds-form-element slds-dropdown-trigger slds-dropdown-trigger_click slds-size_1-of-1 ';
    return ` ${staticCSS} ${this._open ? ' slds-is-open ' : '' } ${this._error ? ' slds-has-error ' : ' '}`;
  }

  get labelClass(){
    return (!this.label ? 'slds-hide ' : ' slds-form-element__label ');
  }

  renderGrid(){
    this.generateMonth();
  }

  /**
   * generates the days for the current selected month.
   */
  generateMonth(){
    let dayOfMonth = this.date;
    let month = this.month;
    let year = this.year;
    let minDate = this.minDate;

    var selectedDate = new Date(year, month, dayOfMonth);

    var today = new Date();
    var d = new Date();
    d.setDate(1);
    d.setFullYear(year);
    d.setMonth(month);
    // java days are indexed from 1-7, javascript 0-6
    // The startPoint will indicate the first date displayed at the top-left
    // corner of the calendar. Negative dates in JS will subtract days from
    // the 1st of the given month
    let localFirstDayOfWeek = firstDayOfWeek - 1; // In Java, week day is 1 - 7
    var startDay = d.getDay();
    var firstFocusableDate;
    while (startDay !== localFirstDayOfWeek) {
      d.setDate(d.getDate() - 1);
      startDay = d.getDay();
    }
    //for (var i = 0; i < 41; i++) {

    let weeks = [];
    for (var week = 0; week < 6; week++){
      let days = [];
      for (var day = 0; day < 7; day++){
        //object creation

          //let dayOfWeek = d.getDay();
          
          let tdClass = "";
          let ariaDisabled = false;
          let tabIndex = -1;
          let selected = false;
          let ariaSelected = false;
          let label = d.getDate();
          let value = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
          let key = value;
          let ref = `${week}-${day}`;
  
          if (d.getMonth() === month - 1 || d.getFullYear() === year - 1) {
            ariaDisabled = true
            tdClass = "slds-disabled-text";
          } 
          else if (d.getMonth() === month + 1 || d.getFullYear() === year + 1) {
            ariaDisabled = true
            tdClass = "slds-disabled-text";          
          }
          if (d.getMonth() === month && d.getDate() === 1) {
            tabIndex = 0;
          }
  

          if (this.dateEquals(d, today)) {
            tdClass += " slds-is-today ";
          }
          if (this.dateEquals(d, selectedDate)) {
            ariaSelected = true;
            tdClass += " slds-is-selected";
            tabIndex = 0;
          }
  
          if (minDate && minDate.getTime() > d.getTime()) {
            ariaDisabled = true;
            tdClass = " slds-disabled-text ";
          }
        //increment date
        
        //end object creation
        days.push({ key,
                    ref,
                    tdClass,
                    ariaDisabled,
                    tabIndex,
                    selected,
                    ariaSelected,
                    label,
                    value
                  });

        d.setDate(d.getDate() + 1);
      } //end days loop
      let weekKey = `week-${week}`;
      weeks.push({weekKey,days});
      
    }
    //console.log(JSON.stringify(weeks));
    this.dayGrid = weeks;

     
    // if (firstFocusableDate) {
    //   firstFocusableDate.set("v.tabIndex", 0);
    // }
    // component.set("v._setFocus", true);
  }





  //open/close dropdown
  openDropdown() {
    console.log("open");
    this._open = true;
    this._over = false;
  }
  closeDropdown() {
    console.log("close");
    this._open = false;
    this._over = false;
  }

  /* following pair of functions are a clever way of handling a click outside,
     despite us not having access to the outside dom.
     see: https://salesforce.stackexchange.com/questions/255691/handle-click-outside-element-in-lwc
  */
  handleInputFocus(event) {

    //prevent firing more than once per focus (too many listeners get added)
    if (this._open == true){
      return;
    }
    console.log("handle input focus");
    event.stopImmediatePropagation();
    event.preventDefault();
    this.openDropdown();

    setTimeout(()=>{
      window.addEventListener("click", this.handleClose);
    },100);
    
  }
  handleClose = (event) => {
    
    if (this._over == true){
      return;
    }

    console.log("handle close");
    event.stopPropagation();
    this.closeDropdown();
    window.removeEventListener("click", this.handleClose);
  };

  handleMouseOver(event) {
    this._over = true;
  }
  handleMouseOut(event) {
    this._over = false;
  }


  /**
   * Java style date comparisons. Compares by day, month, and year only.
   */
  dateEquals(date1, date2) {
    return date1 && date2 && this.dateCompare(date1, date2) === 0;
  }

  dateCompare(d1, d2) {
    console.log(`date1 : ${d1}, date2 : ${d2}`);
    if (d1.getFullYear() !== d2.getFullYear()) {
      return d1.getFullYear() - d2.getFullYear();
    } 
    else {
      if (d1.getMonth() !== d2.getMonth()) {
        return d1.getMonth() - d2.getMonth();
      } 
      else {
        //d1    
        //return 0;  
        return d1.getDate() - d2.getDate();
      }
    }
  }

  //done this already
  // parseInputDate(datestr) {
  //   var parsedDate = $A.localizationService.parseDateTime(datestr, "MM/DD/YYYY");
  //   var timezone = $A.get("$Locale.timezone");

  //   //ok try this format
  //   if (parsedDate == null || !this.isDateValid(parsedDate)) {
  //     parsedDate = $A.localizationService.parseDateTime(datestr, "yyyy-MM-dd");
  //   }

  //   //try, try again
  //   if (parsedDate == null || !this.isDateValid(parsedDate)) {
  //     $A.localizationService.getToday(timezone, function(today) {
  //       parsedDate = $A.localizationService.parseDateTime(today, "yyyy-MM-dd");
  //     });
  //   }
  //   return parsedDate;
  // }

  numDays(currentMonth, currentYear) {
    // checks to see if february is a leap year otherwise return the respective # of days
    return currentMonth === 1 &&
      ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0)
      ? 29
      : this.l10n.daysInMonth[currentMonth];
  }

  isNumber(obj) {
    return !(isNaN(parseFloat(obj)));
  }



  isDateValid(date1) {
    if (Object.prototype.toString.call(date1) === "[object Date]") {
      // it is a date
      if (isNaN(date1.getTime())) {
        // d.valueOf() could also work
        // date is not valid
        return false;
      } else {
        // date is valid
        return true;
      }
    } else {
      // not a date
      return false;
    }
  }

  indexArray(arr){
    console.log(JSON.stringify(arr));
    let res = arr.map( (item,index) => { 
      item.key = index;
      return item;
      //return item.key = index; 
    });
    console.log(JSON.stringify(res));
    return res;
    //return arr.map( (item,index) => { return { name: item, key: index}; });
  }

  l10n = {
    weekdays: {
      shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      longhand: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    months: {
      shorthand: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],
      longhand: [
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
    },
    daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    firstDayOfWeek: 0
  };

  dateObj = {
    current: {
      year: function() {
        return new Date().getFullYear();
      },
      month: {
        integer: function() {
          return new Date().getMonth();
        },
        string: function(shorthand) {
          var month = new Date().getMonth();
          return monthToStr(month, shorthand);
        }
      },
      day: function() {
        return new Date().getDate();
      }
    }
  };

}