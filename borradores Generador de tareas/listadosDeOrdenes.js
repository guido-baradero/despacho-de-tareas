// Ejemplo de listado de órdenes
const listadoOrdenes = [
    {
        idOrden: '001',
        tarea: ['Reparar motor', 'Cambiar aceite'],
        operador: 'Juan Pérez',
        turno: { turno1: 'libre', turno2: 'ocupado', turno3: 'libre', turno4: 'libre', turno5: 'libre' },
        despachante: 'Carlos Sánchez',
        estado: 'asignada',
        comentarioDespacho: 'Urgente',
        comentarioOperador: 'Pendiente de repuestos'
    },
    {
        idOrden: '002',
        tarea: ['Inspección de seguridad', 'Limpieza de equipo'],
        operador: 'María López',
        turno: { turno1: 'ocupado', turno2: 'ocupado', turno3: 'libre', turno4: 'libre', turno5: 'libre' },
        despachante: 'Carlos Sánchez',
        estado: 'reasignada',
        comentarioDespacho: 'Cambio de prioridad',
        comentarioOperador: 'Requiere autorización'
    },
    {
        idOrden: '003',
        tarea: ['Mantenimiento de sistemas', 'Actualización de software'],
        operador: 'Luis Gómez',
        turno: { turno1: 'libre', turno2: 'ocupado', turno3: 'ocupado', turno4: 'libre', turno5: 'libre' },
        despachante: 'Ana Rodríguez',
        estado: 'cumplida',
        comentarioDespacho: 'Prioridad media',
        comentarioOperador: 'Tarea completada sin inconvenientes'
    },
    {
        idOrden: '004',
        tarea: ['Revisión de circuitos', 'Sustitución de cables'],
        operador: 'Carlos Ortega',
        turno: { turno1: 'ocupado', turno2: 'libre', turno3: 'libre', turno4: 'libre', turno5: 'libre' },
        despachante: 'Ana Rodríguez',
        estado: 'cancelada',
        comentarioDespacho: 'Trabajo no requerido',
        comentarioOperador: 'Orden cancelada por cliente'
    },
    {
        idOrden: '001',
        tarea: ['Reparar motor', 'Cambiar aceite'],
        operador: 'Juan Pérez',
        turno: { turno1: 'libre', turno2: 'ocupado', turno3: 'libre', turno4: 'libre', turno5: 'libre' },
        despachante: 'Carlos Sánchez',
        estado: 'asignada',
        comentarioDespacho: 'Urgente',
        comentarioOperador: 'Pendiente de repuestos'
    },
    {
        idOrden: '002',
        tarea: ['Inspección de seguridad', 'Limpieza de equipo'],
        operador: 'María López',
        turno: { turno1: 'ocupado', turno2: 'ocupado', turno3: 'libre', turno4: 'libre', turno5: 'libre' },
        despachante: 'Carlos Sánchez',
        estado: 'reasignada',
        comentarioDespacho: 'Cambio de prioridad',
        comentarioOperador: 'Requiere autorización'
    },
    {
        idOrden: '003',
        tarea: ['Mantenimiento de sistemas', 'Actualización de software'],
        operador: 'Luis Gómez',
        turno: { turno1: 'libre', turno2: 'ocupado', turno3: 'ocupado', turno4: 'libre', turno5: 'libre' },
        despachante: 'Ana Rodríguez',
        estado: 'cumplida',
        comentarioDespacho: 'Prioridad media',
        comentarioOperador: 'Tarea completada sin inconvenientes'
    },
    {
        idOrden: '004',
        tarea: ['Revisión de circuitos', 'Sustitución de cables'],
        operador: 'Carlos Ortega',
        turno: { turno1: 'ocupado', turno2: 'libre', turno3: 'libre', turno4: 'libre', turno5: 'libre' },
        despachante: 'Ana Rodríguez',
        estado: 'cancelada',
        comentarioDespacho: 'Trabajo no requerido',
        comentarioOperador: 'Orden cancelada por cliente'
    }
];




// Función para filtrar y mostrar órdenes según el estado
function mostrarOrdenesPorEstado(estado) {
    const ordenesFiltradas = listadoOrdenes.filter(orden => orden.estado === estado);

    // Obtener el tbody donde se mostrarán las órdenes
    const tbody = document.getElementById('ordenes-tbody');
    tbody.innerHTML = ''; // Limpiar el contenido existente

    // Insertar cada orden filtrada como una fila en la tabla
    ordenesFiltradas.forEach(orden => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${orden.idOrden}</th>
            <td>${orden.tarea.join(', ')}</td>
            <td>${orden.despachante}</td>
            <td>${orden.operador}</td>
        `;
        tbody.appendChild(row);
    });
}

// Asignar eventos a los botones
document.getElementById('btnReasignadas').addEventListener('click', () => {
    mostrarOrdenesPorEstado('reasignada');
});

document.getElementById('btnAsignadas').addEventListener('click', () => {
    mostrarOrdenesPorEstado('asignada');
});

document.getElementById('btnCumplidas').addEventListener('click', () => {
    mostrarOrdenesPorEstado('cumplida');
});

document.getElementById('btnCanceladas').addEventListener('click', () => {
    mostrarOrdenesPorEstado('cancelada');
});






// Ejemplo de cómo mostrar las órdenes de diferentes estados
mostrarOrdenesPorEstado('asignada');
mostrarOrdenesPorEstado('reasignada');
mostrarOrdenesPorEstado('cumplida');
mostrarOrdenesPorEstado('cancelada');
