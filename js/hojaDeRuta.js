document.addEventListener('DOMContentLoaded', function () {
    // Obtener el idUsuario del usuario logueado
    const idUsuario = localStorage.getItem('usuarioLogueado');
    if (!idUsuario) {
        console.error('No hay usuario logueado.');
        window.location.href = '../index.html'; // Redirigir a la página de login si no hay usuario logueado
        return;
    }

    // Obtener el operador logueado desde localStorage
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const operadorLogueado = usuarios.find(u => u.idUsuario === idUsuario);

    if (!operadorLogueado) {
        console.error('No se encontró el usuario logueado.');
        window.location.href = '../index.html'; // Redirigir a la página de login si no se encuentra el usuario
        return;
    }

    console.log('Operador logueado:', operadorLogueado);

    // Actualizar el encabezado con el nombre del operador
    document.getElementById('bienvenidaUsuario').textContent = `Esta es la hoja de ruta de ${operadorLogueado.nombre} ${operadorLogueado.apellido}`;

    // Obtener las órdenes desde localStorage
    const ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];
    console.log('Órdenes disponibles:', ordenes);

    // Filtrar las órdenes para mostrar solo las que corresponden al operador logueado
    const ordenesOperador = ordenes.filter(orden => orden.operador === operadorLogueado.idUsuario);
    console.log('Órdenes del operador:', ordenesOperador);

    // Limpiar las columnas antes de agregar nuevas órdenes
    for (let i = 1; i <= 5; i++) {
        const contenedorTurno = document.getElementById(`turno${i}`);
        if (contenedorTurno) {
            contenedorTurno.innerHTML = '';
        } else {
            console.error(`No se encontró el contenedor para el turno ${i}`);
        }
    }

    // Recorrer las órdenes filtradas y asignarlas a los turnos correspondientes
    ordenesOperador.forEach(orden => {
        const { turno, idOrden, tarea, descripcion, despachante, comentario } = orden;
        console.log(`Orden asignada al turno ${turno}:`, { idOrden, tarea, descripcion, despachante, comentario });

        // Crear una card para la orden
        const card = document.createElement('div');
        card.className = 'card mb-4';
        card.style.width = '18rem';

        card.innerHTML = `
            <div class="card-header">
                Número de orden: ${idOrden}
            </div>
            <div class="card-body">
                <h5 class="card-title">${tarea || 'Sin tarea'}</h5>
                <p class="card-text">${descripcion || 'Sin descripción'}</p>
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item">Asignada por: ${despachante || 'Desconocido'}</li>
                <li class="list-group-item">${comentario || 'Sin comentario'}</li>
            </ul>
            <div class="mb-3">
                <textarea class="form-control" rows="3" placeholder="Comentario..."></textarea>
            </div>
            <div class="card-body">
                <button class="btn btn-secondary btnCumplirOrden">Cumplir</button>
                <button class="btn btn-warning btnReagendar">Reagendar</button>
            </div>
        `;

        // Obtener el contenedor correspondiente al turno y agregar la card
        const contenedorTurno = document.getElementById(`turno${turno}`);
        if (contenedorTurno) {
            contenedorTurno.appendChild(card);
        } else {
            console.error(`No se encontró el contenedor para el turno ${turno}`);
        }
    });

    // Event listener para los botones de "Cumplir"
    document.querySelectorAll('.btnCumplirOrden').forEach(button => {
        button.addEventListener('click', function (event) {
            const card = event.currentTarget.closest('.card');
            const idOrden = card.querySelector('.card-header').textContent.split(': ')[1];
            console.log('ID de la orden para cumplir:', idOrden);
            cumplirOrden(idOrden);
        });
    });

    // Event listener para los botones de "Reagendar"
    document.querySelectorAll('.btnReagendar').forEach(button => {
        button.addEventListener('click', function (event) {
            const card = event.currentTarget.closest('.card');
            const idOrden = card.querySelector('.card-header').textContent.split(': ')[1];
            console.log('ID de la orden para reagendar:', idOrden);
            reagendarOrden(idOrden);
        });
    });

    function cumplirOrden(idOrden) {
        // Obtener las órdenes desde localStorage
        let ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];
        console.log('Órdenes disponibles para cumplir:', ordenes);

        // Buscar la orden con el id proporcionado
        let ordenCumplida = ordenes.find(orden => orden.idOrden === idOrden);
        console.log('Orden encontrada para cumplir:', ordenCumplida);

        if (!ordenCumplida) {
            console.error(`No se encontró la orden con id ${idOrden}`);
            return;
        }

        // Actualizar el estado de la orden a "cumplida"
        ordenes = ordenes.map(orden => {
            if (orden.idOrden === idOrden) {
                return { ...orden, estado: 'cumplida' };
            }
            return orden;
        });

        // Guardar los datos actualizados en localStorage
        localStorage.setItem('ordenes', JSON.stringify(ordenes));

        // Agregar la orden al historial de órdenes cumplidas
        let historialOrdenesCumplidas = JSON.parse(localStorage.getItem('historialOrdenesCumplidas')) || [];
        historialOrdenesCumplidas.push({
            ...ordenCumplida,
            despachante: operadorLogueado.nombre,
            operador: operadorLogueado.idUsuario,
        });
        localStorage.setItem('historialOrdenesCumplidas', JSON.stringify(historialOrdenesCumplidas));
        console.log('Orden cumplida y guardada en historial:', ordenCumplida);

        // Mostrar modal para confirmar el cumplimiento
        $('#modalConfirmarCumplimiento').modal('show');
    }

    function reagendarOrden(idOrden) {
        // Obtener las órdenes desde localStorage
        let ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];
        console.log('Órdenes disponibles para reagendar:', ordenes);

        // Buscar la orden con el id proporcionado
        let ordenReasignada = ordenes.find(orden => orden.idOrden === idOrden);
        console.log('Orden encontrada para reagendar:', ordenReasignada);

        if (!ordenReasignada) {
            console.error(`No se encontró la orden con id ${idOrden}`);
            return;
        }

        // Actualizar el estado de la orden a "reasignada"
        ordenes = ordenes.map(orden => {
            if (orden.idOrden === idOrden) {
                return { ...orden, estado: 'reasignada' };
            }
            return orden;
        });

        // Guardar los datos actualizados en localStorage
        localStorage.setItem('ordenes', JSON.stringify(ordenes));

        // Agregar la orden al historial de órdenes reasignadas
        let historialOrdenesReasignadas = JSON.parse(localStorage.getItem('historialOrdenesReasignadas')) || [];
        historialOrdenesReasignadas.push({
            ...ordenReasignada,
            despachante: operadorLogueado.nombre,
            operador: operadorLogueado.idUsuario,
        });
        localStorage.setItem('historialOrdenesReasignadas', JSON.stringify(historialOrdenesReasignadas));
        console.log('Orden reasignada y guardada en historial:', ordenReasignada);

        // Mostrar modal para actualizar la orden
        $('#modalActualizarOrden').modal('show');
    }
});

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

// Función para cumplir orden
function cumplirOrden(idOrden) {
    // Suponiendo que tienes un array de órdenes disponibles
    const ordenesDisponibles = JSON.parse(localStorage.getItem('ordenesAsignadas')) || [];
    const orden = ordenesDisponibles.find(o => o.idOrden === idOrden);

    if (orden) {
        console.log('Orden encontrada:', orden);

        // Actualizar estado de la orden a 'cumplida'
        orden.estado = 'cumplida';

        // Guardar en historial
        const historialOrdenesCumplidas = JSON.parse(localStorage.getItem('historialOrdenesCumplidas')) || [];
        historialOrdenesCumplidas.push({
            ...orden,
            operador: operador.nombre + ' ' + operador.apellido,
            fechaCumplimiento: new Date().toISOString()
        });

        localStorage.setItem('historialOrdenesCumplidas', JSON.stringify(historialOrdenesCumplidas));
        console.log('Historial de órdenes cumplidas actualizado:', historialOrdenesCumplidas);
    } else {
        console.error('No se encontró la orden con id', idOrden);
    }
}

// Asociar función al botón para cumplir orden
document.getElementById('btnCumplirOrden').addEventListener('click', () => cumplirOrden(1));

// Función para reagendar orden
function reagendarOrden(idOrden, nuevoTurno) {
    const ordenesDisponibles = JSON.parse(localStorage.getItem('ordenesAsignadas')) || [];
    const orden = ordenesDisponibles.find(o => o.idOrden === idOrden);

    if (orden) {
        console.log('Orden encontrada para reagendar:', orden);

        // Actualizar estado de la orden a 'reasignada' y cambiar turno
        orden.estado = 'reasignada';
        orden.turno = nuevoTurno;

        // Guardar en historial de reasignaciones
        const historialOrdenesReasignadas = JSON.parse(localStorage.getItem('historialOrdenesReasignadas')) || [];
        historialOrdenesReasignadas.push({
            ...orden,
            operador: operador.nombre + ' ' + operador.apellido,
            fechaReasignacion: new Date().toISOString()
        });

        localStorage.setItem('historialOrdenesReasignadas', JSON.stringify(historialOrdenesReasignadas));
        console.log('Historial de órdenes reasignadas actualizado:', historialOrdenesReasignadas);
    } else {
        console.error('No se encontró la orden con id', idOrden);
    }
}

// Asociar función al botón para reagendar orden
document.getElementById('btnReagendarOrden').addEventListener('click', () => {
    const nuevoTurno = parseInt(document.getElementById('selectNuevoTurno').value); // Turno nuevo seleccionado
    reagendarOrden(1, nuevoTurno); // Reemplaza 1 con el ID de la orden a reagendar
});
*/