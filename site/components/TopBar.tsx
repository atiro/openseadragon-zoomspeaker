
interface TopBarProps {
  onSpeaking: () => void;
}

import { Speaker } from "lucide-preact";

export function TopBar({
  onSpeaking,
}: Readonly<TopBarProps>) {
  return (
    <div className="bg-gray-100 border-b border-gray-300 px-6 py-3 flex items-center gap-3">
      <button
        className="p-2 bg-green-600 hover:bg-green-700 rounded text-white transition-all flex items-center gap-2"
        onClick={onSpeaking}
        title="Speaking"
      >
        <Speaker size={16} />
      </button>
    </div>
  );
}
