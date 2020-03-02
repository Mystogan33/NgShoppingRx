import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNavbarToggle]',
  exportAs: "appNavbarToggle"
})
export class NavbarToggleDirective {

  private _isOpen = false;

  @HostListener('click') toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  constructor() { }

  get isOpen() {
    return this._isOpen;
  }

  set isOpen(value: boolean) {
    this._isOpen = value;
  }

}
