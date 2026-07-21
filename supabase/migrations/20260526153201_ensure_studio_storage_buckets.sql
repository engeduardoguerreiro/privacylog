insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'studio-clinic-logos',
    'studio-clinic-logos',
    true,
    12582912,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'studio-clinic-photos',
    'studio-clinic-photos',
    true,
    12582912,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'studio-professional-photos',
    'studio-professional-photos',
    true,
    12582912,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'studio-status-assets',
    'studio-status-assets',
    true,
    12582912,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Studio storage public read" on storage.objects;
create policy "Studio storage public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id in (
  'studio-clinic-logos',
  'studio-clinic-photos',
  'studio-professional-photos',
  'studio-status-assets'
));

drop policy if exists "Studio owners upload own folder" on storage.objects;
create policy "Studio owners upload own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in (
    'studio-clinic-logos',
    'studio-clinic-photos',
    'studio-professional-photos',
    'studio-status-assets'
  )
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "Studio owners update own folder" on storage.objects;
create policy "Studio owners update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id in (
    'studio-clinic-logos',
    'studio-clinic-photos',
    'studio-professional-photos',
    'studio-status-assets'
  )
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
)
with check (
  bucket_id in (
    'studio-clinic-logos',
    'studio-clinic-photos',
    'studio-professional-photos',
    'studio-status-assets'
  )
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "Studio owners delete own folder" on storage.objects;
create policy "Studio owners delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id in (
    'studio-clinic-logos',
    'studio-clinic-photos',
    'studio-professional-photos',
    'studio-status-assets'
  )
  and (
    public.is_admin()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);
