Read the AGENTS.md file and execute exclusively Task 006 (essential PoC screens and interface flows, connecting authentication, profile, lists, items, and the public view).

Rules and scope:
- Implement the essential PoC screens and flows: Google OAuth login; an authenticated area for the organizer (including profile photo, list management, a shareable link/`slug` revealed only upon clicking "share," and a dedicated items screen that hides internal or audit-related fields); and a public route for shared lists that displays only active, non-deleted, and non-expired records.
- Connect the `.tsx` components to Server Actions using the `{ success, error?, data? }` envelope, ensuring user-friendly messages without exposing internal details.
- Maintain a strict focus on the PoC (do not add out-of-scope features such as gift reservations, RSVPs, message boards, or PIX payments).
- Work in small steps, test the end-to-end flow, run the linter, and review the results.