import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Player {
  userId: number;
  username: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  userType: string;
  parentId: number;
}
export interface RechargeRecord {
  id: number;
  userId: number;
  userName: string;
  recharge: number;
  remarks?: string;
  status?: string;
  failedReason?: string;
  createdBy?: number;
  createdAt: string;
  modifiedBy?: number;
  modifiedAt?: string;
  isDelete: boolean;
}
export interface ExportRequest {
  userId: number;
  month: number;
  year: number;
}
export interface RedeemRecord {
  redeemId: number;
  account: string;
  amount: number;
  serviceFee: number;
  netAmount: number;
  status: string;
  requestedAt: string;
}
export interface ServiceFee {
  serviceFeeId: number;
  serviceFeePercent: number;
  fromDate: string;
  toDate: string;
}
@Injectable({
  providedIn: 'root'
})
export class AgentService {

  // private apiUrl = 'http://localhost:5000/api/Agent';
  private apiUrl = `${environment.apiUrl}/Agent`;

  constructor(private http: HttpClient) { }

  getPlayerList(userId: number): Observable<Player[]> {
    return this.http.post<Player[]>(`${this.apiUrl}/GetPlayerlist`, { UserId: userId });
  }
  getAllowCreation(userId: number) {
    return this.http.post<boolean>(`${this.apiUrl}/GetAllowCreation`, { UserId: userId });
  }
  getAgentAccessInfo(userId: number) {
    return this.http.post<{ allowUserCreation: boolean; refLink: string }>(
      `${this.apiUrl}/GetAgentAccessInfo`,
      { UserId: userId }
    );
  }

  createUser(user: any) {
    return this.http.post(`${this.apiUrl}/CreateUser`, user);
  }
  deleteUser(userId: number, agentId: number) {
    return this.http.post(`${this.apiUrl}/DeleteUser`, {
      userId: userId,
      agentId: agentId
    });
  }
  updateUser(user: any) {
    return this.http.post(`${this.apiUrl}/UpdateUser`, user);
  }
  Rechargerecored(userId: number): Observable<RechargeRecord[]> {
    return this.http.post<RechargeRecord[]>(`${this.apiUrl}/GetRechargeRecords`, userId);
  }

  exportRechargePdf(req: ExportRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/ExportRechargePdf`, req, {
      responseType: 'blob'
    });
  }

  exportRechargeExcel(req: ExportRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/ExportRechargeExcel`, req, {
      responseType: 'blob'
    });
  }
  getRedeemRecords(agentId: number): Observable<RedeemRecord[]> {
    return this.http.post<RedeemRecord[]>(`${this.apiUrl}/GetRedeemRecords`, {
      agentId: agentId
    });
  }

  approveRedeem(redeemId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/ApproveRedeem`, { redeemId });
  }

  rejectRedeem(redeemId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/RejectRedeem`, { redeemId });
  }
  getAgentBalance(agentId: number): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.apiUrl}/${agentId}/balance`);
  }

  getActiveServiceFee(): Observable<ServiceFee> {
    return this.http.get<ServiceFee>(`${this.apiUrl}/active`);
  }
  redeemAmount(payload: {
    agentId: number;
    playerId: number;
    amount: number;
    serviceFee: number;
    netAmount: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/redeem`, payload);
  }

  getAmountPermissions(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/PlayerAmountPermissions/${userId}`);
  }

  saveAmountPermissions(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/SaveAmountPermissions`, data);
  }
  confirmRedeemApproval(payload: {
    redeemId: number;
    agentId: number;
    netAmount: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ConfirmRedeemApproval`, payload);
  }
  confirmRedeemRejection(payload: {
    redeemId: number;
    agentId: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ConfirmRedeemRejection`, payload);
  }

  exportRedeemPdf(req: ExportRequest): Observable<Blob> {
  return this.http.post(`${this.apiUrl}/ExportRedeemPdf`, req, {
    responseType: 'blob'
  });
}

exportRedeemExcel(req: ExportRequest): Observable<Blob> {
  return this.http.post(`${this.apiUrl}/ExportRedeemExcel`, req, {
    responseType: 'blob'
  });
}







}
