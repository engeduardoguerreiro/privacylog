alter table public.ads
  add column if not exists explicit_media boolean default false,
  add column if not exists age_verification_status text default 'not_required',
  add column if not exists age_verification_provider text,
  add column if not exists age_verification_id bigint references public.age_verifications(id);

alter table public.ad_photos
  add column if not exists explicit_content boolean default false,
  add column if not exists verification_status text default 'pending';

alter table public.ad_videos
  add column if not exists explicit_content boolean default false,
  add column if not exists verification_status text default 'pending';

alter table public.age_verifications
  add column if not exists ad_id bigint references public.ads(id) on delete set null,
  add column if not exists provider_session_id text,
  add column if not exists provider_user_id text,
  add column if not exists verification_level text,
  add column if not exists document_required boolean default true,
  add column if not exists selfie_required boolean default true,
  add column if not exists liveness_required boolean default true,
  add column if not exists document_checked boolean default false,
  add column if not exists selfie_liveness_checked boolean default false,
  add column if not exists face_match_checked boolean default false,
  add column if not exists explicit_consent_at timestamp,
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists reviewed_at timestamp,
  add column if not exists rejection_reason text,
  add column if not exists expires_at timestamp;

do $$
begin
  alter table public.ads
    add constraint ads_age_verification_status_check
    check (age_verification_status in ('not_required', 'pending', 'approved', 'rejected'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.ad_photos
    add constraint ad_photos_verification_status_check
    check (verification_status in ('pending', 'approved', 'rejected'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.ad_videos
    add constraint ad_videos_verification_status_check
    check (verification_status in ('pending', 'approved', 'rejected'));
exception
  when duplicate_object then null;
end $$;

create index if not exists idx_ads_age_verification_status
  on public.ads(age_verification_status);

create index if not exists idx_age_verifications_user_status
  on public.age_verifications(user_id, status);

create index if not exists idx_age_verifications_ad_id
  on public.age_verifications(ad_id);

create or replace function public.prevent_unverified_explicit_ad_approval()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'approved'
    and coalesce(new.explicit_media, false) = true
    and new.age_verification_status <> 'approved'
  then
    raise exception 'Anuncio explicito exige verificacao de maioridade aprovada antes da publicacao.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_unverified_explicit_ad_approval on public.ads;
create trigger prevent_unverified_explicit_ad_approval
before insert or update on public.ads
for each row execute function public.prevent_unverified_explicit_ad_approval();
