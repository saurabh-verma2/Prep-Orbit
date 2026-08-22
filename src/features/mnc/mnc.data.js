export const mncCompanies = [
  {
    id: "google",
    name: "Google",
    description: "Search, systems, and product engineering interviews.",
    roles: [
      {
        id: "google-sde-2",
        name: "SDE II",
        description: "Software engineering role focused on systems and product work.",
        rounds: [
          {
            id: "google-sde-2-phone",
            name: "Phone Screen",
            description: "Core coding and problem-solving review.",
            topics: [
              {
                id: "google-sde-2-phone-dsa",
                name: "Data Structures & Algorithms",
                description: "Arrays, strings, graphs, trees, recursion and complexity.",
              },
              {
                id: "google-sde-2-phone-oop",
                name: "Object-Oriented Design",
                description: "Design trade-offs, classes, composition and APIs.",
              },
            ],
          },
          {
            id: "google-sde-2-onsite",
            name: "Onsite",
            description: "System design and behavioral deep-dives.",
            topics: [
              {
                id: "google-sde-2-onsite-sd",
                name: "System Design",
                description: "Scalability, APIs, trade-offs, and distributed systems.",
              },
              {
                id: "google-sde-2-onsite-behavioral",
                name: "Behavioral Interview",
                description: "Leadership, collaboration, problem-solving and communication.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    description: "Leadership principles and product-oriented engineering interviews.",
    roles: [
      {
        id: "amazon-sde-1",
        name: "SDE I",
        description: "Product engineering interviews with strong problem-solving expectations.",
        rounds: [
          {
            id: "amazon-sde-1-technical",
            name: "Technical Round",
            description: "Coding, debugging and logic review.",
            topics: [
              {
                id: "amazon-sde-1-technical-dsa",
                name: "CS Fundamentals",
                description: "Complexity, arrays, trees, hashing, and recursion.",
              },
              {
                id: "amazon-sde-1-technical-db",
                name: "Databases",
                description: "SQL, schema design, indexing and joins.",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getCompanyById(companyId) {
  return mncCompanies.find((company) => company.id === companyId) ?? null;
}

export function getRole(companyId, roleId) {
  return getCompanyById(companyId)?.roles.find((role) => role.id === roleId) ?? null;
}

export function getRound(companyId, roleId, roundId) {
  return getRole(companyId, roleId)?.rounds.find((round) => round.id === roundId) ?? null;
}

export function getTopic(companyId, roleId, roundId, topicId) {
  return getRound(companyId, roleId, roundId)?.topics.find((topic) => topic.id === topicId) ?? null;
}
