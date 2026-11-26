Read AGENTS.md and execute exclusively Task 001 (local infrastructure and project bootstrap), following the definitions in ADR-013, SPEC-013, and the templates located in docs/templates/.

Rules and scope:
- Set up and validate the local Docker environment with PostgreSQL and Garage (replacing MinIO). Do not create or use Docker images for Node.js or Nginx; Node.js should run natively on the host.
- Configure server-side environment variables using the templates provided in docs/templates/; ensure no secrets or credentials are exposed on the client side, and do not commit any sensitive values.
- Initialize/verify the Next.js project and install only the base dependencies required for this stage.
- Work in small increments, document your changes, and verify that the database and Garage are responsive before finalizing.
- Do not proceed to Task 002, and do not add any functionality outside the scope of Task 001.