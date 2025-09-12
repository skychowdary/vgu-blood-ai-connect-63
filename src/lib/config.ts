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