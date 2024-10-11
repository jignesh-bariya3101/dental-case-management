export const modelTypeRoles = {
  DENTIST: 'DENTIST',
  USER: 'USER',
  MANUFACTURE: 'MANUFACTURE',
};

export const userRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  ACCOUNTANT: 'ACCOUNTANT',
  DATA_OPERATOR: 'DATA_OPERATOR',
};

export const DentistCaseStatus = [
  'Draft',
  'IntransitfromClient',
  'Completed',
  'PendingForNextDentalLabshipment',
];

export const ManufacturingCaseStatus = [
  'ReceivedbyManufacturingDept',
  'ReadyforShipmenttoNextDentalLab',
  'IntransitfromManufacturingDept',
  'PendingManufacturingDepartmentShipment',
  'InManufacturing',
];

export const caseStatus = {
  Draft: 'Draft',
  IntransitfromClient: 'In Transit From Client',
  DetailsPending: 'Details Pending',
  PendingLabQuestion: 'Pending Lab Question',
  CheckIn: 'Check In',
  RemakeRequest: 'Remake Request',
  IntransittoManufacturingDept: 'In Transit To Manufacturing Dept',
  ReceivedbyManufacturingDept: 'Received By Manufacturing Dept',
  InManufacturing: 'In Manufacturing',
  ReadyforShipmenttoNextDentalLab: 'Ready For Shipment To Next Dental Lab',
  IntransitfromManufacturingDept: 'In Transit From Manufacturing Dept',
  ReceivedfromManufacturingDept: 'Received From Manufacturing Dept',
  InQC: 'In QC',
  PendingClientShipment: 'Pending Client Shipment',
  InTransitToClient: 'In Transit To Client',
  OnHold: 'On Hold',
  Cancelled: 'Cancelled',
  DuplicateCase: 'Duplicate Case',
  LateCase: 'Late Case',
  Completed: 'Completed',
  PendingManufacturingDepartmentShipment:
    'Pending Manufacturing Department Shipment',
  PendingForNextDentalLabshipment: 'Pending For Next Dental Labshipment',
};

export const ADMIN = 'admin';

export const PRODUCTTYPE = {
  Crown: 'Crown',
  Bridge: 'Bridge',
  Appliance: 'Appliance',
  Coping: 'Coping',
  Implant: 'Implant',
  Removable: 'Removable',
};
