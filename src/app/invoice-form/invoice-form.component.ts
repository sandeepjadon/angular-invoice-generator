import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- PrimeNG Modules ---
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

// --- Data Models ---
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
  cgstRate: number; // <-- ADDED
  sgstRate: number; // <-- ADDED
  amount?: number;
}

export interface Invoice {
  seller: Party;
  buyer: Party;
  consignee: Party;
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
  subTotal?: number;
  cgstAmount?: number; // This is now a sum of item taxes
  sgstAmount?: number; // This is now a sum of item taxes
  totalAmount?: number;
}

// Interface for the HSN summary
export interface HsnSummaryItem {
  hsn: string;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  totalTaxAmount: number;
}


@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [ CommonModule, FormsModule, CardModule, FieldsetModule, InputTextModule, CalendarModule, TableModule, ButtonModule, CheckboxModule, CurrencyPipe, DatePipe ],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {

  isSameAsBuyer: boolean = true;
  invoice: Invoice = {
    seller: { name: 'SOLAR SMART TRADING CO.', address: 'HOUSE NO. 497 GALI NO 1, SHAMBHU NAGAR SHIKOHABAD, FIROZABAD', gstin: '09FUZPM9480C1ZO', state: 'Uttar Pradesh', stateCode: '09' },
    buyer: { name: '', address: '', gstin: '', state: '', stateCode: '' },
    consignee: { name: '', address: '', gstin: '', state: '', stateCode: '' },
    invoiceNumber: '',
    invoiceDate: new Date(),
    eWayBillNo: '', deliveryNote: '', termsOfPayment: '', referenceNoAndDate: '',
    buyersOrderNo: '', buyersOrderDate: new Date(), dispatchedThrough: '', dispatchDocNo: '', deliveryNoteDate: new Date(),
    destination: '', termsOfDelivery: '', billOfLadingLR_RRNo: '', motorVehicleNo: '',
    items: [
      {description: '', hsn: '', quantity: 1, rate: 0,per: 'Nos', discountPercentage: 0, cgstRate: 6, sgstRate: 6}
    ],
    panNo: 'FUZPM9480C', totalAmountInWords: ''
  };

  hsnSummary: HsnSummaryItem[] = [];

  constructor() { }

  ngOnInit(): void { this.calculateAllTotals(); }

  onSameAsBuyerChange(): void {
    if (this.isSameAsBuyer) { this.invoice.consignee = { ...this.invoice.buyer }; }
    else { this.invoice.consignee = { name: '', address: '', gstin: '', state: '', stateCode: '' }; }
  }

  onBuyerDetailsChange(): void {
    if(this.isSameAsBuyer) { this.invoice.consignee = { ...this.invoice.buyer }; }
  }
  
  addNewItem(): void {
    this.invoice.items.push({
      description: '', hsn: '', quantity: 1, rate: 0, per: 'Nos',
      discountPercentage: 0, cgstRate: 6 , sgstRate: 6, amount: 0
    });
  }

  deleteItem(index: number): void {
    this.invoice.items.splice(index, 1);
    this.calculateAllTotals();
  }

  calculateAllTotals(): void {
    let totalCgst = 0;
    let totalSgst = 0;

    // Calculate amount for each item
    this.invoice.items.forEach(item => {
      const grossAmount = item.quantity * item.rate;
      const discountAmount = grossAmount * (item.discountPercentage / 100);
      item.amount = grossAmount - discountAmount;
    });

    this.invoice.subTotal = this.invoice.items.reduce((acc, item) => acc + (item.amount || 0), 0);
    
    // Calculate total taxes by summing up from each item
    this.invoice.items.forEach(item => {
        totalCgst += (item.amount || 0) * (item.cgstRate / 100);
        totalSgst += (item.amount || 0) * (item.sgstRate / 100);
    });
    this.invoice.cgstAmount = totalCgst;
    this.invoice.sgstAmount = totalSgst;

    this.invoice.totalAmount = this.invoice.subTotal + this.invoice.cgstAmount + this.invoice.sgstAmount;
    this.invoice.totalAmountInWords = this.convertToIndianWords(this.invoice.totalAmount || 0);

    // --- Corrected HSN Summary Logic ---
    const hsnMap: { [key: string]: { taxableValue: number, cgstRate: number, sgstRate: number } } = {};

    for (const item of this.invoice.items) {
      if (!item.hsn) continue;
      // Group by HSN and Tax Rates
      const key = `${item.hsn}_${item.cgstRate}_${item.sgstRate}`;
      
      if (hsnMap[key]) {
        hsnMap[key].taxableValue += item.amount || 0;
      } else {
        hsnMap[key] = {
          taxableValue: item.amount || 0,
          cgstRate: item.cgstRate,
          sgstRate: item.sgstRate
        };
      }
    }

    this.hsnSummary = Object.keys(hsnMap).map((key, index) => {
      const [hsn] = key.split('_');
      const data = hsnMap[key];
      const cgstAmount = (data.taxableValue * data.cgstRate) / 100;
      const sgstAmount = (data.taxableValue * data.sgstRate) / 100;
      return {
        hsn: hsn,
        taxableValue: data.taxableValue,
        cgstRate: data.cgstRate,
        cgstAmount: cgstAmount,
        sgstRate: data.sgstRate,
        sgstAmount: sgstAmount,
        totalTaxAmount: cgstAmount + sgstAmount,
      };
    });
  }

  printInvoice(): void { window.print(); }
  
  private convertToIndianWords(num: number): string {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const R = 'Rupees '; const P = ' Paise';
    const [integerPart, decimalPart] = num.toFixed(2).split('.');
    let inWords = '';
    const numToWords = (n: string): string => {
        let str = ''; if (n.length > 9) return str;
        let n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n_array) return '';
        str += (Number(n_array[1]) !== 0) ? (a[Number(n_array[1])] || b[Number(n_array[1][0])] + ' ' + a[Number(n_array[1][1])]) + 'crore ' : '';
        str += (Number(n_array[2]) !== 0) ? (a[Number(n_array[2])] || b[Number(n_array[2][0])] + ' ' + a[Number(n_array[2][1])]) + 'lakh ' : '';
        str += (Number(n_array[3]) !== 0) ? (a[Number(n_array[3])] || b[Number(n_array[3][0])] + ' ' + a[Number(n_array[3][1])]) + 'thousand ' : '';
        str += (Number(n_array[4]) !== 0) ? (a[Number(n_array[4])] || b[Number(n_array[4][0])] + ' ' + a[Number(n_array[4][1])]) + 'hundred ' : '';
        str += (Number(n_array[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n_array[5])] || b[Number(n_array[5][0])] + ' ' + a[Number(n_array[5][1])]) : '';
        return str;
    };
    inWords += numToWords(integerPart); if (inWords) inWords += R;
    const decimalInWords = numToWords(decimalPart); if (decimalInWords) { inWords += decimalInWords + P; }
    return ('INR ' + inWords).trim().replace(/\s+/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}

