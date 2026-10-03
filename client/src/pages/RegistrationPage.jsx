import Hero from '../components/Hero.jsx';
import EarlyBirdCountdown from '../components/EarlyBirdCountdown.jsx';
import EventDetails from '../components/EventDetails.jsx';
import RegistrationForm from '../components/RegistrationForm.jsx';
import VenueMap from '../components/VenueMap.jsx';
import Footer from '../components/Footer.jsx';
import Maintenance from '../components/Maintenance.jsx';
import { MAINTENANCE_MODE } from '../config/event.js';

export default function RegistrationPage() {
  if (MAINTENANCE_MODE) return <Maintenance />;

  return (
    <div className="page-bg">
      <Hero />
      <EarlyBirdCountdown />
      <EventDetails />
      <div className="form-wrap">
        <RegistrationForm />
      </div>
      <VenueMap />
      <Footer />
    </div>
  );
}
