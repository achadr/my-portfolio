/**
 * Public contact address. Kept in its own tiny module so the server action
 * (src/actions/sendEmail.ts) and the UI share one value without pulling the
 * rest of the site content into the server bundle.
 * The form delivers to RECIPIENT_EMAIL when it is set (see .env.example).
 */
export const CONTACT_EMAIL = "bougattaya.achraf@gmail.com";
