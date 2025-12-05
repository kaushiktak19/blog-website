export type AuthorInfo = {
  name: string;
  description: string;
  linkedin: string;
  image?: string;
};

export const authorData: AuthorInfo[] = [
  {
    name: "Pratik Mahalle",
    description:
      "Hey, I am Pratik currently working as a Developer Relation at Keploy. I love building communities and talking to people.",
    linkedin: "https://www.linkedin.com/in/mahalle-pratik/",
  },
  {
    name: "Himanshu Mandhyan",
    description:
      "With 1.5+ years of experience, I specialize in driving organic traffic growth and enhancing online visibility for a range of businesses.",
    linkedin: "https://www.linkedin.com/in/himanshu-mandhyan/",
  },
  {
    name: "Ayush Gupta",
    description:
      "Hi everyone 👋 I am an open-source contributor with a DevOps skillset. Comfortable across Windows and Linux.",
    linkedin: "https://www.linkedin.com/in/ayush-gupta-523b45199/",
  },
  {
    name: "Subashini Kumaravel",
    description:
      "Final year AI & Data Science student, passionate about Python, machine learning, and data analysis.",
    linkedin: "https://www.linkedin.com/in/subashini-kumaravel-4866312a4/",
  },
  {
    name: "Keploy Team",
    description:
      "Keploy is a developer-centric API testing tool that creates tests along with built-in mocks, faster than unit tests. It records API and DB calls and replays them during testing.",
    linkedin: "",
  },
  {
    name: "Monasri Mohandoss",
    description:
      "Final-year B.Tech AI & DS student. Passionate about agentic automation, AI apps, and predictive ML models.",
    linkedin: "https://www.linkedin.com/in/monasri-mohandoss-2131b4252/",
  },
  {
    name: "Shubham Jain",
    description:
      "Cloud technology veteran; among the youngest to complete all five AWS certifications, including Solutions Architect Professional and DevOps Engineer Professional.",
    linkedin: "https://in.linkedin.com/in/slayerjain",
  },
  {
    name: "Achanandhi M",
    description:
      "Developer Advocate at Keploy; cloud-native, CNCF, testing, and GenAI enthusiast; community builder and athlete who enjoys books like The Alchemist and Think Like a Monk.",
    linkedin: "https://in.linkedin.com/in/achanandhi-m",
  },
  {
    name: "Amaan Bhati",
    description:
      "CSE student and web developer focused on JavaScript, React, Tailwind, TypeScript, Next.js, and Three.js.",
    linkedin: "https://www.linkedin.com/in/amaan-bhati/",
  },
  {
    name: "Neha Gupta",
    description:
      "Building Keploy.io, an eBPF-based open source framework to generate test cases and data stubs from API calls.",
    linkedin: "https://www.linkedin.com/posts/neha-gup",
  },
  {
    name: "Charan Kamarapu",
    description:
      "Aspires to tackle challenging projects; skilled in Python, HTML, CSS, JS, MongoDB, ML, image processing, NLP, and data structures.",
    linkedin: "",
  },
  {
    name: "Gourav Kumar",
    description:
      "Software engineer with experience in eBPF, Java SDKs, and Docker internals; two-time GSoC mentor focused on mentoring and building robust systems.",
    linkedin: "",
  },
  {
    name: "Sarthak Shyngle",
    description:
      "GSoC mentor focused on helping developers release efficiently with Keploy.",
    linkedin: "",
  },
  {
    name: "Yash Khare",
    description:
      "Software Engineer at Keploy and CNCF maintainer, passionate about Kubernetes and open source.",
    linkedin: "https://in.linkedin.com/in/khareyash05",
  },
];

function normalizeName(name: string): string {
  return (name || "")
    .toLowerCase()
    .split(",")
    .join(" ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const authorMap: Record<string, AuthorInfo> = Object.fromEntries(
  authorData.map((a) => [normalizeName(a.name), a])
);

export function getAuthorInfoByName(name: string): AuthorInfo | undefined {
  return authorMap[normalizeName(name)];
}


