import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { BsModalRef } from "ngx-bootstrap/modal";
import { forkJoin, Subject } from "rxjs";
import { delay } from "rxjs/operators";
import moment from "moment";
import { GridApi } from "ag-grid-community";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { PropertiesService } from "../../properties/properties.service";
import { BuildingsService } from "../../buildings/buildings.service";
import { UnitsService } from "../../units/units.service";
import { AmenitiesService } from "../../amenities/amenities.service";
import { TenantManagementService } from "../tenant-management.service";
import { CancelService } from "@app/utils/services/cancel.service";

@Component({
  selector: "app-tenant-allotment-editor",
  templateUrl: "./tenant-allotment-editor.component.html",
})
export class TenantAllotmentEditorComponent implements OnInit {
  @ViewChild("f") form: NgForm;

  formState: string = "NEW";
  tenantId: number;
  tenantName: string;
  allotmentEditId: number;
  allotmentData: any;

  isLoading: boolean;
  hasReceipts: boolean = false;
  dataChanged: boolean = false;
  onClose = new Subject<any>();

  propertiesList = [];
  buildingsList = [];
  unitsList = [];
  amenitiesList = [];

  gridApiCharges: GridApi;
  defaultColDef = { resizable: true };

  allotment: {
    date: any;
    propertyId: number;
    buildingId: number;
    unitId: number;
    charges: number;
    securityAmount: number;
    allotmentFrom: any;
    allotmentTo: any;
    remarks: string;
    selectedCharges: any[];
  } = {
    date: moment().toDate(),
    propertyId: undefined,
    buildingId: undefined,
    unitId: undefined,
    charges: 0,
    securityAmount: 0,
    allotmentFrom: moment().toDate(),
    allotmentTo: moment().toDate(),
    remarks: "",
    selectedCharges: [],
  };

  columnDefsCharges = [
    {
      width: 50,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
    },
    {
      headerName: "Additional Charges",
      field: "name",
      width: 250,
      cellStyle: { fontWeight: "bold" },
    },
    {
      headerName: "Category",
      field: "categoryName",
      width: 160,
    },
    {
      headerName: "Type",
      field: "type",
      width: 180,
    },
    {
      headerName: "Charge Type",
      field: "chargeType",
      width: 180,
    },
    {
      headerName: "Def. Charge",
      field: "defaultCharges",
      width: 200,
      type: "rightAligned",
      cellRenderer: (params: any) => {
        const chargeAmount = Number(params.value) || 0;
        return chargeAmount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      },
    },
  ];

  isSecurityManuallyChanged: boolean = false;

  constructor(
    public bsModalRef: BsModalRef,
    private cancelService: CancelService,
    private toastrMessage: ToastrMessage,
    private errorHandlingService: ErrorHandlingService,
    private propertiesService: PropertiesService,
    private buildingsService: BuildingsService,
    private unitsService: UnitsService,
    private amenitiesService: AmenitiesService,
    private tenantService: TenantManagementService
  ) {}

  ngOnInit() {
    this.getAmenities();

    if (this.formState === "EDIT" && this.allotmentEditId) {
      this.isLoading = true;
      this.tenantService.getAllotment(this.allotmentEditId).subscribe({
        next: (response) => {
          this.allotmentData = response?.allotment;
          this.hasReceipts = !!this.allotmentData?.hasReceipts;
          this.populateEditData();
          this.syncChargesSelection();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorHandlingService.errors(error);
        },
      });
    } else {
      this.getProperties();
    }
  }

  getProperties() {
    this.isLoading = true;
    this.propertiesService.getProperties().subscribe({
      next: (resultGetProperties) => {
        this.propertiesList = resultGetProperties?.properties || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  getAmenities() {
    this.amenitiesService.getAmenities().subscribe({
      next: (resultGetAmenities) => {
        const amenities = resultGetAmenities?.amenities || [];
        this.amenitiesList = amenities.map((amenity) => ({
          ...amenity,
          categoryName: amenity.categoryName,
          type: amenity.type,
          chargeType: amenity.chargeType,
          selected: false,
        }));
        if (this.gridApiCharges) {
          this.gridApiCharges.setRowData(this.amenitiesList);
          this.syncChargesSelection();
        }
      },
      error: (error) => {
        this.errorHandlingService.errors(error);
      },
    });
  }

  onChargesGridReady(params) {
    this.gridApiCharges = params.api;
    if (this.amenitiesList && this.amenitiesList.length) {
      this.gridApiCharges.setRowData(this.amenitiesList);
      this.syncChargesSelection();
    }
  }

  onChargesFirstDataRendered(params) {
    if (params.api) {
      this.syncChargesSelection();
    }
  }

  syncChargesSelection() {
    if (!this.gridApiCharges) {
      return;
    }
    if (this.formState === "EDIT" && this.allotmentData?.additionalCharges) {
      const selectedIds = (
        this.allotmentData.additionalCharges || []
      ).map((additionalCharge) =>
        Number(additionalCharge.id ?? additionalCharge.amenityId)
      );
      this.gridApiCharges.forEachNode((node) => {
        if (node.data && selectedIds.includes(Number(node.data.id))) {
          node.setSelected(true);
        }
      });
    }
  }

  onChargesSelectionChanged() {
    if (!this.gridApiCharges) {
      return;
    }
    const selectedRows = this.gridApiCharges.getSelectedRows();
    this.amenitiesList.forEach((amenity) => {
      amenity.selected = selectedRows.some(
        (selectedRow) => selectedRow.id === amenity.id
      );
    });
  }

  onPropertyChange() {
    this.allotment.buildingId = undefined;
    this.allotment.unitId = undefined;
    this.buildingsList = [];
    this.unitsList = [];

    if (this.allotment.propertyId) {
      this.buildingsService
        .getBuildings({ propertyId: this.allotment.propertyId })
        .subscribe({
          next: (resultGetBuildings) => {
            this.buildingsList = resultGetBuildings?.buildings || [];
          },
          error: (error) => {
            this.errorHandlingService.errors(error);
          },
        });
    }
  }

  onBuildingChange() {
    this.allotment.unitId = undefined;
    this.unitsList = [];

    if (this.allotment.buildingId) {
      this.unitsService
        .getUnits({ buildingId: this.allotment.buildingId })
        .subscribe({
          next: (resultGetUnits) => {
            const allUnits = resultGetUnits?.units || [];
            this.unitsList = allUnits.filter((unit: any) => {
              if (
                this.formState === "EDIT" &&
                Number(unit.id) === Number(this.allotmentData?.unitId)
              ) {
                return true;
              }
              return !unit.status || unit.status.toLowerCase() === "available";
            });
          },
          error: (error) => {
            this.errorHandlingService.errors(error);
          },
        });
    }
  }

  onUnitChange() {
    if (this.allotment.unitId && this.unitsList.length) {
      const selectedUnit = this.unitsList.find(
        (unit: any) => unit.id === this.allotment.unitId
      );
      if (selectedUnit && selectedUnit.charges !== undefined) {
        this.allotment.charges = Number(selectedUnit.charges) || 0;
        if (!this.isSecurityManuallyChanged) {
          this.allotment.securityAmount = this.allotment.charges;
        }
      }
    }
  }

  onChargesChange() {
    if (!this.isSecurityManuallyChanged) {
      this.allotment.securityAmount = Number(this.allotment.charges) || 0;
    }
  }

  onSecurityChange() {
    this.isSecurityManuallyChanged = true;
  }

  get isToDateInvalid(): boolean {
    if (!this.allotment?.allotmentFrom || !this.allotment?.allotmentTo) {
      return false;
    }
    return moment(this.allotment.allotmentTo).isBefore(
      moment(this.allotment.allotmentFrom),
      "day"
    );
  }

  populateEditData() {
    const allotment = this.allotmentData;
    if (!allotment) {
      return;
    }

    if (allotment.tenantId) {
      this.tenantId = Number(allotment.tenantId);
    }
    if (allotment.tenantName && !this.tenantName) {
      this.tenantName = allotment.tenantName;
    }

    this.allotment.date = allotment.date
      ? moment(allotment.date).toDate()
      : moment().toDate();
    this.allotment.propertyId = allotment.propertyId
      ? Number(allotment.propertyId)
      : undefined;
    this.allotment.buildingId = allotment.buildingId
      ? Number(allotment.buildingId)
      : undefined;
    this.allotment.unitId = allotment.unitId
      ? Number(allotment.unitId)
      : undefined;
    this.allotment.charges = Number(allotment.charges) || 0;
    this.allotment.securityAmount =
      allotment.securityAmount !== undefined &&
      allotment.securityAmount !== null
        ? Number(allotment.securityAmount)
        : this.allotment.charges;
    this.isSecurityManuallyChanged = true;
    this.allotment.allotmentFrom = allotment.allotmentFrom
      ? moment(allotment.allotmentFrom).toDate()
      : moment().toDate();
    this.allotment.allotmentTo = allotment.allotmentTo
      ? moment(allotment.allotmentTo).toDate()
      : moment().add(1, "year").toDate();
    this.allotment.remarks = allotment.remarks || "";

    const apiCalls: any = {
      properties: this.propertiesService.getProperties(),
    };

    if (this.allotment.propertyId) {
      apiCalls.buildings = this.buildingsService.getBuildings({
        propertyId: this.allotment.propertyId,
      });
    }

    if (this.allotment.buildingId) {
      apiCalls.units = this.unitsService.getUnits({
        buildingId: this.allotment.buildingId,
      });
    }

    this.isLoading = true;
    forkJoin(apiCalls).subscribe({
      next: (response: any) => {
        this.propertiesList = response.properties?.properties || [];
        this.buildingsList = response.buildings?.buildings || [];
        const allUnits = response.units?.units || [];
        this.unitsList = allUnits.filter((unit) => {
          if (unit.id === this.allotment.unitId) {
            return true;
          }
          return !unit.status || unit.status.toLowerCase() === "available";
        });
        this.isLoading = false;
        this.syncChargesSelection();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  save() {
    const selectedAmenities = this.gridApiCharges
      ? this.gridApiCharges.getSelectedRows()
      : this.amenitiesList.filter((amenity) => amenity.selected);

    const selectedCharges = (selectedAmenities || []).map((amenityItem) => ({
      amenityId: amenityItem.id,
      serviceName: amenityItem.name,
      categoryId: amenityItem.categoryId,
      categoryName: amenityItem.categoryName,
      type: amenityItem.type,
      chargeType: amenityItem.chargeType,
      chargeAmount: Number(amenityItem.defaultCharges) || 0,
    }));

    const payload: any = {
      tenantId: this.tenantId,
      date: this.allotment.date
        ? moment(this.allotment.date).format("YYYY-MM-DD")
        : "",
      propertyId: this.allotment.propertyId,
      buildingId: this.allotment.buildingId,
      unitId: this.allotment.unitId,
      charges: Number(this.allotment.charges) || 0,
      securityAmount: Number(this.allotment.securityAmount) || 0,
      allotmentFrom: this.allotment.allotmentFrom
        ? moment(this.allotment.allotmentFrom).format("YYYY-MM-DD")
        : "",
      allotmentTo: this.allotment.allotmentTo
        ? moment(this.allotment.allotmentTo).format("YYYY-MM-DD")
        : "",
      remarks: this.allotment.remarks,
      additionalCharges: selectedCharges,
    };

    if (this.formState === "EDIT" && this.allotmentEditId) {
      payload.id = this.allotmentEditId;
    }

    this.isLoading = true;
    this.dataChanged = true;
    const request =
      this.formState === "EDIT"
        ? this.tenantService.updateAllotment(this.allotmentEditId, payload)
        : this.tenantService.createAllotment(payload);

    request.pipe(delay(500)).subscribe({
      next: (response) => {
        this.bsModalRef.hide();
        this.toastrMessage.showSuccessMessage(
          this.formState === "EDIT"
            ? "Allotment Updated Successfully"
            : "Unit Allotment Created Successfully"
        );
        this.onClose.next({
          dataChanged: true,
          allotment: response?.allotment,
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandlingService.errors(error);
      },
    });
  }

  @HostListener("document:keydown.escape", ["$event"])
  onKeyEscape() {
    if (document.getElementsByClassName("modal").length < 2) {
      this.cancel();
    }
  }

  cancel() {
    if (this.isLoading) {
      return;
    }
    if (!this.form.dirty || this.dataChanged) {
      this.onClose.next(this.dataChanged);
      this.bsModalRef.hide();
      return;
    }
    if (this.form.dirty) {
      this.cancelService.cancel(this.bsModalRef);
    }
  }
}
