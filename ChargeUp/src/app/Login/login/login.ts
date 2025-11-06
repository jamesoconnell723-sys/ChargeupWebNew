import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';


@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm!: FormGroup;
  captchaQuestion = '';
  correctAnswer = 0;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      captcha: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.generateCaptcha();
      const rememberedData = localStorage.getItem('remembered');
  if (rememberedData) {
    const remembered = JSON.parse(rememberedData);
    const now = new Date();
    const expire = new Date(remembered.expire);
    if (expire > now) {
      this.loginForm.patchValue({ email: remembered.email });
    } else {
      localStorage.removeItem('remembered');
    }
  }
  }

  generateCaptcha() {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    this.correctAnswer = a + b;
    this.captchaQuestion = `${a} + ${b}`;
  }

  onNext() {
    if (this.loginForm.valid) {
      const userAnswer = Number(this.loginForm.value.captcha);
      if (userAnswer !== this.correctAnswer) {
        alert('Captcha is incorrect!');
        this.generateCaptcha();
        this.loginForm.patchValue({ captcha: '' });
        return;
      }

      // ✅ Store email and navigate
      localStorage.setItem('loginEmail', this.loginForm.value.email);
      this.router.navigate(['/password']);
    } else {
      alert('Please fill all fields.');
    }
  }
}