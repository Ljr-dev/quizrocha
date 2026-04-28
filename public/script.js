let etapa = 0;
let score = 0;
let respostaSelecionada = null;

const perguntas = [
  {
    pergunta: "Você tem site hoje?",
    opcoes: [
      { texto: "Não tenho", valor: 0 },
      { texto: "Tenho mas não dá resultado", valor: 1 }
    ]
  },
  {
    pergunta: "Seus clientes te encontram no Google?",
    opcoes: [
      { texto: "Não", valor: 0 },
      { texto: "Mais ou menos", valor: 1 },
      { texto: "Sim", valor: 2 }
    ]
  },
  {
    pergunta: "Você perde clientes por demora no atendimento?",
    opcoes: [
      { texto: "Sim", valor: 0 },
      { texto: "Às vezes", valor: 1 },
      { texto: "Não", valor: 2 }
    ]
  },
  {
    pergunta: "Você usa WhatsApp para vender?",
    opcoes: [
      { texto: "Sim", valor: 2 },
      { texto: "Não", valor: 0 }
    ]
  },
  {
    pergunta: "Você quer mais clientes?",
    opcoes: [
      { texto: "Sim, urgente", valor: 0 },
      { texto: "Sim, mas sem pressa", valor: 1 },
      { texto: "Estou ok", valor: 2 }
    ]
  }
];

function iniciarQuiz() {
  const quiz = document.getElementById("quiz");
  quiz.classList.add("show");

  setTimeout(() => {
    quiz.scrollIntoView({ behavior: "smooth" });
  }, 100);

  carregarPergunta();
}

function carregarPergunta() {
  respostaSelecionada = null;

  const p = perguntas[etapa];

  document.getElementById("pergunta").innerText = p.pergunta;

  const opcoesDiv = document.getElementById("opcoes");
  opcoesDiv.innerHTML = "";

  p.opcoes.forEach(op => {
    const div = document.createElement("div");
    div.className = "opcao";
    div.innerText = op.texto;

    div.onclick = () => {
      respostaSelecionada = op.valor;

      document.querySelectorAll(".opcao").forEach(o => {
        o.style.background = "#334155";
      });

      div.style.background = "#22c55e";
    };

    opcoesDiv.appendChild(div);
  });
}

function proximaPergunta() {
  if (respostaSelecionada === null) {
    alert("Selecione uma opção");
    return;
  }

  score += respostaSelecionada;
  etapa++;

  if (etapa < perguntas.length) {
    carregarPergunta();
  } else {
    mostrarResultado();
  }
}

function mostrarResultado() {
  let mensagem = "";

  if (score <= 3) {
    mensagem = "⚠️ Seu negócio está perdendo muitos clientes!";
  } else if (score <= 6) {
    mensagem = "🚀 Você pode melhorar e crescer mais!";
  } else {
    mensagem = "🔥 Seu negócio está bem posicionado!";
  }

  document.getElementById("quiz").innerHTML = `
    <h2>${mensagem}</h2>
    <p>Eu posso criar um sistema que gera clientes automaticamente para o seu negócio.</p>
    <br>
    <a href="https://wa.me/5519982144043?text=Concluí%20o%20diagnóstico%20e%20gostaria%20de%20um%20orçamento%20para%20um%20site%20profissional%20focado%20em%20geração%20de%20clientes" target="_blank">
      👉 Solicitar orçamento
    </a>
  `;
}