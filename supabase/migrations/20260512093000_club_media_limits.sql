alter table public.ads
  add column if not exists stories_enabled boolean default false,
  add column if not exists stories_count integer default 0,
  add column if not exists stories_expires_at timestamp;

alter table public.ad_photos
  add column if not exists is_profile_main boolean default false;

alter table public.ad_videos
  add column if not exists duration_seconds integer;

alter table public.ad_audios
  add column if not exists duration_seconds integer;

do $$
begin
  alter table public.ad_videos
    add constraint ad_videos_duration_max_10
    check (duration_seconds is null or duration_seconds between 1 and 10);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.ad_audios
    add constraint ad_audios_duration_max_8
    check (duration_seconds is null or duration_seconds between 1 and 8);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.ads
    add constraint ads_stories_count_non_negative
    check (stories_count >= 0);
exception
  when duplicate_object then null;
end $$;

create or replace function public.enforce_club_media_limits()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  media_count integer;
begin
  if tg_table_name = 'ad_photos' then
    select count(*)
      into media_count
      from public.ad_photos
      where ad_id = new.ad_id
        and id is distinct from new.id;

    if media_count >= 6 then
      raise exception 'Cada anuncio pode ter no maximo 6 fotos.';
    end if;
  elsif tg_table_name = 'ad_videos' then
    if new.duration_seconds is not null and new.duration_seconds > 10 then
      raise exception 'Cada video pode ter no maximo 10 segundos.';
    end if;

    select count(*)
      into media_count
      from public.ad_videos
      where ad_id = new.ad_id
        and id is distinct from new.id;

    if media_count >= 3 then
      raise exception 'Cada anuncio pode ter no maximo 3 videos.';
    end if;
  elsif tg_table_name = 'ad_audios' then
    if new.duration_seconds is not null and new.duration_seconds > 8 then
      raise exception 'O audio pode ter no maximo 8 segundos.';
    end if;

    select count(*)
      into media_count
      from public.ad_audios
      where ad_id = new.ad_id
        and id is distinct from new.id;

    if media_count >= 1 then
      raise exception 'Cada anuncio pode ter no maximo 1 audio.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_club_photo_limit on public.ad_photos;
create trigger enforce_club_photo_limit
before insert or update on public.ad_photos
for each row execute function public.enforce_club_media_limits();

drop trigger if exists enforce_club_video_limit on public.ad_videos;
create trigger enforce_club_video_limit
before insert or update on public.ad_videos
for each row execute function public.enforce_club_media_limits();

drop trigger if exists enforce_club_audio_limit on public.ad_audios;
create trigger enforce_club_audio_limit
before insert or update on public.ad_audios
for each row execute function public.enforce_club_media_limits();
