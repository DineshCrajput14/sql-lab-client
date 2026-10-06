import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.scss"],
})
export class LandingComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  isMobileMenuOpen: boolean = false;

  constructor(private title: Title) {}

  ngOnInit() {
    this.title.setTitle("Puma Group PMS - Property Management System");
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  scrollToTop(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
