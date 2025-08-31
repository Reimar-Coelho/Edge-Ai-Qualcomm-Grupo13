import { Lightbulb } from "lucide-react";
import { Button } from "./ui/button";

export function RecentInsights() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
      <h2 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Recent Insights</h2>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Lightbulb className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-gray-100 mb-2">Principais objeções identificadas</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              O cliente da reunião #123 demonstrou grande preocupação com a flexibilidade de preços.
            </p>
            <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
              Ação requerida
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}