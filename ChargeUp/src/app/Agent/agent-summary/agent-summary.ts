import { Component } from '@angular/core';
import { AgentService } from '../../services/agent-service';
import { Auth } from '../../services/auth';
import { AgentSummaryService } from '../../services/agent-summary-service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-agent-summary',
  standalone: false,
  templateUrl: './agent-summary.html',
  styleUrl: './agent-summary.css'
})
export class AgentSummary {

  users: any[] = [];
  selectedUser: string = '';
  startDate: string = '';
  endDate: string = '';

  summary = {
    totalUsers: 0,
    totalAgents: 0,
    totalRecharges: 0,
    totalRedeems: 0,
    pendingRecharges: 0,
    failedRedeems: 0
  };

  currentUserId: number = 0;
  constructor(private agentsummary: AgentSummaryService, private auth: Auth) { }
  ngOnInit() {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = sessionData?.userId || localStorage.getItem('userId');
    // this.currentUserId = this.auth.getRoleId();
    this.loadUsers();
    // this.loadSummary();
  }

  loadUsers() {
    this.agentsummary.getAgentUsers(this.currentUserId).subscribe({
      next: (res) => {
        console.log('Users loaded', res);
        this.users = res;
      },
      error: (err) => console.error('Error loading users', err)
    });
  }

  loadSummary() {
    this.agentsummary.getAgentSummary(this.currentUserId).subscribe({
      next: (res) => {
        this.summary = res;
      },
      error: (err) => console.error('Error loading summary', err)
    });
  }

  applyFilter() {
    if (!this.startDate || !this.endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Dates',
        text: 'Please select both start and end dates before applying the filter.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (end < start) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date Range',
        text: 'End date must be greater than or equal to start date.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const userId = this.selectedUser ? Number(this.selectedUser) : undefined;

    this.agentsummary.getAgentSummary(this.currentUserId, userId, this.startDate, this.endDate).subscribe({
      next: (res) => {
        this.summary = res;
        Swal.fire({
          icon: 'success',
          title: 'Filter Applied',
          text: 'Summary data has been updated successfully!',
          confirmButtonColor: '#3085d6',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error applying filter', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while applying the filter.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }


}