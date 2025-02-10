const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const shortMonths = months.map((month) => month.substring(0, 3));

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const shortDaysOfWeek = daysOfWeek.map((day) => day.substring(0, 3));

const getCurrentUTC = (date = null, format = null) => {
  const currentDate = date ? new Date(date) : new Date();

  if (format) return formatDate(currentDate, format);

  return currentDate.toISOString();
};

const generateExpiryTimeUTC = (minutes = 1, format = null) => {
  const currentDate = new Date();
  currentDate.setUTCMinutes(currentDate.getUTCMinutes() + minutes);
  const utcString = currentDate.toISOString();

  if (format) return formatDate(utcString, format);

  return utcString;
};

const validateDates = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (!d1.getTime() || !d2.getTime()) {
    throw new Error('Invalid date(s) provided');
  }

  return d1 < d2;
};

const getLocalTimeFromUTC = (utcDate = null, format = null) => {
  const date = utcDate ? new Date(utcDate) : new Date();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const options = {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const localTime = formatter.format(date);

  if (format) return formatDate(localTime, format);

  return localTime;
};

const formatDate = (dateInput = new Date(), format = 'YYYY-MM-DD HH:mm:ss') => {
  const date = new Date(dateInput);

  const pad = (num) => (num < 10 ? `0${num}` : num);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const options = { timeZoneName: 'short' };
  const timeZoneFormatted = new Intl.DateTimeFormat('en-US', options)
    .format(date)
    .split(' ')[2];

  const formats = {
    YYYY: date.getFullYear(),
    MMMM: months[date.getMonth()],
    MMM: shortMonths[date.getMonth()],
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    SSS: pad(date.getMilliseconds()),
    d: shortDaysOfWeek[date.getDay()],
    dddd: daysOfWeek[date.getDay()],
    A: date.getHours() >= 12 ? 'PM' : 'AM',
    ZZ: timeZone,
    Z: timeZoneFormatted,
    'YYYY-MM-DD': `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  };

  const finalFormat = format
    .replace(/YYYY-MM-DD/g, formats['YYYY-MM-DD'])
    .replace(
      /YYYY|MMMM|MMM|MM|DD|HH|mm|ss|SSS|d|dddd|A|ZZ|Z/g,
      (match) => formats[match]
    );

  return finalFormat;
};

module.exports = {
  getCurrentUTC,
  getLocalTimeFromUTC,
  generateExpiryTimeUTC,
  validateDates,
};
