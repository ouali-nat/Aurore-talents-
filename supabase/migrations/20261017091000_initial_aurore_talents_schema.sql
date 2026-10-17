create table public.talent_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  handle text not null unique check (handle ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),
  headline text not null default '' check (char_length(headline) <= 160),
  bio text not null default '' check (char_length(bio) <= 1200),
  location text not null default '' check (char_length(location) <= 100),
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  profile_type text not null default 'student'
    check (profile_type in ('student','mentor','professional','organization')),
  publication_status text not null default 'draft'
    check (publication_status in ('draft','published','rejected','archived')),
  submission_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.talent_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.talent_profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  tagline text not null default '' check (char_length(tagline) <= 180),
  description text not null default '' check (char_length(description) <= 3000),
  category text not null default 'Projet personnel' check (char_length(category) <= 80),
  stage text not null default 'idée'
    check (stage in ('idée','prototype','en développement','en activité','recherche de soutien')),
  location text not null default '' check (char_length(location) <= 100),
  skills text[] not null default '{}',
  publication_status text not null default 'draft'
    check (publication_status in ('draft','published','rejected','archived')),
  submission_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.talent_opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.talent_profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  organization text not null check (char_length(organization) between 1 and 120),
  description text not null default '' check (char_length(description) <= 3000),
  category text not null default 'Autre' check (char_length(category) <= 80),
  opportunity_type text not null default 'mentorat'
    check (opportunity_type in ('bourse','stage','emploi','mentorat','concours','partenariat','autre')),
  location text not null default '' check (char_length(location) <= 120),
  deadline date,
  external_url text,
  publication_status text not null default 'draft'
    check (publication_status in ('draft','published','rejected','archived')),
  submission_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.talent_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.talent_profiles(id) on delete cascade,
  opportunity_id uuid not null references public.talent_opportunities(id) on delete cascade,
  motivation text not null check (char_length(motivation) between 20 and 2400),
  portfolio_url text,
  application_status text not null default 'submitted'
    check (application_status in ('submitted','reviewing','accepted','declined','withdrawn')),
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  unique (applicant_id, opportunity_id)
);

create table public.talent_mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.talent_profiles(id) on delete cascade,
  mentor_id uuid not null references public.talent_profiles(id) on delete cascade,
  message text not null check (char_length(message) between 20 and 1800),
  request_status text not null default 'submitted'
    check (request_status in ('submitted','accepted','declined','withdrawn')),
  created_at timestamptz not null default now(),
  check (mentee_id <> mentor_id)
);

create table public.talent_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.talent_profiles(id) on delete cascade,
  profile_id uuid references public.talent_profiles(id) on delete cascade,
  project_id uuid references public.talent_projects(id) on delete cascade,
  opportunity_id uuid references public.talent_opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (num_nonnulls(profile_id, project_id, opportunity_id) = 1),
  unique (user_id, profile_id),
  unique (user_id, project_id),
  unique (user_id, opportunity_id)
);

create index talent_profiles_public_idx on public.talent_profiles (created_at desc) where publication_status = 'published';
create index talent_projects_public_idx on public.talent_projects (created_at desc) where publication_status = 'published';
create index talent_opportunities_public_idx on public.talent_opportunities (deadline, created_at desc) where publication_status = 'published';
create index talent_applications_owner_idx on public.talent_applications (applicant_id, created_at desc);
create index talent_mentorship_requests_mentor_idx on public.talent_mentorship_requests (mentor_id, created_at desc);

alter table public.talent_profiles enable row level security;
alter table public.talent_projects enable row level security;
alter table public.talent_opportunities enable row level security;
alter table public.talent_applications enable row level security;
alter table public.talent_mentorship_requests enable row level security;
alter table public.talent_bookmarks enable row level security;

revoke all on public.talent_profiles, public.talent_projects, public.talent_opportunities,
  public.talent_applications, public.talent_mentorship_requests, public.talent_bookmarks
  from anon, authenticated;
grant select on public.talent_profiles, public.talent_projects, public.talent_opportunities,
  public.talent_applications, public.talent_mentorship_requests, public.talent_bookmarks
  to anon, authenticated;

grant insert (id, display_name, handle, headline, bio, location, skills, interests, profile_type, submission_requested_at)
  on public.talent_profiles to authenticated;
grant update (display_name, handle, headline, bio, location, skills, interests, profile_type, submission_requested_at, updated_at)
  on public.talent_profiles to authenticated;
grant delete on public.talent_profiles to authenticated;

grant insert (owner_id, title, tagline, description, category, stage, location, skills, submission_requested_at)
  on public.talent_projects to authenticated;
grant update (title, tagline, description, category, stage, location, skills, submission_requested_at, updated_at)
  on public.talent_projects to authenticated;
grant delete on public.talent_projects to authenticated;

grant insert (owner_id, title, organization, description, category, opportunity_type, location, deadline, external_url, submission_requested_at)
  on public.talent_opportunities to authenticated;
grant update (title, organization, description, category, opportunity_type, location, deadline, external_url, submission_requested_at, updated_at)
  on public.talent_opportunities to authenticated;
grant delete on public.talent_opportunities to authenticated;

grant insert (applicant_id, opportunity_id, motivation, portfolio_url) on public.talent_applications to authenticated;
grant update (withdrawn_at) on public.talent_applications to authenticated;
grant delete on public.talent_applications to authenticated;

grant insert (mentee_id, mentor_id, message) on public.talent_mentorship_requests to authenticated;
grant delete on public.talent_mentorship_requests to authenticated;

grant insert (user_id, profile_id, project_id, opportunity_id) on public.talent_bookmarks to authenticated;
grant delete on public.talent_bookmarks to authenticated;

create policy "Published talent profiles are public"
  on public.talent_profiles for select to anon, authenticated
  using (publication_status = 'published');
create policy "Talents read own profile"
  on public.talent_profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "Talents create own profile"
  on public.talent_profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "Talents update own profile"
  on public.talent_profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
create policy "Talents delete own profile"
  on public.talent_profiles for delete to authenticated
  using (id = (select auth.uid()));

create policy "Published projects are public"
  on public.talent_projects for select to anon, authenticated
  using (publication_status = 'published');
create policy "Owners read own projects"
  on public.talent_projects for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Owners create projects"
  on public.talent_projects for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Owners update projects"
  on public.talent_projects for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Owners delete projects"
  on public.talent_projects for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "Published open opportunities are public"
  on public.talent_opportunities for select to anon, authenticated
  using (
    publication_status = 'published'
    and (deadline is null or deadline >= current_date)
  );
create policy "Organizers read own opportunities"
  on public.talent_opportunities for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Organizers create opportunities"
  on public.talent_opportunities for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Organizers update opportunities"
  on public.talent_opportunities for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Organizers delete opportunities"
  on public.talent_opportunities for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "Applicants and organizers see applications"
  on public.talent_applications for select to authenticated
  using (
    applicant_id = (select auth.uid())
    or exists (
      select 1 from public.talent_opportunities o
      where o.id = opportunity_id and o.owner_id = (select auth.uid())
    )
  );
create policy "Apply as own profile to open opportunity"
  on public.talent_applications for insert to authenticated
  with check (
    applicant_id = (select auth.uid())
    and exists (
      select 1 from public.talent_opportunities o
      where o.id = opportunity_id
        and o.publication_status = 'published'
        and (o.deadline is null or o.deadline >= current_date)
    )
  );
create policy "Applicant withdraws own application"
  on public.talent_applications for update to authenticated
  using (applicant_id = (select auth.uid()))
  with check (applicant_id = (select auth.uid()));
create policy "Applicant deletes own application"
  on public.talent_applications for delete to authenticated
  using (applicant_id = (select auth.uid()));

create policy "Mentor and mentee see requests"
  on public.talent_mentorship_requests for select to authenticated
  using (mentee_id = (select auth.uid()) or mentor_id = (select auth.uid()));
create policy "Send request to listed mentor"
  on public.talent_mentorship_requests for insert to authenticated
  with check (
    mentee_id = (select auth.uid())
    and exists (
      select 1 from public.talent_profiles p
      where p.id = mentor_id
        and p.publication_status = 'published'
        and p.profile_type = 'mentor'
    )
  );
create policy "Request creator deletes request"
  on public.talent_mentorship_requests for delete to authenticated
  using (mentee_id = (select auth.uid()));

create policy "Users read own bookmarks"
  on public.talent_bookmarks for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users create own bookmarks"
  on public.talent_bookmarks for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      (profile_id is not null and exists (select 1 from public.talent_profiles p where p.id = profile_id and p.publication_status='published'))
      or (project_id is not null and exists (select 1 from public.talent_projects p where p.id = project_id and p.publication_status='published'))
      or (opportunity_id is not null and exists (select 1 from public.talent_opportunities o where o.id = opportunity_id and o.publication_status='published'))
    )
  );
create policy "Users delete own bookmarks"
  on public.talent_bookmarks for delete to authenticated
  using (user_id = (select auth.uid()));

comment on table public.talent_profiles is 'Profiles for Aurore Talents. publication_status is moderation-controlled.';
comment on table public.talent_projects is 'Student and professional projects. publication_status is moderation-controlled.';
comment on table public.talent_opportunities is 'Opportunities. publication_status is moderation-controlled.';
comment on table public.talent_applications is 'Applications to verified opportunities; application_status is moderation-controlled.';
comment on table public.talent_mentorship_requests is 'Requests between listed mentors and mentees.';
comment on table public.talent_bookmarks is 'Saved profiles, projects, and opportunities per user.';
