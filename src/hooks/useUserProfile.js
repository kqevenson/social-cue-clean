import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const mapGradeToBand = (gradeLevel) => {
  if (!gradeLevel) return null;

  if (typeof gradeLevel === 'string' && gradeLevel.includes('-')) {
    const normalized = gradeLevel.trim();
    if (normalized === 'K-2') return 'K-2';
    if (normalized === '3-5') return '3-5';
    if (normalized === '6-8') return '6-8';
    if (normalized === '9-12') return '9-12';
  }

  const parsed = typeof gradeLevel === 'number' ? gradeLevel : parseInt(gradeLevel, 10);

  if (!Number.isFinite(parsed)) return null;
  if (parsed <= 2) return 'K-2';
  if (parsed <= 5) return '3-5';
  if (parsed <= 8) return '6-8';
  return '9-12';
};

const useUserProfile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [gradeBand, setGradeBand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setProfile(null);
          setGradeBand(null);
          setLoading(false);

          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
          }

          return;
        }

        setUser(firebaseUser);
        setLoading(true);
        setError(null);

        const profileRef = doc(db, 'users', firebaseUser.uid);

        if (unsubscribeProfile) {
          unsubscribeProfile();
        }

        unsubscribeProfile = onSnapshot(
          profileRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              setProfile(null);
              setGradeBand(null);
              setLoading(false);
              return;
            }

            const data = {
              id: snapshot.id,
              ...snapshot.data(),
            };

            setProfile(data);
            setGradeBand(mapGradeToBand(data.gradeLevel));
            setLoading(false);
          },
          (snapshotError) => {
            console.error('Failed to load user profile:', snapshotError);
            setError(snapshotError);
            setProfile(null);
            setGradeBand(null);
            setLoading(false);
          }
        );
      },
      (authError) => {
        console.error('Authentication listener error:', authError);
        setError(authError);
        setUser(null);
        setProfile(null);
        setGradeBand(null);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }

      unsubscribeAuth();
    };
  }, []);

  return useMemo(
    () => ({
      user,
      profile,
      gradeBand,
      loading,
      error,
    }),
    [user, profile, gradeBand, loading, error]
  );
};

export default useUserProfile;








