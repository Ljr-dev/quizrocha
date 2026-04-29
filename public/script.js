let etapa = 0;
let score = 0;
let respostaSelecionada = null;

const mensagemWhatsApp = encodeURIComponent(
  "Concluí o diagnóstico e gostaria de um orçamento para um site profissional focado em geração de clientes."
);

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
  }
];

function iniciarQuiz() {
  const quiz = document.getElementById("quiz");
  quiz.classList.add("show");

  quiz.scrollIntoView({ behavior: "smooth" });

  etapa = 0;
  score = 0;

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
        o.classList.remove("selected");
      });

      div.classList.add("selected");
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
  document.getElementById("quiz").innerHTML = `
    <h2>⚠️ Seu negócio está perdendo clientes!</h2>
    <p>Eu posso resolver isso pra você.</p>
    <br>
    <a href="https://wa.me/5519982144043?text=${mensagemWhatsApp}" target="_blank">
      👉 Solicitar orçamento
    </a>
  `;
}