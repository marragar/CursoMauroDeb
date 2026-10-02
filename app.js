// Nombre con el que guardamos las sesiones en localStorage
const CLAVE = "diario-estudio-sesiones";

// Elementos de la página
const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const lista = document.getElementById("lista");
const textoVacio = document.getElementById("vacio");
const numeroRacha = document.getElementById("racha");
const textoRacha = document.getElementById("racha-texto");
const numeroDiasMes = document.getElementById("dias-mes");
const textoDiasMes = document.getElementById("dias-mes-texto");
const mapa = document.getElementById("mapa");
const detalleMapa = document.getElementById("mapa-detalle");
const botonGuardarSesion = document.getElementById("guardar-sesion");
const tituloLista = document.getElementById("lista-titulo");
const aviso = document.getElementById("aviso");
const botonBorrarTodas = document.getElementById("borrar-todas");
const dialogo = document.getElementById("confirmacion");
const dialogoTexto = document.getElementById("confirmacion-texto");
const dialogoBorrar = document.getElementById("confirmacion-borrar");
const dialogoCancelar = document.getElementById("confirmacion-cancelar");

// Los cálculos (fechas, racha, días del mes y mapa) están en logica.js,
// que index.html carga antes que este archivo.

// ---------- Guardar y cargar ----------

// Cada sesión se guarda como { date: "AAAA-MM-DD", topic, minutes }
function cargarSesiones() {
  const datos = localStorage.getItem(CLAVE);
  if (datos === null) {
    return [];
  }
  return JSON.parse(datos);
}

function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE, JSON.stringify(sesiones));
}

// ---------- Mapa de calor ----------

// Estado del mapa entre dibujados
let periodoMapa = null; // { inicio, fin } del mapa dibujado
let detalleDeHoy = ""; // texto que se muestra cuando no hay ningún día seleccionado
let casillaSeleccionada = null; // casilla tocada, pulsada o elegida con el teclado

// El mapa solo LEE los datos y nunca falla: si no se pueden leer, se dibuja vacío.
// (cargarSesiones no se toca: si devolviera [] con datos corruptos, al guardar se
// sobrescribirían las sesiones del usuario.)
function leerSesionesParaMapa() {
  let texto = null;
  try {
    texto = localStorage.getItem(CLAVE);
  } catch (error) {
    texto = null; // almacenamiento no disponible
  }
  return interpretarDatosGuardados(texto);
}

function mostrarMapa(hoy) {
  const semanas = construirMapa(leerSesionesParaMapa(), hoy);
  periodoMapa = calcularPeriodo(hoy);
  casillaSeleccionada = null; // al redibujar se vuelve a mostrar el día de hoy

  // Quitamos las casillas anteriores (las iniciales se quedan)
  for (const casilla of mapa.querySelectorAll(".casilla")) {
    casilla.remove();
  }

  // Creamos las 84 casillas por columnas: semana a semana, de lunes a domingo
  const fragmento = document.createDocumentFragment();
  for (const semana of semanas) {
    for (const dia of semana) {
      const casilla = document.createElement("button");
      casilla.type = "button";
      casilla.className = "casilla " + (dia.nivel === null ? "futuro" : "nivel-" + dia.nivel);
      casilla.dataset.fecha = dia.fecha;
      casilla.setAttribute("aria-label", dia.detalle);
      // Solo una casilla entra en el orden del tabulador (la de hoy, de momento)
      casilla.tabIndex = -1;
      if (dia.tipo === "hoy") {
        casilla.classList.add("hoy");
        casilla.setAttribute("aria-current", "date");
        casilla.tabIndex = 0;
        detalleDeHoy = dia.detalle;
      }
      fragmento.appendChild(casilla);
    }
  }
  mapa.appendChild(fragmento);
  detalleMapa.textContent = detalleDeHoy;
}

// Muestra el detalle del día seleccionado, o el de hoy si no hay ninguno
function mostrarDetalleFijo() {
  if (casillaSeleccionada) {
    detalleMapa.textContent = casillaSeleccionada.getAttribute("aria-label");
  } else {
    detalleMapa.textContent = detalleDeHoy;
  }
}

function seleccionarCasilla(casilla) {
  // Movemos la parada del tabulador a la casilla nueva
  for (const otra of mapa.querySelectorAll(".casilla")) {
    otra.tabIndex = -1;
  }
  casilla.tabIndex = 0;
  casillaSeleccionada = casilla;
  mostrarDetalleFijo();
}

// Casilla sobre la que ha ocurrido un evento (o null si fue en una inicial o un hueco)
function casillaDelEvento(evento) {
  return evento.target.closest(".casilla");
}

// Tocar o hacer clic selecciona el día
mapa.addEventListener("click", function (evento) {
  const casilla = casillaDelEvento(evento);
  if (casilla) {
    seleccionarCasilla(casilla);
  }
});

// Llegar a una casilla con el teclado (Tab o flechas) también la selecciona
mapa.addEventListener("focusin", function (evento) {
  const casilla = casillaDelEvento(evento);
  if (casilla) {
    seleccionarCasilla(casilla);
  }
});

// Pasar el ratón solo enseña el detalle; no cambia la selección
mapa.addEventListener("mouseover", function (evento) {
  const casilla = casillaDelEvento(evento);
  if (casilla) {
    detalleMapa.textContent = casilla.getAttribute("aria-label");
  }
});

mapa.addEventListener("mouseleave", mostrarDetalleFijo);

// Flechas: izquierda/derecha cambian de semana, arriba/abajo de día
mapa.addEventListener("keydown", function (evento) {
  const flechas = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
  const casilla = casillaDelEvento(evento);
  if (!casilla || !flechas.includes(evento.key)) {
    return; // Tab y el resto de teclas funcionan como siempre
  }
  evento.preventDefault(); // que las flechas no muevan la página

  const nuevaFecha = moverSeleccion(casilla.dataset.fecha, evento.key,
    periodoMapa.inicio, periodoMapa.fin);
  const nueva = mapa.querySelector('.casilla[data-fecha="' + nuevaFecha + '"]');
  nueva.focus(); // el evento focusin la selecciona
});

// ---------- Pintar en pantalla ----------

function mostrarRacha(sesiones, hoy) {
  const racha = calcularRacha(sesiones, hoy);
  numeroRacha.textContent = racha;
  textoRacha.textContent = racha === 1 ? "día seguido" : "días seguidos";
}

function mostrarDiasDelMes(sesiones, hoy) {
  const dias = calcularDiasDelMes(sesiones, hoy);
  const nombreMes = textoAFecha(hoy).toLocaleDateString("es-ES", { month: "long" });
  numeroDiasMes.textContent = dias;
  textoDiasMes.textContent =
    (dias === 1 ? "día estudiado" : "días estudiados") + " en " + nombreMes;
}

// Estado de la lista entre dibujados
let sesionesPintadas = []; // lo que se leyó en el último dibujado
let filasPintadas = []; // filas de ordenarParaLista, en el orden en que se ven
let edicion = null; // { indice, original } de la sesión en modo edición, o null

function mostrarLista(sesiones) {
  sesionesPintadas = sesiones;
  filasPintadas = ordenarParaLista(sesiones);

  lista.innerHTML = "";
  filasPintadas.forEach(function (fila, posicion) {
    const elemento = document.createElement("li");
    elemento.dataset.posicion = posicion;

    if (edicion !== null && fila.indice === edicion.indice) {
      elemento.className = "editando";
      elemento.appendChild(crearFormularioEdicion(fila.sesion));
      lista.appendChild(elemento);
      return;
    }

    const info = document.createElement("div");
    info.className = "sesion-info";
    const tema = document.createElement("div");
    tema.className = "sesion-tema";
    tema.textContent = fila.sesion.topic;
    const fecha = document.createElement("div");
    fecha.className = "sesion-fecha";
    fecha.textContent = fechaBonita(fila.sesion.date);
    info.appendChild(tema);
    info.appendChild(fecha);

    const minutos = document.createElement("div");
    minutos.className = "sesion-minutos";
    minutos.textContent = fila.sesion.minutes + " min";

    elemento.appendChild(info);
    elemento.appendChild(minutos);

    // Solo las sesiones válidas se pueden editar y borrar (RF-1)
    if (fila.valida) {
      const acciones = document.createElement("div");
      acciones.className = "sesion-acciones";
      acciones.appendChild(crearBotonAccion("Editar", "editar", fila.sesion));
      acciones.appendChild(crearBotonAccion("Borrar", "borrar", fila.sesion));
      elemento.appendChild(acciones);
    }
    lista.appendChild(elemento);
  });

  // Mensaje cuando no hay sesiones
  textoVacio.hidden = sesiones.length > 0;

  // Mientras se edita, nada más puede cambiar los datos ni volver a pintar la lista (RF-3)
  botonGuardarSesion.disabled = edicion !== null;
  botonBorrarTodas.disabled = edicion !== null || contarSesionesValidas(sesiones) === 0;
}

function crearBotonAccion(texto, accion, sesion) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = accion === "borrar" ? "boton-secundario boton-peligro" : "boton-secundario";
  boton.textContent = texto;
  boton.dataset.accion = accion;
  boton.setAttribute("aria-label", nombreAccion(texto, sesion));
  boton.disabled = edicion !== null;
  return boton;
}

function mostrarTodo() {
  // Único sitio donde se mira el reloj: el resto recibe "hoy" ya calculado
  const hoy = fechaATexto(new Date());
  // El mapa va primero: así se dibuja aunque los datos estén corruptos y lo demás falle
  mostrarMapa(hoy);
  const sesiones = cargarSesiones();
  mostrarRacha(sesiones, hoy);
  mostrarDiasDelMes(sesiones, hoy);
  mostrarLista(sesiones);
}

// ---------- Guardar cambios de forma segura (spec 002) ----------

const AVISO_NO_EXISTE = "Esta sesión ya no existe. La lista se ha actualizado.";
const AVISO_ILEGIBLE = "No se han podido leer tus datos. No se ha cambiado nada.";
const AVISO_FALLO = "No se ha podido guardar el cambio. Tus datos no se han modificado.";

// Vuelve a leer lo guardado justo antes de escribir y aplica ahí la operación, para no
// pisar lo que haya escrito otra pestaña (RF-14). Devuelve "ok", "noExiste", "ilegible"
// o "fallo". Si no es "ok", no se ha escrito nada.
function guardarOperacion(operacion) {
  let texto;
  try {
    texto = localStorage.getItem(CLAVE);
  } catch (error) {
    return "ilegible"; // almacenamiento no disponible
  }
  const preparado = prepararGuardado(texto, operacion);
  if (preparado.estado !== "ok") {
    return preparado.estado;
  }
  try {
    localStorage.setItem(CLAVE, JSON.stringify(preparado.sesiones));
  } catch (error) {
    return "fallo"; // almacenamiento lleno o no disponible
  }
  return "ok";
}

function mostrarAviso(texto) {
  aviso.textContent = texto;
}

function limpiarAviso() {
  aviso.textContent = "";
}

// ---------- Foco ----------

// Lleva el foco a una acción ("editar" o "borrar") de la fila que se ve en `posicion`.
// Si esa fila no existe o no tiene acciones, al título de la lista.
function enfocarFila(posicion, accion) {
  const elemento = lista.children[posicion];
  const boton = elemento ? elemento.querySelector('[data-accion="' + accion + '"]') : null;
  if (boton) {
    boton.focus();
  } else {
    tituloLista.focus();
  }
}

function posicionDeIndice(indice) {
  return filasPintadas.findIndex(function (fila) {
    return fila.indice === indice;
  });
}

function posicionDeSesion(sesion) {
  return filasPintadas.findIndex(function (fila) {
    return mismaSesion(fila.sesion, sesion);
  });
}

// ---------- Confirmación ----------

let alAceptar = null; // qué hacer si el usuario confirma
let focoAlCancelar = null; // botón que abrió el diálogo

// Abre el diálogo con el foco en «Cancelar», para que un Enter por error no borre nada
function pedirConfirmacion(texto, textoBoton, siAcepta, botonQueAbre) {
  dialogoTexto.textContent = texto;
  dialogoBorrar.textContent = textoBoton;
  alAceptar = siAcepta;
  focoAlCancelar = botonQueAbre;
  dialogo.returnValue = "";
  dialogo.showModal();
  dialogoCancelar.focus();
}

// Cualquier cierre que no sea el botón de borrar (Cancelar, Escape…) es cancelar (RF-10)
dialogo.addEventListener("close", function () {
  const accion = alAceptar;
  alAceptar = null;
  if (dialogo.returnValue === "borrar") {
    accion();
  } else {
    focoAlCancelar.focus();
  }
});

// ---------- Borrar ----------

function pedirBorrado(fila, posicion, boton) {
  limpiarAviso();
  pedirConfirmacion(textoConfirmarBorrado(fila.sesion), "Borrar", function () {
    const total = filasPintadas.length;
    const resultado = guardarOperacion({ tipo: "borrar", indice: fila.indice, original: fila.sesion });

    if (resultado === "ok") {
      mostrarTodo();
      const destino = posicionFocoTrasBorrar(posicion, total);
      if (destino === -1) {
        tituloLista.focus();
      } else {
        enfocarFila(destino, "editar");
      }
    } else if (resultado === "noExiste") {
      mostrarTodo();
      mostrarAviso(AVISO_NO_EXISTE);
      tituloLista.focus();
    } else {
      mostrarAviso(resultado === "ilegible" ? AVISO_ILEGIBLE : AVISO_FALLO);
      boton.focus();
    }
  }, boton);
}

botonBorrarTodas.addEventListener("click", function () {
  limpiarAviso();
  const n = contarSesionesValidas(sesionesPintadas);
  pedirConfirmacion(textoConfirmarBorrarTodas(n), "Borrar todo", function () {
    const resultado = guardarOperacion({ tipo: "borrarTodas" });
    if (resultado === "ok") {
      mostrarTodo();
      tituloLista.focus();
    } else {
      mostrarAviso(resultado === "ilegible" ? AVISO_ILEGIBLE : AVISO_FALLO);
      botonBorrarTodas.focus();
    }
  }, botonBorrarTodas);
});

// ---------- Editar ----------

// Formulario de la fila en modo edición. Solo hay uno a la vez, así que los id son fijos.
// `novalidate`: los mensajes son los de la spec, no las burbujas del navegador (RF-5).
function crearFormularioEdicion(sesion) {
  const formularioEdicion = document.createElement("form");
  formularioEdicion.className = "edicion";
  formularioEdicion.noValidate = true;
  formularioEdicion.setAttribute("aria-label", "Editar sesión");

  const campos = [
    { id: "editar-fecha", etiqueta: "Fecha", tipo: "date", valor: sesion.date },
    { id: "editar-tema", etiqueta: "Tema", tipo: "text", valor: sesion.topic },
    { id: "editar-minutos", etiqueta: "Minutos", tipo: "number", valor: String(sesion.minutes) },
  ];
  for (const campo of campos) {
    const etiqueta = document.createElement("label");
    etiqueta.htmlFor = campo.id;
    etiqueta.textContent = campo.etiqueta;
    const entrada = document.createElement("input");
    entrada.id = campo.id;
    entrada.type = campo.tipo;
    entrada.value = campo.valor;
    entrada.setAttribute("aria-describedby", "editar-errores");
    if (campo.tipo === "number") {
      entrada.min = "1";
      entrada.step = "1";
    }
    formularioEdicion.appendChild(etiqueta);
    formularioEdicion.appendChild(entrada);
  }

  const errores = document.createElement("div");
  errores.id = "editar-errores";
  errores.className = "edicion-errores";
  errores.setAttribute("role", "alert");
  formularioEdicion.appendChild(errores);

  const botones = document.createElement("div");
  botones.className = "edicion-botones";
  const guardar = document.createElement("button");
  guardar.type = "submit";
  guardar.textContent = "Guardar";
  const cancelar = document.createElement("button");
  cancelar.type = "button";
  cancelar.className = "boton-secundario";
  cancelar.textContent = "Cancelar";
  cancelar.addEventListener("click", cancelarEdicion);
  botones.appendChild(guardar);
  botones.appendChild(cancelar);
  formularioEdicion.appendChild(botones);

  // Enter en cualquier campo envía el formulario (Guardar); Escape cancela (RF-6)
  formularioEdicion.addEventListener("submit", function (evento) {
    evento.preventDefault();
    guardarEdicion();
  });
  formularioEdicion.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      evento.preventDefault();
      cancelarEdicion();
    }
  });
  return formularioEdicion;
}

function abrirEdicion(fila) {
  limpiarAviso();
  edicion = { indice: fila.indice, original: fila.sesion };
  mostrarLista(sesionesPintadas);
  document.getElementById("editar-fecha").focus(); // RF-2
}

function cancelarEdicion() {
  const indice = edicion.indice;
  edicion = null;
  limpiarAviso();
  mostrarLista(sesionesPintadas); // no ha cambiado nada guardado
  enfocarFila(posicionDeIndice(indice), "editar");
}

function pintarErrores(mensajes) {
  const errores = document.getElementById("editar-errores");
  errores.innerHTML = "";
  for (const mensaje of mensajes) {
    const linea = document.createElement("p");
    linea.textContent = mensaje;
    errores.appendChild(linea);
  }
}

function guardarEdicion() {
  limpiarAviso();
  const validacion = validarEdicion(
    document.getElementById("editar-fecha").value,
    document.getElementById("editar-tema").value,
    document.getElementById("editar-minutos").value
  );
  if (!validacion.valida) {
    pintarErrores(validacion.errores); // RF-5: no se guarda y la fila sigue en edición
    return;
  }
  pintarErrores([]);

  const resultado = guardarOperacion({
    tipo: "editar",
    indice: edicion.indice,
    original: edicion.original,
    cambios: validacion.cambios,
  });

  if (resultado === "ok") {
    const editada = editarSesion([edicion.original], 0, validacion.cambios)[0];
    edicion = null;
    mostrarTodo();
    enfocarFila(posicionDeSesion(editada), "editar"); // RF-4
  } else if (resultado === "noExiste") {
    edicion = null;
    mostrarTodo();
    mostrarAviso(AVISO_NO_EXISTE);
    tituloLista.focus();
  } else {
    // RF-16 y RF-17: la fila sigue en edición con lo escrito
    mostrarAviso(resultado === "ilegible" ? AVISO_ILEGIBLE : AVISO_FALLO);
  }
}

// «Editar» y «Borrar» de cada fila
lista.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton || boton.disabled) {
    return;
  }
  const posicion = Number(boton.closest("li").dataset.posicion);
  const fila = filasPintadas[posicion];
  if (boton.dataset.accion === "editar") {
    abrirEdicion(fila);
  } else {
    pedirBorrado(fila, posicion, boton);
  }
});

// ---------- Formulario ----------

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();
  if (edicion !== null) {
    return; // RF-3 (el botón ya está desactivado; esto cubre cualquier otro envío)
  }

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  // Comprobaciones básicas
  if (fecha === "") {
    alert("Elige una fecha.");
    return;
  }
  if (tema === "") {
    alert("Escribe un tema.");
    return;
  }
  if (!(minutos > 0)) {
    alert("Los minutos deben ser un número mayor que 0.");
    return;
  }

  const sesiones = cargarSesiones();
  sesiones.push({
    date: fecha,
    topic: tema,
    minutes: minutos,
  });
  guardarSesiones(sesiones);

  // Limpiamos el formulario, dejando la fecha de hoy otra vez
  formulario.reset();
  campoFecha.value = fechaATexto(new Date());

  mostrarTodo();
});

// ---------- Inicio ----------

campoFecha.value = fechaATexto(new Date());
mostrarTodo();
