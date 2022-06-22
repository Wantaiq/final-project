import '../styles/globals.css';
import Layout from '../components/Layout';
import ProfileProvider from '../context/ProfileProvider';

function MyApp({ Component, pageProps }) {
  return (
    <ProfileProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ProfileProvider>
  );
}

export default MyApp;
