import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserCreate } from '../../models/user.model';
import { PlayersResponse } from '../../models/player.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createUser(userData: FormData): Observable<UserCreate> {
    return this.http.post<UserCreate>(`${this.apiUrl}/createuser`, userData);
  }

  getAllPlayers(): Observable<PlayersResponse> {
    return this.http.get<PlayersResponse>(`${this.apiUrl}/players`);
  }
}
