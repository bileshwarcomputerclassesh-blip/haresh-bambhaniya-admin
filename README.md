# SHREE BILESHWER COMPUTER CLASSES — Admin Website

Gujarati admin dashboard connected to the Supabase project.

## Included
- Admin email/password login (restricted to the configured Admin Auth UID)
- Courses, Education Info, Farmer Portal, Government Job Vacancies, Information, Updates, Legal Services and Desktop Products
- Add, edit and delete records
- JPG/PNG/WebP image upload to the `class-media` Storage bucket (5 MB limit)
- Desktop order list, status updates (નવો, કન્ફર્મ, ડિલિવરીમાં, પૂર્ણ, રદ), click-to-call
- Supabase Row Level Security policies

## Publish with GitHub Pages
1. Open this repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose branch **main** and folder **/(root)**, then Save.
5. Wait for GitHub Pages to publish the site. The site URL will be shown in Settings → Pages.

## Supabase
Project URL is configured in `index.html`. The frontend uses only the publishable/anon key; never put a service-role key in browser code.
Tables and policies created in the Supabase project:
`courses`, `education_info`, `farmer_portal`, `job_vacancies`, `information`, `updates`, `legal_services`, `desktop_products`, `desktop_orders`.

The Admin Auth user must match the allowed UID configured in the dashboard and database policies. Student users must not be given that UID. For production, review Supabase Security Advisors and Auth password protection settings.
