document.addEventListener('DOMContentLoaded', function () {
    const idUsuario = localStorage.getItem('usuarioLogueado');
    if (!idUsuario) {
        console.error('No hay usuario logueado.');
        window.location.href = '../index.html';
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const operadorLogueado = usuarios.find(u => u.idUsuario === idUsuario);
    if (!operadorLogueado) {
        console.error('No se encontró el usuario logueado.');
        window.location.href = '../index.html';
        return;
    }

    document.getElementById('bienvenidaUsuario').textContent = `Esta es la hoja de ruta de ${operadorLogueado.nombre} ${operadorLogueado.apellido}`;
    const ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];
    const ordenesOperador = ordenes.filter(orden => orden.operador === operadorLogueado.idUsuario);

    for (let i = 1; i <= 5; i++) {
        const contenedorTurno = document.getElementById(`turno${i}`);
        if (contenedorTurno) {
            contenedorTurno.innerHTML = '';
        } else {
            console.error(`No se encontró el contenedor para el turno ${i}`);
        }
    }

    ordenesOperador.forEach(orden => {
        const { turno, idOrden, tarea, descripcion, despachante, comentario } = orden;
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
        const contenedorTurno = document.getElementById(`turno${turno}`);
        if (contenedorTurno) {
            contenedorTurno.appendChild(card);
        } else {
            console.error(`No se encontró el contenedor para el turno ${turno}`);
        }
    });

    document.querySelectorAll('.btnCumplirOrden').forEach(button => {
        button.addEventListener('click', function (event) {
            const card = event.currentTarget.closest('.card');
            const idOrden = card.querySelector('.card-header').textContent.split(': ')[1];
            cumplirOrden(idOrden, operadorLogueado);
        });
    });

    document.querySelectorAll('.btnReagendar').forEach(button => {
        button.addEventListener('click', function (event) {
            const card = event.currentTarget.closest('.card');
            const idOrden = card.querySelector('.card-header').textContent.split(': ')[1];
            reagendarOrden(idOrden, operadorLogueado);
        });
    });

    function cumplirOrden(idOrden, operadorLogueado) {
        let ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];
        let ordenCumplida = ordenes.find(orden => orden.idOrden === idOrden);
        if (!ordenCumplida) {
            console.error(`No se encontró la orden con id ${idOrden}`);
            return;
        }
        ordenes = ordenes.map(orden => {
            if (orden.idOrden === idOrden) {
                return { ...orden, estado: 'cumplida' };
            }
            return orden;
        });
        localStorage.setItem('ordenes', JSON.stringify(ordenes));
        let historialOrdenesCumplidas = JSON.parse(localStorage.getItem('historialOrdenesCumplidas')) || [];
        historialOrdenesCumplidas.push({
            ...ordenCumplida,
            despachante: operadorLogueado.nombre,
            operador: operadorLogueado.idUsuario,
        });
        localStorage.setItem('historialOrdenesCumplidas', JSON.stringify(historialOrdenesCumplidas));
        $('#modalConfirmarCumplimiento').modal('show');
    }

    function reagendarOrden(idOrden, operadorLogueado) {
        let ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];
        let ordenReasignada = ordenes.find(orden => orden.idOrden === idOrden);
        if (!ordenReasignada) {
            console.error(`No se encontró la orden con id ${idOrden}`);
            return;
        }
        ordenes = ordenes.map(orden => {
            if (orden.idOrden === idOrden) {
                return { ...orden, estado: 'reasignada' };
            }
            return orden;
        });
        localStorage.setItem('ordenes', JSON.stringify(ordenes));
        let historialOrdenesReasignadas = JSON.parse(localStorage.getItem('historialOrdenesReasignadas')) || [];
        historialOrdenesReasignadas.push({
            ...ordenReasignada,
            despachante: operadorLogueado.nombre,
            operador: operadorLogueado.idUsuario,
        });
        localStorage.setItem('historialOrdenesReasignadas', JSON.stringify(historialOrdenesReasignadas));
        $('#modalActualizarOrden').modal('show');
    }
});









/*



document.addEventListener('DOMContentLoaded', () => {
    const idUsuario = localStorage.getItem('usuarioLogueado');
    if (!idUsuario) {
        console.error('No se encontró el usuario logueado.');
        window.location.href = '../index.html'; // Redirigir a la página de login si no se encuentra el usuario
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let ordenes = JSON.parse(localStorage.getItem('ordenes')) || [];
    const operadorLogueado = usuarios.find(u => u.idUsuario === idUsuario);
    if (!operadorLogueado || operadorLogueado.alcance.toLowerCase() !== 'operador') {
        console.error('No se encontró el operador logueado o el usuario no tiene el rol adecuado.');
        window.location.href = '../index.html'; // Redirigir a la página de login si no se encuentra el operador o el rol es incorrecto
        return;
    }

    // Referencias a los elementos del DOM
    const tablaCuerpo = document.querySelector('#tablaHojaRuta tbody');
    const btnMarcarCompletada = document.getElementById('btnMarcarCompletada');
    const btnReagendarOrden = document.getElementById('btnReagendarOrden');
    const comentarioOperadorInput = document.getElementById('comentarioOperador');

    // Variables para almacenar el estado actual
    let ordenSeleccionada = null;

    // Cargar y mostrar las órdenes asignadas
    cargarOrdenesAsignadas();

    function cargarOrdenesAsignadas() {
        const ordenesAsignadas = ordenes.filter(orden => orden.operador === operadorLogueado.idUsuario && orden.estado === 'asignada');
        mostrarTablaOrdenes(ordenesAsignadas);
    }

    // Función para mostrar la tabla con las órdenes asignadas
    function mostrarTablaOrdenes(ordenesAsignadas) {
        tablaCuerpo.innerHTML = ''; // Limpiar contenido anterior

        ordenesAsignadas.forEach(orden => {
            const fila = document.createElement('tr');
            fila.dataset.idOrden = orden.idOrden;
            fila.innerHTML = `
                <td>${orden.idOrden}</td>
                <td>${orden.tarea}</td>
                <td>${orden.turno}</td>
                <td>${orden.despachante}</td>
                <td><input type="radio" name="ordenSeleccionada" value="${orden.idOrden}"></td>
            `;
            tablaCuerpo.appendChild(fila);
        });
    }

    // Marcar una orden como completada
    btnMarcarCompletada.addEventListener('click', () => {
        const idOrdenSeleccionada = obtenerOrdenSeleccionada();
        if (idOrdenSeleccionada) {
            const orden = ordenes.find(o => o.idOrden === idOrdenSeleccionada);
            if (orden) {
                orden.estado = 'completada';
                orden.comentarioOperador = comentarioOperadorInput.value;
                guardarOrdenesYRecargar();
            }
        }
    });

    // Reagendar una orden
    btnReagendarOrden.addEventListener('click', () => {
        const idOrdenSeleccionada = obtenerOrdenSeleccionada();
        if (idOrdenSeleccionada) {
            const orden = ordenes.find(o => o.idOrden === idOrdenSeleccionada);
            if (orden) {
                orden.estado = 'reasignada';
                orden.comentarioOperador = comentarioOperadorInput.value;
                guardarOrdenesYRecargar();
            }
        }
    });

    // Obtener la orden seleccionada de la tabla
    function obtenerOrdenSeleccionada() {
        const radioSeleccionado = document.querySelector('input[name="ordenSeleccionada"]:checked');
        if (radioSeleccionado) {
            return parseInt(radioSeleccionado.value);
        } else {
            alert('Por favor selecciona una orden primero.');
            return null;
        }
    }

    // Guardar cambios en localStorage y recargar la página
    function guardarOrdenesYRecargar() {
        localStorage.setItem('ordenes', JSON.stringify(ordenes));
        cargarOrdenesAsignadas(); // Recargar la tabla después de marcar la orden
        comentarioOperadorInput.value = ''; // Limpiar el comentario
    }
});
*/