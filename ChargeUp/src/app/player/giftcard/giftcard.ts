import { Component } from '@angular/core';

@Component({
  selector: 'app-giftcard',
  standalone: false,
  templateUrl: './giftcard.html',
  styleUrls: ['./giftcard.css']
})
export class Giftcard {
  // Bind these dynamically from API if needed
  totalGiftCards = 0;
  availableGiftCards = 0;
  expiredGiftCards = 0;
}
