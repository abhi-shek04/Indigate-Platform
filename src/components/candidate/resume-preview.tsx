"use client";

import {
  GENDER_OPTIONS,
  NATIONALITY_OPTIONS,
  STATE_JA,
  type ResumeData,
} from "@/lib/resume-types";

export function ResumePreview({ data, lang }: { data: ResumeData; lang: "en" | "ja" }) {
  if (lang === "ja") return <JapaneseResume data={data} />;
  return <EnglishResume data={data} />;
}

function genderJa(g: string | undefined): string {
  return GENDER_OPTIONS.find((o) => o.value === g)?.labelJa ?? "—";
}
function genderEn(g: string | undefined): string {
  return GENDER_OPTIONS.find((o) => o.value === g)?.labelEn ?? "—";
}
function nationalityJa(n: string | undefined): string {
  if (!n) return "—";
  return NATIONALITY_OPTIONS.find((o) => o.value === n)?.labelJa ?? n;
}
function stateJa(s: string | undefined): string {
  if (!s) return "—";
  return STATE_JA[s] ?? s;
}

// ----- Japanese 履歴書 -----
function JapaneseResume({ data }: { data: ResumeData }) {
  const formatDobJa = (dob?: string) => {
    if (!dob) return "—";
    const d = new Date(dob);
    if (isNaN(d.getTime())) return dob;
    return `${d.getFullYear()}年 ${String(d.getMonth() + 1).padStart(2, "0")}月 ${String(d.getDate()).padStart(2, "0")}日`;
  };

  return (
    <div className="resume-page mx-auto bg-white text-black print:shadow-none shadow-premium" lang="ja">
      <h1 className="resume-title">履歴書</h1>

      <table className="resume-table">
        <tbody>
          <tr>
            <th className="w-24">氏名</th>
            <td className="font-bold text-lg">
              {data.nameJa || data.name || "—"}
              {data.name && <span className="ml-2 text-sm text-gray-600">（{data.name}）</span>}
            </td>
            <th className="w-24">生年月日</th>
            <td>{formatDobJa(data.dob)}</td>
          </tr>
          <tr>
            <th>性別</th>
            <td>{genderJa(data.gender)}</td>
            <th>メールアドレス</th>
            <td>{data.email || "—"}</td>
          </tr>
          <tr>
            <th>国籍</th>
            <td>{nationalityJa(data.nationality)}</td>
            <th>本籍地</th>
            <td>{stateJa(data.placeOfOrigin)}</td>
          </tr>
          <tr>
            <th>電話番号</th>
            <td>{data.phone || "—"}</td>
            <th>住所</th>
            <td>{data.address || "—"}</td>
          </tr>
          <tr>
            <th>既習言語</th>
            <td colSpan={3}>
              {data.languagesJa.length > 0
                ? data.languagesJa.join("、")
                : "—"}
            </td>
          </tr>
        </tbody>
      </table>

      {data.education.length > 0 && (
        <Section title="教育">
          <table className="resume-table">
            <thead>
              <tr>
                <th className="w-24">年/月</th>
                <th className="w-32">程度</th>
                <th>学校 / 学部 / 学科</th>
              </tr>
            </thead>
            <tbody>
              {data.education.map((edu, i) => (
                <tr key={i}>
                  <td>{edu.year}</td>
                  <td>{edu.degreeJa || edu.degree}</td>
                  <td>
                    {edu.fieldJa || edu.field}
                    <br />
                    <span className="text-gray-700">{edu.institutionJa || edu.institution}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="プロジェクト">
          <table className="resume-table">
            <thead>
              <tr>
                <th className="w-28">期間</th>
                <th className="w-40">プロジェクト名</th>
                <th>プロジェクトの内容 / 担当</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((proj, i) => (
                <tr key={i}>
                  <td>{proj.period}</td>
                  <td>
                    {proj.nameJa || proj.name}
                    {proj.techStack && (
                      <div className="text-xs text-gray-600 mt-1">{proj.techStack}</div>
                    )}
                  </td>
                  <td>{proj.descriptionJa || proj.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {data.activities.length > 0 && (
        <Section title="課外活動 / クラブ活動">
          <table className="resume-table">
            <thead>
              <tr>
                <th className="w-24">期間</th>
                <th>会社名・団体名</th>
                <th className="w-48">担当 / 仕事内容</th>
              </tr>
            </thead>
            <tbody>
              {data.activities.map((act, i) => (
                <tr key={i}>
                  <td>
                    {act.period}
                    {act.duration && <div className="text-xs text-gray-600">{act.duration}</div>}
                  </td>
                  <td>
                    {act.organizationJa || act.organization}
                    <br />
                    <span className="text-gray-700">{act.roleJa || act.role}</span>
                  </td>
                  <td>{act.dutiesJa || act.duties}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {data.awards.length > 0 && (
        <Section title="賞 / 実績">
          <table className="resume-table">
            <thead>
              <tr>
                <th className="w-20">年</th>
                <th className="w-40">タイトル</th>
                <th>詳細</th>
                <th className="w-36">機関</th>
              </tr>
            </thead>
            <tbody>
              {data.awards.map((aw, i) => (
                <tr key={i}>
                  <td>{aw.year}</td>
                  <td>{aw.titleJa || aw.title}</td>
                  <td>{aw.descriptionJa || aw.description}</td>
                  <td>{aw.organizationJa || aw.organization}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {(data.selfPrJa || data.selfPr) && (
        <Section title="趣味 / 興味 / 自己PR">
          <p className="resume-text whitespace-pre-wrap">
            {data.selfPrJa || data.selfPr}
          </p>
          {data.hobbiesJa && (
            <p className="resume-text mt-2 text-sm text-gray-700">趣味: {data.hobbiesJa}</p>
          )}
        </Section>
      )}

      <div className="resume-declaration">
        <p className="font-bold mb-2">宣言</p>
        <p className="text-sm">
          ここに記載したことはすべて、私の知る限りにおいて真実であることを宣言いたします。また、改ざんに対する法的な結果については、自らが責任を負うものとします。
        </p>
        <div className="mt-4 flex justify-end">
          <span className="border-b border-black px-8 py-0.5">
            氏名: {data.nameJa || data.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ----- English resume -----
function EnglishResume({ data }: { data: ResumeData }) {
  const formatDobEn = (dob?: string) => {
    if (!dob) return "";
    const d = new Date(dob);
    if (isNaN(d.getTime())) return dob;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="resume-page resume-en mx-auto bg-white text-black print:shadow-none shadow-premium">
      <header className="resume-header">
        <h1 className="resume-name">{data.name || "Your Name"}</h1>
        <div className="resume-contact">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span> · {data.phone}</span>}
          {data.address && <span> · {data.address}</span>}
        </div>
        <div className="resume-meta">
          {data.dob && <span>DOB: {formatDobEn(data.dob)}</span>}
          {data.gender && <span> · {genderEn(data.gender)}</span>}
          {data.nationality && <span> · Nationality: {data.nationality}</span>}
          {data.placeOfOrigin && <span> · {data.placeOfOrigin}</span>}
          {data.languages.length > 0 && <span> · Languages: {data.languages.join(", ")}</span>}
        </div>
      </header>

      {data.education.length > 0 && (
        <SectionEn title="Education">
          {data.education.map((edu, i) => (
            <div key={i} className="resume-entry">
              <div className="resume-entry-header">
                <span className="font-bold">{edu.institution}</span>
                <span className="text-gray-600">{edu.year}</span>
              </div>
              <div className="text-sm">
                {edu.degree} — {edu.field}
              </div>
            </div>
          ))}
        </SectionEn>
      )}

      {data.projects.length > 0 && (
        <SectionEn title="Projects">
          {data.projects.map((proj, i) => (
            <div key={i} className="resume-entry">
              <div className="resume-entry-header">
                <span className="font-bold">{proj.name}</span>
                <span className="text-gray-600">{proj.period}</span>
              </div>
              <p className="text-sm mt-1">{proj.description}</p>
              {proj.techStack && (
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">Tech:</span> {proj.techStack}
                </p>
              )}
            </div>
          ))}
        </SectionEn>
      )}

      {data.activities.length > 0 && (
        <SectionEn title="Activities & Leadership">
          {data.activities.map((act, i) => (
            <div key={i} className="resume-entry">
              <div className="resume-entry-header">
                <span className="font-bold">{act.role} — {act.organization}</span>
                <span className="text-gray-600">{act.period}</span>
              </div>
              <p className="text-sm mt-1">{act.duties}</p>
            </div>
          ))}
        </SectionEn>
      )}

      {data.awards.length > 0 && (
        <SectionEn title="Awards & Achievements">
          {data.awards.map((aw, i) => (
            <div key={i} className="resume-entry">
              <div className="resume-entry-header">
                <span className="font-bold">{aw.title}</span>
                <span className="text-gray-600">{aw.year}</span>
              </div>
              <p className="text-sm mt-1">{aw.description}</p>
              <p className="text-xs text-gray-600">{aw.organization}</p>
            </div>
          ))}
        </SectionEn>
      )}

      {data.selfPr && (
        <SectionEn title="Professional Summary">
          <p className="text-sm whitespace-pre-wrap">{data.selfPr}</p>
          {data.hobbies && (
            <p className="text-sm mt-2">
              <span className="font-medium">Hobbies:</span> {data.hobbies}
            </p>
          )}
        </SectionEn>
      )}

      <div className="resume-declaration-en">
        <p className="text-xs text-gray-600 italic">
          I declare that the information provided above is true to the best of my knowledge.
          I understand that I am responsible for any legal consequences of falsification.
        </p>
        <div className="mt-4 flex justify-end">
          <span className="border-b border-black px-8 py-0.5 text-sm">{data.name}</span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="resume-section">
      <h2 className="resume-section-title">{title}</h2>
      {children}
    </div>
  );
}

function SectionEn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="resume-section-en">
      <h2 className="resume-section-title-en">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
