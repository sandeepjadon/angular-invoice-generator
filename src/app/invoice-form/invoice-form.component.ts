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
import { Router } from '@angular/router';

// --- Data Models ---
export interface Party {
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode?: string;
  email?: string;
  mobileNo?: string;
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
  igstRate: number;
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
  igstAmount?: number;
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
  igstRate: number;
  igstAmount: number;
  totalTaxAmount: number;
}


@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, FieldsetModule, InputTextModule, CalendarModule, TableModule, ButtonModule, CheckboxModule, CurrencyPipe, DatePipe],
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {

  isSameAsBuyer: boolean = true;
  invoice: Invoice = {
    seller: { name: 'SOLAR SMART TRADING CO.', address: 'HOUSE NO. 497 GALI NO 1, SHAMBHU NAGAR SHIKOHABAD, FIROZABAD-283135', email: 'care.solarsmart@gmail.com', mobileNo: '+91-9720375050', gstin: '09FUZPM9480C1ZO', state: 'Uttar Pradesh', stateCode: '09' },
    buyer: { name: '', address: '', mobileNo: '+91-', gstin: '', state: '', stateCode: '' },
    consignee: { name: '', address: '', mobileNo: '+91-', gstin: '', state: '', stateCode: '' },
    invoiceNumber: '',
    invoiceDate: new Date(),
    eWayBillNo: '', deliveryNote: '', termsOfPayment: '', referenceNoAndDate: '',
    buyersOrderNo: '', buyersOrderDate: new Date(), dispatchedThrough: '', dispatchDocNo: '', deliveryNoteDate: new Date(),
    destination: '', termsOfDelivery: '', billOfLadingLR_RRNo: '', motorVehicleNo: '',
    items: [
      { description: '', hsn: '', quantity: 1, rate: 0, per: 'Nos', discountPercentage: 0, cgstRate: 6, sgstRate: 6, igstRate: 0 }
    ],
    panNo: 'FUZPM9480C', totalAmountInWords: ''
  };

  hsnSummary: HsnSummaryItem[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void { this.calculateAllTotals(); }

  onSameAsBuyerChange(): void {
    if (this.isSameAsBuyer) { this.invoice.consignee = { ...this.invoice.buyer }; }
    else { this.invoice.consignee = { name: '', address: '', gstin: '', state: '', stateCode: '' }; }
  }

  onBuyerDetailsChange(): void {
    if (this.isSameAsBuyer) { this.invoice.consignee = { ...this.invoice.buyer }; }
  }

  addNewItem(): void {
    this.invoice.items.push({
      description: '', hsn: '', quantity: 1, rate: 0, per: 'Nos',
      discountPercentage: 0, cgstRate: 6, sgstRate: 6, amount: 0, igstRate: 0
    });
  }

  deleteItem(index: number): void {
    this.invoice.items.splice(index, 1);
    this.calculateAllTotals();
  }

  calculateAllTotals(): void {
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    this.invoice.items.forEach(item => {
      if (item.igstRate > 0) {
        item.cgstRate = 0;
        item.sgstRate = 0;
      } else {
        item.igstRate = 0;
      }
    });

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
      totalIgst += (item.amount || 0) * (item.igstRate / 100);
    });
    this.invoice.cgstAmount = totalCgst;
    this.invoice.sgstAmount = totalSgst;
    this.invoice.igstAmount = totalIgst;

    this.invoice.totalAmount = this.invoice.subTotal + this.invoice.cgstAmount + this.invoice.sgstAmount + this.invoice.igstAmount;
    this.invoice.totalAmountInWords = this.convertToIndianWords(this.invoice.totalAmount || 0);

    // --- Corrected HSN Summary Logic ---
    const hsnMap: { [key: string]: { taxableValue: number, cgstRate: number, sgstRate: number, igstRate: number } } = {};

    for (const item of this.invoice.items) {
      if (!item.hsn) continue;
      // Group by HSN and Tax Rates
      const key = item.igstRate > 0
        ? `${item.hsn}_IGST_${item.igstRate}`
        : `${item.hsn}_GST_${item.cgstRate}_${item.sgstRate}`;

      if (hsnMap[key]) {
        hsnMap[key].taxableValue += item.amount || 0;
      } else {
        hsnMap[key] = {
          taxableValue: item.amount || 0,
          cgstRate: item.cgstRate,
          sgstRate: item.sgstRate,
          igstRate: item.igstRate
        };
      }
    }

    this.hsnSummary = Object.keys(hsnMap).map((key, index) => {
      const data = hsnMap[key];
      const parts = key.split('_');

      let hsn = parts[0];
      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (parts[1] === 'IGST') {
        igst = Number(parts[2]) || 0;
      } else {
        cgst = Number(parts[2]) || 0;
        sgst = Number(parts[3]) || 0;
      }

      const cgstAmount = (data.taxableValue || 0) * cgst / 100;
      const sgstAmount = (data.taxableValue || 0) * sgst / 100;
      const igstAmount = (data.taxableValue || 0) * igst / 100;
      return {
        hsn: hsn,
        taxableValue: data.taxableValue,
        cgstRate: cgst,
        cgstAmount: cgstAmount,
        sgstRate: sgst,
        sgstAmount: sgstAmount,
        igstRate: igst,
        igstAmount: igstAmount,
        totalTaxAmount: cgstAmount + sgstAmount + igstAmount,
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
    return ('INR ' + inWords).trim().replace(/\s+/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Only';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

