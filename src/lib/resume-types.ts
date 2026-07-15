// Resume builder data model — Japanese 履歴書 (Rirekisho) + English resume.
// Includes dropdown option lists for gender, nationality, Indian states.
//
// Form policy: the candidate only fills in ENGLISH fields. The Japanese PDF
// is generated from the English data — section headers, column names, and
// labels are translated in the template; data values fall back to the English
// string. The `*Ja` fields below remain in the type for backward compatibility
// with previously-saved resumes (and for the optional Katakana reading on the
// name), but they are NOT shown in the resume-builder form anymore.

export interface ResumeEducation {
  year: string; // e.g. "2026"
  month?: string; // e.g. "6" (graduation month)
  degree: string; // EN: combined degree text shown in the "Degree" column
  // (e.g. "Bachelors in Technology with Major in Computer Science.")
  // JP: degree level (e.g. "コンピュータサイエンスとエンジニアリングの理学士")
  degreeJa?: string;
  field: string; // EN: (kept for backward compat) JP: school/department field
  fieldJa?: string;
  institution: string; // EN: school name. JP: university name
  institutionJa?: string;
}

export interface ResumeProject {
  year?: string; // e.g. "2025" (used by the EN Projects table)
  period: string; // EN: month range (e.g. "2-5"); JP: full period text
  name: string;
  nameJa?: string;
  description: string;
  descriptionJa?: string;
  techStack?: string;
}

export interface ResumeActivity {
  year?: string; // e.g. "2025" (used by the EN Work Experience table)
  period: string; // EN: month range (e.g. "1-5"); JP: full period text
  duration?: string; // JP duration display, e.g. "9か月"
  durationJa?: string; // translated duration for the JP resume
  organization: string;
  organizationJa?: string;
  role: string;
  roleJa?: string;
  duties: string;
  dutiesJa?: string;
}

export interface ResumeAward {
  year: string;
  month?: string; // e.g. "4" (used by the EN Certifications table)
  title: string;
  titleJa?: string;
  description: string;
  descriptionJa?: string;
  organization: string;
  organizationJa?: string;
}

// Skill with proficiency flags — matches the sample resume's "Skills" table:
// Skill | Learned in class | Can operate alone | Can teach others
export interface ResumeSkill {
  name: string;
  learnedInClass: boolean;
  canOperate: boolean;
  canTeach: boolean;
}

// "More About Why You Want to Work in Japan" — 3 Q&A fields.
// `japanMotivationJa` stores the AI-translated Japanese version so the English
// resume keeps the English essays and the Japanese resume shows Japanese.
export interface ResumeJapanMotivation {
  whyJapan?: string;
  careerInJapan?: string;
  challenges?: string;
}

export type JlptLevel = "N1" | "N2" | "N3" | "N4" | "N5" | "";

export interface ResumeData {
  name: string;
  nameJa?: string; // optional Katakana reading (kept; not in the EN-only form)
  dob?: string;
  gender?: string; // "male" | "female" | "other" | ""
  email: string;
  phone?: string;
  address?: string;
  nationality?: string; // "India" | "Japan" | ...
  placeOfOrigin?: string; // Indian state name
  languages: string[];
  languagesJa: string[]; // synced from `languages` via LANGUAGE_OPTIONS map

  // Header extras (English resume "Current Degree being Pursued" + "Expected time of Graduation")
  currentDegree?: string;
  expectedGraduation?: string;

  // Skills with proficiency flags + free-text "Skills in Which I Excel" bullet list
  skills: ResumeSkill[];
  skillsExcelSummary?: string[];

  // Japanese proficiency (current + expected by graduation)
  currentJlpt?: JlptLevel;
  expectedJlpt?: JlptLevel;

  // "Other languages" line on the English resume (e.g. "English, Telugu, Hindi")
  otherLanguages?: string;

  // "More About Why You Want to Work in Japan" — 3 Q&A (English + Japanese)
  japanMotivation?: ResumeJapanMotivation;
  japanMotivationJa?: ResumeJapanMotivation;

  education: ResumeEducation[];
  projects: ResumeProject[];
  activities: ResumeActivity[];
  awards: ResumeAward[];
  selfPr?: string;
  selfPrJa?: string;
  hobbies?: string;
  hobbiesJa?: string;
}

export const EMPTY_RESUME: ResumeData = {
  name: "",
  nameJa: "",
  dob: "",
  gender: "",
  email: "",
  phone: "",
  address: "",
  nationality: "",
  placeOfOrigin: "",
  languages: [],
  languagesJa: [],
  currentDegree: "",
  expectedGraduation: "",
  skills: [],
  skillsExcelSummary: [],
  currentJlpt: "",
  expectedJlpt: "",
  otherLanguages: "",
  japanMotivation: {
    whyJapan: "",
    careerInJapan: "",
    challenges: "",
  },
  japanMotivationJa: {
    whyJapan: "",
    careerInJapan: "",
    challenges: "",
  },
  education: [],
  projects: [],
  activities: [],
  awards: [],
  selfPr: "",
  selfPrJa: "",
  hobbies: "",
  hobbiesJa: "",
};

// ----- Dropdown option lists -----

export const GENDER_OPTIONS = [
  { value: "male", labelEn: "Male", labelJa: "男性" },
  { value: "female", labelEn: "Female", labelJa: "女性" },
  { value: "other", labelEn: "Other", labelJa: "その他" },
] as const;

export const NATIONALITY_OPTIONS = [
  { value: "India", labelJa: "インド" },
  { value: "Japan", labelJa: "日本" },
  { value: "United States", labelJa: "アメリカ合衆国" },
  { value: "United Kingdom", labelJa: "イギリス" },
  { value: "Australia", labelJa: "オーストラリア" },
  { value: "Canada", labelJa: "カナダ" },
  { value: "Singapore", labelJa: "シンガポール" },
  { value: "China", labelJa: "中国" },
  { value: "South Korea", labelJa: "韓国" },
  { value: "Vietnam", labelJa: "ベトナム" },
  { value: "Philippines", labelJa: "フィリピン" },
  { value: "Nepal", labelJa: "ネパール" },
  { value: "Sri Lanka", labelJa: "スリランカ" },
  { value: "Bangladesh", labelJa: "バングラデシュ" },
  { value: "Other", labelJa: "その他" },
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "English", labelJa: "英語" },
  { value: "Hindi", labelJa: "ヒンディー語" },
  { value: "Telugu", labelJa: "テルグ語" },
  { value: "Tamil", labelJa: "タミル語" },
  { value: "Kannada", labelJa: "カンナダ語" },
  { value: "Malayalam", labelJa: "マラヤーラム語" },
  { value: "Marathi", labelJa: "マラーティー語" },
  { value: "Bengali", labelJa: "ベンガル語" },
  { value: "Gujarati", labelJa: "グジャラート語" },
  { value: "Punjabi", labelJa: "パンジャーブ語" },
  { value: "Urdu", labelJa: "ウルドゥー語" },
  { value: "Japanese", labelJa: "日本語" },
  { value: "Chinese", labelJa: "中国語" },
  { value: "Korean", labelJa: "韓国語" },
  { value: "French", labelJa: "フランス語" },
  { value: "German", labelJa: "ドイツ語" },
  { value: "Spanish", labelJa: "スペイン語" },
] as const;

export const JLPT_OPTIONS: JlptLevel[] = ["N1", "N2", "N3", "N4", "N5"];

// Japanese translation map for states (for the JP resume)
export const STATE_JA: Record<string, string> = {
  "Andhra Pradesh": "アーンドラ・プラデーシュ",
  "Arunachal Pradesh": "アルナーチャル・プラデーシュ",
  Assam: "アッサム",
  Bihar: "ビハール",
  Chhattisgarh: "チャッティースガル",
  Goa: "ゴア",
  Gujarat: "グジャラート",
  Haryana: "ハリヤーナー",
  "Himachal Pradesh": "ヒマーチャル・プラデーシュ",
  Jharkhand: "ジャールカンド",
  Karnataka: "カルナータカ",
  Kerala: "ケーララ",
  "Madhya Pradesh": "マディヤ・プラデーシュ",
  Maharashtra: "マハーラーシュトラ",
  Manipur: "マニプル",
  Meghalaya: "メガラヤ",
  Mizoram: "ミゾラム",
  Nagaland: "ナガランド",
  Odisha: "オリッサ",
  Punjab: "パンジャーブ",
  Rajasthan: "ラージャスターン",
  Sikkim: "シッキム",
  "Tamil Nadu": "タミル・ナードゥ",
  Telangana: "テランガーナ",
  Tripura: "トリプラ",
  "Uttar Pradesh": "ウッタル・プラデーシュ",
  Uttarakhand: "ウッタラーカンド",
  "West Bengal": "西ベンガル",
  Delhi: "デリー",
  "Jammu and Kashmir": "ジャム・カシミール",
  Ladakh: "ラダック",
  Puducherry: "プドゥッチェリー",
  Chandigarh: "チャンディーガル",
};

// Compute age from a DOB string (YYYY-MM-DD). Returns "" if invalid.
export function computeAge(dob?: string): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return String(age);
}
