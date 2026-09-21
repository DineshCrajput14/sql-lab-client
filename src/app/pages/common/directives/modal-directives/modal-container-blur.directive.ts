import { Directive, Renderer2, ElementRef, AfterViewInit } from "@angular/core";

@Directive({
  selector: "[modalContainerBlur]",
})
export class ModalContainerBlurDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    const modalContainer = this.el.nativeElement.closest("modal-container");
    if (modalContainer) {
      this.renderer.addClass(modalContainer, "modal-blur");
    }
  }
}
