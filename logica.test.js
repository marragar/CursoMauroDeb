// Tests de logica.js.
// Funcionan en dos sitios sin instalar nada:
// - En la terminal, con `node --test` (usa los módulos que ya trae Node).
// - En el navegador, desde tests.html, que define antes su propio `test` y `assert`.

(function () {
  let test;
  let assert;
  let logica;

  if (typeof require === "function") {
    // Node
    test = require("node:test");
    assert = require("node:assert");
    logica = require("./logica.js");
  } else {
    // Navegador: logica.js ya se ha cargado y sus funciones son globales
    test = window.test;
    assert = window.assert;
    logica = window;
  }

  // ---------- fechaATexto ----------

  test("fechaATexto rellena con ceros el mes y el día", function () {
    assert.strictEqual(logica.fechaATexto(new Date(2026, 0, 5)), "2026-01-05");
  });

  test("fechaATexto usa la fecha local aunque sean las 00:30", function () {
    assert.strictEqual(logica.fechaATexto(new Date(2026, 9, 2, 0, 30)), "2026-10-02");
  });

  // ---------- textoAFecha ----------

  test("textoAFecha devuelve la medianoche local de ese día", function () {
    const fecha = logica.textoAFecha("2026-10-02");
    assert.strictEqual(fecha.getFullYear(), 2026);
    assert.strictEqual(fecha.getMonth(), 9);
    assert.strictEqual(fecha.getDate(), 2);
    assert.strictEqual(fecha.getHours(), 0);
  });

  test("textoAFecha y fechaATexto se deshacen entre sí (29 de febrero)", function () {
    assert.strictEqual(logica.fechaATexto(logica.textoAFecha("2028-02-29")), "2028-02-29");
  });

  // ---------- diaAnterior ----------

  test("diaAnterior del 1 de enero es el 31 de diciembre del año anterior", function () {
    const anterior = logica.diaAnterior(new Date(2026, 0, 1));
    assert.strictEqual(logica.fechaATexto(anterior), "2025-12-31");
  });

  test("diaAnterior del 1 de marzo de 2028 es el 29 de febrero", function () {
    const anterior = logica.diaAnterior(new Date(2028, 2, 1));
    assert.strictEqual(logica.fechaATexto(anterior), "2028-02-29");
  });

  test("diaAnterior no se salta ni repite días con el cambio de hora", function () {
    // 29 de marzo y 25 de octubre de 2026 son días de cambio de hora en España
    const trasVerano = logica.diaAnterior(new Date(2026, 2, 30));
    const trasInvierno = logica.diaAnterior(new Date(2026, 9, 26));
    assert.strictEqual(logica.fechaATexto(trasVerano), "2026-03-29");
    assert.strictEqual(logica.fechaATexto(trasInvierno), "2026-10-25");
  });

  // ---------- fechaBonita ----------

  test("fechaBonita escribe la fecha completa en español", function () {
    assert.strictEqual(logica.fechaBonita("2026-09-29"), "martes, 29 de septiembre de 2026");
  });

  // Crea sesiones de prueba a partir de una lista de fechas (30 minutos cada una)
  function sesionesEn(fechas) {
    return fechas.map(function (fecha) {
      return { date: fecha, topic: "Prueba", minutes: 30 };
    });
  }

  // ---------- calcularRacha ----------

  test("calcularRacha sin sesiones es 0", function () {
    assert.strictEqual(logica.calcularRacha([], "2026-10-01"), 0);
  });

  test("calcularRacha cuenta los días seguidos que terminan hoy", function () {
    const sesiones = sesionesEn(["2026-09-29", "2026-09-30", "2026-10-01"]);
    assert.strictEqual(logica.calcularRacha(sesiones, "2026-10-01"), 3);
  });

  test("calcularRacha sigue viva si hoy no hay sesión pero ayer sí", function () {
    const sesiones = sesionesEn(["2026-09-29", "2026-09-30"]);
    assert.strictEqual(logica.calcularRacha(sesiones, "2026-10-01"), 2);
  });

  test("calcularRacha es 0 si no hubo sesión ni hoy ni ayer", function () {
    const sesiones = sesionesEn(["2026-09-28", "2026-09-29"]);
    assert.strictEqual(logica.calcularRacha(sesiones, "2026-10-01"), 0);
  });

  test("calcularRacha se corta en el primer hueco", function () {
    const sesiones = sesionesEn(["2026-09-27", "2026-09-28", "2026-09-30", "2026-10-01"]);
    assert.strictEqual(logica.calcularRacha(sesiones, "2026-10-01"), 2);
  });

  test("calcularRacha cuenta varias sesiones del mismo día como un solo día", function () {
    const sesiones = sesionesEn(["2026-10-01", "2026-10-01", "2026-09-30"]);
    assert.strictEqual(logica.calcularRacha(sesiones, "2026-10-01"), 2);
  });

  test("calcularRacha no suma las fechas futuras", function () {
    const sesiones = sesionesEn(["2026-10-01", "2026-10-02", "2026-10-03"]);
    assert.strictEqual(logica.calcularRacha(sesiones, "2026-10-01"), 1);
    assert.strictEqual(logica.calcularRacha(sesionesEn(["2026-10-02"]), "2026-10-01"), 0);
  });

  test("calcularRacha cruza el cambio de mes y el cambio de hora", function () {
    const cambioDeMes = sesionesEn(["2028-02-28", "2028-02-29", "2028-03-01"]);
    const cambioDeHora = sesionesEn(["2026-10-24", "2026-10-25", "2026-10-26"]);
    assert.strictEqual(logica.calcularRacha(cambioDeMes, "2028-03-01"), 3);
    assert.strictEqual(logica.calcularRacha(cambioDeHora, "2026-10-26"), 3);
  });

  // ---------- calcularDiasDelMes ----------

  test("calcularDiasDelMes sin sesiones es 0", function () {
    assert.strictEqual(logica.calcularDiasDelMes([], "2026-10-15"), 0);
  });

  test("calcularDiasDelMes cuenta varias sesiones del mismo día como un solo día", function () {
    const sesiones = sesionesEn(["2026-10-01", "2026-10-01", "2026-10-03"]);
    assert.strictEqual(logica.calcularDiasDelMes(sesiones, "2026-10-15"), 2);
  });

  test("calcularDiasDelMes cuenta hoy pero no las fechas futuras", function () {
    const sesiones = sesionesEn(["2026-10-15", "2026-10-16", "2026-10-20"]);
    assert.strictEqual(logica.calcularDiasDelMes(sesiones, "2026-10-15"), 1);
  });

  test("calcularDiasDelMes no cuenta otros meses ni el mismo mes de otro año", function () {
    const sesiones = sesionesEn(["2026-09-30", "2026-11-01", "2025-10-05"]);
    assert.strictEqual(logica.calcularDiasDelMes(sesiones, "2026-10-15"), 0);
  });

  // ================= Mapa de calor (spec 001) =================

  // ---------- sumarDias ----------

  test("sumarDias pasa bien de mes y de año", function () {
    assert.strictEqual(logica.sumarDias("2026-01-31", 1), "2026-02-01");
    assert.strictEqual(logica.sumarDias("2026-12-31", 1), "2027-01-01");
    assert.strictEqual(logica.sumarDias("2026-01-01", -1), "2025-12-31");
  });

  test("sumarDias llega al 29 de febrero en año bisiesto", function () {
    assert.strictEqual(logica.sumarDias("2028-02-28", 1), "2028-02-29");
    assert.strictEqual(logica.sumarDias("2027-02-28", 1), "2027-03-01");
  });

  test("sumarDias no se salta ni repite días con el cambio de hora", function () {
    assert.strictEqual(logica.sumarDias("2026-03-29", 1), "2026-03-30");
    assert.strictEqual(logica.sumarDias("2026-10-25", 1), "2026-10-26");
    assert.strictEqual(logica.sumarDias("2026-03-30", -1), "2026-03-29");
  });

  // ---------- diaDeLaSemana ----------

  test("diaDeLaSemana empieza en lunes (0) y acaba en domingo (6)", function () {
    assert.strictEqual(logica.diaDeLaSemana("2026-10-05"), 0);
    assert.strictEqual(logica.diaDeLaSemana("2026-10-01"), 3);
    assert.strictEqual(logica.diaDeLaSemana("2026-10-04"), 6);
  });

  // ---------- calcularPeriodo (RF-1) ----------

  test("calcularPeriodo con hoy jueves 2026-10-01", function () {
    assert.deepStrictEqual(logica.calcularPeriodo("2026-10-01"),
      { inicio: "2026-07-13", fin: "2026-10-04" });
  });

  test("calcularPeriodo con hoy lunes 2026-10-05", function () {
    assert.deepStrictEqual(logica.calcularPeriodo("2026-10-05"),
      { inicio: "2026-07-20", fin: "2026-10-11" });
  });

  test("calcularPeriodo con hoy domingo 2026-10-04", function () {
    assert.deepStrictEqual(logica.calcularPeriodo("2026-10-04"),
      { inicio: "2026-07-13", fin: "2026-10-04" });
  });

  test("calcularPeriodo cruzando de año con un 29 de febrero (hoy 2028-03-02)", function () {
    assert.deepStrictEqual(logica.calcularPeriodo("2028-03-02"),
      { inicio: "2027-12-13", fin: "2028-03-05" });
  });

  // ---------- esFechaValida y esSesionValida (RF-9) ----------

  test("esFechaValida acepta fechas reales en formato AAAA-MM-DD", function () {
    assert.strictEqual(logica.esFechaValida("2026-10-01"), true);
    assert.strictEqual(logica.esFechaValida("2028-02-29"), true);
  });

  test("esFechaValida rechaza días que no existen y formatos incorrectos", function () {
    const noValidas = ["2026-02-30", "2027-02-29", "2026-13-01", "2026-9-5", "2026-10-01 ", "", null, undefined, 20261001];
    for (const valor of noValidas) {
      assert.strictEqual(logica.esFechaValida(valor), false, "Debería ser no válida: " + valor);
    }
  });

  test("esSesionValida acepta una sesión con fecha real y minutos enteros > 0", function () {
    assert.strictEqual(logica.esSesionValida({ date: "2026-10-01", topic: "Mates", minutes: 30 }), true);
  });

  test("esSesionValida rechaza minutos 0, negativos, decimales o en texto", function () {
    for (const minutos of [0, -10, 12.5, "30", null, undefined]) {
      const sesion = { date: "2026-10-01", topic: "Mates", minutes: minutos };
      assert.strictEqual(logica.esSesionValida(sesion), false, "Minutos: " + minutos);
    }
  });

  test("esSesionValida rechaza fechas no válidas, el formato antiguo y lo que no es un objeto", function () {
    assert.strictEqual(logica.esSesionValida({ date: "2026-02-30", topic: "x", minutes: 30 }), false);
    assert.strictEqual(logica.esSesionValida({ id: 1, fecha: "2026-10-01", tema: "x", minutos: 30 }), false);
    assert.strictEqual(logica.esSesionValida(null), false);
    assert.strictEqual(logica.esSesionValida("2026-10-01"), false);
  });

  // ---------- minutosPorDia (RF-2, RF-9) ----------

  test("minutosPorDia suma las sesiones del mismo día (20 + 15 = 35)", function () {
    const sesiones = [
      { date: "2026-09-29", topic: "a", minutes: 20 },
      { date: "2026-09-29", topic: "b", minutes: 15 },
    ];
    const minutos = logica.minutosPorDia(sesiones, "2026-07-13", "2026-10-04");
    assert.strictEqual(minutos["2026-09-29"], 35);
  });

  test("minutosPorDia solo cuenta las sesiones dentro del periodo", function () {
    const sesiones = [
      { date: "2026-07-12", topic: "domingo anterior", minutes: 10 },
      { date: "2026-07-13", topic: "primer lunes", minutes: 20 },
      { date: "2026-10-04", topic: "último domingo", minutes: 30 },
      { date: "2026-10-05", topic: "después", minutes: 40 },
    ];
    const minutos = logica.minutosPorDia(sesiones, "2026-07-13", "2026-10-04");
    assert.strictEqual(minutos["2026-07-12"], undefined);
    assert.strictEqual(minutos["2026-07-13"], 20);
    assert.strictEqual(minutos["2026-10-04"], 30);
    assert.strictEqual(minutos["2026-10-05"], undefined);
  });

  test("minutosPorDia ignora las sesiones no válidas sin fallar", function () {
    const sesiones = [
      { date: "2026-09-29", topic: "buena", minutes: 25 },
      { date: "2026-09-29", topic: "cero", minutes: 0 },
      { date: "2026-09-29", topic: "texto", minutes: "30" },
      { date: "2026-09-29", topic: "decimal", minutes: 12.5 },
      { date: "2026-9-29", topic: "sin ceros", minutes: 30 },
      { id: 1, fecha: "2026-09-29", tema: "antigua", minutos: 30 },
      null,
      "basura",
    ];
    const minutos = logica.minutosPorDia(sesiones, "2026-07-13", "2026-10-04");
    assert.strictEqual(minutos["2026-09-29"], 25);
    assert.strictEqual(Object.keys(minutos).length, 1);
  });

  // ---------- nivelDeMinutos (RF-3) ----------

  test("nivelDeMinutos en todos los límites de los tramos", function () {
    const casos = [[0, 0], [1, 1], [29, 1], [30, 2], [59, 2], [60, 3], [119, 3], [120, 4], [900, 4]];
    for (const caso of casos) {
      assert.strictEqual(logica.nivelDeMinutos(caso[0]), caso[1], caso[0] + " minutos");
    }
  });

  // ---------- tipoDeDia y textoDetalle (RF-4, RF-5) ----------

  test("tipoDeDia distingue pasado, hoy y futuro", function () {
    assert.strictEqual(logica.tipoDeDia("2026-09-30", "2026-10-01"), "pasado");
    assert.strictEqual(logica.tipoDeDia("2026-10-01", "2026-10-01"), "hoy");
    assert.strictEqual(logica.tipoDeDia("2026-10-02", "2026-10-01"), "futuro");
  });

  test("textoDetalle de un día pasado, con y sin estudio", function () {
    assert.strictEqual(logica.textoDetalle("2026-09-29", "2026-10-01", 30),
      "martes, 29 de septiembre de 2026: 30 min");
    assert.strictEqual(logica.textoDetalle("2026-09-29", "2026-10-01", 0),
      "martes, 29 de septiembre de 2026: sin estudio");
  });

  test("textoDetalle de hoy, con y sin estudio", function () {
    assert.strictEqual(logica.textoDetalle("2026-10-01", "2026-10-01", 45),
      "Hoy, jueves, 1 de octubre de 2026: 45 min");
    assert.strictEqual(logica.textoDetalle("2026-10-01", "2026-10-01", 0),
      "Hoy, jueves, 1 de octubre de 2026: aún sin estudio");
  });

  test("textoDetalle de un día futuro, aunque tenga sesiones", function () {
    assert.strictEqual(logica.textoDetalle("2026-10-04", "2026-10-01", 0),
      "domingo, 4 de octubre de 2026: todavía no ha llegado");
    assert.strictEqual(logica.textoDetalle("2026-10-04", "2026-10-01", 30),
      "domingo, 4 de octubre de 2026: todavía no ha llegado");
  });

  test("textoDetalle no separa miles ni pasa a horas", function () {
    assert.strictEqual(logica.textoDetalle("2026-09-29", "2026-10-01", 1500),
      "martes, 29 de septiembre de 2026: 1500 min");
  });

  // ---------- construirMapa (RF-1 a RF-5, RF-9, RF-10, RNF-8) ----------

  test("construirMapa devuelve 12 semanas de 7 días consecutivos", function () {
    const semanas = logica.construirMapa([], "2026-10-01");
    assert.strictEqual(semanas.length, 12);
    let esperada = "2026-07-13";
    for (const semana of semanas) {
      assert.strictEqual(semana.length, 7);
      for (const dia of semana) {
        assert.strictEqual(dia.fecha, esperada);
        esperada = logica.sumarDias(esperada, 1);
      }
    }
    assert.strictEqual(semanas[11][6].fecha, "2026-10-04");
  });

  test("construirMapa sin sesiones: pasados y hoy en nivel 0, futuros sin nivel", function () {
    const semanas = logica.construirMapa([], "2026-10-01");
    for (const semana of semanas) {
      for (const dia of semana) {
        if (dia.tipo === "futuro") {
          assert.strictEqual(dia.nivel, null);
        } else {
          assert.strictEqual(dia.nivel, 0);
        }
      }
    }
  });

  test("construirMapa marca hoy y le pone su detalle", function () {
    const sesiones = [{ date: "2026-10-01", topic: "x", minutes: 45 }];
    const hoy = logica.construirMapa(sesiones, "2026-10-01")[11][3];
    assert.strictEqual(hoy.fecha, "2026-10-01");
    assert.strictEqual(hoy.tipo, "hoy");
    assert.strictEqual(hoy.minutos, 45);
    assert.strictEqual(hoy.nivel, 2);
    assert.strictEqual(hoy.detalle, "Hoy, jueves, 1 de octubre de 2026: 45 min");
  });

  test("construirMapa suma minutos y da nivel a los días pasados", function () {
    const sesiones = [
      { date: "2026-09-29", topic: "a", minutes: 20 },
      { date: "2026-09-29", topic: "b", minutes: 15 },
    ];
    const martes = logica.construirMapa(sesiones, "2026-10-01")[11][1];
    assert.strictEqual(martes.fecha, "2026-09-29");
    assert.strictEqual(martes.tipo, "pasado");
    assert.strictEqual(martes.minutos, 35);
    assert.strictEqual(martes.nivel, 2);
  });

  test("construirMapa: un día futuro con sesión sigue sin nivel", function () {
    const sesiones = [{ date: "2026-10-03", topic: "planificada", minutes: 200 }];
    const sabado = logica.construirMapa(sesiones, "2026-10-01")[11][5];
    assert.strictEqual(sabado.fecha, "2026-10-03");
    assert.strictEqual(sabado.tipo, "futuro");
    assert.strictEqual(sabado.nivel, null);
    assert.strictEqual(sabado.detalle, "sábado, 3 de octubre de 2026: todavía no ha llegado");
  });

  test("construirMapa con 5.000 sesiones tarda menos de 200 ms", function () {
    const sesiones = [];
    for (let i = 0; i < 5000; i++) {
      sesiones.push({ date: logica.sumarDias("2026-10-01", -(i % 400)), topic: "x", minutes: 30 });
    }
    const inicio = performance.now();
    logica.construirMapa(sesiones, "2026-10-01");
    const duracion = performance.now() - inicio;
    assert.ok(duracion < 200, "Tardó " + Math.round(duracion) + " ms");
  });

  // ---------- moverSeleccion (RNF-6) ----------

  test("moverSeleccion: izquierda y derecha cambian de semana, arriba y abajo de día", function () {
    const inicio = "2026-07-13";
    const fin = "2026-10-04";
    assert.strictEqual(logica.moverSeleccion("2026-09-02", "ArrowLeft", inicio, fin), "2026-08-26");
    assert.strictEqual(logica.moverSeleccion("2026-09-02", "ArrowRight", inicio, fin), "2026-09-09");
    assert.strictEqual(logica.moverSeleccion("2026-09-02", "ArrowUp", inicio, fin), "2026-09-01");
    assert.strictEqual(logica.moverSeleccion("2026-09-02", "ArrowDown", inicio, fin), "2026-09-03");
  });

  test("moverSeleccion no sale del periodo", function () {
    const inicio = "2026-07-13";
    const fin = "2026-10-04";
    assert.strictEqual(logica.moverSeleccion("2026-07-15", "ArrowLeft", inicio, fin), "2026-07-15");
    assert.strictEqual(logica.moverSeleccion("2026-09-30", "ArrowRight", inicio, fin), "2026-09-30");
    assert.strictEqual(logica.moverSeleccion("2026-07-13", "ArrowUp", inicio, fin), "2026-07-13");
    assert.strictEqual(logica.moverSeleccion("2026-10-04", "ArrowDown", inicio, fin), "2026-10-04");
  });

  test("moverSeleccion: arriba en lunes y abajo en domingo no se mueven", function () {
    const inicio = "2026-07-13";
    const fin = "2026-10-04";
    assert.strictEqual(logica.moverSeleccion("2026-09-28", "ArrowUp", inicio, fin), "2026-09-28");
    assert.strictEqual(logica.moverSeleccion("2026-09-27", "ArrowDown", inicio, fin), "2026-09-27");
  });

  test("moverSeleccion ignora otras teclas", function () {
    assert.strictEqual(logica.moverSeleccion("2026-09-02", "Enter", "2026-07-13", "2026-10-04"), "2026-09-02");
  });

  // ---------- interpretarDatosGuardados (RF-11) ----------

  test("interpretarDatosGuardados devuelve [] con datos vacíos, corruptos o que no son una lista", function () {
    for (const texto of [null, undefined, "", "{roto", "{}", "5", "null", "\"texto\""]) {
      assert.deepStrictEqual(logica.interpretarDatosGuardados(texto), [], "Con: " + texto);
    }
  });

  test("interpretarDatosGuardados devuelve la lista guardada tal cual", function () {
    const lista = [{ date: "2026-10-01", topic: "Mates", minutes: 30 }];
    assert.deepStrictEqual(logica.interpretarDatosGuardados(JSON.stringify(lista)), lista);
  });

  // ---------- Spec 002: leerListaGuardada (RF-16) ----------

  test("leerListaGuardada: sin datos guardados es una lista vacía correcta", function () {
    assert.deepStrictEqual(logica.leerListaGuardada(null), { ok: true, sesiones: [] });
    assert.deepStrictEqual(logica.leerListaGuardada(""), { ok: true, sesiones: [] });
  });

  test("leerListaGuardada devuelve la lista guardada tal cual", function () {
    const lista = [{ date: "2026-10-01", topic: "Mates", minutes: 30 }, { id: 1, fecha: "x" }];
    assert.deepStrictEqual(logica.leerListaGuardada(JSON.stringify(lista)), { ok: true, sesiones: lista });
  });

  test("leerListaGuardada no da por buena una lista con datos corruptos o que no son una lista", function () {
    for (const texto of ["{roto", "{}", "5", "null", "\"texto\""]) {
      assert.deepStrictEqual(logica.leerListaGuardada(texto), { ok: false }, "Con: " + texto);
    }
  });

  // ---------- Spec 002: validarEdicion (RF-4, RF-5) ----------

  const ERROR_FECHA = "Elige una fecha válida.";
  const ERROR_TEMA = "Escribe un tema.";
  const ERROR_MINUTOS = "Los minutos deben ser un número entero mayor que 0.";

  test("validarEdicion acepta datos correctos y devuelve los cambios", function () {
    assert.deepStrictEqual(logica.validarEdicion("2026-09-29", "Matemáticas", "45"), {
      valida: true,
      cambios: { date: "2026-09-29", topic: "Matemáticas", minutes: 45 },
    });
  });

  test("validarEdicion quita los espacios de los extremos del tema y de los minutos", function () {
    assert.deepStrictEqual(logica.validarEdicion("2026-09-29", "  Física  ", " 45 "), {
      valida: true,
      cambios: { date: "2026-09-29", topic: "Física", minutes: 45 },
    });
  });

  test("validarEdicion rechaza una fecha vacía o que no existe", function () {
    for (const fecha of ["", "2026-02-30", "29/09/2026"]) {
      assert.deepStrictEqual(logica.validarEdicion(fecha, "Mates", "30"),
        { valida: false, errores: [ERROR_FECHA] }, "Con: " + fecha);
    }
  });

  test("validarEdicion rechaza un tema vacío o solo con espacios", function () {
    for (const tema of ["", "   "]) {
      assert.deepStrictEqual(logica.validarEdicion("2026-09-29", tema, "30"),
        { valida: false, errores: [ERROR_TEMA] }, "Con: '" + tema + "'");
    }
  });

  test("validarEdicion rechaza minutos 0, negativos, vacíos, decimales o en notación científica", function () {
    for (const minutos of ["0", "-5", "", "   ", "4.5", "4,5", "1e2", "abc"]) {
      assert.deepStrictEqual(logica.validarEdicion("2026-09-29", "Mates", minutos),
        { valida: false, errores: [ERROR_MINUTOS] }, "Con: '" + minutos + "'");
    }
  });

  test("validarEdicion da todos los errores a la vez, en orden fecha, tema y minutos", function () {
    assert.deepStrictEqual(logica.validarEdicion("", " ", "0"),
      { valida: false, errores: [ERROR_FECHA, ERROR_TEMA, ERROR_MINUTOS] });
    assert.deepStrictEqual(logica.validarEdicion("2026-09-29", "", "0"),
      { valida: false, errores: [ERROR_TEMA, ERROR_MINUTOS] });
  });

  // ---------- Spec 002: localizar, editar y borrar (RF-4, RF-7, RF-9, RF-14, RF-15, RF-18) ----------

  const MATES = { date: "2026-09-29", topic: "Mates", minutes: 30 };
  const FISICA = { date: "2026-09-30", topic: "Física", minutes: 45 };
  const LENGUA = { date: "2026-10-01", topic: "Lengua", minutes: 20 };

  test("mismaSesion compara el contenido completo, no la referencia", function () {
    assert.strictEqual(logica.mismaSesion(MATES, { date: "2026-09-29", topic: "Mates", minutes: 30 }), true);
    assert.strictEqual(logica.mismaSesion(MATES, { date: "2026-09-29", topic: "Mates", minutes: 31 }), false);
    assert.strictEqual(logica.mismaSesion(MATES, Object.assign({ nota: "x" }, MATES)), false);
  });

  test("localizarSesion devuelve la posición recordada si la sesión sigue ahí", function () {
    assert.strictEqual(logica.localizarSesion([MATES, FISICA, LENGUA], 1, FISICA), 1);
  });

  test("localizarSesion la encuentra aunque otra pestaña la haya movido", function () {
    // Otra pestaña borró MATES: FISICA pasó de la posición 1 a la 0
    assert.strictEqual(logica.localizarSesion([FISICA, LENGUA], 1, FISICA), 0);
  });

  test("localizarSesion devuelve -1 si la sesión ya no existe", function () {
    assert.strictEqual(logica.localizarSesion([MATES, LENGUA], 1, FISICA), -1);
    assert.strictEqual(logica.localizarSesion([], 0, FISICA), -1);
  });

  test("localizarSesion con dos sesiones idénticas prefiere la posición recordada", function () {
    assert.strictEqual(logica.localizarSesion([MATES, FISICA, MATES], 2, MATES), 2);
  });

  test("editarSesion cambia solo esa sesión y conserva sus campos extra", function () {
    const conExtra = { date: "2026-09-30", topic: "Física", minutes: 45, nota: "repaso" };
    const lista = [MATES, conExtra, LENGUA];
    const nueva = logica.editarSesion(lista, 1, { date: "2026-09-28", topic: "Química", minutes: 50 });
    assert.deepStrictEqual(nueva, [
      MATES,
      { date: "2026-09-28", topic: "Química", minutes: 50, nota: "repaso" },
      LENGUA,
    ]);
  });

  test("editarSesion no modifica la lista ni la sesión que recibe", function () {
    const sesion = { date: "2026-09-30", topic: "Física", minutes: 45 };
    const lista = [MATES, sesion];
    logica.editarSesion(lista, 1, { date: "2026-09-28", topic: "Química", minutes: 50 });
    assert.deepStrictEqual(lista, [MATES, { date: "2026-09-30", topic: "Física", minutes: 45 }]);
  });

  test("borrarSesion quita solo una de dos sesiones idénticas y deja el resto intacto", function () {
    const lista = [MATES, FISICA, MATES, { id: 1, fecha: "antiguo" }];
    assert.deepStrictEqual(logica.borrarSesion(lista, 2), [MATES, FISICA, { id: 1, fecha: "antiguo" }]);
  });

  test("borrarSesion no modifica la lista que recibe", function () {
    const lista = [MATES, FISICA];
    logica.borrarSesion(lista, 0);
    assert.deepStrictEqual(lista, [MATES, FISICA]);
  });

  // ---------- Spec 002: borrar todas y preparar el guardado (RF-11 a RF-16, RF-18) ----------

  const ANTIGUA = { id: 7, fecha: "2026-09-01", tema: "Antigua", minutos: 20 };
  const DECIMAL = { date: "2026-09-02", topic: "Decimal", minutes: 4.5 };

  test("borrarSesionesValidas conserva intactas las sesiones no válidas", function () {
    assert.deepStrictEqual(logica.borrarSesionesValidas([MATES, ANTIGUA, FISICA, DECIMAL, null]),
      [ANTIGUA, DECIMAL, null]);
    assert.deepStrictEqual(logica.borrarSesionesValidas([MATES, FISICA]), []);
  });

  test("contarSesionesValidas cuenta solo las válidas", function () {
    assert.strictEqual(logica.contarSesionesValidas([MATES, ANTIGUA, FISICA, DECIMAL]), 2);
    assert.strictEqual(logica.contarSesionesValidas([ANTIGUA]), 0);
    assert.strictEqual(logica.contarSesionesValidas([]), 0);
  });

  test("prepararGuardado no escribe nada si los datos guardados están corruptos", function () {
    assert.deepStrictEqual(logica.prepararGuardado("{roto", { tipo: "borrarTodas" }), { estado: "ilegible" });
    assert.deepStrictEqual(logica.prepararGuardado("{}", { tipo: "borrar", indice: 0, original: MATES }),
      { estado: "ilegible" });
  });

  test("prepararGuardado avisa si la sesión ya no existe", function () {
    const texto = JSON.stringify([FISICA]);
    assert.deepStrictEqual(logica.prepararGuardado(texto, { tipo: "borrar", indice: 0, original: MATES }),
      { estado: "noExiste" });
    assert.deepStrictEqual(logica.prepararGuardado(null,
      { tipo: "editar", indice: 0, original: MATES, cambios: { minutes: 10 } }), { estado: "noExiste" });
  });

  test("prepararGuardado edita sobre los datos leídos y conserva lo que añadió otra pestaña", function () {
    // Esta pestaña pintó [MATES, FISICA]; otra pestaña añadió LENGUA al final
    const texto = JSON.stringify([MATES, FISICA, LENGUA]);
    const cambios = { date: "2026-09-30", topic: "Química", minutes: 50 };
    assert.deepStrictEqual(
      logica.prepararGuardado(texto, { tipo: "editar", indice: 1, original: FISICA, cambios: cambios }),
      { estado: "ok", sesiones: [MATES, cambios, LENGUA] });
  });

  test("prepararGuardado borra sobre los datos leídos aunque otra pestaña haya movido la sesión", function () {
    // Esta pestaña pintó [MATES, FISICA]; otra pestaña borró MATES y añadió LENGUA
    const texto = JSON.stringify([FISICA, LENGUA]);
    assert.deepStrictEqual(logica.prepararGuardado(texto, { tipo: "borrar", indice: 1, original: FISICA }),
      { estado: "ok", sesiones: [LENGUA] });
  });

  test("prepararGuardado con borrarTodas conserva las sesiones no válidas", function () {
    const texto = JSON.stringify([MATES, ANTIGUA, FISICA]);
    assert.deepStrictEqual(logica.prepararGuardado(texto, { tipo: "borrarTodas" }),
      { estado: "ok", sesiones: [ANTIGUA] });
  });

  // ---------- Spec 002: orden de la lista, textos y foco (RF-1, RF-7 a RF-11, RNF-2) ----------

  test("ordenarParaLista: de la fecha más reciente a la más antigua, con su índice guardado", function () {
    const filas = logica.ordenarParaLista([MATES, LENGUA, FISICA]);
    assert.deepStrictEqual(filas.map(function (f) { return f.indice; }), [1, 2, 0]);
    assert.deepStrictEqual(filas[0], { sesion: LENGUA, indice: 1, valida: true });
  });

  test("ordenarParaLista: en el mismo día va primero la última añadida", function () {
    const a = { date: "2026-09-29", topic: "A", minutes: 10 };
    const b = { date: "2026-09-29", topic: "B", minutes: 10 };
    const c = { date: "2026-09-29", topic: "C", minutes: 10 };
    const filas = logica.ordenarParaLista([a, b, c]);
    assert.deepStrictEqual(filas.map(function (f) { return f.sesion.topic; }), ["C", "B", "A"]);
  });

  test("ordenarParaLista: una sesión editada a otro día se coloca según cuándo se añadió", function () {
    // La sesión 0 (la más antigua) se edita al 2026-10-01, donde ya está la 2
    const sesiones = [
      { date: "2026-10-01", topic: "Editada", minutes: 10 },
      { date: "2026-09-30", topic: "B", minutes: 10 },
      { date: "2026-10-01", topic: "C", minutes: 10 },
    ];
    const filas = logica.ordenarParaLista(sesiones);
    assert.deepStrictEqual(filas.map(function (f) { return f.sesion.topic; }), ["C", "Editada", "B"]);
  });

  test("ordenarParaLista marca las sesiones no válidas", function () {
    const filas = logica.ordenarParaLista([MATES, DECIMAL]);
    assert.deepStrictEqual(filas.map(function (f) { return f.valida; }), [true, false]);
  });

  test("ordenarParaLista no modifica la lista que recibe", function () {
    const lista = [MATES, LENGUA, FISICA];
    logica.ordenarParaLista(lista);
    assert.deepStrictEqual(lista, [MATES, LENGUA, FISICA]);
  });

  test("textoConfirmarBorrado lleva tema, fecha larga y minutos", function () {
    const sesion = { date: "2026-09-29", topic: "Matemáticas", minutes: 45 };
    assert.strictEqual(logica.textoConfirmarBorrado(sesion),
      "¿Borrar la sesión «Matemáticas» del martes, 29 de septiembre de 2026 (45 min)?");
  });

  test("textoConfirmarBorrarTodas en plural y en singular", function () {
    assert.strictEqual(logica.textoConfirmarBorrarTodas(12),
      "¿Borrar las 12 sesiones? Esta acción no se puede deshacer.");
    assert.strictEqual(logica.textoConfirmarBorrarTodas(2),
      "¿Borrar las 2 sesiones? Esta acción no se puede deshacer.");
    assert.strictEqual(logica.textoConfirmarBorrarTodas(1),
      "¿Borrar la sesión? Esta acción no se puede deshacer.");
  });

  test("nombreAccion incluye la acción, el tema, la fecha larga y los minutos", function () {
    const sesion = { date: "2026-09-29", topic: "Matemáticas", minutes: 45 };
    assert.strictEqual(logica.nombreAccion("Borrar", sesion),
      "Borrar Matemáticas, martes, 29 de septiembre de 2026, 45 min");
    assert.strictEqual(logica.nombreAccion("Editar", sesion),
      "Editar Matemáticas, martes, 29 de septiembre de 2026, 45 min");
  });

  test("posicionFocoTrasBorrar: la siguiente ocupa su lugar; si era la última, la anterior", function () {
    assert.strictEqual(logica.posicionFocoTrasBorrar(1, 3), 1, "fila del medio");
    assert.strictEqual(logica.posicionFocoTrasBorrar(0, 3), 0, "primera fila");
    assert.strictEqual(logica.posicionFocoTrasBorrar(2, 3), 1, "última fila");
    assert.strictEqual(logica.posicionFocoTrasBorrar(0, 1), -1, "única fila");
  });
})();
