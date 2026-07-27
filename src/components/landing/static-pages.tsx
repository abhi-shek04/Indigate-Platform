"use client";

import { useApp } from "@/lib/store";
import { useT } from "@/lib/use-t";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyAvatar } from "@/components/brand/logo";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, staggerItem, slideInLeft, slideInRight, scaleIn, fadeUp, easeOutExpo } from "@/lib/motion";
import { SpotlightCard, MagneticButton, ShimmerText, TiltCard } from "@/components/brand/motion-primitives";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JobDTO } from "@/lib/types";
import {
  ArrowRight, CheckCircle2, Mail, Plane, ShieldCheck, Globe2, Briefcase, Users, TrendingUp, Heart, Building2,
  Search, FileText, MapPin, GraduationCap, Languages, Handshake, AlertTriangle, Clock, ArrowUpRight, Zap,
  ExternalLink, MessageSquare, UserCheck, BadgeCheck, ArrowDown, Sparkles, LayoutDashboard, MessageCircle,
  Banknote, Compass, PlaneTakeoff, Award, Rocket, Target, Lightbulb, BookOpen, Timer, Shield, FlaskConical,
  ChevronRight, Network, Building
} from "lucide-react";

export function StaticPage({ kind }: { kind: "privacy" | "terms" | "about" | "for-companies" | "companies" | "contact" | "how-it-works" }) {
  if (kind === "privacy") return <Privacy />;
  if (kind === "terms") return <Terms />;
  if (kind === "about") return <About />;
  if (kind === "for-companies") return <ForCompanies />;
  if (kind === "contact") return <Contact />;
  if (kind === "how-it-works") return <HowItWorks />;
  return <Companies />;
}

function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-8 space-y-6">{children}</div>
    </main>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl font-bold mt-2">{children}</h2>;
}
function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-foreground/80 leading-relaxed", className)}>{children}</p>;
}

function Privacy() {
  const { t, pick } = useT();
  return (
    <PageShell title={t("footer.privacy")} subtitle={pick("Effective Date: Jan 1, 2026", "発効日: 2026年1月1日")}>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
        {/* Meta info box */}
        <div className="space-y-1.5 rounded-xl bg-muted/40 p-4 text-sm">
          <p><span className="font-semibold">{pick("Operator:", "オペレーター：")}</span> {pick("Indobox Inc. (&ldquo;IndiGate&rdquo;)", "株式会社Indobox (&ldquo;IndiGate&rdquo;")}</p>
          <p><span className="font-semibold">{pick("Applicable Regions:", "対象地域：")}</span> {pick("Japan, India, and global users", "日本、インド、およびグローバルユーザー")}</p>
        </div>

        <H2>{pick("1. Introduction", "1. はじめに")}</H2>
        <P>
          {pick("IndiGate (\u201Cwe\u201D, \u201Cour\u201D, \u201CIndobox Group\u201D) operates cross-border HR and talent-placement services between India and Japan.", "IndiGate（以下「当社」、「私たちの」、「Indobox Group」）は、日本とインド間の国境を越えた人事・人材紹介サービスを運営しています。")}
        </P>
        <P>
          {pick("This Privacy Policy describes how we collect, use, store, transfer, and protect personal information of:", "本プライバシーポリシーでは、以下の個人情報の収集、使用、保管、転送、および保護の方法について説明します：")}
        </P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Job seekers (&ldquo;Candidates&rdquo;)", "求職者（「候補者」）")}</li>
          <li>{pick("Employers / Partner companies (&ldquo;Clients&rdquo;)", "雇用主／提携企業（「クライアント」）")}</li>
          <li>{pick("Users of our website (https://indigate.work)", "当社のウェブサイト（https://indigate.work）の利用者")}</li>
          <li>{pick("Participants in IndiGate programs, internships, interviews, or training", "IndiGateのプログラム、インターンシップ、面接、または研修の参加者")}</li>
        </ul>
        <P>{pick("This policy complies with:", "本ポリシーは、以下の基準に準拠しています：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Japan Act on the Protection of Personal Information (APPI / 個人情報保護法)", "日本の個人情報保護法（APPI／個人情報保護法）")}</li>
          <li>{pick("India Digital Personal Data Protection Act (DPDP Act, 2023)", "インドデジタル個人データ保護法（DPDP法、2023年）")}</li>
          <li>{pick("Relevant international standards for HR data management", "人事データ管理に関する関連国際基準")}</li>
        </ul>
        <P>
          {pick("By accessing or using IndiGate, you consent to the terms of this Privacy Policy.", "IndiGateにアクセスまたは使用することにより、本プライバシーポリシーの条件に同意したことになります。")}
        </P>

        <H2>{pick("2. Data Controller", "2. データ管理者")}</H2>
        <P>
          <span className="font-semibold">{pick("Primary Data Controller (Japan):", "主たるデータ管理者（日本）：")}</span>
          <br />{pick("Indobox Inc.", "Indobox株式会社")}<br />
          <br />{pick("Address: 1-2-32 Tsurumai, Showa-ku, Nagoya, Aichi, Japan", "住所：愛知県名古屋市昭和区鶴舞1-2-32")}
          <br />
          {pick("License: Employment Placement License No. 23-ユ-303072", "許可：有料職業紹介事業許可番号 23-ユ-303072")}
        </P>
        <P>
          <span className="font-semibold">{pick("Joint Data Controller (India):", "共同データ管理者（インド）：")}</span>
          <br />
          {pick("Indobox India Private Limited", "Indobox India Private Limited")}
          <br />
          {pick("Hyderabad, Telangana, India", "インド、テランガーナ州、ハイデラバード")}
        </P>
        <P>
          {pick("Both entities may process your data as part of IndiGate's cross-border HR service.", "両法人は、IndiGateの国境を越えた人事サービスの一環としてお客様のデータを処理する場合があります。")}
        </P>

        <H2>{pick("3. Information We Collect", "3. 当社が収集する情報")}</H2>
        <P className="font-semibold">{pick("3.1 Candidate Information", "3.1 候補者情報")}</P>
        <P>{pick("We may collect:", "当社は、以下の情報を収集する場合があります：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Name, gender, date of birth", "氏名、性別、生年月日")}</li>
          <li>{pick("Contact information (email, phone, address)", "連絡先（メールアドレス、電話番号、住所）")}</li>
          <li>{pick("Resume / CV (EN &amp; JP)", "履歴書／CV（英語・日本語）")}</li>
          <li>{pick("Educational background", "学歴")}</li>
          <li>{pick("Skills and certifications (JLPT, engineering skills, etc.)", "スキルおよび資格（日本語能力試験、技術スキルなど）")}</li>
          <li>{pick("Employment history", "職歴")}</li>
          <li>{pick("Nationality and visa status", "国籍およびビザの在留資格")}</li>
          <li>{pick("Interview videos, assessment results", "面接動画、評価結果")}</li>
          <li>{pick("Preferences (desired job type, location, salary)", "希望条件（希望する職種、勤務地、給与）")}</li>
          <li>{pick("Any other information required for job application", "応募に必要なその他の情報")}</li>
        </ul>
        <P className="font-semibold">{pick("3.2 Employer Information", "3.2 雇用主情報")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Company name, address, department", "会社名、住所、部署名")}</li>
          <li>{pick("Contact person details", "担当者情報")}</li>
          <li>{pick("Job descriptions, hiring requirements", "職務内容、採用要件")}</li>
          <li>{pick("Communication history with IndiGate", "IndiGateとの通信履歴")}</li>
        </ul>
        <P className="font-semibold">{pick("3.3 Website &amp; App Information", "3.3 ウェブサイトおよびアプリに関する情報")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("IP address, device information", "IPアドレス、端末情報")}</li>
          <li>{pick("Browser type, access logs", "ブラウザの種類、アクセスログ")}</li>
          <li>{pick("Form submission content", "フォーム送信内容")}</li>
          <li>{pick("Cookies (for session management only)", "クッキー（セッション管理専用）")}</li>
        </ul>

        <H2>{pick("4. Purposes of Use", "4. 利用目的")}</H2>
        <P>{pick("We use personal data for:", "当社は、個人データを以下の目的で使用します：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Recruitment and job placement activities", "採用および就職支援活動")}</li>
          <li>{pick("Matching candidates with employers", "求職者と雇用主のマッチング")}</li>
          <li>{pick("Internship management and coordination", "インターンシップの管理・調整")}</li>
          <li>{pick("Japanese language training and pre-employment programs", "日本語研修および就職準備プログラム")}</li>
          <li>{pick("Visa application support and relocation assistance", "ビザ申請のサポートおよび転居支援")}</li>
          <li>{pick("Communication with users", "ユーザーとのコミュニケーション")}</li>
          <li>{pick("Improvement of IndiGate services", "IndiGateサービスの改善")}</li>
          <li>{pick("Legal compliance and license obligations", "法令遵守およびライセンス上の義務")}</li>
          <li>{pick("Preventing fraudulent or harmful activity", "不正行為や有害な行為の防止")}</li>
        </ul>
        <P className="font-semibold">{pick("We do not sell personal data.", "当社は個人データを販売することはありません。")}</P>

        <H2>{pick("5. Legal Basis for Processing", "5. 処理の法的根拠")}</H2>
        <P>{pick("Under APPI and DPDP, IndiGate processes data under:", "APPIおよびDPDPに基づき、IndiGateは以下の条件の下でデータを処理します：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Consent of the individual", "本人の同意")}</li>
          <li>{pick("Execution of HR-related services requested by users", "ユーザーから依頼された人事関連サービスの実施")}</li>
          <li>{pick("Legal obligations (Japan employment laws)", "法的義務（日本の労働法）")}</li>
          <li>{pick("Legitimate business interests", "正当な事業上の利益")}</li>
          <li>{pick("Contractual necessity", "契約上の必要性")}</li>
        </ul>

        <H2>{pick("6. Cross-Border Data Transfer", "6. 国境を越えたデータ転送")}</H2>
        <P>
          Because IndiGate operates in Japan and India, your data may be transferred between:
        </P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Indobox Inc. (Japan)", "Indobox Inc.（日本）")}</li>
          <li>{pick("Indobox India Pvt. Ltd. (India)", "Indobox India Pvt. Ltd.（インド）")}</li>
        </ul>
        <P>
          We ensure that both entities follow strict confidentiality rules and appropriate
          security standards.
        </P>

        <H2>{pick("7. Data Retention Period", "7. データの保存期間")}</H2>
        <P>{pick("We retain personal data for:", "当社は、以下の目的で個人データを保持します：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Active candidates: up to 5 years", "有効な候補者：最長5年")}</li>
          <li>{pick("Placed candidates: 7 years (legal requirement in Japan)", "採用された候補者：7年間（日本の法的要件）")}</li>
          <li>{pick("Employer records: 7 years", "雇用主の記録：7年間")}</li>
          <li>{pick("Website logs: 1 year", "ウェブサイトのログ：1年間")}</li>
        </ul>
        <P>
          You may request deletion at any time unless legal obligations require retention.
        </P>

        <H2>{pick("8. Security Measures", "8. セキュリティ対策")}</H2>
        <P>{pick("We implement:", "当社では以下の業務を実施しています：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Access control to candidate databases", "候補者データベースへのアクセス制御")}</li>
          <li>{pick("Encryption of stored data", "保存データの暗号化")}</li>
          <li>{pick("Secure communication channels (HTTPS)", "安全な通信チャネル（HTTPS）")}</li>
          <li>{pick("Staff confidentiality agreements", "従業員の守秘義務契約")}</li>
          <li>{pick("Regular monitoring for unauthorized access", "不正アクセスに対する定期的な監視")}</li>
        </ul>

        <H2>{pick("9. Sharing of Information", "9. 情報の共有")}</H2>
        <P>{pick("We may share candidate data with:", "当社は、候補者のデータを以下の相手と共有する場合があります：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Potential employers (with consent)", "採用を検討している企業（同意を得た場合）")}</li>
          <li>{pick("Japanese and Indian authorities (for visa purposes)", "日本およびインドの当局（ビザ申請に関するもの）")}</li>
          <li>{pick("Training partners (JLPT, onboarding, etc.)", "研修パートナー（日本語能力試験、新入社員研修など）")}</li>
          <li>{pick("Background verification vendors (if required)", "身元調査業者（必要な場合）")}</li>
        </ul>
        <P>{pick("We never share data with unrelated third parties.", "当社は、関係のない第三者とは一切データを共有いたしません。")}</P>

        <H2>{pick("10. Your Rights", "10. お客様の権利")}</H2>
        <P>{pick("Candidates and employers may:", "求職者と雇用主は、以下のことができます：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Request access to their data", "自身のデータへのアクセスをリクエストする")}</li>
          <li>{pick("Correct inaccuracies", "誤りを訂正する")}</li>
          <li>{pick("Request deletion", "削除依頼")}</li>
          <li>{pick("Withdraw consent", "同意の撤回")}</li>
          <li>{pick("Request disclosure of usage purposes", "利用目的の開示請求")}</li>
          <li>{pick("File a complaint", "苦情を申し立てる")}</li>
        </ul>
        <P>
          Contact:{" "}
          <a
            href="mailto:contact@indigate.work"
            className="text-saffron hover:underline"
          >
            contact@indigate.work
          </a>
        </P>

        <H2>{pick("11. Changes to This Policy", "11. 本ポリシーの変更")}</H2>
        <P>
          We may update this policy. The latest version will always be published on our website.
        </P>
      </div>
    </PageShell>
  );
}

function Terms() {
  const { pick } = useT();
  return (
    <PageShell title={pick("Terms of Service", "利用規約")} subtitle={pick("Website Terms of Use & Service Conditions", "ウェブサイト利用規約およびサービス条件")}>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
        {/* Meta info box */}
        <div className="space-y-1.5 rounded-xl bg-muted/40 p-4 text-sm">
          <p><span className="font-semibold">{pick("Effective Date:", "施行日：")}</span> {pick("Jan 1, 2026", "2026年1月1日")}</p>
          <p><span className="font-semibold">{pick("Service Operator:", "サービス事業者：")}</span> {pick("Indobox Inc. (operating IndiGate)", "株式会社Indobox (IndiGate運営)")}</p>
        </div>

        <H2>{pick("2A. TERMS OF SERVICE — ENGLISH", "2A. 利用規約 — 英語版")}</H2>

        <H2>{pick("1. Scope", "1. 適用範囲")}</H2>
        <P>
          These Terms of Service (&ldquo;Terms&rdquo;) govern the use of the IndiGate
          website and related services operated by Indobox Inc. (&ldquo;IndiGate&rdquo;,
          &ldquo;we&rdquo;, &ldquo;our&rdquo;).
        </P>
        <P>{pick("These Terms apply to:", "本規約は、以下の対象に適用されます：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Candidates (job seekers, interns)", "応募者（求職者、インターン生）")}</li>
          <li>{pick("Employers (companies, organizations)", "雇用主（企業、団体）")}</li>
          <li>{pick("Website visitors", "ウェブサイトの訪問者")}</li>
        </ul>
        <P>{pick("By accessing or using IndiGate, you agree to these Terms.", "IndiGateにアクセスまたは利用することにより、お客様は本利用規約に同意したものとみなされます。")}</P>

        <H2>{pick("2. Nature of Service", "2. サービスの性質")}</H2>
        <P>{pick("IndiGate provides:", "IndiGateが提供するサービスは以下の通りです：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Recruitment and job-matching support", "採用および就職マッチング支援")}</li>
          <li>{pick("Internship coordination", "インターンシップの調整")}</li>
          <li>{pick("Japanese language and cultural training", "日本語・日本文化研修")}</li>
          <li>{pick("Visa and relocation guidance", "ビザおよび転居に関するガイダンス")}</li>
          <li>{pick("Post-arrival follow-up support", "到着後のフォローアップ支援")}</li>
        </ul>
        <P>
          IndiGate does not guarantee job placement, employment, or visa approval.
        </P>

        <H2>{pick("3. Candidate Obligations", "3. 候補者の義務")}</H2>
        <P>{pick("Candidates agree to:", "候補者は、以下の事項に同意するものとします：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Provide accurate and truthful information", "正確かつ真実の情報を提供してください")}</li>
          <li>{pick("Submit authentic resumes and documents", "正確な履歴書および書類を提出してください")}</li>
          <li>{pick("Comply with interview and selection rules", "面接および選考に関する規則を遵守すること")}</li>
          <li>{pick("Respect Japanese workplace norms and laws", "日本の職場における慣習や法律を尊重する")}</li>
          <li>{pick("Notify IndiGate of changes in availability or status", "在庫状況やステータスの変更については、IndiGateに通知してください")}</li>
        </ul>
        <P>
          False information may result in removal from the platform.
        </P>

        <H2>{pick("4. Employer Obligations", "4. 雇用主の義務")}</H2>
        <P>{pick("Employers agree to:", "雇用主は、以下の事項に同意する：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Provide accurate job descriptions and conditions", "正確な職務内容と勤務条件を提示する")}</li>
          <li>{pick("Comply with Japanese labour and immigration laws", "日本の労働法および入国管理法を遵守する")}</li>
          <li>{pick("Use candidate information solely for recruitment purposes", "候補者の情報は、採用目的のみに使用してください")}</li>
          <li>{pick("Maintain confidentiality of candidate data", "候補者のデータの機密性を保持する")}</li>
        </ul>

        <H2>{pick("5. Fees", "5. 手数料")}</H2>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("IndiGate does not charge candidates for job placement.", "IndiGateは、求職者に対して就職斡旋手数料を請求することはありません。")}</li>
          <li>{pick("Employers are charged fees based on agreed contracts or quotations.", "雇用主には、合意された契約または見積書に基づき手数料が請求されます。")}</li>
          <li>{pick("Fees are subject to refund policies as separately agreed.", "手数料については、別途合意された返金規定が適用されます。")}</li>
        </ul>

        <H2>{pick("6. Intellectual Property", "6. 知的財産")}</H2>
        <P>
          All website content, logos, text, and materials belong to Indobox Inc.
        </P>
        <P>{pick("Unauthorized reproduction or use is prohibited.", "無断での複製・使用を禁じます。")}</P>

        <H2>{pick("7. Limitation of Liability", "7. 責任の制限")}</H2>
        <P>{pick("IndiGate is not liable for:", "IndiGateは、以下の事項について責任を負いません：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Employment decisions made by companies", "企業による採用決定")}</li>
          <li>{pick("Candidate performance after hiring", "採用後の候補者のパフォーマンス")}</li>
          <li>{pick("Visa rejection or delays", "ビザの不許可または審査の遅延")}</li>
          <li>{pick("Losses caused by inaccurate information provided by users", "ユーザーによる不正確な情報の提供に起因する損害")}</li>
        </ul>

        <H2>{pick("8. Suspension or Termination", "8. 利用停止または解約")}</H2>
        <P>{pick("IndiGate may suspend or terminate access if users:", "IndiGateは、ユーザーが以下の行為を行った場合、アクセスを一時停止または終了することがあります：")}</P>
        <ul className="list-disc pl-6 text-foreground/80 leading-relaxed space-y-1">
          <li>{pick("Violate laws or these Terms", "法律または本規約に違反すること")}</li>
          <li>{pick("Provide false information", "虚偽の情報を提供する")}</li>
          <li>{pick("Engage in fraudulent or harmful activity", "詐欺的または有害な行為を行う")}</li>
        </ul>

        <H2>{pick("9. Governing Law and Jurisdiction", "9. 準拠法および管轄裁判所")}</H2>
        <P>{pick("These Terms are governed by Japanese law.", "本規約は、日本法に準拠するものとします。")}</P>
        <P>
          All disputes shall be resolved under the exclusive jurisdiction of Japanese courts.
        </P>

        <H2>{pick("10. Contact", "10. お問い合わせ")}</H2>
        <P>
          For questions regarding these Terms:
        </P>
        <P>
          <a
            href="mailto:contact@indigate.work"
            className="text-saffron hover:underline"
          >
            contact@indigate.work
          </a>
        </P>
      </div>
    </PageShell>
  );
}

function About() {
  const navigate = useApp((s) => s.navigate);
  const { pick } = useT();

  return (
    <div className="overflow-hidden">

    {/* ══════════════════════════════════════════════════════
        SECTION 1 — HERO
        Clean, centered, and premium layout for the story.
    ══════════════════════════════════════════════════════ */}
    <section className="relative bg-background overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-saffron/15 to-saffron/5 border border-saffron/20 px-6 py-16 sm:py-24 sm:px-12 shadow-sm">
          {/* Subtle overlay texture */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.4]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          
          <RevealGroup stagger={0.1} delayChildren={0.05} className="relative z-10">
            {/* Eyebrow */}
            <motion.div variants={staggerItem} className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-white/60 backdrop-blur-md px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-saffron mb-8 shadow-sm">
              <Globe2 className="h-3 w-3" />
              {pick("The IndiGate Story", "IndiGateのストーリー")}
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={staggerItem} className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.06] text-foreground mx-auto max-w-4xl">
              {pick("Building the bridge", "架け橋を築く")}
              <br />
              <span className="text-gradient-brand">{pick("India × Japan", "インド × 日本")}</span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={staggerItem} className="mt-6 text-[15.5px] sm:text-[17px] text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {pick(
                "IndiGate is operated by Indobox Inc. — a cross-border HR and talent-placement company born from the belief that collaboration between India and Japan creates unprecedented value.",
                "IndiGateは、インドと日本のコラボレーションがかつてない価値を生み出すという信念から生まれた、クロスボーダーHR・人材紹介企業であるIndobox Inc.によって運営されています。"
              )}
            </motion.p>
          </RevealGroup>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        SECTION 2 — MISSION · VISION · VALUES
        Three distinct premium cards, each with personality.
    ══════════════════════════════════════════════════════ */}
    <section className="py-20 sm:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variants={fadeUp}>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-saffron/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-saffron mb-4">
              <Sparkles className="h-3 w-3" />
              {pick("Our Foundation", "私たちの基盤")}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              {pick("What we stand for", "私たちが大切にしていること")}
            </h2>
            <div className="section-rule mt-4 max-w-xs mx-auto" />
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {/* MISSION */}
          <Reveal variants={fadeUp} delay={0}>
            <SpotlightCard className="card-premium relative h-full p-6 overflow-hidden">
              <div aria-hidden className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-saffron via-saffron/60 to-transparent" />
              <div className="grid place-items-center h-11 w-11 rounded-xl bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/20 mb-4">
                <Target className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-saffron mb-2">Mission</p>
              <p className="font-display font-bold text-[17px] leading-snug">
                {pick(
                  "Make India's diversity an essential element of business.",
                  "インドの多様性をビジネスの不可欠な要素にする。"
                )}
              </p>
            </SpotlightCard>
          </Reveal>

          {/* VISION */}
          <Reveal variants={fadeUp} delay={0.08}>
            <SpotlightCard className="card-premium relative h-full p-6 overflow-hidden">
              <div aria-hidden className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-crimson via-crimson/60 to-transparent" />
              <div className="grid place-items-center h-11 w-11 rounded-xl bg-crimson/10 text-crimson ring-1 ring-inset ring-crimson/20 mb-4">
                <Lightbulb className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-crimson mb-2">Vision</p>
              <p className="font-display font-bold text-[17px] leading-snug">
                {pick(
                  "Through the fusion of Japan and India, turn what doesn't exist yet into what does. Energize both nations.",
                  "日本とインドの融合により、まだ存在しないものを形にする。両国を活性化する。"
                )}
              </p>
            </SpotlightCard>
          </Reveal>

          {/* VALUES */}
          <Reveal variants={fadeUp} delay={0.16}>
            <SpotlightCard className="card-premium relative h-full p-6 overflow-hidden">
              <div aria-hidden className="absolute top-0 inset-x-0 h-[2px] bg-brand-gradient" />
              <div className="grid place-items-center h-11 w-11 rounded-xl bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/20 mb-4">
                <Rocket className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-saffron mb-3">Core Values</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  pick("Be creators", "創造者であれ"),
                  pick("Pursue fusion", "融合を追求する"),
                  pick("Anticipate & act", "先読みして行動する"),
                  pick("Embrace change", "変化を受け入れる"),
                  pick("Challenge & profit", "挑戦して利益を生む"),
                  pick("Pioneers of diversity", "多様性のパイオニア"),
                ].map((v) => (
                  <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-border/70 bg-muted/60 text-foreground/80 hover:border-saffron/30 hover:bg-saffron/5 hover:text-saffron transition-colors cursor-default">
                    <span className="h-1 w-1 rounded-full bg-saffron/60 flex-shrink-0" />
                    {v}
                  </span>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        SECTION 3 — WHY INDIAN TALENT (dark alternating)
        B2B sales argument. Leader names as proof points.
    ══════════════════════════════════════════════════════ */}
    <section className="py-20 sm:py-24 bg-card/40 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <Reveal variants={fadeUp}>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-saffron/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-saffron mb-5">
                <TrendingUp className="h-3 w-3" />
                Why Indian talent — right now?
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-5">
                To compete globally, you need{" "}
                <span className="text-gradient-brand">world-class talent.</span>
              </h2>
              <p className="text-[14.5px] text-muted-foreground leading-relaxed mb-6">
                We built IndiGate because we believe hiring from India isn't just an alternative—it is a competitive necessity. The world's most innovative tech giants recognize that Indian engineers bring unparalleled technical depth, adaptability, and a relentless drive to build. If Japanese companies want to win on the global stage, they must tap into this exact same talent pool.
              </p>
              {/* Global leader chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { name: "Sundar Pichai", co: "Google CEO" },
                  { name: "Satya Nadella", co: "Microsoft CEO" },
                  { name: "Arvind Krishna", co: "IBM CEO" },
                  { name: "Neal Mohan", co: "YouTube CEO" },
                  { name: "Leena Nair", co: "Chanel CEO" },
                ].map((l) => (
                  <div key={l.name} className="rounded-xl border border-border bg-card px-3 py-2">
                    <p className="text-[12.5px] font-semibold leading-none">{l.name}</p>
                    <p className="text-[10.5px] text-saffron font-medium mt-0.5">{l.co}</p>
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                In Japan too: the CEO of Kameda Seika (Lekh Raj Juneja) and the CTO of
                Fujitsu (Vivek Mahajan) are Indian nationals leading at the highest level.
              </p>
            </div>
          </Reveal>

          {/* Right: IIT stat cards */}
          <Reveal variants={fadeUp} delay={0.12}>
            <div>
              {/* IIT header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="grid place-items-center h-12 w-12 rounded-xl bg-brand-gradient text-white shadow-glow-brand">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display font-bold text-[16px]">Indian Institutes of Technology</p>
                  <p className="text-[12px] text-muted-foreground">Est. 1951 · 23 campuses · World-class</p>
                </div>
              </div>
              {/* 4 stat cards in 2x2 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { value: "1–1.6%", label: "Acceptance rate", sub: "World's most selective" },
                  { value: "~70", label: "Unicorns", sub: "With IIT co-founders" },
                  { value: "Top 4", label: "Globally", sub: "In unicorn-producing alumni" },
                  { value: "~20%", label: "Work overseas", sub: "Building global companies" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="card-premium p-4 text-center relative overflow-hidden"
                  >
                    <span aria-hidden className="absolute inset-x-0 top-0 h-[1.5px] bg-brand-gradient opacity-60" />
                    <p className="metric-num text-gradient-brand text-[1.5rem]">{s.value}</p>
                    <p className="text-[12px] font-semibold mt-1">{s.label}</p>
                    <p className="text-[10.5px] text-muted-foreground mt-0.5">{s.sub}</p>
                  </motion.div>
                ))}
              </div>
              {/* Tier 2 highlight */}
              <div className="rounded-xl border border-saffron/25 bg-saffron/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid place-items-center h-8 w-8 rounded-lg bg-saffron/15 text-saffron shrink-0">
                    <Network className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[13.5px]">Tier 2 Universities — Our Strength</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">
                      Beyond IITs, India&apos;s Tier 2 universities are rising globally.
                      Indobox has built deep partnerships here — these students are highly
                      motivated to work in Japan and are enthusiastic Japanese language
                      learners.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        SECTION 4 — FOUR HIRING PATTERNS
        Icon-first cards. Each pattern is distinct visually.
    ══════════════════════════════════════════════════════ */}
    <section className="py-20 sm:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variants={fadeUp}>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-saffron/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-saffron mb-4">
              <Handshake className="h-3 w-3" />
              Hiring Patterns
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Four ways to hire —{" "}
              <span className="text-gradient-brand">we match the right one</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-[14.5px]">
              Every company is different. We align the hiring pattern to your business
              model, budget, and timeline.
            </p>
            <div className="section-rule mt-4 max-w-xs mx-auto" />
          </div>
        </Reveal>

        <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" stagger={0.08}>
          {[
            {
              icon: BookOpen,
              step: "01",
              title: "Internship",
              badge: "3rd–4th year",
              color: "sky",
              desc: "University students in their 3rd–4th year. High energy, fresh perspective — often leading directly to full-time offers.",
            },
            {
              icon: GraduationCap,
              step: "02",
              title: "New Graduate",
              badge: "Conditional offer",
              color: "saffron",
              desc: "Offers as early as 3rd year, conditioned on requirements like JLPT N4 by graduation. Lock in talent early.",
            },
            {
              icon: Briefcase,
              step: "03",
              title: "Experienced Hire",
              badge: "Mid-career",
              color: "violet",
              desc: "Mid-career professionals from our wide network. Deep skills, immediate contribution, training as needed.",
            },
            {
              icon: Timer,
              step: "04",
              title: "Japan Resident",
              badge: "1–2 months",
              color: "emerald",
              desc: "Indian nationals already in Japan — studying, working, or between roles. Fastest path to onboarding.",
            },
          ].map((p, i) => {
            const colorMap: Record<string, string> = {
              sky: "bg-sky-400/10 text-sky-400 ring-sky-400/20",
              saffron: "bg-saffron/10 text-saffron ring-saffron/20",
              violet: "bg-violet-400/10 text-violet-400 ring-violet-400/20",
              emerald: "bg-emerald-400/10 text-emerald-400 ring-emerald-400/20",
            };
            const badgeMap: Record<string, string> = {
              sky: "bg-sky-400/10 text-sky-400 border-sky-400/20",
              saffron: "bg-saffron/10 text-saffron border-saffron/20",
              violet: "bg-violet-400/10 text-violet-400 border-violet-400/20",
              emerald: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
            };
            return (
              <motion.div key={i} variants={staggerItem}>
                <SpotlightCard className="card-premium relative h-full p-5 overflow-hidden group">
                  {/* Step watermark */}
                  <span aria-hidden className="absolute top-3 right-4 font-display text-6xl font-extrabold text-foreground/[0.035] select-none leading-none">
                    {p.step}
                  </span>
                  {/* Icon */}
                  <div className={`grid place-items-center h-11 w-11 rounded-xl ring-1 ring-inset mb-4 ${colorMap[p.color]}`}>
                    <p.icon className="h-5 w-5" />
                  </div>
                  {/* Badge */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border mb-2 ${badgeMap[p.color]}`}>
                    {p.badge}
                  </span>
                  <h3 className="font-display font-bold text-[15px] mb-2">{p.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{p.desc}</p>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        SECTION 5 — INDOBOX ACADEMY
        Replaces fake data with actual Indobox Academy details.
    ══════════════════════════════════════════════════════ */}
    <section className="py-20 sm:py-24 bg-sidebar text-sidebar-foreground overflow-hidden relative">
      <div aria-hidden className="absolute inset-0 bg-mesh opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal variants={fadeUp}>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-saffron mb-5">
                <GraduationCap className="h-3 w-3" />
                {pick("Indobox Academy", "Indobox Academy")}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-sidebar-foreground mb-5">
                {pick(
                  "Immersive language training, built for business",
                  "ビジネスのために構築された没入型語学トレーニング"
                )}
              </h2>
              <p className="text-[14.5px] text-sidebar-foreground/70 leading-relaxed mb-6">
                {pick(
                  "Through Indobox Academy, we provide dedicated Japanese language and business etiquette training. Our certified instructors prepare candidates not just to pass exams, but to thrive in Japanese corporate environments.",
                  "Indobox Academyを通じて、専任の日本語およびビジネスマナー研修を提供しています。認定講師は、試験合格だけでなく、日本の企業環境で活躍できるよう候補者を育成します。"
                )}
              </p>
              
              <ul className="space-y-3 mb-8 text-[13.5px] text-sidebar-foreground/80">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                  <span>JLPT N5 to N3 curriculum tailored for engineers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                  <span>Practical business etiquette and cultural immersion</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                  <span>Online and offline classes at partner universities</span>
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal variants={fadeUp} delay={0.12} className="h-full flex items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 group w-full aspect-[4/3] lg:aspect-[16/10] shadow-2xl max-h-[450px]">
              <div className="absolute inset-0 bg-brand-gradient opacity-15 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-500 z-10 pointer-events-none" />
              <img 
                src="/images/indobox-academy.png" 
                alt="Indobox Academy Classroom Training" 
                className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        SECTION 6 — THREE HURDLES (problem → solution)
        Honest acknowledgement + Indobox's answer.
    ══════════════════════════════════════════════════════ */}
    <section className="py-20 sm:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variants={fadeUp}>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-saffron/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-saffron mb-4">
              <Shield className="h-3 w-3" />
              Common Concerns
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Three hurdles — and how{" "}
              <span className="text-gradient-brand">we solve them</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-[14.5px]">
              International hiring is complex. We&apos;ve designed every part of our
              process to address these challenges head-on.
            </p>
            <div className="section-rule mt-4 max-w-xs mx-auto" />
          </div>
        </Reveal>

        <RevealGroup className="grid md:grid-cols-3 gap-5" stagger={0.1}>
          {[
            {
              num: "01",
              problem: "Language Barrier",
              solution: "JLPT N5–N3 education online and at partner schools. Candidates arrive ready to communicate.",
              problemIcon: "🚧",
              solutionIcon: Languages,
            },
            {
              num: "02",
              problem: "Cultural Differences",
              solution: "Japanese culture and business-etiquette training by certified professionals. Both sides learn.",
              problemIcon: "🌐",
              solutionIcon: Globe2,
            },
            {
              num: "03",
              problem: "Internal Readiness",
              solution: "Working-with-Indians training using proven methods from companies already successfully doing it.",
              problemIcon: "🏢",
              solutionIcon: UserCheck,
            },
          ].map((h, i) => (
            <motion.div key={i} variants={staggerItem}>
              <div className="card-premium relative h-full overflow-hidden">
                {/* Top: problem */}
                <div className="p-5 border-b border-border/60 bg-destructive/[0.03]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{h.problemIcon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-destructive/70">
                      Challenge {h.num}
                    </span>
                  </div>
                  <p className="font-display font-bold text-[15px] text-foreground/90">{h.problem}</p>
                </div>
                {/* Bottom: solution */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="grid place-items-center h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-500">
                      <h.solutionIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                      Indobox Solution
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{h.solution}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>

    {/* ══════════════════════════════════════════════════════
        SECTION 7 — FINAL CTA
        Two paths: candidates + companies.
    ══════════════════════════════════════════════════════ */}
    <section className="py-20 sm:py-24 bg-card/40 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variants={scaleIn}>
          <div className="relative rounded-3xl bg-sidebar text-sidebar-foreground overflow-hidden px-8 py-16 sm:px-16 sm:py-20">
            {/* Backgrounds */}
            <div aria-hidden className="absolute inset-0 bg-mesh opacity-50" />
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-12 left-1/3 h-40 w-40 rounded-full bg-saffron/25 blur-3xl animate-aurora" />
              <div className="absolute -bottom-8 right-1/4 h-56 w-56 rounded-full bg-crimson/20 blur-3xl animate-aurora" style={{ animationDelay: "4s" }} />
            </div>
            <div aria-hidden className="absolute inset-0 opacity-[2_0.04]"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

            <div className="relative text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/70 mb-6">
                <Handshake className="h-3 w-3" />
                Get Started
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Ready to build the bridge?
              </h2>
              <p className="mt-4 text-white/65 text-[15px] leading-relaxed max-w-lg mx-auto">
                Whether you&apos;re a candidate looking for your Japan career, or a company
                ready to hire India&apos;s finest — IndiGate is your starting point.
              </p>

              {/* Two CTA cards */}
              <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
                {/* Candidate CTA */}
                <button
                  onClick={() => navigate("register")}
                  className="group rounded-2xl border border-white/15 bg-white/8 hover:bg-saffron/15 hover:border-saffron/30 p-5 text-left transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="grid place-items-center h-10 w-10 rounded-xl bg-saffron/20 text-saffron">
                      <Users className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-saffron opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="font-display font-bold text-[15px] text-white mb-1">I&apos;m a Candidate</p>
                  <p className="text-[12.5px] text-white/55 leading-relaxed">
                    Find visa-sponsored roles at Japan&apos;s top tech companies.
                  </p>
                </button>

                {/* Company CTA */}
                <button
                  onClick={() => navigate("for-companies")}
                  className="group rounded-2xl border border-white/15 bg-white/8 hover:bg-crimson/10 hover:border-crimson/25 p-5 text-left transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="grid place-items-center h-10 w-10 rounded-xl bg-crimson/20 text-crimson">
                      <Building className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-crimson opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="font-display font-bold text-[15px] text-white mb-1">I&apos;m Hiring</p>
                  <p className="text-[12.5px] text-white/55 leading-relaxed">
                    Post roles and access pre-vetted Indian engineers — free.
                  </p>
                </button>
              </div>

              {/* Contact line */}
              <p className="mt-8 text-[12px] text-white/40">
                Questions?{" "}
                <button
                  onClick={() => navigate("contact")}
                  className="text-saffron hover:underline font-medium"
                >
                  Talk to our team →
                </button>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    </div>
  );
}

export function ForCompanies() {
  const { pick } = useT();
  const navigate = useApp((s) => s.navigate);
  return (
    <main className="overflow-hidden">

{/* ── HERO ─────────────────────────────────────────────────────── */}
<section className="relative bg-mesh overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-28">
  {/* Aurora blobs */}
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-saffron/20 blur-3xl animate-aurora" />
    <div className="absolute top-20 -right-20 h-96 w-96 rounded-full bg-crimson/15 blur-3xl animate-aurora" style={{ animationDelay: "2s" }} />
    <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-saffron/10 blur-3xl animate-aurora" style={{ animationDelay: "4s" }} />
  </div>
  {/* Fine grid overlay */}
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
    style={{ backgroundImage: "linear-gradient(to right,color-mix(in oklch,var(--foreground) 10%,transparent) 1px,transparent 1px),linear-gradient(to bottom,color-mix(in oklch,var(--foreground) 10%,transparent) 1px,transparent 1px)", backgroundSize: "48px 48px" }}
  />

  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

      {/* LEFT — copy */}
      <RevealGroup stagger={0.1} delayChildren={0.05} className="text-center lg:text-left">
        {/* Eyebrow */}
        <motion.div variants={staggerItem} className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-4 py-1.5 text-sm font-semibold text-crimson shadow-premium">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75 animate-ping-soft" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron" />
          </span>{pick("For Japanese Companies", "日本企業向け")}</motion.div>

        {/* Headline */}
        <motion.h1 variants={staggerItem} className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08]">
          Hire India&apos;s best,{" "}
          <span className="text-gradient-brand">{pick("the right way", "正しい方法")}</span>
        </motion.h1>

        {/* Sub */}
        <motion.p variants={staggerItem} className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">{pick("Access pre-screened Indian engineers, designers, and analysts — with bilingual support and full visa guidance. Posting is ", "事前に審査済みのインド人エンジニア、デザイナー、アナリストにアクセスできます。バイリンガルのサポートとビザ取得に関する包括的なガイダンスも提供されます。求人掲載は")}<span className="font-semibold text-foreground">{pick("completely free.", "完全無料です。")}</span>
        </motion.p>

        {/* Trust pills */}
        <motion.div variants={staggerItem} className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2">
          {[
            { label: pick("Free to post", "投稿は無料です"), icon: CheckCircle2, color: "emerald" },
            { label: pick("Approved in 1 business day", "1営業日以内に承認されます"), icon: Clock, color: "saffron" },
            { label: pick("Bilingual team", "バイリンガルチーム"), icon: Globe2, color: "sky" },
          ].map((p) => (
            <span key={p.label} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
              <p.icon className={`h-3.5 w-3.5 text-${p.color === "emerald" ? "emerald-500" : p.color === "saffron" ? "saffron" : "sky-400"}`} />
              {p.label}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={staggerItem} className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
          <MagneticButton
            onClick={() => navigate("register")}
            className="bg-brand-gradient text-white hover:opacity-90 font-bold text-sm h-12 px-7 rounded-xl shadow-glow-brand inline-flex items-center gap-2 cursor-pointer"
          >
            <Briefcase className="h-4 w-4" />{pick("Post your first job", "最初の求人を掲載する")}<ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton
            onClick={() => navigate("contact")}
            className="bg-background border-2 border-border hover:border-saffron/50 hover:bg-saffron/5 font-semibold text-sm h-12 px-7 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <MessageCircle className="h-4 w-4 text-saffron" />{pick("Talk to our team", "弊社チームまでお問い合わせください")}</MagneticButton>
        </motion.div>
      </RevealGroup>

      {/* RIGHT — interactive matching UI mockup */}
      <Reveal variants={slideInRight} delay={0.2}>
        <TiltCard max={4} className="relative">
          <div className="card-premium rounded-3xl p-6 relative overflow-hidden">
            <div aria-hidden className="absolute inset-0 bg-mesh opacity-30" />
            <div aria-hidden className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-crimson/15 blur-3xl" />
            <div aria-hidden className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-saffron/20 blur-3xl" />

            {/* Card header */}
            <div className="relative flex items-center justify-between mb-5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-saffron" />{pick("Curated Match", "厳選マッチ")}</span>
              <span className="text-[11px] font-bold text-muted-foreground/50">{pick("Live", "ライブ")}</span>
            </div>

            {/* Matching flow */}
            <div className="relative space-y-3">
              {/* Your requirement */}
              <div className="rounded-xl border border-border bg-background/80 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">{pick("Your Requirement", "お客様のご要望")}</p>
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-lg bg-saffron/10 text-saffron ring-1 ring-saffron/20">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm">{pick("Senior Full-Stack · Tokyo", "シニア・フルスタックエンジニア · 東京")}</p>
                    <p className="text-xs text-muted-foreground">{pick("React + Node.js · JLPT N2+", "React + Node.js · 日本語能力試験N2以上")}</p>
                  </div>
                </div>
              </div>

              {/* Arrow connector */}
              <div className="flex items-center justify-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-saffron/40 to-transparent" />
                <motion.div animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="grid place-items-center h-7 w-7 rounded-full bg-brand-gradient text-white shadow-glow-brand">
                  <ArrowDown className="h-3.5 w-3.5" />
                </motion.div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
              </div>

              {/* IndiGate talent card */}
              <SpotlightCard className="rounded-xl border border-saffron/30 bg-saffron/5 p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-saffron/70">{pick("IndiGate Talent", "IndiGate Talent")}</p>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{pick("98% Match", "98%の一致")}</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="grid place-items-center h-10 w-10 rounded-full bg-brand-gradient text-white text-sm font-bold ring-2 ring-background shadow-glow-brand">A</div>
                  <div>
                    <p className="font-display font-bold text-sm">{pick("Arjun Sharma", "アルジュン・シャルマ")}</p>
                    <p className="text-xs text-muted-foreground">{pick("Pre-vetted · Relocation Ready", "事前審査済み・転居準備完了")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Tech Screened", "JLPT N2", "Cultural Fit"].map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-saffron/10 text-saffron border border-saffron/20">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </div>

            {/* Bottom stat row */}
            <div className="relative mt-5 pt-4 border-t border-border/60 grid grid-cols-3 gap-2">
              {[
                { label: pick("Avg time", "平均時間"), value: "Weeks" },
                { label: pick("To post", "投稿するには"), value: "¥0" },
                { label: pick("Approval", "承認"), value: "1-day" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display font-extrabold text-sm text-gradient-brand">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </TiltCard>
      </Reveal>

    </div>
  </div>
</section>

{/* ── STATS STRIP ──────────────────────────────────────────────── */}
<Reveal variants={fadeUp} delay={0.1}>
  <div className="border-y border-border bg-card/50 backdrop-blur-sm">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
        {[
          { value: "¥0", label: pick("Cost to post jobs", "求人掲載費用"), sub: "Always free", icon: Banknote },
          { value: "1 day", label: pick("Account approval", "アカウントの承認"), sub: "Business day", icon: Clock },
          { value: "2 wks", label: pick("Avg time to hire", "採用までの平均所要時間"), sub: "vs industry 12 wks", icon: TrendingUp },
          { value: "100%", label: pick("Visa-supported roles", "ビザの支援が必要な職種"), sub: "End-to-end guidance", icon: ShieldCheck },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ backgroundColor: "color-mix(in oklch, var(--saffron) 4%, transparent)" }}
            className="flex items-center gap-4 px-6 py-6 sm:py-8 transition-colors">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/15 shrink-0">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-extrabold tracking-tight text-gradient-brand">{s.value}</p>
              <p className="text-xs font-semibold text-foreground">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
</Reveal>

{/* ── BENTO FEATURES ───────────────────────────────────────────── */}
<section className="relative py-20 sm:py-24 bg-background overflow-hidden">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <Reveal variants={fadeUp}>
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-crimson">
          <Award className="h-3 w-3" />{pick("Why companies choose IndiGate", "企業がIndiGateを選ぶ理由")}</span>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          Velocity & Quality —{" "}
          <span className="text-gradient-brand">{pick("built in", "内蔵")}</span>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-base">{pick("A curated funnel that dramatically accelerates your pipeline compared to traditional agencies — without sacrificing quality.", "従来の代理店と比較して、品質を損なうことなく、パイプラインを劇的に加速させる、厳選されたファネルです。")}</p>
        <div className="section-rule mt-5 max-w-xs mx-auto" />
      </div>
    </Reveal>

    {/* BENTO GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-auto">

      {/* Card 1: Speed comparison — LARGE (spans 2 cols on lg) */}
      <Reveal variants={fadeUp} delay={0} className="lg:col-span-2">
        <SpotlightCard className="card-premium relative h-full p-7 sm:p-8 overflow-hidden">
          <div aria-hidden className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-saffron/10 blur-3xl" />
          <div className="relative flex items-start gap-4 mb-6">
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-brand-gradient text-white shadow-glow-brand shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">{pick("Accelerated Hiring Pipeline", "採用プロセスの迅速化")}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{pick("Our curated funnel vs traditional agencies — the difference is measurable.", "当社が厳選したファネルと従来型代理店――その違いは数値で実証可能です。")}</p>
            </div>
          </div>
          {/* Comparison bars */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{pick("Traditional Agency", "従来型代理店")}</span>
                <span className="text-xs font-bold text-muted-foreground">{pick("~12 weeks", "約12週間")}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <motion.div className="h-full rounded-full bg-muted-foreground/40" initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 1.2, ease: easeOutExpo }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-saffron uppercase tracking-wide">{pick("IndiGate", "IndiGate")}</span>
                <span className="text-xs font-bold text-saffron">{pick("~2 weeks", "約2週間")}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-saffron/10 overflow-hidden">
                <motion.div className="h-full rounded-full bg-brand-gradient shadow-glow-brand" initial={{ width: 0 }} whileInView={{ width: "17%" }} viewport={{ once: true }} transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.2 }} />
              </div>
            </div>
          </div>
          {/* Verification checklist */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            {["Technical Interview", "JLPT N2 Certification", "Background Check", "Resume Formatting"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[12.5px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </Reveal>

      {/* Card 2: Bilingual */}
      <Reveal variants={fadeUp} delay={0.08}>
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="card-premium relative h-full p-6 overflow-hidden">
          <div aria-hidden className="absolute top-0 right-0 font-display text-8xl font-extrabold text-saffron/5 select-none leading-none pr-3 pt-1">日</div>
          <div className="relative">
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/15 mb-4">
              <Globe2 className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold">{pick("Bilingual Pipeline", "バイリンガル人材育成プログラム")}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{pick("Review candidates in Japanese or English. Post jobs in both languages effortlessly.", "日本語または英語で候補者を審査できます。両言語で求人情報を簡単に掲載できます。")}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-saffron/25 bg-saffron/8 px-4 py-2.5">
              <span className="font-display text-xl font-extrabold text-saffron">日本語</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-display text-xl font-extrabold text-crimson">{pick("English", "英語")}</span>
            </div>
          </div>
        </motion.div>
      </Reveal>

      {/* Card 3: Visa-ready */}
      <Reveal variants={fadeUp} delay={0.12}>
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="card-premium relative h-full p-6 overflow-hidden">
          <div className="grid place-items-center h-11 w-11 rounded-xl bg-crimson/10 text-crimson ring-1 ring-inset ring-crimson/15 mb-4">
            <Plane className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-bold">{pick("Visa-Ready", "ビザ取得準備完了")}</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{pick("We guide you and the candidate through Certificate of Eligibility and seamless relocation to Japan.", "弊社では、お客様および候補者の皆様に対し、在留資格認定証明書の取得から日本へのスムーズな移住に至るまで、全面的にサポートいたします。")}</p>
          <div className="mt-4 space-y-1.5">
            {["COE Application", "Housing guidance", "Pre-departure prep"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-crimson/60 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </Reveal>

      {/* Card 4: Kanban pipeline preview */}
      <Reveal variants={fadeUp} delay={0.16}>
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="card-premium relative h-full p-6 overflow-hidden">
          <div className="grid place-items-center h-11 w-11 rounded-xl bg-saffron/10 text-saffron ring-1 ring-inset ring-saffron/15 mb-4">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-bold">{pick("Manage Applicants", "応募者の管理")}</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{pick("A clean kanban pipeline built into your dashboard.", "ダッシュボードに組み込まれた、すっきりとしたカンバンパイプライン。")}</p>
          {/* Mini kanban visual */}
          <div className="mt-4 flex gap-1.5 overflow-hidden">
            {[
              { label: pick("Applied", "応用"), color: "bg-sky-500/20 text-sky-400", n: 3 },
              { label: pick("Shortlisted", "最終選考に残った"), color: "bg-saffron/20 text-saffron", n: 1 },
              { label: pick("Offered", "提供中"), color: "bg-emerald-500/20 text-emerald-400", n: 1 },
            ].map((col) => (
              <div key={col.label} className="flex-1 rounded-lg border border-border/60 p-2">
                <p className={`text-[9px] font-bold uppercase tracking-wide mb-1.5 ${col.color.split(" ")[1]}`}>{col.label}</p>
                {Array.from({ length: col.n }).map((_, i) => (
                  <div key={i} className="h-5 rounded mb-1 bg-muted/60 last:mb-0" />
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </Reveal>

      {/* Card 5: Human support — FULL WIDTH */}
      <Reveal variants={fadeUp} delay={0.2} className="md:col-span-2 lg:col-span-3">
        <SpotlightCard className="card-premium relative p-7 sm:p-8 overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-mesh opacity-20" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0 grid place-items-center h-14 w-14 rounded-2xl bg-brand-gradient text-white shadow-glow-brand">
              <Heart className="h-7 w-7" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-display text-xl font-bold">{pick("Human Support — End to End", "ヒューマン・サポート — エンド・トゥ・エンド")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-2xl">{pick("The Indobox team supports both you and the candidate throughout the entire process — from the first interview to the candidate's first day in Japan. A real person, not a chatbot.", "Indoboxチームは、最初の面接から候補者の日本での初出勤日まで、プロセス全体を通じて、皆様と候補者の双方をサポートいたします。チャットボットではなく、生身の人間が対応いたします。")}</p>
            </div>
            <MagneticButton
              onClick={() => navigate("contact")}
              className="shrink-0 bg-brand-gradient text-white hover:opacity-90 font-semibold text-sm h-11 px-6 rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-glow-brand"
            >{pick("Talk to our team", "弊社チームまでお問い合わせください")}<ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </SpotlightCard>
      </Reveal>

    </div>
  </div>
</section>

{/* ── HOW IT WORKS FOR COMPANIES (4-step timeline) ─────────────── */}
<section className="relative py-20 sm:py-24 bg-card/30 border-y border-border overflow-hidden">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <Reveal variants={fadeUp}>
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-crimson">
          <Compass className="h-3 w-3" />{pick("Process", "プロセス")}</span>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          From post to hire —{" "}
          <span className="text-gradient-brand">{pick("in days", "日数で")}</span>
        </h2>
        <div className="section-rule mt-5 max-w-xs mx-auto" />
      </div>
    </Reveal>

    <div className="relative">
      {/* Horizontal connector */}
      <div aria-hidden className="hidden lg:block absolute top-[2.75rem] left-[12.5%] right-[12.5%] h-px">
        <div className="h-full bg-gradient-to-r from-saffron/20 via-saffron/50 to-crimson/30" />
        <motion.div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-brand-gradient shadow-glow-brand"
          animate={{ left: ["0%", "100%"] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative" stagger={0.12}>
        {[
          { icon: Building2, step: "01", title: pick("Create account", "アカウント作成"), desc: pick("Register your company. Our team reviews and approves within 1 business day.", "法人登録を行います。弊社チームが1営業日以内に審査・承認を行います。") },
          { icon: FileText, step: "02", title: pick("Post your role", "求人の掲載"), desc: pick("Write your job description (or use our AI writer). Post in Japanese or English — free.", "求人票を作成します（AIアシスタントも利用可能）。日本語または英語で無料で掲載できます。") },
          { icon: Users, step: "03", title: pick("Review matches", "候補者の確認"), desc: pick("AI-ranked candidates land in your dashboard. Pre-screened, JLPT-verified, resume-ready.", "AIが評価した候補者がダッシュボードに届きます。事前審査済み、JLPT確認済み、履歴書完備。") },
          { icon: PlaneTakeoff, step: "04", title: pick("Hire & onboard", "採用と受け入れ"), desc: pick("We handle visa, COE, relocation coordination, and pre-departure briefing.", "ビザ取得、在留資格認定証明書（COE）、渡航手続き、出発前オリエンテーションまで、弊社が代行します。") },
        ].map((s, i) => (
          <motion.div key={i} variants={staggerItem}>
            <SpotlightCard className="card-premium relative h-full p-6 overflow-hidden text-center">
              <span className="absolute top-4 right-5 font-display text-5xl font-extrabold text-saffron/[0.07] select-none">{s.step}</span>
              <motion.div whileHover={{ rotate: [0, -6, 6, 0], scale: 1.06 }} transition={{ duration: 0.5 }}
                className="grid place-items-center h-12 w-12 rounded-full bg-brand-gradient text-white shadow-glow-brand ring-4 ring-background mx-auto mb-4">
                <s.icon className="h-5 w-5" />
              </motion.div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-saffron mb-2">{pick("Step ", "ステップ ")}{s.step}</p>
              <h3 className="font-display text-base font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </RevealGroup>
    </div>
  </div>
</section>

{/* ── FINAL CTA ────────────────────────────────────────────────── */}
<section className="relative py-20 sm:py-24 bg-background">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <Reveal variants={scaleIn}>
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-black px-8 py-16 sm:px-16 sm:py-20 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 group">
        {/* Background treatment */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-mesh opacity-60 mix-blend-screen" />
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute top-0 left-1/4 h-40 w-40 rounded-full bg-saffron/30 blur-3xl animate-aurora" />
          <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-crimson/30 blur-3xl animate-aurora" style={{ animationDelay: "3s" }} />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative max-w-2xl mx-auto">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/80 mb-6">
            <ShieldCheck className="h-3 w-3" />{pick("Verified by Indobox", "Indoboxによる認証済み")}</span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {pick("Ready to hire top Indian talent?", "インドの優秀な人材を採用する準備はできましたか？")}
          </h2>
          <p className="mt-4 text-white/80 text-lg leading-relaxed">{pick("Create your company account — it takes 2 minutes. Our team reviews and approves within 1 business day.", "法人アカウントを作成しましょう。所要時間はわずか2分です。弊社チームが1営業日以内に審査・承認を行います。")}</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <MagneticButton
              onClick={() => navigate("register")}
              className="bg-white text-crimson hover:bg-white/90 font-bold text-base h-12 px-8 rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Building2 className="h-4 w-4" />
              {pick("Get started — it's free", "無料で始める")}
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton
              onClick={() => navigate("contact")}
              className="bg-white/10 border border-white/20 hover:bg-white/15 text-white font-semibold text-base h-12 px-8 rounded-xl inline-flex items-center gap-2 cursor-pointer"
            >{pick("Talk to our team", "弊社チームまでお問い合わせください")}</MagneticButton>
          </div>
          {/* Trust indicators */}
          <p className="mt-6 text-xs text-white/50 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-3 w-3" />{pick("No credit card · No setup fee · Approved in 1 business day", "クレジットカード不要・初期費用なし・1営業日以内に審査完了")}</p>
        </div>
      </div>
    </Reveal>
  </div>
</section>

</main>

  );
}

function Companies() {
  const { t, locale, pick } = useT();
  const navigate = useApp((s) => s.navigate);
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  useEffect(() => {
    api<{ jobs: JobDTO[] }>("/api/jobs?limit=50").then((r) => setJobs(r.jobs)).catch(() => {});
  }, []);

  // group by company
  const companies = Array.from(
    new Map(jobs.map((j) => [j.company.id, j.company])).values(),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Premium Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 relative">
        <div aria-hidden className="absolute -top-10 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full bg-saffron/20 blur-[50px]" />
        <RevealGroup stagger={0.12}>
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-crimson mb-6">
            <Building2 className="h-3.5 w-3.5" />
            {locale === "ja" ? "提携企業" : "Partner Companies"}
          </motion.div>
          <motion.h1 variants={staggerItem} className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 text-gradient-brand leading-tight">
            {t("companies.title")}
          </motion.h1>
          <motion.p variants={staggerItem} className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {t("companies.subtitle")}
          </motion.p>
        </RevealGroup>
      </div>

      <RevealGroup stagger={0.1} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((c) => {
          const count = jobs.filter((j) => j.companyId === c.id).length;
          return (
            <motion.div key={c.id} variants={fadeUp}>
              <SpotlightCard className="card-premium h-full p-7 flex flex-col group relative overflow-hidden">
                {/* Subtle gradient hover wash */}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-saffron/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex items-center gap-4 mb-6">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-brand-gradient rounded-full blur-md opacity-20 group-hover:opacity-50 transition-opacity" />
                    <CompanyAvatar name={c.companyName} color={c.logoUrl} size={64} className="relative ring-4 ring-background shadow-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-lg truncate group-hover:text-saffron transition-colors">
                      {c.companyName}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate mt-1">
                      {c.industry}
                      {c.locationJapan ? ` · ${c.locationJapan}` : ""}
                    </p>
                  </div>
                </div>
                
                {c.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6 flex-1">
                    {c.description}
                  </p>
                )}
                
                <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-saffron/10 px-2.5 py-1 text-xs font-bold text-saffron border border-saffron/20">
                    <Briefcase className="h-3 w-3" />
                    {count} {count === 1 ? "job" : "jobs"}
                  </div>
                  <MagneticButton
                    onClick={() => navigate("jobs")}
                    className="text-xs font-bold text-foreground hover:text-crimson transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {t("common.viewall")} <ArrowUpRight className="h-3 w-3" />
                  </MagneticButton>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </RevealGroup>

      {companies.length === 0 && (
        <Reveal variants={fadeUp} className="mt-10 rounded-3xl border-2 border-dashed border-border py-20 text-center bg-card/30">
          <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-semibold text-lg">{pick("No companies yet.", "まだ登録されている企業はありません。")}</p>
        </Reveal>
      )}
    </main>
  );
}

function Contact() {
  const { t, pick } = useT();
  const navigate = useApp((s) => s.navigate);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success(t("contact.success"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* ===================== 1. PAGE HERO ===================== */}
      <section className="relative overflow-hidden rounded-3xl mb-12 bg-sidebar text-sidebar-foreground px-8 py-12 sm:px-12 sm:py-16">
        
        {/* Aurora blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-saffron/25 blur-3xl animate-aurora" />
          <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-crimson/20 blur-3xl animate-aurora" 
              style={{ animationDelay: "3s" }} />
        </div>
        {/* Fine grid */}
        <div aria-hidden className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }} />

        <div className="relative grid sm:grid-cols-2 gap-8 items-center">
          {/* Left: text */}
          <Reveal variants={slideInLeft}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 mb-4">
              <Mail className="h-3 w-3" />{pick("Contact", "お問い合わせ")}</div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {t("contact.title")}
            </h1>
            <p className="mt-3 text-white/70 leading-relaxed">
              {t("contact.subtitle")}
            </p>
          </Reveal>

          {/* Right: 3 response-promise chips stacked */}
          <Reveal variants={slideInRight}>
            <div className="space-y-3">
              {[
                { icon: Clock,       label: pick("Response within 24 hours", "24時間以内にご返信いたします"), sub: "Monday – Friday, IST business hours" },
                { icon: MessageSquare, label: pick("Bilingual team", "バイリンガルチーム"), sub: "We reply in English or Japanese" },
                { icon: UserCheck,  label: pick("Routed to the right person", "適切な担当者に転送されました"), sub: "Hiring, visa, or general enquiries" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 rounded-2xl bg-white/8 border border-white/12 px-5 py-4 backdrop-blur-sm">
                  <div className="grid place-items-center h-10 w-10 rounded-xl bg-saffron/20 border border-saffron/30 text-saffron shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-white/55 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== LAYOUT WRAPPER ===================== */}
      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-start">
        
        {/* ===================== 2. OFFICE CARDS ===================== */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-8 lg:mb-0">
          
          {/* Japan office — crimson identity */}
          <div className="relative overflow-hidden rounded-2xl border border-crimson/20 bg-card p-6">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-crimson/60 via-crimson to-crimson/60 rounded-t-[inherit]" />
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🇯🇵</span>
              <div>
                <p className="font-display font-bold text-sm text-crimson uppercase tracking-wide">{pick("Japan Office", "日本事務所")}</p>
                <p className="text-xs text-muted-foreground">{pick("Est. May 2023", "2023年5月")}</p>
              </div>
            </div>
            <p className="font-semibold text-sm">{pick("Indobox Inc.", "Indobox株式会社")}</p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              1-2-32 Tsurumai, Showa-ku,<br />
              Nagoya, Aichi 466-0064, Japan
            </p>
            <div className="mt-3 pt-3 border-t border-border/60">
              <p className="text-[11px] text-muted-foreground/70 font-mono tracking-tight">
                Employment Placement License<br />
                No.: 23-ユ-303072
              </p>
            </div>
            <a href="https://maps.google.com/?q=1-2-32+Tsurumai+Nagoya" target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-crimson hover:underline">
              View on map <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* India office — saffron identity */}
          <div className="relative overflow-hidden rounded-2xl border border-saffron/20 bg-card p-6">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-saffron/60 via-saffron to-saffron/60 rounded-t-[inherit]" />
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🇮🇳</span>
              <div>
                <p className="font-display font-bold text-sm text-saffron uppercase tracking-wide">{pick("India Office", "インド事務所")}</p>
                <p className="text-xs text-muted-foreground">{pick("Est. Dec 2024", "2024年12月設立予定")}</p>
              </div>
            </div>
            <p className="font-semibold text-sm">{pick("Indobox India Pvt. Ltd.", pick("Indobox India Pvt. Ltd.", "Indobox India Pvt. Ltd."))}</p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              T-Hub, Raidurg, HiTec City,<br />
              Hyderabad, 500081, Telangana
            </p>
            <div className="mt-3 pt-3 border-t border-border/60">
              <a href="mailto:contact@indigate.work" className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron hover:underline">
                <Mail className="h-3.5 w-3.5" />
                contact@indigate.work
              </a>
            </div>
            <a href="https://maps.google.com/?q=T-Hub+Hyderabad" target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-saffron hover:underline">
              View on map <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* ===================== 3. FORM CARD & 4. SUCCESS STATE ===================== */}
        <div>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="card-premium p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
                className="mx-auto mb-5 grid place-items-center h-20 w-20 rounded-3xl bg-brand-gradient shadow-glow-brand"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>
              
              <h3 className="font-display font-bold text-xl">{pick("Message sent!", "メッセージが送信されました！")}</h3>
              <p className="mt-2 text-muted-foreground text-sm max-w-xs mx-auto">
                {t("contact.success")} We'll get back to you within 24 hours.
              </p>
              
              <div className="mt-6 rounded-xl bg-saffron/5 border border-saffron/20 p-4 text-left">
                <p className="text-xs font-semibold text-saffron uppercase tracking-wide mb-2">{pick("What happens next", "これからどうなるのか")}</p>
                <ul className="space-y-1.5">
                  {["Your message goes to the right specialist.",
                    "We reply within 1 business day.",
                    "If urgent, email contact@indigate.work directly."]
                    .map((line) => (
                    <li key={line} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-saffron mt-0.5">→</span>{line}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button variant="outline" className="mt-6 border-saffron/30 hover:border-saffron/60"
                onClick={() => { setSent(false); navigate("home"); }}>
                Back to home
              </Button>
            </motion.div>
          ) : (
            <div className="card-premium p-6 sm:p-8">
              <div className="mb-6 pb-5 border-b border-border">
                <h2 className="font-display font-bold text-lg">{pick("Send us a message", "メッセージをお送りください")}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  For hiring consultation, visa questions, or partnership enquiries.
                  We read every message.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block mb-1.5">
                    <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      {t("contact.name")}
                    </span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron/50 placeholder:text-muted-foreground/40 transition-shadow"
                      placeholder={pick("Your name", "お名前")}
                    />
                  </label>
                  <label className="block mb-1.5">
                    <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                      {t("contact.email")}
                    </span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron/50 placeholder:text-muted-foreground/40 transition-shadow"
                      placeholder={pick("you@example.com", pick("you@example.com", "you@example.com"))}
                    />
                  </label>
                </div>
                <label className="block mb-1.5">
                  <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    {t("contact.subject")}
                  </span>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron/50 placeholder:text-muted-foreground/40 transition-shadow"
                    placeholder={pick("How can we help?", "何かお手伝いできることはありますか？")}
                  />
                </label>
                <label className="block mb-1.5">
                  <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    {t("contact.message")}
                  </span>
                  <textarea
                    required
                    minLength={10}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={6}
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron/50 placeholder:text-muted-foreground/40 resize-none transition-shadow"
                    placeholder={pick("Tell us a bit about what you need...", "ご要望について、少しお聞かせください…")}
                  />
                </label>
                
                <MagneticButton
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-gradient text-white hover:opacity-90 font-semibold h-12 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-glow-brand"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      {t("contact.submit")}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </MagneticButton>

                <div className="mt-5 pt-5 border-t border-border/60 grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: MessageSquare, step: "1", label: pick("We read your message", "メッセージを拝見しました") },
                    { icon: UserCheck,     step: "2", label: pick("Routed to a specialist", "専門医に紹介された") },
                    { icon: Zap,           step: "3", label: pick("Reply within 24 hours", "24時間以内に返信してください") },
                  ].map((s) => (
                    <div key={s.step}>
                      <div className="mx-auto mb-1.5 grid place-items-center h-8 w-8 rounded-full bg-saffron/10 text-saffron">
                        <s.icon className="h-4 w-4" />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function HowItWorks() {
  const { pick } = useT();
  const navigate = useApp((s) => s.navigate);
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8
        py-12 sm:py-16">

      {/* ─── 1. HERO ─────────────────────────────────────── */}
      <Reveal variants={fadeUp}
        className="relative overflow-hidden rounded-3xl
            bg-mesh text-center px-6 py-12 sm:px-10 sm:py-16 mb-12">

        {/* Aurora blobs */}
        <div aria-hidden
          className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -left-16 h-56 w-56
              rounded-full bg-saffron/20 blur-3xl animate-aurora" />
          <div className="absolute -bottom-16 -right-16 h-64 w-64
              rounded-full bg-crimson/12 blur-3xl animate-aurora"
              style={{ animationDelay: "3s" }} />
        </div>
        {/* Fine grid */}
        <div aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right,currentColor 1px,transparent 1px)," +
              "linear-gradient(to bottom,currentColor 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }} />

        <div className="relative max-w-2xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full
              border border-saffron/30 bg-background/60
              backdrop-blur-sm px-3.5 py-1.5
              text-xs font-bold uppercase tracking-[0.14em]
              text-crimson mb-5">
            <Plane className="h-3 w-3" />
            How It Works
          </div>

          <h1 className="font-display text-3xl sm:text-5xl
              font-extrabold tracking-tight text-gradient-brand
              leading-tight">
            Your path from India to Japan
          </h1>
          <div className="section-divider mt-4 mb-4 mx-auto" />
          <p className="mt-3 text-muted-foreground
              text-sm sm:text-base leading-relaxed">
            From browsing jobs to landing in Tokyo —
            IndiGate handles every step of the journey.
          </p>

          {/* ── JOURNEY TRACKER ── */}
          {/*
            CRITICAL LAYOUT NOTE:
            This tracker must stay on ONE horizontal row on all
            viewports ≥ 360px. Use min-w-0 and overflow-x-auto on
            the wrapper. Never let items wrap to a second line.
            Each stage: fixed width, centered content.
          */}
          <div className="mt-8 overflow-x-auto -mx-2 px-2">
            <div className="flex items-center min-w-[340px]
                mx-auto max-w-lg">

              {/* 🇮🇳 India */}
              <div className="flex flex-col items-center shrink-0 w-10">
                <span className="text-2xl leading-none">🇮🇳</span>
                <span className="text-[10px] font-bold
                    text-muted-foreground mt-1 whitespace-nowrap">{pick("India", "インド")}</span>
              </div>

              {/* Connector + Stages */}
              {[
                { num: "1", label: pick("Profile", "プロフィール"),   filled: true  },
                { num: "2", label: pick("Applied", "応用"),   filled: true  },
                { num: "3", label: pick("Interview", "インタビュー"), filled: true  },
                { num: "4", label: pick("Offered", "提供中"),   filled: true  },
              ].map((stage, i) => (
                <div key={i}
                  className="flex items-center flex-1 min-w-0">

                  {/* Line before stage */}
                  <div className={`flex-1 h-[2px] ${
                    stage.filled
                      ? "bg-brand-gradient"
                      : "bg-border"
                  }`} />

                  {/* Stage node */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`
                      grid place-items-center h-8 w-8 rounded-full
                      ring-2 ring-background text-xs font-extrabold
                      font-display transition-all
                      ${stage.filled
                        ? "bg-brand-gradient text-white shadow-glow-brand"
                        : "bg-muted text-muted-foreground"
                      }
                    `}>
                      {stage.num}
                    </div>
                    <span className={`
                      text-[10px] font-semibold mt-1
                      whitespace-nowrap leading-none
                      ${stage.filled
                        ? "text-saffron"
                        : "text-muted-foreground/60"
                      }
                    `}>
                      {stage.label}
                    </span>
                  </div>
                </div>
              ))}

              {/* Final connector */}
              <div className="flex-1 h-[2px] bg-border min-w-[8px]" />

              {/* 🇯🇵 Japan */}
              <div className="flex flex-col items-center shrink-0 w-10">
                <span className="text-2xl leading-none">🇯🇵</span>
                <span className="text-[10px] font-bold
                    text-muted-foreground mt-1 whitespace-nowrap">{pick("Japan", "日本")}</span>
              </div>
            </div>
          </div>
          {/* End journey tracker */}

        </div>
      </Reveal>

      {/* ─── 2. THREE STEPS ──────────────────────────────── */}
      <RevealGroup
        className="grid gap-6 md:grid-cols-3 relative"
        stagger={0.13}
        delayChildren={0.05}>

        {[
          {
            step: "01",
            icon: FileText,
            accent: "saffron" as const,
            title: pick("Browse & Apply", "閲覧・応募"),
            desc: pick("Every job on IndiGate is from a vetted Japanese employer with visa sponsorship. Filter by JLPT level, location, salary, and role type to find your perfect match.", "IndiGateに掲載されている求人はすべて、審査済みの日本の雇用主によるもので、ビザのスポンサーシップが付いています。JLPTのレベル、勤務地、給与、職種で絞り込み、あなたにぴったりの仕事を見つけてください。"),
            cta: {
              label: pick("Browse Jobs", "求人情報を閲覧する"),
              icon: Briefcase,
              onClick: () => navigate("jobs"),
            },
            extra: null,
          },
          {
            step: "02",
            icon: Search,
            accent: "saffron" as const,
            title: pick("Build Your Profile", "プロフィールを作成する"),
            desc: pick("Create a bilingual resume in English and Japanese (履歴書) using our Resume Builder. Apply with one click and track your application status in real time.", "当社の「履歴書作成ツール」を使って、英語と日本語のバイリンガル履歴書を作成しましょう。ワンクリックで応募でき、応募状況もリアルタイムで確認できます。"),
            cta: {
              label: pick("Create Profile", "プロフィールを作成する"),
              icon: ArrowRight,
              onClick: () => navigate("register"),
            },
            extra: null,
          },
          {
            step: "03",
            icon: Plane,
            accent: "crimson" as const,
            title: pick("Relocate to Japan", "日本への移住"),
            desc: pick("IndiGate handles all documentation, Immigration Bureau coordination, and pre-departure guidance. We support you through visa, relocation, and post-arrival follow-up.", "IndiGateでは、書類手続き、入国管理局との調整、および渡航前のガイダンスをすべて担当いたします。ビザ取得、転居、到着後のフォローアップに至るまで、全面的にサポートいたします。"),
            cta: null,
            extra: [
              { icon: ShieldCheck, label: pick("Visa support", "ビザの手配"),  color: "crimson" },
              { icon: Globe2,      label: pick("Bilingual", "バイリンガル"),     color: "saffron" },
              { icon: Heart,       label: pick("Human care", "人への思いやり"),    color: "saffron" },
            ],
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10">

            <SpotlightCard
              spotlightColor={
                s.accent === "crimson"
                  ? "color-mix(in oklch,var(--crimson) 8%,transparent)"
                  : "color-mix(in oklch,var(--saffron) 8%,transparent)"
              }
              className="card-premium relative h-full p-7 overflow-hidden
                  flex flex-col">

              {/* Faded watermark number */}
              <span aria-hidden
                className="absolute top-4 right-5 font-display
                    text-[5rem] font-extrabold leading-none
                    select-none pointer-events-none
                    text-saffron/[0.06]">
                {s.step}
              </span>

              {/* Icon ring + step label */}
              <div className="relative z-10 mb-5
                  flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: [0,-8,8,0], scale: 1.06 }}
                  transition={{ duration: 0.5 }}
                  className="grid place-items-center h-12 w-12
                      rounded-full bg-brand-gradient text-white
                      shadow-glow-brand ring-4 ring-background
                      shrink-0">
                  <s.icon className="h-5 w-5" />
                </motion.div>
                <span className={`text-xs font-bold uppercase
                    tracking-[0.18em] ${
                      s.accent === "crimson"
                        ? "text-crimson"
                        : "text-saffron"
                    }`}>
                  Step {s.step}
                </span>
              </div>

              <h3 className="font-display text-xl font-bold">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground
                  leading-relaxed flex-1">
                {s.desc}
              </p>

              {/* CTA button */}
              {s.cta && (
                <div className="mt-5 pt-4 border-t border-border/60">
                  <Button
                    variant="outline" size="sm"
                    onClick={s.cta.onClick}
                    className={`font-semibold transition-colors ${
                      s.accent === "saffron"
                        ? "border-saffron/30 hover:border-saffron/60 hover:bg-saffron/5 hover:text-crimson"
                        : "border-crimson/30 hover:border-crimson/60 hover:bg-crimson/5 hover:text-crimson"
                    }`}>
                    {s.cta.label}
                  </Button>
                </div>
              )}

              {/* Tags for step 3 */}
              {s.extra && (
                <div className="mt-5 pt-4 border-t border-border/60
                    flex flex-wrap gap-2">
                  {s.extra.map((tag) => (
                    <span key={tag.label}
                      className={`inline-flex items-center gap-1.5
                          rounded-full px-3 py-1 text-[11px]
                          font-semibold border ${
                            tag.color === "crimson"
                              ? "bg-crimson/8 border-crimson/20 text-crimson"
                              : "bg-saffron/8 border-saffron/20 text-saffron"
                          }`}>
                      <tag.icon className="h-3 w-3" />
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}

            </SpotlightCard>
          </motion.div>
        ))}
      </RevealGroup>

      {/* ─── 3. FOR COMPANIES CTA ────────────────────────── */}
      <Reveal variants={fadeUp} className="mt-12">
        <div className="relative overflow-hidden rounded-2xl
            bg-sidebar text-sidebar-foreground">

          {/* Subtle aurora */}
          <div aria-hidden
            className="pointer-events-none absolute inset-0">
            <div className="absolute -top-12 -right-12 h-40 w-40
                rounded-full bg-saffron/15 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40
                rounded-full bg-crimson/10 blur-3xl" />
          </div>
          {/* Grid overlay */}
          <div aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to right,white 1px,transparent 1px)," +
                "linear-gradient(to bottom,white 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }} />

          <div className="relative grid sm:grid-cols-[1fr_auto]
              gap-6 items-center px-7 py-8 sm:px-10">
            <div>
              {/* Eyebrow */}
              <p className="text-[11px] font-bold uppercase
                  tracking-[0.16em] text-sidebar-foreground/40 mb-2">{pick("For Japanese Companies", "日本企業向け")}</p>
              <h2 className="font-display text-xl font-bold
                  text-sidebar-foreground">
                Hiring Indian talent?
              </h2>
              <div className="section-divider mt-2 mb-2" />
              <p className="mt-1.5 text-sm
                  text-sidebar-foreground/60 leading-relaxed max-w-sm">
                Post jobs, search pre-vetted candidate profiles, and
                manage applications — with bilingual support and full
                visa guidance.
              </p>
              {/* Three trust chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { icon: BadgeCheck, label: pick("Free to post", "投稿は無料です")     },
                  { icon: Globe2,     label: pick("Bilingual support", "バイリンガル対応") },
                  { icon: Users,      label: pick("Pre-vetted talent", "事前に審査済みのタレント") },
                ].map((item) => (
                  <span key={item.label}
                    className="inline-flex items-center gap-1.5
                        rounded-full bg-white/8 border border-white/12
                        px-2.5 py-1 text-[11px] font-semibold
                        text-sidebar-foreground/70">
                    <item.icon className="h-3 w-3 text-saffron" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-start
                sm:items-center gap-2 shrink-0">
              <MagneticButton
                onClick={() => navigate("for-companies")}
                className="bg-brand-gradient text-white font-bold
                    h-11 px-7 rounded-xl inline-flex items-center
                    gap-2 shadow-glow-brand cursor-pointer
                    hover:opacity-90 transition-opacity whitespace-nowrap
                    text-sm">
                For Companies
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <p className="text-[11px] text-sidebar-foreground/35
                  text-center">
                1-day approval · No cost
              </p>
            </div>
          </div>
        </div>
      </Reveal>

    </main>
  );
}
