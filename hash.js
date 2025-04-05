const tamanhoTabela = 11;
let tabelas = {
  perfeito: new Array(tamanhoTabela).fill(null),
  universal: new Array(tamanhoTabela).fill(null),
  colisao: {
    encadeamento: Array.from({ length: tamanhoTabela }, () => []),
    linear: new Array(tamanhoTabela).fill(null),
    duplo: new Array(tamanhoTabela).fill(null)
  }
};


function hashPerfeito(x) {
  return x % tamanhoTabela;
}

function hashUniversal(x) {
  const a = 3, b = 7, p = 17;
  return ((a * x + b) % p) % tamanhoTabela;
}

function hashComColisao(x, tabela) {
  let indice = x % tamanhoTabela;
  const inicio = indice;

  while (tabela[indice] !== null) {
    indice = (indice + 1) % tamanhoTabela;
    if (indice === inicio) return -1;
  }

  return indice;
}

function hashDuplo(x, tabela) {
  let h1 = x % tamanhoTabela;
  let h2 = 1 + (x % (tamanhoTabela - 1));
  let i = 0;

  while (tabela[(h1 + i * h2) % tamanhoTabela] !== null) {
    i++;
    if (i === tamanhoTabela) return -1;
  }

  return (h1 + i * h2) % tamanhoTabela;
}


function desenharTabelaHash(id, tabela) {
  const svg = d3.select(`#${id}`)
    .html('')
    .append("svg")
    .attr("width", "100%")
    .attr("height", 120);

  const espacamento = 80;
  const offsetX = 50;
  const offsetY = 60;

  svg.selectAll("rect")
    .data(tabela)
    .enter()
    .append("rect")
    .attr("x", (d, i) => offsetX + i * espacamento)
    .attr("y", offsetY - 30)
    .attr("width", 60)
    .attr("height", 60)
    .attr("fill", d => d === null ? "#e5e7eb" : "#3b82f6")
    .attr("stroke", "#000");

  svg.selectAll("text.value")
    .data(tabela)
    .enter()
    .append("text")
    .attr("class", "value")
    .attr("x", (d, i) => offsetX + i * espacamento + 30)
    .attr("y", offsetY + 5)
    .attr("text-anchor", "middle")
    .attr("fill", d => d === null ? "#000" : "#fff")
    .attr("font-size", "16px")
    .text(d => d !== null ? d : "");

  svg.selectAll("text.index")
    .data(tabela)
    .enter()
    .append("text")
    .attr("class", "index")
    .attr("x", (d, i) => offsetX + i * espacamento + 30)
    .attr("y", offsetY + 50)
    .attr("text-anchor", "middle")
    .attr("fill", "#374151")
    .attr("font-size", "12px")
    .text((d, i) => i);
}

function desenharColisao() {
  const estrategia = document.getElementById("estrategiaColisao").value;
  const tabela = tabelas.colisao[estrategia];

  if (estrategia === "encadeamento") {
    const container = d3.select("#comparacaoColisao").html("");

    tabela.forEach((lista, i) => {
      const div = container.append("div").attr("class", "mb-2");
      div.append("span").text(`[${i}]: `).attr("class", "font-bold");

      lista.forEach((val) => {
        div.append("span")
          .text(val)
          .attr("class", "inline-block bg-blue-500 text-white px-2 py-1 rounded mr-2");
      });
    });
  } else {
    desenharTabelaHash("comparacaoColisao", tabela);
  }
}


function inserirValor(tipo) {
  const input = document.getElementById(`input${capitalize(tipo)}`);
  const valor = parseInt(input.value);

  if (isNaN(valor)) return;

  if (tipo === "colisao") {
    const estrategia = document.getElementById("estrategiaColisao").value;

    if (estrategia === "encadeamento") {
      const indice = valor % tamanhoTabela;
      tabelas.colisao.encadeamento[indice].push(valor);

    } else if (estrategia === "linear") {
      const indice = hashComColisao(valor, tabelas.colisao.linear);
      if (indice === -1) {
        alert("Tabela cheia!");
        return;
      }
      tabelas.colisao.linear[indice] = valor;

    } else if (estrategia === "duplo") {
      const indice = hashDuplo(valor, tabelas.colisao.duplo);
      if (indice === -1) {
        alert("Tabela cheia!");
        return;
      }
      tabelas.colisao.duplo[indice] = valor;
    }

    desenharColisao();
    input.value = "";
    return;
  }

  const tabela = tabelas[tipo];
  let indice = -1;

  if (tipo === "perfeito") {
    indice = hashPerfeito(valor);
    if (tabela[indice] !== null) {
      alert(`Colisão detectada na posição ${indice}! Hashing perfeito não permite colisões.`);
      return;
    }
  } else if (tipo === "universal") {
    indice = hashUniversal(valor);
    if (tabela[indice] !== null) {
      alert(`Colisão detectada na posição ${indice}!`);
      return;
    }
  }

  tabela[indice] = valor;

  const idMap = {
    perfeito: "hashPerfeito",
    universal: "hashUniversal"
  };

  desenharTabelaHash(idMap[tipo], tabela);
  input.value = "";
}


function limparHash(tipo) {
  if (tipo === "colisao") {
    tabelas.colisao = {
      encadeamento: Array.from({ length: tamanhoTabela }, () => []),
      linear: new Array(tamanhoTabela).fill(null),
      duplo: new Array(tamanhoTabela).fill(null)
    };
    desenharColisao();
    return;
  }

  tabelas[tipo] = new Array(tamanhoTabela).fill(null);

  const idMap = {
    perfeito: "hashPerfeito",
    universal: "hashUniversal"
  };

  desenharTabelaHash(idMap[tipo], tabelas[tipo]);
}


function exportarCSV(idElemento) {
  const tabela = getTabelaById(idElemento);
  const csv = tabela.map((valor, i) => `${i},${Array.isArray(valor) ? valor.join("|") : (valor === null ? "" : valor)}`).join("\n");
  baixarArquivo(csv, "hash.csv", "text/csv");
}

function exportarJSON(idElemento) {
  const tabela = getTabelaById(idElemento);
  const json = JSON.stringify(tabela);
  baixarArquivo(json, "hash.json", "application/json");
}

function baixarArquivo(conteudo, nome, tipo) {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}


function getTabelaById(id) {
  if (id === "hashPerfeito") return tabelas.perfeito;
  if (id === "hashUniversal") return tabelas.universal;
  if (id === "comparacaoColisao") {
    const estrategia = document.getElementById("estrategiaColisao").value;
    return tabelas.colisao[estrategia];
  }
  return [];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


document.addEventListener("DOMContentLoaded", () => {
  desenharTabelaHash("hashPerfeito", tabelas.perfeito);
  desenharTabelaHash("hashUniversal", tabelas.universal);
  desenharColisao();


  document.getElementById("estrategiaColisao").addEventListener("change", desenharColisao);
});
