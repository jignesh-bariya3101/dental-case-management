import { CaseStatus } from '@prisma/client';

export interface ImportCaseDto {
  'Received Date': string;
  Patient: string;
  Doctor: string;
  'Doctor Number': number;
  Client: string;
  'Pan #': string;
  'Ship Date': string;
  'Due Date': string;
  'Case Ref #': number;
  'DYMO Barcode': number;
  'Shipped to Client': string;
  Status: string;
  'Special Instructions': string;
  Type: string;
  'Tooth #': string;
  Restoration: string;
  Shade: string;
  Level: string;
}

export const caseStatusMap = {
  draft: CaseStatus.Draft,
  intransitfromclient: CaseStatus.IntransitfromClient,
  detailspending: CaseStatus.DetailsPending,
  pendinglabquestion: CaseStatus.PendingLabQuestion,
  checkin: CaseStatus.CheckIn,
  remakerequest: CaseStatus.RemakeRequest,
  remake: CaseStatus.RemakeRequest,
  adjustment: CaseStatus.RemakeRequest,
  intransittomanufacturingdept: CaseStatus.IntransittoManufacturingDept,
  receivedbymanufacturingdept: CaseStatus.ReceivedbyManufacturingDept,
  inmanufacturing: CaseStatus.InManufacturing,
  readyforshipmenttonextdentallab: CaseStatus.ReadyforShipmenttoNextDentalLab,
  intransitfrommanufacturingdept: CaseStatus.IntransitfromManufacturingDept,
  receivedfrommanufacturingdept: CaseStatus.ReceivedfromManufacturingDept,
  inqc: CaseStatus.InQC,
  pendingclientshipment: CaseStatus.PendingClientShipment,
  intransittoclient: CaseStatus.InTransitToClient,
  onhold: CaseStatus.OnHold,
  cancelled: CaseStatus.Cancelled,
  duplicatecase: CaseStatus.DuplicateCase,
  latecase: CaseStatus.LateCase,
  pendingmanufacturingdepartmentshipment:
    CaseStatus.PendingManufacturingDepartmentShipment,
  pendingfornextdentallabshipment: CaseStatus.PendingForNextDentalLabshipment,
  completed: CaseStatus.Completed,
};
