function setupScroll(containerId, leftBtnId, rightBtnId) {
  const container = document.getElementById(containerId);
  const leftBtn = document.getElementById(leftBtnId);
  const rightBtn = document.getElementById(rightBtnId);

  // Rola 200px (aprox 1 card + gap)
  const scrollAmount = 200;

  if (leftBtn && rightBtn && container) {
    leftBtn.addEventListener("click", () => {
      container.scrollLeft -= scrollAmount;
    });
    rightBtn.addEventListener("click", () => {
      container.scrollLeft += scrollAmount;
    });
  }
}

setupScroll("discover-grid", "btn-descubra-left", "btn-descubra-right");
setupScroll("genres-grid", "btn-genres-left", "btn-genres-right");
setupScroll("foryou-grid", "btn-foryou-left", "btn-foryou-right");
setupScroll("recent-grid", "btn-recent-left", "btn-recent-right");

// 1. Selecionamos os elementos do HTML pelo ID
const playBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');

// 2. Criamos uma variável para saber o estado atual (começa pausado)
let isPlaying = false;

// 3. Adicionamos o evento de clique
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        // Se já está tocando e clicou: PAUSA A MÚSICA
        playIcon.src = "../assets/icons/Play.png"; // Volta o ícone de Play
        isPlaying = false; // Atualiza o estado
        
        // Aqui você colocaria: audio.pause();
        
    } else {
        // Se está pausado e clicou: TOCA A MÚSICA
        playIcon.src = "../assets/icons/Pause.png"; // Troca para o ícone de Pause
        isPlaying = true; // Atualiza o estado
        
        // Aqui você colocaria: audio.play();
    }
});

// 2. Atualizar tempo ao arrastar a barra
if (progressBar) {
  progressBar.addEventListener("input", function () {
    // Simples cálculo para mostrar que funciona (valor 0 a 100)
    // Transforma o valor da barra em "minutos:segundos" fictícios
    let val = this.value;
    let minutes = Math.floor(val / 60);
    let seconds = val % 60;
    if (seconds < 10) seconds = "0" + seconds;
    currentTime.innerText = minutes + ":" + seconds;
  });
}

