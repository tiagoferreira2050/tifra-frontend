let audio: HTMLAudioElement | null = null;

export function playNewOrderSound() {
  if (!audio) {
    audio = new Audio("/sounds/new-order.mp3");
    audio.loop = true;
    audio.volume = 1;
  }

  audio
    .play()
    .then(() => {
      console.log("🔊 Som de novo pedido tocando");
    })
    .catch((err) => {
      console.warn("⚠️ Browser bloqueou o áudio:", err);
    });
}

export function stopNewOrderSound() {
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
  console.log("🔇 Som de novo pedido parado");
}
