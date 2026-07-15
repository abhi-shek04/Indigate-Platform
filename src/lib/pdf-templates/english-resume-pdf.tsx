
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  GENDER_OPTIONS,
  JLPT_OPTIONS,
  computeAge,
  type ResumeData,
} from "@/lib/resume-types";

// Checkmark indicators for the Skills + JLPT proficiency tables.
// Using ASCII brackets because Helvetica doesn't support the Unicode
// checkbox glyphs (☒/☐) — they render as invisible in the PDF.
const CHECKED = "[X]";
const UNCHECKED = "[  ]";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
    lineHeight: 1.45,
  },
  // ── Title row ────────────────────────────────────────────────────────────
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  date: { fontSize: 10, color: "#444" },

  // ── Personal info block ──────────────────────────────────────────────────
  personal: { marginBottom: 12 },
  personalRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  personalLabel: {
    fontFamily: "Helvetica-Bold",
    width: 130,
    fontSize: 10,
  },
  personalValue: { flex: 1, fontSize: 10 },
  personalInline: { fontSize: 10, marginBottom: 4 },

  // ── Section headings ─────────────────────────────────────────────────────
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 3,
    marginBottom: 6,
  },
  // ── Tables (rows of flex columns) ───────────────────────────────────────
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
  rowHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
  },
  cell: {
    padding: 5,
    fontSize: 9.5,
    borderRightWidth: 1,
    borderRightColor: "#d4d4d4",
    lineHeight: 1.35,
  },
  cellLast: {
    padding: 5,
    fontSize: 9.5,
    lineHeight: 1.35,
  },
  cellHeader: {
    padding: 5,
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    borderRightWidth: 1,
    borderRightColor: "#d4d4d4",
  },
  cellHeaderLast: {
    padding: 5,
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
  },
  // ── Skills-in-which-I-excel numbered list ───────────────────────────────
  excelItem: {
    flexDirection: "row",
    marginBottom: 4,
    fontSize: 10,
    lineHeight: 1.5,
  },
  excelNum: {
    width: 18,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  excelText: { flex: 1, fontSize: 10 },

  // ── JLPT proficiency row ────────────────────────────────────────────────
  jlptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  jlptItem: { fontSize: 11, fontFamily: "Helvetica" },

  // ── Other languages line ────────────────────────────────────────────────
  otherLangs: {
    textAlign: "center",
    fontSize: 10,
    marginVertical: 6,
  },

  // ── Japan motivation Q&A ────────────────────────────────────────────────
  qaItem: {
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    padding: 6,
  },
  qaQuestion: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 3,
  },
  qaAnswer: {
    fontSize: 9.5,
    lineHeight: 1.5,
  },
});

function genderEn(g?: string) {
  return GENDER_OPTIONS.find((o) => o.value === g)?.labelEn ?? "";
}

// Format DOB as "DD/MM/YYYY" (matches the sample's "04/04/2005").
function formatDobEn(dob?: string): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return dob;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Today's date as "DD/MM/YYYY".
function todayDdmmyyyy(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function EnglishResumePDF({ data }: { data: ResumeData }) {
  const age = computeAge(data.dob);
  const dobDisplay = formatDobEn(data.dob);
  const dobWithAge = dobDisplay
    ? `${dobDisplay}${age ? ` (Age: ${age})` : ""}`
    : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Title row: "Resume" + Date ─────────────────────────────────── */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Resume</Text>
          <Text style={styles.date}>Date: {todayDdmmyyyy()}</Text>
        </View>

        {/* ── Personal info block ───────────────────────────────────────── */}
        <View style={styles.personal}>
          <View style={styles.personalRow}>
            <Text style={styles.personalLabel}>Your Name :</Text>
            <Text style={styles.personalValue}>{data.name || "—"}</Text>
          </View>

          <View style={styles.personalRow}>
            <Text style={styles.personalValue}>
              {dobWithAge}
              {data.gender ? `  |  ${genderEn(data.gender)}` : ""}
            </Text>
          </View>

          <View style={styles.personalRow}>
            <Text style={styles.personalLabel}>E-Mail :</Text>
            <Text style={styles.personalValue}>{data.email || "—"}</Text>
            <Text style={[styles.personalLabel, { width: 130 }]}>
              Telephone Number:
            </Text>
            <Text style={styles.personalValue}>{data.phone || "—"}</Text>
          </View>

          <View style={styles.personalRow}>
            <Text style={styles.personalLabel}>Address :</Text>
            <Text style={styles.personalValue}>{data.address || "—"}</Text>
          </View>

          <View style={styles.personalRow}>
            <Text style={styles.personalLabel}>Current Degree being Pursued:</Text>
            <Text style={styles.personalValue}>{data.currentDegree || "—"}</Text>
          </View>

          <View style={styles.personalRow}>
            <Text style={styles.personalLabel}>
              Expected time of Graduation:
            </Text>
            <Text style={styles.personalValue}>
              {data.expectedGraduation || "—"}
            </Text>
          </View>
        </View>

        {/* ── Education ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.table}>
            <View style={styles.rowHeader}>
              <Text style={[styles.cellHeader, { width: "12%" }]}>Year</Text>
              <Text style={[styles.cellHeader, { width: "12%" }]}>Month</Text>
              <Text style={[styles.cellHeader, { width: "40%" }]}>School</Text>
              <Text style={[styles.cellHeaderLast, { width: "36%" }]}>
                Degree
              </Text>
            </View>
            {data.education.length === 0 ? (
              <View style={styles.row}>
                <Text style={[styles.cellLast, { width: "100%", color: "#888" }]}>
                  No education entries.
                </Text>
              </View>
            ) : (
              data.education.map((edu, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.cell, { width: "12%" }]}>{edu.year}</Text>
                  <Text style={[styles.cell, { width: "12%" }]}>
                    {edu.month ?? ""}
                  </Text>
                  <Text style={[styles.cell, { width: "40%" }]}>
                    {edu.institution || "—"}
                  </Text>
                  <Text style={[styles.cellLast, { width: "36%" }]}>
                    {edu.degree || edu.field || "—"}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* ── Work Experience (Apprenticeship/Internship) ─────────────── */}
        {data.activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Work Experience (Apprenticeship/Internship)
            </Text>
            <View style={styles.table}>
              <View style={styles.rowHeader}>
                <Text style={[styles.cellHeader, { width: "12%" }]}>Year</Text>
                <Text style={[styles.cellHeader, { width: "12%" }]}>Month</Text>
                <Text style={[styles.cellHeaderLast, { width: "76%" }]}>
                  Description
                </Text>
              </View>
              {data.activities.map((a, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.cell, { width: "12%" }]}>
                    {a.year ?? ""}
                  </Text>
                  <Text style={[styles.cell, { width: "12%" }]}>
                    {a.period || ""}
                  </Text>
                  <Text style={[styles.cellLast, { width: "76%" }]}>
                    {a.role || a.organization
                      ? `${a.role ? a.role + " at " : ""}${a.organization || ""}${
                          a.role || a.organization ? " — " : ""
                        }`
                      : ""}
                    {a.duties || ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Certifications / Achievements ───────────────────────────── */}
        {data.awards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications / Achievements</Text>
            <View style={styles.table}>
              <View style={styles.rowHeader}>
                <Text style={[styles.cellHeader, { width: "12%" }]}>Year</Text>
                <Text style={[styles.cellHeader, { width: "12%" }]}>Month</Text>
                <Text style={[styles.cellHeader, { width: "38%" }]}>Title</Text>
                <Text style={[styles.cellHeaderLast, { width: "38%" }]}>
                  Description
                </Text>
              </View>
              {data.awards.map((aw, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.cell, { width: "12%" }]}>{aw.year}</Text>
                  <Text style={[styles.cell, { width: "12%" }]}>
                    {aw.month ?? ""}
                  </Text>
                  <Text style={[styles.cell, { width: "38%" }]}>
                    {aw.title}
                    {aw.organization ? `\n${aw.organization}` : ""}
                  </Text>
                  <Text style={[styles.cellLast, { width: "38%" }]}>
                    {aw.description || ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Projects / Co-Curricular Activities ─────────────────────── */}
        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Projects / Co-Curricular Activities
            </Text>
            <View style={styles.table}>
              <View style={styles.rowHeader}>
                <Text style={[styles.cellHeader, { width: "12%" }]}>Year</Text>
                <Text style={[styles.cellHeader, { width: "12%" }]}>Month</Text>
                <Text style={[styles.cellHeaderLast, { width: "76%" }]}>
                  Project / Description
                </Text>
              </View>
              {data.projects.map((p, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.cell, { width: "12%" }]}>
                    {p.year ?? ""}
                  </Text>
                  <Text style={[styles.cell, { width: "12%" }]}>
                    {p.period || ""}
                  </Text>
                  <Text style={[styles.cellLast, { width: "76%" }]}>
                    {p.name}
                    {p.techStack ? `\nTech Stack: ${p.techStack}` : ""}
                    {p.description ? `\n${p.description}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Skills table ────────────────────────────────────────────── */}
        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.table}>
              {/* Header row 1: Skill Name + Proficiency Level label */}
              <View style={[styles.rowHeader, { borderBottomWidth: 0 }]}>
                <Text style={[styles.cellHeader, { width: "40%", borderRightWidth: 1, borderRightColor: "#bfbfbf" }]}>
                  Skill Name
                </Text>
                <Text style={[styles.cellHeaderLast, { width: "60%", textAlign: "center" }]}>
                  Proficiency Level
                </Text>
              </View>
              {/* Header row 2: sub-columns */}
              <View style={styles.rowHeader}>
                <Text style={[styles.cellHeader, { width: "40%", borderRightWidth: 1, borderRightColor: "#bfbfbf" }]}>
                  {""}
                </Text>
                <Text style={[styles.cellHeader, { width: "20%", fontSize: 8, textAlign: "center" }]}>
                  Learned in class
                </Text>
                <Text style={[styles.cellHeader, { width: "20%", fontSize: 8, textAlign: "center" }]}>
                  Can operate alone
                </Text>
                <Text style={[styles.cellHeaderLast, { width: "20%", fontSize: 8, textAlign: "center" }]}>
                  Can teach others
                </Text>
              </View>
              {data.skills.map((s, i) => (
                <View key={i} style={styles.row}>
                  <Text style={[styles.cell, { width: "40%" }]}>{s.name}</Text>
                  <Text style={[styles.cell, { width: "20%" }]}>
                    {s.learnedInClass ? CHECKED : UNCHECKED}
                  </Text>
                  <Text style={[styles.cell, { width: "20%" }]}>
                    {s.canOperate ? CHECKED : UNCHECKED}
                  </Text>
                  <Text style={[styles.cellLast, { width: "20%" }]}>
                    {s.canTeach ? CHECKED : UNCHECKED}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Skills in Which I Excel ─────────────────────────────────── */}
        {data.skillsExcelSummary && data.skillsExcelSummary.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills in Which I Excel</Text>
            {data.skillsExcelSummary.map((line, i) => (
              <View key={i} style={styles.excelItem}>
                <Text style={styles.excelNum}>{i + 1}.</Text>
                <Text style={styles.excelText}>{line}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Current Japanese Proficiency Level ──────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Japanese Proficiency Level</Text>
          <View style={styles.jlptRow}>
            {JLPT_OPTIONS.map((lvl) => (
              <Text key={lvl} style={styles.jlptItem}>
                {lvl} {data.currentJlpt === lvl ? CHECKED : UNCHECKED}
              </Text>
            ))}
          </View>
        </View>

        {/* ── Expected Japanese Proficiency Level ─────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Expected Japanese Proficiency Level to be Achieved by Graduation Time
          </Text>
          <View style={styles.jlptRow}>
            {JLPT_OPTIONS.map((lvl) => (
              <Text key={lvl} style={styles.jlptItem}>
                {lvl} {data.expectedJlpt === lvl ? CHECKED : UNCHECKED}
              </Text>
            ))}
          </View>
        </View>

        {/* ── Other languages ─────────────────────────────────────────── */}
        {data.otherLanguages ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other languages</Text>
            <Text style={styles.otherLangs}>{data.otherLanguages}</Text>
          </View>
        ) : null}

        {/* ── More About Why You Want to Work in Japan ────────────────── */}
        {data.japanMotivation &&
          (data.japanMotivation.whyJapan ||
            data.japanMotivation.careerInJapan ||
            data.japanMotivation.challenges) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                More About Why You Want to Work in Japan
              </Text>

              {data.japanMotivation.whyJapan ? (
                <View style={styles.qaItem}>
                  <Text style={styles.qaQuestion}>
                    Why do you want to work in Japan?
                  </Text>
                  <Text style={styles.qaAnswer}>
                    {data.japanMotivation.whyJapan}
                  </Text>
                </View>
              ) : null}

              {data.japanMotivation.careerInJapan ? (
                <View style={styles.qaItem}>
                  <Text style={styles.qaQuestion}>
                    What kind of career would you like to create in Japan?
                  </Text>
                  <Text style={styles.qaAnswer}>
                    {data.japanMotivation.careerInJapan}
                  </Text>
                </View>
              ) : null}

              {data.japanMotivation.challenges ? (
                <View style={styles.qaItem}>
                  <Text style={styles.qaQuestion}>
                    What challenges do you foresee in adjusting to life in Japan,
                    and how would you address them?
                  </Text>
                  <Text style={styles.qaAnswer}>
                    {data.japanMotivation.challenges}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

        {/* ── Self-PR & Hobbies ─────────────────────────────────────── */}
        {(data.selfPr || data.hobbies) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Self-PR &amp; Hobbies</Text>
            {data.selfPr ? (
              <Text style={{ fontSize: 10, lineHeight: 1.5, marginBottom: 4 }}>
                {data.selfPr}
              </Text>
            ) : null}
            {data.hobbies ? (
              <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Hobbies:</Text>{" "}
                {data.hobbies}
              </Text>
            ) : null}
          </View>
        )}
      </Page>
    </Document>
  );
}
