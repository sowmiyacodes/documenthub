let audioContext;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ||= new AudioContextClass();
  return audioContext;
};

export const prepareNotificationSound = () => {
  const context = getAudioContext();
  if (!context || context.state !== "suspended") return Boolean(context);
  context.resume().catch((error) => {
    console.warn("Could not enable reminder sounds:", error);
  });
  return true;
};

export const playNotificationSound = async () => {
  const context = getAudioContext();
  if (!context) return false;

  try {
    if (context.state === "suspended") await context.resume();
    const startAt = context.currentTime + 0.02;
    for (const [frequency, offset] of [[880, 0], [1174.66, 0.16]]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, startAt + offset);
      gain.gain.exponentialRampToValueAtTime(0.16, startAt + offset + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + 0.32);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt + offset);
      oscillator.stop(startAt + offset + 0.34);
    }
    return true;
  } catch (error) {
    console.warn("Could not play the reminder sound:", error);
    return false;
  }
};
