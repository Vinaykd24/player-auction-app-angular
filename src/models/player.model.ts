export interface Player {
  firstName: string;
  lastName: string;
  role: string;
  userEmail: string;
  userType: string;
  userId: string;
  basePrice: number;
}
export interface AllOwnersResponse {
  players: OwnerDetails[];
}

export interface TeamMember {
  firstName: string;
  lastName: string;
  userEmail: string;
  userType: string;
  userId: string;
  role: string;
  basePrice: number;
  biddingStatus: 'SOLD' | 'UNSOLD'; // Can be expanded with other possible statuses
  currentBidAmount: number;
  createdAt: string;
  biddingId: string;
  teamId: string;
  bidAmount: number;
}

export interface OwnerDetails {
  firstName: string;
  lastName: string;
  userEmail: string;
  userType: string;
  userId: string;
  teamName: string;
  teamMembers: TeamMember[];
  budget: number;
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
  bidAmount: number;
  teamId: string;
  imageUrl?: string;
}

export interface LatestBidResponse {
  playerId: string;
  teamId: string;
  currentBidAmount: number;
  bidAmount: number;
}

export interface MarkSoldResponse {
  message: string;
  playerId: string;
  firstName: string;
  lastName: string;
  soldAmount: number;
  teamName: string;
  teamId: string;
  teamBudget: number;
}
