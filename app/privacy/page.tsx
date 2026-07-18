import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${siteConfig.name}のプライバシーポリシーです。`,
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="プライバシーポリシー" updatedAt="2026年7月13日">
      <section className="space-y-3">
        <p>
          {siteConfig.name}
          （以下「当サービス」）は、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
        </p>
      </section>

      <section className="space-y-3">
        <h2>1. 取得する情報</h2>
        <p>当サービスは、以下の情報を取得する場合があります。</p>
        <ul>
          <li>
            アカウント情報（会社名、担当者名、メールアドレス、業種・強み等のプロフィール）
          </li>
          <li>商品情報、交渉・メッセージ、お気に入り、成約に関する情報</li>
          <li>お問い合わせ内容（氏名、メールアドレス、会社名、本文等）</li>
          <li>
            利用状況に関する情報（アクセス日時、ページ閲覧、端末・ブラウザ情報等）
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>2. 利用目的</h2>
        <ul>
          <li>アカウント登録・認証・本人確認のため</li>
          <li>マッチング、交渉、メッセージ、成約管理等の機能提供のため</li>
          <li>お問い合わせ対応、サポート、重要なお知らせの送付のため</li>
          <li>不正利用の防止、セキュリティ確保、サービス改善のため</li>
          <li>利用規約に基づく運営・手数料管理のため</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2>3. 第三者提供</h2>
        <p>
          運営は、法令に基づく場合、またはユーザーの同意がある場合を除き、個人情報を第三者に提供しません。ただし、インフラ提供事業者（例:
          ホスティング、認証・データベース）に、サービス提供に必要な範囲で預託することがあります。
        </p>
      </section>

      <section className="space-y-3">
        <h2>4. 委託</h2>
        <p>
          運営は、利用目的の達成に必要な範囲で個人情報の取扱いを委託することがあります。その場合、委託先を適切に監督します。
        </p>
      </section>

      <section className="space-y-3">
        <h2>5. 安全管理</h2>
        <p>
          運営は、個人情報の漏えい、滅失、き損を防ぐため、アクセス制御等の合理的な安全管理措置を講じます。
        </p>
      </section>

      <section className="space-y-3">
        <h2>6. Cookie等</h2>
        <p>
          当サービスは、ログイン状態の維持やセキュリティ確保のため、Cookie等を使用することがあります。ブラウザ設定によりCookieを無効化できますが、一部機能が利用できなくなる場合があります。
        </p>
      </section>

      <section className="space-y-3">
        <h2>7. 開示・訂正・削除等</h2>
        <p>
          ユーザーは、自己の個人情報について、開示・訂正・削除等を求めることができます。お問い合わせフォームよりご連絡ください。法令に基づき対応できない場合があります。
        </p>
      </section>

      <section className="space-y-3">
        <h2>8. 保管期間</h2>
        <p>
          個人情報は、利用目的の達成に必要な期間、または法令で定める期間保管し、不要となった後は適切に削除または匿名化します。
        </p>
      </section>

      <section className="space-y-3">
        <h2>9. 本ポリシーの変更</h2>
        <p>
          運営は、必要に応じて本ポリシーを変更できます。変更後の内容は、当サービス上に掲載した時点から効力を生じます。
        </p>
      </section>

      <section className="space-y-3">
        <h2>10. お問い合わせ窓口</h2>
        <p>
          個人情報の取扱いに関するお問い合わせは、お問い合わせフォームよりご連絡ください。
        </p>
      </section>
    </LegalPage>
  );
}
