# Backend configuration

## Reminder email delivery

Reminder CRUD and in-app notifications work without mail configuration. While the signed-in app is open, the workspace checks due reminders on focus and every 30 seconds, and schedules a check for the next known notification time. Reminder sounds require browser audio to be enabled and the app to remain open; browser/OS background throttling can delay them if the device sleeps or the tab is suspended. A reminder becomes visible at its configured `remind_at` instant; reminders without a notification time appear at midnight in the user's selected timezone. To send email, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and optionally `SMTP_FROM` in the backend environment. Credentials are read by the backend only.

The reminder scheduler runs every minute in the Express process. Deploy this backend as a persistent worker/service for email delivery; a serverless function that stops between requests will not run scheduled jobs. The job claims each due reminder through its `notification_sent_at` field before sending and clears the claim after a delivery failure so it can retry.

## AI-detected expiry reminders

After OCR succeeds, the document processor looks for explicit expiry, renewal, due-date, warranty, and subscription dates in the extracted text. It creates a linked AI reminder using the user's advance-notice preference and timezone. A reminder insert/database error is reflected in document processing status and the backend log rather than silently ignored. Ambiguous numeric dates are skipped to avoid incorrect reminders.

## Reminder/settings database compatibility

This application uses signed JWTs backed by `public.users`, not Supabase Auth identities. Run `migrations/001_reminder_user_fk_compatibility.sql` after applying the reminder/settings table script so their `user_id` foreign keys match the application identity. The backend uses the private service-role key and checks the authenticated JWT user on every API query; never place that key in frontend configuration.

## Source-cited AI chat

Before deploying source-cited chat or processing new documents, open the Supabase SQL Editor for the application database and run `migrations/002_document_chunk_page_metadata.sql`. It adds a nullable `page_number` to existing `public.document_chunks`; legacy chunks remain usable and are cited without a page. Newly processed PDFs preserve the original PDF page number when creating chunks. Image-only uploads do not claim a page number.

The chat reuses `match_document_chunks`, the existing embedding model, and the saved `ai_conversations` / `ai_messages` tables. Assistant message citations and excerpts are stored in the existing `ai_messages.sources` JSON field. Source metadata is checked against the authenticated user's `public.documents` records before it is returned. Clicking a PDF citation opens its signed document URL at the cited page when the browser's PDF viewer supports page fragments.
