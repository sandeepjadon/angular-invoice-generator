// --- Data Models (Expanded) ---
export interface Party {
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode?: string;
}

export interface InvoiceItem {
  description: string;
  hsn: string;
  quantity: number;
  rate: number;
  per: string;
  discountPercentage: number;
  amount?: number;
}

export interface Invoice {
  seller: Party;
  buyer: Party;
  invoiceNumber: string;
  invoiceDate: Date;
  eWayBillNo?: string;
  deliveryNote?: string;
  termsOfPayment?: string;
  referenceNoAndDate?: string;
  buyersOrderNo?: string;
  buyersOrderDate?: Date;
  dispatchedThrough?: string;
  dispatchDocNo?: string;
  deliveryNoteDate?: Date;
  destination?: string;
  termsOfDelivery?: string;
  billOfLadingLR_RRNo?: string;
  motorVehicleNo?: string;
  items: InvoiceItem[];
  panNo?: string;
  totalAmountInWords?: string;
  // Calculated fields
  subTotal?: number;
  cgstRate: number;
  cgstAmount?: number;
  sgstRate: number;
  sgstAmount?: number;
  totalAmount?: number;
}