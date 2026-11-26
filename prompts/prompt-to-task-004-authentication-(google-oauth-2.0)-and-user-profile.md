Read the AGENTS.md file and execute exclusively Task 004 (social authentication via Google OAuth 2.0 and a restricted user profile photo module).

Rules and scope:
- Implement the login, callback, and logout flow using Google OAuth 2.0, linking `users` and `authAccounts` while keeping secrets and tokens strictly on the server side.
- Implement the profile module (`userProfiles`) restricted to the user's profile photo; expose only the 4 specified methods, return exclusively the `publicUrl`, and ensure old files are removed from storage when replaced or deleted.
- Adhere to the modular architecture (`domain`, `application`, `infrastructure`), use pure Zod schemas, perform session and ownership (`userId`) checks, and ensure a standardized return format—`{ success, error?, data? }`—for all Server Actions.
- Work in small increments, run the linter, and do not proceed to Task 005.