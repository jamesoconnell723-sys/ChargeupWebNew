import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlayerService, RedeemWithLoginId, PaymentMethod } from '../../services/player-service';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';
import { AgentService, ServiceFee } from '../../services/agent-service';

type ViewMode = 'main' | 'pending' | 'pendingRedeem' | 'allTransactions';;

@Component({
  selector: 'app-redeem',
  standalone: false,
  templateUrl: './redeem.html',
  styleUrls: ['./redeem.css']
})
export class Redeem implements OnInit {
  amounts: number[] = [20, 50, 100, 200, 500];
  selectedAmount: number = 50;
  transactionNote: string = '';

  recentRedeems: RedeemWithLoginId[] = [];
  pendingRedeems: RedeemWithLoginId[] = [];
  totalRedeemsCount: number = 0;
  currentUserId: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  viewMode: ViewMode = 'main';
  showAttentionModal = false;
  showPaymentMethodModal = false;

  showRedeemConfirmModal = false;
  activeServiceFee: ServiceFee | null = null;
  netRedeemAmount: number = 0;
  redeemRemark: string = '';
  currentUserName: string = '';

  paymentMethod: PaymentMethod = {
    PaymentMethodId: undefined,
    UserId: 1,
    CashAppId: '',
    PaypalId: '',
    VenmoId: '',
    ZelleId: ''
  };

  isSavingPayment = false;
  changePasswordForm: FormGroup;
  searchTerm: string = '';
  filterSelection: { redeem?: boolean; remark?: boolean } = {};
  showFilterModal: boolean = false;

  constructor(private fb: FormBuilder, private playerService: PlayerService, private router: Router, private auth: Auth,
    private agentService: AgentService
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = sessionData?.userId || localStorage.getItem('userId');

    if (!this.currentUserId || this.currentUserId <= 0) {
      setTimeout(() => {
        const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
        this.currentUserId = sessionData?.userId || localStorage.getItem('userId');
        if (this.currentUserId && this.currentUserId > 0) {
          this.loadAllRedeems();
        }
      }, 300);
    } else {
      this.loadAllRedeems();
    }

    this.getServiceFee();

  }
  getServiceFee() {
    this.agentService.getActiveServiceFee().subscribe({
      next: (fee) => {
        this.activeServiceFee = fee;
      },
      error: (err) => console.error('Failed to fetch service fee', err)
    });
  }

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
  }

  openAttentionModal(): void {
    if (!this.selectedAmount) {
      Swal.fire('Warning', 'Please select an amount to redeem.', 'warning');
      return;
    }
    this.agentService.getActiveServiceFee().subscribe({
      next: (fee) => {
        this.activeServiceFee = fee;
        const percent = fee?.serviceFeePercent ?? 0;

        const feeAmount = (this.selectedAmount * percent) / 100;
        this.netRedeemAmount = +(this.selectedAmount - feeAmount).toFixed(2);

        this.showRedeemConfirmModal = true;
      },
      error: (err) => {
        console.error('Error fetching service fee', err);
        Swal.fire('Error', 'Failed to load service fee percentage.', 'error');
      }
    });
  }
  closeRedeemConfirmModal(): void {
    this.showRedeemConfirmModal = false;
  }
  confirmRedeem(): void {
    if (!this.activeServiceFee) return;

    const data = {
      UserId: this.currentUserId,
      Amount: this.selectedAmount,
      ServiceFee: this.selectedAmount * (this.activeServiceFee.serviceFeePercent / 100),
      NetAmount: this.netRedeemAmount,
      Status: 'Pending Confirmation',
      Remarks: this.redeemRemark || ''
    };

    this.playerService.createRedeem(data).subscribe({
      next: () => {
        this.showRedeemConfirmModal = false;
        Swal.fire('Success', 'Redeem request has been sent successfully!', 'success');
        this.loadAllRedeems();
        this.redeemRemark = '';
      },
      error: (err) => {
        console.error('Redeem creation failed', err);
        Swal.fire('Error ❌', 'Failed to create redeem request.', 'error');
      }
    });
  }


  closeAttentionModal(): void {
    this.showAttentionModal = false;
  }

  openPaymentMethodModal(): void {
    this.showAttentionModal = false;
    this.showPaymentMethodModal = true;
  }

  closePaymentMethodModal(): void {
    this.showPaymentMethodModal = false;
  }

  savePaymentMethod(): void {
    this.isSavingPayment = true;
    this.paymentMethod.UserId = this.paymentMethod.UserId ?? 1;

    this.playerService.savePaymentMethod(this.paymentMethod).subscribe({
      next: (pm) => {
        this.isSavingPayment = false;
        if (pm?.PaymentMethodId) {
          this.paymentMethod.PaymentMethodId = pm.PaymentMethodId;
        }
        this.createRedeemRequest(pm?.PaymentMethodId);
        this.closePaymentMethodModal();
      },
      error: (err) => {
        console.error('Failed to save payment method', err);
        this.isSavingPayment = false;
        alert('Failed to save payment method. Please try again.');
      }
    });
  }

  private createRedeemRequest(paymentMethodId?: number): void {
    const redeemData: RedeemWithLoginId = {
      UserId: this.paymentMethod.UserId ?? 1,
      Amount: this.selectedAmount,
      NetAmount: +(this.selectedAmount * 0.95).toFixed(2),
      Status: 'Pending'
    };

    this.playerService.createRedeem(redeemData).subscribe({
      next: () => {
        alert(`Redeem request for $${this.selectedAmount} submitted!`);
        this.transactionNote = '';
        this.loadAllRedeems();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to create redeem request.');
      }
    });
  }

  loadAllRedeems(): void {

    this.playerService.getUserRedeems(this.currentUserId).subscribe({
      next: (res) => {
        const redeems = res.redeems.map((r: any) => ({
          Amount: r.amount,
          NetAmount: r.netAmount,
          Status: r.status,
          RequestedAt: r.requestedAt,
          ProcessedAt: r.processedAt,
          UserName: r.userName,
          ...r
        }));

        this.pendingRedeems = redeems;
        this.recentRedeems = [...redeems].sort((a, b) =>
          new Date(b.RequestedAt).getTime() - new Date(a.RequestedAt).getTime()
        ).slice(0, 5);

        this.totalRedeemsCount = res.totalTransactions;
      },
    });

  }


  showPendingScreen(): void {
    this.viewMode = 'pending';
    this.loadAllRedeems();
  }

  backToMain(): void {
    this.viewMode = 'main';
  }

  savePassword(): void {
    if (this.changePasswordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
      if (newPassword === confirmPassword) {
        alert('Password changed successfully!');
        this.changePasswordForm.reset();
      } else {
        alert('New password and confirm password do not match');
      }
    }
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

  viewRedeem(redeem: RedeemWithLoginId): void {
    alert(`View redeem request of $${redeem.Amount} by ${redeem.UserName || redeem.LoginId || 'N/A'}`);
  }

  get filteredPendingRedeems(): RedeemWithLoginId[] {
    let list = this.pendingRedeems;

    if (this.searchTerm) {
      list = list.filter(r =>
        (r.UserName || r.LoginId || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (r.Amount?.toString().includes(this.searchTerm)) ||
        (r.Status?.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    if (this.filterSelection.redeem) {
      list = list.filter(r => r.Status?.toLowerCase() === 'pending');
    }
    if (this.filterSelection.remark) {
      list = list.filter(r => !!r.Remark);
    }

    return list;
  }
  showAllTransactions(): void {
    this.viewMode = 'allTransactions';
    this.loadAllRedeems();
  }
  get paginatedRedeems(): RedeemWithLoginId[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.pendingRedeems.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.pendingRedeems.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }
}
