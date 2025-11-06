import { Router } from '@angular/router';
import { User } from '../../services/user';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
declare var bootstrap: any;

@Component({
  selector: 'app-agent-navbar',
  standalone: false,
  templateUrl: './agent-navbar.html',
  styleUrl: './agent-navbar.css'
})
export class AgentNavbar {
  // profileName = 'Agent123'; // 👉 Replace with logged-in user’s name from auth service
  balance: number = 0;
  username: string = '';
  email: string = '';
  dropdownOpen = false;


  // ✅ For show/hide password
  showPassword: any = { current: false, new: false, confirm: false };
  currentUserId: number = 0;
  currentUser: any;
  rechargeLimitForm!: FormGroup;
  changePasswordForm: FormGroup;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private router: Router, private user: User,private auth: Auth,
    private fb: FormBuilder,) {
    // Recharge Limit form
    this.rechargeLimitForm = this.fb.group({
      enableLimit: [false], // Toggle
      monthlyLimit: ['', [Validators.min(0)]],
      dailyLimit: ['', [Validators.min(0)]],
      activeLimit: ['daily'] // radio button
    });

    this.rechargeLimitForm.get('enableLimit')?.valueChanges.subscribe(enabled => {
      if (enabled) {
        this.rechargeLimitForm.get('monthlyLimit')?.enable();
        this.rechargeLimitForm.get('dailyLimit')?.enable();
      } else {
        this.rechargeLimitForm.get('monthlyLimit')?.disable();
        this.rechargeLimitForm.get('dailyLimit')?.disable();
      }
    });


    // Change Password form
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // ✅ Try to read from the current session first
      const session = JSON.parse(localStorage.getItem('user') || '{}');
      const sessionEmail = session?.email;

      // ✅ Then check loginEmail (set right after login)
      const loginEmail = localStorage.getItem('loginEmail');

      // ✅ Finally, check if any remembered credentials match and are still valid
      const rememberedData = localStorage.getItem('remembered');
      let rememberedEmail = null;
      if (rememberedData) {
        const remembered = JSON.parse(rememberedData);
        const now = new Date();
        const expire = new Date(remembered.expire);
        if (expire > now) {
          rememberedEmail = remembered.email || remembered.identifier;
        } else {
          localStorage.removeItem('remembered'); // expired cleanup
        }
      }

      // ✅ Priority: session > loginEmail > remembered
      const activeEmail = sessionEmail || loginEmail || rememberedEmail;

      if (activeEmail) {
        this.email = activeEmail;
        this.fetchUserDetails(activeEmail);
      } else {
        console.warn('⚠️ No active user email found, redirecting to login');
        this.router.navigate(['/login']);
      }
    }
    // if (isPlatformBrowser(this.platformId)) {
    //   const remembered = JSON.parse(localStorage.getItem('remembered') || '{}');
    //   console.log('🔍 Remembered Data:', remembered);
    //   const email = remembered.email || localStorage.getItem('email');
    //   this.email = email || '';

    //   if (email) {
    //     this.fetchUserDetails(email);
    //   } else {
    //     console.warn('⚠️ No email found in localStorage');
    //   }
    // }
  }

  logout() {
    // Clear session / token
    localStorage.clear();
    // Navigate back to login
    this.router.navigate(['/login']);
  }
  refreshBalance() {
    if (!this.email) return;
    console.log('🔄 Refreshing balance...');
    this.user.getUserByEmail(this.email).subscribe({
      next: (res) => {
        this.balance = res.balance ?? 0;
        sessionStorage.setItem('balance', this.balance.toString());
        console.log('✅ Updated balance:', this.balance);
      },
      error: (err) => {
        console.error('❌ Failed to refresh balance:', err);
      }
    });
  }
  fetchUserDetails(email: string) {
    this.user.getUserByEmail(email).subscribe({
      next: (res) => {
        this.currentUser = res;
        this.username = res.username;
        this.balance = res.balance ?? 0;
        this.currentUserId = res.userId;
        sessionStorage.setItem('balance', this.balance.toString());
        sessionStorage.setItem('username', this.username);
        console.log('✅ Current User:', this.currentUser);
      },
      error: (err) => {
        console.error('❌ Failed to load user details:', err);
      }
    });
  }
  private passwordMatchValidator(form: FormGroup) {
    const newPass = form.get('newPassword')?.value;
    const confirmPass = form.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }
  openRechargeLimit() {
    const modalEl = document.getElementById('rechargeLimitModal');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();
  }

  onRechargeLimitSubmit(): void {
    if (this.rechargeLimitForm.valid) {
      console.log('Recharge Limit Form Data:', this.rechargeLimitForm.value);
      // Here you can call your API to save the limits
    } else {
      console.log('Form is invalid');
      this.rechargeLimitForm.markAllAsTouched();
    }
  }
  onApply(): void {
    if (this.rechargeLimitForm.valid) {
      console.log('Applied Values:', this.rechargeLimitForm.value);
      // Call API here if needed
    } else {
      this.rechargeLimitForm.markAllAsTouched();
    }
  }
  // ---------------------------
  // 🔒 Change Password Modal
  // ---------------------------
  openChangePassword() {
    const modalEl = document.getElementById('changePasswordModal');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();
  }

  toggleVisibility(field: string) {
    this.showPassword[field] = !this.showPassword[field];
  }

  onChangePassword() {
    if (!this.changePasswordForm) return;

    if (this.changePasswordForm.invalid) {
      // mark all controls as touched so validations show
      Object.values(this.changePasswordForm.controls).forEach(c => c.markAsTouched());
      return;
    }

    const newPassword = this.changePasswordForm.get('newPassword')!.value;
    const currentPassword = this.changePasswordForm.get('currentPassword')!.value;

    const payload = {
      userId: this.currentUserId,
      currentPassword: currentPassword, // optional on server side validation
      newPassword: newPassword
    };

    this.auth.changePassword(payload).subscribe({
      next: res => {
        // success
        console.log('Password changed', res);
        const modalEl = document.getElementById('changePasswordModal');
        const modal = bootstrap.Modal.getInstance(modalEl!);
        modal?.hide();
        this.changePasswordForm.reset();
      },
      error: err => {
        // handle errors: show toast or set form errors accordingly
        console.error('Failed change password', err);
      }
    });
  }

}
