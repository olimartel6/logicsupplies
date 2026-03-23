// Mock data for demo version

export const mockClient = {
  id: '1',
  phone: '+1 418-555-0123',
  name: 'Marie Tremblay',
  referral_code: 'MARIE2024',
  points_balance: 325,
  created_at: '2026-01-15',
};

export const mockTransactions = [
  { id: 1, type: 'purchase', points: 150, description: 'Épilation laser jambes', amount_spent: 15, created_at: '2026-03-20' },
  { id: 2, type: 'visit', points: 25, description: 'Visite en magasin', created_at: '2026-03-18' },
  { id: 3, type: 'referral', points: 75, description: 'Parrainage — Sophie Gagnon', created_at: '2026-03-10' },
  { id: 4, type: 'purchase', points: 80, description: 'Épilation cire sourcils', amount_spent: 8, created_at: '2026-03-05' },
  { id: 5, type: 'visit', points: 25, description: 'Visite en magasin', created_at: '2026-02-28' },
  { id: 6, type: 'redemption', points: -250, description: 'Échange: 10% rabais', created_at: '2026-02-20' },
  { id: 7, type: 'purchase', points: 220, description: 'Épilation laser aisselles', amount_spent: 22, created_at: '2026-02-15' },
];

export const mockRewards = [
  { id: 1, name: '10% rabais sur un service', points_required: 250, type: 'discount_percent', value: 10, active: true },
  { id: 2, name: '25$ de rabais', points_required: 500, type: 'discount_fixed', value: 25, active: true },
  { id: 3, name: 'Épilation cire gratuite', points_required: 1000, type: 'free_service', value: 'cire', active: true },
  { id: 4, name: 'Séance laser gratuite', points_required: 2000, type: 'free_service', value: 'laser', active: true },
];

export const mockReferrals = [
  { name: 'Sophie Gagnon', date: '2026-03-10', status: 'completed' },
  { name: 'Julie Bouchard', date: '2026-02-25', status: 'pending' },
];

// Mock admin data
export const mockAllClients = [
  { id: '1', phone: '+1 418-555-0123', name: 'Marie Tremblay', points_balance: 325, created_at: '2026-01-15' },
  { id: '2', phone: '+1 418-555-0456', name: 'Sophie Gagnon', points_balance: 150, created_at: '2026-03-10' },
  { id: '3', phone: '+1 418-555-0789', name: 'Isabelle Roy', points_balance: 890, created_at: '2025-11-20' },
  { id: '4', phone: '+1 418-555-0321', name: 'Catherine Lavoie', points_balance: 1250, created_at: '2025-09-05' },
  { id: '5', phone: '+1 418-555-0654', name: 'Amélie Côté', points_balance: 45, created_at: '2026-03-18' },
];

export const mockPendingRedemptions = [
  { id: 1, client_name: 'Catherine Lavoie', reward: 'Épilation cire gratuite', points_spent: 1000, status: 'pending', created_at: '2026-03-22' },
  { id: 2, client_name: 'Isabelle Roy', reward: '25$ de rabais', points_spent: 500, status: 'pending', created_at: '2026-03-21' },
];
