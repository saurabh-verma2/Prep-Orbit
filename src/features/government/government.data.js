export const governmentExams = [
  {
    id: "dsssb",
    name: "DSSSB",
    description: "Delhi Subordinate Services Selection Board examinations.",
    posts: [
      {
        id: "dsssb-tgt-cs",
        name: "TGT Computer Science",
        description: "Computer Science preparation for TGT recruitment.",
        subjects: [
          {
            id: "tgt-cs-os",
            name: "Operating Systems",
            description: "Processes, memory, scheduling, deadlocks and more.",
            topics: [
              "Process Management",
              "CPU Scheduling",
              "Deadlocks",
              "Memory Management",
              "File Systems"
            ]
          },
          {
            id: "tgt-cs-cn",
            name: "Computer Networks",
            description: "Network models, protocols, addressing and security.",
            topics: [
              "OSI & TCP/IP",
              "IP Addressing",
              "Routing",
              "Transport Layer",
              "Network Security"
            ]
          },
          {
            id: "tgt-cs-dbms",
            name: "DBMS & SQL",
            description: "Database concepts, normalization, queries and transactions.",
            topics: [
              "ER Model",
              "Relational Model",
              "SQL",
              "Normalization",
              "Transactions"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "ssc",
    name: "SSC",
    description: "Staff Selection Commission examinations.",
    posts: [
      {
        id: "ssc-cgl",
        name: "SSC CGL",
        description: "Combined Graduate Level preparation.",
        subjects: [
          {
            id: "ssc-cgl-computer",
            name: "Computer Knowledge",
            description: "Core computer awareness and fundamentals.",
            topics: ["Computer Fundamentals", "Operating Systems", "Networking", "Internet"]
          }
        ]
      }
    ]
  },
  {
    id: "banking",
    name: "Banking",
    description: "Banking and competitive examination preparation.",
    posts: [
      {
        id: "ibps-po",
        name: "IBPS PO",
        description: "Probationary Officer preparation.",
        subjects: [
          {
            id: "ibps-po-computer",
            name: "Computer Aptitude",
            description: "Computer awareness for banking examinations.",
            topics: ["Hardware", "Software", "Networking", "Cyber Security"]
          }
        ]
      }
    ]
  }
];

export function getExamById(examId) {
  return governmentExams.find((exam) => exam.id === examId) ?? null;
}

export function getPost(examId, postId) {
  return getExamById(examId)?.posts.find((post) => post.id === postId) ?? null;
}

export function getSubject(examId, postId, subjectId) {
  return getPost(examId, postId)?.subjects.find((subject) => subject.id === subjectId) ?? null;
}
