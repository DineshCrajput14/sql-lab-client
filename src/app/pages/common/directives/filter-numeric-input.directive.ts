import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: "[FilterNumericInput]",
})
export class FilterNumericInputDirective {
  constructor(private el: ElementRef) {}

  @HostListener("input", ["$event"])
  onInputChange(event: any) {
    const input = event.target as HTMLInputElement;
    const filteredValue = input.value.replace(/[^0-9]/g, "");

    if (input.value !== filteredValue) {
      input.value = filteredValue;
      input.dispatchEvent(new Event("input"));
    }
  }
}
