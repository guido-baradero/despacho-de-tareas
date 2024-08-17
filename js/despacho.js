/*
// Cargar operador desde localStorage
const operador = JSON.parse(localStorage.getItem('operador'));
console.log('Operador logueado:', operador);

// Convertir turnos a array si es necesario
if (operador.hojaDeRuta && typeof operador.hojaDeRuta.turnos === 'object') {
    operador.hojaDeRuta.turnos = Object.keys(operador.hojaDeRuta.turnos).map(key => ({
        turno: parseInt(key.replace('turno', '')),
        estado: operador.hojaDeRuta.turnos[key]
    }));
}
console.log('Turnos del operador:', operador.hojaDeRuta.turnos);

// Asignar nueva orden
function asignarNuevaOrden() {
    const turnoSeleccionado = parseInt(document.getElementById('selectTurno').value); // Valor del turno seleccionado
    const tareaSeleccionada = JSON.parse(document.getElementById('tareaSeleccionada').value); // Tarea seleccionada (deberías definir esto según tu aplicación)

    console.log('Turno seleccionado:', turnoSeleccionado);
    console.log('Tarea seleccionada:', tareaSeleccionada);

    const turnoDisponible = operador.hojaDeRuta.turnos.find(turno => turno.turno === turnoSeleccionado);

    if (turnoDisponible && turnoDisponible.estado === 'libre') {
        console.log('Turno disponible encontrado:', turnoDisponible);

        // Crear nueva orden
        const nuevaOrden = {
            idOrden: Date.now(), // Generar ID único
            tarea: tareaSeleccionada.idTarea,
            operador: operador.idUsuario,
            turno: turnoSeleccionado,
            despachante: 'José Sánchez', // Ejemplo de despachante
            estado: 'asignada'
        };

        console.log('Nueva orden asignada:', nuevaOrden);

        // Aquí podrías guardar la orden en localStorage o enviarla al servidor
        const ordenesAsignadas = JSON.parse(localStorage.getItem('ordenesAsignadas')) || [];
        ordenesAsignadas.push(nuevaOrden);
        localStorage.setItem('ordenesAsignadas', JSON.stringify(ordenesAsignadas));
        console.log('Órdenes asignadas actualizadas:', ordenesAsignadas);
    } else {
        console.error('El turno seleccionado no está disponible.');
    }
}

// Asociar función al botón
document.getElementById('btnAsignarOrden').addEventListener('click', asignarNuevaOrden);







*/
document.addEventListener('DOMContentLoaded', function () {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];
    const despachanteLogueado = usuarios.find(u => u.idUsuario === localStorage.getItem('usuarioLogueado'));

    // Listado de usuarios
    console.table(usuarios);
    console.log("Usuarios cargados desde localStorage.");

    if (!despachanteLogueado) {
        console.error('No se encontró el usuario logueado.');
        window.location.href = '../index.html';
        return;
    }

    // Listado de ordenes antes de asignar
    console.table(ordenes);
    console.log("Órdenes cargadas antes de asignar.");
    /*
        document.getElementById('btnCrearOrden').addEventListener('click', function () {
            const idOrden = generarIdOrden();
            const operador = document.getElementById('selectOperador').value;
            const tarea = document.getElementById('tarea').value;
            const descripcion = document.getElementById('descripcion').value;
            const comentario = document.getElementById('comentario').value;
            const turno = document.getElementById('selectTurno').value;
    
            const nuevaOrden = {
                idOrden,
                operador,
                tarea,
                descripcion,
                despachante: `${despachanteLogueado.nombre} ${despachanteLogueado.apellido}`,
                comentario,
                turno,
                estadoDeHoja: 'disponible'
            };
    
            ordenes.push(nuevaOrden);
            localStorage.setItem('ordenes', JSON.stringify(ordenes));
    
            // Listado de ordenes después de asignar
            console.table(ordenes);
            console.log("Nueva orden creada y guardada en localStorage.");
    
            window.location.reload();
        });
    */
    const operadoresDisponibles = usuarios.filter(u => u.alcance === 'Operador' && u.disponible);

    // Listado de operadores disponibles
    console.table(operadoresDisponibles);
    console.log("Operadores disponibles cargados para asignación.");

    const selectOperador = document.getElementById('selectOperador');
    operadoresDisponibles.forEach(op => {
        const option = document.createElement('option');
        option.value = op.idUsuario;
        option.textContent = `${op.nombre} ${op.apellido}`;
        selectOperador.appendChild(option);
    });
});

function generarIdOrden() {
    let id = JSON.parse(localStorage.getItem('ordenes'))?.length + 1 || 1;
    return `ORD-${id.toString().padStart(4, '0')}`;
}





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
        const operador = operadoresDisponibles.find(op => op.idUsuario === operadorSeleccionadoId);
        if (operador) {
            console.log('Operador seleccionado:', operador);
            nuevaOrden.operador = operadorSeleccionadoId;
            actualizarTurnos(operador);
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

    function manejarCambioTurno(event) {
        if (!nuevaOrden) {
            inicializarNuevaOrden();
        }
        const botonClickeado = event.target;
        const turnoSeleccionado = botonClickeado.getAttribute('data-turno');
        // Verifica si el turno está libre antes de asignarlo
        if (botonClickeado.classList.contains('btn-outline-primary')) {
            nuevaOrden.turno = turnoSeleccionado;
            console.log('Turno seleccionado:', turnoSeleccionado);
            // Marcar el turno como ocupado en la interfaz
            botonClickeado.innerHTML = 'Turno: ' + turnoSeleccionado;
            botonClickeado.classList.remove('btn-outline-primary');
            botonClickeado.classList.add('btn-danger');
        } else {
            console.log('Este turno ya está ocupado, no se puede seleccionar');
        }
    }

    function asignarNuevaOrden() {
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

    // Asignar manejadores de eventos
    selectOperador.addEventListener('change', manejarCambioOperador);
    selectTarea.addEventListener('change', manejarCambioTarea);
    turnos.addEventListener('click', manejarCambioTurno);
    btnAsignarNuevaOrden.addEventListener('click', asignarNuevaOrden);
    btnCancelarNuevaOrden.addEventListener('click', cancelarNuevaOrden);
});