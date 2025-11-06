import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { AgentService, Player } from '../../services/agent-service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

interface User {
  name: string;
  email: string;
  date?: string;
}

@Component({
  selector: 'app-agent-user-management',
  standalone: false,
  templateUrl: './agent-user-management.html',
  styleUrl: './agent-user-management.css'
})
export class AgentUserManagement {

  allUsers: Player[] = [];
  searchTerm: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  showModal = false;
  referralLink = '';
  showRedeemModal = false;
  redeemServiceFee = 0.05;
  redeemAmount: number | null = null;
  totalRedeemAmount: number | null = 0;
  selectedUser: Player | null = null;
  openDropdownIndex: number | null = null;
  showAddUserModal = false;
  AllowUserCreation: boolean = false;
  currentUserId: number = 0;
  passwordVisible = false;
  confirmPasswordVisible = false;
  showRechargePermissionModal = false;
  rechargeOptions: number[] = [10, 15, 20, 30, 40, 50, 75, 100, 250, 500, 1000];
  selectedAmounts: number[] = [];
  deleteError: string = '';
  isDeleteConfirmed: boolean = false;

  newUser = {
    userName: '',
    name: '',
    phoneNumber: '',
    email: '',
    userType: '',
    parentId: '',
    password: '',
    confirmPassword: ''
  };
  showEditUserModal = false;
  editingUser: any = {};
  showDeleteUserModal = false;
  deletingUser: Player | null = null;
  deleteConfirmationText: string = '';
  agentBalance: number = 0;
  redeemServiceFeePercent: number = 0;


  constructor(private agentService: AgentService, private auth: Auth) { }

  ngOnInit() {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = sessionData?.userId || localStorage.getItem('userId');
    console.log(this.currentUserId)

    if (this.currentUserId) {
      // ✅ Call the new API once
      this.agentService.getAgentAccessInfo(this.currentUserId).subscribe({
        next: (res) => {
          this.AllowUserCreation = res.allowUserCreation;
          this.referralLink = res.refLink ? `${environment.apiUrl}/signup/${res.refLink}` : '';
          console.log('Access Info:', res);
        },
        error: (err) => {
          console.error('Failed to fetch access info', err);
        }
      });
    }
    if (this.currentUserId) {
      this.agentService.getPlayerList(this.currentUserId).subscribe({
        next: (res) => {
          this.allUsers = res;
          console.log('Players:', res);
        },
        error: (err) => {
          console.error('Failed to fetch players', err);
        }
      });
    }
  }
  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  get filteredUsers(): Player[] {
    let users = this.allUsers;

    if (this.searchTerm.trim()) {
      const lower = this.searchTerm.toLowerCase();
      users = users.filter(
        u => u.name.toLowerCase().includes(lower) || (u.email ?? '').toLowerCase().includes(lower)
      );
    }

    if (this.sortColumn) {
      users = [...users].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (this.sortColumn === 'createdAt') {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        } else {
          aValue = (a[this.sortColumn as keyof Player] as string).toLowerCase();
          bValue = (b[this.sortColumn as keyof Player] as string).toLowerCase();
        }

        let comparison = 0;
        if (aValue > bValue) {
          comparison = 1;
        } else if (aValue < bValue) {
          comparison = -1;
        }

        return this.sortDirection === 'desc' ? comparison * -1 : comparison;
      });
    }

    return users;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get paginatedUsers(): Player[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  get showingRange(): string {
    if (this.filteredUsers.length === 0) return '0 of 0';
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, this.filteredUsers.length);
    return `${start}-${end} of ${this.filteredUsers.length}`;
  }
  get hasRecords(): boolean {
    return this.filteredUsers.length > 0;
  }

  openReferralModal() {
    if (!this.referralLink) {
      Swal.fire({
        icon: 'warning',
        title: 'No Referral Link Found',
        text: 'Referral link is not available for this account.',
      });
      return;
    }

    navigator.clipboard.writeText(this.referralLink).then(() => {
      Swal.fire({
        icon: undefined,
        title: '',
        text: `Referral Link Copied to clipboard:\n${this.referralLink}`,
      });
    }).catch(err => {
      console.error('Failed to copy referral link', err);
      Swal.fire({
        icon: 'error',
        title: 'Copy Failed',
        text: 'Unable to copy referral link.',
      });
    });
  }


  closeReferralModal() {
    this.showModal = false;
  }

  copyReferralLink() {
    navigator.clipboard.writeText(this.referralLink).then(() => {
      alert('Referral link copied to clipboard! ✅');
    });
  }

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

  onSearchChange() {
    this.currentPage = 1;
  }

  toggleDropdown(index: number) {
    this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
  }

  redeem(user: Player) {
    this.selectedUser = user;
    this.openDropdownIndex = null;

    const agentId = this.currentUserId;

    forkJoin({
      balanceRes: this.agentService.getAgentBalance(this.currentUserId),
      feeRes: this.agentService.getActiveServiceFee()
    }).subscribe({
      next: ({ balanceRes, feeRes }) => {
        if (!balanceRes || !feeRes) {
          Swal.fire({
            icon: 'warning',
            title: 'Incomplete Data',
            text: 'Could not load balance or service fee information.',
          });
          return;
        }

        this.agentBalance = balanceRes.balance ?? 0;
        this.redeemServiceFeePercent = feeRes.serviceFeePercent ?? 0;
        this.showRedeemModal = true;
      },
      error: (err) => {
        console.error('❌ Failed to load redeem info:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Redeem Info',
          text: 'Unable to fetch agent balance or service fee. Please try again.',
        });
      }
    });
  }



  closeRedeemModal() {
    this.showRedeemModal = false;
    this.redeemAmount = null;
    this.totalRedeemAmount = 0;
    this.selectedUser = null;
  }

  calculateTotal() {
    if (!this.redeemAmount) {
      this.totalRedeemAmount = 0;
      return;
    }

    if (this.redeemAmount > this.agentBalance) {
      Swal.fire({
        icon: undefined,
        title: 'Insufficient Balance',
        text: `Entered amount (${this.redeemAmount}) exceeds your balance (${this.agentBalance}).`,
      });
      this.redeemAmount = null;
      this.totalRedeemAmount = 0;
      return;
    }

    const feePercent = this.redeemServiceFeePercent / 100;
    const fee = this.redeemAmount * feePercent;
    const total = this.redeemAmount - fee;
    this.totalRedeemAmount = Math.floor(total);
  }


  confirmRedeem() {
    if (!this.selectedUser || !this.redeemAmount) {
      Swal.fire({
        // icon: 'warning',
        title: 'Missing Info',
        text: 'Please enter a redeem amount first.',
      });
      return;
    }

    const serviceFee = (this.redeemAmount * this.redeemServiceFeePercent) / 100;
    const netAmount = this.totalRedeemAmount ?? (this.redeemAmount - serviceFee);

    Swal.fire({
      title: 'Confirm Redeem Details',
      html: `
      <p><b>Redeem Amount:</b> $${this.redeemAmount}</p>
      <p><b>Service Fee (${this.redeemServiceFeePercent}%):</b> $${serviceFee.toFixed(2)}</p>
      <p><b>Net Payable to Player:</b> $${netAmount.toFixed(2)}</p>
    `,
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: 'Confirm Redeem',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        const agentId = this.currentUserId;
        const playerId = this.selectedUser!.userId;

        const payload = {
          agentId,
          playerId,
          amount: this.redeemAmount ?? 0,
          serviceFee,
          netAmount,
        };

        this.agentService.redeemAmount(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Redeem Completed',
              text: `Redeemed $${this.redeemAmount} successfully.`,
            });
            this.closeRedeemModal();
            this.ngOnInit();
          },
          error: (err) => {
            Swal.fire({
              icon: undefined,
              title: 'Error',
              text: 'Failed to process redeem. Please try again.',
            });
          }
        });
      }
    });
  }


  openAddUserModal() {
    this.showAddUserModal = true;
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.newUser = { userName: '', name: '', phoneNumber: '', email: '', userType: '', parentId: '', password: '', confirmPassword: '' };
  }
  // createUser() {
  //   const payload = {
  //     username: this.newUser.userName,
  //     name: this.newUser.name,
  //     phoneNumber: this.newUser.phoneNumber,
  //     email: this.newUser.email,
  //     roleName: 'Player',
  //     parentType: Number(this.currentUserId),
  //     Password: this.newUser.password
  //   };

  //   this.agentService.createUser(payload).subscribe({
  //     next: (res) => {
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'User Created',
  //         text: 'User created successfully!',
  //       });
  //       this.closeAddUserModal();
  //       this.ngOnInit();
  //     },
  //     error: (err) => {
  //       console.error('Failed to create user', err);
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error',
  //         text: 'Failed to create user',
  //       });
  //     }
  //   });
  // }
  createUser() {
    const payload = {
      username: this.newUser.userName,
      name: this.newUser.name,
      phoneNumber: this.newUser.phoneNumber,
      email: this.newUser.email,
      roleName: 'Player',
      parentId: Number(this.currentUserId),
      Password: this.newUser.password
    };

    this.agentService.createUser(payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'User Created',
          text: 'User created successfully!',
        });
        this.closeAddUserModal();
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Failed to create user', err);

        if (err.status === 409) {
          Swal.fire({
            icon: undefined,
            title: 'Duplicate Email',
            text: err.error?.message || 'This email already exists. Please use another.',
          });
        } else if (err.status === 400) {
          Swal.fire({
            icon: undefined,
            title: 'Invalid Data',
            text: err.error || 'Please check your input data.',
          });
        } else {
          Swal.fire({
            icon: undefined,
            title: 'Error',
            text: 'Failed to create user. Please try again later.',
          });
        }
      }
    });
  }


  delete(user: Player) {
    this.deletingUser = user;
    this.showDeleteUserModal = true;
    this.openDropdownIndex = null;
  }

  closeDeleteUserModal() {
    this.showDeleteUserModal = false;
    this.deletingUser = null;
    this.deleteConfirmationText = '';
  }

  confirmDeleteUser() {
    if (this.deletingUser && this.isDeleteConfirmed) {
      const agentId = Number(this.currentUserId);
      this.agentService.deleteUser(this.deletingUser.userId, agentId).subscribe({
        next: () => {
          this.allUsers = this.allUsers.filter(u => u.userId !== this.deletingUser?.userId);
          this.closeDeleteUserModal();
          Swal.fire({
            icon: undefined,
            title: 'Deleted',
            text: 'User has been deleted.',
            // timer: 3000,
            // showConfirmButton: false
          });
        },
        error: (err) => {
          this.closeDeleteUserModal();
          Swal.fire({
            icon: undefined,
            title: ' ',
            text: 'Failed to delete user. Please try again.',
          });
        }
      });
    }
  }

  edit(user: any) {
    this.editingUser = { ...user };
    this.showEditUserModal = true;
    this.openDropdownIndex = null;
  }
  closeEditUserModal() {
    this.showEditUserModal = false;
    this.editingUser = {};
  }

  confirmUpdateUser() {
    const displayName = this.editingUser.username || this.editingUser.name || 'this user';
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to update this user ${displayName}?`,
      icon: undefined,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateUser();
      }
    });
  }

  private updateUser() {
    this.agentService.updateUser(this.editingUser).subscribe({
      next: (res) => {
        console.log('User update successful:', res);
        this.closeEditUserModal();
        this.ngOnInit();
        Swal.fire(
          'Updated!',
          'The user has been successfully updated.',
          undefined
        );
      },
      error: (err) => {
        console.error('Failed to update user', err);
        Swal.fire(
          'Error',
          'Failed to update user. Please try again.',
          'error'
        );
      }
    });
  }
  openRechargePermissionModal(user: Player) {
    this.selectedUser = user;
    this.showRechargePermissionModal = true;
    this.selectedAmounts = []; // reset

    this.agentService.getAmountPermissions(user.userId).subscribe({
      next: (amounts) => {
        this.selectedAmounts = amounts || [];
      },
      error: (err) => {
        console.error('Failed to load permissions', err);
        this.selectedAmounts = [];
      }
    });
  }

  toggleAmount(amount: number, event: any) {
    if (event.target.checked) {
      this.selectedAmounts.push(amount);
    } else {
      this.selectedAmounts = this.selectedAmounts.filter(a => a !== amount);
    }
  }

  closeRechargePermissionModal() {
    this.showRechargePermissionModal = false;
    this.selectedUser = null;
    this.selectedAmounts = [];
  }

  saveRechargePermissions() {
    if (!this.selectedUser) return;

    const payload = this.selectedAmounts.map(amount => ({
      userId: this.selectedUser!.userId,
      allowPermission: true,
      amount,
      createdBy: this.currentUserId
    }));

    this.agentService.saveAmountPermissions(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: undefined,
          title: 'Permissions Updated',
          text: 'Recharge options saved successfully'
        });
        this.closeRechargePermissionModal();
      },
      error: (err) => {
        console.error('Failed to save permissions', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update recharge permissions ❌'
        });
      }
    });
  }
  validateDeleteText() {
    if (this.deleteConfirmationText.trim() === '') {
      this.deleteError = '';
      this.isDeleteConfirmed = false;
    } else if (this.deleteConfirmationText !== 'DELETE') {
      this.deleteError = 'You must type DELETE in all capital letters to confirm.';
      this.isDeleteConfirmed = false;
    } else {
      this.deleteError = '';
      this.isDeleteConfirmed = true;
    }
  }
}
