import { Component, OnInit } from '@angular/core';
import { Master } from '../../services/master';
import { RedeemRecord } from '../../services/master';
import { Excel } from '../../services/excel';
import 'jspdf-autotable';
import { User } from '../../services/user';

@Component({
  selector: 'app-redeem-records',
  standalone: false,
  templateUrl: './redeem-records.html',
  styleUrls: ['./redeem-records.css']
})
export class RedeemRecords implements OnInit {
 records: RedeemRecord[] = [];
  searchText: string = '';
  showExpired: boolean = false;
  loading: boolean = false;
  showExportModal = false;
  selectedMonth: string = '';
  search = '';
  page = 1;
  pageSize = 10;
  users: any[] = [];
  totalUsers = 0
  redeems: RedeemRecord[] = []; 
  
  showFilterModal = false;
  statusOptions: string[] = [
    'All',
    'Pending Approval',
    'Rejected',
    'Redeem Successfully',
    'Expired',
    'Failed Transaction'
  ];
  statusSearch: string = '';          
  tempSelectedStatus: string = 'All'; 
  appliedStatus: string = 'All';  
     
   currentPage = 1;
    itemsPerPage = 5;
    currentUser:any;

  constructor(private redeemService: Master, private excelRead: Excel, private user : User) { }

  ngOnInit(): void {
    this.loadRecords();
  }

 

   loadRecords() {
    this.loading = true;
    this.redeemService.getRedeemRecords().subscribe({
      next: (data) => {
        this.records = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching records', err);
        this.loading = false;
      }
    });
  }



 onSearch() {
    this.page = 1;
    this.loadRecords();
    this.loadUsers();
  }
loadUsers() {
    this.user.getUsersPaged(this.currentUser.userId).subscribe({
      next: res => {
        this.users = res.users;
      },
      error: err => {
        console.error('Failed to load users:', err);
      }
    });

  }

  onExport() {
    // Export logic (CSV/Excel)
    console.log('Exporting records...');
  }
  refresh() {
    this.loadRecords();
  }

openExportModal() {
  this.showExportModal = true;
}

closeExportModal() {
  this.showExportModal = false;
}

 exportPdf() {
    if (!this.records || this.records.length === 0) {
      alert('No data to export');
      return;
    }
    this.loading = true;
    this.excelRead.downloadPdf(this.records).subscribe({
      next: (blob) => {
        this.downloadFile(blob, `RedeemReport_${this.getTimestamp()}.pdf`);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to download PDF');
        this.loading = false;
      }
    });
  }

  exportExcel() {
    if (!this.records || this.records.length === 0) {
      alert('No data to export');
      return;
    }
    this.loading = true;
    this.excelRead.downloadExcel(this.records).subscribe({
      next: (blob) => {
        this.downloadFile(blob, `RedeemReport_${this.getTimestamp()}.xlsx`);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to download Excel');
        this.loading = false;
      }
    });
  }

  private downloadFile(data: Blob, filename: string) {
    const blob = new Blob([data], { type: data.type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  private getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }

 


  // ------ Filter modal actions ------
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
    // apply temporary selection to listing
    this.appliedStatus = this.tempSelectedStatus || 'All';
    this.page = 1;
    this.showFilterModal = false;
  }


     // inside RedeemRecords component class
get filteredRecords(): RedeemRecord[] {
  const q = (this.search || '').toString().trim().toLowerCase();

  const filtered = this.records.filter(r => {
    const matchesSearch =
      !q ||
      r.userId?.toString().toLowerCase().includes(q) ||
      r.processedBy?.toString().toLowerCase().includes(q) ||
      r.status?.toString().toLowerCase().includes(q);

    const matchesStatus = !this.appliedStatus || this.appliedStatus === 'All'
      ? true
      : r.status === this.appliedStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination slice
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;

  return filtered.slice(startIndex, endIndex);
}

   selectTempStatus(status: string) {
    this.tempSelectedStatus = status;
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
  const filteredCount = this.records.filter(r => {
    const matchesSearch =
      !this.search ||
      r.userId?.toString().toLowerCase().includes(this.search.toLowerCase()) ||
      r.processedBy?.toString().toLowerCase().includes(this.search.toLowerCase()) ||
      r.status?.toString().toLowerCase().includes(this.search.toLowerCase());

    const matchesStatus = !this.appliedStatus || this.appliedStatus === 'All'
      ? true
      : r.status === this.appliedStatus;

    return matchesSearch && matchesStatus;
  }).length;

  return Math.ceil(filteredCount / this.itemsPerPage) || 1;
}

  get showingRange(): string {
  const filteredCount = this.records.filter(r => {
    const matchesSearch =
      !this.search ||
      r.userId?.toString().toLowerCase().includes(this.search.toLowerCase()) ||
      r.processedBy?.toString().toLowerCase().includes(this.search.toLowerCase()) ||
      r.status?.toString().toLowerCase().includes(this.search.toLowerCase());

    const matchesStatus = !this.appliedStatus || this.appliedStatus === 'All'
      ? true
      : r.status === this.appliedStatus;

    return matchesSearch && matchesStatus;
  }).length;

  if (filteredCount === 0) return '0 of 0';

  const start = (this.currentPage - 1) * this.itemsPerPage + 1;
  const end = Math.min(this.currentPage * this.itemsPerPage, filteredCount);

  return `${start}-${end} of ${filteredCount}`;
}

}
