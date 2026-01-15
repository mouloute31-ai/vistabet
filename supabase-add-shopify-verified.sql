-- Ajouter la colonne shopify_verified à la table profiles
-- Exécute ce SQL dans l'éditeur SQL de Supabase

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS shopify_verified BOOLEAN DEFAULT FALSE;

-- Mettre à jour les politiques RLS si nécessaire
-- (Les utilisateurs peuvent voir leur propre statut de vérification)
