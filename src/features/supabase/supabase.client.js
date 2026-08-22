import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isTableMissingError(error) {
  const message = String(error?.message || "");
  return error?.code === "PGRST205" || error?.code === "42P01" || message.includes("Could not find the table") || message.includes("does not exist") || message.includes("relation") && message.includes("does not exist");
}

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function signUpWithPassword({ name, email, password }) {
  if (!supabase) {
    return { data: { user: null, session: null }, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  return { data, error };
}

export async function signInWithPassword({ email, password }) {
  if (!supabase) {
    return { data: { user: null, session: null }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  if (!supabase) {
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentSession() {
  if (!supabase) {
    return { data: { session: null }, error: null };
  }

  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

export async function upsertUserProfile(user) {
  if (!supabase || !user?.id || !user?.email) {
    return null;
  }

  const payload = {
    id: user.id,
    email: user.email,
    full_name: user.name,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from("profiles").upsert(payload, {
      onConflict: "id",
    });

    if (error) {
      if (isTableMissingError(error)) {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    if (isTableMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function saveCustomStudyEntry(study, userId = null) {
  if (!supabase) {
    return null;
  }

  const activeUserId = userId ?? (await getCurrentSession()).data?.session?.user?.id ?? null;
  const title = String(study?.title || "").trim();
  const questionPrompt = String(study?.questionPrompt || "").trim();
  const options = Array.isArray(study?.options)
    ? study.options.slice(0, 4).map((option) => String(option || "").trim())
    : ["", "", "", ""];

  if (!activeUserId || !title || !questionPrompt || options.some((option) => !option)) {
    return null;
  }

  try {
    const payload = {
      user_id: activeUserId,
      title,
      notes: Array.isArray(study?.notes) ? study.notes.map((item) => String(item || "").trim()).filter(Boolean) : [],
      question_prompt: questionPrompt,
      options,
      correct_index: Number(study?.correctIndex ?? 0),
      hint: String(study?.hint || "").trim(),
      explanation: String(study?.explanation || "").trim(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("custom_study").upsert(payload, {
      onConflict: "user_id,title",
    });

    if (error) {
      if (isTableMissingError(error)) {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    if (isTableMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function getCustomStudyEntries() {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.from("custom_study").select("*").order("created_at", { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        return [];
      }
      throw error;
    }

    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (isTableMissingError(error)) {
      return [];
    }

    throw error;
  }
}

export async function saveProgressSnapshot(progress, userId = null) {
  if (!supabase || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        bookmarked_topics: progress.bookmarkedTopics ?? [],
        correct_answers: Number(progress.correctAnswers ?? 0),
        attempted_questions: Number(progress.attemptedQuestions ?? 0),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      if (isTableMissingError(error)) {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    if (isTableMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function getProgressSnapshot(userId = null) {
  if (!supabase || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      if (isTableMissingError(error)) {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    if (isTableMissingError(error)) {
      return null;
    }

    throw error;
  }
}

export async function getUserProfileByEmail(email) {
  if (!supabase || !email) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", String(email).trim())
      .maybeSingle();

    if (error) {
      if (isTableMissingError(error)) {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    if (isTableMissingError(error)) {
      return null;
    }

    throw error;
  }
}
