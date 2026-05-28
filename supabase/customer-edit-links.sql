create extension if not exists "pgcrypto";

alter table public.invitations
add column if not exists edit_secret text;

alter table public.invitations
add column if not exists edit_secret_hash text;

update public.invitations
set edit_secret = encode(gen_random_bytes(24), 'hex')
where edit_secret is null;

alter table public.invitations
alter column edit_secret drop not null;

update public.invitations
set edit_secret_hash = crypt(edit_secret, gen_salt('bf'))
where edit_secret_hash is null
  and edit_secret is not null;

update public.invitations
set edit_secret = null
where edit_secret is not null;

create or replace function public.hash_invitation_edit_secret()
returns trigger as $$
begin
  if new.edit_secret is not null and new.edit_secret <> '' then
    new.edit_secret_hash = crypt(new.edit_secret, gen_salt('bf'));
    new.edit_secret = null;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists hash_invitations_edit_secret on public.invitations;
create trigger hash_invitations_edit_secret
before insert or update on public.invitations
for each row execute function public.hash_invitation_edit_secret();

drop policy if exists "Anyone can update invitations" on public.invitations;
drop policy if exists "Update invitations with edit secret" on public.invitations;

create policy "Update invitations with edit secret"
on public.invitations for update
using (
  edit_secret_hash = crypt(
    nullif(current_setting('request.headers', true)::json ->> 'x-edit-secret', ''),
    edit_secret_hash
  )
)
with check (
  edit_secret_hash = crypt(
    nullif(current_setting('request.headers', true)::json ->> 'x-edit-secret', ''),
    edit_secret_hash
  )
);
