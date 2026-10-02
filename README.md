# Diario de Estudio

Aplicación web sencilla para registrar sesiones de estudio y ver tu constancia: racha de
días seguidos, días estudiados en el mes y un mapa de calor de las últimas 12 semanas.

Proyecto del **Curso de Desarrollo con IA**, construido con *Spec-Driven Development*
(SDD) y Claude Code: cada funcionalidad empieza por una spec, pasa por un plan y unas
tareas, y solo después se escribe el código.

## Funcionalidades

- **Registrar sesiones** con fecha, tema y minutos.
- **Racha** de días seguidos estudiando y **días estudiados este mes**.
- **Mapa de calor** de las últimas 12 semanas (lunes a domingo), con cinco niveles de
  intensidad según los minutos y navegable con teclado.
- **Editar y borrar** una sesión desde la lista, o borrar todas, siempre con confirmación.
- Los datos se guardan en el navegador (`localStorage`); no hay servidor ni cuentas.

## Cómo usarla

No hay que instalar nada: abre `index.html` con doble clic. Funciona sin conexión.

## Tests

La lógica (`logica.js`) tiene tests que se ejecutan con Node, sin dependencias:

```bash
node --test
```

También puedes abrir `tests.html` en el navegador para pasar los mismos tests.

## Estructura

```
index.html          Página de la aplicación
styles.css          Estilos
app.js              Interfaz: lee y guarda datos, pinta y escucha eventos
logica.js           Lógica pura: fechas, racha, mapa, validaciones (sin DOM ni localStorage)
logica.test.js      Tests de logica.js (node --test)
tests.html          Los mismos tests en el navegador
docs/constitution.md  Principios innegociables del proyecto
docs/specs/         Specs, planes y tareas de cada funcionalidad
specs/              Specs en curso
MEMORY.md           Estado del proyecto y decisiones tomadas
.claude/            Agentes, comandos y skills de Claude Code para el flujo SDD
Apuntes/            Apuntes del curso (PDF)
```

## Principios

Resumen de [`docs/constitution.md`](docs/constitution.md):

1. Solo HTML, CSS y JS puros: sin dependencias, sin build, sin CDN.
2. No se escribe código que no salga de una spec aprobada.
3. Siempre en orden: spec → plan → tareas → código.
4. `logica.js` es pura: "hoy" llega siempre como parámetro `"AAAA-MM-DD"`.
5. `app.js` es una capa fina, sin cálculos.
6. Toda función de la lógica tiene tests; nunca se avanza con tests en rojo.
7. Fechas siempre en hora local (nada de `toISOString()` ni sumar milisegundos).
8. Ningún dato se borra ni se sobrescribe sin una acción explícita del usuario.
9. Compatibilidad hacia atrás: la clave `diario-estudio-sesiones` y el formato
   `{ date, topic, minutes }` no cambian.
10. Todo en español, salvo las claves de los datos guardados.

## Flujo de trabajo (SDD)

Las funcionalidades se desarrollan con los comandos y agentes de `.claude/`:

| Paso | Comando | Agente |
|---|---|---|
| Redactar la spec | `/sdd-spec` | `planner` |
| Revisarla como QA | `/sdd-clarify` | `reviewer` |
| Plan técnico y tareas | `/sdd-plan` | `planner` |
| Implementar una tarea | `/sdd-implement` | `implementer` |
| Validar RF por RF | `/sdd-validate` | `reviewer` |

Con `claude --agent coordinator` se puede lanzar el flujo completo, que delega en los tres
agentes y se detiene para pedir aprobación tras la spec y tras el plan.

### Specs

| Nº | Funcionalidad | Estado |
|---|---|---|
| [001](docs/specs/001-heat-map/spec.md) | Mapa de calor | Implementada |
| [002](docs/specs/002-editar-borrar-sesiones/spec.md) | Editar y borrar sesiones | En cierre |
| [003](specs/003-objetivo-semanal/spec.md) | Objetivo semanal de estudio | Borrador |
