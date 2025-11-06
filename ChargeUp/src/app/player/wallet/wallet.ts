import { Component, OnInit } from '@angular/core';
import { PlayerService, Transaction } from '../../services/player-service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-wallet',
  standalone: false,
  templateUrl: './wallet.html',
  styleUrls: ['./wallet.css']
})
export class Wallet implements OnInit {
  balance: number = 0;
  userId: number = 1; 

  recentCashouts: Transaction[] = [];
  allTransactions: Transaction[] = [];
  viewMode: 'main' | 'transactions' = 'main';

  showCashoutModal: boolean = false;
  selectedCashoutAmount: number = 0;
  cashoutMethod: string = '';
  currentUserId: number = 0;

  pushCardRecipient = {
    name: '',
    email: '',
    phone: '',
    notes: ''
  };

  constructor(private playerService: PlayerService, private auth: Auth) {}

  ngOnInit(): void {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = sessionData?.userId || localStorage.getItem('userId');
    this.loadBalance();
    this.loadRecentCashouts();
    this.loadAllTransactions();
  }

  private loadBalance(): void {
    this.playerService.getWalletBalance(this.currentUserId).subscribe({
      next: (bal: number) => this.balance = bal,
      error: (err: any) => console.error('Failed to fetch wallet balance', err)
    });
  }

  cashout(): void {
    if (this.balance <= 0) {
      alert('No funds available to cashout.');
      return;
    }

    this.selectedCashoutAmount = this.balance;
    this.showCashoutModal = true;
  }

  confirmCashout(): void {
    const transaction: Transaction = {
      UserId: this.userId,
      TransactionType: 'Cashout',
      Amount: this.balance,
      BalanceBefore: this.balance,
      BalanceAfter: 0,
      Status: 'Pending',
      CreatedAt: new Date()
    };

    this.playerService.createTransaction(transaction).subscribe({
      next: (res: Transaction) => {
        alert(`Cashout request for $${this.balance} submitted!`);
        this.balance = 0;
        this.loadRecentCashouts();
        this.loadAllTransactions();
        this.closeCashoutModal();
      },
      error: (err: any) => console.error(err)
    });
  }

  loadRecentCashouts(): void {
    this.playerService.getAllTransactions().subscribe({
      next: (transactions: Transaction[]) => {
        this.recentCashouts = transactions
          .filter((t: Transaction) => t.TransactionType === 'Cashout' && t.UserId === this.userId)
          .slice(0, 3);
      },
      error: (err: any) => console.error(err)
    });
  }

  loadAllTransactions(): void {
    this.playerService.getAllTransactions().subscribe({
      next: (transactions: Transaction[]) => {
        this.allTransactions = transactions.filter(t => t.UserId === this.userId);
      },
      error: (err: any) => console.error(err)
    });
  }

  viewWalletTransactions(): void {
    this.viewMode = 'transactions';
  }

  backToWallet(): void {
    this.viewMode = 'main';
  }

  closeCashoutModal(): void {
    this.showCashoutModal = false;
    this.cashoutMethod = '';
    this.pushCardRecipient = { name: '', email: '', phone: '', notes: '' };
  }

  goToGiftCard(): void {
    console.log('Navigate to gift card page');
    // Implement actual navigation logic if needed
  }

  submitPushCard(): void {
    console.log('Push to card:', this.pushCardRecipient);
    this.closeCashoutModal();
  }
}
