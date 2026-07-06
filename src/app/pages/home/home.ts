import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly highlights = [
    'Assets and financial accounts',
    'Loans and insurance policies',
    'Properties and document locations',
    'Trusted contacts for continuity',
  ];
}
