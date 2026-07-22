import { Input } from "@/components/ui/Input";

type ProductVideoUrlFieldProps = {
  value: string;
  onChange: (value: string) => void;
  locale?: "ja" | "en";
  disabled?: boolean;
  name?: string;
};

export function ProductVideoUrlField({
  value,
  onChange,
  locale = "ja",
  disabled,
  name = "productVideoUrl",
}: ProductVideoUrlFieldProps) {
  const en = locale === "en";
  return (
    <div className="space-y-1.5">
      <Input
        label={
          en
            ? "Product Video URL (Optional)"
            : "商品紹介動画URL（任意）"
        }
        name={name}
        type="url"
        inputMode="url"
        autoComplete="off"
        placeholder={
          en
            ? "https://www.youtube.com/watch?v=…"
            : "https://www.youtube.com/watch?v=…"
        }
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs leading-relaxed text-muted">
        {en
          ? "You can add a product introduction video from YouTube, Vimeo, Instagram, etc."
          : "YouTube、Vimeo、Instagramなどの商品紹介動画を登録できます"}
      </p>
    </div>
  );
}
