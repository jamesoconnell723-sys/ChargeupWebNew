import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-passowrd',
  standalone: false,
  templateUrl: './passowrd.html',
  styleUrls: ['./passowrd.css']
})
export class Passowrd {
passwordForm!: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder, private router: Router, private auth: Auth) {
    this.passwordForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }
ngOnInit(): void {
  const storedEmail = localStorage.getItem('loginEmail');
  const rememberedData = localStorage.getItem('remembered');

  // Reset all fields first
  this.passwordForm.reset();

  if (rememberedData) {
    const remembered = JSON.parse(rememberedData);
    const now = new Date();
    const expire = new Date(remembered.expire);

    if (expire > now) {
      // ✅ Still valid
      this.passwordForm.patchValue({
        email: remembered.email,
        password: remembered.password,
        rememberMe: true
      });
    } else {
      localStorage.removeItem('remembered');
      this.passwordForm.patchValue({ email: storedEmail || '' });
    }
  } else {
    // No remembered data
    this.passwordForm.patchValue({ email: storedEmail || '' });
  }
}


  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.passwordForm.valid) {
      const { email, password, rememberMe } = this.passwordForm.value;

      this.auth.login(email, password).subscribe({
        next: (res: any) => {
          const user = res.user;
          const role = user?.roleName?.toLowerCase();

          this.auth.saveSession({
            token: res.token,
            ...user
          });

          // ✅ Save email
          localStorage.setItem('loginEmail', email);

          // ✅ Save Remember Me (30 days)
          if (rememberMe) {
            const expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 30);
            localStorage.setItem(
              'remembered',
              JSON.stringify({ email, password, expire: expireDate.toISOString() })
            );
          } else {
            localStorage.removeItem('remembered');
          }

          // ✅ Redirect by role
          switch (role) {
            case 'admin':
            case 'master':
              this.router.navigate(['/navbar/userlisting']);
              break;
            case 'agent':
              this.router.navigate(['/agent/user-management']);
              break;
            case 'player':
              this.router.navigate(['/player/recharge']);
              break;
            default:
              alert('Unauthorized role.');
              this.router.navigate(['/login']);
              break;
          }
        },
        error: (err) => {
          alert(err.error?.message || 'Login failed.');
        }
      });
    } else {
      alert('Please fill in all fields.');
    }
  }

  onBack() {
    this.router.navigate(['/login']);
  }
}
