import { Component } from '@angular/core';
import { AgentService, RechargeRecord } from '../../services/agent-service';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-agent-recharge-records',
  standalone: false,
  templateUrl: './agent-recharge-records.html',
  // styleUrl: './agent-recharge-records.css'
  styleUrls: ['./agent-recharge-records.css']
})
export class AgentRechargeRecords {

  allRecords: RechargeRecord[] = [];

  // Search + filter state
  searchTerm: string = '';
  showExpired: boolean = false;

  // Pagination state
  currentPage = 1;
  itemsPerPage = 10;
  showExportModal = false;
  selectedMonth = '';
  currentUserId: number = 0;
  selectedStatus: string = 'All';
  searchField: string = 'account';
  showFilterModal = false;
  exportErrorMsg: string = '';
  maxMonth = '';

  tempSelectedStatus: string = 'All';
  statusOptions: string[] = [
    'All',
    'Pending Referral Link',
    'Pending Confirmation',
    'Confirmed',
    'Coins Credited',
    'Expired',
    'Failed Transaction',
    'Success'
  ];

  constructor(private agentService: AgentService, private router: Router, private auth: Auth) { }
  ngOnInit(): void {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = sessionData?.userId || localStorage.getItem('userId');
    // Example user object you pass to API
    const user = { userId: Number(this.currentUserId) };
    this.loadRechargeRecords(user);

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    this.maxMonth = `${year}-${month}`;
  }

  loadRechargeRecords(user: any): void {
    this.agentService.Rechargerecored(user.userId).subscribe({
      next: (res: RechargeRecord[]) => {
        console.log('Recharge records loaded', res);
        this.allRecords = res;
      },
      error: (err) => {
        console.error('Error loading recharge records', err);
        this.allRecords = []; // fallback
      }
    });
  }

  get filteredRecords(): RechargeRecord[] {
    let data = this.allRecords;

    // ✅ Combined Search filter
    if (this.searchTerm.trim()) {
      const lower = this.searchTerm.toLowerCase();

      data = data.filter(rec =>
        (rec.userName && rec.userName.toLowerCase().includes(lower)) ||
        (rec.recharge && rec.recharge.toString().toLowerCase().includes(lower)) ||
        (rec.remarks && rec.remarks.toLowerCase().includes(lower)) ||
        (rec.failedReason && rec.failedReason.toLowerCase().includes(lower)) ||
        (rec.createdAt &&
          new Date(rec.createdAt).toLocaleString().toLowerCase().includes(lower))
      );
    }

    // ✅ Status Filter
    if (this.selectedStatus !== 'All') {
      data = data.filter(rec => rec.status === this.selectedStatus);
    }

    // ✅ Show expired toggle
    if (!this.showExpired) {
      data = data.filter(rec => rec.status !== 'Expired');
    }

    return data;
  }


  get totalPages(): number {
    return Math.ceil(this.filteredRecords.length / this.itemsPerPage);
  }

  get paginatedRecords(): RechargeRecord[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRecords.slice(start, start + this.itemsPerPage);
  }

  get showingRange(): string {
    if (this.filteredRecords.length === 0) return '0 of 0';
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, this.filteredRecords.length);
    return `${start}-${end} of ${this.filteredRecords.length}`;
  }

  // Pagination actions
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changeItemsPerPage(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.itemsPerPage = Number(value);
    this.currentPage = 1;
  }

  // Mock actions
  refreshData() {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    const user = { userId: Number(this.currentUserId) };
    this.loadRechargeRecords(user);
  }
  exportData() {
    this.showExportModal = true;
  }
  closeExportModal() {
    this.showExportModal = false;
    this.selectedMonth = '';
  }

  doExport(type: 'pdf' | 'excel') {
    if (!this.selectedMonth) {
      this.exportErrorMsg = 'Please select a month before exporting.';
      return;
    }
    const [year, month] = this.selectedMonth.split('-').map(Number);
    const req = {
      userId: Number(this.currentUserId),
      month,
      year
    };

    if (type === 'pdf') {
      this.agentService.exportRechargePdf(req).subscribe((blob) => {
        this.downloadFile(blob, `RechargeRecords_${month}_${year}.pdf`);
      });
    } else {
      this.agentService.exportRechargeExcel(req).subscribe((blob) => {
        this.downloadFile(blob, `RechargeRecords_${month}_${year}.xlsx`);
      });
    }

    this.closeExportModal();
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  openFilterModal() {
    this.tempSelectedStatus = this.selectedStatus;
    this.showFilterModal = true;
  }

  selectStatus(status: string) {
    this.tempSelectedStatus = status;
  }

  applyFilter() {
    this.selectedStatus = this.tempSelectedStatus;
    this.showFilterModal = false;
  }

  cancelFilter() {
    this.tempSelectedStatus = this.selectedStatus;
    this.showFilterModal = false;
  }
  clearExportError() {
    this.exportErrorMsg = '';
  }

}