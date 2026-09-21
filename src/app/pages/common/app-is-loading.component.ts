import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-is-loading",
  template: `
    <div
      class="d-flex flex-column"
      [ngClass]="isFormStateEdit ? ' ' : 'is-loading'"
    >
      <div class="page page-center">
        <div class="container container-slim py-4">
          <div class="text-center">
            <div class="text-muted mb-3">
              Loading...
            </div>
            <div class="progress progress-sm">
              <div class="progress-bar progress-bar-indeterminate"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AppIsLoadingComponent implements OnInit {
  @Input() isFormStateEdit = "";
  constructor() {}
  ngOnInit() {}
}
