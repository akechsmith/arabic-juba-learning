export const playAudio = (audioUrl) => {
  try {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.warn('Audio playback failed:', error);
    });
  } catch (error) {
    console.warn('Audio creation failed:', error);
  }
};

export const preloadAudio = (audioUrls) => {
  audioUrls.forEach(url => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;
  });
};