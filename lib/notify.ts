import "server-only";

// Fail-soft, same posture as the rest of this app's Supabase helpers: no
// RESEND_API_KEY / ADMIN_ALERT_EMAIL configured yet (a real account has to
// be created for this, same as Supabase and ADMIN_PASSWORD before it) means
// this silently skips sending rather than breaking registration — a missed
// email notification is not worth failing someone's sign-up over.
//
// Resend specifically (not some other provider): its free tier (3,000
// emails/month) is genuinely free indefinitely, unlike SMS APIs, which all
// charge per message with no real free tier — a hard no given this
// project's $0 budget.
export async function notifyAdmin(subject: string, message: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_ALERT_EMAIL;

  if (!apiKey || !to) {
    console.warn("[notifyAdmin] RESEND_API_KEY or ADMIN_ALERT_EMAIL not set — skipping admin alert email.");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Resend's shared sending address — works with no domain setup.
        // Swap for a verified custom domain address later if wanted.
        from: "Sri Siddhi Vinayaka <onboarding@resend.dev>",
        to,
        subject,
        text: message,
      }),
    });

    if (!response.ok) {
      console.warn("[notifyAdmin] Resend API error:", response.status, await response.text());
    }
  } catch (e) {
    console.warn("[notifyAdmin] failed to send:", (e as Error).message);
  }
}
