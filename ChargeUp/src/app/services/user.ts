import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Role {
  roleId: number;
  roleName: string;
  createdAt?: string;
  modifiedAt?: string;
}
export interface UpdateUserRequest {
  userId:number;
  username: string;
  name: string;
  phoneNumber?: string;
  email: string;
  userType: string;
  parentId?: number;
  password?: string;
  modifiedBy: number;
}
export interface User {
  userId: number;
  username: string;
  email: string;
  userType?: string;
  parentType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class User {
  //  private apiUrl = 'http://localhost:5000/api/user'; 
   private apiUrl = `${environment.apiUrl}/user`;
  
  constructor(private http: HttpClient) {}

 addUser(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/AddUser`, payload);
  }
  getUsersByRole(role: string, token: string): Observable<any> {
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  return this.http.get(`${this.apiUrl}/by-role/${role}`, { headers });
}
updateUser(user: User): Observable<any> {
  return this.http.put(`${this.apiUrl}/UpdateUser/${user.userId}`, user);
}

deleteUser(userId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/DeleteUser/${userId}`);
}
getAllUsers(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(this.apiUrl, { headers });
  }
  getUsersPaged(loggedInUserId: number, page = 1, pageSize = 10, search = ''): Observable<any> {
 const params = {
    loggedInUserId,
    page,
    pageSize,
    search
  };

  return this.http.get(`${this.apiUrl}/GetUsersPaged`, { params });
}



  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

getUserById(id: number, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/GetUser/${id}`, { headers });
  }

  // 🔹 Update Recharge Limit
updateRechargeLimit(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/SetRechargeLimit`, data);
}

// 🔹 Update Password Permission
updatePasswordPermission(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/SetPasswordPermission`, data);
}

// 🔹 Update Creation Permission
updateCreationPermission(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/SetCreationPermission`, data);
}
getUserByEmail(email: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/GetUserByEmail/${encodeURIComponent(email)}`);
}
getAgents(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/GetAgents`);
}



}
