// OpeningHours.tsx
import React, { useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { isCurrentlyOpen } from '../utilities';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** format a "hhmm" string into e.g. "9AM", "12:30PM", etc. */
function formatTimeString(hhmm: string): string {
  const hour = parseInt(hhmm.slice(0, 2), 10);
  const minute = parseInt(hhmm.slice(2), 10);
  const date = new Date();
  date.setHours(hour, minute);
  let h = date.getHours();
  const ampm = h < 12 ? 'AM' : 'PM';
  h = h % 12 || 12;
  return minute
    ? `${h}:${minute.toString().padStart(2, '0')}${ampm}`
    : `${h}${ampm}`;
}

interface Props {
  openingHours: google.maps.places.PlaceOpeningHours;
}

type Event = {
  type: 'open' | 'close';
  time: google.maps.places.PlaceOpeningHoursPeriod['open'] | NonNullable<google.maps.places.PlaceOpeningHoursPeriod['close']>;
};

export const OpeningHours: React.FC<Props> = ({ openingHours }) => {
  const [expanded, setExpanded] = useState(false);
  const now = Date.now();

  // determine open/closed
  const isOpenNow = isCurrentlyOpen(openingHours.periods, now);

  // flatten into a list of open/close events:
  const events: Event[] = (openingHours.periods ?? []).flatMap<Event>(p => {
    const ev: Event[] = [
      { type: 'open', time: p.open }
    ];
    if (p.close) {
      ev.push({ type: 'close', time: p.close });
    }
    return ev;
  })
    // now you can safely sort by nextDate:
    .sort((a, b) => (a.time.nextDate! - b.time.nextDate!));


  // pick the very next event after `now`
  const nextEvent = events.find(e => (e.time.nextDate! > now));

  // summary text
  const summaryText = isOpenNow
    ? `Open now · Closes ${nextEvent ? formatTimeString(nextEvent.time.time) : '—'}`
    : `Closed · Opens ${nextEvent ? formatTimeString(nextEvent.time.time) : '—'}`;

  // build the 7 rows of the details table, starting from today
  const rows: { day: string; times: string }[] = [];

  // helper: rotate an array start at today
  const rotate = <T,>(arr: T[]) => {
    const start = new Date().getDay();
    return Array.from({ length: 7 }, (_, i) => arr[(start + i) % 7]);
  };

  if (openingHours.weekday_text && openingHours.weekday_text.length === 7) {
    // each entry is e.g. "Monday: 11AM–12AM"
    rotate(openingHours.weekday_text).forEach(text => {
      const [day, times] = text.split(': ');
      rows.push({ day, times });
    });
  } else {
    // fallback to raw periods grouping
    const grouped: Record<number, google.maps.places.PlaceOpeningHoursPeriod[]> = {};
    (openingHours.periods ?? []).forEach(p => {
      const d = p.open.day;
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(p);
    });
    rotate(daysOfWeek).forEach(dayName => {
      const dayIdx = daysOfWeek.indexOf(dayName);
      const periods = grouped[dayIdx] || [];
      if (periods.length) {
        const times = periods
          .map(p => `${formatTimeString(p.open.time)}–${formatTimeString(p.close?.time ?? p.open.time)}`)
          .join(', ');
        rows.push({ day: dayName, times });
      } else {
        rows.push({ day: dayName, times: 'Closed' });
      }
    });
  }

  return (
    <div>
      {/* summary bar */}
      <div
        onClick={() => setExpanded(x => !x)}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <AccessTimeIcon fontSize="small" style={{ marginRight: 4, color: isOpenNow ? 'green' : 'red' }} />
        <span style={{ flex: 1 }}>{summaryText}</span>
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </div>

      {/* details table */}
      {expanded && (
        <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map(r => (
              <tr key={r.day}>
                <td style={{ padding: '4px 8px', fontWeight: 500 }}>{r.day}</td>
                <td style={{ padding: '4px 8px' }}>{r.times}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OpeningHours;