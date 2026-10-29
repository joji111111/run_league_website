1. Create a Supabase project.
2. Run supabase-setup.sql in Supabase SQL Editor.
3. In Authentication -> Users, create the System Admin account.
4. Copy that user's UUID.
5. Run:
   insert into public.admin_users (user_id)
   values ('PASTE_ADMIN_USER_UUID_HERE');
6. In Project Settings -> API, copy the Project URL and Publishable/anon key.
7. Put them in supabase-config.js. NEVER use the service_role key in browser code.
8. Add PUBLIC_PAGE_SNIPPET.html pieces to your existing index.html.
9. Upload admin.html, admin.js, admin.css, supabase-config.js and public-content.js to your GitHub Pages repo.
10. Open /admin.html and sign in as the System Admin.
