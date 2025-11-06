import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgentSummaryService {
  // private apiUrl = 'http://localhost:5000/api/AgentSummary';
  private apiUrl = `${environment.apiUrl}/AgentSummary`;
  constructor(private http: HttpClient) { }

  getAgentUsers(parentId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/GetAgentUsers/${parentId}`);
  }

  getAgentSummary(parentId: number, userId?: number, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    params.append('parentId', parentId.toString());
    if (userId) params.append('userId', userId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.http.get<any>(`${this.apiUrl}/GetAgentSummary?${params.toString()}`);
  }

}
