import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService, RechargeTransaction } from '../../services/player-service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-recharge',
  standalone: false,
  templateUrl: './recharge.html',
  styleUrls: ['./recharge.css']
})
export class Recharge implements OnInit {
  rechargeOptions: number[] = [10, 15, 20, 30, 40, 50, 75, 100];
  selectedAmount: number = 0;
  transactionNote: string = '';

  paymentTypes = [
    { label: 'Wallet', value: 'wallet' },
    { label: 'Payment Portal', value: 'portal' }
  ];
  selectedPaymentType: string = 'portal';

  paymentMethods = [
    {
      title: 'Pay By Card',
      description: 'Secure payment • No KYC needed',
      icon: 'fas fa-credit-card',
      color: '#4e5efc',
      icons: [
        'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png',
        'https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png'
      ]
    }
  ];

  recentRecharges: { amount: number; note: string; date: Date }[] = [];

  showPaymentPage: boolean = false;
  selectedMethod: string = '';

  showPendingRechargePage: boolean = false;
  showFilterModal: boolean = false;
  selectedFilter: string = '';
  currentUserId: number = 0;

  constructor(private router: Router, private playerService: PlayerService, private auth: Auth) {}

  ngOnInit(): void {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = sessionData?.userId || localStorage.getItem('userId');
    this.loadRechargeOptions();
    this.loadRecentRecharges();
  }

  selectOption(amount: number): void {
    this.selectedAmount = amount;
  }

  walletRecharge(): void {
    if (this.selectedAmount > 0) {
      const rechargeData: RechargeTransaction = {
        LoginId: 'user1',
        Recharge: this.selectedAmount,
        CreatedAt: new Date()
      };

      this.playerService.createRecharge(rechargeData).subscribe({
        next: (res) => {
          alert(`Wallet Recharge of $${this.selectedAmount} successful!`);
          this.transactionNote = '';
          this.loadRecentRecharges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  redirectToPayment(method: string): void {
    if (this.selectedAmount === 0) {
      alert('Please select an amount first.');
      return;
    }
    this.selectedMethod = method;
    this.showPaymentPage = true;
  }

  goBack(): void {
    this.showPaymentPage = false;
  }

  completePayment(): void {
    alert('Payment initiated for $' + this.selectedAmount + ' using ' + this.selectedMethod);
  }
  private loadRechargeOptions(): void {
    console.log('Loading amount permissions for user:', this.currentUserId);
    this.playerService.getAmountPermissions(this.currentUserId).subscribe({
      next: (amounts) => {
        this.rechargeOptions = (amounts || []).sort((a, b) => a - b);
      },
      error: (err) => {
        console.error('Failed to load amount permissions', err);
        this.rechargeOptions = [10, 20, 50, 100]; // fallback
      }
    });
  }
  private loadRecentRecharges(): void {
    this.playerService.getAllRecharges().subscribe({
      next: (res: RechargeTransaction[]) => {
        this.recentRecharges = res
          .map(r => ({
            amount: r.Recharge,
            note: r.Remark || 'Wallet Recharge',  // Use Remark from server if exists
            date: r.CreatedAt ? new Date(r.CreatedAt) : new Date()
          }))
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5);
      },
      error: (err) => console.error('Failed to load recent recharges', err)
    });
  }

  goToPendingRecharge(): void {
    this.showPendingRechargePage = true;
    this.showPaymentPage = false;
  }

  backFromPendingRecharge(): void {
    this.showPendingRechargePage = false;
  }

  openFilterModal(): void {
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  applyFilter(): void {
    this.showFilterModal = false;
  }
}
