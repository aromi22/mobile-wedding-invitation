create extension if not exists "pgcrypto";

alter table public.invitations
add column if not exists edit_secret text;

update public.invitations
set edit_secret = encode(gen_random_bytes(24), 'hex')
where edit_secret is null;

alter table public.invitations
alter column edit_secret set not null;

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
