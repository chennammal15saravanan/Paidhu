import LandingPage from './components/LandingPage';

function App() {
  return (
    <LandingPage onStart={() => console.log('Get Started clicked')} />
  );
}

export default App;
