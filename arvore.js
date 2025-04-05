class No {
  constructor(valor) {
    this.valor = valor;
    this.esquerda = null;
    this.direita = null;
  }
}

class Arvore {
  constructor(tipo, containerId) {
    this.tipo = tipo;
    this.containerId = containerId;
    this.raiz = this.tipo === 'fibonacci' ? [] : null;
  }

  inserir(valor) {
    switch (this.tipo) {
      case 'bst':
        this.raiz = this.inserirBST(this.raiz, valor);
        break;
      case 'avl':
        this.raiz = this.inserirAVL(this.raiz, valor);
        break;
      case 'b':
        this.raiz = this.inserirBST(this.raiz, valor);
        break;
      case 'fibonacci':
        this.raiz.push(new No(valor));
        break;
    }
    this.desenhar();
  }

  inserirBST(no, valor) {
    if (!no) return new No(valor);
    if (valor < no.valor) no.esquerda = this.inserirBST(no.esquerda, valor);
    else no.direita = this.inserirBST(no.direita, valor);
    return no;
  }

  inserirAVL(no, valor) {
    if (!no) return new No(valor);
    if (valor < no.valor) no.esquerda = this.inserirAVL(no.esquerda, valor);
    else if (valor > no.valor) no.direita = this.inserirAVL(no.direita, valor);
    else return no;

    const fb = this.fatorBalanceamento(no);

    if (fb > 1 && valor < no.esquerda.valor)
      return this.rotacaoDireita(no);

    if (fb < -1 && valor > no.direita.valor)
      return this.rotacaoEsquerda(no);

    if (fb > 1 && valor > no.esquerda.valor) {
      no.esquerda = this.rotacaoEsquerda(no.esquerda);
      return this.rotacaoDireita(no);
    }

    if (fb < -1 && valor < no.direita.valor) {
      no.direita = this.rotacaoDireita(no.direita);
      return this.rotacaoEsquerda(no);
    }

    return no;
  }

  altura(no) {
    if (!no) return 0;
    return Math.max(this.altura(no.esquerda), this.altura(no.direita)) + 1;
  }

  fatorBalanceamento(no) {
    return this.altura(no.esquerda) - this.altura(no.direita);
  }

  rotacaoDireita(y) {
    const x = y.esquerda;
    const T2 = x.direita;

    x.direita = y;
    y.esquerda = T2;

    return x;
  }

  rotacaoEsquerda(x) {
    const y = x.direita;
    const T2 = y.esquerda;

    y.esquerda = x;
    x.direita = T2;

    return y;
  }

  desenhar() {
    const data = this.transformarEmD3(this.raiz);
    d3.select(`#${this.containerId}`).selectAll("svg").remove();

    const width = 600, height = 400;
    const svg = d3.select(`#${this.containerId}`)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    if (!data) return;

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().size([width - 100, height - 100]);
    treeLayout(root);

    svg.selectAll('line')
      .data(root.links())
      .enter()
      .append('line')
      .attr('x1', d => d.source.x + 50)
      .attr('y1', d => d.source.y + 50)
      .attr('x2', d => d.target.x + 50)
      .attr('y2', d => d.target.y + 50)
      .attr('stroke', 'black');

    svg.selectAll('circle')
      .data(root.descendants())
      .enter()
      .append('circle')
      .attr('cx', d => d.x + 50)
      .attr('cy', d => d.y + 50)
      .attr('r', 20)
      .attr('fill', '#4299e1');

    svg.selectAll('text')
      .data(root.descendants())
      .enter()
      .append('text')
      .attr('x', d => d.x + 50)
      .attr('y', d => d.y + 55)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text(d => d.data.name);
  }

  transformarEmD3(no) {
    if (this.tipo === 'fibonacci') {
      return {
        name: 'Raízes',
        children: this.raiz.map(n => this.transformarEmD3No(n))
      };
    } else {
      return this.transformarEmD3No(no);
    }
  }

  transformarEmD3No(no) {
    if (!no) return null;
    const obj = { name: no.valor.toString() };
    const filhos = [];
    if (no.esquerda) filhos.push(this.transformarEmD3No(no.esquerda));
    if (no.direita) filhos.push(this.transformarEmD3No(no.direita));
    if (filhos.length > 0) obj.children = filhos;
    return obj;
  }
}

const arvores = {
  bst: new Arvore('bst', 'arvore-bst'),
  avl: new Arvore('avl', 'arvore-avl'),
  b: new Arvore('b', 'arvore-b'),
  fibonacci: new Arvore('fibonacci', 'arvore-fibonacci'),
};

function inserirValor(tipo) {
  const input = document.getElementById(`valor-${tipo}`);
  const valor = parseInt(input.value);
  if (!isNaN(valor)) {
    arvores[tipo].inserir(valor);
    input.value = '';
  }
}

function exportarCSV(tipo) {
  const valores = [];
  const percorrer = (no) => {
    if (!no) return;
    percorrer(no.esquerda);
    valores.push(no.valor);
    percorrer(no.direita);
  };

  if (tipo === 'fibonacci') {
    arvores[tipo].raiz.forEach(percorrer);
  } else {
    percorrer(arvores[tipo].raiz);
  }

  const csv = valores.join(',');
  baixarArquivo(`${tipo}.csv`, csv);
}

function exportarJSON(tipo) {
  const json = JSON.stringify(arvores[tipo].raiz, null, 2);
  baixarArquivo(`${tipo}.json`, json);
}

function baixarArquivo(nome, conteudo) {
  const blob = new Blob([conteudo], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function limparArvore(tipo) {
  const container = document.getElementById(`arvore-${tipo}`);
  container.innerHTML = '';

  if (tipo === 'bst') {
    arvoreBST = null;
  } else if (tipo === 'avl') {
    arvoreAVL = null;
  } else if (tipo === 'b') {
    arvoreB = criarNovaArvoreB();
  } else if (tipo === 'fibonacci') {
    heapFibonacci = null;
    listaFibonacci = [];
  }
}
