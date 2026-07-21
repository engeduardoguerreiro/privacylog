create table if not exists public.club_favorites (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  ad_slug text not null,
  ad_id bigint,
  ad_title text,
  created_at timestamp with time zone default now(),
  unique (user_id, ad_slug)
);

create index if not exists club_favorites_user_id_idx
on public.club_favorites(user_id);

create index if not exists club_favorites_ad_slug_idx
on public.club_favorites(ad_slug);

alter table public.club_favorites enable row level security;

grant select, insert, delete on table public.club_favorites to authenticated;
grant usage, select on sequence public.club_favorites_id_seq to authenticated;

drop policy if exists "Users manage own club favorites" on public.club_favorites;
create policy "Users manage own club favorites"
on public.club_favorites
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
