import { type FC } from "react";

interface DateRangeInputProps {
  startLabel: string;
  endLabel: string;
  startName: string;
  endName: string;
  startValue: string;
  endValue: string;
  onStartChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEndChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startRequired?: boolean;
  endRequired?: boolean;
  startErrors?: string[];
  endErrors?: string[];
  minStartDate?: string;
  maxEndDate?: string;
}

const DateRangeInput: FC<DateRangeInputProps> = ({
  startLabel,
  endLabel,
  startName,
  endName,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startRequired = true,
  endRequired = false,
  startErrors,
  endErrors,
  minStartDate,
  maxEndDate,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {startLabel}
          {startRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="date"
          name={startName}
          value={startValue}
          onChange={onStartChange}
          required={startRequired}
          min={minStartDate}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            startErrors ? "border-red-500" : "border-gray-300"
          }`}
        />
        {startErrors && startErrors.length > 0 && (
          <p className="text-red-500 text-sm mt-1">{startErrors[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {endLabel}
          {endRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="date"
          name={endName}
          value={endValue}
          onChange={onEndChange}
          required={endRequired}
          min={startValue || minStartDate}
          max={maxEndDate}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            endErrors ? "border-red-500" : "border-gray-300"
          }`}
        />
        {endErrors && endErrors.length > 0 && (
          <p className="text-red-500 text-sm mt-1">{endErrors[0]}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">Leave empty for single-day event</p>
      </div>
    </div>
  );
};

export default DateRangeInput;