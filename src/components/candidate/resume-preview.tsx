"use client";

import {
  GENDER_OPTIONS,
  JLPT_OPTIONS,
  NATIONALITY_OPTIONS,
  STATE_JA,
  computeAge,
  type ResumeData,
} from "@/lib/resume-types";

const CHECKED = "☒";
const UNCHECKED = "☐";

/** Shows the Japanese text; if only English exists, shows it greyed + ※未翻訳 */
function JaText({ ja, en }: { ja?: string; en?: string }) {
  if (ja?.trim()) return <>{ja}</>;
  if (en?.trim()) return <span style={{ color: "#888", fontStyle: "italic" }}>{en} ※未翻訳</span>;
  return <>—</>;
}

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
  if (!s) return "同上";
  return STATE_JA[s] ?? s;
}

function formatDobEn(dob?: string): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return dob;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function formatDobJa(dob?: string): string {
  if (!dob) return "—";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return dob;
  return `${d.getFullYear()}年 ${String(d.getMonth() + 1).padStart(2, "0")}月 ${String(d.getDate()).padStart(2, "0")}日`;
}
function todayDdmmyyyy(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ----- Japanese 履歴書 -----
function JapaneseResume({ data }: { data: ResumeData }) {
  return (
    <div className="resume-page resume-en mx-auto bg-white text-black print:shadow-none shadow-premium" lang="ja">
      {/* Title row */}
      <div className="flex items-baseline justify-between border-b-2 border-black pb-2 mb-4">
        <h1 className="text-2xl font-extrabold tracking-wide">履歴書</h1>
        <span className="text-sm text-gray-600">日付: {todayDdmmyyyy()}</span>
      </div>

      {/* Personal info block */}
      <div className="mb-4 space-y-1 text-sm">
        <div className="flex">
          <span className="font-bold w-36">氏名 :</span>
          <span className="flex-1">
            {data.name || "—"}
            {data.nameJa && <span className="ml-2 text-gray-600">（{data.nameJa}）</span>}
          </span>
        </div>
        <div className="flex">
          <span className="font-bold w-36">生年月日 :</span>
          <span className="flex-1">{formatDobJa(data.dob)}</span>
          <span className="font-bold w-28">性別 :</span>
          <span className="flex-1">{genderJa(data.gender)}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-36">メール :</span>
          <span className="flex-1">{data.email || "—"}</span>
          <span className="font-bold w-36">電話番号 :</span>
          <span className="flex-1">{data.phone || "—"}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-36">住所 :</span>
          <span className="flex-1">{data.address || "—"}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-44">国籍 :</span>
          <span className="flex-1">{nationalityJa(data.nationality)}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-44">本籍地 :</span>
          <span className="flex-1">{stateJa(data.placeOfOrigin)}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-44">在学中の学位 :</span>
          <span className="flex-1">{data.currentDegree || "—"}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-44">卒業見込時期 :</span>
          <span className="flex-1">{data.expectedGraduation || "—"}</span>
        </div>
      </div>

      {/* Education */}
      <SectionEn title="教育">
        <table className="resume-table">
          <thead>
            <tr>
              <th className="w-16">年</th>
              <th className="w-16">月</th>
              <th>学校</th>
              <th className="w-1/3">学位</th>
            </tr>
          </thead>
          <tbody>
            {data.education.length === 0 ? (
              <tr><td colSpan={4} className="text-gray-400 italic">教育情報がありません。</td></tr>
            ) : (
              data.education.map((edu, i) => (
                <tr key={i}>
                  <td>{edu.year}</td>
                  <td>{edu.month ?? ""}</td>
                  <td>{edu.institutionJa || edu.institution || "—"}</td>
                  <td>{edu.degreeJa || edu.degree || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </SectionEn>

      {data.activities.length > 0 && (
        <SectionEn title="職歴（インターンシップ / 実習）">
          <table className="resume-table">
            <thead>
              <tr>
                <th className="w-16">年</th>
                <th className="w-16">月</th>
                <th>内容</th>
              </tr>
            </thead>
            <tbody>
              {data.activities.map((a, i) => (
                <tr key={i}>
                  <td>{a.year ?? ""}</td>
                  <td>{a.period || ""}</td>
                  <td>
                    {a.role || a.organization ? (
                      <span className="font-medium">
                        {a.role ? `${a.roleJa || a.role} ` : ""}{a.organization ? `@ ${a.organizationJa || a.organization}` : ""}
                        {(a.role || a.organization) && " — "}
                      </span>
                    ) : null}
                    <JaText ja={a.dutiesJa} en={a.duties} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionEn>
      )}

      {data.awards.length > 0 && (
        <SectionEn title="免許・資格 / 成果">
          <table className="resume-table">
            <thead>
              <tr>
                <th className="w-16">年</th>
                <th className="w-16">月</th>
                <th className="w-1/3">タイトル</th>
                <th>詳細</th>
              </tr>
            </thead>
            <tbody>
              {data.awards.map((aw, i) => (
                <tr key={i}>
                  <td>{aw.year}</td>
                  <td>{aw.month ?? ""}</td>
                  <td>
                    {aw.titleJa || aw.title}
                    {aw.organization && <div className="text-xs text-gray-600">{aw.organizationJa || aw.organization}</div>}
                  </td>
                  <td><JaText ja={aw.descriptionJa} en={aw.description} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionEn>
      )}

      {data.projects.length > 0 && (
        <SectionEn title="プロジェクト / 課外活動">
          <table className="resume-table">
            <thead>
              <tr>
                <th className="w-16">年</th>
                <th className="w-16">月</th>
                <th>プロジェクト / 内容</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((p, i) => (
                <tr key={i}>
                  <td>{p.year ?? ""}</td>
                  <td>{p.period || ""}</td>
                  <td>
                    <span className="font-medium">{p.nameJa || p.name}</span>
                    {p.techStack && <div className="text-xs text-gray-600">技術: {p.techStack}</div>}
                    <div className="text-sm mt-1"><JaText ja={p.descriptionJa} en={p.description} /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionEn>
      )}

      {data.skills.length > 0 && (
        <SectionEn title="スキル">
          <div className="overflow-x-auto">
            <table className="resume-table" style={{ tableLayout: "fixed", width: "100%" }}>
              <thead>
                <tr>
                  <th rowSpan={2} className="align-middle" style={{ width: "40%" }}>スキル名</th>
                  <th colSpan={3} className="text-center" style={{ borderBottom: "1px solid #d4d4d4" }}>
                    習熟度レベル
                  </th>
                </tr>
                <tr>
                  <th className="text-center text-xs" style={{ width: "20%" }}>授業で学習</th>
                  <th className="text-center text-xs" style={{ width: "20%" }}>単独で操作可能</th>
                  <th className="text-center text-xs" style={{ width: "20%" }}>他者に指導可能</th>
                </tr>
              </thead>
              <tbody>
                {data.skills.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td className="text-center">{s.learnedInClass ? CHECKED : UNCHECKED}</td>
                    <td className="text-center">{s.canOperate ? CHECKED : UNCHECKED}</td>
                    <td className="text-center">{s.canTeach ? CHECKED : UNCHECKED}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionEn>
      )}

      {data.skillsExcelSummary && data.skillsExcelSummary.length > 0 && (
        <SectionEn title="得意なスキル">
          <ol className="list-decimal pl-6 space-y-2 text-sm">
            {data.skillsExcelSummary.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </SectionEn>
      )}

      <SectionEn title="現在の日本語能力（JLPT）">
        <div className="flex justify-between px-6 py-2 text-base">
          {JLPT_OPTIONS.map((lvl) => (
            <span key={lvl}>
              {lvl} {data.currentJlpt === lvl ? CHECKED : UNCHECKED}
            </span>
          ))}
        </div>
      </SectionEn>

      <SectionEn title="卒業までに達成予定の日本語能力">
        <div className="flex justify-between px-6 py-2 text-base">
          {JLPT_OPTIONS.map((lvl) => (
            <span key={lvl}>
              {lvl} {data.expectedJlpt === lvl ? CHECKED : UNCHECKED}
            </span>
          ))}
        </div>
      </SectionEn>

      {data.otherLanguages ? (
        <SectionEn title="その他の言語">
          <p className="text-center text-sm py-1">{data.otherLanguages}</p>
        </SectionEn>
      ) : null}

      {(() => {
        const ja = data.japanMotivationJa;
        const en = data.japanMotivation;
        const wj = ja?.whyJapan || en?.whyJapan;
        const ci = ja?.careerInJapan || en?.careerInJapan;
        const ch = ja?.challenges || en?.challenges;
        if (!wj && !ci && !ch) return null;
        return (
          <SectionEn title="日本で働きたい理由について">
            <div className="space-y-3">
              {wj && <QAItemJa question="なぜ日本で働きたいですか？" answer={wj} />}
              {ci && <QAItemJa question="日本でどのようなキャリアを作りたいですか？" answer={ci} />}
              {ch && <QAItemJa question="日本生活への適応において、どのような課題を予想し、どう対処しますか？" answer={ch} />}
            </div>
          </SectionEn>
        );
      })()}

      {(data.selfPrJa || data.selfPr || data.hobbiesJa || data.hobbies) && (
        <SectionEn title="趣味 / 自己PR">
          {(data.selfPrJa || data.selfPr) && (
            <p className="text-sm whitespace-pre-wrap">
              <JaText ja={data.selfPrJa} en={data.selfPr} />
            </p>
          )}
          {(data.hobbiesJa || data.hobbies) && (
            <p className="text-sm mt-2 text-gray-700">
              趣味: <JaText ja={data.hobbiesJa} en={data.hobbies} />
            </p>
          )}
        </SectionEn>
      )}

      <div className="resume-declaration">
        <p className="font-bold mb-2">宣言</p>
        <p className="text-sm">
          ここに記載したことはすべて、私の知る限りにおいて真実であることを宣言いたします。また、改ざんに対する法的な結果については、自らが責任を負うものとします。
        </p>
        <div className="mt-4 flex justify-end">
          <span className="border-b border-black px-8 py-0.5">
            氏名: {data.nameJa || data.name || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function QAItemJa({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border border-gray-300 p-2 rounded">
      <p className="font-bold text-sm mb-1">{question}</p>
      <p className="text-sm whitespace-pre-wrap">{answer}</p>
    </div>
  );
}

// ----- English resume -----
function EnglishResume({ data }: { data: ResumeData }) {
  const age = computeAge(data.dob);
  const dobDisplay = formatDobEn(data.dob);
  const dobWithAge = dobDisplay
    ? `${dobDisplay}${age ? ` (Age: ${age})` : ""}`
    : "";

  return (
    <div className="resume-page resume-en mx-auto bg-white text-black print:shadow-none shadow-premium">
      {/* Title row */}
      <div className="flex items-baseline justify-between border-b-2 border-black pb-2 mb-4">
        <h1 className="text-2xl font-extrabold tracking-wide">Resume</h1>
        <span className="text-sm text-gray-600">Date: {todayDdmmyyyy()}</span>
      </div>

      {/* Personal info block */}
      <div className="mb-4 space-y-1 text-sm">
        <div className="flex">
          <span className="font-bold w-36">Your Name :</span>
          <span className="flex-1">{data.name || "—"}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-36">Date of Birth :</span>
          <span className="flex-1">{dobWithAge || "—"}</span>
          <span className="font-bold w-28">Gender :</span>
          <span className="flex-1">{data.gender ? genderEn(data.gender) : "—"}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-36">E-Mail :</span>
          <span className="flex-1">{data.email || "—"}</span>
          <span className="font-bold w-36">Telephone Number:</span>
          <span className="flex-1">{data.phone || "—"}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-36">Address :</span>
          <span className="flex-1">{data.address || "—"}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-44">Current Degree being Pursued:</span>
          <span className="flex-1">{data.currentDegree || "—"}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-44">Expected time of Graduation:</span>
          <span className="flex-1">{data.expectedGraduation || "—"}</span>
        </div>
      </div>

      {/* Education */}
      <SectionEn title="Education">
        <table className="resume-table">
          <thead>
            <tr>
              <th className="w-16">Year</th>
              <th className="w-16">Month</th>
              <th>School</th>
              <th className="w-1/3">Degree</th>
            </tr>
          </thead>
          <tbody>
            {data.education.length === 0 ? (
              <tr><td colSpan={4} className="text-gray-400 italic">No education entries.</td></tr>
            ) : (
              data.education.map((edu, i) => (
                <tr key={i}>
                  <td>{edu.year}</td>
                  <td>{edu.month ?? ""}</td>
                  <td>{edu.institution || "—"}</td>
                  <td>{edu.degree || edu.field || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </SectionEn>

      {data.activities.length > 0 && (
        <SectionEn title="Work Experience (Apprenticeship/Internship)">
          <table className="resume-table">
            <thead>
              <tr>
                <th className="w-16">Year</th>
                <th className="w-16">Month</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {data.activities.map((a, i) => (
                <tr key={i}>
                  <td>{a.year ?? ""}</td>
                  <td>{a.period || ""}</td>
                  <td>
                    {a.role || a.organization ? (
                      <span className="font-medium">
                        {a.role ? `${a.role} at ` : ""}{a.organization || ""}
                        {(a.role || a.organization) && " — "}
                      </span>
                    ) : null}
                    {a.duties || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionEn>
      )}

      {data.awards.length > 0 && (
        <SectionEn title="Certifications / Achievements">
          <table className="resume-table">
            <thead>
              <tr>
                <th className="w-16">Year</th>
                <th className="w-16">Month</th>
                <th className="w-1/3">Title</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {data.awards.map((aw, i) => (
                <tr key={i}>
                  <td>{aw.year}</td>
                  <td>{aw.month ?? ""}</td>
                  <td>
                    {aw.title}
                    {aw.organization && <div className="text-xs text-gray-600">{aw.organization}</div>}
                  </td>
                  <td>{aw.description || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionEn>
      )}

      {data.projects.length > 0 && (
        <SectionEn title="Projects / Co-Curricular Activities">
          <table className="resume-table">
            <thead>
              <tr>
                <th className="w-16">Year</th>
                <th className="w-16">Month</th>
                <th>Project / Description</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((p, i) => (
                <tr key={i}>
                  <td>{p.year ?? ""}</td>
                  <td>{p.period || ""}</td>
                  <td>
                    <span className="font-medium">{p.name}</span>
                    {p.techStack && <div className="text-xs text-gray-600">Tech Stack: {p.techStack}</div>}
                    {p.description && <div className="text-sm mt-1">{p.description}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionEn>
      )}

      {data.skills.length > 0 && (
        <SectionEn title="Skills">
          <div className="overflow-x-auto">
            <table className="resume-table" style={{ tableLayout: "fixed", width: "100%" }}>
              <thead>
                <tr>
                  <th rowSpan={2} className="align-middle" style={{ width: "40%" }}>Skill Name</th>
                  <th colSpan={3} className="text-center" style={{ borderBottom: "1px solid #d4d4d4" }}>
                    Proficiency Level
                  </th>
                </tr>
                <tr>
                  <th className="text-center text-xs" style={{ width: "20%" }}>Learned in class</th>
                  <th className="text-center text-xs" style={{ width: "20%" }}>Can operate alone</th>
                  <th className="text-center text-xs" style={{ width: "20%" }}>Can teach others</th>
                </tr>
              </thead>
              <tbody>
                {data.skills.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td className="text-center">{s.learnedInClass ? CHECKED : UNCHECKED}</td>
                    <td className="text-center">{s.canOperate ? CHECKED : UNCHECKED}</td>
                    <td className="text-center">{s.canTeach ? CHECKED : UNCHECKED}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionEn>
      )}

      {data.skillsExcelSummary && data.skillsExcelSummary.length > 0 && (
        <SectionEn title="Skills in Which I Excel">
          <ol className="list-decimal pl-6 space-y-2 text-sm">
            {data.skillsExcelSummary.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </SectionEn>
      )}

      <SectionEn title="Current Japanese Proficiency Level">
        <div className="flex justify-between px-6 py-2 text-base">
          {JLPT_OPTIONS.map((lvl) => (
            <span key={lvl}>
              {lvl} {data.currentJlpt === lvl ? CHECKED : UNCHECKED}
            </span>
          ))}
        </div>
      </SectionEn>

      <SectionEn title="Expected Japanese Proficiency Level to be Achieved by Graduation Time">
        <div className="flex justify-between px-6 py-2 text-base">
          {JLPT_OPTIONS.map((lvl) => (
            <span key={lvl}>
              {lvl} {data.expectedJlpt === lvl ? CHECKED : UNCHECKED}
            </span>
          ))}
        </div>
      </SectionEn>

      {data.otherLanguages ? (
        <SectionEn title="Other languages">
          <p className="text-center text-sm py-1">{data.otherLanguages}</p>
        </SectionEn>
      ) : null}

      {data.japanMotivation && (data.japanMotivation.whyJapan || data.japanMotivation.careerInJapan || data.japanMotivation.challenges) && (
        <SectionEn title="More About Why You Want to Work in Japan">
          <div className="space-y-3">
            {data.japanMotivation.whyJapan && (
              <QAItem
                question="Why do you want to work in Japan? (日本で働きたい理由は何ですか？)"
                answer={data.japanMotivation.whyJapan}
              />
            )}
            {data.japanMotivation.careerInJapan && (
              <QAItem
                question="What kind of career would you like to create in Japan? (日本でどのようなキャリアを作りたいと思いますか？)"
                answer={data.japanMotivation.careerInJapan}
              />
            )}
            {data.japanMotivation.challenges && (
              <QAItem
                question="What challenges do you foresee in adjusting to life in Japan, and how would you address them? (日本生活への適応において、どのような課題を予想し、どう対処しますか？)"
                answer={data.japanMotivation.challenges}
              />
            )}
          </div>
        </SectionEn>
      )}

      {(data.selfPr || data.hobbies) && (
        <SectionEn title="Self-PR & Hobbies">
          {data.selfPr && (
            <p className="text-sm whitespace-pre-wrap">{data.selfPr}</p>
          )}
          {data.hobbies && (
            <p className="text-sm mt-2 text-gray-700">
              <span className="font-bold">Hobbies:</span> {data.hobbies}
            </p>
          )}
        </SectionEn>
      )}
    </div>
  );
}

function QAItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border border-gray-300 p-2 rounded">
      <p className="font-bold text-sm mb-1">{question}</p>
      <p className="text-sm whitespace-pre-wrap">{answer}</p>
    </div>
  );
}

function SectionEn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="resume-section-en">
      <h2 className="resume-section-title-en text-center">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
