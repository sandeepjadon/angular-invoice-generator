import { Routes } from '@angular/router';
import { HomeComponent } from './app/home/home.component';
import { InvoiceFormComponent } from './app/invoice-form/invoice-form.component';
import { QuotationFormComponent } from './app/quotation-form/quotation-form.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'invoice', component: InvoiceFormComponent },
    { path: 'quotation', component: QuotationFormComponent },
    { path: '**', redirectTo: '' }
];