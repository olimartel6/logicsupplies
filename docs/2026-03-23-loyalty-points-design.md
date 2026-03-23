# Système de Fidélité — Institut d'Épilation Laser

**Date:** 2026-03-23
**Client:** institutepilation.com (WordPress, Sainte-Foy, QC)

## Résumé

App web de fidélité intégrée au site WordPress existant. Les clients accumulent des points par achats, visites (QR code) et parrainages, échangeables contre des rabais et services gratuits.

## Authentification

- Connexion par numéro de téléphone + code SMS via Twilio
- Pas de mot de passe — le code SMS sert de vérification
- Session persistante (JWT stocké localement)

## Gains de Points

| Action | Points |
|--------|--------|
| 1$ dépensé | 10 points |
| Visite (scan QR en magasin) | 25 points |
| Parrainage (parrain + filleul) | 75 points chacun |

## Récompenses

| Points requis | Récompense |
|---------------|------------|
| 250 | 10% rabais sur un service |
| 500 | 25$ de rabais |
| 1000 | Épilation cire gratuite |
| 2000 | Séance laser gratuite |

## Architecture

### Frontend
- React SPA embarqué dans WordPress via page `/mes-points`
- Build statique (Vite) injecté dans un template WordPress
- Responsive mobile-first

### Backend
- **Supabase** : Auth (phone/OTP), PostgreSQL, Row Level Security, Edge Functions
- **Twilio** : Envoi SMS pour vérification téléphone (déjà configuré)

### Base de données (Supabase PostgreSQL)

**Tables:**
- `clients` — id, phone, name, referral_code, referred_by, points_balance, created_at
- `transactions` — id, client_id, type (purchase|visit|referral), points, amount_spent, description, created_at
- `redemptions` — id, client_id, reward_id, points_spent, status (pending|confirmed|cancelled), created_at
- `rewards` — id, name, description, points_required, type (discount_percent|discount_fixed|free_service), value, active
- `qr_scans` — id, client_id, scanned_at, location

### QR Code
- QR code unique affiché en magasin (URL avec token)
- Le client scanne avec son téléphone → ouvre l'app → points ajoutés automatiquement
- Rate limit : 1 scan par client par jour

### Parrainage
- Chaque client reçoit un lien unique (ex: institutepilation.com/mes-points?ref=ABC123)
- Quand un nouveau client s'inscrit via ce lien, les deux reçoivent 75 points
- Le lien est partageable par SMS, WhatsApp, réseaux sociaux

## Pages Client

1. **Connexion** — Saisie numéro de téléphone, vérification SMS
2. **Dashboard** — Solde de points, historique des transactions, prochaine récompense
3. **Récompenses** — Liste des récompenses disponibles, bouton "Échanger"
4. **Parrainage** — Lien unique, nombre de parrainages réussis

## Panneau Admin

- Liste des clients avec solde de points
- Scanner QR pour valider visite/achat et entrer le montant
- Ajouter/retirer points manuellement
- Gérer les récompenses (CRUD)
- Confirmer/annuler les échanges de récompenses

## Sécurité

- Row Level Security (RLS) sur toutes les tables Supabase
- Les clients ne voient que leurs propres données
- L'admin accède via un rôle Supabase séparé
- Rate limiting sur les scans QR et l'envoi de SMS
