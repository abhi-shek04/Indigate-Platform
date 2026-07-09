"use client";

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import {
  GENDER_OPTIONS,
  NATIONALITY_OPTIONS,
  STATE_JA,
  type ResumeData,
  type ResumeSkill,
} from "@/lib/resume-types";

// Register Noto Sans JP for Japanese text rendering
Font.register({
  family: "NotoSansJP",
  src: "/fonts/NotoSansJP.ttf",
});

// Checkmark glyphs used in the Skills proficiency table.
const CHECKED = "☒";
const UNCHECKED = "☐";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "NotoSansJP",
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  title: {
    fontSize: 22,
    fontFamily: "NotoSansJP",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 6,
  },
  section: { marginTop: 12 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "NotoSansJP",
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 3,
    marginBottom: 6,
  },
  // ── Personal info table (2-col label/value rows) ──────────────────────
  table: {
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
  },
  th: {
    width: "22%",
    padding: 6,
    fontSize: 9.5,
    fontFamily: "NotoSansJP",
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    borderRightWidth: 1,
    borderRightColor: "#d4d4d4",
  },
  td: {
    flex: 1,
    padding: 6,
    fontSize: 9.5,
    fontFamily: "NotoSansJP",
    lineHeight: 1.5,
  },
  thQuarter: {
    width: "22%",
    padding: 6,
    fontSize: 9.5,
    fontFamily: "NotoSansJP",
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    borderRightWidth: 1,
    borderRightColor: "#d4d4d4",
  },
  tdQuarter: {
    width: "28%",
    padding: 6,
    fontSize: 9.5,
    fontFamily: "NotoSansJP",
    lineHeight: 1.5,
    borderRightWidth: 1,
    borderRightColor: "#d4d4d4",
  },
  tdLastQuarter: {
    width: "28%",
    padding: 6,
    fontSize: 9.5,
    fontFamily: "NotoSansJP",
    lineHeight: 1.5,
  },
  // ── Skills proficiency table (4-col) ──────────────────────────────────
  skillsHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
  },
  skillsCell: {
    padding: 5,
    fontSize: 9.5,
    fontFamily: "NotoSansJP",
    borderRightWidth: 1,
    borderRightColor: "#d4d4d4",
    lineHeight: 1.4,
  },
  skillsCellLast: {
    padding: 5,
    fontSize: 9.5,
    fontFamily: "NotoSansJP",
    lineHeight: 1.4,
  },
  // ── Self-PR / declaration ──────────────────────────────────────────────
  text: { fontSize: 10, lineHeight: 1.7, fontFamily: "NotoSansJP" },
  declaration: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#d4d4d4",
    fontSize: 9.5,
  },
  declTitle: { fontWeight: "bold", marginBottom: 4, fontFamily: "NotoSansJP" },
  sigLine: {
    marginTop: 12,
    alignSelf: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingHorizontal: 50,
    paddingVertical: 1,
    fontSize: 9.5,
    fontFamily: "NotoSansJP",
  },
});

function genderJa(g?: string) {
  return GENDER_OPTIONS.find((o) => o.value === g)?.labelJa ?? "—";
}
function nationalityJa(n?: string) {
  if (!n) return "—";
  return NATIONALITY_OPTIONS.find((o) => o.value === n)?.labelJa ?? n;
}
function stateJa(s?: string) {
  if (!s) return "同上";
  return STATE_JA[s] ?? s;
}

export function JapaneseResumePDF({ data }: { data: ResumeData }) {
  const formatDobJa = (dob?: string) => {
    if (!dob) return "—";
    const d = new Date(dob);
    if (isNaN(d.getTime())) return dob;
    return `${d.getFullYear()}年 ${String(d.getMonth() + 1).padStart(2, "0")}月 ${String(d.getDate()).padStart(2, "0")}日`;
  };

  // Render one IT skill row (4 columns: name | 初心者 | 中級 | 高度な).
  const skillRow = (s: ResumeSkill, i: number) => {
    // Map the three EN proficiency booleans onto the JP proficiency tiers.
    // Heuristic: if `canTeach` → 高度な; else if `canOperate` → 中級; else 初心者.
    // The "Learned in class" flag is preserved by checking at least 初心者.
    const isBeginner = !s.canOperate && !s.canTeach;
    const isIntermediate = s.canOperate && !s.canTeach;
    const isAdvanced = s.canTeach;
    return (
      <View key={i} style={styles.row}>
        <Text style={[styles.skillsCell, { width: "40%" }]}>{s.name}</Text>
        <Text style={[styles.skillsCell, { width: "20%", textAlign: "center" }]}>
          {isBeginner ? CHECKED : UNCHECKED}
        </Text>
        <Text style={[styles.skillsCell, { width: "20%", textAlign: "center" }]}>
          {isIntermediate ? CHECKED : UNCHECKED}
        </Text>
        <Text style={[styles.skillsCellLast, { width: "20%", textAlign: "center" }]}>
          {isAdvanced ? CHECKED : UNCHECKED}
        </Text>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>履歴書</Text>

        {/* ── Personal info ────────────────────────────────────────────── */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.thQuarter}>氏名</Text>
            <Text style={styles.tdQuarter}>
              {data.name || "—"}
              {data.nameJa ? `（${data.nameJa}）` : ""}
            </Text>
            <Text style={styles.thQuarter}>生年月日</Text>
            <Text style={styles.tdLastQuarter}>{formatDobJa(data.dob)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.thQuarter}>性別</Text>
            <Text style={styles.tdQuarter}>{genderJa(data.gender)}</Text>
            <Text style={styles.thQuarter}>メールアドレス</Text>
            <Text style={styles.tdLastQuarter}>{data.email || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.thQuarter}>国籍</Text>
            <Text style={styles.tdQuarter}>{nationalityJa(data.nationality)}</Text>
            <Text style={styles.thQuarter}>本籍地</Text>
            <Text style={styles.tdLastQuarter}>{stateJa(data.placeOfOrigin)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.thQuarter}>電話番号</Text>
            <Text style={styles.tdQuarter}>{data.phone || "—"}</Text>
            <Text style={styles.thQuarter}>住所</Text>
            <Text style={styles.tdLastQuarter}>{data.address || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.thQuarter}>既習言語</Text>
            <Text style={[styles.tdLastQuarter, { width: "78%" }]}>
              {data.languagesJa.length > 0
                ? data.languagesJa.join("、")
                : data.languages.length > 0
                  ? data.languages.join("、")
                  : "—"}
            </Text>
          </View>
        </View>

        {/* ── 教育 ────────────────────────────────────────────────────── */}
        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>教育</Text>
            <View style={styles.table}>
              <View style={styles.skillsHeaderRow}>
                <Text style={[styles.skillsCell, { width: "18%", fontWeight: "bold" }]}>
                  年/月
                </Text>
                <Text style={[styles.skillsCell, { width: "26%", fontWeight: "bold" }]}>
                  程度
                </Text>
                <Text style={[styles.skillsCell, { width: "30%", fontWeight: "bold" }]}>
                  学校 / 学部 / 学科
                </Text>
                <Text style={[styles.skillsCellLast, { width: "26%", fontWeight: "bold" }]}>
                  大学
                </Text>
              </View>
              {data.education.map((edu, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.skillsCell, { width: "18%" }]}>
                    {edu.year}
                    {edu.month ? ` / ${edu.month}` : ""}
                  </Text>
                  <Text style={[styles.skillsCell, { width: "26%" }]}>
                    {edu.degreeJa || edu.degree || "—"}
                  </Text>
                  <Text style={[styles.skillsCell, { width: "30%" }]}>
                    {edu.fieldJa || edu.field || "—"}
                  </Text>
                  <Text style={[styles.skillsCellLast, { width: "26%" }]}>
                    {edu.institutionJa || edu.institution || "—"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── プロジェクト ────────────────────────────────────────────── */}
        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>プロジェクト</Text>
            <View style={styles.table}>
              <View style={styles.skillsHeaderRow}>
                <Text style={[styles.skillsCell, { width: "18%", fontWeight: "bold" }]}>
                  年 / 月
                </Text>
                <Text style={[styles.skillsCell, { width: "32%", fontWeight: "bold" }]}>
                  プロジェクト名
                </Text>
                <Text style={[styles.skillsCellLast, { width: "50%", fontWeight: "bold" }]}>
                  プロジェクトの内容 / 担当
                </Text>
              </View>
              {data.projects.map((p, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.skillsCell, { width: "18%" }]}>
                    {p.period || (p.year ?? "")}
                  </Text>
                  <Text style={[styles.skillsCell, { width: "32%" }]}>
                    {p.nameJa || p.name || "—"}
                    {p.techStack ? `\n技術: ${p.techStack}` : ""}
                  </Text>
                  <Text style={[styles.skillsCellLast, { width: "50%" }]}>
                    {p.descriptionJa || p.description || ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── ITスキル ────────────────────────────────────────────────── */}
        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ITスキル</Text>
            <View style={styles.table}>
              <View style={styles.skillsHeaderRow}>
                <Text style={[styles.skillsCell, { width: "40%", fontWeight: "bold" }]}>
                  スキル名
                </Text>
                <Text style={[styles.skillsCell, { width: "20%", fontWeight: "bold", textAlign: "center" }]}>
                  初心者
                </Text>
                <Text style={[styles.skillsCell, { width: "20%", fontWeight: "bold", textAlign: "center" }]}>
                  中級
                </Text>
                <Text style={[styles.skillsCellLast, { width: "20%", fontWeight: "bold", textAlign: "center" }]}>
                  高度な
                </Text>
              </View>
              {data.skills.map((s, i) => skillRow(s, i))}
            </View>
          </View>
        )}

        {/* ── 免許・資格 ─────────────────────────────────────────────── */}
        {data.awards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>免許・資格</Text>
            <View style={styles.table}>
              <View style={styles.skillsHeaderRow}>
                <Text style={[styles.skillsCell, { width: "18%", fontWeight: "bold" }]}>
                  年 / 月
                </Text>
                <Text style={[styles.skillsCell, { width: "32%", fontWeight: "bold" }]}>
                  タイトル
                </Text>
                <Text style={[styles.skillsCellLast, { width: "50%", fontWeight: "bold" }]}>
                  機関 / 組織 / 内容
                </Text>
              </View>
              {data.awards.map((aw, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.skillsCell, { width: "18%" }]}>
                    {aw.year}
                    {aw.month ? ` / ${aw.month}` : ""}
                  </Text>
                  <Text style={[styles.skillsCell, { width: "32%" }]}>
                    {aw.titleJa || aw.title || "—"}
                  </Text>
                  <Text style={[styles.skillsCellLast, { width: "50%" }]}>
                    {aw.organizationJa || aw.organization || ""}
                    {aw.descriptionJa || aw.description
                      ? `\n${aw.descriptionJa || aw.description}`
                      : ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── インターンシップ / 実務経験 ─────────────────────────────── */}
        {data.activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>インターンシップ / 実務経験</Text>
            <View style={styles.table}>
              <View style={styles.skillsHeaderRow}>
                <Text style={[styles.skillsCell, { width: "22%", fontWeight: "bold" }]}>
                  年 / 月
                </Text>
                <Text style={[styles.skillsCell, { width: "28%", fontWeight: "bold" }]}>
                  会社名・団体名
                </Text>
                <Text style={[styles.skillsCell, { width: "32%", fontWeight: "bold" }]}>
                  担当部署 / 仕事内容
                </Text>
                <Text style={[styles.skillsCellLast, { width: "18%", fontWeight: "bold" }]}>
                  期間
                </Text>
              </View>
              {data.activities.map((a, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.skillsCell, { width: "22%" }]}>
                    {a.period || (a.year ?? "")}
                  </Text>
                  <Text style={[styles.skillsCell, { width: "28%" }]}>
                    {a.organizationJa || a.organization || "—"}
                    {(a.roleJa || a.role)
                      ? `\n${a.roleJa || a.role}`
                      : ""}
                  </Text>
                  <Text style={[styles.skillsCell, { width: "32%" }]}>
                    {a.dutiesJa || a.duties || ""}
                  </Text>
                  <Text style={[styles.skillsCellLast, { width: "18%" }]}>
                    {a.duration || ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── 趣味 / 興味 / 自己PR ───────────────────────────────────── */}
        {(data.selfPrJa || data.selfPr || data.hobbiesJa || data.hobbies) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>趣味 / 興味 / 自己PR</Text>
            {data.selfPrJa || data.selfPr ? (
              <Text style={styles.text}>{data.selfPrJa || data.selfPr}</Text>
            ) : null}
            {data.hobbiesJa || data.hobbies ? (
              <Text style={[styles.text, { marginTop: 6, fontSize: 9.5 }]}>
                趣味: {data.hobbiesJa || data.hobbies}
              </Text>
            ) : null}
          </View>
        )}

        {/* ── 宣言 ────────────────────────────────────────────────────── */}
        <View style={styles.declaration}>
          <Text style={styles.declTitle}>宣言</Text>
          <Text style={styles.text}>
            ここに記載したことはすべて、私の知る限りにおいて真実であることを宣言いたします。また、改ざんに対する法的な結果については、自らが責任を負うものとします。
          </Text>
          <Text style={styles.sigLine}>氏名: {data.nameJa || data.name || "—"}</Text>
        </View>
      </Page>
    </Document>
  );
}
