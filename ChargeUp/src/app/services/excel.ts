import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { RechargeRecords } from '../Master/recharge-records/recharge-records';
import { environment } from '../../environments/environment';

export interface RedeemRecord {
  redeemId: number;
  userId?: number | null;
  amount?: number | null;
  serviceFee?: number | null;
  netAmount?: number | null;
  status?: string | null;
  requestedAt?: string | null; // ISO string
  processedAt?: string | null;
  processedBy?: number | null;
  referenceNo?: string | null;
  isDelete?: boolean | null;
}

export interface RechargeTransaction {
  id:number;
  rechargeId: number;
  userId: number; 
  loginId: string;
  recharge: number; 
  status: string; 
  failedReason: string;
  remarks: string;
  createdBy: string;
  createdAt: string; 
}

@Injectable({
  providedIn: 'root'
})
export class Excel {

  // private apiUrl = 'http://localhost:5000/api/Master';
  private apiUrl = `${environment.apiUrl}/Master`;

  constructor(private http: HttpClient) { }

  downloadPdf(redeemList: RedeemRecord[]): Observable<Blob> {
    // NOTE: TypeScript signature workaround for responseType 'blob'
    return this.http.post(`${this.apiUrl}/DownloadRedeemPdf`, redeemList, { responseType: 'blob' as 'json' }) as Observable<Blob>;
  }

  downloadExcel(redeemList: RedeemRecord[]): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/DownloadRedeemExcel`, redeemList, { responseType: 'blob' as 'json' }) as Observable<Blob>;
  }

  exportPdf(year: number, month: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/ExportPdf?year=${year}&month=${month}`,
      { responseType: 'blob' }
    );
  }

  /**
   * Export Recharge Transactions as Excel
   */
  exportExcel(year: number, month: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/ExportExcel?year=${year}&month=${month}`,
      { responseType: 'blob' }
    );
  }
   
}
