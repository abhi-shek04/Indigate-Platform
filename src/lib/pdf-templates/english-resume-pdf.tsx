"use client";

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  GENDER_OPTIONS,
  NATIONALITY_OPTIONS,
  type ResumeData,
} from "@/lib/resume-types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  header: {
    textAlign: "center",
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
    marginBottom: 18,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  contact: { fontSize: 10, color: "#555", marginTop: 3 },
  meta: { fontSize: 9, color: "#777", marginTop: 2 },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
    paddingBottom: 3,
    marginBottom: 8,
    color: "#1a1a1a",
  },
  entry: { marginBottom: 7 },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  entryDate: { fontSize: 9.5, color: "#666" },
  entrySub: { fontSize: 10, color: "#444", marginTop: 1 },
  entryBody: { fontSize: 10, marginTop: 2, color: "#333" },
  tech: { fontSize: 9, color: "#666", marginTop: 1 },
  summary: { fontSize: 10, lineHeight: 1.6, color: "#333" },
  declaration: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#d4d4d4",
  },
  declText: { fontSize: 8.5, color: "#777", fontStyle: "italic" },
  sigLine: {
    marginTop: 14,
    alignSelf: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingHorizontal: 40,
    paddingVertical: 1,
    fontSize: 9,
  },
});

function genderEn(g?: string) {
  return GENDER_OPTIONS.find((o) => o.value === g)?.labelEn ?? "—";
}
function nationalityEn(n?: string) {
  return n ?? "—";
}

export function EnglishResumePDF({ data }: { data: ResumeData }) {
  const formatDob = (dob?: string) => {
    if (!dob) return "";
    const d = new Date(dob);
    if (isNaN(d.getTime())) return dob;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name || "Your Name"}</Text>
          <Text style={styles.contact}>
            {data.email}
            {data.phone ? `  ·  ${data.phone}` : ""}
            {data.address ? `  ·  ${data.address}` : ""}
          </Text>
          <Text style={styles.meta}>
            {data.dob ? `DOB: ${formatDob(data.dob)}` : ""}
            {data.gender ? `  ·  ${genderEn(data.gender)}` : ""}
            {data.nationality ? `  ·  Nationality: ${nationalityEn(data.nationality)}` : ""}
            {data.placeOfOrigin ? `  ·  ${data.placeOfOrigin}` : ""}
            {data.languages.length > 0
              ? `  ·  Languages: ${data.languages.join(", ")}`
              : ""}
          </Text>
        </View>

        {/* Education */}
        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entryDate}>{edu.year}</Text>
                </View>
                <Text style={styles.entrySub}>
                  {edu.degree} — {edu.field}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((p, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{p.name}</Text>
                  <Text style={styles.entryDate}>{p.period}</Text>
                </View>
                <Text style={styles.entryBody}>{p.description}</Text>
                {p.techStack ? (
                  <Text style={styles.tech}>Tech: {p.techStack}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Activities */}
        {data.activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activities &amp; Leadership</Text>
            {data.activities.map((a, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {a.role} — {a.organization}
                  </Text>
                  <Text style={styles.entryDate}>{a.period}</Text>
                </View>
                <Text style={styles.entryBody}>{a.duties}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Awards */}
        {data.awards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Awards &amp; Achievements</Text>
            {data.awards.map((aw, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{aw.title}</Text>
                  <Text style={styles.entryDate}>{aw.year}</Text>
                </View>
                <Text style={styles.entryBody}>{aw.description}</Text>
                <Text style={styles.tech}>{aw.organization}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Self-PR */}
        {data.selfPr ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.selfPr}</Text>
            {data.hobbies ? (
              <Text style={[styles.summary, { marginTop: 6 }]}>
                Hobbies: {data.hobbies}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Declaration */}
        <View style={styles.declaration}>
          <Text style={styles.declText}>
            I declare that the information provided above is true to the best of
            my knowledge. I understand that I am responsible for any legal
            consequences of falsification.
          </Text>
          <Text style={styles.sigLine}>{data.name}</Text>
        </View>
      </Page>
    </Document>
  );
}
