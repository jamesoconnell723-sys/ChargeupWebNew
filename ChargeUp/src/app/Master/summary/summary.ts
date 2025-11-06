import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from '../../services/user';
import { Master, SummaryResponse } from '../../services/master';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-summary',
  standalone: false,
  templateUrl: './summary.html',
  styleUrls: ['./summary.css']
})
export class Summary implements OnInit {
  filterForm: FormGroup;
  users: any[] = [];
  summaryData: SummaryResponse | null = null;

  currentPage = 1;
  itemsPerPage = 5;
  search = '';
  totalUsers = 0;

  currentUserId: number = 0;
  username: string = '';
  currentRole: string = '';

  constructor(
    private fb: FormBuilder,
    private user: User,
    private master: Master,
    private auth:Auth
  ) {
    // ✅ Initialize the form only
    this.filterForm = this.fb.group({
      username: [''],
      startDate: [''],
      endDate: ['']
    });

    console.log('✅ Summary component initialized');
  }

  ngOnInit(): void {
     const userId = this.auth.getRoleId();
     console.log(userId)
    const role = localStorage.getItem('roleName') || '';

    if (userId) this.currentUserId = Number(userId);
    this.currentRole = role.toLowerCase();

    if (!this.currentUserId) {
      console.error('❌ No user ID found in localStorage.');
      return;
    }

    this.loadChildUsers();
  }

  loadChildUsers() {
    console.log(`📥 Fetching child users for parentId: ${this.currentUserId}`);

    this.master.getChildUsers(this.currentUserId).subscribe({
      next: (res: any) => {
        this.users = res || [];
        console.log('✅ Loaded child users:', this.users);

        // Auto-select first user (optional)
        if (this.users.length > 0) {
          this.filterForm.patchValue({ username: this.users[0].username });
        }
      },
      error: (err) => {
        console.error('❌ Error loading child users:', err);
      }
    });
  }
  loadUsers() {
    // ✅ Use currentUserId directly instead of currentUser.userId
    if (!this.currentUserId) {
      console.error('⚠️ currentUserId is missing — cannot load users.');
      return;
    }
    
    if (this.username) {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  this.filterForm.patchValue({
    username: this.username,
    startDate: weekAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
  });

  this.applyFilter();
}

    console.log('📥 Loading users for master ID:', this.currentUserId);

    this.user.getUsersPaged(this.currentUserId).subscribe({
      next: (res: any) => {
        this.users = res.users || [];
        console.log('✅ Users loaded:', this.users);
      },
      error: (err) => {
        console.error('❌ Failed to load users:', err);
      }
    });
  }

applyFilter() {
    const { username, startDate, endDate } = this.filterForm.value;

    if (!username || !startDate || !endDate) {
      alert('Please select username and date range.');
      return;
    }

    console.log(`📊 Fetching summary for ${username} (${startDate} - ${endDate})`);

    this.master.getSummary(username, startDate, endDate).subscribe({
      next: (data: SummaryResponse) => {
        this.summaryData = data;
        console.log('✅ Summary data:', data);
      },
      error: (err) => {
        console.error('❌ Error fetching summary:', err);
      }
    });
  }
}
