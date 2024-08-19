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
                    const datos = await respuesta.json();
                    localStorage.setItem(archivo.clave, JSON.stringify(datos));
                    console.log(`Datos de ${archivo.clave} cargados en localStorage.`);
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