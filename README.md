# Aurore Talents

**Les talents se rencontrent. Les projets prennent leur élan.** Aurore Talents met en relation élèves, étudiants, mentors, partenaires et porteurs de projets au Burkina Faso et au-delà.

## Stack
- Vite 8 + JavaScript moderne
- Supabase Auth + PostgreSQL Data API
- RLS, contraintes et droits SQL limités aux colonnes modifiables par un utilisateur
- Vercel pour l'hébergement statique

## Développement
1. Copier `.env.example` en `.env.local`.
2. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Installer les dépendances avec `npm install`.
4. Lancer `npm run dev`; produire le site avec `npm run build`.

## Supabase
Projet : https://supabase.com/dashboard/project/lhrfsgqonclwqqvjxzht

La migration `supabase/migrations/20261017091000_initial_aurore_talents_schema.sql` met en place les profils, projets, opportunités, candidatures, demandes de mentorat et favoris. Toutes les tables publiques ont RLS. Les changements de statut de publication et de traitement restent réservés à un administrateur de confiance.

## Modération humaine
Un utilisateur peut enregistrer son profil, son projet ou une opportunité et demander une relecture via `submission_requested_at`. La soumission ne rend jamais son contenu public automatiquement.

Après vérification du contenu et de son propriétaire, un administrateur peut publier un profil ou un projet depuis l'éditeur SQL Supabase, par exemple :

```sql
update public.talent_projects
set publication_status = 'published'
where id = '<UUID_DU_PROJET>' and submission_requested_at is not null;
```

Pour un profil ou une opportunité, mettre à jour la table correspondante (`talent_profiles` ou `talent_opportunities`). Les candidatures et demandes de mentorat ne peuvent pas être acceptées ou refusées par leur auteur.

## Configuration Vercel
Variables à ajouter aux environnements Production, Preview et Development :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

N'ajoutez jamais une clé `service_role` ou une clé Supabase secrète aux variables préfixées `VITE_`.
