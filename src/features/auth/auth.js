import {
  getCurrentSession,
  getProgressSnapshot,
  isSupabaseConfigured,
  upsertUserProfile,
  saveProgressSnapshot,
  signInWithPassword,
  signUpWithPassword,
  signOut,
} from "../supabase/supabase.client.js";

const AUTH_KEY = "prep-orbit-auth";
const PROGRESS_KEY = "prep-orbit-progress";
const TEST_HISTORY_KEY = "prep-orbit-test-history";
const ADMIN_EMAIL = "admin@prep-orbit.com";
const ADMIN_PASSWORD = "PREPADMIN2026";

const defaultProgress = {
  bookmarkedTopics: [],
  correctAnswers: 0,
  attemptedQuestions: 0,
};

function generateLocalUserId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export async function hydrateUserFromSupabase() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await getCurrentSession();
    const sessionUser = data?.session?.user;

    if (error || !sessionUser) {
      return null;
    }

    const nextUser = saveUser({
      id: sessionUser.id,
      name: sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0] || "Learner",
      email: sessionUser.email,
      joinedAt: sessionUser.created_at || new Date().toISOString(),
    });

    const remoteProgress = await getProgressSnapshot(sessionUser.id).catch(() => null);
    if (remoteProgress) {
      const persisted = {
        bookmarkedTopics: Array.isArray(remoteProgress.bookmarked_topics) ? remoteProgress.bookmarked_topics : [],
        correctAnswers: Number(remoteProgress.correct_answers ?? 0),
        attemptedQuestions: Number(remoteProgress.attempted_questions ?? 0),
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(persisted));
    }

    return nextUser;
  } catch (error) {
    console.warn("Supabase user hydration failed.", error);
    return null;
  }
}

export async function ensureAuthenticatedUser() {
  const localUser = getStoredUser();
  if (localUser) {
    return localUser;
  }

  return hydrateUserFromSupabase();
}

export function isAdminUser(user = getStoredUser()) {
  if (!user) return false;
  return user.role === "admin" || user.email === ADMIN_EMAIL;
}

async function signInAdminToSupabase(email, password, name) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const signInResult = await signInWithPassword({ email, password });
    if (!signInResult.error && signInResult.data?.session) {
      return signInResult.data.session;
    }

    const signUpResult = await signUpWithPassword({
      name: name || "Admin",
      email,
      password,
    });

    if (!signUpResult.error && signUpResult.data?.session) {
      return signUpResult.data.session;
    }

    if (signUpResult.error?.message?.includes("already registered") || signUpResult.error?.message?.includes("User already registered")) {
      const fallback = await signInWithPassword({ email, password });
      if (!fallback.error && fallback.data?.session) {
        return fallback.data.session;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

export function saveUser(user) {
  const nextUser = {
    ...user,
    id: user.id ?? generateLocalUserId(),
    role: user.role ?? "user",
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(nextUser));

  if (isSupabaseConfigured()) {
    getCurrentSession()
      .then(({ data, error }) => {
        if (error || !data?.session) {
          return;
        }

        upsertUserProfile(nextUser).catch((syncError) => {
          console.warn("Supabase profile sync failed.", syncError);
        });
      })
      .catch((error) => {
        console.warn("Supabase session lookup failed.", error);
      });
  }

  return nextUser;
}

async function ensureSupabaseSession({ email, password }) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: sessionData, error: sessionError } = await getCurrentSession();
  if (!sessionError && sessionData?.session) {
    return sessionData.session;
  }

  const signInResult = await signInWithPassword({ email, password });
  if (signInResult.error) {
    return null;
  }

  return signInResult.data?.session ?? null;
}

export async function loginUser({ name, email, password, role = "user" }) {
  const trimmedEmail = String(email || "").trim();
  const trimmedName = String(name || "").trim();
  const requestedRole = role === "admin" ? "admin" : "user";

  if (!trimmedEmail || !password) {
    throw new Error("Email and password are required.");
  }

  if (requestedRole === "admin") {
    if (trimmedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error("Admin access denied. Use the assigned admin email and access code.");
    }

    const liveSession = await signInAdminToSupabase(trimmedEmail, password, trimmedName || "Admin");
    const nextUser = saveUser({
      id: liveSession?.user?.id ?? generateLocalUserId(),
      name: trimmedName || liveSession?.user?.user_metadata?.full_name || "Admin",
      email: ADMIN_EMAIL,
      password,
      role: "admin",
      joinedAt: new Date().toISOString(),
    });

    return nextUser;
  }

  if (isSupabaseConfigured()) {
    try {
      const result = await signUpWithPassword({
        name: trimmedName || trimmedEmail.split("@")[0],
        email: trimmedEmail,
        password,
      });

      if (!result.error) {
        const session = await ensureSupabaseSession({ email: trimmedEmail, password });
        const user = session?.user ?? result.data?.user;
        const nextUser = saveUser({
          id: user?.id ?? generateLocalUserId(),
          name: trimmedName || user?.user_metadata?.full_name || trimmedEmail.split("@")[0],
          email: trimmedEmail,
          password,
          role: "user",
          joinedAt: new Date().toISOString(),
        });

        return nextUser;
      }

      const isAlreadyRegistered = result.error.message?.includes("already registered") || result.error.message?.includes("User already registered");
      if (isAlreadyRegistered) {
        const session = await ensureSupabaseSession({ email: trimmedEmail, password });
        if (!session) {
          throw new Error("Unable to sign into the live Supabase account.");
        }

        const user = session.user;
        const nextUser = saveUser({
          id: user?.id ?? generateLocalUserId(),
          name: trimmedName || user?.user_metadata?.full_name || trimmedEmail.split("@")[0],
          email: trimmedEmail,
          password,
          role: "user",
          joinedAt: new Date().toISOString(),
        });

        return nextUser;
      }

      const message = String(result.error.message || "");
      if (message.includes("Could not find the table") || message.includes("does not exist") || message.includes("relation") && message.includes("does not exist")) {
        throw new Error("Supabase schema is not ready yet. Falling back to local demo auth.");
      }

      throw result.error;
    } catch (error) {
      const message = String(error?.message || "");
      if (message.includes("Could not find the table") || message.includes("does not exist") || message.includes("schema is not ready") || message.includes("relation") && message.includes("does not exist")) {
        const nextUser = saveUser({
          id: generateLocalUserId(),
          name: trimmedName || trimmedEmail.split("@")[0],
          email: trimmedEmail,
          password,
          role: "user",
          joinedAt: new Date().toISOString(),
        });

        return nextUser;
      }

      throw error;
    }
  }

  const nextUser = saveUser({
    id: generateLocalUserId(),
    name: trimmedName || trimmedEmail.split("@")[0],
    email: trimmedEmail,
    password,
    role: "user",
    joinedAt: new Date().toISOString(),
  });

  return nextUser;
}

export async function clearUser() {
  if (isSupabaseConfigured()) {
    await signOut().catch(() => undefined);
  }

  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn() {
  return Boolean(getStoredUser());
}

export function getProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...defaultProgress, bookmarkedTopics: [] };

    const parsed = JSON.parse(raw);
    return {
      bookmarkedTopics: Array.isArray(parsed.bookmarkedTopics) ? parsed.bookmarkedTopics : [],
      correctAnswers: Number(parsed.correctAnswers ?? 0),
      attemptedQuestions: Number(parsed.attemptedQuestions ?? 0),
    };
  } catch (error) {
    return { ...defaultProgress, bookmarkedTopics: [] };
  }
}

export function toggleBookmark(topic) {
  if (!topic) {
    return getProgress();
  }

  const progress = getProgress();
  const bookmarks = new Set(progress.bookmarkedTopics ?? []);

  if (bookmarks.has(topic)) {
    bookmarks.delete(topic);
  } else {
    bookmarks.add(topic);
  }

  const next = {
    ...progress,
    bookmarkedTopics: Array.from(bookmarks),
  };

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));

  if (isSupabaseConfigured()) {
    const currentUser = getStoredUser();
    if (currentUser?.id) {
      saveProgressSnapshot(next, currentUser.id).catch((error) => {
        console.warn("Supabase bookmark sync failed.", error);
      });
    }
  }

  return next;
}

export function updateProgress({ topic, correct = false }) {
  const progress = getProgress();
  const bookmarks = new Set(progress.bookmarkedTopics ?? []);
  if (topic) {
    bookmarks.add(topic);
  }

  const next = {
    ...progress,
    bookmarkedTopics: Array.from(bookmarks),
    correctAnswers: Number(progress.correctAnswers ?? 0) + (correct ? 1 : 0),
    attemptedQuestions: Number(progress.attemptedQuestions ?? 0) + 1,
  };

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));

  if (isSupabaseConfigured()) {
    const currentUser = getStoredUser();
    if (currentUser?.id) {
      saveProgressSnapshot(next, currentUser.id).catch((error) => {
        console.warn("Supabase progress sync failed.", error);
      });
    }
  }

  return next;
}

export function getTestHistory() {
  try {
    const raw = localStorage.getItem(TEST_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function saveTestResult(result) {
  const history = getTestHistory();
  const next = [
    {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      title: result.title || "Mock test",
      score: Number(result.score ?? 0),
      total: Number(result.total ?? 0),
      percentage: Number(result.percentage ?? 0),
      ...result,
    },
    ...history,
  ].slice(0, 12);

  localStorage.setItem(TEST_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function getTestAnalytics() {
  const history = getTestHistory();
  const totalTests = history.length;
  const bestScore = history.reduce((max, item) => Math.max(max, Number(item.percentage ?? 0)), 0);
  const averageScore = totalTests
    ? Math.round(history.reduce((sum, item) => sum + Number(item.percentage ?? 0), 0) / totalTests)
    : 0;

  return {
    totalTests,
    bestScore,
    averageScore,
  };
}

export function getDisplayName() {
  const user = getStoredUser();
  if (!user?.name) return "Learner";
  return user.name;
}
