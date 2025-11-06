import { Component, HostListener, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../services/user';
import { CommonModule } from '@angular/common';
import { AddUser } from '../add-user/add-user';
import { Master } from '../../../services/master';
import { Auth } from '../../../services/auth';
import Swal from 'sweetalert2';
declare var bootstrap: any;

@Component({
  selector: 'app-userlisting',
  standalone: false,
  templateUrl: './userlisting.html',
  styleUrl: './userlisting.css'
})
export class Userlisting {
  users: any[] = [];
  totalUsers = 0;
  currentUser: any;

  currentPage = 1;
  itemsPerPage = 5;
  search = '';

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  showAddUserModal = false;

  //edit user
  editForm!: FormGroup;
  showEditModal = false;
  showPassword = false;
  selectedUser: any[] = [];
  private editModalInstance: any;
  @ViewChild('editUserModal') editUserModalRef!: ElementRef;

  showRedeemModal = false;
  redeemForm!: FormGroup;
  totalAmount = 0;


  showRechargeLimitModal = false;
  rechargeLimitForm!: FormGroup;
  selectedAgent: any;

  showPasswordPermissionModal = false;
  passwordPermissionForm!: FormGroup;
  selectedAgentForPermission: any;

  showCreationPermissionModal = false;
  selectedAgentForCreation: any;

  showDeleteModal = false;
  deleteForm!: FormGroup;
  selectedUserToDelete: any;


  constructor(private fb: FormBuilder, private userService: User, private auth: Auth) { }

  ngOnInit(): void {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');

  // ✅ Step 2: Fallback to loginEmail if session is missing
  const email = sessionData?.email || localStorage.getItem('loginEmail');

  if (email) {
    console.log('🔍 Logged-in Email:', email);

    this.userService.getUserByEmail(email).subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('✅ Current Logged-in User:', this.currentUser);

        // ✅ Step 3: Load users created by this user
        this.loadUsersByParent(user.userId);
      },
      error: (err) => {
        console.warn('⚠️ Could not load user by email:', err);
        this.currentUser = null;
      }
    });
  } else {
    console.warn('⚠️ No email found in localStorage — redirecting to login');
    // optional: this.router.navigate(['/login']);
  }

  // ✅ Initialize forms
  this.initForms();
}
   initForms(){
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''] // optional
    });
    this.redeemForm = this.fb.group({
      account: [''],
      amount: [0],
      remark: [''],
      redeemRemark: ['']
    });

    this.rechargeLimitForm = this.fb.group({
      enableLimit: [false],
      monthlyLimit: [{ value: '', disabled: true }],
      dailyLimit: [{ value: '', disabled: true }]
    });

    // Watch toggle to enable/disable fields
    this.rechargeLimitForm.get('enableLimit')?.valueChanges.subscribe((enabled) => {
      if (enabled) {
        this.rechargeLimitForm.get('monthlyLimit')?.enable();
        this.rechargeLimitForm.get('dailyLimit')?.enable();
      } else {
        this.rechargeLimitForm.get('monthlyLimit')?.disable();
        this.rechargeLimitForm.get('dailyLimit')?.disable();
      }
    });

    // ✅ Initialize Password Permission form
    this.passwordPermissionForm = this.fb.group({
      enablePermission: [false],
      allowReset: [false]
    });

    // When disabling main permission, also disable the allowReset option
    this.passwordPermissionForm.get('enablePermission')?.valueChanges.subscribe((enabled) => {
      if (!enabled) {
        this.passwordPermissionForm.patchValue({ allowReset: false });
      }
    });

    this.deleteForm = this.fb.group({
      name: [''],
      email: [''],
      confirmText: ['']
    });
    
  }

  loadUsers() {
    if (!this.currentUser?.userId) {
      console.warn("⚠️ currentUser not yet loaded, delaying loadUsers()");
      return;
    }

    this.userService
      .getUsersPaged(this.currentUser.userId, this.currentPage, this.itemsPerPage, this.search)
      .subscribe({
        next: (res) => {
          this.users = res.users || [];
          this.totalUsers = res.total || 0;
          console.log("✅ Loaded users:", this.users);
        },
        error: (err) => {
          console.error("❌ Failed to load users:", err);
        },
      });
  }


loadUsersByParent(parentId: number) {
  if (!parentId) {
    console.warn("⚠️ Parent userId missing, cannot load users.");
    return;
  }

  this.userService
    .getUsersPaged(parentId, this.currentPage, this.itemsPerPage, this.search)
    .subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.totalUsers = res.total || 0;
        console.log("✅ Loaded users for parentId:", parentId, this.users);
      },
      error: (err) => {
        console.error("❌ Failed to load users:", err);
      }
    });
}


  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  changePage(newPage: number) {
    this.currentPage = newPage;
    this.loadUsers();
  }

  changeItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = +target.value;
    this.currentPage = 1;
    this.loadUsers();
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

  // ----- actions -----
  openAddUser() { this.showAddUserModal = true; }
  closeAddUser() { this.showAddUserModal = false; this.loadUsers(); }
  onAddUserClosed() {
    this.showAddUserModal = false;
    this.loadUsers(); // refresh user list
  }


  redeem(user: any) { console.log('redeemcliked', user); }
  openWallet(user: any) { console.log('Wallet clicked', user); }
  viewKey(user: any) { console.log('View Key clicked', user); }


  //edit user 
  editUser(user: any) {
    this.selectedUser = user;
    this.editForm.patchValue({
      username: user.username,
      name: user.name,
      email: user.email,
      password: ''
    });
    this.showEditModal = true; // ✅ open modal
  }

  closeModal() {
    this.showEditModal = false; // ✅ close modal
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onUpdateUser() {
    if (this.editForm.invalid) {
      Swal.fire('❌ Error', 'Please fill all required fields.', 'error');
      return;
    }

    const updatedUser = { ...this.selectedUser, ...this.editForm.value };

    this.userService.updateUser(updatedUser).subscribe({
      next: (res) => {
        Swal.fire('✅ Updated', 'User updated successfully!', 'success');
        this.loadUsers();
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('❌ Error', 'Failed to update user.', 'error');
      }
    });
  }


  openDeleteModal(user: any) {
    this.selectedUserToDelete = user;
    this.deleteForm.patchValue({
      name: user.name,
      email: user.email,
      confirmText: ''
    });
    this.showDeleteModal = true;
  }

  // Close modal
  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  // Check if typed DELETE correctly
  canDelete(): boolean {
    return this.deleteForm.get('confirmText')?.value?.trim().toUpperCase() === 'DELETE';
  }

  // Confirm deletion
  confirmDeleteUser() {
    if (!this.canDelete()) return;

    const userId = this.selectedUserToDelete.userId;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        Swal.fire('✅ Deleted', 'User deleted successfully.', 'success');
        this.closeDeleteModal();
        this.loadUsers();
      },
      error: () => Swal.fire('❌ Error', 'Failed to delete user.', 'error')
    });
  }


  // open modal
  openRedeem(user: any) {
    this.redeemForm.patchValue({
      account: user.username,
      amount: 0,
      remark: '',
      redeemRemark: ''
    });
    this.totalAmount = 0;
    this.showRedeemModal = true;
  }

  // close modal
  closeRedeem() {
    this.showRedeemModal = false;
  }

  // calculate total after fee
  calculateTotal() {
    const amount = this.redeemForm.get('amount')?.value || 0;
    const fee = amount * 0.05;
    this.totalAmount = Math.floor(amount - fee);
  }

  // confirm action
  confirmRedeem() {
    if (this.redeemForm.invalid) return;

    const payload = this.redeemForm.value;
    payload.finalAmount = this.totalAmount;

    console.log('Redeem submitted:', payload);

    // Call your API here
    // this.userService.redeem(payload).subscribe(...);

    this.closeRedeem();
  }


  // Open modal
  setRechargeLimit(user: any) {
    this.selectedAgent = user;
    this.showRechargeLimitModal = true;
  }

  // Close modal
  closeRechargeLimitModal() {
    this.showRechargeLimitModal = false;
  }

  // Recharge Limit
  saveRechargeLimit() {
    const payload = {
      userId: this.selectedAgent.userId,
      enableLimit: this.rechargeLimitForm.value.enableLimit,
      monthlyLimit: this.rechargeLimitForm.value.monthlyLimit,
      dailyLimit: this.rechargeLimitForm.value.dailyLimit
    };

    this.userService.updateRechargeLimit(payload).subscribe({
      next: () => {
        Swal.fire('✅ Success', 'Recharge limit updated successfully.', 'success');
        this.closeRechargeLimitModal();
      },
      error: () => Swal.fire('❌ Error', 'Failed to update recharge limit.', 'error')
    });
  }



  // ✅ Open modal
  setPasswordPermission(user: any) {
    this.selectedAgentForPermission = user;
    this.showPasswordPermissionModal = true;

    // Optional: prefill existing data if you have API data
    // this.passwordPermissionForm.patchValue({ enablePermission: true, allowReset: true });
  }

  // ✅ Close modal
  closePasswordPermissionModal() {
    this.showPasswordPermissionModal = false;
  }

  savePasswordPermission() {
    const payload = {
      userId: this.selectedAgentForPermission.userId,
      enablePermission: this.passwordPermissionForm.value.enablePermission,
      allowReset: this.passwordPermissionForm.value.allowReset
    };

    this.userService.updatePasswordPermission(payload).subscribe({
      next: (res) => {
        console.log('✅ API Response:', res);
        Swal.fire('✅ Saved', 'Password permission settings updated successfully.', 'success');
        this.closePasswordPermissionModal();
        this.loadUsers(); // refresh table data
      },
      error: (err) => {
        console.error('❌ Error:', err);
        Swal.fire('❌ Error', 'Failed to update password permission.', 'error');
      }
    });
  }



  // Open modal
  allowCreationPermission(user: any) {
    this.selectedAgentForCreation = user;
    this.showCreationPermissionModal = true;
  }

  // Close modal
  closeCreationPermissionModal() {
    this.showCreationPermissionModal = false;
  }

  confirmAllowCreation() {
    const payload = {
      userId: this.selectedAgentForCreation.userId,
      allowCreation: true
    };

    this.userService.updateCreationPermission(payload).subscribe({
      next: (res) => {
        console.log('✅ API Response:', res);
        Swal.fire('✅ Success', 'User creation permission granted successfully.', 'success');
        this.closeCreationPermissionModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('❌ Error:', err);
        Swal.fire('❌ Error', 'Failed to update creation permission.', 'error');
      }
    });
  }




}
