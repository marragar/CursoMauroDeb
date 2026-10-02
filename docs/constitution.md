# Constitución — Diario de Estudio
Principios innegociables. Toda spec, plan, tarea y línea de código debe cumplirlos.

1. **Stack mínimo**: solo HTML, CSS y JS puros. Sin dependencias, sin build, sin CDN.
   Funciona abriendo `index.html` con doble clic y sin conexión.
2. **La spec manda**: no se escribe código que no salga de un RF de una spec aprobada.
   Si falta una decisión, se para y se pregunta.
3. **Cambios en orden**: spec → plan → tareas → código, siempre en ese orden.
   Si el código y la spec se contradicen, es un bug.
4. **Lógica pura**: `logica.js` no usa DOM, `localStorage` ni `new Date()` sin
   argumentos. "Hoy" llega siempre como parámetro "AAAA-MM-DD".
5. **Interfaz fina**: `app.js` solo lee y guarda datos, pinta y escucha eventos.
   Ningún cálculo de fechas, rachas o estadísticas vive ahí.
6. **Tests como puerta**: toda función de `logica.js` tiene tests que pasan con
   `node --test` sin instalar nada. Primero el test en rojo; nunca se avanza en rojo.
7. **Fechas locales**: se guardan como "AAAA-MM-DD" en hora local. Prohibido usar
   `toISOString()`, `new Date("AAAA-MM-DD")` y sumar días en milisegundos.
8. **Datos sagrados**: ninguna sesión se borra ni se sobrescribe sin una acción
   explícita del usuario. Los datos corruptos se muestran como vacíos, pero nunca se guarda encima.
9. **Compatibilidad hacia atrás**: la clave `diario-estudio-sesiones` y el formato
   `{ date, topic, minutes }` no cambian. Un campo nuevo es opcional y los datos antiguos se siguen leyendo.
10. **Idioma**: interfaz, comentarios, specs, documentación e identificadores en español.
    Las claves de los datos guardados (`date`, `topic`, `minutes`) no se renombran.
