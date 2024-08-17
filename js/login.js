document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos iniciales en localStorage si no están presentes
    const cargarDatosIniciales = async () => {
        try {
            const archivos = [
                { nombre: 'db_usuarios.json', clave: 'usuarios' },
                { nombre: 'db_materiales.json', clave: 'materiales' },
                { nombre: 'db_tareas.json', clave: 'tareas' },
                { nombre: 'db_ordenes.json', clave: 'ordenes' }
            ];

            for (const archivo of archivos) {
                if (!localStorage.getItem(archivo.clave)) {
                    console.log(`Cargando datos desde ${archivo.nombre}`);
                    const respuesta = await fetch(`../js/${archivo.nombre}`);

                    // Manejar errores de red
                    if (!respuesta.ok) {
                        throw new Error(`No se pudo cargar el archivo ${archivo.nombre}`);
                    }

                    const datos = await respuesta.json();

                    // Verificar que los datos no están vacíos
                    if (datos && Array.isArray(datos)) {
                        localStorage.setItem(archivo.clave, JSON.stringify(datos));
                        console.log(`Datos de ${archivo.clave} cargados en localStorage.`);
                    } else {
                        throw new Error(`Los datos en ${archivo.nombre} no están en el formato esperado.`);
                    }
                } else {
                    console.log(`Datos de ${archivo.clave} ya presentes en localStorage.`);
                }
            }
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    };

    cargarDatosIniciales();
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const usuarioIngresado = document.getElementById('usuarioLogin').value;
    const contrasenaIngresada = document.getElementById('contrasenaLogin').value;

    console.log(`Usuario ingresado: ${usuarioIngresado}`);
    console.log(`Contraseña ingresada: ${contrasenaIngresada}`);

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let usuarioEncontrado = usuarios.find(u => u.usuario === usuarioIngresado && u.contrasena === contrasenaIngresada);

    if (usuarioEncontrado) {
        console.log('Usuario encontrado:', usuarioEncontrado);

        // Actualizar solo el estado del usuario logueado
        usuarios = usuarios.map(u => {
            if (u.idUsuario === usuarioEncontrado.idUsuario) {
                console.log(`Actualizando estado de usuario ${u.usuario} a conectado.`);
                return { ...u, conectado: true };
            }
            return u;
        });

        // Guardar los datos actualizados en localStorage
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        console.log('Usuarios actualizados en localStorage:', usuarios);

        // Guardar el idUsuario del usuario logueado
        localStorage.setItem('usuarioLogueado', usuarioEncontrado.idUsuario);
        console.log(`ID de usuario logueado almacenado en localStorage: ${usuarioEncontrado.idUsuario}`);

        // Redirección según el rol del usuario
        const alcanceUsuario = usuarioEncontrado.alcance.toLowerCase();
        console.log(`Alcance del usuario logueado: ${alcanceUsuario}`);

        if (alcanceUsuario === 'despachante') {
            console.log('Redireccionando a despacho.html');
            window.location.href = '../pages/despacho.html';
        } else if (alcanceUsuario === 'operador') {
            console.log('Redireccionando a operador.html');
            window.location.href = '../pages/operador.html';
        } else {
            console.error('Rol de usuario no reconocido:', alcanceUsuario);
        }

    } else {
        alert('Usuario o contraseña incorrectos');
        console.log('Usuario o contraseña incorrectos');
    }
});
