// (C) Copyright 2015 Hewlett Packard Enterprise Development LP

export default function (fromDate, toDate) {
  let delta = toDate.getTime() - fromDate.getTime();
  if (delta < 1000) {
    return (Math.round(delta / 100) / 10).toString() + 's';
  } else if (delta < 60000) {
    return Math.round(delta / 1000).toString() + 's';
  } else if (delta < 3600000) {
    return Math.round(delta / 60000).toString() + 'm';
  } else if (delta < 86400000) {
    return Math.round(delta / 3600000).toString() + 'h';
  } else {
    return Math.round(delta / 86400000).toString() + 'd';
  }
}
