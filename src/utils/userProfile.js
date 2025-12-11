const STORAGE_KEY = 'socialCueUserData';

const safeParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('[UserProfile] Failed to parse stored value:', error);
    return null;
  }
};

const readProfile = () => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return safeParse(raw) || {};
  } catch (error) {
    console.warn('[UserProfile] Unable to read profile from storage:', error);
    return {};
  }
};

const writeProfile = (profile) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile || {}));
  } catch (error) {
    console.warn('[UserProfile] Unable to write profile to storage:', error);
  }
};

export const UserProfile = {
  getProfile() {
    return readProfile();
  },

  setProfile(nextProfile) {
    if (!nextProfile || typeof nextProfile !== 'object') return;
    const merged = { ...readProfile(), ...nextProfile };
    writeProfile(merged);
  },

  getGrade() {
    const profile = readProfile();
    return profile?.gradeLevel || profile?.grade || null;
  },

  setGrade(grade) {
    const profile = readProfile();
    writeProfile({ ...profile, gradeLevel: grade });
  },

  clear() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('[UserProfile] Unable to clear storage:', error);
    }
  }
};






