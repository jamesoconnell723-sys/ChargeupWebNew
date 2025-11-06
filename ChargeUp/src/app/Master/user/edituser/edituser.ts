import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../services/user';
declare var bootstrap: any;
@Component({
  selector: 'app-edituser',
  standalone: false,
  templateUrl: './edituser.html',
  styleUrl: './edituser.css'
})
export class Edituser {
@Input() userData: any; // user object to edit

  editUserForm!: FormGroup;
  message: string = '';
  showPassword = false;
currentUser: any;
  constructor(private fb: FormBuilder, private userService: User) { }

  ngOnInit(): void {
    this.editUserForm = this.fb.group({
      username: [this.userData.username, Validators.required],
      name: [this.userData.name, Validators.required],
      email: [this.userData.email, [Validators.required, Validators.email]],
      password: ['', Validators.minLength(6)]
    });
     this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
  if (this.editUserForm.invalid) {
    this.message = '❌ Please fill all required fields correctly.';
    return;
  }

  const formValue = this.editUserForm.value;

  const payload = {
    Username: formValue.username,
    Name: formValue.name,
    PhoneNumber: this.userData.phoneNumber,   // keep old phone
    Email: formValue.email,
    UserType: this.userData.userType,         // keep old userType
    ParentId: this.userData.parentId,         // keep old parent
    Password: formValue.password || this.userData.password, // keep old password if not updated
    ModifiedBy: this.currentUser.userId || 1
  };

  this.userService.updateUser(this.userData.userId).subscribe({
    next: res => {
      this.message = '✅ User updated successfully!';
      const modalEl: any = document.getElementById('editUserModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    },
    error: err => {
      console.error(err);
      this.message = err.error || '❌ Failed to update user!';
    }
  });
}

}
