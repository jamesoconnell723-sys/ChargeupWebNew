import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { PlayerService } from '../../services/player-service';

@Component({
  selector: 'app-player-layout',
  standalone: false,
  templateUrl: './player-layout.html',
  styleUrls: ['./player-layout.css']
})
export class PlayerLayout {
  changePasswordForm: FormGroup;
  currentUserId: number = 0;
  username: string = '';

  constructor(private fb: FormBuilder, private auth: Auth, private playerService: PlayerService) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = sessionData?.userId || localStorage.getItem('userId');
    this.loadPlayerName();
  }
  private loadPlayerName(): void {
    this.playerService.getPlayerName(this.currentUserId).subscribe({
      next: (player) => {
        this.username = player.username;
      },
      error: (err) => console.error('Failed to fetch player name', err)
    });
  }

  savePassword(): void {
    if (this.changePasswordForm.valid) {
      const { newPassword, confirmPassword } = this.changePasswordForm.value;
      if (newPassword === confirmPassword) {
        alert('Password changed successfully!');
        this.changePasswordForm.reset();
      } else {
        alert('New password and confirm password do not match');
      }
    }
  }

  openChangePassword(): void {
    const modalElement = document.getElementById('changePasswordModal');
    if (modalElement) {
      (modalElement as any).classList.add('show');
      modalElement.setAttribute('style', 'display:block;');
    }
  }
}
