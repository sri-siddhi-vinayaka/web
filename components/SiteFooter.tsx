export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-muted sm:px-6">
        <p>
          Want to contribute towards the celebration? Reach out on the{" "}
          <a href="/contact" className="font-medium text-primary underline underline-offset-2">
            contact page
          </a>{" "}
          for the donation coordinator&apos;s number — all contributions are
          coordinated directly, off-app.
        </p>
      </div>
    </footer>
  );
}
