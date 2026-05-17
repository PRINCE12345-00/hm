import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Activities from './components/Activities';
import Achievements from './components/Achievements';
import Gallery from './components/Gallery';
import Team from './components/Team';
import Events from './components/Events';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Activities />
      <Achievements />
      <Gallery />
      <Team />
      <Events />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
export default App;
