import Hero from '../components/Hero.jsx';
import EventDetails from '../components/EventDetails.jsx';
import RegistrationForm from '../components/RegistrationForm.jsx';
import VenueMap from '../components/VenueMap.jsx';
import Footer from '../components/Footer.jsx';

export default function RegistrationPage() {
  return (
    <div className="page-bg">
      <Hero />
      <EventDetails />
      <div className="form-wrap">
        <RegistrationForm />
      </div>
      <VenueMap />
      <Footer />
    </div>
  );
}
