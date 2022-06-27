import { useContext, useEffect } from 'react';
import { profileContext } from '../context/ProfileProvider';

export default function Home() {
  const { handleUserProfile } = useContext(profileContext);
  useEffect(() => {
    handleUserProfile();
  }, [handleUserProfile]);
  return <h1>Howdy</h1>;
}
