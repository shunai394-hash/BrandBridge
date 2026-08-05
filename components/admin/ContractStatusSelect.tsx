"use client";

type ContractStatusSelectProps = {
  status: string;
  onChange?: (status: string) => void;
};

const statuses = [
  { value: "preparing", label: "契約準備中" },
  { value: "sent", label: "送付済み" },
  { value: "signed", label: "契約済み" },
  { value: "cancelled", label: "キャンセル" },
];

export function ContractStatusSelect({
  status,
  onChange,
}: ContractStatusSelectProps) {
  return (
    <select
      value={status}
      onChange={(e) => onChange?.(e.target.value)}
      className="rounded border px-3 py-2"
    >
      {statuses.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
