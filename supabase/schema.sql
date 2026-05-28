create extension if not exists "pgcrypto";

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  edit_secret text,
  groom_name text not null,
  bride_name text not null,
  wedding_date date,
  wedding_time text,
  venue_name text,
  venue_address text,
  invitation_text text,
  family_info jsonb not null default '{}'::jsonb,
  design_settings jsonb not null default '{}'::jsonb,
  cover_image_url text,
  gallery_images jsonb not null default '[]'::jsonb,
  music_url text,
  qa_items jsonb not null default '[]'::jsonb,
  story_items jsonb not null default '[]'::jsonb,
  account_info jsonb not null default '[]'::jsonb,
  rsvp_enabled boolean not null default false,
  guestbook_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invitations
add column if not exists edit_secret text;

update public.invitations
set edit_secret = encode(gen_random_bytes(24), 'hex')
where edit_secret is null;

alter table public.invitations
alter column edit_secret set not null;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_invitations_updated_at on public.invitations;
create trigger set_invitations_updated_at
before update on public.invitations
for each row execute function public.set_updated_at();

alter table public.invitations enable row level security;

drop policy if exists "Anyone can read invitations" on public.invitations;
create policy "Anyone can read invitations"
on public.invitations for select
using (true);

drop policy if exists "Anyone can insert invitations" on public.invitations;
create policy "Anyone can insert invitations"
on public.invitations for insert
with check (true);

drop policy if exists "Anyone can update invitations" on public.invitations;
drop policy if exists "Update invitations with edit secret" on public.invitations;
create policy "Update invitations with edit secret"
on public.invitations for update
using (
  edit_secret = nullif(
    current_setting('request.headers', true)::json ->> 'x-edit-secret',
    ''
  )
)
with check (
  edit_secret = nullif(
    current_setting('request.headers', true)::json ->> 'x-edit-secret',
    ''
  )
);

insert into storage.buckets (id, name, public)
values ('wedding-images', 'wedding-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Anyone can read wedding images" on storage.objects;
create policy "Anyone can read wedding images"
on storage.objects for select
using (bucket_id = 'wedding-images');

drop policy if exists "Anyone can upload wedding images" on storage.objects;
create policy "Anyone can upload wedding images"
on storage.objects for insert
with check (bucket_id = 'wedding-images');

drop policy if exists "Anyone can update wedding images" on storage.objects;
create policy "Anyone can update wedding images"
on storage.objects for update
using (bucket_id = 'wedding-images')
with check (bucket_id = 'wedding-images');
