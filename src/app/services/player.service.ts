import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BiddingPayload,
  BiddingProgressResponse,
  MarkSoldResponse,
  OwnerDetails,
  Player,
  PlayersResponse,
} from '../../models/player.model';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private apiUrl = environment.apiUrl;
  private selectedPlayerUidSignal: WritableSignal<string> = signal('');
  private selectedOwnerSignal: WritableSignal<OwnerDetails | null> =
    signal(null);
  private isAdmin: WritableSignal<boolean> = signal(false);
  private socket!: Socket;
  private biddingUpdatesSubject: Subject<BiddingProgressResponse> =
    new Subject<BiddingProgressResponse>();
  constructor(private http: HttpClient) {}

  connectWebSocket(playerId: string): void {
    if (this.socket) {
      this.socket.disconnect(); // Close any existing connection before reconnecting
    }

    this.socket = io(environment.websocketUrl, {
      query: { playerId },
      transports: ['websocket'], // Use WebSocket transport for stability
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    this.socket.on('updateBid', (data: BiddingProgressResponse) => {
      console.log('📢 Received bid update:', data);
      this.biddingUpdatesSubject.next(data);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 WebSocket disconnected');
    }
  }

  onBiddingUpdates(): Observable<BiddingProgressResponse> {
    return this.biddingUpdatesSubject.asObservable();
  }

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

  // Fetch bidding data using playerId
  initiateBidding(playerId: string): Observable<BiddingProgressResponse> {
    return this.http.get<BiddingProgressResponse>(
      `${this.apiUrl}/initiatebidding/${playerId}`
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
