import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  HostListener,
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { AuthService } from "src/app/utils/services/auth.service";

@Component({
  selector: "app-top-navigation",
  templateUrl: "./top-navigation.component.html",
  styleUrls: ["./top-navigation.component.scss"],
})
export class TopNavigationComponent implements OnInit, AfterViewInit {
  currentUrl: string = "";
  openMenu: string | null = null;
  openSubMenu: string | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.router.events.subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = this.router.url;
          this.hideNavDropdownMenu();
        }
      },
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  toggleMenu(name: string) {
    if (this.openMenu !== name) {
      this.openSubMenu = null;
    }
    this.openMenu = this.openMenu === name ? null : name;
  }

  toggleSubMenu(name: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.openSubMenu = this.openSubMenu === name ? null : name;
  }

  hideNavDropdownMenu() {
    this.openMenu = null;
    this.openSubMenu = null;
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.hideNavDropdownMenu();
    }
  }
}
