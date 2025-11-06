import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SignupService } from '../services/signup-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup implements OnInit {
  registerForm!: FormGroup;
  passwordVisible = false;
  confirmPasswordVisible = false;
  referralCode: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private signupService: SignupService,
    private router: Router
  ) {}

  ngOnInit() {
    this.referralCode = this.route.snapshot.paramMap.get('reflink');

    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(5)]],
        userName: ['', [Validators.required, Validators.minLength(5)]],
        phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form ⚠️',
        text: 'Please fill all required fields correctly!',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    const payload = {
      ...this.registerForm.value,
      referralCode: this.referralCode
    };

    this.signupService.registerUser(payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful 🎉',
          text: 'Your account has been created successfully!',
          confirmButtonColor: '#3085d6'
        });
        this.registerForm.reset();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Something went wrong! Please try again.';
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: msg,
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  onCancel() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will clear the form!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.registerForm.reset();
        Swal.fire('Cleared!', 'Form has been reset.', 'success');
      }
    });
  }
}
