import { Component,OnInit, HostListener } from '@angular/core';
import { Master, RechargeTransaction } from '../../services/master';
import { User } from '../../services/user';
import { Excel } from '../../services/excel';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-recharge-records',
  standalone: false,
  templateUrl: './recharge-records.html',
  styleUrls: ['./recharge-records.css']
})
export class RechargeRecords implements OnInit {
  page= 1;
  totalUsers = 0;
   pageSize = 5;
  search = '';
  rechargeRecords: RechargeTransaction[] = [];
  showFilter = false;
 loading: boolean = false;
  filter = { searchBy: '', status: 'All' };

  statusList = [
    'All',
    'Pending Referral Link',
    'Pending Confirmation',
    'Confirmed',
    'Coins Credited',
    'Expired',
    'Failed Transaction',
     'Success'
  ];

    currentPage = 1;
    showFilterModal : boolean= false;
    statusSearch: string = '';          
    tempSelectedStatus: string = 'All'; 
    appliedStatus: string = 'All';  

       itemsPerPage = 5;
     Math = Math; // to use Math in template
  openDropdownId: number | null = null;
     sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Export modal
  showExportModal = false;
  selectedMonth: string = '';
  //   @Input() showExportModal = false;   // control modal visibility
  // @Output() close = new EventEmitter<void>();

  // selectedMonth: string = '';


  constructor(private rechargeService: Master, private excelRead: Excel, private user: User) {}

  ngOnInit(): void {
    this.loadRechargeRecords();
  }

  
  loadRechargeRecords() {
    this.rechargeService.getRechargeRecords().subscribe({
      next: (res) => {
        this.rechargeRecords = res;
        this.totalUsers = this.rechargeRecords.length; 
        this.loading = false;
        console.log('Recharge Records:', this.rechargeRecords);
      },
      error: (err) => {
        console.error('Error loading recharge records:', err);
        this.loading = false;
      }
    });
  }


  refresh() {
    this.loadRechargeRecords();
  }
  onSearch() {
    this.page = 1;
    this.showFilter = true;
    this.loadRechargeRecords();
  }

  // Cancel
  closeFilter() {
    this.showFilter = false;
  }
  // ------ Filter modal actions ------

  closeExportModal() {
    this.showExportModal = false;
  }

 
  openFilterModal() {
    // initialize temporary selection with the currently applied one:
    this.tempSelectedStatus = this.appliedStatus || 'All';
    this.statusSearch = '';
    this.showFilterModal = true;
  }

  cancelFilter() {
    // discard changes
    this.tempSelectedStatus = this.appliedStatus || 'All';
    this.showFilterModal = false;
  }

  applyFilter() {
    this.loadRechargeRecords();
    this.showFilter = false;
    this.appliedStatus = this.tempSelectedStatus || 'All';
    this.currentPage = 1;
    this.showFilterModal = false;
  }
  
  get filteredRecords() {
  const q = (this.search || '').toString().trim().toLowerCase();

  return this.rechargeRecords.filter(record => {
    const userIdStr = record.userId?.toString() || '';
    const usernameStr = record.username?.toString().toLowerCase() || '';
    const rechargeStr = record.recharge?.toString() || '';
    const statusStr = record.status?.toString().toLowerCase() || '';
    const failedReasonStr = record.failedReason?.toString().toLowerCase() || '';
    const remarksStr = record.remarks?.toString().toLowerCase() || '';
    const createdByNameStr = record.createdByName?.toString().toLowerCase() || ''; // ✅ Added

    const matchesSearch =
      !q ||
      userIdStr.includes(q) ||
      usernameStr.includes(q) ||
      rechargeStr.includes(q) ||
      statusStr.includes(q) ||
      failedReasonStr.includes(q) ||
      remarksStr.includes(q) ||
      createdByNameStr.includes(q); // ✅ Added this line

    const matchesStatus =
      !this.appliedStatus || this.appliedStatus === 'All'
        ? true
        : record.status === this.appliedStatus;

    return matchesSearch && matchesStatus;
  });
}


   selectTempStatus(status: string) {
    this.tempSelectedStatus = status;
  }


  openExportModal() {
  this.showExportModal = true;
}


  private parseYearMonth() {
    if (!this.selectedMonth) return null;
    const [year, month] = this.selectedMonth.split('-').map(Number);
    return { year, month };
  }

 

  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportPdf() {
    const ym = this.parseYearMonth();
    if (!ym) {
      alert('Please select a month!');
      return;
    }

    this.excelRead.exportPdf(ym.year, ym.month).subscribe(blob => {
      this.downloadFile(blob, `RechargeTransactions_${ym.year}_${ym.month}.pdf`);
      this.closeExportModal();
    });
  }

  exportExcel() {
    const ym = this.parseYearMonth();
    if (!ym) {
      alert('Please select a month!');
      return;
    }

    this.excelRead.exportExcel(ym.year, ym.month).subscribe(blob => {
      this.downloadFile(blob, `RechargeTransactions_${ym.year}_${ym.month}.xlsx`);
      this.closeExportModal();
    });
  }

  private getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }

    changePage(newPage: number) {
  if (newPage < 1 || newPage > this.totalPages) return;
  this.currentPage = newPage;
}


  changeItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = +target.value;
    this.currentPage = 1;
    }

  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.itemsPerPage) || 1;
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get showingRange(): string {
  if (this.totalUsers === 0) return '0 of 0';

  const start = (this.currentPage - 1) * this.itemsPerPage + 1;
  const end = Math.min(this.currentPage * this.itemsPerPage, this.totalUsers);

  return `${start}-${end} of ${this.totalUsers}`;
}

sortData(column: string) {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }

  const dir = this.sortDirection === 'asc' ? 1 : -1;

  this.rechargeRecords.sort((a: any, b: any) => {
    let aValue: any = a[column];
    let bValue: any = b[column];

    if (column === 'createdAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (aValue > bValue) return 1 * dir;
    if (aValue < bValue) return -1 * dir;
    return 0;
  });
}



  toggleDropdown(userId: number, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.openDropdownId = (this.openDropdownId === userId ? null : userId);
  }

  @HostListener('document:click')
  closeDropdown() {
    this.openDropdownId = null;
  }
  
get paginatedRecords() {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;

  const filtered = this.filteredRecords;

  this.totalUsers = filtered.length; // ✅ keep this here
  return filtered.slice(startIndex, endIndex);
}


}
