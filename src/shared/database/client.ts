/**
 * Backwards-compatible re-export.
 * Modules that imported from "@/shared/database/client" (the Task 002 stub)
 * continue to work. Prefer importing from "@/shared/database" directly.
 */
export { db } from "./index";
