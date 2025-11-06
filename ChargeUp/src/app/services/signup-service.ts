import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  // private apiUrl = 'http://localhost:5000/api/Signup';
  private apiUrl = `${environment.apiUrl}/Signup`;

  constructor(private http: HttpClient) { }

  registerUser(formData: any): Observable<any> {
    const dataToSend = {
      email: formData.email,
      name: formData.name,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      referralCode: formData.referralCode,
      userName: formData.userName
    };
    return this.http.post(`${this.apiUrl}/RegisterUser`, dataToSend);
  }

}
