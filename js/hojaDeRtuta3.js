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

    console.log("Órdenes del operador:", ordenesOperador);

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
            console.log(`Cumpliendo la orden con id: ${idOrden}`);
            cumplirOrden(parseInt(idOrden, 10));
        });
    });

    document.querySelectorAll('.btnReagendar').forEach(button => {
        button.addEventListener('click', function (event) {
            const card = event.currentTarget.closest('.card');
            const idOrden = card.querySelector('.card-header').textContent.split(': ')[1];
            console.log(`Reagendando la orden con id: ${idOrden}`);
            reagendarOrden(parseInt(idOrden, 10));
        });
    });

    function cumplirOrden(idOrden) {
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
        console.log(`Orden ${idOrden} cumplida. Estado actualizado en localStorage.`);

        actualizarVista(idOrden, 'cumplida');

        let historialOrdenesCumplidas = JSON.parse(localStorage.getItem('historialOrdenesCumplidas')) || [];
        historialOrdenesCumplidas.push({
            ...ordenCumplida,
            estado: 'cumplida',
            despachante: operadorLogueado.nombre,
            operador: operadorLogueado.idUsuario,
        });
        localStorage.setItem('historialOrdenesCumplidas', JSON.stringify(historialOrdenesCumplidas));
        console.log(`Historial de órdenes cumplidas actualizado:`, historialOrdenesCumplidas);

        $('#modalConfirmarCumplimiento').modal('show');
    }

    function reagendarOrden(idOrden) {
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
        console.log(`Orden ${idOrden} reasignada. Estado actualizado en localStorage.`);

        actualizarVista(idOrden, 'reasignada');

        let historialOrdenesReasignadas = JSON.parse(localStorage.getItem('historialOrdenesReasignadas')) || [];
        historialOrdenesReasignadas.push({
            ...ordenReasignada,
            estado: 'reasignada',
            despachante: operadorLogueado.nombre,
            operador: operadorLogueado.idUsuario,
        });
        localStorage.setItem('historialOrdenesReasignadas', JSON.stringify(historialOrdenesReasignadas));
        console.log(`Historial de órdenes reasignadas actualizado:`, historialOrdenesReasignadas);

        $('#modalActualizarOrden').modal('show');
    }

    function actualizarVista(idOrden, estado) {
        const card = Array.from(document.querySelectorAll('.card')).find(card => card.querySelector('.card-header').textContent.includes(idOrden));
        if (card) {
            if (estado === 'cumplida') {
                card.style.backgroundColor = 'lightgreen';
            } else if (estado === 'reasignada') {
                card.style.backgroundColor = 'lightcoral';
            }
            console.log(`Vista actualizada para la orden ${idOrden} con estado: ${estado}`);
        } else {
            console.error(`No se encontró la tarjeta para la orden ${idOrden} en la vista.`);
        }
    }
});
