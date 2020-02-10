const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');

const usuarios = new Usuarios();


io.on('connection', (client) => {

    client.on('disconnect', () => {

        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} ha abandonado el chat`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
    });

    client.on('entrarChat', (data, callback) => {

        if(!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'Nombre y sala son necesarios'
            })
        }

        client.join(data.sala);

        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} se ha unido al chat`));
        callback(usuarios.getPersonasPorSala(data.sala));
    });

    client.on('crearMensaje', (data, callback) => {

        let persona = usuarios.getPersona(client.id);


        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(data.sala).emit('crearMensaje', mensaje);

        callback(mensaje);
    });

    client.on('mensajePrivado', (data) => {

        let persona = usuarios.getPersona(client.id);


        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(data.para).emit('mensajePrivado', mensaje);
    });
    

});