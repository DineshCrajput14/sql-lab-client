import { Component, OnInit } from "@angular/core";
import { of } from "rxjs";
import { delay } from "rxjs/operators";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { GridApi } from "ag-grid-community";
import moment from "moment";
import { ToastrMessage } from "src/app/utils/services/toastrmessage.service";
import { ErrorHandlingService } from "src/app/utils/services/error-handling.service";
import { ReleaseRoomService } from "./release-room.service";
import { PropertiesService } from "../properties/properties.service";
import { BuildingsService } from "../buildings/buildings.service";
import { UnitsService } from "../units/units.service";
import { ReleaseRoomEditorComponent } from "./release-room-editor/release-room-editor.component";
import { DeleteModalComponent } from "../common/delete-modal/delete-modal.component";
import { EditDeleteRendererComponent } from "../common/renderer/edit-delete-rendered.component";
import { AuthService } from "src/app/utils/services/auth.service";

@Component({
  selector: "app-release-room",
  templateUrl: "./release-room.component.html",
  styleUrls: ["./release-room.component.scss"],
})
export class ReleaseRoomComponent implements OnInit {
  isLoading: boolean = false;
  masterGridApi: GridApi;
  detailGridApi: GridApi;
  defaultColDef = { resizable: true };

  gridRowDataReleaseRooms = [];
  gridRowDataDetails = [];
  pinnedBottomRowDataDetails = [];
  selectedRecord: any = null;

  propertiesList = [];
  buildingsList = [];
  unitsList = [];

  searchOptionsList = [
    { id: "all", name: "All" },
    { id: "tenantName", name: "Tenant Name" },
    { id: "receiptNo", name: "Receipt Number" },
    { id: "regNo", name: "Registration Number" },
  ];

  search: {
    propertyId: number;
    buildingId: number;
    unitId: number;
    fromDate: Date | string;
    toDate: Date | string;
    searchField: string;
    keyword: string;
  } = {
    propertyId: undefined,
    buildingId: undefined,
    unitId: undefined,
    fromDate: moment().subtract(1, "year").toDate(),
    toDate: moment().toDate(),
    searchField: "all",
    keyword: "",
  };

  get currencySymbol() {
    return this.authService?.authentication?.organization?.country
      ?.currencySymbol;
  }

  columnDefsReleaseRooms = [
    {
      headerName: "Receipt No.",
      field: "receiptNo",
      width: 140,
      sortable: true,
      filter: true,
      cellStyle: { fontWeight: "bold" },
    },
    {
      headerName: "Date",
      field: "date",
      width: 130,
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        return params.value ? moment(params.value).format("DD-MM-YYYY") : "";
      },
    },
    {
      headerName: "Release Date",
      field: "releaseDate",
      width: 160,
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        return params.value ? moment(params.value).format("DD-MM-YYYY") : "-";
      },
    },
    {
      headerName: "Reg. No",
      field: "regNo",
      width: 110,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Tenant Name",
      field: "tenantName",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Property",
      field: "propertyName",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Building",
      field: "buildingName",
      width: 130,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Unit",
      field: "unitNo",
      width: 100,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Floor",
      field: "floorName",
      width: 130,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Total Amount",
      field: "totalAmount",
      width: 165,
      type: "rightAligned",
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const sym = this.currencySymbol || "";
        const val = Number(params.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
    },
    {
      headerName: "Action",
      field: "Action",
      width: 170,
      cellRendererFramework: EditDeleteRendererComponent,
      cellRendererParams: {
        onEdit: this.editReleaseRoom.bind(this),
        onDelete: this.deleteReleaseRoom.bind(this),
      },
    },
  ];

  columnDefsDetails = [
    {
      headerName: "Head Name",
      field: "serviceName",
      flex: 1.5,
      minWidth: 120,
      sortable: true,
      cellStyle: (params) => {
        if (params.data?.isTotalRow || params.node?.rowPinned === "bottom") {
          return { "font-weight": "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Amount",
      field: "refundAmount",
      flex: 1,
      minWidth: 100,
      type: "rightAligned",
      cellRenderer: (params) => {
        const sym = this.currencySymbol || "";
        const val = Number(params.value) || 0;
        return (
          sym +
          val.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      },
      cellStyle: (params) => {
        if (params.data?.isTotalRow || params.node?.rowPinned === "bottom") {
          return { "font-weight": "bold" };
        }
        return null;
      },
    },
  ];

  constructor(
    private releaseRoomService: ReleaseRoomService,
    private propertiesService: PropertiesService,
    private buildingsService: BuildingsService,
    private unitsService: UnitsService,
    private modalService: BsModalService,
    private toastrMessage: ToastrMessage,
    private errorHandlingService: ErrorHandlingService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.getProperties();
    this.getReleaseRooms();
  }

  getProperties() {
    this.propertiesService.getProperties().subscribe({
      next: (resultGetProperties) => {
        this.propertiesList = resultGetProperties?.properties || [];
      },
      error: (error) => this.errorHandlingService.errors(error),
    });
  }

  onPropertyChange() {
    this.search.buildingId = undefined;
    this.search.unitId = undefined;
    this.buildingsList = [];
    this.unitsList = [];

    if (this.search.propertyId) {
      this.buildingsService
        .getBuildings({ propertyId: this.search.propertyId })
        .subscribe({
          next: (resultGetBuildings) => {
            this.buildingsList = resultGetBuildings?.buildings || [];
          },
          error: (error) => this.errorHandlingService.errors(error),
        });
    }
  }

  onBuildingChange() {
    this.search.unitId = undefined;
    this.unitsList = [];

    if (this.search.buildingId) {
      this.unitsService
        .getUnits({
          propertyId: this.search.propertyId,
          buildingId: this.search.buildingId,
        })
        .subscribe({
          next: (resultGetUnits) => {
            this.unitsList = resultGetUnits?.units || [];
          },
          error: (error) => this.errorHandlingService.errors(error),
        });
    }
  }

  getReleaseRooms(targetId?: number) {
    this.isLoading = true;
    const params: any = {};
    if (this.search.propertyId) {
      params.propertyId = this.search.propertyId;
    }
    if (this.search.buildingId) {
      params.buildingId = this.search.buildingId;
    }
    if (this.search.unitId) {
      params.unitId = this.search.unitId;
    }
    if (this.search.fromDate) {
      params.fromDate = moment(this.search.fromDate).format("YYYY-MM-DD");
    }
    if (this.search.toDate) {
      params.toDate = moment(this.search.toDate).format("YYYY-MM-DD");
    }
    if (this.search.keyword && this.search.keyword.trim()) {
      params.keyword = this.search.keyword.trim();
      params.searchField = this.search.searchField;
    }

    this.releaseRoomService.getReleaseRooms(params).subscribe({
      next: (resultGetReleaseRooms: any) => {
        this.isLoading = false;
        this.gridRowDataReleaseRooms =
          resultGetReleaseRooms?.releaseRooms || [];

        if (!this.gridRowDataReleaseRooms.length) {
          this.masterGridApi?.showNoRowsOverlay();
          this.gridRowDataDetails = [];
          this.pinnedBottomRowDataDetails = [];
          this.selectedRecord = null;
        } else {
          this.masterGridApi?.hideOverlay();
          of(1)
            .pipe(delay(50))
            .subscribe({
              next: () => {
                if (
                  this.masterGridApi &&
                  this.gridRowDataReleaseRooms.length > 0
                ) {
                  let targetNode = null;
                  if (targetId) {
                    this.masterGridApi.forEachNode((node) => {
                      if (node.data?.id === targetId) {
                        targetNode = node;
                      }
                    });
                  }
                  if (!targetNode) {
                    targetNode = this.masterGridApi.getDisplayedRowAtIndex(0);
                  }
                  if (targetNode) {
                    targetNode.setSelected(true);
                  }
                }
              },
            });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.gridRowDataReleaseRooms = [];
        this.gridRowDataDetails = [];
        this.pinnedBottomRowDataDetails = [];
        this.selectedRecord = null;
        this.masterGridApi?.showNoRowsOverlay();
        this.errorHandlingService.errors(error);
      },
    });
  }

  onMasterGridReady(params) {
    this.masterGridApi = params.api;
  }

  onDetailGridReady(params) {
    this.detailGridApi = params.api;
  }

  onRecordSelectionChanged() {
    const selectedRows = this.masterGridApi?.getSelectedRows() || [];
    if (selectedRows.length > 0) {
      this.selectedRecord = selectedRows[0];
      this.gridRowDataDetails = this.selectedRecord.details || [];

      const totalAmount = this.gridRowDataDetails.reduce(
        (sum, item) => sum + (Number(item.refundAmount) || 0),
        0
      );

      this.pinnedBottomRowDataDetails = [
        {
          serviceName: "Total",
          refundAmount: totalAmount,
          isTotalRow: true,
        },
      ];
    } else {
      this.selectedRecord = null;
      this.gridRowDataDetails = [];
      this.pinnedBottomRowDataDetails = [];
    }
  }

  newReleaseRoom() {
    const bsModalRef: BsModalRef = this.modalService.show(
      ReleaseRoomEditorComponent,
      {
        animated: true,
        backdrop: "static",
        keyboard: false,
        class: "modal-xl",
        initialState: {
          formStatus: "ADD",
          releaseRoomId: 0,
          isRegNoFrozen: false,
          tenant: null,
          allotment: null,
        },
      }
    );

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result) => {
        if (result) {
          const targetId = result?.id;
          this.getReleaseRooms(targetId);
        }
        subscription.unsubscribe();
      },
    });
  }

  editReleaseRoom(record) {
    if (!record || !record.id) {
      return;
    }

    const bsModalRef: BsModalRef = this.modalService.show(
      ReleaseRoomEditorComponent,
      {
        animated: true,
        backdrop: "static",
        keyboard: false,
        class: "modal-xl",
        initialState: {
          formStatus: "EDIT",
          releaseRoomId: record.id,
          isRegNoFrozen: true,
          tenant: {
            id: record.tenantId,
            name: record.tenantName,
            mobileNo: record.mobileNo,
            regNo: record.regNo,
          },
          allotment: {
            id: record.allotmentId,
            propertyId: record.propertyId,
            propertyName: record.propertyName,
            buildingId: record.buildingId,
            buildingName: record.buildingName,
            unitId: record.unitId,
            unitNo: record.unitNo,
            floorName: record.floorName,
          },
        },
      }
    );

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (result: any) => {
        if (result) {
          this.getReleaseRooms(record.id);
        }
        subscription.unsubscribe();
      },
    });
  }

  deleteReleaseRoom(record) {
    if (!record || !record.id) {
      return;
    }

    const receiptNo = record.receiptNo;
    const bsModalRef = this.modalService.show(DeleteModalComponent, {
      animated: true,
      backdrop: "static",
      keyboard: false,
      class: "modal-md",
      initialState: {
        message: `Do you want to delete release room receipt?`,
      },
    });

    const subscription = bsModalRef.content.onClose.subscribe({
      next: (resultConfirm: boolean) => {
        if (resultConfirm) {
          this.releaseRoomService.delete(record.id).subscribe({
            next: () => {
              this.toastrMessage.showSuccessMessage(
                "Release room deleted successfully"
              );
              this.getReleaseRooms();
            },
            error: (error) => this.errorHandlingService.errors(error),
          });
        }
        subscription.unsubscribe();
      },
    });
  }

  exportToCsv() {
    if (this.masterGridApi) {
      this.masterGridApi.exportDataAsCsv({
        fileName: `release_room_${moment().format("DDMMYYYY_HHmmss")}.csv`,
      });
    }
  }
}
