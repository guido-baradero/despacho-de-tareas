document.addEventListener('DOMContentLoaded', () => {
    // Obtener el idUsuario del despachante logueado
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

    // Referencias a los elementos del DOM
    const selectOperador = document.getElementById('operador');
    const selectTarea = document.getElementById('tarea');
    const turnos = document.getElementById('turnos');
    const btnAsignarNuevaOrden = document.getElementById('btnAsignarNuevaOrden');
    const btnCancelarNuevaOrden = document.getElementById('btnCancelarNuevaOrden');

    // Variables para almacenar los datos cargados
    let operadoresDisponibles = [];
    let idOrdenCounter = 1; // Contador para IDs de órdenes
    let nuevaOrden = null; // Inicialmente es null
    let operadorSeleccionado = null; // Definir operadorSeleccionado

    // Inicializa los operadores disponibles
    operadoresDisponibles = usuarios.filter(usuario => usuario.alcance === 'operador' && usuario.disponible);
    idOrdenCounter = ordenes.length + 1; // Inicializar el contador de ID con base en la cantidad de órdenes existentes

    // Cargar opciones
    cargarOpciones();

    function cargarOpciones() {
        // Limpiar selectores antes de agregar nuevas opciones
        selectOperador.innerHTML = '';
        selectTarea.innerHTML = '';

        // Renderizar operadores
        operadoresDisponibles.forEach(operador => {
            const option = document.createElement('option');
            option.value = operador.idUsuario;
            option.textContent = `${operador.nombre} ${operador.apellido}`;
            selectOperador.appendChild(option);
        });

        // Renderizar tareas
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
            despachante: `${despachanteLogueado.nombre} ${despachanteLogueado.apellido}`, // Nombre del despachante actual
            estado: 'asignada',
            comentarioDespacho: '',
            comentarioOperador: ''
        };
    }

    function manejarCambioOperador() {
        if (!nuevaOrden) {
            inicializarNuevaOrden();
        }
        const operadorSeleccionadoId = selectOperador.value;
        operadorSeleccionado = operadoresDisponibles.find(op => op.idUsuario === operadorSeleccionadoId); // Actualizar operadorSeleccionado
        if (operadorSeleccionado) {
            console.log('Operador seleccionado:', operadorSeleccionado);
            nuevaOrden.operador = operadorSeleccionadoId;
            actualizarTurnos(operadorSeleccionado);
        } else {
            console.log('Operador no encontrado');
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
            console.log('Tarea no encontrada');
        }
    }

    function convertirTurnosAArray(turnos) {
        if (Array.isArray(turnos)) {
            // Si ya es un array, no hacemos nada
            return turnos;
        } else if (typeof turnos === 'object') {
            // Si es un objeto, convertimos sus valores en un array
            return Object.values(turnos);
        } else {
            // Si no es un array ni un objeto, devolvemos un array vacío como fallback
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

        // Verificar que `operadorSeleccionado` y `operadorSeleccionado.hojaDeRuta` estén definidos
        if (!operadorSeleccionado || !operadorSeleccionado.hojaDeRuta || !Array.isArray(operadorSeleccionado.hojaDeRuta.turnos)) {
            console.error('El operador seleccionado o la hoja de ruta no están definidos correctamente');
            return;
        }

        // Asegurarse de que 'hojaDeRuta.turnos' sea un array
        operadorSeleccionado.hojaDeRuta.turnos = Array.isArray(operadorSeleccionado.hojaDeRuta.turnos) ? operadorSeleccionado.hojaDeRuta.turnos : Object.values(operadorSeleccionado.hojaDeRuta.turnos);

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

        // Asegúrate de que `operadorSeleccionado.hojaDeRuta.turnos` sea un array
        operadorSeleccionado.hojaDeRuta.turnos = convertirTurnosAArray(operadorSeleccionado.hojaDeRuta.turnos);

        if (nuevaOrden && nuevaOrden.operador && nuevaOrden.tarea.length && nuevaOrden.turno) {
            nuevaOrden.idOrden = idOrdenCounter++;
            ordenes.push(nuevaOrden);
            console.log('Nueva orden asignada:', nuevaOrden);

            // Actualizar el perfil del operador
            let operador = usuarios.find(op => op.idUsuario === nuevaOrden.operador);
            if (operador) {
                // Marcar el turno como ocupado
                operador.hojaDeRuta.turnos[nuevaOrden.turno] = 'ocupado';
                operador.disponible = operador.hojaDeRuta.turnos.some(turno => turno === 'libre');
            }

            // Guardar cambios en localStorage
            localStorage.setItem('ordenes', JSON.stringify(ordenes));
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            nuevaOrden = null; // Resetea nuevaOrden después de asignarla
        } else {
            console.log('Faltan datos para asignar la orden');
        }
    }

    function cancelarNuevaOrden() {
        if (nuevaOrden) {
            console.log('Orden cancelada:', nuevaOrden);
            nuevaOrden = null; // Resetea nuevaOrden cuando se cancela
        }
    }

    // Función para actualizar los turnos disponibles en la interfaz
    function actualizarTurnos(operador) {
        console.log('Turnos del operador:', operador.hojaDeRuta.turnos);
        const botonesTurnos = document.querySelectorAll('#turnos .btn');
        botonesTurnos.forEach(boton => {
            const turno = `turno${boton.dataset.turno}`; // Construye la clave del turno (ej. "turno1", "turno2")
            const estadoTurno = operador.hojaDeRuta.turnos[turno]; // Accede al estado del turno correspondiente
            if (estadoTurno === 'libre') {
                boton.classList.remove('btn-danger'); // Elimina clase de color rojo si estaba ocupada
                boton.classList.add('btn-outline-primary'); // Añade la clase azul para indicar disponibilidad
            } else {
                boton.classList.remove('btn-outline-primary'); // Elimina clase de color azul
                boton.classList.add('btn-danger'); // Añade la clase roja para indicar que está ocupado
            }
        });
    }

    //Función para filtrar las ordenes por estado
    document.getElementById('btnReasignadas').addEventListener('click', function () {
        mostrarOrdenesPorEstado('reasignada');
    });

    document.getElementById('btnAsignadas').addEventListener('click', function () {
        mostrarOrdenesPorEstado('asignada');
    });

    document.getElementById('btnCumplidas').addEventListener('click', function () {
        mostrarOrdenesPorEstado('cumplida');
    });

    document.getElementById('btnCanceladas').addEventListener('click', function () {
        mostrarOrdenesPorEstado('cancelada');
    });

    function mostrarOrdenesPorEstado(estado) {
        // Suponiendo que las órdenes están almacenadas en localStorage como un array de objetos
        let ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];

        // Filtrar órdenes por estado
        let ordenesFiltradas = ordenes.filter(orden => orden.estado === estado);

        // Limpiar el contenido anterior de la tabla
        let ordenesBody = document.getElementById('ordenesBody');
        if (ordenesBody) {
            ordenesBody.innerHTML = '';

            // Insertar las filas correspondientes
            ordenesFiltradas.forEach(orden => {
                let fila = `
                    <tr>
                        <th scope="row">${orden.idOrden}</th>
                        <td>${orden.descripcion}</td>
                        <td>${orden.operador}</td>
                        <td>${orden.estado}</td>
                        <td><button class="btn btn-primary">Ver Detalles</button></td>
                    </tr>
                `;
                ordenesBody.innerHTML += fila;
            });
        } else {
            console.error('No se encontró el contenedor de la tabla de órdenes');
        }
    }

    // Asignar manejadores de eventos
    selectOperador.addEventListener('change', manejarCambioOperador);
    selectTarea.addEventListener('change', manejarCambioTarea);
    turnos.addEventListener('click', manejarCambioTurno);
    btnAsignarNuevaOrden.addEventListener('click', asignarNuevaOrden);
    btnCancelarNuevaOrden.addEventListener('click', cancelarNuevaOrden);
});