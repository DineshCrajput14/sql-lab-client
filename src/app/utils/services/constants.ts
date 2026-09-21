import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class Constants {
  documentType = [
    {
      id: "PROPERTY_DEED",
      name: "Title Deed / Ownership Document",
    },
    {
      id: "PROPERTY_IMAGE",
      name: "Property Photo",
    },
    {
      id: "TENANT_ID_PROOF",
      name: "Tenant ID Proof (NRC/Passport)",
    },
    {
      id: "ALLOTMENT_AGREEMENT",
      name: "Allotment Agreement Contract",
    },
    {
      id: "PAYMENT_RECEIPT",
      name: "Payment Receipt / Proof",
    },
    {
      id: "MAINTENANCE_PHOTO",
      name: "Maintenance Repair Photo",
    },
    {
      id: "OTHER",
      name: "Other Document",
    },
  ];
}
