import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kptphghxhexirezukarr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdHBoZ2h4aGV4aXJlenVrYXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MjA1NzMsImV4cCI6MjA4OTA5NjU3M30.TW9IZlmUQ1H4dJfWRAJ8fXgqR3YKjin8WJZGVPmOjFg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========== BUSINESS ==========

export async function getBusiness(slug) {
  const { data, error } = await supabase
    .from('loyalty_businesses')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}

// ========== CLIENTS ==========

export async function getClientByPhone(businessId, phone) {
  const { data } = await supabase
    .from('loyalty_clients')
    .select('*')
    .eq('business_id', businessId)
    .eq('phone', phone)
    .single();
  return data;
}

export async function getClientById(clientId) {
  const { data } = await supabase
    .from('loyalty_clients')
    .select('*')
    .eq('id', clientId)
    .single();
  return data;
}

export async function createLoyaltyClient(businessId, phone, name, referralCode, referredBy, birthday) {
  const { data, error } = await supabase
    .from('loyalty_clients')
    .insert({
      business_id: businessId,
      phone,
      name,
      referral_code: referralCode,
      referred_by: referredBy || null,
      points_balance: 0,
      total_points_earned: 0,
      visit_count: 0,
      birthday: birthday || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllClients(businessId) {
  const { data, error } = await supabase
    .from('loyalty_clients')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateClientPoints(clientId, newBalance) {
  const { error } = await supabase
    .from('loyalty_clients')
    .update({ points_balance: newBalance })
    .eq('id', clientId);
  if (error) throw error;
}

// ========== TRANSACTIONS ==========

export async function addTransaction(businessId, clientId, type, points, description, amountSpent) {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .insert({
      business_id: businessId,
      client_id: clientId,
      type,
      points,
      description,
      amount_spent: amountSpent || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllTransactions(businessId) {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data || [];
}

export async function getClientTransactions(clientId) {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data || [];
}

// ========== REWARDS / REDEMPTIONS ==========

function generateRedemptionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RDM-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createRedemption(businessId, clientId, rewardName, pointsSpent) {
  const client = await getClientById(clientId);
  if (!client || client.points_balance < pointsSpent) throw new Error('Not enough points');

  await updateClientPoints(clientId, client.points_balance - pointsSpent);

  const redemptionCode = generateRedemptionCode();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

  const { data, error } = await supabase
    .from('loyalty_redemptions')
    .insert({
      business_id: businessId,
      client_id: clientId,
      reward_name: rewardName,
      points_spent: pointsSpent,
      status: 'pending',
      redemption_code: redemptionCode,
      expires_at: expiresAt,
    })
    .select()
    .single();
  if (error) throw error;

  await addTransaction(businessId, clientId, 'redemption', -pointsSpent, `Échange: ${rewardName}`);

  return data;
}

export async function getPendingRedemptions(businessId) {
  const { data, error } = await supabase
    .from('loyalty_redemptions')
    .select('*, loyalty_clients(name, phone)')
    .eq('business_id', businessId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateRedemptionStatus(redemptionId, status) {
  const { error } = await supabase
    .from('loyalty_redemptions')
    .update({ status })
    .eq('id', redemptionId);
  if (error) throw error;
}

// ========== VALIDATE REDEMPTION CODE (admin scanner) ==========

export async function validateRedemptionCode(code) {
  const { data, error } = await supabase
    .from('loyalty_redemptions')
    .select('*, loyalty_clients(name, phone)')
    .eq('redemption_code', code)
    .eq('status', 'pending')
    .single();
  if (error || !data) return null;
  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return data;
}

export async function confirmRedemption(redemptionId) {
  const { error } = await supabase
    .from('loyalty_redemptions')
    .update({ status: 'approved' })
    .eq('id', redemptionId);
  if (error) throw error;
}

// ========== ADMIN: ADD POINTS ==========

export async function adminAddPoints(businessId, clientId, points, description, amountSpent) {
  const client = await getClientById(clientId);
  if (!client) throw new Error('Client not found');

  await supabase
    .from('loyalty_clients')
    .update({
      points_balance: client.points_balance + points,
      total_points_earned: (client.total_points_earned || 0) + points,
      visit_count: (client.visit_count || 0) + 1,
      last_visit: new Date().toISOString(),
    })
    .eq('id', clientId);
  await addTransaction(businessId, clientId, 'purchase', points, description, amountSpent);
}

// ========== REFERRALS ==========

export async function getReferrals(clientId) {
  const { data, error } = await supabase
    .from('loyalty_clients')
    .select('name, created_at')
    .eq('referred_by', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ========== HELPERS ==========

export function generateReferralCode(name) {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${clean}${rand}`;
}
