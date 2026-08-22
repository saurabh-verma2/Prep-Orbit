import { getCustomStudyEntries, isSupabaseConfigured, saveCustomStudyEntry } from "../supabase/supabase.client.js";
import { ensureAuthenticatedUser, getStoredUser, isAdminUser } from "../auth/auth.js";

const normalizedStudyKey = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CUSTOM_STUDY_KEY = "prep-orbit-custom-study";

function mapRemoteStudy(entry) {
  const title = String(entry?.title || "").trim();
  const notes = Array.isArray(entry?.notes) ? entry.notes.map((item) => String(item || "").trim()).filter(Boolean) : [];
  const options = Array.isArray(entry?.options) ? entry.options.slice(0, 4).map((option) => String(option || "").trim()) : ["", "", "", ""];

  return {
    title,
    notes,
    question: {
      prompt: String(entry?.question_prompt || "").trim(),
      options,
      correctIndex: Number(entry?.correct_index ?? 0),
      hint: String(entry?.hint || "").trim(),
      explanation: String(entry?.explanation || "").trim(),
    },
  };
}

export const studyLibrary = {
  "process-management": {
    title: "Process Management",
    notes: [
      "A process is a running instance of a program with its own execution context, state, and resources.",
      "The process control block tracks process state, program counter, registers, CPU scheduling info, and memory pointers.",
      "Context switching is the overhead involved in saving and restoring execution state between processes.",
    ],
    question: {
      prompt: "Which state transition happens when a process is waiting for an I/O operation to complete?",
      options: ["Ready", "Running", "Blocked", "Terminated"],
      correctIndex: 2,
      hint: "Think about the state when a process is paused waiting on external I/O.",
      explanation: "A process enters the Blocked state when it waits for I/O or other external events to complete before it can continue execution.",
    },
  },
  "cpu-scheduling": {
    title: "CPU Scheduling",
    notes: [
      "CPU scheduling decides which ready process runs next when multiple processes compete for the CPU.",
      "FCFS is non-preemptive and may suffer from convoy effects when a long process delays shorter ones.",
      "Shortest Job First reduces average waiting time but requires estimates of burst time and may starve long jobs.",
    ],
    question: {
      prompt: "Which scheduling algorithm chooses the process with the shortest next CPU burst?",
      options: ["FCFS", "Round Robin", "Priority Scheduling", "Shortest Job First"],
      correctIndex: 3,
      hint: "The name itself hints at selecting the shortest next burst.",
      explanation: "Shortest Job First selects the process with the minimum next CPU burst, reducing average waiting time in many cases.",
    },
  },
  "data-structures-algorithms": {
    title: "Data Structures & Algorithms",
    notes: [
      "Patterns matter more than memorization: understand time complexity, edge cases, and trade-offs.",
      "Hash maps offer average O(1) lookups when the hash function spreads data evenly across buckets.",
      "Trees and graphs are common interview themes; practice traversal logic, recursion, and stack/queue usage.",
    ],
    question: {
      prompt: "Which data structure is best suited for implementing a First In, First Out queue?",
      options: ["Hash Map", "Array with random access", "Queue", "Binary Search Tree"],
      correctIndex: 2,
      hint: "FIFO means the first inserted item is processed first.",
      explanation: "A queue is designed to follow the FIFO principle: elements are inserted at the rear and removed from the front.",
    },
  },
  "system-design": {
    title: "System Design",
    notes: [
      "Start by clarifying scale, constraints, and bottlenecks before proposing services and databases.",
      "Use layered design: clients, APIs, application services, storage, caching, and background workers.",
      "Trade-offs around consistency, availability, latency, and cost are central to good design discussions.",
    ],
    question: {
      prompt: "What is the main benefit of introducing a cache in a distributed application?",
      options: ["It guarantees consistency", "It reduces repeated expensive reads", "It removes the need for databases", "It makes the system single-threaded"],
      correctIndex: 1,
      hint: "Think about hot data that is accessed repeatedly.",
      explanation: "A cache reduces repeated expensive reads and improves latency, especially for frequently accessed data.",
    },
  },
};

export function getCustomStudyLibrary() {
  try {
    const raw = localStorage.getItem(CUSTOM_STUDY_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

export async function hydrateCustomStudyLibraryFromSupabase() {
  if (!isSupabaseConfigured()) {
    return getCustomStudyLibrary();
  }

  try {
    const remoteEntries = await getCustomStudyEntries();
    if (!remoteEntries.length) {
      return getCustomStudyLibrary();
    }

    const merged = { ...getCustomStudyLibrary() };
    remoteEntries.forEach((entry) => {
      const next = mapRemoteStudy(entry);
      const key = normalizedStudyKey(next.title);
      if (key) {
        merged[key] = next;
      }
    });

    localStorage.setItem(CUSTOM_STUDY_KEY, JSON.stringify(merged));
    return merged;
  } catch (error) {
    console.warn("Custom library hydration failed.", error);
    return getCustomStudyLibrary();
  }
}

export async function saveCustomStudy(study) {
  const customLibrary = getCustomStudyLibrary();
  const key = normalizedStudyKey(study.title || study.topic || "");

  if (!key) {
    return customLibrary;
  }

  const next = {
    ...customLibrary,
    [key]: {
      title: study.title || study.topic || "Custom Topic",
      notes: Array.isArray(study.notes) ? study.notes : String(study.notes || "").split("\n").filter(Boolean),
      question: {
        prompt: study.questionPrompt || "",
        options: Array.isArray(study.options) ? study.options : ["", "", "", ""],
        correctIndex: Number(study.correctIndex ?? 0),
        hint: study.hint || "",
        explanation: study.explanation || "",
      },
    },
  };

  localStorage.setItem(CUSTOM_STUDY_KEY, JSON.stringify(next));

  if (isSupabaseConfigured()) {
    try {
      const sessionUser = (await ensureAuthenticatedUser()) || getStoredUser();
      if (sessionUser && isAdminUser(sessionUser)) {
        await saveCustomStudyEntry(
          {
            title: next[key].title,
            notes: next[key].notes,
            questionPrompt: next[key].question.prompt,
            options: next[key].question.options,
            correctIndex: next[key].question.correctIndex,
            hint: next[key].question.hint,
            explanation: next[key].question.explanation,
          },
          sessionUser.id
        );
      }
    } catch (error) {
      console.warn("Supabase custom study sync failed.", error);
    }
  }

  return next;
}

export function getStudyForTopic(topicLabel) {
  const key = normalizedStudyKey(topicLabel);
  const customLibrary = getCustomStudyLibrary();
  return customLibrary[key] ?? studyLibrary[key] ?? null;
}
