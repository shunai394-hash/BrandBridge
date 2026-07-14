"use client";

import { FormEvent, useState, type ReactNode } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { updateCaseAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { ProductImageField } from "@/components/forms/ProductImageField";
import { caseToFormInput } from "@/lib/case-field-normalize";
import { CASE_TEXT_LIMITS } from "@/lib/case-validation";
import {
  caseCategories,
  caseRegions,
  salesFormatOptions,
  targetCountryOptions,
  type Case,
  type CaseCreateInput,
} from "@/lib/types";

const categoryOptions = caseCategories.filter((c) => c !== "縺吶∋縺ｦ");
const regionOptions = caseRegions.filter((r) => r !== "縺吶∋縺ｦ");

const selectClass =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <div>
        <h2 className="font-[family-name:var(--font-shippori)] text-lg text-navy">
          {title}
        </h2>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="-mt-2 text-xs text-muted">{children}</p>;
}

type CaseEditFormProps = {
  caseItem: Case;
};

export function CaseEditForm({ caseItem }: CaseEditFormProps) {
  const [form, setForm] = useState<CaseCreateInput>(() =>
    caseToFormInput(caseItem),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof CaseCreateInput>(
    key: K,
    value: CaseCreateInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await updateCaseAction(caseItem.id, {
        ...form,
        productImageUrl: form.productImageUrl?.trim() || null,
      });
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError(
        `譖ｴ譁ｰ蜃ｦ逅・〒繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up space-y-6">
      <Section title="蝓ｺ譛ｬ諠・ｱ">
        <Input
          label="譯井ｻｶ繧ｿ繧､繝医Ν"
          name="title"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">繧ｫ繝・ざ繝ｪ</span>
          <select
            className={selectClass}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            required
          >
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">蟇ｾ雎｡蝗ｽ繝ｻ蟶ょｴ</span>
          <select
            className={selectClass}
            value={form.targetCountry}
            onChange={(e) =>
              update(
                "targetCountry",
                e.target.value as CaseCreateInput["targetCountry"],
              )
            }
            required
          >
            {targetCountryOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">蜍滄寔繧ｨ繝ｪ繧｢・郁｣懆ｶｳ・・/span>
          <select
            className={selectClass}
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
            required
          >
            {regionOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </Section>

      <Section
        title="蝠・刀諠・ｱ"
        hint="DB縺ｮ蛟､繧偵◎縺ｮ縺ｾ縺ｾ陦ｨ遉ｺ縺励※縺・∪縺呻ｼ郁・蜍輔さ繝斐・繝ｻ閾ｪ蜍戊｣懷ｮ後↑縺暦ｼ峨ょ推谺・・蛻･蜀・ｮｹ縺ｧ蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・
      >
        <Input
          label="蝠・刀繝ｻ繝悶Λ繝ｳ繝牙錐"
          name="productName"
          required
          value={form.productName}
          onChange={(e) => update("productName", e.target.value)}
        />
        <TextArea
          label="荳隕ｧ逕ｨ繧ｵ繝槭Μ繝ｼ"
          name="summary"
          required
          rows={2}
          maxLength={CASE_TEXT_LIMITS.summary}
          value={form.summary}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="荳隕ｧ縺ｫ蜃ｺ縺咏洒縺・ｪｬ譏弱・縺ｿ"
        />
        <FieldHint>
          summary・井ｸ隕ｧ逕ｨ遏ｭ譁・・縺ｿ・峨りｩｳ邏ｰ隱ｬ譏弱ｒ縺薙％縺ｫ蜈･繧後↑縺・〒縺上□縺輔＞縲・          ・・form.summary.length}/{CASE_TEXT_LIMITS.summary}・・        </FieldHint>

        <TextArea
          label="蝠・刀迚ｹ蠕ｴ"
          name="productFeatures"
          rows={4}
          maxLength={CASE_TEXT_LIMITS.productFeatures}
          value={form.productFeatures}
          onChange={(e) => update("productFeatures", e.target.value)}
          placeholder="product_features: 蟾ｮ蛻･蛹悶・繧､繝ｳ繝医・迚ｹ蠕ｴ"
        />
        <FieldHint>
          product_features縲らｩｺ谺・・蝣ｴ蜷医・縺薙％縺ｫ迚ｹ蠕ｴ繧貞・蜉帙＠縺ｦ菫晏ｭ倥＠縺ｦ縺上□縺輔＞縲・        </FieldHint>

        <TextArea
          label="蝠・刀隱ｬ譏・
          name="description"
          required
          rows={6}
          maxLength={CASE_TEXT_LIMITS.description}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="description: 隧ｳ邏ｰ隱ｬ譏弱・縺ｿ"
        />
        <FieldHint>
          description・郁ｩｳ邏ｰ隱ｬ譏弱・縺ｿ・峨ゆｸ隕ｧ逕ｨ繧ｵ繝槭Μ繝ｼ縺ｨ縺ｯ蛻･蜀・ｮｹ縺ｫ縺励※縺上□縺輔＞縲・          ・・form.description.length}/{CASE_TEXT_LIMITS.description}・・        </FieldHint>

        <Input
          label="諠ｳ螳壻ｾ｡譬ｼ蟶ｯ"
          name="priceBand"
          value={form.priceBand}
          onChange={(e) => update("priceBand", e.target.value)}
          placeholder="萓・ 蟆丞｣ｲ 3,000縲・,000蜀・
        />
      </Section>

      <Section
        title="雋ｩ螢ｲ譚｡莉ｶ"
        hint="蜷・・岼繧貞句挨縺ｫ蜈･蜉帙＠縺ｾ縺吶ゅ∪縺ｨ繧√※1谺・↓譖ｸ縺九↑縺・〒縺上□縺輔＞縲・
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-navy">雋ｩ螢ｲ蠖｢蠑・/span>
          <select
            className={selectClass}
            value={form.salesFormat}
            onChange={(e) =>
              update(
                "salesFormat",
                e.target.value as CaseCreateInput["salesFormat"],
              )
            }
            required
          >
            {salesFormatOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-navy">迢ｬ蜊蜿ｯ蜷ｦ</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="isExclusive"
              checked={form.isExclusive}
              onChange={() => update("isExclusive", true)}
            />
            迢ｬ蜊蜿ｯ
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="isExclusive"
              checked={!form.isExclusive}
              onChange={() => update("isExclusive", false)}
            />
            髱樒峡蜊・郁､・焚繝代・繝医リ繝ｼ蜿ｯ・・          </label>
        </fieldset>

        <Input
          label="譛蟆冗匱豕ｨ謨ｰ驥・
          name="minOrder"
          value={form.minOrder}
          onChange={(e) => update("minOrder", e.target.value)}
          placeholder="萓・ 蛻晏屓 100蛟九・/ MOQ 1繧ｫ繝ｼ繝医Φ"
        />

        <Input
          label="雋ｩ螢ｲ繝√Ε繝阪Ν"
          name="partnerChannels"
          value={form.partnerChannels}
          onChange={(e) => update("partnerChannels", e.target.value)}
          placeholder="萓・ 螳溷ｺ苓・ / EC / Amazon / 蜊ｸ"
        />

        <TextArea
          label="縺昴・莉悶・蜿門ｼ墓擅莉ｶ・井ｻｻ諢擾ｼ・
          name="salesTerms"
          rows={3}
          value={form.salesTerms}
          onChange={(e) => update("salesTerms", e.target.value)}
          placeholder="繝槭・繧ｸ繝ｳ繝ｻ螂醍ｴ・悄髢薙・謾ｯ謇墓擅莉ｶ縺ｪ縺ｩ荳願ｨ倅ｻ･螟・
        />

        <TextArea
          label="繝｡繝ｼ繧ｫ繝ｼ謠蝉ｾ帶擅莉ｶ"
          name="offer"
          required
          value={form.offer}
          onChange={(e) => update("offer", e.target.value)}
          placeholder="繧ｵ繝ｳ繝励Ν謠蝉ｾ帙・雋ｩ菫・髪謠ｴ繝ｻ遐比ｿｮ縺ｪ縺ｩ"
        />
      </Section>

      <Section title="蟶梧悍繝代・繝医リ繝ｼ譚｡莉ｶ">
        <TextArea
          label="蠢・亥ｮ溽ｸｾ繝ｻ雉・ｼ繝ｻ菴灘宛"
          name="partnerRequirements"
          rows={3}
          value={form.partnerRequirements}
          onChange={(e) => update("partnerRequirements", e.target.value)}
        />
        <TextArea
          label="豎ゅａ繧九ヱ繝ｼ繝医リ繝ｼ蜒・
          name="idealPartner"
          required
          value={form.idealPartner}
          onChange={(e) => update("idealPartner", e.target.value)}
        />
      </Section>

      {error ? (
        <p
          className="whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "菫晏ｭ倅ｸｭ..." : "螟画峩繧剃ｿ晏ｭ・}
      </Button>
    </form>
  );
}


