import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/utils/services/auth.service";
import { DashboardService } from "./dashboard.service";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  isLoading = false;
  isRefreshing = false;
  currentDate = new Date();

  stats = {
    totalProperties: 0,
    totalBuildings: 0,
    totalFloors: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    availableUnits: 0,
    maintenanceUnits: 0,
    totalTenants: 0,
    activeTenants: 0,
    totalAmenities: 0,
    totalCategories: 0,
  };

  financials = {
    totalRentReceivable: 0,
    totalRentCollected: 0,
    totalOutstandingBalance: 0,
    monthlyCollected: 0,
    todayCollected: 0,
    todayRefunded: 0,
    todayNet: 0,
    collectionEfficiency: 0,
  };

  occupancyPercent = 0;
  availablePercent = 0;
  maintenancePercent = 0;

  recentReceipts = [];

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private toastr: ToastrMessage
  ) {}

  ngOnInit() {
    this.getDashboardData();
  }

  get currencySymbol() {
    return this.authService?.authentication?.organization?.country
      ?.currencySymbol;
  }

  get organizationName() {
    return this.authService?.authentication?.organization?.name;
  }

  getDashboardData(isManual: boolean = false) {
    if (isManual) {
      this.isRefreshing = true;
    } else {
      this.isLoading = true;
    }

    this.dashboardService.getSummary().subscribe({
      next: (res: any) => {
        const data = res?.data;
        if (data?.stats) {
          this.stats = {
            totalProperties: Number(data.stats.totalProperties) || 0,
            totalBuildings: Number(data.stats.totalBuildings) || 0,
            totalFloors: Number(data.stats.totalFloors) || 0,
            totalUnits: Number(data.stats.totalUnits) || 0,
            occupiedUnits: Number(data.stats.occupiedUnits) || 0,
            availableUnits: Number(data.stats.availableUnits) || 0,
            maintenanceUnits: Number(data.stats.maintenanceUnits) || 0,
            totalTenants: Number(data.stats.totalTenants) || 0,
            activeTenants: Number(data.stats.activeTenants) || 0,
            totalAmenities: Number(data.stats.totalAmenities) || 0,
            totalCategories: Number(data.stats.totalCategories) || 0,
          };
        }

        if (data?.financials) {
          this.financials = {
            totalRentReceivable:
              Number(data.financials.totalRentReceivable) || 0,
            totalRentCollected: Number(data.financials.totalRentCollected) || 0,
            totalOutstandingBalance:
              Number(data.financials.totalOutstandingBalance) || 0,
            monthlyCollected: Number(data.financials.monthlyCollected) || 0,
            todayCollected: Number(data.financials.todayCollected) || 0,
            todayRefunded: Number(data.financials.todayRefunded) || 0,
            todayNet: Number(data.financials.todayNet) || 0,
            collectionEfficiency:
              Number(data.financials.collectionEfficiency) || 0,
          };
        }

        if (data?.occupancy) {
          this.occupancyPercent = Number(data.occupancy.occupancyPercent) || 0;
          this.availablePercent = Number(data.occupancy.availablePercent) || 0;
          this.maintenancePercent =
            Number(data.occupancy.maintenancePercent) || 0;
        } else {
          this.calculatePercents();
        }

        this.recentReceipts = Array.isArray(data?.recentReceipts)
          ? data.recentReceipts
          : [];

        this.isLoading = false;
        this.isRefreshing = false;
      },
      error: (err: any) => {
        this.calculatePercents();
        this.isLoading = false;
        this.isRefreshing = false;
      },
    });
  }

  calculatePercents() {
    const total = this.stats.totalUnits;
    if (total === 0) {
      this.occupancyPercent = 0;
      this.availablePercent = 0;
      this.maintenancePercent = 0;
      return;
    }
    this.occupancyPercent = Math.round(
      (this.stats.occupiedUnits / total) * 100
    );
    this.availablePercent = Math.round(
      (this.stats.availableUnits / total) * 100
    );
    this.maintenancePercent = Math.max(
      0,
      100 - this.occupancyPercent - this.availablePercent
    );
  }
}
