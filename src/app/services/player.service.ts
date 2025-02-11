import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BiddingPayload,
  BiddingProgressResponse,
  MarkSoldResponse,
  OwnerDetails,
  Player,
  PlayersResponse,
} from '../../models/player.model';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private apiUrl = environment.apiUrl;
  private selectedPlayerUidSignal: WritableSignal<string> = signal('');
  private selectedOwnerSignal: WritableSignal<OwnerDetails | null> =
    signal(null);
  private isAdmin: WritableSignal<boolean> = signal(false);

  constructor(private http: HttpClient) {}

  getPlayers(): Observable<Player[]> {
    return this.http.get<PlayersResponse>(`${this.apiUrl}/players`).pipe(
      map((response) => response.players) // Extract players array from response
    );
  }

  startBidding(playerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/initiatebidding/${playerId}`, {});
  }

  getPlayerById(playerId: string): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/player/${playerId}`);
  }

  setSelectedPlayerUidSignal(playerUid: string): void {
    this.selectedPlayerUidSignal.set(playerUid);
  }

  setSelectedOwnerSignal(ownerDetails: OwnerDetails): void {
    this.selectedOwnerSignal.set(ownerDetails);
  }

  setIsAdminSignal(): void {
    this.isAdmin.set(true);
  }

  getIsAdmin(): boolean {
    return this.isAdmin();
  }

  getSelectedPlayerUidSignal(): string {
    return this.selectedPlayerUidSignal();
  }

  getSelectedOwnerSignal(): OwnerDetails | null {
    return this.selectedOwnerSignal();
  }

  biddingProgress(): Observable<BiddingProgressResponse> {
    return this.http.get<BiddingProgressResponse>(
      `${this.apiUrl}/biddingprogress`
    );
  }

  fetchLatestBid(): Observable<BiddingProgressResponse> {
    return this.http.get<BiddingProgressResponse>(
      `${this.apiUrl}/fetchlatestbid`
    );
  }

  placeBid(bidDetails: BiddingPayload) {
    return this.http.post<BiddingPayload>(
      `${this.apiUrl}/makeabid`,
      bidDetails
    );
  }

  getUserDetailsByEmailId(userEmail: string): Observable<OwnerDetails> {
    const userEmailDetails = { userEmail };
    return this.http.post<OwnerDetails>(
      `${this.apiUrl}/getowner`,
      userEmailDetails
    );
  }

  markPlayerSold(playerId: string): Observable<MarkSoldResponse> {
    return this.http.get<MarkSoldResponse>(
      `${this.apiUrl}/markplayerassold/${playerId}`
    );
  }
}
