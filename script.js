
'use strict';

/* ==========================================
   MYF ELECTROLAB 5.2
   LEY DE OHM + GRÁFICA I-V PROGRESIVA
========================================== */

// FUNCIONES GENERALES

const $ = id => document.getElementById(id);

const fmt = (n, d = 2) =>
  Number(n).toFixed(d).replace('.', ',');

const SVG_NS = 'http://www.w3.org/2000/svg';

function svg(tag, attrs = {}, text) {
  const el = document.createElementNS(SVG_NS, tag);

  Object.entries(attrs).forEach(([k, v]) => {
    el.setAttribute(k, String(v));
  });

  if (text !== undefined) {
    el.textContent = String(text);
  }

  return el;
}

// ==========================================
// 1. LECCIONES Y PROGRESO
// ==========================================

let leccionActual = 0;

const estudiadas = new Set();

const pestanas = [
  ...document.querySelectorAll('[data-leccion]')
];

function mostrarLeccion(i) {
  leccionActual = Math.max(0, Math.min(5, i));

  document.querySelectorAll('.leccion').forEach((el, n) => {
    el.hidden = n !== leccionActual;
  });

  pestanas.forEach((b, n) => {
    b.classList.toggle('activa', n === leccionActual);
    b.classList.toggle('completada', estudiadas.has(n));
  });

  $('anteriorLeccion').disabled = leccionActual === 0;
  $('siguienteLeccion').disabled = leccionActual === 5;

  $('completarLeccion').textContent =
    estudiadas.has(leccionActual)
      ? '✓ Lección estudiada'
      : '✓ Marcar como estudiada';
}

function progreso() {
  $('textoProgreso').textContent =
    `${estudiadas.size} de 6 lecciones estudiadas`;

  $('rellenoProgreso').style.width =
    `${estudiadas.size / 6 * 100}%`;

  mostrarLeccion(leccionActual);
}

pestanas.forEach(b => {
  b.addEventListener('click', () => {
    mostrarLeccion(Number(b.dataset.leccion));
  });
});

$('anteriorLeccion').addEventListener('click', () => {
  mostrarLeccion(leccionActual - 1);
});

$('siguienteLeccion').addEventListener('click', () => {
  mostrarLeccion(leccionActual + 1);
});

$('completarLeccion').addEventListener('click', () => {
  estudiadas.add(leccionActual);
  progreso();
});

// PREGUNTAS CORTAS

document.querySelectorAll('[data-mini]').forEach(b => {
  b.addEventListener('click', () => {
    const id = b.dataset.mini;
    const bien = b.dataset.bien === 'si';
    const p = $('respuestaMini' + id);

    p.className =
      'retro ' + (bien ? 'correcta' : 'incorrecta');

    p.textContent = id === '1'
      ? (
          bien
            ? '✓ Correcto. Con R constante, I es proporcional a V.'
            : '✗ Aplica I = V/R y vuelve a intentarlo.'
        )
      : (
          bien
            ? '✓ Correcto. Un amperímetro ideal podría cortocircuitar la fuente.'
            : '✗ Recuerda que el amperímetro tiene una resistencia interna muy baja.'
        );
  });
});

// ==========================================
// 2. CALCULADORA DE OHM
// ==========================================

let magnitud = 'I';

const configuracion = {
  I: ['I = V / R', 'Voltaje (V)', 'Resistencia (Ω)', 12, 300],
  V: ['V = I × R', 'Corriente (A)', 'Resistencia (Ω)', 0.02, 300],
  R: ['R = V / I', 'Voltaje (V)', 'Corriente (A)', 12, 0.04]
};

function calcular() {
  const s1 = $('dato1').value.trim();
  const s2 = $('dato2').value.trim();

  const a = Number(s1);
  const b = Number(s2);

  if (
    !s1 ||
    !s2 ||
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    a < 0 ||
    b <= 0
  ) {
    $('resultadoCalculadora').textContent =
      'Introduce números válidos y un segundo dato mayor que cero.';

    $('pasosCalculadora').textContent =
      'No se puede dividir por cero ni usar una resistencia negativa en este ejercicio.';

    return;
  }

  if (magnitud === 'I') {
    $('resultadoCalculadora').textContent =
      `I = ${fmt(a / b, 6)} A = ${fmt(a / b * 1000)} mA`;

    $('pasosCalculadora').textContent =
      `1. V = ${fmt(a)} V y R = ${fmt(b)} Ω. ` +
      `2. Aplicamos I = V/R. ` +
      `3. Sustituimos ${fmt(a)} ÷ ${fmt(b)}. ` +
      `4. Multiplicamos los amperios por 1000 ` +
      `para obtener miliamperios.`;
  }

  else if (magnitud === 'V') {
    $('resultadoCalculadora').textContent =
      `V = ${fmt(a * b, 4)} V`;

    $('pasosCalculadora').textContent =
      `1. I = ${fmt(a, 4)} A y R = ${fmt(b)} Ω. ` +
      `2. Fórmula V = I × R. ` +
      `3. Multiplicamos ${fmt(a, 4)} × ${fmt(b)}. ` +
      `4. Expresamos el resultado en voltios.`;
  }

  else {
    $('resultadoCalculadora').textContent =
      `R = ${fmt(a / b, 4)} Ω`;

    $('pasosCalculadora').textContent =
      `1. V = ${fmt(a)} V e I = ${fmt(b, 4)} A. ` +
      `2. Fórmula R = V/I. ` +
      `3. Dividimos ${fmt(a)} ÷ ${fmt(b, 4)}. ` +
      `4. Expresamos el resultado en ohmios.`;
  }
}

function seleccionarMagnitud(tipo) {
  magnitud = tipo;

  const [f, e1, e2, a, b] = configuracion[tipo];

  $('formulaSeleccionada').textContent = f;
  $('etiquetaDato1').textContent = e1;
  $('etiquetaDato2').textContent = e2;
  $('dato1').value = a;
  $('dato2').value = b;

  document.querySelectorAll('[data-calculo]').forEach(el => {
    el.classList.toggle(
      'seleccionado',
      el.dataset.calculo === tipo
    );
  });

  calcular();
}

document.querySelectorAll('[data-calculo]').forEach(el => {
  el.addEventListener('click', () => {
    seleccionarMagnitud(el.dataset.calculo);
  });
});

$('dato1').addEventListener('input', calcular);
$('dato2').addEventListener('input', calcular);

// ==========================================
// 3. BANDAS DE COLORES
// ==========================================

const paleta = [
  ['Negro', '#111827'],
  ['Marrón', '#92400e'],
  ['Rojo', '#ef4444'],
  ['Naranja', '#f97316'],
  ['Amarillo', '#eab308'],
  ['Verde', '#16a34a'],
  ['Azul', '#2563eb'],
  ['Violeta', '#7c3aed'],
  ['Gris', '#64748b'],
  ['Blanco', '#ffffff']
];

function multiplicadorColor(e) {
  if (e === -2) return '#c0c0c0';
  if (e === -1) return '#d4af37';

  return paleta[e][1];
}

function resistenciaColores(R) {
  const exponente = Math.floor(Math.log10(R)) - 1;
  const dos = Math.round(R / 10 ** exponente);

  const n = [
    Math.floor(dos / 10),
    dos % 10,
    exponente
  ];

  return {
    n,
    colores: [
      paleta[n[0]][1],
      paleta[n[1]][1],
      multiplicadorColor(n[2]),
      '#d4af37'
    ]
  };
}

function descodificarColores() {
  const a = Number($('bandaSelect1').value);
  const b = Number($('bandaSelect2').value);
  const e = Number($('bandaSelect3').value);
  const tol = Number($('bandaSelect4').value);

  const R = (10 * a + b) * 10 ** e;

  const colors = [
    paleta[a][1],
    paleta[b][1],
    multiplicadorColor(e),
    tol === 5
      ? '#d4af37'
      : tol === 10
        ? '#c0c0c0'
        : paleta[tol][1]
  ];

  colors.forEach((c, i) => {
    $('colorBanda' + (i + 1))
      .setAttribute('fill', c);
  });

  $('resultadoResistencia').textContent =
    `${fmt(R)} Ω ±${tol} %`;

  $('intervaloResistencia').textContent =
    `Intervalo teórico de tolerancia: ` +
    `${fmt(R * (1 - tol / 100))} Ω a ` +
    `${fmt(R * (1 + tol / 100))} Ω`;

  $('explicacionBandas').textContent =
    `1. Las cifras son ${a} y ${b} ` +
    `(número ${10 * a + b}). ` +
    `2. Multiplicador ×10^${e}. ` +
    `3. Valor nominal ${fmt(R)} Ω. ` +
    `4. Tolerancia ±${tol} %.`;
}

[
  'bandaSelect1',
  'bandaSelect2',
  'bandaSelect3',
  'bandaSelect4'
].forEach(id => {
  $(id).addEventListener('change', descodificarColores);
});

// ==========================================
// 4. GRÁFICA TEÓRICA DE FUNDAMENTACIÓN
// ==========================================

let modoTeorico = 'voltaje';

function graficaTeorica() {
  const fijo = Number($('valorFijo').value);
  const datos = [];

  if (modoTeorico === 'voltaje') {
    $('textoFijo').textContent = 'Resistencia fija';
    $('textoValorFijo').textContent = `${fijo} Ω`;

    for (let V = 0; V <= 24; V += 3) {
      datos.push({
        x: V,
        y: V / fijo * 1000
      });
    }

    $('explicacionRelacion').textContent =
      `R = ${fijo} Ω es constante. ` +
      `La corriente es proporcional a V y la pendiente ` +
      `es ${fmt(1000 / fijo, 3)} mA/V.`;

    $('ejemploRelacion').textContent =
      `A 12 V: I = ${fmt(12000 / fijo)} mA`;

    $('descripcionGrafica').textContent =
      'Eje X: voltaje (V). Eje Y: corriente (mA).';
  }

  else {
    $('textoFijo').textContent = 'Voltaje fijo';
    $('textoValorFijo').textContent = `${fijo} V`;

    for (let R = 100; R <= 1000; R += 100) {
      datos.push({
        x: R,
        y: fijo / R * 1000
      });
    }

    $('explicacionRelacion').textContent =
      'V constante: al aumentar la resistencia, ' +
      'la corriente disminuye. Esta relación es inversa ' +
      'y no produce una recta I–R.';

    $('ejemploRelacion').textContent =
      `Con R = 300 Ω: I = ${fmt(fijo / 300 * 1000)} mA`;

    $('descripcionGrafica').textContent =
      'Eje X: resistencia (Ω). Eje Y: corriente (mA).';
  }

  const target = $('graficaTeorica');
  target.replaceChildren();

  const L = 74;
  const T = 25;
  const W = 525;
  const H = 270;

  const lo = datos[0].x;
  const hi = datos.at(-1).x;

  const maxY = Math.max(
    1,
    ...datos.map(d => d.y)
  );

  const X = x =>
    L + (x - lo) / (hi - lo) * W;

  const Y = y =>
    T + H - y / maxY * H;

  for (let i = 0; i <= 4; i++) {
    const y = T + H * i / 4;

    target.appendChild(
      svg('line', {
        x1: L,
        y1: y,
        x2: L + W,
        y2: y,
        stroke: '#45627d'
      })
    );

    target.appendChild(
      svg('text', {
        x: L - 8,
        y: y + 5,
        fill: '#dae9f4',
        'font-size': 13,
        'text-anchor': 'end'
      }, fmt(maxY * (1 - i / 4), 1))
    );
  }

  target.appendChild(
    svg('polyline', {
      points: datos.map(d =>
        `${X(d.x)},${Y(d.y)}`
      ).join(' '),
      fill: 'none',
      stroke: '#4ade80',
      'stroke-width': 4
    })
  );

  datos.forEach(d => {
    target.appendChild(
      svg('circle', {
        cx: X(d.x),
        cy: Y(d.y),
        r: 4,
        fill: '#38bdf8'
      })
    );
  });

  target.appendChild(
    svg('text', {
      x: 340,
      y: 350,
      'text-anchor': 'middle',
      fill: 'white',
      'font-size': 15
    }, modoTeorico === 'voltaje'
       ? 'Voltaje (V)'
       : 'Resistencia (Ω)')
  );

  target.appendChild(
    svg('text', {
      x: 16,
      y: 165,
      transform: 'rotate(-90 16 165)',
      'text-anchor': 'middle',
      fill: 'white',
      'font-size': 15
    }, 'Corriente (mA)')
  );
}

document.querySelectorAll('[data-tipo-grafica]').forEach(btn => {
  btn.addEventListener('click', () => {
    modoTeorico = btn.dataset.tipoGrafica;

    document.querySelectorAll('[data-tipo-grafica]')
      .forEach(b => {
        b.classList.toggle('seleccionado', b === btn);
      });

    const r = $('valorFijo');

    if (modoTeorico === 'voltaje') {
      r.min = 100;
      r.max = 1000;
      r.step = 100;
      r.value = 300;
    } else {
      r.min = 1;
      r.max = 24;
      r.step = 1;
      r.value = 12;
    }

    graficaTeorica();
  });
});

$('valorFijo').addEventListener('input', graficaTeorica);

// ==========================================
// 5. CUESTIONARIO
// ==========================================

$('cuestionario').addEventListener('submit', ev => {
  ev.preventDefault();

  const preguntas = [
    ...document.querySelectorAll('.pregunta')
  ];

  if (preguntas.some(p => !p.querySelector('input:checked'))) {
    $('resultadoCuestionario').textContent =
      'Responde primero las seis preguntas.';
    return;
  }

  let aciertos = 0;

  preguntas.forEach(p => {
    const bien =
      p.querySelector('input:checked').value ===
      p.dataset.correcta;

    if (bien) aciertos++;

    p.classList.remove('correcta', 'incorrecta');
    p.classList.add(bien ? 'correcta' : 'incorrecta');

    p.querySelector('.comentario-pregunta').textContent =
      (bien ? '✓ Correcto. ' : '✗ Revisa: ') +
      p.dataset.explicacion;
  });

  $('resultadoCuestionario').textContent =
    `Resultado: ${aciertos} de 6 ` +
    `(${fmt(aciertos / 6 * 100, 1)} %). ` +
    `Lee las explicaciones.`;

  if (aciertos === 6) {
    estudiadas.add(5);
    progreso();
  }
});

$('reintentar').addEventListener('click', () => {
  $('cuestionario').reset();

  document.querySelectorAll('.pregunta').forEach(p => {
    p.classList.remove('correcta', 'incorrecta');

    p.querySelector('.comentario-pregunta').textContent = '';
  });

  $('resultadoCuestionario').textContent =
    'Contesta nuevamente las seis preguntas.';
});

// ==========================================
// 6. MOTOR DEL LABORATORIO
// ==========================================

const voltaje = $('voltaje');
const resistencia = $('resistencia');

let modo = 'detenido';
let mediciones = [];

function magnitudes() {
  const V = Number(voltaje.value);
  const R = Number(resistencia.value);
  const I = V / R;

  return {
    V,
    R,
    I,
    mA: I * 1000,
    P: V * I
  };
}

function sincronizarLaboratorio() {
  const { V, R, I, mA, P } = magnitudes();

  $('valorVoltaje').textContent = fmt(V, 1) + ' V';
  $('valorResistencia').textContent = R + ' Ω';

  $('pantallaFuente').textContent = V.toFixed(1) + ' V';

  $('etiquetaResistencia').textContent =
    'R = ' + R + ' Ω';

  $('medidorResistencia').textContent = R + ' Ω';

  const bandas = resistenciaColores(R);

  bandas.colores.forEach((c, i) => {
    $('labBanda' + (i + 1)).setAttribute('fill', c);
  });

  $('coloresTexto').textContent =
    bandas.n.map(i => paleta[i][0]).join(' · ') +
    ' · Dorado';

  if (modo === 'activo') {
    $('pantallaAmperimetro').textContent =
      mA.toFixed(2);

    $('pantallaVoltimetro').textContent =
      V.toFixed(2);

    $('medidorVoltaje').textContent = fmt(V) + ' V';
    $('medidorCorriente').textContent = fmt(I, 6) + ' A';
    $('medidorMilliamp').textContent = fmt(mA) + ' mA';

    $('valorPotencia').textContent = fmt(P, 3) + ' W';

    $('circuito').style.setProperty(
      '--velocidad-corriente',
      (2.4 - 1.9 * mA / (mA + 45)).toFixed(2) + 's'
    );

    $('circuito').classList.toggle('activo', I > 0);

    $('estadoCircuito').textContent =
      I > 0
        ? '● CORRIENTE CIRCULANDO'
        : '○ CORRIENTE NULA';

    $('estadoSimulacion').textContent =
      `Corriente teórica: ${fmt(mA)} mA`;

    $('avisoPotencia').classList.toggle(
      'visible',
      P > 0.25
    );

    $('avisoPotencia').textContent =
      P > 0.25
        ? `⚠ Potencia = ${fmt(P, 3)} W. ` +
          `Supera 0,25 W: no reproduzcas este caso ` +
          `con una resistencia física de ¼ W.`
        : '';
  }

  else if (modo === 'detenido') {
    $('circuito').classList.remove('activo');

    $('pantallaAmperimetro').textContent = '0.00';
    $('pantallaVoltimetro').textContent = '0.00';

    $('medidorVoltaje').textContent = '0,00 V';
    $('medidorCorriente').textContent = '0,000000 A';
    $('medidorMilliamp').textContent = '0,00 mA';

    $('valorPotencia').textContent = '0,000 W';

    $('estadoCircuito').textContent =
      '○ SIMULACIÓN DETENIDA';

    $('estadoSimulacion').textContent =
      'Presiona Iniciar para comenzar.';

    $('avisoPotencia').classList.remove('visible');
  }

  else {
    $('circuito').classList.remove('activo');

    $('estadoCircuito').textContent =
      '⏸ SIMULACIÓN PAUSADA';

    $('estadoSimulacion').textContent =
      'Lecturas congeladas. Presiona Iniciar para continuar.';
  }

  voltaje.disabled = modo === 'pausado';
  resistencia.disabled = modo === 'pausado';

  refrescarTablero();
}

// ==========================================
// 7. SONIDO EDUCATIVO
// ==========================================

let sonido = true;
let contextoAudio = null;
let temporizadorAudio = null;

function prepararAudio() {
  const API =
    window.AudioContext || window.webkitAudioContext;

  if (!API) {
    sonido = false;
    $('botonSonido').disabled = true;
    $('botonSonido').textContent = 'Audio no disponible';
    return;
  }

  if (!contextoAudio) {
    contextoAudio = new API();
  }

  if (contextoAudio.state === 'suspended') {
    contextoAudio.resume().catch(() => {});
  }
}

function detenerAudio() {
  if (temporizadorAudio !== null) {
    clearInterval(temporizadorAudio);
    temporizadorAudio = null;
  }
}

function emitirNota() {
  if (
    modo !== 'activo' ||
    !sonido ||
    !contextoAudio ||
    contextoAudio.state !== 'running'
  ) return;

  const { mA } = magnitudes();
  const vol = Number($('volumen').value) / 100;

  if (mA <= 0 || vol === 0) return;

  const t = contextoAudio.currentTime;

  const osc = contextoAudio.createOscillator();
  const gan = contextoAudio.createGain();

  osc.type = 'sine';
  osc.frequency.value = 200 + 820 * mA / (mA + 45);

  gan.gain.setValueAtTime(0, t);

  gan.gain.linearRampToValueAtTime(
    0.025 * vol,
    t + 0.012
  );

  gan.gain.exponentialRampToValueAtTime(
    0.0001,
    t + 0.095
  );

  osc.connect(gan);
  gan.connect(contextoAudio.destination);

  osc.start(t);
  osc.stop(t + 0.11);
}

function programarAudio(inmediato = false) {
  detenerAudio();

  const { mA } = magnitudes();

  if (
    modo !== 'activo' ||
    !sonido ||
    document.hidden ||
    mA === 0 ||
    Number($('volumen').value) === 0
  ) return;

  if (inmediato) emitirNota();

  temporizadorAudio = setInterval(
    emitirNota,
    Math.round(740 - 500 * mA / (mA + 45))
  );
}

$('botonSonido').addEventListener('click', () => {
  sonido = !sonido;

  $('botonSonido').textContent =
    sonido ? '🔊 Sonido activado' : '🔇 Silenciado';

  $('botonSonido').setAttribute(
    'aria-pressed',
    String(sonido)
  );

  if (sonido) prepararAudio();

  programarAudio(true);
});

$('volumen').addEventListener('input', () => {
  programarAudio();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    detenerAudio();
  } else {
    programarAudio();
  }
});

// ==========================================
// 8. GRÁFICA I-V PROGRESIVA
// ==========================================

// X: voltaje de 0 a 24 V.
// Y: corriente en miliamperios.
// Pendiente: 1000/R mA/V.

// Solo se conectan en una misma recta
// puntos obtenidos con la misma resistencia.

let resistenciaTrazo = Number(resistencia.value);

let recorrido = new Map([[0, 0]]);

function borrarRecorrido() {
  resistenciaTrazo = Number(resistencia.value);
  recorrido = new Map([[0, 0]]);

  if (modo === 'activo') {
    const { V, mA } = magnitudes();
    recorrido.set(V, mA);
  }

  pintarGraficas();
}

function capturarPunto() {
  if (modo !== 'activo') return;

  const { V, R, mA } = magnitudes();

  if (R !== resistenciaTrazo) {
    resistenciaTrazo = R;
    recorrido = new Map([[0, 0]]);
  }

  recorrido.set(V, mA);
  pintarGraficas();
}

function pintarUnaGrafica(target) {
  target.replaceChildren();

  const L = 80;
  const T = 23;
  const W = 610;
  const H = 270;

  const Vmax = 24;

  const Imax =
    24 / resistenciaTrazo * 1000;

  const X = V =>
    L + V / Vmax * W;

  const Y = I =>
    T + H - I / Imax * H;

  // CUADRÍCULA VERTICAL

  for (let k = 0; k <= 6; k++) {
    const V = 4 * k;

    target.appendChild(
      svg('line', {
        x1: X(V),
        y1: T,
        x2: X(V),
        y2: T + H,
        stroke: '#294964'
      })
    );

    target.appendChild(
      svg('text', {
        x: X(V),
        y: T + H + 22,
        'text-anchor': 'middle',
        'font-size': 13,
        fill: '#dbeaf6'
      }, V)
    );
  }

  // CUADRÍCULA HORIZONTAL

  for (let k = 0; k <= 4; k++) {
    const I = Imax * k / 4;

    target.appendChild(
      svg('line', {
        x1: L,
        y1: Y(I),
        x2: L + W,
        y2: Y(I),
        stroke: '#294964'
      })
    );

    target.appendChild(
      svg('text', {
        x: L - 10,
        y: Y(I) + 5,
        'text-anchor': 'end',
        'font-size': 12,
        fill: '#dbeaf6'
      }, fmt(I, Imax >= 100 ? 0 : 2))
    );
  }

  // EJES

  target.appendChild(
    svg('line', {
      x1: L,
      y1: T,
      x2: L,
      y2: T + H,
      stroke: '#e8f5fc',
      'stroke-width': 2
    })
  );

  target.appendChild(
    svg('line', {
      x1: L,
      y1: T + H,
      x2: L + W,
      y2: T + H,
      stroke: '#e8f5fc',
      'stroke-width': 2
    })
  );

  target.appendChild(
    svg('text', {
      x: L + W / 2,
      y: 355,
      fill: 'white',
      'text-anchor': 'middle',
      'font-size': 16
    }, 'Voltaje (V)')
  );

  target.appendChild(
    svg('text', {
      x: 19,
      y: T + H / 2,
      transform: `rotate(-90 19 ${T + H / 2})`,
      fill: 'white',
      'text-anchor': 'middle',
      'font-size': 16
    }, 'Corriente (mA)')
  );

  // RECTA TEÓRICA AZUL

  target.appendChild(
    svg('line', {
      x1: X(0),
      y1: Y(0),
      x2: X(24),
      y2: Y(Imax),
      stroke: '#38bdf8',
      'stroke-width': 2,
      'stroke-dasharray': '8 7'
    })
  );

  // RECORRIDO PROGRESIVO VERDE

  const visitados = [...recorrido].sort(
    (a, b) => a[0] - b[0]
  );

  target.appendChild(
    svg('polyline', {
      points: visitados.map(([v, i]) =>
        `${X(v)},${Y(i)}`
      ).join(' '),
      fill: 'none',
      stroke: '#4ade80',
      'stroke-width': 4,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    })
  );

  visitados.forEach(([v, i]) => {
    target.appendChild(
      svg('circle', {
        cx: X(v),
        cy: Y(i),
        r: 3.5,
        fill: '#4ade80'
      })
    );
  });

  // MEDICIONES REGISTRADAS AMARILLAS

  mediciones
    .filter(d => d.R === resistenciaTrazo)
    .forEach(d => {
      target.appendChild(
        svg('circle', {
          cx: X(d.V),
          cy: Y(d.mA),
          r: 7,
          fill: '#facc15',
          stroke: '#0b233c',
          'stroke-width': 2
        })
      );
    });

  // PUNTO ACTUAL BLANCO

  if (modo === 'activo') {
    const { V, mA } = magnitudes();

    target.appendChild(
      svg('circle', {
        cx: X(V),
        cy: Y(mA),
        r: 7,
        fill: 'white',
        stroke: '#4ade80',
        'stroke-width': 3
      })
    );
  }
}

function pintarGraficas() {
  ['graficaLaboratorio', 'graficaDatos'].forEach(id => {
    pintarUnaGrafica($(id));
  });

  document.querySelectorAll('.textoPendiente')
    .forEach(el => {
      el.textContent =
        `R = ${resistenciaTrazo} Ω · ` +
        `Pendiente = ${fmt(1000 / resistenciaTrazo, 3)} mA/V`;
    });
}

document.querySelectorAll('.borrar-recorrido')
  .forEach(b => {
    b.addEventListener('click', borrarRecorrido);
  });

// ACTUALIZAR AL MOVER EL VOLTAJE

function cambioVoltaje() {
  sincronizarLaboratorio();
  programarAudio();
  capturarPunto();
}

// NUEVA PENDIENTE AL CAMBIAR RESISTENCIA

function cambioResistencia() {
  sincronizarLaboratorio();
  programarAudio();
  borrarRecorrido();
}

voltaje.addEventListener('input', cambioVoltaje);

resistencia.addEventListener(
  'input',
  cambioResistencia
);

// INICIAR

$('iniciar').addEventListener('click', () => {
  modo = 'activo';

  if (sonido) prepararAudio();

  sincronizarLaboratorio();
  programarAudio(true);
  capturarPunto();
});

// PAUSAR

$('pausar').addEventListener('click', () => {
  if (modo !== 'activo') return;

  modo = 'pausado';

  detenerAudio();
  sincronizarLaboratorio();
  pintarGraficas();
});

// REINICIAR

$('reiniciar').addEventListener('click', () => {
  detenerAudio();

  modo = 'detenido';
  voltaje.value = 6;
  resistencia.value = 300;

  sincronizarLaboratorio();
  borrarRecorrido();
});

// ==========================================
// 9. CONSTRUCTOR DE CIRCUITOS
// ==========================================

const tablero = $('tablero');

const posiciones = {
  sPlus: [260, 245],
  sMinus: [260, 320],
  aPlus: [330, 215],
  aMinus: [525, 215],
  rPlus: [620, 215],
  rMinus: [815, 215],
  vPlus: [620, 385],
  vMinus: [815, 385]
};

let cables = [];
let origen = null;
let constructorValido = false;

function crearTablero() {
  tablero.innerHTML = `
    <defs>
      <pattern id="rejillaC" width="25" height="25"
               patternUnits="userSpaceOnUse">
        <path d="M25 0H0V25"
              fill="none" stroke="white"
              stroke-opacity=".1"/>
      </pattern>
    </defs>

    <rect x="5" y="5" width="990" height="450"
          rx="17" fill="#6c869c"/>
    <rect x="5" y="5" width="990" height="450"
          rx="17" fill="url(#rejillaC)"/>

    <g id="cablesDibujados"></g>

    <!-- FUENTE -->
    <g>
      <rect class="constructor-carcasa"
            x="65" y="175"
            width="195" height="185" rx="15"/>
      <text class="constructor-titulo"
            x="162" y="211">FUENTE DC</text>
      <rect class="pantalla-oscura"
            x="85" y="230"
            width="151" height="66" rx="8"/>
      <text id="fuenteConstruida"
            class="constructor-lectura"
            x="162" y="272">6.0 V</text>
      <text class="constructor-detalle"
            x="162" y="324">Voltaje variable</text>
      <circle class="led-constructor"
              cx="237" cy="189" r="6"/>
    </g>

    <!-- AMPERÍMETRO -->
    <g>
      <rect class="constructor-carcasa"
            x="330" y="85"
            width="195" height="165" rx="15"/>
      <text class="constructor-titulo"
            x="427" y="120">AMPERÍMETRO</text>
      <rect class="pantalla-oscura"
            x="353" y="138"
            width="149" height="68" rx="8"/>
      <text id="amperimetroConstruido"
            class="constructor-lectura"
            x="427" y="180">--.--</text>
      <text class="constructor-detalle"
            x="427" y="225">mA · Serie</text>
      <circle class="led-constructor"
              cx="503" cy="100" r="6"/>
    </g>

    <!-- RESISTENCIA -->
    <g>
      <rect class="constructor-carcasa"
            x="620" y="85"
            width="195" height="165" rx="15"/>
      <text class="constructor-titulo"
            x="717" y="120">RESISTENCIA</text>
      <line x1="655" y1="174"
            x2="783" y2="174"
            stroke="#d5dce4" stroke-width="5"/>
      <rect x="680" y="157"
            width="76" height="34" rx="12"
            fill="#e6bd8b"/>
      <rect id="constructorBanda1"
            x="690" y="159"
            width="7" height="30"/>
      <rect id="constructorBanda2"
            x="706" y="159"
            width="7" height="30"/>
      <rect id="constructorBanda3"
            x="723" y="159"
            width="7" height="30"/>
      <rect id="constructorBanda4"
            x="742" y="159"
            width="6" height="30"/>
      <text id="resistenciaConstruida"
            class="constructor-detalle"
            x="717" y="229">300 Ω</text>
    </g>

    <!-- VOLTÍMETRO -->
    <g>
      <rect class="constructor-carcasa"
            x="620" y="300"
            width="195" height="130" rx="15"/>
      <text class="constructor-titulo"
            x="717" y="332">VOLTÍMETRO</text>
      <rect class="pantalla-clara"
            x="644" y="346"
            width="147" height="62" rx="8"/>
      <text id="voltimetroConstruido"
            x="717" y="388"
            class="constructor-lectura"
            style="fill:#153e4b">--.--</text>
      <circle class="led-constructor"
              cx="793" cy="316" r="6"/>
    </g>

    <g id="bornesInteractivos"></g>
  `;

  for (const [id, [x, y]] of Object.entries(posiciones)) {
    const tipo = id.endsWith('Plus')
      ? 'positivo'
      : id.endsWith('Minus')
        ? 'negativo'
        : 'neutro';

    const txt = id.startsWith('r')
      ? (id === 'rPlus' ? '1' : '2')
      : (id.endsWith('Plus') ? '+' : '−');

    const g = svg('g', {
      class: 'terminal',
      'data-borne': id,
      role: 'button',
      tabindex: 0,
      'aria-label': id
    });

    g.appendChild(
      svg('circle', {
        cx: x,
        cy: y,
        r: 15,
        class: tipo
      })
    );

    g.appendChild(
      svg('text', {
        x,
        y: y + 6
      }, txt)
    );

    $('bornesInteractivos').appendChild(g);
  }

  refrescarTablero();
}

const llave = (a, b) =>
  [a, b].sort().join('|');

function marcarBornes(errores = []) {
  tablero.querySelectorAll('[data-borne]').forEach(g => {
    g.classList.toggle(
      'seleccionado',
      g.dataset.borne === origen
    );

    g.classList.toggle(
      'error',
      errores.includes(g.dataset.borne)
    );
  });
}

function dibujarCables() {
  const capa = $('cablesDibujados');

  capa.replaceChildren();

  cables.forEach(({ a, b }, i) => {
    const [x1, y1] = posiciones[a];
    const [x2, y2] = posiciones[b];

    let d;

    if (llave(a, b) === llave('rMinus', 'sMinus')) {
      d =
        `M${x1} ${y1} ` +
        `L${x1} 444 ` +
        `L${x2} 444 ` +
        `L${x2} ${y2}`;
    }

    else {
      const medio = (x1 + x2) / 2;

      d =
        `M${x1} ${y1} ` +
        `C${medio} ${y1},` +
        `${medio} ${y2},` +
        `${x2} ${y2}`;
    }

    capa.appendChild(
      svg('path', {
        d,
        class: 'cable',
        stroke:
          (a.endsWith('Plus') || b.endsWith('Plus'))
            ? '#df3446'
            : '#182e43',
        'data-cable': i,
        role: 'button',
        tabindex: 0,
        'aria-label': 'Quitar cable'
      })
    );
  });
}

function invalidarConstructor(mensaje) {
  constructorValido = false;

  tablero.classList.remove('encendido');

  $('amperimetroConstruido').textContent = '--.--';
  $('voltimetroConstruido').textContent = '--.--';

  $('retroalimentacion').className =
    'retroalimentacion';

  $('retroalimentacion').textContent =
    'El montaje cambió. Pulsa Comprobar para validarlo.';

  $('estadoCable').textContent = mensaje;

  marcarBornes();
}

function seleccionarBorne(id) {
  if (origen === null) {
    origen = id;

    $('estadoCable').textContent =
      'Primer terminal seleccionado. Elige el segundo.';

    marcarBornes();
    return;
  }

  if (origen === id) {
    origen = null;
    marcarBornes();

    $('estadoCable').textContent =
      'Selección cancelada.';

    return;
  }

  if (
    cables.some(c =>
      llave(c.a, c.b) === llave(origen, id)
    )
  ) {
    origen = null;
    marcarBornes();

    $('estadoCable').textContent =
      'Ese cable ya existe.';

    return;
  }

  if (cables.length >= 16) {
    origen = null;
    marcarBornes();

    $('estadoCable').textContent =
      'Máximo de 16 cables.';

    return;
  }

  cables.push({
    a: origen,
    b: id
  });

  origen = null;

  dibujarCables();
  invalidarConstructor(
    'Cable añadido. Puedes conectar otro.'
  );
}

function accionTablero(obj) {
  const borne = obj.closest('[data-borne]');

  if (borne) {
    seleccionarBorne(borne.dataset.borne);
    return;
  }

  const c = obj.closest('[data-cable]');

  if (c) {
    cables.splice(
      Number(c.dataset.cable),
      1
    );

    origen = null;

    dibujarCables();
    invalidarConstructor('Cable retirado.');
  }
}

tablero.addEventListener('click', ev => {
  accionTablero(ev.target);
});

tablero.addEventListener('keydown', ev => {
  if (ev.key === 'Enter' || ev.key === ' ') {
    const obj = ev.target.closest(
      '[data-borne], [data-cable]'
    );

    if (obj) {
      ev.preventDefault();
      accionTablero(obj);
    }
  }
});

// VALIDACIÓN ELÉCTRICA DE CONEXIONES

function unionFind(nodos) {
  const p = Object.fromEntries(
    nodos.map(x => [x, x])
  );

  const raiz = x => {
    while (p[x] !== x) {
      p[x] = p[p[x]];
      x = p[x];
    }
    return x;
  };

  return {
    raiz,
    unir: (a, b) => {
      p[raiz(a)] = raiz(b);
    },
    igual: (a, b) => raiz(a) === raiz(b)
  };
}

function analizarConexiones() {
  const nombres = Object.keys(posiciones);

  const red = unionFind(nombres);

  cables.forEach(c => {
    red.unir(c.a, c.b);
  });

  const ideal = unionFind(nombres);

  cables.forEach(c => {
    ideal.unir(c.a, c.b);
  });

  // El amperímetro ideal se considera de resistencia nula.
  ideal.unir('aPlus', 'aMinus');

  if (
    ideal.igual('sPlus', 'sMinus') ||
    red.igual('rPlus', 'rMinus')
  ) {
    return {
      tipo: 'alerta',
      mensaje:
        '⚠️ CORTOCIRCUITO: existe un camino de resistencia ' +
        'casi nula entre los polos o un cable puentea la ' +
        'resistencia. Revisa la conexión del amperímetro ' +
        'y los puentes.',
      errores: [
        'sPlus', 'sMinus',
        'aPlus', 'aMinus',
        'rPlus', 'rMinus'
      ]
    };
  }

  // Tres grupos de nodos independientes por montaje.

  const patron = grupos =>
    grupos.every(g =>
      g.every(t => red.igual(g[0], t))
    ) &&
    grupos.every((g, i) =>
      grupos.slice(i + 1).every(h =>
        !red.igual(g[0], h[0])
      )
    );

  const antes = patron([
    ['sPlus', 'aPlus'],
    ['aMinus', 'rPlus', 'vPlus'],
    ['rMinus', 'sMinus', 'vMinus']
  ]);

  const despues = patron([
    ['sPlus', 'rPlus', 'vPlus'],
    ['rMinus', 'aPlus', 'vMinus'],
    ['aMinus', 'sMinus']
  ]);

  if (antes || despues) {
    return {
      tipo: 'bien',
      mensaje:
        '✅ MONTAJE CORRECTO: amperímetro en serie ' +
        'y voltímetro en paralelo, con polaridades ' +
        'correctas. Se muestran lecturas calculadas ' +
        'con la Ley de Ohm.',
      errores: []
    };
  }

  const ampAntes =
    red.igual('sPlus', 'aPlus') &&
    red.igual('aMinus', 'rPlus') &&
    red.igual('rMinus', 'sMinus');

  const ampDespues =
    red.igual('sPlus', 'rPlus') &&
    red.igual('rMinus', 'aPlus') &&
    red.igual('aMinus', 'sMinus');

  if (
    (ampAntes || ampDespues) &&
    red.igual('vMinus', 'rPlus') &&
    red.igual('vPlus', 'rMinus')
  ) {
    return {
      tipo: 'mal',
      mensaje:
        '⚠️ VOLTÍMETRO INVERTIDO: intercambia V+ y V−. ' +
        'Debes medir el voltaje positivo de R1 ' +
        'respecto de R2.',
      errores: ['vPlus', 'vMinus']
    };
  }

  if (ampAntes || ampDespues) {
    return {
      tipo: 'mal',
      mensaje:
        '⚠️ El circuito principal funciona, pero el ' +
        'voltímetro no está correctamente conectado ' +
        'en paralelo. Une V+ con R1 y V− con R2.',
      errores: [
        'vPlus', 'vMinus',
        'rPlus', 'rMinus'
      ]
    };
  }

  return {
    tipo: 'mal',
    mensaje:
      '⚠️ CONEXIONES INCORRECTAS O INCOMPLETAS. ' +
      'Prueba fuente+ → A+, A− → R1, R2 → fuente−, ' +
      'V+ → R1 y V− → R2. Evita caminos que ' +
      'salten la resistencia.',
    errores: [
      'aPlus', 'aMinus',
      'rPlus', 'rMinus'
    ]
  };
}

function refrescarTablero() {
  if (!$('fuenteConstruida')) return;

  const { V, R, mA } = magnitudes();

  $('fuenteConstruida').textContent =
    V.toFixed(1) + ' V';

  $('resistenciaConstruida').textContent =
    R + ' Ω';

  const bandas = resistenciaColores(R);

  bandas.colores.forEach((c, i) => {
    $('constructorBanda' + (i + 1))
      .setAttribute('fill', c);
  });

  if (constructorValido) {
    $('amperimetroConstruido').textContent =
      mA.toFixed(2);

    $('voltimetroConstruido').textContent =
      V.toFixed(2);
  }
}

function comprobarConexiones() {
  const r = analizarConexiones();

  constructorValido = r.tipo === 'bien';

  tablero.classList.toggle(
    'encendido',
    constructorValido
  );

  $('retroalimentacion').className =
    'retroalimentacion ' + r.tipo;

  $('retroalimentacion').textContent =
    r.mensaje;

  marcarBornes(r.errores);

  if (constructorValido) {
    refrescarTablero();
  }

  else {
    $('amperimetroConstruido').textContent =
      '--.--';

    $('voltimetroConstruido').textContent =
      '--.--';
  }

  $('estadoCable').textContent =
    constructorValido
      ? 'Conexión verificada: instrumentos habilitados.'
      : 'Revisa los terminales resaltados.';
}

function cargarEjemplo(nuevos) {
  cables = nuevos;
  origen = null;

  dibujarCables();
  invalidarConstructor('Ejemplo cargado.');
  comprobarConexiones();
}

$('comprobarCircuito').addEventListener(
  'click',
  comprobarConexiones
);

// EJEMPLO CORRECTO

$('ejemploCorrecto').addEventListener('click', () => {
  cargarEjemplo([
    { a: 'sPlus', b: 'aPlus' },
    { a: 'aMinus', b: 'rPlus' },
    { a: 'rMinus', b: 'sMinus' },
    { a: 'vPlus', b: 'rPlus' },
    { a: 'vMinus', b: 'rMinus' }
  ]);
});

// ERROR DE POLARIDAD

$('ejemploPolaridad').addEventListener('click', () => {
  cargarEjemplo([
    { a: 'sPlus', b: 'aPlus' },
    { a: 'aMinus', b: 'rPlus' },
    { a: 'rMinus', b: 'sMinus' },
    { a: 'vMinus', b: 'rPlus' },
    { a: 'vPlus', b: 'rMinus' }
  ]);
});

// CORTOCIRCUITO

$('ejemploCortocircuito').addEventListener('click', () => {
  cargarEjemplo([
    { a: 'sPlus', b: 'aPlus' },
    { a: 'aMinus', b: 'sMinus' }
  ]);
});

// LIMPIAR CABLES

$('quitarCables').addEventListener('click', () => {
  cables = [];
  origen = null;

  dibujarCables();

  invalidarConstructor(
    'Se retiraron todos los cables.'
  );
});

// ==========================================
// 10. TABLA Y EXPORTACIÓN
// ==========================================

function pintarTabla() {
  if (!mediciones.length) {
    $('tablaDatos').innerHTML =
      '<tr><td colspan="6">No hay mediciones.</td></tr>';
    return;
  }

  $('tablaDatos').innerHTML =
    mediciones.map((d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${fmt(d.V)}</td>
        <td>${d.R}</td>
        <td>${fmt(d.I, 6)}</td>
        <td>${fmt(d.mA)}</td>
        <td>${fmt(d.P, 3)}</td>
      </tr>
    `).join('');
}

$('registrar').addEventListener('click', () => {
  if (modo !== 'activo') {
    alert('Primero presiona Iniciar.');
    return;
  }

  mediciones.push(magnitudes());

  pintarTabla();
  capturarPunto();
});

$('limpiarDatos').addEventListener('click', () => {
  mediciones = [];

  pintarTabla();
  pintarGraficas();
});

$('exportar').addEventListener('click', () => {
  if (!mediciones.length) {
    alert('Primero registra alguna medición.');
    return;
  }

  const filas = [
    [
      'Numero',
      'Voltaje (V)',
      'Resistencia (ohm)',
      'Corriente (A)',
      'Corriente (mA)',
      'Potencia (W)'
    ],
    ...mediciones.map((d, i) => [
      i + 1,
      fmt(d.V),
      d.R,
      fmt(d.I, 8),
      fmt(d.mA, 4),
      fmt(d.P, 4)
    ])
  ];

  const blob = new Blob(
    [
      '\uFEFF' +
      filas.map(f => f.join(';')).join('\n')
    ],
    { type: 'text/csv;charset=utf-8' }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;
  a.download = 'MYF_ElectroLab_Mediciones.csv';

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
});

// ==========================================
// 11. INICIALIZACIÓN
// ==========================================

mostrarLeccion(0);
progreso();

seleccionarMagnitud('I');
descodificarColores();
graficaTeorica();

crearTablero();
dibujarCables();

sincronizarLaboratorio();
pintarTabla();
pintarGraficas();

console.log(
  'MYF ElectroLab 5.2 cargado correctamente.'
);
