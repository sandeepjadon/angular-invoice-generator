import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- PrimeNG Modules ---
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { Router } from '@angular/router';


// --- Data Models ---
export interface QuoteParty {
  name: string;
  address: string;
  phoneNo: string;
  email: string;
  gstin: string;
}

export interface QuoteItem {
  description: string;
  rating?: string;
  quantity: number;
  pricePerUnit: number;
  gstPercentage: number;
  amount?: number;
}

export interface Quotation {
  seller: QuoteParty;
  buyer: QuoteParty;
  quoteNo: string;
  date: Date;
  paymentDueDate?: Date;
  validFor?: Date;
  preparedBy: string;
  items: QuoteItem[];
  subTotal: number;
  advance: number;
  finalAmount: number;
  accountDetails: {
    companyName: string;
    accountNo: string;
    ifsc: string;
    branch: string;
  }
}

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, FieldsetModule, InputTextModule,
    DatePickerModule, TableModule, ButtonModule, CurrencyPipe, DatePipe, TextareaModule
  ],
  templateUrl: './quotation-form.component.html',
  styleUrls: ['./quotation-form.component.scss']
})
export class QuotationFormComponent implements OnInit {

  quotation: Quotation = {
    seller: {
      name: 'Solar Smart Trading CO.',
      address: 'HNo.497, Gali No.1,Shambhu Nagar,Shikohabad,Firozabad,UP, 283135',
      phoneNo: '97203 75050, 97203 75051',
      email: 'care.solarsmart@gmail.com',
      gstin: '09FUZPM9480C1ZO'
    },
    buyer: { name: '', address: '', phoneNo: '', email: '', gstin: '' },
    quoteNo: 'SS/0022',
    date: new Date(),
    paymentDueDate: undefined,
    validFor: undefined,
    preparedBy: 'Solar Smart Trading Co.',
    items: [
      { description: '', rating: '', quantity: 1, pricePerUnit: 0, gstPercentage: 18, amount: 0 }
    ],
    subTotal: 0,
    advance: 0,
    finalAmount: 0,
    accountDetails: {
      companyName: 'Solar Smart Trading Co.',
      accountNo: '1984108700001357',
      ifsc: 'PUNB0198410',
      branch: '82 ELLORA EN 100 FEET ROAD,DAYALBAGH,282005.'
    }
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.calculateTotals();
  }

  addNewItem(): void {
    this.quotation.items.push({
      description: '', rating: '', quantity: 1, pricePerUnit: 0, gstPercentage: 18, amount: 0
    });
  }

  deleteItem(index: number): void {
    this.quotation.items.splice(index, 1);
    this.calculateTotals();
  }

  calculateTotals(): void {
    let subTotalSum = 0;

    // Calculate amount for each item: (Qty * Price) + GST
    this.quotation.items.forEach(item => {
      const baseAmount = item.quantity * item.pricePerUnit;
      const taxAmount = baseAmount * (item.gstPercentage / 100);
      // Rounding to nearest integer as shown in your image
      item.amount = Math.round(baseAmount + taxAmount);
      subTotalSum += item.amount;
    });

    this.quotation.subTotal = subTotalSum;
    this.quotation.finalAmount = this.quotation.subTotal - (this.quotation.advance || 0);
  }

  printQuotation(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}