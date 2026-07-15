import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const J = (v: unknown) => JSON.stringify(v);

async function main() {
  console.log("🌱 Seeding IndiGate database...");

  // --- Admin ---
  const adminHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@indigate.work" },
    update: {},
    create: {
      email: "admin@indigate.work",
      passwordHash: adminHash,
      role: "ADMIN",
      name: "Admin",
      isVerified: true,
    },
  });

  // --- Companies (approved) ---
  const companyUsers = [
    {
      email: "hr@technova.jp",
      companyName: "TechNova Japan",
      industry: "IT Services",
      locationJapan: "Tokyo, Japan",
      description:
        "TechNova Japan builds cloud-native platforms for the Japanese enterprise market. We hire bilingual engineers and sponsor visas for top Indian talent.",
      website: "https://technova.example.jp",
      employeeCount: "250-500",
      logoColor: "#0ea5e9",
    },
    {
      email: "recruit@sakurasoft.jp",
      companyName: "SakuraSoft",
      industry: "Software Product",
      locationJapan: "Osaka, Japan",
      description:
        "SakuraSoft crafts delightful consumer apps used by 4M+ Japanese users. Our team values craft, calm engineering, and cross-cultural collaboration.",
      website: "https://sakurasoft.example.jp",
      employeeCount: "50-100",
      logoColor: "#ec4899",
    },
    {
      email: "careers@mitsui-eng.jp",
      companyName: "Mitsui Engineering",
      industry: "Engineering & Manufacturing",
      locationJapan: "Nagoya, Japan",
      description:
        "Mitsui Engineering designs next-generation mobility systems. We welcome mechanical and embedded software engineers from India.",
      website: "https://mitsui-eng.example.jp",
      employeeCount: "1000+",
      logoColor: "#16a34a",
    },
    {
      email: "hr@hikari-finance.jp",
      companyName: "Hikari Finance",
      industry: "FinTech",
      locationJapan: "Tokyo, Japan",
      description:
        "Hikari Finance is reimagining payments for Japan. We hire data scientists and backend engineers who love clean systems.",
      website: "https://hikari.example.jp",
      employeeCount: "100-250",
      logoColor: "#f59e0b",
    },
    {
      email: "people@kintaro-logi.jp",
      companyName: "Kintaro Logistics",
      industry: "Logistics & Supply Chain",
      locationJapan: "Yokohama, Japan",
      description:
        "Kintaro Logistics runs Japan's smartest warehouse network. We hire operations analysts and supply-chain engineers.",
      website: "https://kintaro.example.jp",
      employeeCount: "500-1000",
      logoColor: "#8b5cf6",
    },
  ];

  const companies: any[] = [];
  for (const cu of companyUsers) {
    const hash = await bcrypt.hash("company123", 10);
    const user = await prisma.user.upsert({
      where: { email: cu.email },
      update: {},
      create: {
        email: cu.email,
        passwordHash: hash,
        role: "COMPANY",
        name: cu.companyName,
        isVerified: true,
      },
    });
    const profile = await prisma.companyProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        companyName: cu.companyName,
        industry: cu.industry,
        locationJapan: cu.locationJapan,
        description: cu.description,
        website: cu.website,
        employeeCount: cu.employeeCount,
        logoUrl: cu.logoColor,
        isApproved: true,
        approvedAt: new Date(),
      },
    });
    companies.push(profile);
  }

  // --- One pending company ---
  const pendingHash = await bcrypt.hash("company123", 10);
  const pendingUser = await prisma.user.upsert({
    where: { email: "join@aurora-robotics.jp" },
    update: {},
    create: {
      email: "join@aurora-robotics.jp",
      passwordHash: pendingHash,
      role: "COMPANY",
      name: "Aurora Robotics",
      isVerified: true,
    },
  });
  await prisma.companyProfile.upsert({
    where: { userId: pendingUser.id },
    update: {},
    create: {
      userId: pendingUser.id,
      companyName: "Aurora Robotics",
      industry: "Robotics & AI",
      locationJapan: "Kobe, Japan",
      description:
        "Aurora Robotics builds humanoid robots for Japanese warehouses. Awaiting Indobox approval.",
      website: "https://aurora.example.jp",
      employeeCount: "10-50",
      logoUrl: "#14b8a6",
      isApproved: false,
    },
  });

  // --- Jobs ---
  const jobsData = [
    {
      companyIdx: 0,
      title: "Senior Backend Engineer (Go)",
      titleJa: "シニアバックエンドエンジニア（Go）",
      description:
        "Join TechNova's payments platform team. You will design and operate high-throughput Go services serving Japanese enterprise clients. We sponsor visas and provide full relocation support to Tokyo, including Japanese language coaching.",
      descriptionJa:
        "TechNovaの決済プラットフォームチームに参加し、Go言語で高スループットなサービスを設計・運用します。ビザスポンサーシップと東京への移住サポートを提供します。",
      location: "Tokyo, Japan",
      jobType: "FULL_TIME",
      jlptRequired: "N3",
      salaryMin: 600000,
      salaryMax: 900000,
      salaryType: "MONTHLY",
      skills: ["Go", "PostgreSQL", "Kubernetes", "gRPC", "AWS"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
    {
      companyIdx: 1,
      title: "Frontend Engineer (React/TypeScript)",
      titleJa: "フロントエンドエンジニア（React/TypeScript）",
      description:
        "SakuraSoft is looking for a React engineer to build the next generation of our consumer apps. You will collaborate with Japanese designers and ship to millions of users. JLPT N3 or willingness to learn is preferred.",
      descriptionJa:
        "Reactエンジニアを募集しています。日本のデザイナーと協力し、数百万ユーザーに届くプロダクトを開発します。",
      location: "Osaka, Japan",
      jobType: "FULL_TIME",
      jlptRequired: "N4",
      salaryMin: 500000,
      salaryMax: 750000,
      salaryType: "MONTHLY",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Figma"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
    },
    {
      companyIdx: 2,
      title: "Embedded Software Engineer (Automotive)",
      titleJa: "組み込みソフトウェアエンジニア（自動車）",
      description:
        "Mitsui Engineering seeks an embedded C/C++ engineer for next-gen EV powertrain systems. Located in Nagoya, Japan's automotive heart. Visa sponsorship and housing assistance provided.",
      descriptionJa:
        "次世代EV用の組み込みエンジニアを募集。名古屋勤務、ビザサポートあり。",
      location: "Nagoya, Japan",
      jobType: "FULL_TIME",
      jlptRequired: "N4",
      salaryMin: 550000,
      salaryMax: 800000,
      salaryType: "MONTHLY",
      skills: ["C", "C++", "RTOS", "CAN", "Embedded Linux"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40),
    },
    {
      companyIdx: 3,
      title: "Data Scientist — Risk & Fraud",
      titleJa: "データサイエンティスト — リスク・不正検知",
      description:
        "Hikari Finance is hiring a data scientist to build fraud-detection models on Japanese payment data. Strong Python + ML background required. Tokyo office with hybrid work.",
      descriptionJa:
        "不正検知モデルを構築するデータサイエンティストを募集。東京オフィス、ハイブリッド勤務。",
      location: "Tokyo, Japan",
      jobType: "FULL_TIME",
      jlptRequired: "N3",
      salaryMin: 650000,
      salaryMax: 950000,
      salaryType: "MONTHLY",
      skills: ["Python", "scikit-learn", "SQL", "Pandas", "ML Ops"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    },
    {
      companyIdx: 4,
      title: "Supply Chain Analyst",
      titleJa: "サプライチェーンアナリスト",
      description:
        "Kintaro Logistics needs an analyst to optimize warehouse flows across 14 Japanese sites. SQL + Tableau + a love for operations. Yokohama-based with quarterly site travel.",
      descriptionJa:
        "14拠点の倉庫フローを最適化するアナリストを募集。横浜勤務。",
      location: "Yokohama, Japan",
      jobType: "FULL_TIME",
      jlptRequired: "N4",
      salaryMin: 450000,
      salaryMax: 620000,
      salaryType: "MONTHLY",
      skills: ["SQL", "Tableau", "Excel", "Power BI", "Operations"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35),
    },
    {
      companyIdx: 0,
      title: "DevOps Engineer (AWS)",
      titleJa: "DevOpsエンジニア（AWS）",
      description:
        "TechNova's platform team needs a DevOps engineer to own our AWS infrastructure and CI/CD. Terraform, EKS, and observability stack. On-call rotation with Japanese colleagues.",
      descriptionJa:
        "AWSインフラとCI/CDを担うDevOpsエンジニアを募集。",
      location: "Tokyo, Japan (Hybrid)",
      jobType: "FULL_TIME",
      jlptRequired: "N4",
      salaryMin: 580000,
      salaryMax: 820000,
      salaryType: "MONTHLY",
      skills: ["AWS", "Terraform", "EKS", "ArgoCD", "Grafana"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
    },
    {
      companyIdx: 1,
      title: "Mobile Engineer (iOS/Swift)",
      titleJa: "モバイルエンジニア（iOS/Swift）",
      description:
        "SakuraSoft is hiring an iOS engineer to rebuild our flagship app in Swift. You will work closely with product and design in Osaka. Relocation support available.",
      descriptionJa:
        "Swiftで旗艦アプリを再構築するiOSエンジニアを募集。大阪勤務。",
      location: "Osaka, Japan",
      jobType: "FULL_TIME",
      jlptRequired: "N4",
      salaryMin: 520000,
      salaryMax: 740000,
      salaryType: "MONTHLY",
      skills: ["Swift", "SwiftUI", "Combine", "iOS", "Xcode"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 32),
    },
    {
      companyIdx: 3,
      title: "Backend Engineer (Java/Spring)",
      titleJa: "バックエンドエンジニア（Java/Spring）",
      description:
        "Hikari Finance's core banking team needs a Java/Spring engineer. You will modernize legacy Japanese banking systems. Strong Java + relational DB experience required.",
      descriptionJa:
        "コアバンキングチームのJava/Springエンジニアを募集。",
      location: "Tokyo, Japan",
      jobType: "FULL_TIME",
      jlptRequired: "N3",
      salaryMin: 600000,
      salaryMax: 850000,
      salaryType: "MONTHLY",
      skills: ["Java", "Spring Boot", "Oracle", "Kafka", "Microservices"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22),
    },
    {
      companyIdx: 2,
      title: "Mechanical Design Engineer",
      titleJa: "機械設計エンジニア",
      description:
        "Mitsui Engineering needs a mechanical design engineer for EV battery packs. SolidWorks + thermal simulation. Nagoya, with visa sponsorship.",
      descriptionJa:
        "EVバッテリーパックの機械設計エンジニアを募集。名古屋勤務。",
      location: "Nagoya, Japan",
      jobType: "FULL_TIME",
      jlptRequired: "NONE",
      salaryMin: 480000,
      salaryMax: 680000,
      salaryType: "MONTHLY",
      skills: ["SolidWorks", "Thermal Analysis", "GD&T", "Manufacturing"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    },
    {
      companyIdx: 0,
      title: "AI/ML Engineer (LLM Apps)",
      titleJa: "AI/MLエンジニア（LLMアプリ）",
      description:
        "TechNova's AI lab is hiring an LLM application engineer. Build Japanese-language assistants for enterprise customers. PyTorch + RAG + evaluation background.",
      descriptionJa:
        "LLMアプリケーションエンジニアを募集。日本語アシスタントを構築。",
      location: "Tokyo, Japan (Remote OK)",
      jobType: "FULL_TIME",
      jlptRequired: "N3",
      salaryMin: 700000,
      salaryMax: 1000000,
      salaryType: "MONTHLY",
      skills: ["PyTorch", "LangChain", "RAG", "Python", "Vector DB"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
    },
    {
      companyIdx: 4,
      title: "Software Engineer Intern (Summer 2025)",
      titleJa: "ソフトウェアエンジニアインターン（夏2025）",
      description:
        "Kintaro Logistics offers a 10-week summer internship in Yokohama. Build a real internal tool. Open to students with JLPT N4+ and a passion for Japan.",
      descriptionJa:
        "10週間の夏インターンシップ。横浜勤務。",
      location: "Yokohama, Japan",
      jobType: "INTERNSHIP",
      jlptRequired: "N4",
      salaryMin: 2500,
      salaryMax: 3000,
      salaryType: "HOURLY",
      skills: ["JavaScript", "Python", "SQL", "Student"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    },
    {
      companyIdx: 1,
      title: "UI/UX Designer (Bilingual)",
      titleJa: "UI/UXデザイナー（バイリンガル）",
      description:
        "SakuraSoft seeks a bilingual (EN/JA) product designer. Own end-to-end design for a new app. Figma mastery + portfolio required. Osaka, hybrid.",
      descriptionJa:
        "バイリンガルプロダクトデザイナーを募集。大阪、ハイブリッド。",
      location: "Osaka, Japan",
      jobType: "CONTRACT",
      jlptRequired: "N2",
      salaryMin: 550000,
      salaryMax: 780000,
      salaryType: "MONTHLY",
      skills: ["Figma", "Prototyping", "Design Systems", "User Research"],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 27),
    },
  ];

  const jobs: any[] = [];
  for (const jd of jobsData) {
    const company = companies[jd.companyIdx];
    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title: jd.title,
        titleJa: jd.titleJa,
        description: jd.description,
        descriptionJa: jd.descriptionJa,
        location: jd.location,
        jobType: jd.jobType,
        jlptRequired: jd.jlptRequired,
        salaryMin: jd.salaryMin,
        salaryMax: jd.salaryMax,
        salaryType: jd.salaryType,
        currency: "JPY",
        skillsRequired: J(jd.skills),
        isActive: true,
        deadline: jd.deadline,
        postedAt: new Date(
          Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 14)
        ),
      },
    });
    jobs.push(job);
  }

  // --- Candidates ---
  const candidatesData = [
    {
      email: "arjun@example.com",
      fullName: "Arjun Sharma",
      phone: "+91 98765 43210",
      bio: "Full-stack engineer with 5 years building scalable web apps. Passionate about Japanese culture, N3 certified, relocating to Tokyo.",
      location: "Bengaluru, India",
      jlptLevel: "N3",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      experienceYears: 5,
      linkedinUrl: "https://linkedin.com/in/arjun",
    },
    {
      email: "priya@example.com",
      fullName: "Priya Iyer",
      phone: "+91 90000 11111",
      bio: "Data scientist with 3 years in fintech. N4 Japanese, eager to grow in Tokyo's payments scene.",
      location: "Hyderabad, India",
      jlptLevel: "N4",
      skills: ["Python", "ML", "SQL", "Pandas", "scikit-learn"],
      experienceYears: 3,
      linkedinUrl: "https://linkedin.com/in/priya",
    },
    {
      email: "rohan@example.com",
      fullName: "Rohan Mehta",
      phone: "+91 88888 22222",
      bio: "Embedded C engineer with 6 years in automotive. N4, open to Nagoya relocation.",
      location: "Pune, India",
      jlptLevel: "N4",
      skills: ["C", "C++", "RTOS", "CAN", "Embedded Linux"],
      experienceYears: 6,
      linkedinUrl: "https://linkedin.com/in/rohan",
    },
    {
      email: "ananya@example.com",
      fullName: "Ananya Reddy",
      phone: "+91 99999 33333",
      bio: "Product designer, bilingual EN/JA (N2). 4 years shipping consumer apps.",
      location: "Mumbai, India",
      jlptLevel: "N2",
      skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
      experienceYears: 4,
      linkedinUrl: "https://linkedin.com/in/ananya",
    },
    {
      email: "vikram@example.com",
      fullName: "Vikram Nair",
      phone: "+91 97777 44444",
      bio: "DevOps engineer (AWS) with 4 years. N3, loves sushi and clean infra.",
      location: "Chennai, India",
      jlptLevel: "N3",
      skills: ["AWS", "Terraform", "Kubernetes", "ArgoCD"],
      experienceYears: 4,
      linkedinUrl: "https://linkedin.com/in/vikram",
    },
  ];

  const candidates: any[] = [];
  for (const cd of candidatesData) {
    const hash = await bcrypt.hash("candidate123", 10);
    const user = await prisma.user.upsert({
      where: { email: cd.email },
      update: {},
      create: {
        email: cd.email,
        passwordHash: hash,
        role: "CANDIDATE",
        name: cd.fullName,
        isVerified: true,
      },
    });
    const profile = await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: cd.fullName,
        phone: cd.phone,
        bio: cd.bio,
        location: cd.location,
        jlptLevel: cd.jlptLevel,
        skills: J(cd.skills),
        experienceYears: cd.experienceYears,
        linkedinUrl: cd.linkedinUrl,
        resumeUrl: "https://example.com/resume.pdf",
        resumeName: `${cd.fullName.replace(/\s/g, "_")}_Resume.pdf`,
        education: J([
          {
            degree: "B.Tech",
            field: "Computer Science",
            institution: "IIT Madras",
            year: "2019",
          },
        ]),
        savedJobIds: J([jobs[0]?.id, jobs[4]?.id].filter(Boolean)),
      },
    });
    candidates.push(profile);
  }

  // --- Applications ---
  const statuses = [
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEWED",
    "OFFERED",
    "REJECTED",
    "APPLIED",
    "SHORTLISTED",
  ];
  let appCount = 0;
  for (const c of candidates) {
    const numApps = 2 + Math.floor(Math.random() * 3);
    const chosen = new Set<number>();
    for (let i = 0; i < numApps && i < jobs.length; i++) {
      let idx = Math.floor(Math.random() * jobs.length);
      while (chosen.has(idx)) idx = Math.floor(Math.random() * jobs.length);
      chosen.add(idx);
      const job = jobs[idx];
      try {
        await prisma.application.create({
          data: {
            candidateId: c.id,
            jobId: job.id,
            status: statuses[appCount % statuses.length],
            coverNote:
              "I am excited to bring my skills to your team and grow in Japan.",
            resumeUrlSnapshot: "https://example.com/resume.pdf",
            appliedAt: new Date(
              Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 12)
            ),
          },
        });
        appCount++;
      } catch {
        // unique constraint skip
      }
    }
  }

  // --- Notifications ---
  await prisma.notification.createMany({
    data: [
      {
        userId: candidates[0].userId,
        title: "Application Shortlisted",
        message:
          "Congratulations! TechNova Japan shortlisted your application for Senior Backend Engineer.",
        isRead: false,
      },
      {
        userId: candidates[0].userId,
        title: "New job matching your skills",
        message: "A new AI/ML Engineer role matches your profile.",
        isRead: false,
      },
      {
        userId: companies[0].userId,
        title: "New application received",
        message: "Arjun Sharma applied to Senior Backend Engineer (Go).",
        isRead: false,
      },
      {
        userId: admin.id,
        title: "Company pending approval",
        message: "Aurora Robotics is awaiting admin approval.",
        isRead: false,
      },
    ],
  });

  // --- Testimonials ---
  await prisma.testimonial.createMany({
    data: [
      {
        name: "Arjun Sharma",
        role: "Backend Engineer",
        company: "TechNova Japan",
        content:
          "IndiGate made my move to Tokyo seamless. From resume to visa, the team guided me at every step. I'm now building payments infra I love.",
        contentJa:
          "IndiGateのおかげで東京への移住がスムーズでした。履歴書からビザまで、すべてのステップでサポートしてもらいました。",
        order: 1,
      },
      {
        name: "Ananya Reddy",
        role: "Product Designer",
        company: "SakuraSoft",
        content:
          "As a bilingual designer, I was nervous about finding the right fit. IndiGate matched me with SakuraSoft in two weeks. Best decision ever.",
        contentJa:
          "バイリンガルデザイナーとして最適な職場を見つけるのに不安がありましたが、IndiGateが2週間でSakuraSoftとマッチングしてくれました。",
        order: 2,
      },
      {
        name: "Rohan Mehta",
        role: "Embedded Engineer",
        company: "Mitsui Engineering",
        content:
          "From Pune to Nagoya — IndiGate handled the whole journey. I'm now working on EV powertrains for Japan's top automakers.",
        contentJa:
          "プネーから名古屋へ。IndiGateが全行程をサポートしてくれました。",
        order: 3,
      },
      {
        name: "Kenji Tanaka",
        role: "HR Director",
        company: "Hikari Finance",
        content:
          "We hired three brilliant engineers from India through IndiGate. The quality of candidates and the platform's bilingual flow are outstanding.",
        contentJa:
          "IndiGateを通じてインドから3人の優秀なエンジニアを採用しました。候補者の質とプラットフォームのバイリンガル設計は素晴らしいです。",
        order: 4,
      },
    ],
  });

  console.log("✅ Seed complete:", {
    companies: companies.length,
    jobs: jobs.length,
    candidates: candidates.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
