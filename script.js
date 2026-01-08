const imagens = [
 "assets/CRETA - AZUL SAPPHIRE.png",
 "assets/IONQ - PRATA.png",
 "assets/TUCSON - PRATA.png",
 "assets/HB20 - AZUL SAPHIRE.png",
 "assets/KONA - PRETO.png"
];

// --- PRÊMIOS ATUALIZADOS ---
const premios = [
 "Bônus de R$5.000,00",
 "Bônus de R$3.000,00",
 "Documento 2026 Grátis (Emplacamento + Licenciamento)",
 "Um ano de tanque Cheio (limitado a 1 por mês - Alcool)",
 "Super Valorização no seu seminovo"
];

document.addEventListener('DOMContentLoaded', () => {
    const reels = document.querySelectorAll('.reel');
    reels.forEach(reel => createReelImages(reel));
    verificarBloqueioInicial();
});

function createReelImages(reel, imagemForcada = null) {
 reel.innerHTML = '';
 for (let i = 0; i < 12; i++) {
   const img = document.createElement('img');
   img.src = imagemForcada ? imagemForcada : imagens[Math.floor(Math.random() * imagens.length)];
   reel.appendChild(img);
 }
}

function verificarBloqueioInicial() {
    const dadosRoleta = JSON.parse(localStorage.getItem("roleta-dados"));
    if (dadosRoleta && dadosRoleta.tentativas >= 3) {
        girar(); 
    }
}

function girar() {
 const agora = Date.now();
 const tempoLimite = 1800000; // 30 minutos

 const dadosRoleta = JSON.parse(localStorage.getItem("roleta-dados")) || {
   primeiroGiro: 0,
   tentativas: 0
 };

 if (agora - dadosRoleta.primeiroGiro > tempoLimite) {
   dadosRoleta.primeiroGiro = agora;
   dadosRoleta.tentativas = 0;
   localStorage.setItem("roleta-dados", JSON.stringify(dadosRoleta));
 }

 // BLOQUEIO (Só ativa se clicar pela 4ª vez)
 if (dadosRoleta.tentativas >= 3) {
   const tempoRestante = tempoLimite - (agora - dadosRoleta.primeiroGiro);
   const timerContainer = document.getElementById("timer-container");
   
   let aviso = document.getElementById("aviso-timer");
   if(!aviso) {
       aviso = document.createElement("div");
       aviso.id = "aviso-timer";
       aviso.style.color = "white";
       aviso.style.fontSize = "18px";
       aviso.style.textAlign = "center";
       aviso.style.marginBottom = "10px";
       aviso.innerHTML = "Limite de tentativas atingido.<br>Tente novamente em:";
       timerContainer.insertBefore(aviso, document.getElementById("timer-text"));
   }

   timerContainer.classList.add("show");
   iniciarTimer(tempoRestante);
   return;
 }

 if (dadosRoleta.tentativas === 0) {
     dadosRoleta.primeiroGiro = agora;
 }
 
 dadosRoleta.tentativas += 1;
 localStorage.setItem("roleta-dados", JSON.stringify(dadosRoleta));

 const audio = document.getElementById("audio-spin");
 if (audio) {
   audio.currentTime = 0;
   audio.play().catch(e => console.log("Áudio bloqueado pelo navegador"));
 }

 const reels = document.querySelectorAll('.reel');
 const btn = document.getElementById("btn-girar");
 btn.disabled = true;
 btn.textContent = "GIRANDO...";

 const chanceDeGanho = 0.3;
 const vaiGanhar = Math.random() < chanceDeGanho;
 let imagemVencedora = null;

 if (vaiGanhar) {
   imagemVencedora = imagens[Math.floor(Math.random() * imagens.length)];
 }

 reels.forEach((reel, i) => {
   createReelImages(reel, null); 
   
   const imgResultado = document.createElement('img');
   imgResultado.src = imagemVencedora || imagens[Math.floor(Math.random() * imagens.length)];
   reel.appendChild(imgResultado);

   reel.style.transition = 'none';
   reel.style.transform = 'translateY(0)';
   
   setTimeout(() => {
