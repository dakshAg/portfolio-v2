export const site = {
  name: "Daksh Agrawal",
  tagline: "Founder's energy, merchant's instinct, engineer's craft, analyst's eye.",
  email: "dakshagrawalx@gmail.com",
  phone: "+61 435 259 702",
  phoneHref: "tel:+61435259702",
  location: "Melbourne, Australia",
  resume: "/Daksh_Agrawal_Resume.pdf",
  substack: "https://dakshagrawal.substack.com/",
  linkedin: "https://www.linkedin.com/in/daksh-agrawal/",
  github: "https://github.com/dakshAg",
  roles: ["data scientist", "founder", "engineer", "tutor", "builder"],
};

export type NavItem = { href: string; label: string; external?: boolean };

export const nav: NavItem[] = [
  { href: "/#work", label: "Work" },
  { href: "/#projects", label: "Projects" },
  { href: "/blog", label: "Writing" },
  { href: "/gallery", label: "Gallery" },
  { href: "/tech-stack", label: "Stack" },
];

export type Experience = {
  company: string;
  role: string;
  period: string;
  summary: string;
  logo: string;
  href?: string;
};

export const experience: Experience[] = [
  {
    company: "Cruz Trading",
    role: "Head of Data",
    period: "2026 — now",
    summary:
      "Engineered low-latency data pipelines for financial markets, powering quant trading strategies on prediction markets.",
    logo: "/images/work/cruz_trading.jpeg",
  },
  {
    company: "Square Peg",
    role: "Data Scientist, Global Tech Fund",
    period: "2025",
    summary:
      "Drove high-conviction investment decisions by engineering ML valuation models and alternative data pipelines (Talent Density) that directly informed Investment Committee strategy.",
    logo: "/images/work/square-peg.jpeg",
    href: "https://www.squarepeg.vc/global-tech-fund",
  },
  {
    company: "G7 Smart Logistics",
    role: "Chief Technology Officer",
    period: "2024 — 2025",
    summary:
      "Built the end-to-end architecture (Hono, Supabase, Android, Next.js) to digitise offline workflows for a network of 10,000+ truckers. Scaled the platform to 8,000+ daily bookings and secured seed funding.",
    logo: "/images/work/g7.jpg",
    href: "https://g7smartlogistics.com/",
  },
  {
    company: "University of Melbourne",
    role: "Academic Tutor",
    period: "2023 — 2025",
    summary:
      "Boosted pass rates by 18% for cohorts of 200+ students by engineering gamified Python and algorithm learning modules.",
    logo: "/images/work/unimelb.png",
    href: "https://github.com/dakshAg/comp10001",
  },
  {
    company: "TasWater",
    role: "Data Analyst Intern",
    period: "2024 — 2025",
    summary:
      "Secured a Graduate Data Science return offer by engineering Power BI solutions that reduced reporting overhead by 70% and optimised insights for a $1B+ asset portfolio.",
    logo: "/images/work/taswater.jpeg",
    href: "https://www.taswater.com.au/about-us/careers/summer-placement-program",
  },
];

export const education = {
  school: "University of Melbourne",
  degree: "B.Sc. Data Science",
  detail: "First Class Honours (H1) · Dean's Honours List",
  logo: "/images/graduation-hat.png",
};

export type ProjectLink = { label: string; href: string };

export type Project = {
  title: string;
  description: string;
  year: string;
  tags: string[];
  image: string;
  icon: string;
  links: ProjectLink[];
  featured?: boolean;
};

export const projects: Project[] = [
  {
    title: "Puddle",
    description:
      "Visualise heaps of anything — money, people, monsters — to get an estimate of scale.",
    year: "2026",
    tags: ["Visualisation", "Interactive", "Web"],
    image: "/images/projects/puddle.png",
    icon: "/images/projects/puddle-icon.png",
    links: [
      { label: "Visit site", href: "https://puddle-lime.vercel.app/" },
      { label: "Repo", href: "https://github.com/dakshAg/puddle" },
    ],
    featured: true,
  },
  {
    title: "Panelogy",
    description:
      "AI comic maker that turns dense case law into visual stories — a faster way to learn and retain legal concepts.",
    year: "2025",
    tags: ["GenAI", "Product", "Education"],
    image: "/images/projects/panelogy-v2.png",
    icon: "/images/projects/panelogy_logo.png",
    links: [],
    featured: true,
  },
  {
    title: "Rental Market Forecasting",
    description:
      "Scraped real-estate and socio-economic data, built forecasting models, and packaged insights for investors.",
    year: "2024",
    tags: ["Forecasting", "Scraping", "XGBoost"],
    image: "/images/projects/rental-market-v2.jpg",
    icon: "/images/projects/rental-market.png",
    links: [
      {
        label: "Repo",
        href: "https://github.com/MAST30034-AppliedDataScience/project-2-group-real-estate-industry-project-3",
      },
    ],
    featured: true,
  },
  {
    title: "NYC Taxi Demand",
    description:
      "Time-series modelling of ride demand to inform smarter fleet allocation and coverage strategies.",
    year: "2024",
    tags: ["Time series", "Optimisation", "PySpark"],
    image: "/images/projects/nyx-taxi-v2.jpg",
    icon: "/images/projects/nyc-taxi.png",
    links: [{ label: "Repo", href: "https://github.com/dakshAg/strategic-taxi-distribution-nyc" }],
    featured: true,
  },
  {
    title: "Samarpan",
    description: "Emergency blood donation: request matching, broadcast alerts, donors to recipients fast.",
    year: "2019",
    tags: ["Healthcare", "Mobile"],
    image: "/images/projects/samarpan.jpg",
    icon: "/images/projects/samarpan_logo.png",
    links: [],
  },
  {
    title: "Agrawal Samaj",
    description: "A social platform for a religious community: profiles, posts, groups, announcements.",
    year: "2018",
    tags: ["Community", "Mobile"],
    image: "/images/projects/agrawal_samaj.jpg",
    icon: "/images/projects/agrawal_samaj_logo.png",
    links: [],
  },
  {
    title: "EMI Calculator",
    description: "A clean calculator for EMI, total interest, and amortisation — with shareable results.",
    year: "2018",
    tags: ["Finance", "UI"],
    image: "/images/projects/emi_calculator.jpg",
    icon: "/images/projects/emi_calculator_logo.png",
    links: [],
  },
  {
    title: "Society",
    description: "Apartment management: announcements, resident community, amenity bookings, support tickets.",
    year: "2018",
    tags: ["Bookings", "Admin tools"],
    image: "/images/projects/society.jpg",
    icon: "/images/projects/society_logo.png",
    links: [],
  },
  {
    title: "My Share Plus",
    description: "Online bill splitting with shared groups, syncing, and real-time balances.",
    year: "2017",
    tags: ["Realtime", "Sync"],
    image: "/images/projects/my_share_plus.jpg",
    icon: "/images/projects/my_share_plus_logo.png",
    links: [],
  },
  {
    title: "Share Books",
    description: "A platform for students to donate used books — discovery, requests, pickup coordination.",
    year: "2017",
    tags: ["Marketplace", "Students"],
    image: "/images/projects/share_books.jpg",
    icon: "/images/projects/share_books_logo.png",
    links: [],
  },
  {
    title: "My Share",
    description: "Offline-first bill splitting for friends: add expenses, settle balances, all on-device.",
    year: "2016",
    tags: ["Offline-first", "Mobile"],
    image: "/images/projects/my_share.jpg",
    icon: "/images/projects/my_share_logo.png",
    links: [],
  },
];

export type Chip = { label: string; icon: string };

export const skills: Chip[] = [
  { label: "Software Engineering", icon: "/images/skills/software.png" },
  { label: "Data Science", icon: "/images/skills/data.png" },
  { label: "Finance", icon: "/images/skills/finance.png" },
  { label: "Teaching", icon: "/images/skills/education.png" },
  { label: "Product Thinking", icon: "/images/skills/product.png" },
];

export const values: Chip[] = [
  { label: "Excellence", icon: "/images/values/excellence.png" },
  { label: "Build", icon: "/images/values/build.png" },
  { label: "Courage", icon: "/images/values/courage.png" },
  { label: "Learn", icon: "/images/values/learn.png" },
  { label: "Discipline", icon: "/images/values/discipline.png" },
];

export type Referee = {
  name: string;
  position: string;
  image: string;
  quote: string;
};

export const referees: Referee[] = [
  {
    name: "Peter Elliot",
    position: "Procurement & Category Manager, TasWater",
    image: "/images/peter.jpeg",
    quote:
      "During his summer placement at TW, Daksh made a significant impact by enhancing data management within the procurement and contract management functions. He played a key role in developing performance and KPI dashboards that improved decision-making across teams. Known for his excellent work ethic, technical skills, and proactive approach, Daksh quickly adapted to new challenges and consistently delivered high-quality work. His contributions have made him a valuable asset to the company, and we're excited to see all that he will achieve in the future!",
  },
  {
    name: "Syed Ashfam Ahsan",
    position: "Student, University of Melbourne",
    image: "/images/syed.jpeg",
    quote:
      "Daksh was one of the nicest and most approachable tutors I encountered during my time at the University of Melbourne. He was always keen to listen and genuinely understand where students were struggling, and consistently went out of his way to help clarify concepts and support our learning. His explanations were clear, patient, and encouraging, which made a real difference to my understanding of the subject. Daksh is highly capable at what he does and an excellent individual to learn from. I have no doubt he will have an amazing future.",
  },
];

export type Tool = { name: string; icon: string; note: string };
export type Tier = { key: "S" | "A" | "B" | "C"; badge: string; blurb: string; tools: Tool[] };

export const tiers: Tier[] = [
  {
    key: "S",
    badge: "/images/tiers/s.png",
    blurb: "Absolute favourites. I reach for these first.",
    tools: [
      { name: "Deepnote", icon: "/images/tech/deepnote.png", note: "Amazing in most aspects. Needs some minor catching up with Hex but incredible for complex DS use cases." },
      { name: "Next.js", icon: "/images/tech/nextjs.png", note: "Well-developed ecosystem. Go-to for anything web dev." },
      { name: "Supabase", icon: "/images/tech/supabase.png", note: "Database done right. Postgres is all you need, and the add-ons for Auth and Realtime just hit right." },
      { name: "GitHub", icon: "/images/tech/github.svg", note: "Well done. I would die without it." },
      { name: "Cloudflare", icon: "/images/tech/cloudflare.svg", note: "Unbeatable infra capabilities. Fast, reliable and fun to work with." },
    ],
  },
  {
    key: "A",
    badge: "/images/tiers/a.png",
    blurb: "Battle-tested and reliable. My go-to choices.",
    tools: [
      { name: "Hex", icon: "/images/tech/hex.png", note: "Strong, performant, beautiful. Needs better ML support and multiple notebooks." },
      { name: "Hono", icon: "/images/tech/hono.webp", note: "Simple, boring, beautiful." },
      { name: "PyTorch", icon: "/images/tech/PyTorch.svg", note: "Not a fan of deep ML, but this gets the job done. Needs better support." },
      { name: "FastAPI", icon: "/images/tech/FastAPI.svg", note: "Fast, builds great APIs, cannot ask for more. Hard to deploy so not S tier." },
      { name: "Polars", icon: "/images/tech/polars.webp", note: "Fast, great syntax, but painful because of limited plotting support." },
    ],
  },
  {
    key: "B",
    badge: "/images/tiers/b.png",
    blurb: "Situational tools. Good when they fit the use case.",
    tools: [
      { name: "n8n", icon: "/images/tech/n8n.png", note: "Getting started quite well. With more ecosystem and some stability, strongly moving into tier A." },
      { name: "PySpark", icon: "/images/tech/spark.svg", note: "Fast, but the syntax needs work." },
      { name: "Flutter", icon: "/images/tech/Flutter.svg", note: "Love the cross-platform capabilities but not a fan of the syntax." },
      { name: "Android Studio", icon: "/images/tech/Android Studio.svg", note: "Bloated. Very bloated." },
      { name: "Django", icon: "/images/tech/Django.svg", note: "Bloated. Very bloated." },
      { name: "Docker", icon: "/images/tech/Docker.svg", note: "Bloated." },
      { name: "Pandas", icon: "/images/tech/Pandas.svg", note: "Slow, and the syntax shows its age." },
      { name: "TensorFlow", icon: "/images/tech/tensorflow.svg", note: "Good, but loses to PyTorch." },
    ],
  },
  {
    key: "C",
    badge: "/images/tiers/c.png",
    blurb: "Avoid when possible. Only when absolutely necessary.",
    tools: [
      { name: "Power BI", icon: "/images/tech/powerbi.png", note: "Screams legacy. Painful for no reason." },
      { name: "MySQL", icon: "/images/tech/MySQL.svg", note: "Defined a generation, but it's time to move on." },
    ],
  },
];

/* Player 2 — hidden co-op campaign. Unlock by typing "love" anywhere on the site. */
export const player2 = {
  name: "Player 2",
  since: "??.??.????",
  tagline: "Co-op mode unlocked. Every good run needs a second controller.",
  stats: [
    { label: "Patience with my side quests", v: 1, bar: "var(--pink)" },
    { label: "Snacks shared", v: 0.99, bar: "var(--yellow)" },
    { label: "Debugging me", v: 0.97, bar: "var(--cyan)" },
    { label: "Winning arguments", v: 1, bar: "var(--lime)" },
  ],
  photos: [
    { src: "/images/p2/p2-01.svg", caption: "Add a pic here", date: "soon" },
    { src: "/images/p2/p2-02.svg", caption: "And here", date: "soon" },
    { src: "/images/p2/p2-03.svg", caption: "This one too", date: "soon" },
  ],
  letter:
    "Placeholder for the actual words. Something about how the best part of every dimension is the person in it. Replace me before shipping, or don't, and let the glitch be the message.",
};
