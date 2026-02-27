"use client";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--separator)",
        color: "var(--text-primary)",
      }}
    />
  );
}
