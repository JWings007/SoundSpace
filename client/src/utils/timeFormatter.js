export function formatDuration(milliseconds) {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
}

export function timeConverter(ms) {
  let mins = Math.floor(ms / 1000 / 60);
  let secs = Math.floor((ms / 1000) % 60);
  secs = secs < 10 ? "0" + secs : secs;

  return `${mins}:${secs}`;
}
