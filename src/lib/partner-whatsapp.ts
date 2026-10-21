// The YCC Partners channel — used by the Partner Program application form
// (campus/class applicants) and, as the one deliberate exception, the
// join-to-unlock gate on the YCC Partners Box Cricket event itself. Every
// other event's WhatsApp gate uses WHATSAPP_CHANNEL_URL_OFFICIAL instead.
export const WHATSAPP_CHANNEL_URL =
  "https://whatsapp.com/channel/0029VbARGeL7j6g6nUDmly3y";

// Used by the Partner Program application form for classmate applicants.
export const WHATSAPP_CHANNEL_URL_SQUAD =
  "https://whatsapp.com/channel/0029VbB71Xb7dmegL86wxh0m";

// YCC's general/official channel — the default WhatsApp link for every
// event's join-to-unlock gate (EventRegisterCta, RegistrationSteps) except
// YCC Partners Box Cricket, which keeps WHATSAPP_CHANNEL_URL above. Same
// URL as WHATSAPP_CHANNEL_URL_SQUAD, but named for this separate purpose —
// don't conflate the two call sites, they're unrelated features that just
// happen to point at the same channel today.
export const WHATSAPP_CHANNEL_URL_OFFICIAL =
  "https://whatsapp.com/channel/0029VbB71Xb7dmegL86wxh0m";
