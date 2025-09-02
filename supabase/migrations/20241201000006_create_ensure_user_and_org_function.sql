-- Create ensure_user_and_org RPC function
-- This function atomically creates a user and organization, avoiding race conditions

-- Make sure we run as 'public' schema to avoid search_path surprises
create or replace function public.ensure_user_and_org(
  p_user_id uuid,
  p_email text,
  p_name text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  -- Guard: caller must be the same as p_user_id.
  -- This prevents someone creating orgs for other users.
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'unauthorized';
  end if;

  -- 1) Upsert user (id is PK)
  insert into public.users (id, email, name)
  values (p_user_id, p_email, nullif(p_name, ''))
  on conflict (id) do update
    set email = excluded.email,
        name  = coalesce(excluded.name, public.users.name);

  -- 2) If membership exists, return its org_id
  select om.org_id
    into v_org_id
  from public.org_members om
  where om.user_id = p_user_id
  limit 1;

  if v_org_id is not null then
    return v_org_id;
  end if;

  -- 3) Create org
  insert into public.orgs (name, plan)
  values (
    case
      when coalesce(nullif(p_name, ''), '') <> '' then p_name || E'''s Organization'
      else 'My Organization'
    end,
    'free'
  )
  returning id into v_org_id;

  -- 4) Create membership (unique key should be (org_id, user_id))
  insert into public.org_members (org_id, user_id, role)
  values (v_org_id, p_user_id, 'owner')
  on conflict (org_id, user_id) do nothing;

  return v_org_id;
end;
$$;

-- Lock down execution
revoke all on function public.ensure_user_and_org(uuid, text, text) from public;
grant execute on function public.ensure_user_and_org(uuid, text, text) to authenticated;
