import { LightningElement, track, api } from 'lwc';

export default class DatePickerCell extends LightningElement {

  @track value = new Date();
  @api ariaSelected = false;
  @api ariaDisabled = false;
  @api tabIndex = -1;
  
  @api label = "";
  @api tdClass = "";
  @api compact = false;
  //_smallStyleSpan = " width: 1.2rem; height: 1.2rem; min-width: 0px; line-height: 1.3rem; ";
  //_smallStyleTd = " padding: .2rem; ";

  handleCellClick = (event )=>  {
    event.preventDefault();
    event.stopImmediatePropagation();
    const detail = {value: this.value };
    const changeEvent = new CustomEvent("datecellclick", { detail: detail });
    this.dispatchEvent(changeEvent);
  }

  get spanClass() {
    return  `${this.compact ? ' small-span ' : ''} ${this.tdClass} slds-day`;
  }

}