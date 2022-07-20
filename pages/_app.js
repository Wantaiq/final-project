import '../styles/globals.css';
import Header from '../components/Header';
import ProfileProvider from '../context/ProfileProvider';

function MyApp({ Component, pageProps }) {
  return (
    <ProfileProvider>
      <Header>
        <Component {...pageProps} />
      </Header>
    </ProfileProvider>
  );
}

export default MyApp;
