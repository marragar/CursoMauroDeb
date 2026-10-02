# Memoria del proyecto — Diario de Estudio

## Estado
- **Constitución**: reescrita y aprobada (2026-10-02). 10 principios en `docs/constitution.md`.
- **Spec 001 — Mapa de calor** (`docs/specs/001-heat-map/`): implementada y verificada (2026-10-02).
- **Spec 002 — Editar y borrar sesiones** (`docs/specs/002-editar-borrar-sesiones/`): spec aprobada (2026-10-02). Plan y tareas aprobados. T1–T9 implementadas (2026-10-02). 88 tests en verde y 48 comprobaciones en Chrome headless. Falta T10: repaso a mano y cerrar la spec. Alcance reducido: editar y borrar una sesión, y borrar todas. La selección múltiple y las acciones desde el mapa quedan para una spec futura.

## Decisiones
- Spec 002: las sesiones no tienen `id`. Se identifican por su posición más una copia de su contenido, y cada escritura relee `localStorage` antes de guardar. La confirmación es un `<dialog>` propio.
- Todos los botones tienen `min-height: 44px` en el estilo base, incluido «Guardar sesión».
- Spec 002: el borrado se confirma antes de hacerse (no hay deshacer). La edición se hace en la propia fila y, si un dato no es válido, se avisa junto a la fila. Quedan fuera el historial de cambios y la robustez ante datos corruptos.
- Los identificadores del código van en español, igual que el código actual. Las claves de los datos guardados (`date`, `topic`, `minutes`) se quedan en inglés por compatibilidad.

## Pendiente
- `specs/001-nombre_spec/` se borró (2026-10-02): eran 3 archivos vacíos de plantilla. Las specs viven en `docs/specs/`.
- Queda `specs/002_nombre-spec/`, una carpeta vacía. Hay que decidir si se borra.
- No existe `AGENTS.md`.
- Riesgo conocido: la lista falla si hay una sesión guardada con una fecha que no existe (`fechaBonita`). Va a la futura spec de robustez ante datos corruptos.

## Siguiente paso
- T10 de la spec 002: repaso visual a mano (Tab, alto contraste, guardar sin cambios). Después, marcar los criterios de finalización y poner la spec en «implementada».
