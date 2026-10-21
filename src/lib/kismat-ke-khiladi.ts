// Kismat Ke Khiladi (paid, ₹99, slug "kismat-ke-khiladi") is a clone of the
// original free "Go Goa Gone" event (slug "ycc-go-goa-gone", now hidden
// from the public via is_active=false, but left otherwise untouched — it
// has 103 real registrations). Both slugs share the exact same individual
// self-registration form, receipt treatment, and "Registration Details"
// display on the event info page — every place that used to hardcode a
// single "ycc-go-goa-gone" check should check this list instead, so the
// new event gets identical treatment with zero new UI/form code.
export const KISMAT_KE_KHILADI_SLUGS = ["ycc-go-goa-gone", "kismat-ke-khiladi"] as const;

export function isKismatKeKhiladiEvent(slug: string): boolean {
  return (KISMAT_KE_KHILADI_SLUGS as readonly string[]).includes(slug);
}
