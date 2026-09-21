import { Inject, Injectable } from "@angular/core";
import { DOCUMENT } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class LoadCustomStylesService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  loadStyle(styleName: string) {
    const head = this.document.getElementsByTagName("head")[0];

    let themeLink = this.document.getElementById(
      "portal-style"
    ) as HTMLLinkElement;

    if (themeLink) {
      themeLink.href = styleName;
    } else {
      const style = this.document.createElement("link");
      style.id = "portal-style";
      style.rel = "stylesheet";
      style.href = `${styleName}`;

      head.appendChild(style);
    }
  }
}
