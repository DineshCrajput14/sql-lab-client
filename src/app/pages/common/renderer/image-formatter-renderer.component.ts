import { Component } from "@angular/core";

@Component({
  selector: "app-image-formatter-renderer-component",
  template: `<img border="0" width="40" height="40" src="{{ imageURl }}" />`,
})
export class ImageFormatterRenderer {
  imageURl;
  agInit(params) {
    this.imageURl = params.data.image;
  }
}
