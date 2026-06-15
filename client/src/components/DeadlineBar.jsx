import { EVENT_INFO } from '../config/event.js';

export default function DeadlineBar() {
  return (
    <div className="deadline-bar">
      <div className="deadline-inner">
        <i className="ti ti-alert-triangle" aria-hidden="true"></i>
        <span>
          Registration closes on <strong>{EVENT_INFO.deadline}</strong>. Late registrations will not be accommodated.
        </span>
      </div>
    </div>
  );
}
