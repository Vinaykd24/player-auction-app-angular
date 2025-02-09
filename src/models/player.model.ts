export interface Player {
  firstName: string;
  lastName: string;
  role: string;
  userEmail: string;
  userType: string;
  userId: string;
  basePrice: number;
}

export interface PlayersResponse {
  players: Player[];
}

export interface BiddingPayload {
  teamId: string;
  playerId: string;
  bidAmount: number;
  currentBidAmount: number;
}

export interface BiddingProgressResponse {
  firstName: string;
  role: string;
  userEmail: string;
  userType: string;
  userId: string;
  basePrice: number;
  lastName: string;
  biddingStatus: string;
  currentBidAmount: number;
  createdAt: string;
  biddingId: string;
}

export interface MarkSoldResponse {
  message: string;
}
