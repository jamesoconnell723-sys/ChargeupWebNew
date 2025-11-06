import { Component, OnInit } from '@angular/core';
import { AgentService } from '../../services/agent-service';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';


interface RedeemRecord {
  redeemId: number;
  account: string;
  amount: number;
  serviceFee: number;
  netAmount: number;
  status: string;
  requestedAt: string;
}

@Component({
  selector: 'app-agent-redeem-records',
  standalone: false,
  templateUrl: './agent-redeem-records.html',
  styleUrls: ['./agent-redeem-records.css']
})
export class AgentRedeemRecords implements OnInit {

  searchTerm = '';
  allRecords: RedeemRecord[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  currentUserId: number = 0;
  showFilterModal = false;
  selectedStatus: string = 'All';
  tempSelectedStatus: string = 'All';
  selectedMonth = '';
  showExportModal = false;
  exportErrorMsg: string = '';
  maxMonth = '';

  filterOptions = [
    'All',
    'Pending Referral Link',
    'Pending Confirmation',
    'Confirmed',
    'Coins Credited',
    'Expired',
    'Failed Transaction',
    'Success'
  ];

  constructor(private agentService: AgentService, private auth: Auth) { }

  ngOnInit(): void {
    this.loadRedeemRecords();

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    this.maxMonth = `${year}-${month}`;
  }

  loadRedeemRecords() {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = sessionData?.userId || localStorage.getItem('userId');
    this.agentService.getRedeemRecords(this.currentUserId).subscribe({
      next: (records) => {
        this.allRecords = records;
        console.log('Redeem records loaded', records);
      },
      error: (err) => {
        console.error('Error loading redeem records', err);
      }
    });
  }
  openFilterModal() {
    this.tempSelectedStatus = this.selectedStatus; // 👈 copy current value
    this.showFilterModal = true;
  }

  closeFilterModal() {
    this.showFilterModal = false;
  }

  applyFilter() {
    this.selectedStatus = this.tempSelectedStatus; // 👈 apply only now
    this.showFilterModal = false;
    this.currentPage = 1;
  }

  // Approve/Reject actions
  approve(record: RedeemRecord) {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = sessionData?.userId || localStorage.getItem('userId');
    const agentId = this.currentUserId;
    this.agentService.getAgentBalance(agentId).subscribe({
      next: (res) => {
        const balance = res.balance || 0;

        if (balance < record.netAmount) {
          Swal.fire({
            title: 'Insufficient Balance',
            text: 'Your balance is too low to approve this redeem request.',
            showConfirmButton: true,
            confirmButtonText: 'OK',
            icon: undefined,
            showClass: { popup: '' },
            hideClass: { popup: '' }
          });

          return;
        }
        Swal.fire({
          title: '<h3 style="margin-bottom:12px; text-align:left;">Confirm Redeem Approval</h3>',
          html: `
                  <div style="
                    font-size:15px;
                    width:100%;
                    padding:5px 10px;
                    display:flex;
                    flex-direction:column;
                    gap:10px;
                  ">
                    <div style="display:flex; width:100%;">
                      <div style="width:70%; text-align:left;">User:</div>
                      <div style="width:30%; text-align:left;"><strong>${record.account}</strong></div>
                    </div>
                    <div style="display:flex; width:100%;">
                      <div style="width:70%; text-align:left;">Redeem Amount:</div>
                      <div style="width:30%; text-align:left;"><strong>${record.amount.toFixed(2)}</strong></div>
                    </div>
                    <div style="display:flex; width:100%;">
                      <div style="width:70%; text-align:left;">Net Amount:</div>
                      <div style="width:30%; text-align:left;"><strong>₹${record.netAmount.toFixed(2)}</strong></div>
                    </div>
                    <div style="display:flex; width:100%;">
                      <div style="width:70%; text-align:left;">Your Current Balance:</div>
                      <div style="width:30%; text-align:left;"><strong>₹${balance.toFixed(2)}</strong></div>
                    </div>
                  </div>
                `,
          icon: undefined,
          showCancelButton: true,
          confirmButtonText: 'Approve',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#6C63FF',
          cancelButtonColor: '#6c757d',
          width: 420
        }).then(result => {
          if (result.isConfirmed) {
            const payload = {
              redeemId: record.redeemId,
              agentId: agentId,
              netAmount: record.netAmount
            };

            this.agentService.confirmRedeemApproval(payload).subscribe({
              next: (res: any) => {
                Swal.fire({
                  title: '<h3 style="margin:0;">Success</h3>',
                  html: '<p style="margin-top:8px;">Redeem approved successfully.</p>',
                  icon: undefined,
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#6C63FF',
                  width: 380,
                  showClass: { popup: '' },
                  hideClass: { popup: '' }
                });
                record.status = 'Success';
                this.loadRedeemRecords();
              },
              error: (err) => {
                console.error('Approval failed', err);
                Swal.fire('Error ', 'Failed to approve redeem request.', 'error');
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch balance', err);
        Swal.fire('Error', 'Failed to check agent balance.', 'error');
      }
    });
  }


  reject(record: RedeemRecord) {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = sessionData?.userId || localStorage.getItem('userId');
    const agentId = this.currentUserId

    this.agentService.getAgentBalance(agentId).subscribe({
      next: (res) => {
        const balance = res.balance || 0;

        Swal.fire({
          title: '<h3 style="margin-bottom:12px; text-align:left;">Confirm Redeem Rejection</h3>',
          html: `
          <div style="
            font-size:15px;
            width:100%;
            padding:5px 10px;
            display:flex;
            flex-direction:column;
            gap:10px;
          ">
            <div style="display:flex; width:100%;">
              <div style="width:70%; text-align:left;">User:</div>
              <div style="width:30%; text-align:left;"><strong>${record.account}</strong></div>
            </div>
            <div style="display:flex; width:100%;">
              <div style="width:70%; text-align:left;">Redeem Amount:</div>
              <div style="width:30%; text-align:left;"><strong>₹${record.amount.toFixed(2)}</strong></div>
            </div>
            <div style="display:flex; width:100%;">
              <div style="width:70%; text-align:left;">Net Amount:</div>
              <div style="width:30%; text-align:left;"><strong>₹${record.netAmount.toFixed(2)}</strong></div>
            </div>
          </div>
        `,
          icon: undefined,
          showCancelButton: true,
          confirmButtonText: 'Reject',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6c757d',
          width: 420,
          preConfirm: () => {
            const remarkInput = (document.getElementById('remark') as HTMLInputElement);
            return remarkInput ? remarkInput.value.trim() : '';
          }
        }).then(result => {
          if (result.isConfirmed) {
            const payload = {
              redeemId: record.redeemId,
              agentId: agentId,
              remark: result.value || ''
            };

            this.agentService.confirmRedeemRejection(payload).subscribe({
              next: () => {
                Swal.fire({
                  title: '<h3 style="margin:0;">Rejected</h3>',
                  html: '<p style="margin-top:8px;">Redeem request has been rejected successfully.</p>',
                  icon: undefined,
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#6C63FF',
                  width: 380,
                  showClass: { popup: '' },
                  hideClass: { popup: '' }
                });
                record.status = 'Rejected';
                this.loadRedeemRecords();
              },
              error: (err) => {
                console.error('Reject failed', err);
                Swal.fire('Error', 'Failed to reject redeem request.', 'error');
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch balance', err);
        Swal.fire('Error', 'Failed to check agent balance.', 'error');
      }
    });
  }



  // 🔎 Filter records
  get filteredRecords(): RedeemRecord[] {
    const term = this.searchTerm.toLowerCase();
    return this.allRecords.filter(record => {
      const matchesSearch =
        record.account.toLowerCase().includes(term) ||
        record.amount.toString().includes(term) ||
        record.requestedAt.toLowerCase().includes(term);

      const matchesStatus =
        this.selectedStatus === 'All' || record.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  // 📑 Paginated slice
  get paginatedRecords(): RedeemRecord[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRecords.slice(start, start + this.itemsPerPage);
  }

  get showingRange(): string {
    if (this.filteredRecords.length === 0) {
      return '0 of 0';
    }
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, this.filteredRecords.length);
    return `${start}-${end} of ${this.filteredRecords.length}`;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRecords.length / this.itemsPerPage) || 1;
  }

  changeItemsPerPage(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.itemsPerPage = Number(value);
    this.currentPage = 1;
  }

  refresh() {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    this.loadRedeemRecords();
  }

  export() {
    this.showExportModal = true;
  }

  doExport(type: 'pdf' | 'excel') {
    if (!this.selectedMonth) {
      this.exportErrorMsg = 'Please select a month before exporting.';
      return;
    }
    const [year, month] = this.selectedMonth.split('-').map(Number);
    const req = { userId: Number(this.currentUserId), month, year };

    if (type === 'pdf') {
      this.agentService.exportRedeemPdf(req).subscribe(blob => this.downloadFile(blob, `RedeemRecords_${month}_${year}.pdf`));
    } else {
      this.agentService.exportRedeemExcel(req).subscribe(blob => this.downloadFile(blob, `RedeemRecords_${month}_${year}.xlsx`));
    }

    this.showExportModal = false;
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  clearExportError() {
    this.exportErrorMsg = '';
  }
  closeExportModal() {
    this.showExportModal = false;
    this.selectedMonth = '';
  }

}
