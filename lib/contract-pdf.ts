import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";

type ContractPdfData = {
  maker: string;
  partner: string;

  agreed_product_name?: string | null;
  agreed_brand?: string | null;
  agreed_category?: string | null;
  agreed_sku?: string | null;

  agreed_wholesale_price?: number | null;
  agreed_currency?: string | null;

  agreed_moq?: number | null;
  agreed_order_unit?: string | null;
  agreed_annual_volume?: number | null;

  agreed_payment_terms?: string | null;
  agreed_payment_method?: string | null;
  agreed_payment_due?: string | null;

  agreed_shipping_terms?: string | null;

  agreed_exclusivity?: string | null;

  agreed_contract_period?: string | null;

  agreed_notes?: string | null;

  maker_confirmed: boolean;
  partner_confirmed: boolean;
};

export async function generateContractPdf(
  data: ContractPdfData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await fetch(
    "http://localhost:3000/fonts/NotoSansJP-Regular.ttf"
  ).then((res) => res.arrayBuffer());

  const font = await pdfDoc.embedFont(fontBytes);

  let page = pdfDoc.addPage([595, 842]);

  let y = 800;

  function draw(text: string, size = 11) {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });

    y -= size + 10;
  }

  function section(title: string) {
    y -= 10;

    draw(title, 13);

    y -= 5;
  }

  function addNewPage() {
    page = pdfDoc.addPage([595, 842]);

    y = 800;

    draw("BrandBridge", 16);
    draw("Commercial Terms Agreement", 12);

    y -= 10;
  }

  draw("BrandBridge", 18);
  draw("取引条件確認書");
  draw("Commercial Terms Agreement");

  draw(
    "本書は、以下の当事者間で合意した取引条件を確認するための書面です。"
  );

  draw(
    "This document confirms the commercial terms agreed between the parties below."
  );

  section("1. 当事者 (Parties)");

  draw(`メーカー (Manufacturer): ${data.maker}`);
  draw("会社名 (Company Name):");
  draw("国 (Country):");
  draw("担当者 (Representative):");

  draw(`販売パートナー (Sales Partner): ${data.partner}`);
  draw("会社名 (Company Name):");
  draw("国 (Country):");
  draw("担当者 (Representative):");

  section("2. 商品情報 (Product Information)");

  draw(
    `商品名 (Product Name): ${
      data.agreed_product_name ?? ""
    }`
  );

  draw(
    `ブランド (Brand): ${
      data.agreed_brand ?? ""
    }`
  );

  draw(
    `カテゴリー (Category): ${
      data.agreed_category ?? ""
    }`
  );

  draw(
    `SKU / Model: ${
      data.agreed_sku ?? ""
    }`
  );

  draw("販売地域 (Sales Territory): Japan");

  section("3. 取引条件 (Commercial Terms)");

  draw(
    `卸価格 (Wholesale Price): ${
      data.agreed_wholesale_price ?? ""
    } ${data.agreed_currency ?? ""}`
  );

  draw(
    `最低発注数量 (Minimum Order Quantity): ${
      data.agreed_moq ?? ""
    }`
  );
  draw(
    `発注単位 (Order Unit): ${
      data.agreed_order_unit ?? ""
    }`
  );

  draw(
    `希望年間発注数量 (Estimated Annual Volume): ${
      data.agreed_annual_volume ?? ""
    }`
  );

  // ここで1ページ目終了
  addNewPage();

  section("4. 支払条件 (Payment Terms)");

  draw(
    `支払条件 (Payment Terms): ${
      data.agreed_payment_terms ?? ""
    }`
  );

  draw(
    `支払方法 (Payment Method): ${
      data.agreed_payment_method ?? ""
    }`
  );

  draw(
    `支払期限 (Payment Due): ${
      data.agreed_payment_due ?? ""
    }`
  );


  section("5. 配送条件 (Shipping Terms)");

  draw(
    `配送条件 (Shipping Terms): ${
      data.agreed_shipping_terms ?? ""
    }`
  );


  section("6. 独占条件 (Exclusivity)");

  draw(
    `独占条件 (Exclusivity): ${
      data.agreed_exclusivity ?? ""
    }`
  );


  section("7. 契約期間 (Agreement Term)");

  draw(
    `契約期間 (Agreement Term): ${
      data.agreed_contract_period ?? ""
    }`
  );


  section("8. 備考 (Notes)");

  draw(
    data.agreed_notes ?? ""
  );


  section("9. 確認・署名 (Confirmation)");

draw(
  "本書に記載された取引条件を双方が確認し、合意します。"
);

draw(
  "The parties confirm and agree to the commercial terms stated in this document."
);

y -= 15;

draw("【メーカー (Manufacturer)】");

draw(
  `確認済み (Confirmed): ${
    data.maker_confirmed ? "✓" : "□"
  }`
);

draw("会社名 (Company Name):");

draw("署名者名 (Representative):");

draw("署名 (Signature):");

draw("日付 (Date):");

y -= 20;

draw("【販売パートナー (Sales Partner)】");

draw(
  `確認済み (Confirmed): ${
    data.partner_confirmed ? "✓" : "□"
  }`
);

draw("会社名 (Company Name):");

draw("署名者名 (Representative):");

draw("署名 (Signature):");

draw("日付 (Date):");

y -= 20;

const today = new Date();

  draw(
    `BrandBridge 作成日 (Created Date): ${
      today.getFullYear()
    }/${today.getMonth() + 1}/${today.getDate()}`
  );

return await pdfDoc.save();
}







