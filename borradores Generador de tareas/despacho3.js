document.addEventListener('DOMContentLoaded', () => {
    const idUsuario = localStorage.getItem('usuarioLogueado');
    if (!idUsuario) {
        console.error('No se encontró el usuario logueado.');
        window.location.href = '../index.html'; // Redirigir a la página de login si no se encuentra el usuario
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
    let ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];
    const despachanteLogueado = usuarios.find(u => u.idUsuario === idUsuario);
    if (!despachanteLogueado || despachanteLogueado.alcance.toLowerCase() !== 'despachante') {
        console.error('No se encontró el despachante logueado o el usuario no tiene el rol adecuado.');
        window.location.href = '../index.html'; // Redirigir a la página de login si no se encuentra el despachante o el rol es incorrecto
        return;
    }

    const selectOperador = document.getElementById('operador');
    const selectTarea = document.getElementById('tarea');
    const turnos = document.getElementById('turnos');
    const btnAsignarNuevaOrden = document.getElementById('btnAsignarNuevaOrden');
    const btnCancelarNuevaOrden = document.getElementById('btnCancelarNuevaOrden');

    let operadoresDisponibles = [];
    let idOrdenCounter = 1; // Contador para IDs de órdenes
    let nuevaOrden = null; // Inicialmente es null
    let operadorSeleccionado = null; // Definir operadorSeleccionado

    operadoresDisponibles = usuarios.filter(usuario => usuario.alcance === 'operador' && usuario.disponible);
    idOrdenCounter = ordenes.length + 1; // Inicializar el contador de ID con base en la cantidad de órdenes existentes

    cargarOpciones();

    function cargarOpciones() {
        selectOperador.innerHTML = '';
        selectTarea.innerHTML = '';

        operadoresDisponibles.forEach(operador => {
            const option = document.createElement('option');
            option.value = operador.idUsuario;
            option.textContent = `${operador.nombre} ${operador.apellido}`;
            selectOperador.appendChild(option);
        });

        tareas.forEach(tarea => {
            const option = document.createElement('option');
            option.value = tarea.idTarea;
            option.textContent = tarea.titulo;
            selectTarea.appendChild(option);
        });
    }

    function inicializarNuevaOrden() {
        nuevaOrden = {
            idOrden: null,
            tarea: [],
            operador: null,
            turno: null,
            despachante: `${despachanteLogueado.nombre} ${despachanteLogueado.apellido}`,
            estado: 'asignada',
            comentarioDespacho: '',
            comentarioOperador: ''
        };
        console.log('Nueva orden inicializada:', nuevaOrden);
    }

    function manejarCambioOperador() {
        if (!nuevaOrden) {
            inicializarNuevaOrden();
        }
        const operadorSeleccionadoId = selectOperador.value;
        operadorSeleccionado = operadoresDisponibles.find(op => op.idUsuario === operadorSeleccionadoId);
        if (operadorSeleccionado) {
            console.log('Operador seleccionado:', operadorSeleccionado);
            nuevaOrden.operador = operadorSeleccionadoId;
            actualizarTurnos(operadorSeleccionado);
        } else {
            console.error('Operador no encontrado');
        }
    }

    function manejarCambioTarea() {
        if (!nuevaOrden) {
            inicializarNuevaOrden();
        }
        const tareaSeleccionadaId = selectTarea.value;
        const tarea = tareas.find(tarea => tarea.idTarea === tareaSeleccionadaId);
        if (tarea) {
            console.log('Tarea seleccionada:', tarea);
            nuevaOrden.tarea = tareaSeleccionadaId;
        } else {
            console.error('Tarea no encontrada');
        }
    }

    function convertirTurnosAArray(turnos) {
        if (Array.isArray(turnos)) {
            return turnos;
        } else if (typeof turnos === 'object') {
            console.log('Convertiendo objeto a array:', turnos);
            return Object.values(turnos);
        } else {
            console.error("Formato de turnos no reconocido:", turnos);
            return [];
        }
    }

    function manejarCambioTurno(event) {
        if (!nuevaOrden) {
            inicializarNuevaOrden();
        }
        const botonClickeado = event.target;
        const turnoSeleccionado = botonClickeado.getAttribute('data-turno');
        console.log('Turno clickeado:', turnoSeleccionado);

        if (!operadorSeleccionado || !operadorSeleccionado.hojaDeRuta) {
            console.error('El operador seleccionado o la hoja de ruta no están definidos correctamente');
            return;
        }

        console.log('Hoja de ruta del operador:', operadorSeleccionado.hojaDeRuta);
        operadorSeleccionado.hojaDeRuta.turnos = convertirTurnosAArray(operadorSeleccionado.hojaDeRuta.turnos);

        if (botonClickeado.classList.contains('btn-outline-primary')) {
            nuevaOrden.turno = turnoSeleccionado;
            console.log('Turno seleccionado:', turnoSeleccionado);
            botonClickeado.classList.remove('btn-outline-primary');
            botonClickeado.classList.add('btn-primary');
        } else {
            nuevaOrden.turno = null;
            botonClickeado.classList.remove('btn-primary');
            botonClickeado.classList.add('btn-outline-primary');
        }
    }

    function asignarNuevaOrden() {
        if (!operadorSeleccionado) {
            console.error('No hay operador seleccionado');
            return;
        }

        operadorSeleccionado.hojaDeRuta.turnos = convertirTurnosAArray(operadorSeleccionado.hojaDeRuta.turnos);

        if (nuevaOrden && nuevaOrden.operador && nuevaOrden.tarea.length && nuevaOrden.turno) {
            nuevaOrden.idOrden = idOrdenCounter++;
            ordenes.push(nuevaOrden);
            console.log('Nueva orden asignada:', nuevaOrden);

            let operador = usuarios.find(op => op.idUsuario === nuevaOrden.operador);
            if (operador) {
                operador.hojaDeRuta.turnos[nuevaOrden.turno] = 'ocupado';
                operador.disponible = operador.hojaDeRuta.turnos.some(turno => turno === 'libre');
                console.log('Perfil del operador actualizado:', operador);
            } else {
                console.error('Operador no encontrado para actualizar');
            }

            localStorage.setItem('ordenes', JSON.stringify(ordenes));
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            // Llama a la función para mostrar todas las órdenes asignadas
            mostrarOrdenesAsignadas();
            nuevaOrden = null;
        } else {
            console.error('Faltan datos para asignar la orden');
        }
    }

    function mostrarOrdenesAsignadas() {
        // Filtra las órdenes que están en estado 'asignada'
        const ordenesAsignadas = ordenes.filter(orden => orden.estado === 'asignada');
        console.log('Ordenes en estado asignadas:', ordenesAsignadas);
    }

    function cancelarNuevaOrden() {
        if (nuevaOrden) {
            console.log('Orden cancelada:', nuevaOrden);
            nuevaOrden = null;
        }
    }

    function actualizarTurnos(operador) {
        console.log('Turnos del operador:', operador.hojaDeRuta.turnos);
        const botonesTurnos = document.querySelectorAll('#turnos .btn');
        botonesTurnos.forEach(boton => {
            const turno = boton.dataset.turno;
            const estadoTurno = operador.hojaDeRuta.turnos[turno];
            console.log(`Estado del turno ${turno}:`, estadoTurno);
            if (estadoTurno === 'libre') {
                boton.classList.remove('btn-danger');
                boton.classList.add('btn-outline-primary');
            } else {
                boton.classList.remove('btn-outline-primary');
                boton.classList.add('btn-danger');
            }
        });
    }

    function inicializarFormulario() {
        inicializarNuevaOrden();
        selectOperador.addEventListener('change', manejarCambioOperador);
        selectTarea.addEventListener('change', manejarCambioTarea);
        turnos.addEventListener('click', manejarCambioTurno);
        btnAsignarNuevaOrden.addEventListener('click', asignarNuevaOrden);
        btnCancelarNuevaOrden.addEventListener('click', cancelarNuevaOrden);
    }

    // Función para filtrar y mostrar órdenes según el estado
    function mostrarOrdenesPorEstado(estado) {
        // Filtra las órdenes por el estado proporcionado
        const ordenesFiltradas = listadoOrdenes.filter(orden => orden.estado === estado);
        console.log(`Órdenes en estado ${estado}:`, ordenesFiltradas);

        // Obtener el tbody donde se mostrarán las órdenes
        const tbody = document.getElementById('ordenes-tbody');
        tbody.innerHTML = ''; // Limpiar el contenido existente

        // Insertar cada orden filtrada como una fila en la tabla
        ordenesFiltradas.forEach(orden => {
            const row = document.createElement('tr');

            // Asegúrate de que 'tarea' sea un array, si no lo es, conviértelo o maneja el caso
            const tareas = Array.isArray(orden.tarea) ? orden.tarea.join(', ') : 'No disponible';

            row.innerHTML = `
            <th scope="row">${orden.idOrden}</th>
            <td>${tareas}</td>
            <td>${orden.despachante}</td>
            <td>${orden.operador}</td>
        `;
            tbody.appendChild(row);
        });
    }

    // Cargar las órdenes desde localStorage al inicio
    let listadoOrdenes = JSON.parse(localStorage.getItem('ordenes')) || [];
    console.log('Listado de órdenes cargadas:', listadoOrdenes);

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
    inicializarFormulario();
    mostrarOrdenesPorEstado('asignada');
    mostrarOrdenesPorEstado('reasignada');
    mostrarOrdenesPorEstado('cumplida');
    mostrarOrdenesPorEstado('cancelada');
});