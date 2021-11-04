import { LightningElement, api } from 'lwc';
import dateFormat from '@salesforce/i18n/dateTime.shortDateFormat';
import timeZone from '@salesforce/i18n/timeZone';
import locale from '@salesforce/i18n/locale';

import { parseUserInput } from 'c/dateTimeHelper'
import { formatDateUTC } from 'c/dateTimeHelper'

export default class InputDate extends LightningElement {

  @api styleClass = "";
  @api _value = "";

  _placeholder = "";  //The hint for the date input format. The placeholder is set during init based on the custom or locale format."/>
  _format = ""; //Java style format specifier for the date" />
  _formatting = false;
 
  @api set value(value){
    this._value = value;
  }
  get value(){
    return this._value;
  }
  @api set format(value){
    this._format = value;
    this._placeholder = value;
  }
  get format(){
    return this._format;
  }

  connectedCallback() {
    this._formatting = true;
    this._format = !this._format ? dateFormat : this._format;
    this._placeholder = this._format;
    this._value = this._value ? this._value : formatDateUTC(new Date(), this._format);
    this._formatting = false;
  }

  renderedCallback() {
    // this._formatting = true;
    // this.displayValue();
    // this._formatting = false;
  }

  // displayValue = () => {
  //   var config = {
  //     langLocale: locale,
  //     format: this._format,
  //     timezone: timeZone,
  //     validateString: true
  //   };

  //   var callback = function(returnValue) {
  //     this.setInputValue(returnValue.date);
  //     this._value = returnValue.date;

  //   }.bind(this);

  //   getDisplayValue(this._value, config, callback);
  // }

  handleDateChange(event){
    
    var value = event.target.value;
    if (!value || this._formatting) {
      return;
    }
    this._formatting = true;
    let dates = parseUserInput(value,this._format);
    console.log(`dates: ${dates}`);

    if (dates.apiValue && this._value !== dates.apiValue ) {
      //emit an event!
      const datechange = new CustomEvent('datechange', {
        detail: { date: dates.apiValue }
      });
      this.dispatchEvent(datechange);
    }

    this._value = dates.displayDate ? dates.displayDate : this._value;


    // var localizedValue = getAura().localizationService.translateFromLocalizedDigits(value);
    // console.log(`localized: ${localizedValue}`);
    // var formattedDate = localizedValue;
    // if (value) {
    //   var date = getAura().localizationService.parseDateTimeUTC(localizedValue, this._format, true);
    //   console.log(`parsed date (utc): ${date}`);

    //   if (date) {
    //     date = getAura().localizationService.translateFromOtherCalendar(date);
    //     console.log(` translated date: ${date}`);

    //     formattedDate = getAura().localizationService.formatDateUTC(date, "YYYY-MM-DD");
    //     console.log(` iso formatted date: ${formattedDate}`);

    //     //fire event if value different from attribute value
    //     if (this._value !== formattedDate) {
    //       //emit an event!
    //       const datechange = new CustomEvent('datechange', {
    //         detail: { date: formattedDate }
    //       });
    //       this.dispatchEvent(datechange);
    //     }
    //     let localeFormattedDate = getAura().localizationService.formatDateUTC(date, this._format);
    //     this._value = localeFormattedDate;
    //   }
    // }

    this._formatting = false;
  }

  handleFocus(event){

    const focus = new CustomEvent('focus', {
      detail: { click:true}
    });
    this.dispatchEvent(focus);
    event.cancelBubble = true;
    event.stopPropagation();
    event.preventDefault();
  }

  handleClick(event){

    event.cancelBubble = true;
    event.stopPropagation();
    event.preventDefault();
  }

  getDateString(date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  }

  get inputClass(){
    return `date-input input ${this.styleClass}`;
  }

  // setInputValue(displayValue) {
  //   var inputElement = this.template.querySelector('.date-input.input');
  //   if (getAura().util.isUndefinedOrNull(inputElement) && inputElement.value !== displayValue) {
  //     // only update value if display value is different.
  //     inputElement.value = displayValue
  //       ? getAura().localizationService.translateToLocalizedDigits(displayValue)
  //       : "";
  //   }
  // }

}