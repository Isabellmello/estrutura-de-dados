let listaFrente = [];
let listaTransposicao = [];
let listaSkip = [];

function desenharLista(lista, elementoId) {
  const container = document.getElementById(elementoId);
  container.innerHTML = '';

  lista.forEach((valor) => {
    const no = document.createElement('div');
    no.textContent = valor;
    no.style.display = 'inline-block';
    no.style.width = '40px';
    no.style.height = '40px';
    no.style.lineHeight = '40px';
    no.style.margin = '6px';
    no.style.backgroundColor = '#3b82f6';
    no.style.color = 'white';
    no.style.borderRadius = '50%';
    no.style.textAlign = 'center';
    no.style.fontWeight = 'bold';
    no.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    container.appendChild(no);
  });
}

function inserirFrente() {
  const valor = parseInt(document.getElementById('inputFrente').value);
  if (isNaN(valor)) return;

  const index = listaFrente.indexOf(valor);
  if (index !== -1) listaFrente.splice(index, 1);
  listaFrente.unshift(valor);
  desenharLista(listaFrente, 'listaFrente');
}

function inserirTransposicao() {
  const valor = parseInt(document.getElementById('inputTransposicao').value);
  if (isNaN(valor)) return;

  const index = listaTransposicao.indexOf(valor);

  if (index === -1) {
    listaTransposicao.push(valor);
  } else if (index > 0) {
    [listaTransposicao[index], listaTransposicao[index - 1]] = 
      [listaTransposicao[index - 1], listaTransposicao[index]];
  }

  desenharLista(listaTransposicao, 'listaTransposicao');
}

function inserirSkip() {
  const valor = parseInt(document.getElementById('inputSkip').value);
  if (isNaN(valor)) return;

  if (!listaSkip.includes(valor)) {
    listaSkip.push(valor);
    listaSkip.sort((a, b) => a - b);
  }
  desenharLista(listaSkip, 'listaSkip');
}

function exportarCSV(tipo) {
  const lista = getLista(tipo);
  const csv = "data:text/csv;charset=utf-8," + lista.join(",");
  const encodedUri = encodeURI(csv);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `lista_${tipo}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportarJSON(tipo) {
  const lista = getLista(tipo);
  const json = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lista));
  const link = document.createElement("a");
  link.setAttribute("href", json);
  link.setAttribute("download", `lista_${tipo}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function limparLista(tipo) {
  if (tipo === 'frente') listaFrente = [];
  else if (tipo === 'transposicao') listaTransposicao = [];
  else if (tipo === 'skip') listaSkip = [];

  desenharLista(getLista(tipo), `lista${capitalize(tipo)}`);
}

function getLista(tipo) {
  if (tipo === 'frente') return listaFrente;
  if (tipo === 'transposicao') return listaTransposicao;
  if (tipo === 'skip') return listaSkip;
  return [];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
