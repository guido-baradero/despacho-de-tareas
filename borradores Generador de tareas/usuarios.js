class Usuario {
    constructor(idUsuario, nombre, apellido, usuario, contrasena, alcance) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.usuario = usuario;
        this.contrasena = contrasena;
        this.alcance = alcance;
        this.conectado = false;
        this.disponible = false;
        this.hojaDeRuta = this.alcance === 'despachante' ? null : this.generarHojaDeRuta();
        console.log(`Usuario creado: ${this.usuario}, Alcance: ${this.alcance}`);
    }

    generarHojaDeRuta() {
        if (this.alcance === 'operador') {
            console.log('Generando hoja de ruta para operador');
            return {
                turnos: {
                    turno1: 'libre',
                    turno2: 'libre',
                    turno3: 'libre',
                    turno4: 'libre',
                    turno5: 'libre'
                },
                despachante: '',
                orden: [],
                estadoDeHoja: 'disponible',
                comentarioDeHoja: ''
            };
        } else {
            return null;
        }
    }
}

// Generar 10 operadores y 2 despachantes
let usuarios = [
    new Usuario('0-0001', 'Juan', 'Pérez', 'juan.perez', 'password123', 'operador'),
    new Usuario('0-0002', 'María', 'Gómez', 'maria.gomez', 'password123', 'operador'),
    new Usuario('0-0003', 'Carlos', 'Fernández', 'carlos.fernandez', 'password123', 'operador'),
    new Usuario('0-0004', 'Ana', 'Martínez', 'ana.martinez', 'password123', 'operador'),
    new Usuario('0-0005', 'Luis', 'Rodríguez', 'luis.rodriguez', 'password123', 'operador'),
    new Usuario('0-0006', 'Sofía', 'López', 'sofia.lopez', 'password123', 'operador'),
    new Usuario('0-0007', 'Pedro', 'García', 'pedro.garcia', 'password123', 'operador'),
    new Usuario('0-0008', 'Lucía', 'Hernández', 'lucia.hernandez', 'password123', 'operador'),
    new Usuario('0-0009', 'Miguel', 'Ramírez', 'miguel.ramirez', 'password123', 'operador'),
    new Usuario('0-0010', 'Elena', 'Torres', 'elena.torres', 'password123', 'operador'),
    new Usuario('1-0001', 'José', 'Sánchez', 'jose.sanchez', 'password123', 'despachante'),
    new Usuario('1-0002', 'Laura', 'Díaz', 'laura.diaz', 'password123', 'despachante')
];

// Guardar los usuarios en localStorage
localStorage.setItem('usuarios', JSON.stringify(usuarios));

console.table(usuarios);
