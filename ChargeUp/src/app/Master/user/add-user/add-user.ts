import { Component,EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User as UserService, Role } from '../../../services/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-user',
  standalone: false,
  templateUrl: './add-user.html',
  styleUrl: './add-user.css'
})
export class AddUser {
   @Output() closeModal = new EventEmitter<void>();
  userForm!: FormGroup;
  message: string = '';
  showPassword = false;
  showConfirmPassword = false;

  roles: Role[] = [];
  parentUsers: any[] = [];
  allAdmins: any[] = [];
  allMasters: any[] = [];
  allAgents: any[] = [];

  currentUser: any;
  selectedUserTypeName: string = '';

  constructor(private fb: FormBuilder, private userService: UserService) {}

ngOnInit(): void {
 this.userForm = this.fb.group(
  {
    username: ['', Validators.required],
    name: ['', Validators.required],
    phoneNumber: ['',[Validators.required,Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    roleId: ['', Validators.required],
    parentType: [''], // ✅ correct control name
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  },
  { validators: this.passwordMatchValidator }
);


  const remembered = JSON.parse(localStorage.getItem('remembered') || '{}');
  const email = remembered.identifier || localStorage.getItem('identifier');
  console.log('🔍 Logged-in Email:', email);

  if (email) {
    this.userService.getUserByEmail(email).subscribe({
      next: (user) => {
        this.currentUser = {
          userId: user.userId,
          username: user.username,
          name: user.name,
          roleId: user.userId
        };
        console.log('✅ Current Logged-in User:', this.currentUser);
         this.loadUserTypesFiltered();
         this.loadUsers();
      },
      error: (err) => {
        console.warn('⚠️ Could not load user by email:', err);
        this.currentUser = { userId: 0, username: '', name: '', userType: '' };
         this.loadUserTypes();
         this.loadUserTypesFiltered();
      }
    });
  }else {
    console.warn('⚠️ No email found in localStorage');
    this.loadUserTypes(); // fallback
  }
 

  this.userForm.get('roleId')?.valueChanges.subscribe(typeId => {
    this.filterParentUsers(typeId);
  });
}



  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  loadUsers() {
    const token = localStorage.getItem('jwtToken') || '';
    this.userService.getAllUsers(token).subscribe((users: any[]) => {
      this.allAdmins = users.filter(u => u.userType === 'Admin');
      this.allMasters = users.filter(u => u.userType === 'Master');
      this.allAgents = users.filter(u => u.userType?.toLowerCase() === 'agent'&& !u.isDeleted);
      console.log(this.allAgents);
    });
  }

  loadUserTypes() {
    this.userService.getRoles().subscribe(
      (data: Role[]) => {
        this.roles = data;
        console.log('Loaded roles:', this.roles);  
      },
      (error) => {
        console.error('Error loading user types', error);
      }
    );
  }

  loadUserTypesFiltered() {
  this.userService.getRoles().subscribe({
    next: (types: Role[]) => {
      if (!this.currentUser?.userType) {
         this.roles = types.filter(t =>
        ['agent', 'player'].includes(t.roleName.toLowerCase())
      );
        console.log('⚠️ No current user type found, loading all roles:', this.roles);
        return;
      }

      const currentType = this.currentUser.userType.toLowerCase();

      if (currentType === 'admin') {
        // ✅ Admin can create all
        this.roles = types;
      } 
      else if (currentType === 'master') {
        // ✅ Master can only create Agents & Players
        this.roles = types.filter(t => 
          t.roleName.toLowerCase() === 'agent' || 
          t.roleName.toLowerCase() === 'player'
        );
      } 
      else if (currentType === 'agent') {
        // ✅ Agent can only create Players
        this.roles = types.filter(t => 
          t.roleName.toLowerCase() === 'player'
        );
      } 
      else {
        this.roles = [];
      }

      console.log('🎯 Filtered user types:', this.roles);
    },
    error: (err) => {
      console.error('❌ Error loading user types:', err);
    }
  });
}

filterParentUsers(typeId: number) {
  const selectedType = this.roles.find(ut => ut.roleId == typeId)?.roleName;
  const parentControl = this.userForm.get('parentType');
  this.selectedUserTypeName = selectedType || '';

  if (!parentControl) return;

  // ✅ For Master creation
  if (selectedType === 'Master') {
    this.parentUsers = this.allAdmins;
    parentControl.enable();
    parentControl.reset();
  }

  // ✅ For Agent creation
  else if (selectedType === 'Agent') {
    // Logged-in user becomes parent (Master → Agent)
    this.parentUsers = [
      {
        userId: this.currentUser.userId,
        username: this.currentUser.username,
        name: this.currentUser.name,
        roleName: this.currentUser.roleName,
      },
    ];
    parentControl.enable();
    parentControl.setValue(this.currentUser.userId);
  }

  // ✅ For Player creation (Agents + Logged-in user)
  else if (selectedType === 'Player') {
    this.userService.getAgents().subscribe({
      next: (agents: any[]) => {
        // Include logged-in user + all agents
        const agentsList = agents.map(agent => ({
          userId: agent.userId,
          username: agent.username,
          name: agent.name,
          roleName: 'Agent'
        }));

        const currentUserOption = {
          userId: this.currentUser.userId,
          username: this.currentUser.username,
          name: this.currentUser.name,
          roleName: this.currentUser.roleName,
        };

        // Merge logged-in user first, then agents
        this.parentUsers = [currentUserOption, ...agentsList];

        parentControl.enable();
        parentControl.reset();

        console.log("✅ Parent dropdown options for Player:", this.parentUsers);
      },
      error: (err) => {
        console.error('Failed to load agents:', err);
        this.parentUsers = [{
          userId: this.currentUser.userId,
          username: this.currentUser.username,
          name: this.currentUser.name,
          roleName: this.currentUser.roleName,
        }];
      }
    });
  }

  // ✅ Default
  else {
    this.parentUsers = [];
    parentControl.reset();
    parentControl.disable();
  }
}



onSubmit() {
  if (this.userForm.invalid) {
    Swal.fire('❌ Error', 'Please fill all required fields.', 'error');
    return;
  }

  const formValue = this.userForm.getRawValue();
  const selectedType = this.roles.find(ut => ut.roleId == formValue.roleId);
  let parentType = formValue.parentType ? Number(formValue.parentType) : null;

 

  // ✅ Only fallback if parentType is not selected at all
  if (!parentType && selectedType?.roleName === 'Agent' && this.currentUser) {
    parentType = this.currentUser.userId; // Master → Agent creation
  }

  if (!parentType && selectedType?.roleName === 'Player' && this.currentUser) {
    parentType = this.currentUser.userId; // Fallback (should rarely trigger)
  }

  if (selectedType?.roleName === 'Player' && !parentType) {
  Swal.fire('⚠️ Missing Parent', 'Please select an Agent for this Player.', 'warning');
  return;
}

  const payload = {
    Username: formValue.username,
    Name: formValue.name,
    PhoneNumber: formValue.phoneNumber || '',
    Email: formValue.email,
    RoleName: selectedType?.roleName || '',
    ParentType: parentType,
    Password: formValue.password,
    CreatedBy: this.currentUser?.userId || 0,
    CreatedAt: new Date().toISOString(),
    IsDeleted: false
  };

  console.log('📤 Payload sent to API:', payload);

  this.userService.addUser(payload).subscribe({
    next: res => {
      Swal.fire({
        icon: 'success',
        title: '✅ User added successfully!',
        timer: 1000,
        showConfirmButton: false
      }).then(() => {
        this.userForm.reset();
        this.closeModal.emit();
      });
    },
    error: err => {
      console.error('❌ Error adding user:', err);
      const msg = err.error && typeof err.error === 'string'
        ? err.error
        : 'Failed to add user.';
      Swal.fire('❌ Error', msg, 'error');
    },
  });
}



closeAddUser() {
  this.userForm.reset();
  this.closeModal.emit(); 
  this.loadUsers();// ✅ close parent modal
}

  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  
}
