import type { PublicProfile } from "@/lib/types";

const employeeLabels: Record<string, string> = {
  "1-10": "1〜10名",
  "11-50": "11〜50名",
  "51-200": "51〜200名",
  "201+": "201名以上",
};

type TrustInfoListProps = {
  profile: PublicProfile;
};

export function TrustInfoList({ profile }: TrustInfoListProps) {
  const items: { label: string; value: string }[] = [];

  if (profile.headquarters) {
    items.push({ label: "本社所在地", value: profile.headquarters });
  }
  if (profile.foundedYear) {
    items.push({ label: "設立年", value: `${profile.foundedYear}年` });
  }
  if (profile.employeeRange) {
    items.push({
      label: "従業員規模",
      value: employeeLabels[profile.employeeRange] ?? profile.employeeRange,
    });
  }
  if (profile.corporateNumber) {
    items.push({ label: "法人番号", value: profile.corporateNumber });
  }
  if (profile.websiteUrl) {
    items.push({ label: "公式サイト", value: profile.websiteUrl });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        会社の信頼情報はまだ登録されていません。
      </p>
    );
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium text-muted">{item.label}</dt>
          <dd className="mt-1 text-sm text-navy">
            {item.label === "公式サイト" ? (
              <a
                href={item.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:underline"
              >
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
