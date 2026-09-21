import { Directive, ElementRef, Renderer2, AfterViewInit } from "@angular/core";

@Directive({
  selector: "[modalContentBorder]",
})
export class ModalContentBorderDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    let parent = this.el.nativeElement;

    while (parent && parent !== document.body) {
      if (parent.classList && parent.classList.contains("modal-content")) {
        this.renderer.addClass(parent, "border-2");
        this.renderer.addClass(parent, "border-secondary");
        break;
      }
      parent = parent.parentElement;
    }
  }
}
