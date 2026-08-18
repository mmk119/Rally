export type ViewMode = 'dashboard' | 'courts' | 'bookings' | 'rankings' | 'settings';

export interface Court {
  id: string;
  name: string;
  type: 'Indoor' | 'Outdoor';
  feature: 'Panoramic' | 'Standard' | 'Covered' | 'Championship Glass';
  surface: 'Pro Surface' | 'Standard Turf' | 'Mondo Supercourt';
  pricePerHour: number;
  isBooked?: boolean;
  statusText?: string;
  image?: string;
  description: string;
  lighting: string;
}

export interface TimeSlot {
  time: string; // e.g. "19:00"
  period: 'morning' | 'afternoon' | 'evening';
  available: boolean;
  highDemand?: boolean;
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
  icon: string;
  selected: boolean;
}

export interface Booking {
  id: string;
  player: string;
  court: string;
  courtId: string;
  dateTime: string;
  rawDate: string;
  timeSlot: string;
  durationMins: number;
  amount: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  addOns?: string[];
  qrCode?: string;
}

export interface HeatmapHour {
  time: string;
  c1: number; // 0 (empty) to 1 (full)
  c2: number;
  c3: number;
  c4: number;
  c5: number;
}

export interface AnalyticsStats {
  period: '7D' | '30D';
  bookingsCount: number;
  bookingsChange: string;
  revenue: string;
  revenueChange: string;
  occupancyPercent: number;
  occupancyChange: string;
  peakHour: string;
  peakStatus: string;
  bookingsOverTime: { day: string; count: number }[];
  courtShare: { court: string; percentage: number; color: string }[];
  heatmap: HeatmapHour[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  richCard?: {
    title: string;
    court: string;
    time: string;
    date: string;
    price: string;
    actionLabel?: string;
  };
}

export interface PlayerRank {
  rank: number;
  name: string;
  elo: number;
  tier: 'Elite Pro' | 'Master' | 'Challenger' | 'Club';
  winRate: number;
  matchesPlayed: number;
  trend: 'up' | 'down' | 'steady';
  avatar: string;
}
