// Resume builder data model — Japanese 履歴書 (Rirekisho) + English resume.
// Includes dropdown option lists for gender, nationality, Indian states.

export interface ResumeEducation {
  year: string;
  degree: string;
  degreeJa?: string;
  field: string;
  fieldJa?: string;
  institution: string;
  institutionJa?: string;
}

export interface ResumeProject {
  period: string;
  name: string;
  nameJa?: string;
  description: string;
  descriptionJa?: string;
  techStack?: string;
}

export interface ResumeActivity {
  period: string;
  duration?: string;
  organization: string;
  organizationJa?: string;
  role: string;
  roleJa?: string;
  duties: string;
  dutiesJa?: string;
}

export interface ResumeAward {
  year: string;
  title: string;
  titleJa?: string;
  description: string;
  descriptionJa?: string;
  organization: string;
  organizationJa?: string;
}

export interface ResumeData {
  name: string;
  nameJa?: string;
  dob?: string;
  gender?: string; // "male" | "female" | "other" | ""
  email: string;
  phone?: string;
  address?: string;
  nationality?: string; // "India" | "Japan" | ...
  placeOfOrigin?: string; // Indian state name
  languages: string[];
  languagesJa: string[];
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
