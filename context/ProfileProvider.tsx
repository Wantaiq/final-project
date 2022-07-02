import { createContext, useCallback, useState } from 'react';

type Props = {
  children: JSX.Element;
};
type ProfileContextType = {
  userProfile: { username: string; avatar: string } | null;
  handleUserProfile: () => void;
};
export const profileContext = createContext<ProfileContextType>(
  {} as ProfileContextType,
);
export default function ProfileProvider(props: Props) {
  const [userProfile, setUserProfile] = useState<{
    username: string;
    avatar: string;
  } | null>(null);

  const handleUserProfile = useCallback(async () => {
    const response = await fetch('/api/profile');
    const data = await response.json();
    if ('error' in data) {
      setUserProfile(null);
    } else {
      setUserProfile({ username: data.username, avatar: data.avatar });
    }
  }, []);
  return (
    <profileContext.Provider value={{ userProfile, handleUserProfile }}>
      {props.children}
    </profileContext.Provider>
  );
}
