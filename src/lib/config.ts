type Cfg = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  waCoordinator: string;
  waCommunityLink: string;
  aiChatEndpoint: string;
  adminEmail: string;
  adminPassword: string;
  appName: string;
  appLogo: string;
  tgJoinLink: string;
};

const env = import.meta.env;

export const cfg: Cfg = {
  supabaseUrl: env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || "",
  waCoordinator: env.VITE_WA_COORDINATOR || "",
  waCommunityLink: env.VITE_WA_COMMUNITY_LINK || "",
  aiChatEndpoint: env.VITE_AI_CHAT_ENDPOINT || "",
  adminEmail: env.VITE_ADMIN_EMAIL || "",
  adminPassword: env.VITE_ADMIN_PASSWORD || "",
  appName: env.VITE_APP_NAME || "VGU Blood Finder AI",
  appLogo: env.VITE_APP_LOGO || "https://codeedu.co/assets/images/vgu-logo.png",
  tgJoinLink: env.VITE_TG_JOIN_LINK || "",
};

export function missingEnvKeys(): string[] {
  const required = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_WA_COORDINATOR",
    "VITE_WA_COMMUNITY_LINK",
    "VITE_AI_CHAT_ENDPOINT",
    "VITE_ADMIN_EMAIL",
    "VITE_ADMIN_PASSWORD",
    "VITE_TG_JOIN_LINK",
  ] as const;
  return required.filter((k) => !env[k]);
}

// WhatsApp message templates
export const createDonorMessage = (name: string, bloodGroup: string, branch: string) =>
  `Hi ${name}, we need a ${bloodGroup} donor from ${branch}. Can you help? — ${cfg.appName}`;

export const createEmergencyMessage = (
  bloodGroup: string,
  units: number,
  hospital: string,
  location: string,
  contact: string
) => `🚨 EMERGENCY BLOOD REQUEST 🚨
Blood: ${bloodGroup} • Units: ${units}
Hospital: ${hospital} • ${location}
Contact: ${contact}
— Sent via ${cfg.appName}`;

export const createRegistrationShareMessage = (origin: string) =>
  `🩸 Register as a blood donor at ${origin}/register`;

// Telegram message templates
export const createTelegramEmergencyMessage = (req: {
  blood_group: string;
  units_needed: number;
  hospital?: string | null;
  location?: string | null;
  contact_phone?: string | null;
  need_by?: string | null;
  requester_name?: string | null;
}) => {
  const when = req.need_by ? new Date(req.need_by).toLocaleString() : "ASAP";
  const requester = req.requester_name ? `\n👤 <b>Requester:</b> ${req.requester_name}` : "";
  const unitsText = req.units_needed > 1 ? ` (${req.units_needed} units needed)` : "";
  const hospitalText = req.hospital ? `\n🏥 <b>Hospital:</b> ${req.hospital}` : "";
  const locationText = req.location ? `\n📍 <b>Location:</b> ${req.location}` : "";
  const contactText = req.contact_phone ? `\n📞 <b>Contact:</b> <a href="tel:${req.contact_phone}">${req.contact_phone}</a>` : "";
  const urgencyText = req.need_by ? `\n⏰ <b>Urgency:</b> ${when}` : "\n⏰ <b>Urgency:</b> IMMEDIATE";
  
  return `🩸 <b>URGENT BLOOD DONATION NEEDED</b> 🩸

🩸 <b>Blood Type Required:</b> <code>${req.blood_group}</code>${unitsText}${requester}${hospitalText}${locationText}${contactText}${urgencyText}

💝 <b>Can you help save a life?</b>
If you have ${req.blood_group} blood type and can donate, please contact immediately!

🔗 <i>Posted via VGU Blood Finder AI</i>`;
};