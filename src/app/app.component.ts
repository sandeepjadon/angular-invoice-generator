import { Component } from '@angular/core';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    InvoiceFormComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'invoice-generator';
}
