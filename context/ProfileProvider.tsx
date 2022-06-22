import { createContext, useCallback, useEffect, useState } from 'react';
import { UserProfile } from '../util/database';

type Props = {
  children: JSX.Element;
};
type ProfileContextType = {
  userProfile: string | null;
  handleUserProfile: () => void;
};
export const profileContext = createContext<ProfileContextType>(
  {} as ProfileContextType,
);
export default function ProfileProvider(props: Props) {
  const [userProfile, setUserProfile] = useState(null);
  const handleUserProfile = useCallback(async () => {
    const response = await fetch('/api/profile');
    const data = await response.json();
    if ('error' in data) {
      setUserProfile(null);
    } else {
      setUserProfile(data.userProfile.username);
    }
  }, []);
  return (
    <profileContext.Provider value={{ userProfile, handleUserProfile }}>
      {props.children}
    </profileContext.Provider>
  );
}
