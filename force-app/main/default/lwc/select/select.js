import { LightningElement, api } from 'lwc';

export default class Select extends LightningElement {


  @api
  set options(v) {
    this._options = JSON.parse(JSON.stringify(v));
    this.setSelectedOption();
  }
  get options() {
    return this._options;
  }
  @api
  set value(v) {
    this._value = v;
    this.setSelectedOption();
  }
  get value() {
    return this._value;
  }
  _value;
  _options = [];

  setSelectedOption(){

    // if (!this._value || this._value == undefined){
    //   return;
    // }

    this._options.forEach( option => {
      if (option.value == this._value){
        option['selected'] = true;
      }
      // else if ( !option.selected && option.selected != undefined ) {
      //   delete option.selected;
      // }
    });
    
  }

  handleSelectChange(event){
    this._value = event.target.value;
    const detail = {value: event.target.value};
    this.dispatchEvent(new CustomEvent("selectionchange", { detail: detail }));
  }

}