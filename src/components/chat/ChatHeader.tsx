import { cfg } from "../../lib/config";

export default function ChatHeader() {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white/80 backdrop-blur px-4 py-3">
      <img src={cfg.appLogo} alt="VGU" className="h-8 w-8 rounded-full object-contain" />
      <div className="font-semibold text-[#1A1A1A]">
        {cfg.appName || "VGU Blood Finder AI"}
      </div>
    </div>
  );
}