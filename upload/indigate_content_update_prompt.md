# IndiGate — Real Company Content Update Prompt
### Based on Indobox official company document (25 pages)
> Abhishek — paste MASTER CONTEXT first, then this full prompt into Cursor/Claude Code

---

## ⚡ MASTER CONTEXT
> (Paste your existing master context here — same one from all previous prompts)

---

## CONTENT UPDATE PROMPT
### "Update all website content to match the real Indobox company information"

```
TASK: Replace ALL placeholder/generic content on the IndiGate website with 
real content from the official Indobox company document.
Keep all existing components, styles, animations, and structure exactly as-is.
Only change TEXT CONTENT and DATA — not code structure.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — COMPANY INFORMATION (update About page + Footer)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find src/components/landing/static-pages.tsx — the About section.
Replace with this real company content:

COMPANY NAME: Indobox Inc. (インドボックス株式会社)
TAGLINE: "India × Japan Talent Platform — Making the impossible possible 
through the fusion of India and Japan"

MISSION: "To make India's diversity an essential element of business"
VISION: "Through the fusion of Japan and India, turn what does not yet exist 
into reality"

VALUES (4 pillars):
1. "Be energetic in both Japan and India"
2. "Be a creator"
3. "Pursue fusion"
4. "Read ahead and act"
5. "Embrace change"

ADDITIONAL VALUE: "Drive through challenge and benefit. Become a pioneer of diversity."

JAPAN OFFICE:
Indobox Inc. (株式会社)
Founded: May 2023
Location: Station Ai, 1-2-32 Tsuruma, Showa-ku, Nagoya, Aichi 466-0064
(Japan's largest startup support / open innovation hub)
Licensed employment agency number: 23-ユ-303072

INDIA OFFICE:
Indobox India Private Limited
Founded: December 2024
Location: 1/C, 83/1, Raidurg, Panmaktha Near HiTec City,
Cyberabad, Shaikpet, Hyderabad, 500081, Telangana, India
(T-Hub — India's largest startup support & innovation hub)

NETWORK DESCRIPTION:
"With staff experienced in India business and partners spread throughout India,
we provide thorough support from both Japan and India."

INDIA NETWORK CITIES (show on a map or list):
Jammu, Dehradun, New Delhi, Varanasi, Assam, Ahmedabad, Mumbai, 
Nagpur, Kolkata, Goa, Hyderabad (HQ India), Bengaluru, Chennai, Coimbatore

CONTACT:
Contact person: Skanda (Japan-based, Japanese language support available)
Phone: 090-4251-7331
Email: skanda@indobox.co.jp
General: hello@indigate.work

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — FOOTER UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find src/components/layout/footer.tsx
Update address and contact info with real addresses above.
Add licensed agency number: 23-ユ-303072
Update copyright: "© 2025 Indobox Inc. All Rights Reserved."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — LANDING PAGE HERO SECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find the hero section in src/components/landing/landing-page.tsx
Update the headline and subtext to:

ENGLISH:
  Eyebrow badge: "India × Japan Talent Bridge"
  Headline line 1: "Connect top Indian"
  Headline line 2: "talent to Japan"
  Headline line 3: "careers."
  
  Subtext: "IndiGate by Indobox Inc. places Japanese-language-ready Indian 
  professionals with Japanese companies — with full support from screening 
  to visa, relocation, and beyond."

  CTA primary button: "Browse Jobs in Japan"
  CTA secondary button: "Hire Indian Talent"

JAPANESE (ja locale):
  Eyebrow badge: "インド × 日本 人材プラットフォーム"
  Headline: "インドの優秀な人材と"
  Headline line 2: "日本企業をつなぐ"
  Headline line 3: "架け橋に。"
  
  Subtext: "IndiGateは、日本語対応済みのインド人材と日本企業を
  マッチング。採用から就労ビザ、生活支援まで一貫サポート。"
  
  CTA primary: "日本の求人を探す"
  CTA secondary: "インド人材を採用する"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — "WHY INDIAN TALENT?" SECTION (ADD NEW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add a new section to landing-page.tsx AFTER the stats bar and BEFORE "How it works".
This is the "Why Indian talent now?" section — a key differentiator for IndiGate.

Section heading:
  EN: "Why Indian talent — right now?"
  JA: "なぜ今インド人材なのか？"

Sub-heading:
  EN: "Indian professionals lead the world's top companies"
  JA: "世界で活躍するインド人"

Create 3 stat cards in a row:

Card 1 — IIT Facts:
  Title EN: "Indian Institutes of Technology (IIT)"
  Title JA: "インド工科大学（IIT）"
  Stat: "1–1.6%"
  Label EN: "World's strictest acceptance rate (23 campuses)"
  Label JA: "世界最難関の合格率（全23校）"
  
Card 2 — Global reach:
  Title EN: "IIT graduates lead unicorns"
  Title JA: "ユニコーン企業を牽引"
  Stat: "70/100"
  Label EN: "Of India's top 100 unicorns founded by IIT alumni"
  Label JA: "インド国内ユニコーン100社中70社にIIT出身の創業者"

Card 3 — Japan demand:
  Title EN: "Japan wants Indian talent"
  Title JA: "日本もインド人材に注目"
  Stat: "50,000"
  Label EN: "India-Japan exchanges targeted in 5 years (Japanese government)"
  Label JA: "5年間で5万人の日印人材交流を目指す（日本政府方針）"

Below the 3 cards, add a highlight banner:
  EN: "29.4% of Indian Tier-2 university students choose Japan as their 
  #1 preferred work destination abroad — higher than the US, UK, or Germany."
  JA: "インドのTier2大学生が就職したい海外の国1位は日本（29.4%）。
  アメリカ、イギリス、ドイツを上回っています。"
  Source: "Indobox Inc. proprietary survey, 2025"

Then add 4 "why Japan" reasons (use icon cards):
  1. Safety (especially for women) / Cleanliness / Cultural values
  2. Advanced technology / Career building
  3. Salary level
  4. Japan is a "premium" brand in India (anime, culture, cuisine)

i18n keys to add to src/lib/i18n.ts (both en and ja):
  "why.title": "Why Indian talent — right now?"
  "why.subtitle": "Indian professionals lead the world's top companies"
  "why.stat1.title": "Indian Institutes of Technology (IIT)"
  "why.stat1.value": "1–1.6%"
  "why.stat1.label": "World's strictest acceptance rate — 23 campuses"
  "why.stat2.title": "IIT grads at the top"
  "why.stat2.value": "70 / 100"
  "why.stat2.label": "India's top unicorn founders are IIT alumni"
  "why.stat3.title": "Japan is India's #1 choice"
  "why.stat3.value": "29.4%"
  "why.stat3.label": "of Indian students want to work in Japan"
  "why.banner": "29.4% of Indian Tier-2 university students rank Japan as their top overseas work destination — above the US, UK, and Germany."
  "why.source": "Indobox proprietary survey, 2025"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — HOW IT WORKS (update 3 steps)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find the process/how-it-works section in landing-page.tsx.
Replace the 3 steps with Indobox's real end-to-end service flow:

Section heading:
  EN: "End-to-end support from both India and Japan"
  JA: "日印両国からEnd to Endのサポート"

STEP 1 — Before Offer (内定前):
  Icon: Search / screening icon
  Title EN: "Screening & candidate matching"
  Title JA: "候補者探し・選考"
  Description EN: "We confirm your hiring requirements, search our India-wide 
  talent network, screen candidates (resume translation, document review, 
  pre-interviews), and introduce matched candidates to you."
  Description JA: "採用要件の確認から候補者探し、選考（履歴書翻訳・
  書類・事前面談）、候補者の紹介まで一貫サポート。"

STEP 2 — Offer to Joining (内定〜入社):
  Icon: Plane / visa icon
  Title EN: "Onboarding & visa support"
  Title JA: "内定から入社までのサポート"
  Description EN: "We handle all relocation logistics — flight arrangements, 
  work visa applications, and pre-joining consultation. Optional: Japanese 
  language education and Japanese business manner training."
  Description JA: "渡航手配・ビザ申請など就業までの手続きをサポート。
  オプションで日本語教育・ビジネスマナー研修も実施。"

STEP 3 — After Joining (入社後):
  Icon: Building / support icon  
  Title EN: "Life support & continued growth"
  Title JA: "入社後の生活支援"
  Description EN: "Post-arrival life support, continued Japanese language 
  training, business culture coaching, and company-side training on 
  working with Indian colleagues. Optional mentor service."
  Description JA: "入国後の生活支援・入社後の相談、マナー研修、
  「インド人との協働」サポート研修、メンターサービス。"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — HIRING TYPES (ADD NEW SECTION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add after "How it works", before testimonials.

Section heading:
  EN: "Four ways to hire Indian talent"
  JA: "採用のパターン"

Sub-heading:
  EN: "We support every hiring model — from internships to experienced hires"
  JA: "インターンシップから中途採用まで、あらゆる採用パターンに対応"

4 hiring type cards:

Card 1:
  Tag: "Campus recruitment"
  Title EN: "Internship"
  Title JA: "インターンシップ"
  Description EN: "2–6 month internships with the option to convert to 
  full-time. Indian universities require internships in years 3–4."
  Description JA: "2〜6ヶ月のインターンシップ。本採用への移行も可能。"

Card 2:
  Tag: "New graduates"
  Title EN: "New graduate hire (conditional offer)"
  Title JA: "新卒採用（条件付き内定）"
  Description EN: "Offer to 3rd-year students with conditions — for example, 
  achieve JLPT N4 before graduation. Student completes Japanese study during 
  the conditional offer period."
  Description JA: "3年生への条件付き内定（例：卒業までにJLPT N4取得）。
  内定後に日本語学習・インターンシップ期間を設ける。"
  
Card 3:
  Tag: "Mid-career"
  Title EN: "Experienced hire"
  Title JA: "中途採用"
  Description EN: "Selecting experienced professionals from our broad India 
  network based on your specific requirements. Includes Japanese and 
  business manner training after offer."
  Description JA: "幅広いネットワークから要件に合う経験者を選定。
  内定後に日本語・ビジネスマナー研修を実施。"

Card 4:
  Tag: "Japan-based Indians"
  Title EN: "Indian residents in Japan"
  Title JA: "日本在住インド人"
  Description EN: "Indian students studying in Japan or working professionals 
  already in Japan. Can join in as little as 1–2 months. High Japanese 
  proficiency, accustomed to Japanese work culture."
  Description JA: "日本の大学・日本語学校に在籍中の留学生や、
  すでに日本で就労中のインド人。最短1〜2ヶ月で入社可能。
  日本語・日本文化への適応力が高い。"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — THREE CHALLENGES INDOBOX SOLVES (ADD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add a "Challenges we solve" section after hiring types.

Section heading:
  EN: "3 hurdles in hiring internationally — and how Indobox solves them"
  JA: "外国人採用の3つのハードルとIndoboxのサポート"

Challenge 1:
  Number: "01"
  Title EN: "Language barrier"
  Title JA: "言葉の壁"
  Problem EN: "Japanese companies feel the language barrier is their biggest 
  challenge. Foreign hires need at minimum basic Japanese skills."
  Solution EN: "JLPT N5/N4/N3 preparation — online and at partner schools"
  Solution badge: "Indobox solution"
  Problem JA: "日本企業が最もハードルと感じるのが言語の壁。
  外国人材には最低限の日本語スキルが求められます。"
  Solution JA: "JLPT N5・N4・N3対応 — オンライン・提携校"

Challenge 2:
  Number: "02"
  Title EN: "Cultural differences"
  Title JA: "文化の違い"
  Problem EN: "Differences in customs, food culture, and business practices 
  across countries can cause misunderstandings and gaps."
  Solution EN: "Japanese business manner training by professionals"
  Problem JA: "習慣、食文化、商文化など、国ごとに異なる文化の違いが、
  誤解やギャップの原因になることがあります。"
  Solution JA: "プロによる日本のビジネスマナー研修"

Challenge 3:
  Number: "03"
  Title EN: "Internal readiness"
  Title JA: "社内の受入れ体制"
  Problem EN: "When working with foreign employees, companies may not have 
  proper internal systems or Japanese staff ready to welcome them."
  Solution EN: '"Working with Indians" support training — using methods 
  proven at companies that successfully hire Indian staff'
  Problem JA: "外国人と働くにあたって、社内の体制や既存の日本人従業員の
  受け入れ準備が整っていないことがあります。"
  Solution JA: "「インド人との協働」サポート研修 — インド人採用に成功している
  企業の育成メソッドを活用"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8 — VISA GUIDE (update existing or create)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find the visa guide section (or add it if Prompt 9 hasn't been run yet).
Update with this exact real content from the official Indobox document:

VISA TYPE 1 — Specified Skilled Worker (特定技能):
  EN title: "Specified Skilled Worker (SSW)"
  JA title: "特定技能ビザ"
  Badge: "Most common · Labor shortage sectors"
  EN description: "For skilled workers in industries facing severe labor 
  shortages in Japan: nursing care, hospitality, food & beverage, 
  construction, and agriculture. Requires passing both a Japanese language 
  test and an industry-specific skills evaluation test."
  JA description: "介護・宿泊・飲食業・建設業・農業など、人手不足が深刻な
  分野向け。日本語試験と特定技能試験の合格が必要。"
  Requirements: 
    - Japanese language test (JLPT N4 equivalent or higher)
    - Industry-specific skills evaluation test
    - Sponsored by a registered Japanese company
    - Clean criminal record
  Industries EN: "Nursing care · Hospitality · Food & Beverage · Construction · Agriculture"
  Industries JA: "介護・宿泊・飲食業・建設業・農業"
  Special note EN: "Northeast India (Assam, Manipur, Meghalaya, Mizoram, 
  Nagaland, Arunachal Pradesh, Tripura, Sikkim) — culturally closer to 
  Japan, rice-based diet, especially suited for hospitality and care roles."
  Special note JA: "インド北東部8州（アッサム州、マニプル州等）の人材は
  モンゴロイド系で食文化も日本に近く、介護・宿泊業に特に適しています。"

VISA TYPE 2 — Engineer / Specialist in Humanities / International Services:
  EN title: "Engineer / Specialist Visa"
  JA title: "技術・人文知識・国際業務ビザ"
  Badge: "For IT & professionals"
  EN description: "For IT engineers, software developers, embedded systems 
  engineers, translators/interpreters, finance professionals, and business 
  specialists. Requires a bachelor's degree or 10+ years of relevant 
  work experience. No mandatory JLPT requirement but N3+ strongly recommended."
  JA description: "ITエンジニア・ソフトウェア開発・組込みシステム・
  翻訳/通訳・金融・専門業務向け。学士号または10年以上の実務経験が必要。
  JLPTの義務はないがN3以上を強く推奨。"
  Requirements:
    - Bachelor's degree (any field) OR 10+ years relevant experience
    - Job offer relevant to degree or experience
    - Offer letter from Japanese company
    - No specific JLPT requirement (N3+ recommended)
  Industries EN: "Software · Embedded systems · Finance · Translation · IT infrastructure"
  Industries JA: "ソフトウェア・組込み・金融・翻訳・ITインフラ"
  JLPT: "N3+ recommended · No mandatory requirement"

VISA TYPE 3 — Intra-Company Transfer (企業内転勤):
  EN title: "Intra-Company Transfer"
  JA title: "企業内転勤ビザ"
  Badge: "For existing employees"
  EN description: "For Indian professionals being transferred from their 
  company's India office to the Japan branch of the same organization. 
  Requires at least 1 year of continuous employment at the current employer."
  JA description: "インド支社から同じ会社の日本支社へ転勤するプロフェッショナル向け。
  現在の雇用主での1年以上の継続勤務が必要。"
  Requirements:
    - Minimum 1 year at current employer
    - Being transferred to Japan office of the SAME company
    - Position must match current role
    - No specific JLPT requirement
  Industries EN: "Any industry with offices in both India and Japan"
  Industries JA: "日本とインドに拠点を持つ企業すべて"
  JLPT: "No requirement"

Support banner text:
  EN: "Indobox handles all visa paperwork, government coordination, 
  flight arrangements, and pre-arrival consultation — end to end."
  JA: "IndiGateはビザ申請書類、政府機関との調整、渡航手配、
  来日前相談まで、すべてをEnd to Endでサポートします。"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 9 — FAQ (update with Indobox's real FAQ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace the FAQ content in landing-page.tsx with Indobox's actual 
company FAQ from the official document (8 Q&As):

Q1 EN: "Is there a Japanese language communication problem?"
A1 EN: "You can specify the required Japanese level when hiring. 
Indians have high language acquisition ability, so learning Japanese 
on the job after joining is also expected. Support from the 
receiving company helps language improvement."
Q1 JA: "日本語でのコミュニケーションは問題ないですか？"
A1 JA: "求人の際、必要な日本語のレベルをご指定いただけます。インド人は
言語習得能力が高いので、入社後の日本語学習および業務をしながらの学習も期待できます。
受け入れ側のサポートが語学向上の手助けとなります。"

Q2 EN: "Are there religious considerations we need to be aware of?"
A2 EN: "Dietary and behavioral practices differ by religion — Hindu, 
Muslim, Christian, Buddhist, and Sikh followers each have different 
customs. The key is to approach each religion with respect and understanding. 
For dining, please confirm what each person cannot eat rather than assuming."
Q2 JA: "宗教上配慮しなければいけないことはありますか？"
A2 JA: "ヒンドゥー教、イスラム教、キリスト教、仏教、シーク教徒など各宗教ごとに
食習慣や行事が異なります。それぞれの宗教にリスペクトを示し、理解しようとする姿勢が大切です。
食事については各自が食べられないものを確認した上で対応してください。"

Q3 EN: "What food considerations are necessary?"
A3 EN: "Hindus do not eat beef. Muslims do not eat pork. 
Among vegetarians, some do not even eat eggs. When company 
dining events occur, please confirm what each person cannot eat 
rather than guessing. Also, many Indians do not drink alcohol 
— please do not pressure them."
Q3 JA: "食事についてどのような配慮が必要ですか？"
A3 JA: "ヒンドゥー教は牛肉、イスラム教は豚肉を食べません。ベジタリアンには、
卵も食べない人など個人差があります。社内で食事会がある際には、各自が食べられない
ものを確認した上で、注文の際にご配慮ください。また、お酒を飲まない人も多いので
強要はしないようにしてあげてください。"

Q4 EN: "Do Indians job-hop frequently?"
A4 EN: "Indians think about long-term career paths, so changing 
jobs is common. The key to retention is showing a clear career 
path, giving fair evaluations tied to salary, and making the 
employee feel that staying at the company is genuinely valuable to them."
Q4 JA: "インド人はすぐに転職してしまいますか？"
A4 JA: "インド人は、長期的なキャリアパスを考えているため、ジョブホッブも日常的です。
明確なキャリアパスを示して、仕事についての適正な評価をして給与に反映するなど、
本人がその会社にいることのメリットを感じられるような対応が、長く働いてもらうための秘訣です。"

Q5 EN: "Can we try an internship first before deciding on full-time hiring?"
A5 EN: "Absolutely. Indian universities run internships for 3rd and 4th 
year students. Long-term internships of 2–6 months are possible. 
Converting to full employment by mutual agreement afterwards is perfectly fine."
Q5 JA: "試しにインターンシップをしてから本採用の有無を決めることも可能ですか？"
A5 JA: "インドの大学は、3〜4年生の間にインターンシップを実施します。
2〜6ヶ月ほどの長期インターンシップも可能です。その後で双方合意の上で
本採用という流れでも問題ありません。"

Q6 EN: "How do we receive internship students?"
A6 EN: "Indobox coordinates internship recruitment in partnership 
with universities and local partners. Please consult us."
Q6 JA: "インターンシップの受入はどうすればいいですか？"
A6 JA: "Indoboxでは、各大学や現地パートナーと連携したインターンシップの
採用サポートも行っています。"

Q7 EN: "Can we visit India to conduct in-person interviews?"
A7 EN: "Yes. For campus recruitment, you will need to coordinate 
with each university's career center. Indobox can coordinate 
multi-campus visits on a single trip. For mid-career hires, 
resume review and online interviews are standard."
Q7 JA: "現地（インド）に出向いて直接面談することも可能ですか？"
A7 JA: "可能です。大学での採用については、各大学の就職課が管轄しているので、
大学との調整が必要になります。一度の渡航で複数校訪問する場合の調整は、
Indoboxでもおこなっております。中途採用の場合は履歴書とオンライン面談が一般的です。"

Q8 EN: "Are there challenges from cultural and business practice differences?"
A8 EN: "Yes, there are differences in national character, culture, and 
business practices. Rather than applying Japanese common sense to them, 
it is important to understand the intent behind their words in the 
context of their background, and to carefully explain differences. 
This builds mutual understanding."
Q8 JA: "文化・商習慣の違いによる課題はありますか？"
A8 JA: "国民性、文化、商習慣の違いはあります。日本の常識にあてはめず、
彼らの言動の背景にある意図を確認して、違いを丁寧に説明してあげることで、
お互いの理解が深まります。"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 10 — FOR COMPANIES PAGE (static-pages.tsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Find the ForCompanies static page in src/components/landing/static-pages.tsx.
Replace its content with this real Indobox service breakdown:

Page heading:
  EN: "For Japanese companies — Hiring Indian talent"
  JA: "採用企業の皆様へ"

SERVICES OFFERED (3 main):

Service 01:
  Title EN: "India Talent Utilization Seminar"
  Title JA: "インド人材活用セミナー"
  Description EN: "A seminar to deepen understanding of India — covering 
  India basics, the differences in business customs between Japan and India, 
  and the advantages of hiring Indian talent."
  Description JA: "インドの基本概要から日本とインドの商習慣の違い、
  人材採用のメリットなど、インドへの理解を深めるためのセミナーです。"

Service 02:
  Title EN: "Japanese Language Education & Business Manner Training"
  Title JA: "日本語教育・ビジネスマナー研修"
  Description EN: "Japanese language classes at partner universities, 
  and Japanese language education services customized to the receiving 
  company's needs via partner teachers and schools. 
  Also includes professional Japanese business manner training."
  Description JA: "提携大学における日本語クラス、およびパートナー日本語教師・
  提携校における受入企業の要望に応じた日本語教育サービスの実施。
  また、プロによる日本のビジネスマナー研修も実施しています。"

Service 03:
  Title EN: '"Working with Indians" Support Training'
  Title JA: "「インド人との協働」サポート研修"
  Subtitle EN: "An accompaniment program with companies that have 
  successfully hired Indian talent"
  Subtitle JA: "インド人採用に成功している企業との伴走支援型プログラム"
  Description EN: "A 18–24 month program walking through the phases that 
  companies hiring Indians go through: Conflict → Behavioral Change → 
  Culture Reform → Talent Activation. At each phase: leadership mindset 
  consulting, organizational restructuring, and 4-phase diagnostic to 
  practice-review cycle."
  Description JA: "インド人を採用した企業がたどる「葛藤期」「行動変革期」
  「風土変革期」「人材活躍期」のフェーズ。各フェーズごとに経営層・社員・
  外国人への支援や研修、ワークショップなどを実施します。期間：18〜24ヶ月"

HYBRID SUCCESS MODEL (add a diagram section):
  Heading EN: "The Hybrid Success Model"
  Heading JA: "ハイブリッド成功モデル"
  
  Left side — Japanese companies:
    Current situation EN: "Stagnant Japan market (including SE Asia, China) · 
    China risk · Want to expand unique technology and services to a huge market"
    Current situation JA: "日本市場の停滞（含む東南アジア・中国）・中国リスク・
    自社の持つユニークな技術・サービスを巨大な市場へ展開したい"
    Challenge EN: "Don't understand India at all (complex, diverse, 
    language barrier) · No one internally with India experience"
    Challenge JA: "インドのことが全く分からない（複雑、多様性、商習慣、言語の壁）
    社内に人がいない"

  Right side — India market:
    Current situation EN: "1.4 billion market · Growing middle class · 
    IT & digital powerhouse · Japan is premium (friendly nation, anime etc.) · 
    Want to connect"
    Current situation JA: "14億の巨大市場・中間層の増大・IT・デジタル大国・
    日本はプレミアム（親日国、アニメなど）・つながりを持ちたい"
    Challenge EN: "Want technology · Inefficient management · Lack of 
    employment opportunities · Don't understand Japan at all"
    Challenge JA: "技術が欲しい・非効率な経営・雇用機会の不足・
    日本が全くわからない"

  Results of hiring Indian talent (4 effects):
    Effect 1 EN: "Deeper understanding of India (more India-aware internally)"
    Effect 1 JA: "インドへの理解が深まる（社内にインド感が増す）"
    Effect 2 EN: "Solving labor shortages (securing talented people)"
    Effect 2 JA: "人手不足の解消（有能な人材の確保）"
    Effect 3 EN: "Expansion of global business (English ability, negotiation 
    skills — Indians excel at both)"
    Effect 3 JA: "グローバルビジネスの拡大（英語力、交渉力に長けているインド人）"
    Effect 4 EN: "Strengthening IT and systems (offshore development, 
    outsourcing, innovation talent)"
    Effect 4 JA: "IT・システム分野の強化（オフショア開発、アウトソーシング）、
    イノベーション人材"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 11 — JAPANESE LANGUAGE EDUCATION PAGE (ADD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add a new static page or section called "Japan Language Education" 
accessible from the Candidates view.

Content:
Heading EN: "Growing enthusiasm for Japanese language learning in India"
Heading JA: "インドで高まる日本語教育熱"

Key facts:
- Major universities including Delhi University, Jawaharlal Nehru University, 
  and Anna University offer Japanese language master's programs and diploma courses
- IITs are expanding Japanese language classes focusing on conversation
- Engineering universities across India are adding Japanese as an elective
- Target: JLPT N4 and N3 preparation
- Japanese government agencies (Japan Foundation, JICA) dispatching Japanese 
  language teachers to India
- Japanese language schools expanding in India's Tier 1 and Tier 2 cities

Indobox activities in Japanese education:
  ✓ Classes at engineering university in Chennai, Tamil Nadu
  ✓ Training for Specified Skilled Worker candidates in Northeast India
  ✓ Japanese language education program for conditional offer recipients

Japan Center / Japan Desk at universities:
  "Japan Centers are being established at universities across India to 
  promote connection with Japan, understanding of Japanese culture and 
  corporate culture."
  Activities: Japanese language education, studying Japanese culture, 
  short-term study in Japan, student exchange with Japan, joint degrees 
  with Japanese universities, joint research with Japanese companies, 
  internship and employment in Japan.
  
  Indobox achievement: Established Japan Center at Woxsen University 
  in Hyderabad, Telangana. Indobox CEO Daisu Tanji serves as Deputy Director.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 12 — STATS BAR (update real numbers)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update the 4 stat cards in the stats bar to reflect real data:

Stat 1:
  Number: "1,500+"
  Label EN: "Indian students currently in Japan"
  Label JA: "日本在住のインド人留学生"

Stat 2:
  Number: "29.4%"
  Label EN: "Indian students choose Japan as top work destination"
  Label JA: "日本を就職先1位に選ぶインド人学生"

Stat 3:
  Number: "50,000"
  Label EN: "India-Japan exchanges targeted in 5 years"
  Label JA: "5年間の日印人材交流目標数"

Stat 4:
  Number: "23"
  Label EN: "IIT campuses producing world-class engineers"
  Label JA: "世界トップ工学系大学（IIT）のキャンパス数"

NOTE: The actual DB-driven stats (jobs count, candidates count, etc.) 
should remain as dynamic data pulled from the database.
The above 4 market stats are ADDITIONAL marketing context — 
add them as a second row of stats below the DB-driven row,
OR replace the DB stats until there is real data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 13 — CONTACT PAGE UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update the contact form section in landing-page.tsx with real details:

Contact heading:
  EN: "Get in touch with Indobox"
  JA: "お問い合わせ"

Japan contact:
  Person: Skanda (Japan-based, Japanese language support available)
  Phone: 090-4251-7331
  Email: skanda@indobox.co.jp
  Note EN: "Japanese language support available"
  Note JA: "日本語対応可"

General email: hello@indigate.work

Contact form — add a "Enquiry type" dropdown with options:
  EN options:
    - "I want to hire Indian talent" 
    - "I am an Indian candidate looking for work in Japan"
    - "Internship inquiry"
    - "Japanese language education / training"
    - "General enquiry"
  JA options:
    - "インド人材を採用したい"
    - "日本での就職を希望するインド人"
    - "インターンシップのお問い合わせ"
    - "日本語教育・研修について"
    - "その他のお問い合わせ"

Update ContactSubmission schema if needed to store enquiry type.
Add enquiryType: String? field to ContactSubmission model in schema.prisma.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Update src/lib/i18n.ts with ALL new i18n keys for both 'en' and 'ja'.
   Use the exact Japanese text provided above for ja keys.
   Never leave a key in one language without its translation in the other.

2. Update src/components/landing/landing-page.tsx:
   - Update hero text
   - Add "Why Indian talent" section after stats bar
   - Update "How it works" steps
   - Add "Hiring types" section
   - Add "3 Challenges" section
   - Update FAQ with all 8 Q&As above
   - Update stats numbers

3. Update src/components/landing/static-pages.tsx:
   - About page: full company info, mission/vision/values, both offices
   - For companies page: 3 services + hybrid model
   - Add Japanese language education content to candidates page

4. Update src/components/layout/footer.tsx:
   - Real Japan address
   - Real India address  
   - Licensed agency number
   - Contact email and phone

5. Update prisma/schema.prisma if adding enquiryType to ContactSubmission.
   Run: bun run db:push after schema change.

6. Keep ALL existing animations, SpotlightCard, MagneticButton, Reveal, 
   RevealGroup components exactly as-is — only change the TEXT inside them.

7. Do NOT change any API routes, auth logic, dashboard code, or admin panel.
   This is ONLY a content update to public-facing pages.

Expected result: Every page of IndiGate shows real Indobox company information.
No more placeholder text. Japanese visitors see real Japanese content.
Indian candidates see accurate company info. Japanese companies see real services.
```
