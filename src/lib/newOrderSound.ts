let audio: HTMLAudioElement | null = null;

export function playNewOrderSound() {
  if (!audio) {
    audio = new Audio("/sounds/new-order.mp3");
    audio.loop = true; // 🔁 toca até aceitar o pedido
    audio.volume = 1;
  }

  audio.currentTime = 0;
  audio.play().catch(() => {
    // navegador só libera após interação do usuário
  });
}

export function stopNewOrderSound() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
