import Hero from '../components/Hero.jsx';
import EventDetails from '../components/EventDetails.jsx';
import DeadlineBar from '../components/DeadlineBar.jsx';
import RegistrationForm from '../components/RegistrationForm.jsx';
import Footer from '../components/Footer.jsx';

export default function RegistrationPage() {
  return (
    <div className="page-bg">
      <Hero />
      <EventDetails />
      <DeadlineBar />
      <div className="form-wrap">
        <RegistrationForm />
      </div>
      <Footer />
    </div>
  );
}
