const imagens = [
 "assets/CRETA - AZUL SAPPHIRE.png",
 "assets/IONQ - PRATA.png",
 "assets/TUCSON - PRATA.png",
 "assets/HB20 - AZUL SAPHIRE.png",
 "assets/KONA - PRETO.png"
];

const premios = [
 "Bônus de R$5.000,00",
 "Bônus de R$3.000,00",
 "Documento Grátis",
 "Tanque Cheio (limitado a 1/mês - Alcool)",
 "Super Valorização do Usado"
];

// Carrega as imagens nos slots na inicialização
document.addEventListener('DOMContentLoaded', () => {
    const reels = document.querySelectorAll('.reel');
    reels.forEach(reel => createReelImages(reel));
    verificarBloqueioInicial();
});

function createReelImages(reel, imagemForcada = null) {
 reel.innerHTML = '';
 // Cria uma lista maior para o efeito de rotação
 for (let i = 0; i < 12; i++) {
   const img = document.createElement('img');
   // Se for imagem forçada, coloca ela em posições estratégicas, senão aleatório
   img.src = imagemForcada ? imagemForcada : imagens[Math.floor(Math.random() * imagens.length)];
   reel.appendChild(img);
 }
}

function verificarBloqueioInicial() {
    const dadosRoleta = JSON.parse(localStorage.getItem("roleta-dados"));
    if (dadosRoleta && dadosRoleta.tentativas >= 3) {
        girar(); // Chama a função para ativar o bloqueio imediatamente
    }
}

function girar() {
 const agora = Date.now();
 const tempoLimite = 1800000; // 30 minutos

 const dadosRoleta = JSON.parse(localStorage.getItem("roleta-dados")) || {
   primeiroGiro: 0,
   tentativas: 0
 };

 // Lógica de Reset de Tempo
 if (agora - dadosRoleta.primeiroGiro > tempoLimite) {
   dadosRoleta.primeiroGiro = agora;
   dadosRoleta.tentativas = 0;
   localStorage.setItem("roleta-dados", JSON.stringify(dadosRoleta));
 }

 // VERIFICAÇÃO DE BLOQUEIO
 if (dadosRoleta.tentativas >= 3) {
   const tempoRestante = tempoLimite - (agora - dadosRoleta.primeiroGiro);
   const timerContainer = document.getElementById("timer-container");
   timerContainer.classList.add("show");
   iniciarTimer(tempoRestante);
   return; // Para tudo aqui se estiver bloqueado
 }

 // --- INÍCIO DO GIRO ---
 
 // Atualiza tentativas
 if (dadosRoleta.tentativas === 0) {
     dadosRoleta.primeiroGiro = agora;
 }
 dadosRoleta.tentativas += 1;
 localStorage.setItem("roleta-dados", JSON.stringify(dadosRoleta));

 // Toca áudio
 const audio = document.getElementById("audio-spin");
 if (audio) {
   audio.currentTime = 0;
   audio.play().catch(e => console.log("Áudio bloqueado pelo navegador"));
 }

 const reels = document.querySelectorAll('.reel');
 const btn = document.getElementById("btn-girar");
 btn.disabled = true; // Bloqueia botão durante giro
 btn.textContent = "GIRANDO...";

 // Lógica de Vitória (30% de chance)
 const chanceDeGanho = 0.3;
 const vaiGanhar = Math.random() < chanceDeGanho;
 let imagemVencedora = null;

 if (vaiGanhar) {
   imagemVencedora = imagens[Math.floor(Math.random() * imagens.length)];
 }

 // Animação
 reels.forEach((reel, i) => {
   // Recria as imagens garantindo que a última (a que aparece) seja a vencedora ou aleatória
   createReelImages(reel, null); 
   
   // No final da lista, colocamos a imagem do resultado
   const imgResultado = document.createElement('img');
   imgResultado.src = imagemVencedora || imagens[Math.floor(Math.random() * imagens.length)];
   reel.appendChild(imgResultado);

   // Animação CSS
   reel.style.transition = 'none';
   reel.style.transform = 'translateY(0)';
   
   setTimeout(() => {
       reel.style.transition = `transform 1.5s cubic-bezier(0.25, 1, 0.5, 1) ${i * 0.2}s`;
       // O valor translateY deve corresponder à altura das imagens para parar na correta
       // Como adicionamos muitas imagens, vamos mover bastante para cima
       const alturaSlot = 100; // Altura definida no CSS
       const totalImagens = reel.children.length;
       const posicaoFinal = (totalImagens - 1) * alturaSlot; 
       reel.style.transform = `translateY(-${posicaoFinal}px)`;
   }, 50);
 });

 // FINALIZAÇÃO DO GIRO
 setTimeout(() => {
   const slots = Array.from(reels).map(reel => reel.lastElementChild.src);
   const resultadoEl = document.getElementById("resultado");
   const cta = document.getElementById("cta");
   const todasIguais = slots.every(src => src === slots[0]);

   if (todasIguais) {
     const premio = premios[Math.floor(Math.random() * premios.length)];
     resultadoEl.textContent = `🎉 PARABÉNS! VOCÊ GANHOU!`;
     
     // EFEITO DE CONFETES
     confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
     });

     // Link WhatsApp
     const numeroWhatsApp = '5514997246268'; 
     const mensagem = `Oi 👋 Girei a roleta da Hyundai Top Motors e ganhei: *${premio}*! Como resgato? 🤩`;
     const linkWhatsapp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

     cta.href = linkWhatsapp;
     cta.innerHTML = `🎁 RESGATAR: <b>${premio}</b>`;
     cta.style.display = "inline-block";
   } else {
     resultadoEl.textContent = `Não foi dessa vez! Tente novamente.`;
     cta.style.display = "none";
   }

   btn.disabled = false;
   btn.textContent = "GIRAR NOVAMENTE";

   // SE FOR A TERCEIRA TENTATIVA, CHAMA O BLOQUEIO AUTOMATICAMENTE
   if (dadosRoleta.tentativas >= 3) {
       setTimeout(() => {
           girar(); // Chama a função novamente para cair no bloqueio
       }, 2000); // Espera 2 segundos para o usuário ler que perdeu/ganhou antes de bloquear
   }

 }, 2200);
}

function iniciarTimer(tempoRestante) {
 const timerText = document.getElementById("timer-text");
 
 function atualizarTimer() {
   if (tempoRestante <= 0) {
     location.reload(); // Recarrega a página quando o tempo acaba
     return;
   }

   const minutos = Math.floor(tempoRestante / 60000);
   const segundos = Math.floor((tempoRestante % 60000) / 1000);
   timerText.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
   tempoRestante -= 1000;
 }

 setInterval(atualizarTimer, 1000);
 atualizarTimer();
}
