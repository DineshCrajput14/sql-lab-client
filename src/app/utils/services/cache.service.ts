import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CacheService {
  property = {
    search: {
      alreadySearched: false,
      keyword: "",
      status: "",
      type: "",
    },
  };

  tenant = {
    search: {
      alreadySearched: false,
      keyword: "",
      status: "",
      propertyId: undefined,
    },
  };

  payment = {
    search: {
      alreadySearched: false,
      keyword: "",
      status: "",
      fromDate: "",
      toDate: "",
    },
  };

  maintenance = {
    search: {
      alreadySearched: false,
      keyword: "",
      status: "",
      priority: "",
    },
  };

  clearSearchCache() {
    this.property.search = {
      alreadySearched: false,
      keyword: "",
      status: "",
      type: "",
    };
    this.tenant.search = {
      alreadySearched: false,
      keyword: "",
      status: "",
      propertyId: undefined,
    };
    this.payment.search = {
      alreadySearched: false,
      keyword: "",
      status: "",
      fromDate: "",
      toDate: "",
    };
    this.maintenance.search = {
      alreadySearched: false,
      keyword: "",
      status: "",
      priority: "",
    };
  }

  constructor() {}
}
