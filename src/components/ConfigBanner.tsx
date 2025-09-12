import { missingEnvKeys } from "../lib/config";

export default function ConfigBanner() {
  const missing = missingEnvKeys();
  if (missing.length === 0) return null;
  
  return (
    <div className="mx-auto mt-8 max-w-xl rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">
      <h3 className="font-semibold mb-1">Configuration Required</h3>
      <p className="text-sm mb-2">Please set the following environment variables:</p>
      <ul className="list-disc ml-6 text-sm">
        {missing.map(k => <li key={k}>{k}</li>)}
      </ul>
    </div>
  );
}