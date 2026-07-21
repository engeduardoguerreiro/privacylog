create or replace function public.enforce_one_club_ad_per_user()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.user_id is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext(new.user_id::text));

  if exists (
    select 1
      from public.ads existing_ad
      where existing_ad.user_id = new.user_id
        and existing_ad.id is distinct from new.id
  ) then
    raise exception 'Cada conta pode ter apenas um anuncio.'
      using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_one_club_ad_per_user on public.ads;
create trigger enforce_one_club_ad_per_user
before insert or update of user_id on public.ads
for each row execute function public.enforce_one_club_ad_per_user();
