// Lógica pura del Diario de Estudio: solo cálculos, sin DOM ni localStorage.
// Se carga como script normal en index.html (las funciones quedan globales)
// y también desde Node para los tests (ver el final del archivo).

// ---------- Fechas (siempre en hora local, nunca UTC) ----------

// Convierte un objeto Date en texto "AAAA-MM-DD" usando la fecha local
function fechaATexto(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

// Convierte un texto "AAAA-MM-DD" en un objeto Date local
function textoAFecha(texto) {
  const partes = texto.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

// Devuelve el día anterior a una fecha
function diaAnterior(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() - 1);
}

// Muestra una fecha de forma bonita, por ejemplo "lunes, 30 de septiembre de 2026"
function fechaBonita(texto) {
  return textoAFecha(texto).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ---------- Racha ----------

// Días consecutivos con al menos una sesión que terminan hoy (o ayer, si hoy aún no hay).
// `hoy` es un texto "AAAA-MM-DD".
function calcularRacha(sesiones, hoy) {
  // Días distintos en los que hay al menos una sesión
  const diasConSesion = new Set();
  for (const sesion of sesiones) {
    diasConSesion.add(sesion.date);
  }

  let dia = textoAFecha(hoy);

  // Si hoy aún no hay sesión, la racha sigue viva si ayer sí la hubo
  if (!diasConSesion.has(fechaATexto(dia))) {
    dia = diaAnterior(dia);
  }

  // Contamos hacia atrás mientras haya días seguidos con sesión
  let racha = 0;
  while (diasConSesion.has(fechaATexto(dia))) {
    racha = racha + 1;
    dia = diaAnterior(dia);
  }
  return racha;
}

// ---------- Días estudiados este mes ----------

// Días distintos del mes de `hoy` con alguna sesión, sin contar fechas futuras
function calcularDiasDelMes(sesiones, hoy) {
  const mesActual = hoy.slice(0, 7); // "AAAA-MM"

  // Como las fechas son texto "AAAA-MM-DD", se pueden comparar directamente.
  const diasDelMes = new Set();
  for (const sesion of sesiones) {
    if (sesion.date.startsWith(mesActual) && sesion.date <= hoy) {
      diasDelMes.add(sesion.date);
    }
  }
  return diasDelMes.size;
}

// ---------- Mapa de calor: las últimas 12 semanas ----------
// Todas las fechas son textos "AAAA-MM-DD" y se comparan directamente con < y ===.

// Suma (o resta, si n es negativo) días a una fecha.
// El constructor de Date ajusta solo fin de mes, de año y bisiestos. No sumamos
// milisegundos: con el cambio de hora hay días de 23 o 25 horas.
function sumarDias(fecha, n) {
  const dia = textoAFecha(fecha);
  return fechaATexto(new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + n));
}

// 0 = lunes … 6 = domingo (getDay() empieza la semana en domingo)
function diaDeLaSemana(fecha) {
  return (textoAFecha(fecha).getDay() + 6) % 7;
}

// Primer lunes y último domingo del mapa: 12 semanas que acaban en la semana de hoy
function calcularPeriodo(hoy) {
  const lunesDeHoy = sumarDias(hoy, -diaDeLaSemana(hoy));
  return {
    inicio: sumarDias(lunesDeHoy, -77), // 11 semanas antes
    fin: sumarDias(lunesDeHoy, 6), // domingo de esta semana
  };
}

// ¿Es un texto "AAAA-MM-DD" (con ceros) de un día que existe?
function esFechaValida(texto) {
  if (typeof texto !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return false;
  }
  // "2026-02-30" se convierte en el 2 de marzo: si al volver a texto cambia, no existe
  return fechaATexto(textoAFecha(texto)) === texto;
}

// Sesión con fecha válida y minutos enteros mayores que 0 (el texto "30" no vale)
function esSesionValida(sesion) {
  return typeof sesion === "object" && sesion !== null &&
    esFechaValida(sesion.date) &&
    Number.isInteger(sesion.minutes) && sesion.minutes > 0;
}

// Minutos totales de cada día del periodo: { "AAAA-MM-DD": minutos }.
// Las sesiones no válidas o fuera del periodo se ignoran.
function minutosPorDia(sesiones, inicio, fin) {
  const minutos = {};
  for (const sesion of sesiones) {
    if (esSesionValida(sesion) && sesion.date >= inicio && sesion.date <= fin) {
      minutos[sesion.date] = (minutos[sesion.date] || 0) + sesion.minutes;
    }
  }
  return minutos;
}

// Intensidad de 0 a 4 según los minutos del día (tramos fijos de la spec)
function nivelDeMinutos(minutos) {
  if (minutos === 0) return 0;
  if (minutos < 30) return 1;
  if (minutos < 60) return 2;
  if (minutos < 120) return 3;
  return 4;
}

// "pasado", "hoy" o "futuro"
function tipoDeDia(fecha, hoy) {
  if (fecha < hoy) return "pasado";
  if (fecha === hoy) return "hoy";
  return "futuro";
}

// Texto que describe un día, por ejemplo "Hoy, jueves, 1 de octubre de 2026: 45 min"
function textoDetalle(fecha, hoy, minutos) {
  const tipo = tipoDeDia(fecha, hoy);
  const bonita = fechaBonita(fecha);

  if (tipo === "futuro") {
    return bonita + ": todavía no ha llegado";
  }
  const prefijo = tipo === "hoy" ? "Hoy, " : "";
  if (minutos > 0) {
    return prefijo + bonita + ": " + minutos + " min";
  }
  if (tipo === "hoy") {
    return prefijo + bonita + ": aún sin estudio";
  }
  return bonita + ": sin estudio";
}

// Todo lo que hace falta para pintar el mapa: 12 semanas (de la más antigua a la de hoy)
// de 7 días (de lunes a domingo). Cada día es { fecha, tipo, minutos, nivel, detalle };
// los días futuros tienen nivel null.
function construirMapa(sesiones, hoy) {
  const periodo = calcularPeriodo(hoy);
  const minutos = minutosPorDia(sesiones, periodo.inicio, periodo.fin);

  const semanas = [];
  let fecha = periodo.inicio;
  for (let s = 0; s < 12; s++) {
    const semana = [];
    for (let d = 0; d < 7; d++) {
      const minutosDelDia = minutos[fecha] || 0;
      const tipo = tipoDeDia(fecha, hoy);
      semana.push({
        fecha: fecha,
        tipo: tipo,
        minutos: minutosDelDia,
        nivel: tipo === "futuro" ? null : nivelDeMinutos(minutosDelDia),
        detalle: textoDetalle(fecha, hoy, minutosDelDia),
      });
      fecha = sumarDias(fecha, 1);
    }
    semanas.push(semana);
  }
  return semanas;
}

// Fecha a la que se mueve la selección al pulsar una flecha, sin salir del periodo.
// Las columnas son semanas (izquierda/derecha = ±7 días) y las filas días (arriba/abajo).
function moverSeleccion(fecha, tecla, inicio, fin) {
  let salto = 0;
  switch (tecla) {
    case "ArrowLeft":
      salto = -7;
      break;
    case "ArrowRight":
      salto = 7;
      break;
    case "ArrowUp":
      // El lunes es la fila de arriba: no se sube a la semana anterior
      salto = diaDeLaSemana(fecha) === 0 ? 0 : -1;
      break;
    case "ArrowDown":
      // El domingo es la fila de abajo: no se baja a la semana siguiente
      salto = diaDeLaSemana(fecha) === 6 ? 0 : 1;
      break;
  }

  const nueva = sumarDias(fecha, salto);
  if (nueva < inicio || nueva > fin) {
    return fecha;
  }
  return nueva;
}

// Convierte lo guardado en localStorage en una lista. Si está vacío, corrupto o no es
// una lista, devuelve []. Las sesiones no válidas se filtran después (minutosPorDia).
function interpretarDatosGuardados(texto) {
  if (!texto) {
    return [];
  }
  let datos;
  try {
    datos = JSON.parse(texto);
  } catch (error) {
    return [];
  }
  return Array.isArray(datos) ? datos : [];
}

// ---------- Editar y borrar sesiones (spec 002) ----------

// Lee lo guardado para poder escribir encima sin perder nada. A diferencia de
// interpretarDatosGuardados, distingue "no hay datos" (lista vacía, se puede escribir)
// de "datos corruptos" (ok: false, no se debe escribir encima).
function leerListaGuardada(texto) {
  if (!texto) {
    return { ok: true, sesiones: [] };
  }
  let datos;
  try {
    datos = JSON.parse(texto);
  } catch (error) {
    return { ok: false };
  }
  return Array.isArray(datos) ? { ok: true, sesiones: datos } : { ok: false };
}

// Comprueba los tres campos de una sesión en edición (textos tal y como los escribió
// el usuario). Los errores salen siempre en orden: fecha, tema, minutos.
function validarEdicion(fecha, tema, minutosTexto) {
  const errores = [];
  const temaLimpio = tema.trim();
  const minutosLimpio = minutosTexto.trim();

  if (!esFechaValida(fecha)) {
    errores.push("Elige una fecha válida.");
  }
  if (temaLimpio === "") {
    errores.push("Escribe un tema.");
  }
  // Solo dígitos: así "4.5", "1e2" o "" no cuelan como números enteros
  if (!/^\d+$/.test(minutosLimpio) || Number(minutosLimpio) <= 0) {
    errores.push("Los minutos deben ser un número entero mayor que 0.");
  }

  if (errores.length > 0) {
    return { valida: false, errores: errores };
  }
  return {
    valida: true,
    cambios: { date: fecha, topic: temaLimpio, minutes: Number(minutosLimpio) },
  };
}

// Dos sesiones son la misma si su contenido es idéntico (todos los campos, en el mismo
// orden). Las sesiones no tienen id: así no hay que tocar el formato guardado.
function mismaSesion(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Posición actual de una sesión en la lista recién leída, o -1 si ya no existe.
// `indice` es dónde estaba al pintarla y `original`, una copia de cómo era entonces.
function localizarSesion(sesiones, indice, original) {
  // Caso normal: nadie ha tocado los datos desde que se pintó la lista
  if (indice < sesiones.length && mismaSesion(sesiones[indice], original)) {
    return indice;
  }
  // Otra pestaña ha cambiado la lista: buscamos la primera sesión idéntica
  for (let j = 0; j < sesiones.length; j++) {
    if (mismaSesion(sesiones[j], original)) {
      return j;
    }
  }
  return -1;
}

// Lista nueva con la sesión de `indice` cambiada. Se conservan sus campos extra y su
// posición (así no cambia su lugar en el orden en que se añadieron).
function editarSesion(sesiones, indice, cambios) {
  const nuevas = sesiones.slice();
  nuevas[indice] = Object.assign({}, sesiones[indice], cambios);
  return nuevas;
}

// Lista nueva sin la sesión de `indice`
function borrarSesion(sesiones, indice) {
  return sesiones.slice(0, indice).concat(sesiones.slice(indice + 1));
}

// Lista nueva sin las sesiones válidas. Las no válidas (formato antiguo, minutos con
// decimales…) se conservan: el usuario no las ve, así que no ha elegido borrarlas.
function borrarSesionesValidas(sesiones) {
  return sesiones.filter(function (sesion) {
    return !esSesionValida(sesion);
  });
}

function contarSesionesValidas(sesiones) {
  return sesiones.filter(esSesionValida).length;
}

// Aplica una operación sobre lo guardado AHORA (`texto`), no sobre lo que se pintó:
// así se conserva lo que haya escrito otra pestaña. Operaciones:
//   { tipo: "editar", indice, original, cambios }
//   { tipo: "borrar", indice, original }
//   { tipo: "borrarTodas" }
// Devuelve { estado: "ok", sesiones } (lo que hay que guardar), { estado: "ilegible" }
// o { estado: "noExiste" }. En los dos últimos casos no se debe guardar nada.
function prepararGuardado(texto, operacion) {
  const lectura = leerListaGuardada(texto);
  if (!lectura.ok) {
    return { estado: "ilegible" };
  }
  const sesiones = lectura.sesiones;

  if (operacion.tipo === "borrarTodas") {
    return { estado: "ok", sesiones: borrarSesionesValidas(sesiones) };
  }

  const indice = localizarSesion(sesiones, operacion.indice, operacion.original);
  if (indice === -1) {
    return { estado: "noExiste" };
  }
  if (operacion.tipo === "editar") {
    return { estado: "ok", sesiones: editarSesion(sesiones, indice, operacion.cambios) };
  }
  return { estado: "ok", sesiones: borrarSesion(sesiones, indice) };
}

// Filas de la lista, de la fecha más reciente a la más antigua y, en el mismo día,
// primero la última añadida. Cada fila recuerda su posición en lo guardado (`indice`).
// Es el mismo orden que tenía la lista antes de la spec 002.
function ordenarParaLista(sesiones) {
  const filas = sesiones.map(function (sesion, indice) {
    return { sesion: sesion, indice: indice, valida: esSesionValida(sesion) };
  });
  return filas.sort(function (a, b) {
    const fechaA = a.sesion !== null && typeof a.sesion === "object" ? a.sesion.date : undefined;
    const fechaB = b.sesion !== null && typeof b.sesion === "object" ? b.sesion.date : undefined;
    if (fechaA === fechaB) {
      return b.indice - a.indice;
    }
    return fechaA < fechaB ? 1 : -1;
  });
}

function textoConfirmarBorrado(sesion) {
  return "¿Borrar la sesión «" + sesion.topic + "» del " + fechaBonita(sesion.date) +
    " (" + sesion.minutes + " min)?";
}

function textoConfirmarBorrarTodas(n) {
  if (n === 1) {
    return "¿Borrar la sesión? Esta acción no se puede deshacer.";
  }
  return "¿Borrar las " + n + " sesiones? Esta acción no se puede deshacer.";
}

// Nombre accesible de un botón, por ejemplo "Borrar Matemáticas, martes, 29 de
// septiembre de 2026, 45 min"
function nombreAccion(accion, sesion) {
  return accion + " " + sesion.topic + ", " + fechaBonita(sesion.date) + ", " +
    sesion.minutes + " min";
}

// Fila que recibe el foco tras borrar la de `posicion` en una lista de `total` filas:
// la siguiente (que pasa a ocupar su lugar) o, si era la última, la anterior.
// -1 si la lista se queda vacía.
function posicionFocoTrasBorrar(posicion, total) {
  if (total <= 1) {
    return -1;
  }
  return posicion < total - 1 ? posicion : posicion - 1;
}

// En Node (tests) no hay variables globales compartidas: exportamos las funciones.
// En el navegador `module` no existe y este bloque no hace nada.
if (typeof module !== "undefined") {
  module.exports = {
    fechaATexto: fechaATexto,
    textoAFecha: textoAFecha,
    diaAnterior: diaAnterior,
    fechaBonita: fechaBonita,
    calcularRacha: calcularRacha,
    calcularDiasDelMes: calcularDiasDelMes,
    sumarDias: sumarDias,
    diaDeLaSemana: diaDeLaSemana,
    calcularPeriodo: calcularPeriodo,
    esFechaValida: esFechaValida,
    esSesionValida: esSesionValida,
    minutosPorDia: minutosPorDia,
    nivelDeMinutos: nivelDeMinutos,
    tipoDeDia: tipoDeDia,
    textoDetalle: textoDetalle,
    construirMapa: construirMapa,
    moverSeleccion: moverSeleccion,
    interpretarDatosGuardados: interpretarDatosGuardados,
    leerListaGuardada: leerListaGuardada,
    validarEdicion: validarEdicion,
    mismaSesion: mismaSesion,
    localizarSesion: localizarSesion,
    editarSesion: editarSesion,
    borrarSesion: borrarSesion,
    borrarSesionesValidas: borrarSesionesValidas,
    contarSesionesValidas: contarSesionesValidas,
    prepararGuardado: prepararGuardado,
    ordenarParaLista: ordenarParaLista,
    textoConfirmarBorrado: textoConfirmarBorrado,
    textoConfirmarBorrarTodas: textoConfirmarBorrarTodas,
    nombreAccion: nombreAccion,
    posicionFocoTrasBorrar: posicionFocoTrasBorrar,
  };
}
