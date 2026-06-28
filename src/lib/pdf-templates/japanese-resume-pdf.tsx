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
} from "@/lib/resume-types";

// Register Noto Sans JP for Japanese text rendering
Font.register({
  family: "NotoSansJP",
  src: "/fonts/NotoSansJP.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "NotoSansJP",
    color: "#1a1a1a",
    lineHeight: 1.6,
  },
  title: {
    fontSize: 24,
    fontFamily: "NotoSansJP",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 6,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d4d4d4",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
  },
  th: {
    width: "20%",
    padding: 6,
    fontSize: 9.5,
    fontFamily: "NotoSansJP",
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
    borderRightWidth: 1,
    borderRightColor: "#d4d4d4",
  },
  td: {
    flex: 1,
    padding: 6,
    fontSize: 9.5,
    fontFamily: "NotoSansJP",
  },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "NotoSansJP",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 3,
    marginBottom: 8,
  },
  text: { fontSize: 10, lineHeight: 1.7 },
  declaration: {
    marginTop: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#d4d4d4",
    fontSize: 9,
  },
  declTitle: { fontWeight: "bold", marginBottom: 4 },
  sigLine: {
    marginTop: 12,
    alignSelf: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingHorizontal: 50,
    paddingVertical: 1,
    fontSize: 9,
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
  if (!s) return "—";
  return STATE_JA[s] ?? s;
}

export function JapaneseResumePDF({ data }: { data: ResumeData }) {
  const formatDobJa = (dob?: string) => {
    if (!dob) return "—";
    const d = new Date(dob);
    if (isNaN(d.getTime())) return dob;
    return `${d.getFullYear()}年 ${String(d.getMonth() + 1).padStart(2, "0")}月 ${String(d.getDate()).padStart(2, "0")}日`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>履歴書</Text>

        {/* Personal info table */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.th}>氏名</Text>
            <Text style={styles.td}>
              {data.nameJa || data.name || "—"}
              {data.name ? `（${data.name}）` : ""}
            </Text>
            <Text style={styles.th}>生年月日</Text>
            <Text style={styles.td}>{formatDobJa(data.dob)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.th}>性別</Text>
            <Text style={styles.td}>{genderJa(data.gender)}</Text>
            <Text style={styles.th}>メール</Text>
            <Text style={styles.td}>{data.email || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.th}>国籍</Text>
            <Text style={styles.td}>{nationalityJa(data.nationality)}</Text>
            <Text style={styles.th}>本籍地</Text>
            <Text style={styles.td}>{stateJa(data.placeOfOrigin)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.th}>電話番号</Text>
            <Text style={styles.td}>{data.phone || "—"}</Text>
            <Text style={styles.th}>住所</Text>
            <Text style={styles.td}>{data.address || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.th}>既習言語</Text>
            <Text style={styles.td}>
              {data.languagesJa.length > 0
                ? data.languagesJa.join("、")
                : "—"}
            </Text>
          </View>
        </View>

        {/* Education */}
        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>教育</Text>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={[styles.th, { width: "18%" }]}>年/月</Text>
                <Text style={[styles.th, { width: "24%" }]}>程度</Text>
                <Text style={[styles.th, { width: "58%" }]}>
                  学校 / 学部 / 学科
                </Text>
              </View>
              {data.education.map((edu, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.td, { width: "18%" }]}>{edu.year}</Text>
                  <Text style={[styles.td, { width: "24%" }]}>
                    {edu.degreeJa || edu.degree}
                  </Text>
                  <Text style={[styles.td, { width: "58%" }]}>
                    {edu.fieldJa || edu.field}
                    {"\n"}
                    {edu.institutionJa || edu.institution}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>プロジェクト</Text>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={[styles.th, { width: "20%" }]}>期間</Text>
                <Text style={[styles.th, { width: "30%" }]}>プロジェクト名</Text>
                <Text style={[styles.th, { width: "50%" }]}>内容 / 担当</Text>
              </View>
              {data.projects.map((p, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.td, { width: "20%" }]}>{p.period}</Text>
                  <Text style={[styles.td, { width: "30%" }]}>
                    {p.nameJa || p.name}
                    {p.techStack ? `\n${p.techStack}` : ""}
                  </Text>
                  <Text style={[styles.td, { width: "50%" }]}>
                    {p.descriptionJa || p.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Activities */}
        {data.activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>課外活動</Text>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={[styles.th, { width: "18%" }]}>期間</Text>
                <Text style={[styles.th, { width: "42%" }]}>団体名</Text>
                <Text style={[styles.th, { width: "40%" }]}>担当 / 仕事</Text>
              </View>
              {data.activities.map((a, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.td, { width: "18%" }]}>
                    {a.period}
                    {a.duration ? `\n${a.duration}` : ""}
                  </Text>
                  <Text style={[styles.td, { width: "42%" }]}>
                    {a.organizationJa || a.organization}
                    {"\n"}
                    {a.roleJa || a.role}
                  </Text>
                  <Text style={[styles.td, { width: "40%" }]}>
                    {a.dutiesJa || a.duties}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Awards */}
        {data.awards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>賞 / 実績</Text>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={[styles.th, { width: "15%" }]}>年</Text>
                <Text style={[styles.th, { width: "30%" }]}>タイトル</Text>
                <Text style={[styles.th, { width: "35%" }]}>詳細</Text>
                <Text style={[styles.th, { width: "20%" }]}>機関</Text>
              </View>
              {data.awards.map((aw, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.td, { width: "15%" }]}>{aw.year}</Text>
                  <Text style={[styles.td, { width: "30%" }]}>
                    {aw.titleJa || aw.title}
                  </Text>
                  <Text style={[styles.td, { width: "35%" }]}>
                    {aw.descriptionJa || aw.description}
                  </Text>
                  <Text style={[styles.td, { width: "20%" }]}>
                    {aw.organizationJa || aw.organization}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Self-PR */}
        {(data.selfPrJa || data.selfPr) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>趣味 / 興味 / 自己PR</Text>
            <Text style={styles.text}>{data.selfPrJa || data.selfPr}</Text>
            {data.hobbiesJa ? (
              <Text style={[styles.text, { marginTop: 6, fontSize: 9 }]}>
                趣味: {data.hobbiesJa}
              </Text>
            ) : null}
          </View>
        )}

        {/* Declaration */}
        <View style={styles.declaration}>
          <Text style={styles.declTitle}>宣言</Text>
          <Text style={styles.text}>
            ここに記載したことはすべて、私の知る限りにおいて真実であることを宣言いたします。また、改ざんに対する法的な結果については、自らが責任を負うものとします。
          </Text>
          <Text style={styles.sigLine}>
            氏名: {data.nameJa || data.name}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
