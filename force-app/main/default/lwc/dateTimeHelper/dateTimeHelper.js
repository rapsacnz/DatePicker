let cachedA = eval('$A');
  function getCachedA(){
    if (!cachedA || cachedA == undefined){
      cachedA = eval('$A');
    }
    return cachedA;
  }

  export function getAura(){
    return getCachedA();
  }

  export function formatDateUTC(date, format){
    return getAura().localizationService.formatDateUTC(date, format);
  }
  export function parseDateTimeUTC(dateString, format, strictMode){
    return getAura().localizationService.parseDateTimeUTC(dateString, format, strictMode);
  }
  // export function translateFromOtherCalendar(date){
  //   return getAura().localizationService.translateFromOtherCalendar(date);
  // }

  //////////////////// new
  export function parseUserInput(value, format){
    let localizedValue = getAura().localizationService.translateFromLocalizedDigits(value);
    console.log(`localized: ${localizedValue}`);

    let displayDate = "";
    let apiDate = "";
    let dateObj = undefined;
    
    if (!value|| value == undefined) {
      return {displayDate,apiDate,dateObj};
    }
    dateObj = getAura().localizationService.parseDateTimeUTC(localizedValue, format, true);
    console.log(`parsed date (utc): ${dateObj}`);
  
    if (!dateObj || dateObj == undefined) {
      return {displayDate,apiDate,dateObj};
    }

    dateObj = getAura().localizationService.translateFromOtherCalendar(dateObj);
    console.log(` translated date: ${dateObj}`);
  
    apiDate = getAura().localizationService.formatDateUTC(dateObj, "YYYY-MM-DD");
    console.log(` iso formatted date: ${apiDate}`);
  
    displayDate = getAura().localizationService.formatDateUTC(dateObj, format);
    return {displayDate,apiDate,dateObj};

  }

  export function getWeekdayNames(){
    let firstDayOfWeek = getAura().get("$Locale.firstDayOfWeek") - 1; // The week days in Java is 1 - 7
    let namesOfWeekDays = getAura().get("$Locale.nameOfWeekdays");
    let days = [];
    if (isNumber(firstDayOfWeek) && getAura().util.isArray(namesOfWeekDays)) {
      for (var i = firstDayOfWeek; i < namesOfWeekDays.length; i++) {
        days.push(namesOfWeekDays[i]);
      }
      for (var j = 0; j < firstDayOfWeek; j++) {
        days.push(namesOfWeekDays[j]);
      }
      return days;
    } 
    else {
      return namesOfWeekDays;
    }
  }

  function isNumber(obj) {
    return !isNaN(parseFloat(obj));
  }



  ///////////////////// end new

  export function convertToTimezone(isoString, timezone, callback) {
    var date = getCachedA().localizationService.parseDateTimeISO8601(isoString);
    if (!getCachedA().util.isUndefinedOrNull(date)) {
      getCachedA().localizationService.UTCToWallTime(date, timezone, callback);
    }
  }

  export function convertFromTimezone(date, timezone, callback) {
    var localDate = new Date(date);
    getCachedA().localizationService.WallTimeToUTC(localDate, timezone, callback);
  }

  /*
   * Get the formatted display value of a date string based on timezone
   * callback(dateDisplayValue, timeDisplayValue) is called after formatting and converting to timezone
   */
  export function getDisplayValue(value, config, callback) {
    if (getCachedA().util.isEmpty(value)) {
      callback({
        date: "",
        time: ""
      });
      return;
    }

    // since v.value is in UTC format like "2015-08-10T04:00:00.000Z", we want to make sure the date portion is valid
    var splitValue = value.split("T");
    var dateValue = splitValue[0] || value;
    var timeValue = splitValue[1];
    var useStrictParsing = config.validateString === true;

    //var date = getCachedA().localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD", getCachedA().get("$Locale.langLocale"), useStrictParsing);
    var date = getCachedA().localizationService.parseDateTimeUTC(dateValue, "YYYY-MM-DD", useStrictParsing);

    if (getCachedA().util.isEmpty(date)) {
      // invalid date/time value.
      callback({
        date: dateValue,
        time: timeValue || value
      });
      return;
    }

    var hasTime = !getCachedA().util.isEmpty(timeValue);
    // For date only fields, the value is by default an ISO string ending with '00:00:00.000Z'.
    // Only in this case, we don't need to convert the date to the provided timezone since we might end up
    // with a +/-1 date difference. DateTime fields should still be converted to the provided timezone
    if (!config.timeFormat && timeValue === "00:00:00.000Z") {
      hasTime = false;
    }

    var displayValue = function(convertedDate) {
      if (!getCachedA().util.getBooleanValue(config.ignoreThaiYearTranslation)) {
        convertedDate = getCachedA().localizationService.translateToOtherCalendar(convertedDate);
      }

      //var formattedDate = getCachedA().localizationService.formatDateUTC(convertedDate, config.format ,getCachedA().get("$Locale.langLocale"));
      var formattedDate = getCachedA().localizationService.formatDateUTC(convertedDate, config.format);
      var formattedTime;
      // time format is provided by inputDateTime, where there is a separate input for date and time
      if (config.timeFormat) {
        //formattedTime = getCachedA().localizationService.formatTimeUTC(convertedDate, config.timeFormat,getCachedA().get("$Locale.langLocale"));
        formattedTime = getCachedA().localizationService.formatTimeUTC(convertedDate, config.timeFormat);
      }

      callback({
        date: formattedDate,
        time: formattedTime
      });
    };

    if (hasTime) {
      this.convertToTimezone(value, config.timezone, getCachedA().getCallback(displayValue));
    } else {
      displayValue(date);
    }
  }

  /*
   * Get an ISO8601 string representing the passed in Date object.
   */
  export function getISOValue(date, config, callback) {
    var hours = config.hours;
    var minutes = config.minutes;

    if (hours) {
      date = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes);
    }

    var isoValue = function(convertedDate) {
      var translatedDate = getCachedA().localizationService.translateFromOtherCalendar(convertedDate);
      var isoString = getCachedA().localizationService.toISOString(translatedDate);

      callback(isoString);
    };

    this.convertFromTimezone(date, config.timezone, getCachedA().getCallback(isoValue));
  }