import { Mic, Check } from "lucide-react";

export function SetupStatus() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
      <h2 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Setup Status</h2>
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Mic className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <span className="text-gray-900 dark:text-gray-100">Microfone</span>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <Check className="w-4 h-4" />
          <span className="text-sm">Pronto</span>
        </div>
      </div>
    </div>
  );
}