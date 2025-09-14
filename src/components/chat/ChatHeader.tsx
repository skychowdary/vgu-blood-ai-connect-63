import { cfg } from "../../lib/config";

export default function ChatHeader() {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 sm:gap-3 border-b bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4">
      <img 
        src={cfg.appLogo} 
        alt="VGU" 
        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-contain flex-shrink-0" 
      />
      <div className="font-semibold text-[#1A1A1A] text-sm sm:text-base truncate">
        {cfg.appName || "VGU Blood Finder AI"}
      </div>
      <div className="ml-auto">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}