let audio: HTMLAudioElement | null = null;

export function playNewOrderSound() {
  // cria apenas uma instância (evita bug e sobreposição)
  if (!audio) {
    audio = new Audio("/sounds/new-order.mp3");
    audio.loop = true;     // 🔁 loop até parar
    audio.volume = 1;     // volume máximo (ajuste se quiser)
  }

  // evita tentar dar play repetidas vezes se já estiver tocando
  if (!audio.paused) return;

  audio
    .play()
    .then(() => {
      console.log("🔊 Som de novo pedido tocando (loop)");
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
