import { type FC } from "react";

interface MultiSelectOption {
  id: number;
  label: string;
  sublabel?: string;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  loading?: boolean;
  maxSelection?: number;
  emptyMessage?: string;
}

const MultiSelect: FC<MultiSelectProps> = ({
  label,
  options,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
  loading = false,
  maxSelection,
  emptyMessage = "No options available",
}) => {
  return (
    <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-gray-700">
          {label} ({selectedIds.length}
          {maxSelection ? `/${maxSelection}` : ''})
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading || options.length === 0}
          >
            Select All
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            disabled={selectedIds.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : options.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center p-2 hover:bg-blue-100 rounded cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={() => onToggle(option.id)}
                className="mr-3 w-4 h-4"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {option.label}
                </p>
                {option.sublabel && (
                  <p className="text-xs text-gray-500">{option.sublabel}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;