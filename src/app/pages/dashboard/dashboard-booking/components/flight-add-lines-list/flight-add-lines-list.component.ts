import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-flight-add-lines-list',
  templateUrl: './flight-add-lines-list.component.html',
  styleUrls: ['./flight-add-lines-list.component.scss']
})
export class FlightAddLinesListComponent implements OnInit {
  RequestLineApiResponse: any;
  data = {
    "serviceRequestLine": {
      "requestId": 90113,
      "requestLineId": 111,
      "tripTypeId": 1,
      "noofADT": 1,
      "noofCHD": null,
      "noofINF": null,
      "allianceCode": null,
      "stopOverCode": null,
      "expandableParametersCode": [
        "3"
      ],
      "passengerTypeId": null,
      "airlineCode": null,
      "dealCode": null,
      "statusId": null,
      "createdBy": 1,
      "createdDate": "2021-10-05T08:32:13.000+0000",
      "updatedBy": null,
      "updatedDate": null,
      "typeOfFlight": null,
      "connectingDetails": null,
      "flexStops": []
    },
    "serviceRequestSegment": [
      {
        "requestSegmentId": 125,
        "requestlineID": 111,
        "requestID": null,
        "fromCode": "RJA",
        "toCode": "HYD",
        "depatureDate": "2021-10-05T18:30:00.000+0000",
        "depatureTime": null,
        "arrivalTime": null,
        "className": "W",
        "rbd": "A",
        "airlineCode": "I9",
        "validateCarrier": true,
        "nearestAirportDepartureCode": [
          ""
        ],
        "nearestAirportArrivalCode": [
          ""
        ],
        "transitPointCode": [
          ""
        ],
        "excludePointCode": [
          ""
        ],
        "createdBy": 1,
        "createdDate": "2021-10-05T08:32:13.000+0000",
        "updatedBy": null,
        "updatedDate": null,
        "flexClassName": [],
        "flexFromCode": [],
        "flexToCode": [],
        "flexAirLineCode": [],
        "flexStops": [],
        "flexDepature": null,
        "flexReturn": null,
        "flightDirection": null,
        "returnDate": null,
        "budgetFrom": null,
        "budgetTo": null
      }
    ],
    "paxServiceRequestLine": []
  }
  //search setup
  searchText: any;
  //pagination
  page = 1;
  pageSize = 10;
  collectionSize: number;
  constructor() { }
  trackByFn(index, item) {
    return index;
  }
  ngOnInit(): void {
    this.RequestLineApiResponse = this.data.serviceRequestLine;
  }

}
