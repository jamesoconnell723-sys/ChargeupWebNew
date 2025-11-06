import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RechargeTransaction { Id?: number; LoginId: string; Recharge: number; Remark?: string; CreatedBy?: number; CreatedAt?: Date; ModifiedBy?: number; ModifiedAt?: Date; IsDelete?: boolean; }
export interface Redeem { RedeemId?: number; UserId?: number; Amount?: number; NetAmount?: number; Status?: string; RequestedAt?: Date; ProcessedAt?: Date; ProcessedBy?: number; ReferenceNo?: string; IsDelete?: boolean; Remark?: string; }
export interface RedeemWithLoginId extends Redeem { LoginId?: string; UserName?: string; }
export interface Transaction { TransactionId?: number; UserId?: number; TransactionType?: string; Amount?: number; BalanceBefore?: number; BalanceAfter?: number; ReferenceNo?: string; Status?: string; CreatedAt?: Date; CreatedBy?: number; Mode?: string; Remark?: string; IsDelete?: boolean; }
export interface GiftCard { GiftCardId?: number; UserId?: number; Code?: string; Pin?: string; Value?: number; Balance?: number; Status?: string; IssuedDate?: Date; ExpiryDate?: Date; AssignedBy?: number; ModifiedAt?: Date; IsDelete?: boolean; }
export interface PaymentMethod { PaymentMethodId?: number; UserId?: number; CashAppId?: string; PaypalId?: string; VenmoId?: string; ZelleId?: string; CreatedAt?: Date; ModifiedAt?: Date; IsDelete?: boolean; }

@Injectable({ providedIn: 'root' })
export class PlayerService {
  // private baseUrl = 'http://localhost:5000/api/Player';
  // private rechargeUrl = 'http://localhost:5000/api/RechargeTransactions';
  private baseUrl = `${environment.apiUrl}/Player`;
  private rechargeUrl = `${environment.apiUrl}/RechargeTransactions`;
  private playerredeemurl = `${environment.apiUrl}/PlayerRedeem`;

  constructor(private http: HttpClient) { }

  // -------------------- Recharge APIs --------------------
  getAllRecharges(): Observable<RechargeTransaction[]> {
    return this.http.get<RechargeTransaction[]>(`${this.rechargeUrl}`);
  }
  createRecharge(data: RechargeTransaction): Observable<RechargeTransaction> {
    return this.http.post<RechargeTransaction>(`${this.baseUrl}/RechargeTransactions`, data);
  }

  createCheckout(amount: number, userId: string, currency = 'USD'): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.baseUrl}/create-checkout`, {
      userId,
      amount,
      currency
    });
  }

  // -------------------- Redeem APIs --------------------
  getUserRedeems(userId: number): Observable<{ totalTransactions: number; redeems: RedeemWithLoginId[] }> {
    return this.http.get<{ totalTransactions: number; redeems: RedeemWithLoginId[] }>(
      `${this.playerredeemurl}/GetUserRedeems/${userId}`
    );
  }

  // createRedeem(data: RedeemWithLoginId): Observable<RedeemWithLoginId> {
  //   return this.http.post<RedeemWithLoginId>(`${this.baseUrl}/Redeem`, data);
  // }
  createRedeem(data: RedeemWithLoginId): Observable<RedeemWithLoginId> {
    return this.http.post<RedeemWithLoginId>(`${this.playerredeemurl}/CreateRedeem`, data);
  }

  // -------------------- Transactions --------------------
  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/Transactions`);
  }
  createTransaction(data: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/Transactions`, data);
  }


  getWalletBalance(userId: number): Observable<number> {
    return this.http.get<number>(`${this.playerredeemurl}/GetWalletBalance/${userId}`);
  }
  getPlayerName(userId: number): Observable<{ username: string }> {
    return this.http.get<{ username: string; name: string }>(
      `${this.playerredeemurl}/GetPlayerName/${userId}`
    );
  }

  // -------------------- Gift Cards --------------------
  getAllGiftCards(): Observable<GiftCard[]> { return this.http.get<GiftCard[]>(`${this.baseUrl}/GiftCard`); }
  createGiftCard(data: GiftCard): Observable<GiftCard> { return this.http.post<GiftCard>(`${this.baseUrl}/GiftCard`, data); }

  // -------------------- Payment Methods --------------------
  // getPaymentMethods(): Observable<PaymentMethod[]> { return this.http.get<PaymentMethod[]>(`${this.baseUrl}/PaymentMethod`); }
  savePaymentMethod(data: PaymentMethod): Observable<PaymentMethod> { return this.http.post<PaymentMethod>(`${this.baseUrl}/PaymentMethod`, data); }
  getAmountPermissions(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.rechargeUrl}/GetAmountPermissions/${userId}`);
  }
}
