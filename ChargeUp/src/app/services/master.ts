import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RedeemRecord {
  userId: number;
   username?: string;  
  amount: number;
  serviceFee: number;
  netAmount: number;
  referenceNo: string;
  requestedAt: string;
  processedAt: string;
  processedBy: number;
  processedByName?: string;
  isDelete: boolean;
  remarks: string;
  status: string;
  redeemId: number;
}

export interface RechargeTransaction {
  id : number;
  rechargeId: number;
  userId: number; 
  username?: string;
  loginId: string;
  recharge: number; 
  status: string; 
  failedReason: string;
  remarks: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string; 
}

export interface SummaryResponse {
  totalUser: number;
  totalAgent: number;
  totalRecharges: number;
  totalRedeems: number;
  pendingRecharges: number;
  failedRedeems: number;
}

@Injectable({
  providedIn: 'root'
})
export class Master {
  
  // private apiUrl = 'http://localhost:5000/api/Master';
  private apiUrl = `${environment.apiUrl}/Master`;


  constructor(private http: HttpClient) { }


  getRedeemRecords(): Observable<RedeemRecord[]> {
    return this.http.get<RedeemRecord[]>(`${this.apiUrl}/GetRedeemRecords`);
  }

  getRechargeRecords(): Observable<RechargeTransaction[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetRechargeRecords`);
  }
  getSummary(username: string, startDate: string, endDate: string): Observable<SummaryResponse> {
    const params = new HttpParams()
      .set('username', username)
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<SummaryResponse>(`${this.apiUrl}/GetSummary`, { params });
  }

  getChildUsers(parentId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/GetChildUsers`, {
    params: { parentId: parentId.toString() }
  });
}
}
