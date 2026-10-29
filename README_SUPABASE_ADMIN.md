RUN LEAGUE WEBSITE - SUPABASE ADMIN VERSION

This package preserves the existing public website structure and replaces only:
1. hardcoded reviews -> Supabase reviews
2. hardcoded APK link -> Supabase site setting
3. static QR image -> QR generated from the current APK URL

GITHUB FILES TO UPLOAD/REPLACE
- index.html               REPLACE existing
- app.js                   REPLACE existing
- reviews.js               REPLACE existing
- supabase-config.js       NEW
- admin.html               NEW
- admin.js                 NEW
- admin.css                NEW

KEEP YOUR EXISTING FILES IN GITHUB
- styles.css
- images/running.jpg
- images/track_run.jpg
- images/group.jpg
- images/tournament.jpg
- images/reward.jpg
- other existing website assets

YOU NO LONGER NEED
- config.js                old backend API config
- images/qr.png            not used by the updated index.html

DO NOT UPLOAD TO GITHUB
- supabase-setup.sql       run this in Supabase SQL Editor instead

SUPABASE SETUP
1. Create a Supabase project.
2. Run supabase-setup.sql in SQL Editor.
3. Authentication -> Users -> create the System Admin account.
4. Copy its UUID and run:
   insert into public.admin_users (user_id)
   values ('PASTE_ADMIN_UUID_HERE');
5. Project Settings / API: copy Project URL and Publishable (or anon) key.
6. Put both values in supabase-config.js.
7. Upload the GitHub files listed above.
8. Open /admin.html and sign in.
9. Add reviews and set Show/Hide; update the APK URL as needed.
