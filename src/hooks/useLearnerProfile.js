import { useMemo } from 'react';
import useUserProfile from './useUserProfile';
import { getGradeBandFromGrade } from '../data/voicePracticeScenarios';

const normalizeGradeInput = (value) => {
  if (value == null) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  const upper = raw.toUpperCase();

  if (upper === 'K' || upper === 'K-2' || upper === 'K2') {
    return 'K-2';
  }

  if (/^\d+\s*-\s*\d+$/.test(upper)) {
    return upper.replace(/\s+/g, '');
  }

  const numeric = parseInt(upper, 10);
  return Number.isNaN(numeric) ? raw : numeric;
};

const deriveGradeBand = (gradeLevel, fallbackBand) => {
  if (fallbackBand) {
    return fallbackBand;
  }

  if (gradeLevel == null) {
    return null;
  }

  if (typeof gradeLevel === 'string') {
    const normalized = gradeLevel.trim().toUpperCase();
    if (normalized === 'K' || normalized === 'K2' || normalized === 'K-2') {
      return 'K-2';
    }

    if (/^\d+\s*-\s*\d+$/.test(normalized)) {
      return normalized.replace(/\s+/g, '');
    }
  }

  return getGradeBandFromGrade(gradeLevel);
};

const resolveGradeLevel = (profile, user) => {
  if (profile?.gradeLevel) return profile.gradeLevel;
  if (profile?.grade) return profile.grade;
  if (user?.gradeLevel) return user.gradeLevel;
  if (user?.grade) return user.grade;
  return null;
};

const useLearnerProfile = () => {
  const { user, profile, gradeBand: profileGradeBand, loading, error } = useUserProfile();

  const gradeLevel = useMemo(
    () => normalizeGradeInput(resolveGradeLevel(profile, user)),
    [profile, user]
  );

  const gradeBand = useMemo(
    () => deriveGradeBand(gradeLevel, profileGradeBand),
    [gradeLevel, profileGradeBand]
  );

  return useMemo(
    () => ({
      loading,
      error,
      user,
      gradeLevel,
      gradeBand,
      learnerProfile: profile,
    }),
    [loading, error, user, gradeLevel, gradeBand, profile]
  );
};

export default useLearnerProfile;








