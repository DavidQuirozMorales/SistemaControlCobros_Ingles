import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import cron from 'node-cron'; // Importamos node-cron 

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'prop_siscobros',
});

// ===================== ENDPOINTS DE LOGIN =====================

// E N D P O I N T  de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM administracion WHERE username = ? AND password = ?';

  db.query(query, [username, password], (err, result) => {
    if (err) {
      return res.json({ success: false, message: 'Error en la base de datos' });
    }
    if (result.length > 0) {
      const user = result[0];
      res.json({ success: true, message: 'Login exitoso', username: user.username });
    } else {
      res.json({ success: false, message: 'Credenciales incorrectas' });
    }
  });
});


// E N D P O I N T  Obtener todos los estudiantes
app.get('/api/estudiantes', (req, res) => {
  const query = 'SELECT * FROM estudiantes';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener estudiantes', error: err });
    }
    res.json(result);
  });
});

// E N D P O I N T Añadir estudiante
app.post('/api/estudiantes', (req, res) => {
  const { nombre_completo, numero_control, carrera, email } = req.body;
  const query = 'INSERT INTO estudiantes (nombre_completo, numero_control, carrera, email, fecha_registro, estatus) VALUES (?, ?, ?, ?, NOW(), "activo")';

  db.query(query, [nombre_completo, numero_control, carrera, email], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al añadir estudiante', error: err });
    }
    res.json({ success: true, message: 'Estudiante añadido exitosamente' });
  });
});

// E N D P O I N T Editar estudiante
app.put('/api/estudiantes/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_completo, numero_control, carrera, email } = req.body;
  const query = 'UPDATE estudiantes SET nombre_completo = ?, numero_control = ?, carrera = ?, email = ? WHERE id = ?';

  db.query(query, [nombre_completo, numero_control, carrera, email, id], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al editar estudiante', error: err });
    }
    res.json({ success: true, message: 'Estudiante actualizado exitosamente' });
  });
});

// E N D P O I N T Inhabilitar estudiante
app.put('/api/estudiantes/inhabilitar/:id', (req, res) => {
  const id = req.params.id;
  const query = 'UPDATE estudiantes SET estatus = "inhabilitado" WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al inhabilitar estudiante', error: err });
    }
    res.json({ message: 'Estudiante inhabilitado exitosamente' });
  });
});

// E N D P O I N T Habilitar estudiante
app.put('/api/estudiantes/habilitar/:id', (req, res) => {
  const id = req.params.id;
  const query = 'UPDATE estudiantes SET estatus = "activo" WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al habilitar estudiante', error: err });
    }
    res.json({ message: 'Estudiante habilitado exitosamente' });
  });
});


//****************************************ENDPOINTS PARA MODULOS.JSX****************************************

// E N D P O I N T Obtener los módulos
app.get('/api/modulos', (req, res) => {
  const query = 'SELECT * FROM modulos';
  db.query(query, (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ success: false, message: 'Error al obtener módulos', error: err });
    }
    
    res.json(result);
  });
});


// E N D P O I N T Crear un nuevo grupo dentro de un módulo
app.post('/api/modulos/:id_modulo/crear-grupo', (req, res) => {
  const { id_modulo } = req.params;
  const { nombre_grupo, clave_grupo, capacidad, fecha_inicio, fecha_fin } = req.body;

  const query = 'INSERT INTO grupos (id_modulo, nombre_grupo, clave_grupo, max_estudiantes, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [id_modulo, nombre_grupo, clave_grupo, capacidad, fecha_inicio, fecha_fin], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al crear grupo', error: err });
    }
    res.json({ success: true, message: 'Grupo creado exitosamente' });
  });
});


// E N D P O I N T Obtener los grupos de un módulo específico
app.get('/api/modulos/:id_modulo/grupos', (req, res) => {
  const { id_modulo } = req.params;
  const query = 'SELECT * FROM grupos WHERE id_modulo = ?';
  db.query(query, [id_modulo], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener grupos', error: err });
    }
    res.json(result);
  });
});

//*******************************************ENDPOINTS PARA PAGOS.JSX******************************************


// E N D P O I NT  Registrar un nuevo pago para un estudiante
// E N D P O I NT  Registrar un nuevo pago para un estudiante
app.post('/api/pagos', (req, res) => {
  const { id_estudiante, id_modulo, monto, fecha_pago, metodo_pago, referencia_bancaria, estatus } = req.body;
  
  // Verificar si el estudiante ya ha realizado un pago para este módulo
  const verificarPagoQuery = `
    SELECT * FROM pagos 
    WHERE id_estudiante = ? AND id_modulo = ? AND estatus = 'verificado'
  `;

  db.query(verificarPagoQuery, [id_estudiante, id_modulo], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al verificar pagos existentes', error: err });
    }

    // Si ya existe un pago verificado para este módulo, se evita registrar otro
    if (result.length > 0) {
      return res.status(400).json({ success: false, message: 'El estudiante ya ha realizado un pago verificado para este módulo.' });
    }

    // Si no existe un pago duplicado, registrar el nuevo pago
    const query = `
      INSERT INTO pagos (id_estudiante, id_modulo, monto, fecha_pago, metodo_pago, referencia_bancaria, estatus) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [id_estudiante, id_modulo, monto, fecha_pago, metodo_pago, referencia_bancaria, estatus], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al registrar el pago', error: err });
      }

      // Si el estatus es "no verificado", generar la notificación
      if (estatus === 'no verificado') {
        const notificacionQuery = `
          INSERT INTO notificaciones (tipo, mensaje, fecha_creacion, estatus)
          SELECT 
              'pagos',
              CONCAT(
                  'El estudiante con número de control ', e.numero_control, 
                  ' tiene un pago no verificado para el módulo ', ? , '.'
              ),
              NOW(),
              'sin leer'
          FROM estudiantes e
          WHERE e.id = ?;
        `;

        db.query(notificacionQuery, [id_modulo, id_estudiante], (err) => {
          if (err) {
            console.error('Error al generar la notificación:', err);
          }
        });
      }

      res.json({ success: true, message: 'Pago registrado exitosamente' });
    });
  });
});



// E N D P O I N T Verificar un pago y moverlo al historial
app.put('/api/pagos/verificar/:id', (req, res) => {
  const idPago = req.params.id;
  const { referencia_bancaria_ingresada } = req.body; // Obtenemos la referencia ingresada por el administrador

  const obtenerPagoQuery = 'SELECT * FROM pagos WHERE id_pago = ?';
  db.query(obtenerPagoQuery, [idPago], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener el pago', error: err });
    }

    const pago = result[0];

    // Verificamos que la referencia bancaria coincida
    if (pago.referencia_bancaria === referencia_bancaria_ingresada) {
      const actualizarPagoQuery = 'UPDATE pagos SET estatus = "verificado" WHERE id_pago = ?';
      db.query(actualizarPagoQuery, [idPago], (err, updateResult) => {
        if (err) {
          return res.status(500).json({ message: 'Error al verificar el pago', error: err });
        }

        const insertarHistorialQuery = 'INSERT INTO historial_pagos (id_estudiante, id_modulo, monto, fecha_pago, metodo_pago, referencia_bancaria, estatus, tipo_cambio) VALUES (?, ?, ?, ?, ?, ?, "verificado", "registro")';
        db.query(insertarHistorialQuery, [pago.id_estudiante, pago.id_modulo, pago.monto, pago.fecha_pago, pago.metodo_pago, pago.referencia_bancaria], (err, historialResult) => {
          if (err) {
            return res.status(500).json({ message: 'Error al mover el pago al historial', error: err });
          }
          res.json({ message: 'Pago verificado y movido al historial exitosamente' });
        });
      });
    } else {
      res.status(400).json({ message: 'La referencia bancaria no coincide.' });
    }
  });
});


//E N D P O I N T Mover un pago verificado al historial de pagos
app.post('/api/historial-pagos', (req, res) => {
  const { id_estudiante, id_modulo, monto, fecha_pago, metodo_pago, referencia_bancaria, tipo_cambio } = req.body;

  const query = 'INSERT INTO historial_pagos (id_estudiante, id_modulo, monto, fecha_pago, metodo_pago, referencia_bancaria, tipo_cambio) VALUES (?, ?, ?, ?, ?, ?, ?)';

  db.query(query, [id_estudiante, id_modulo, monto, fecha_pago, metodo_pago, referencia_bancaria, tipo_cambio], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al mover el pago al historial', error: err });
    }
    res.json({ success: true, message: 'Pago movido al historial exitosamente' });
  });
});

// E N D P O I N T  Obtener pagos no verificados
app.get('/api/pagos/no-verificados', (req, res) => {
  const query = `
    SELECT pagos.*, estudiantes.nombre_completo AS nombre_estudiante, modulos.nombre_modulo 
    FROM pagos
    JOIN estudiantes ON pagos.id_estudiante = estudiantes.id
    JOIN modulos ON pagos.id_modulo = modulos.id_modulo
    WHERE pagos.estatus = 'no verificado'
  `;

  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener pagos no verificados', error: err });
    }
    res.json(result);
  });
});

// E N D P O I N T Obtener pagos verificados
app.get('/api/pagos/verificados', (req, res) => {
  const query = 'SELECT pagos.*, estudiantes.nombre_completo AS nombre_estudiante, modulos.nombre_modulo AS nombre_modulo FROM pagos INNER JOIN estudiantes ON pagos.id_estudiante = estudiantes.id INNER JOIN modulos ON pagos.id_modulo = modulos.id_modulo WHERE pagos.estatus = "verificado"';
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener pagos verificados', error: err });
    }
    res.json(result);
  });
});


// ENDPOINTS DE ASIGNACIONES DE ESTUDIANTES A GRUPOS.

// E N D P O I N T estudiantes con pagos verificados en un módulo específico
app.get('/api/modulos/:id_modulo/estudiantes-verificados', (req, res) => {
  const { id_modulo } = req.params;
  const query = `
    SELECT estudiantes.id, estudiantes.nombre_completo
    FROM pagos
    INNER JOIN estudiantes ON pagos.id_estudiante = estudiantes.id
    WHERE pagos.id_modulo = ? AND pagos.estatus = 'verificado'
  `;
  db.query(query, [id_modulo], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener estudiantes verificados', error: err });
    }
    res.json(result);
  });
});




// E N D P O I N T para asignar estudiante a un grupo
app.post('/api/grupos/:idGrupo/asignar-estudiante', (req, res) => {
  const { id_estudiante } = req.body;
  const idGrupo = req.params.idGrupo;

  // Verificar si el estudiante ya ha completado este módulo en el pasado
  const verificarHistorialQuery = `
    SELECT * FROM historial_estudiantes 
    WHERE id_estudiante = ? 
    AND id_modulo = (
      SELECT id_modulo FROM grupos WHERE id_grupo = ?
    )
  `;

  db.query(verificarHistorialQuery, [id_estudiante, idGrupo], (err, historialResult) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al verificar el historial del estudiante', error: err });
    }

    // Si el estudiante ya tiene registro en el historial para este módulo, bloqueamos la asignación
    if (historialResult.length > 0) {
      return res.status(400).json({ success: false, message: 'El estudiante ya ha cursado este módulo previamente.' });
    }

    // Verificar si el estudiante ya está asignado a un grupo en el módulo actual
    const verificarAsignacionQuery = `
      SELECT grupo_estudiantes.* 
      FROM grupo_estudiantes
      JOIN grupos ON grupo_estudiantes.id_grupo = grupos.id_grupo
      WHERE grupo_estudiantes.id_estudiante = ? 
      AND grupos.id_modulo = (
        SELECT id_modulo FROM grupos WHERE id_grupo = ?
      )
    `;

    db.query(verificarAsignacionQuery, [id_estudiante, idGrupo], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al verificar el estudiante', error: err });
      }

      // Si el estudiante ya está asignado, retornamos error
      if (result.length > 0) {
        return res.status(400).json({ success: false, message: 'El estudiante ya está asignado a un grupo en este módulo.' });
      }

      // Asignar estudiante al grupo si no está asignado ni tiene historial en el mismo módulo
      const asignarQuery = 'INSERT INTO grupo_estudiantes (id_grupo, id_estudiante) VALUES (?, ?)';
      // eslint-disable-next-line no-unused-vars
      db.query(asignarQuery, [idGrupo, id_estudiante], (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al asignar el estudiante', error: err });
        }
        res.json({ success: true, message: 'Estudiante asignado exitosamente' });
      });
    });
  });
});


// E N D P O I NT  para obtener los estudiantes asignados a un grupo específico
app.get('/api/grupos/:idGrupo/estudiantes', (req, res) => {
  const idGrupo = req.params.idGrupo;

  const query = `
    SELECT estudiantes.id, estudiantes.nombre_completo
    FROM grupo_estudiantes
    INNER JOIN estudiantes ON grupo_estudiantes.id_estudiante = estudiantes.id
    WHERE grupo_estudiantes.id_grupo = ?
  `;

  db.query(query, [idGrupo], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener los estudiantes del grupo', error: err });
    }
    res.json(result);
  });
});

//E N D P O I N T  PARA EDITAR LOS GRUPOS.
app.put('/api/grupos/actualizar-estado', (req, res) => {
  // Actualizar los grupos que ya comenzaron pero aún no terminaron
  const actualizarEnCursoQuery = `
    UPDATE grupos 
    SET estado = 'En Curso'
    WHERE CURDATE() >= fecha_inicio AND CURDATE() < fecha_fin AND estado != 'Finalizado'
  `;
  
  db.query(actualizarEnCursoQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al actualizar grupos a "En Curso"', error: err });
    }

    // Actualizar los grupos que ya terminaron
    const actualizarFinalizadoQuery = `
      UPDATE grupos 
      SET estado = 'Finalizado'
      WHERE CURDATE() >= fecha_fin AND estado != 'Finalizado'
    `;

    db.query(actualizarFinalizadoQuery, (err, finalizadoResult) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al actualizar grupos a "Finalizado"', error: err });
      }

      res.json({ success: true, message: 'Estados de grupos actualizados correctamente' });
    });
  });
});

//E N D P O I N T -Actualizar Estado-
app.put('/api/grupos/:idGrupo/estado', (req, res) => {
  const { idGrupo } = req.params;
  const { estado } = req.body;

  if (estado === 'Finalizado') {
    // Primero movemos el grupo al historial
    const queryMoverHistorial = `
      INSERT INTO historial_modulos (id_grupo, id_modulo, fecha_inicio, fecha_fin, estado)
      SELECT id_grupo, id_modulo, fecha_inicio, fecha_fin, 'Finalizado' 
      FROM grupos 
      WHERE id_grupo = ?`;

    db.query(queryMoverHistorial, [idGrupo], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al mover el grupo al historial', error: err });
      }

      // Luego actualizamos el estado del grupo en la tabla `grupos` a "Finalizado"
      const queryActualizarEstado = 'UPDATE grupos SET estado = ? WHERE id_grupo = ?';
      db.query(queryActualizarEstado, [estado, idGrupo], (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al actualizar el estado del grupo', error: err });
        }
        res.json({ success: true, message: 'Grupo finalizado y movido al historial exitosamente' });
      });
    });
  } else {
    // Si el estado no es "Finalizado", solo lo actualizamos
    const queryActualizarEstado = 'UPDATE grupos SET estado = ? WHERE id_grupo = ?';
    db.query(queryActualizarEstado, [estado, idGrupo], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al actualizar el estado del grupo', error: err });
      }
      res.json({ success: true, message: 'Estado del grupo actualizado exitosamente' });
    });
  }
});

// E N D P O I N T  Verificar y mover los grupos finalizados al historial
app.post('/api/mover-grupos-finalizados', (req, res) => {
  const verificarGruposFinalizadosQuery = `
    SELECT * FROM grupos WHERE estado = 'Finalizado' AND fecha_fin <= NOW()
  `;

  db.query(verificarGruposFinalizadosQuery, (err, gruposFinalizados) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al verificar grupos finalizados', error: err });
    }

    if (gruposFinalizados.length > 0) {
      gruposFinalizados.forEach((grupo) => {
        // Mover al historial_modulos
        const moverAlHistorialQuery = `
          INSERT INTO historial_modulos (id_grupo, id_modulo, nombre_grupo, fecha_inicio, fecha_fin, estado)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.query(moverAlHistorialQuery, [grupo.id_grupo, grupo.id_modulo, grupo.nombre_grupo, grupo.fecha_inicio, grupo.fecha_fin, grupo.estado], (err, result) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error al mover grupo al historial', error: err });
          }

          // Eliminar grupo de la tabla grupos
          const eliminarGrupoQuery = `DELETE FROM grupos WHERE id_grupo = ?`;
          db.query(eliminarGrupoQuery, [grupo.id_grupo], (err, result) => {
            if (err) {
              return res.status(500).json({ success: false, message: 'Error al eliminar grupo finalizado', error: err });
            }
          });
        });
      });

      return res.status(200).json({ success: true, message: 'Grupos finalizados movidos al historial' });
    } else {
      return res.status(200).json({ success: true, message: 'No hay grupos finalizados para mover' });
    }
  });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// E N D P O I N T - Cambiar el estado de un grupo a "En Curso"
app.put('/api/grupos/:idGrupo/iniciar', (req, res) => {
  const { idGrupo } = req.params;

  // Verificar si el grupo tiene estudiantes asignados
  const checkQuery = 'SELECT COUNT(*) AS total FROM grupo_estudiantes WHERE id_grupo = ?';

  db.query(checkQuery, [idGrupo], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al verificar estudiantes', error: err });
    }

    const totalEstudiantes = result[0].total;

    if (totalEstudiantes === 0) {
      return res.status(400).json({ success: false, message: 'El grupo no tiene estudiantes asignados.' });
    }

    // Si tiene estudiantes, cambiar el estado a "En Curso"
    const updateQuery = 'UPDATE grupos SET estado = "En Curso" WHERE id_grupo = ? AND estado = "Abierto"';

    db.query(updateQuery, [idGrupo], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al iniciar el grupo', error: err });
      }
      if (result.affectedRows > 0) {
        res.json({ success: true, message: 'Grupo iniciado exitosamente' });
      } else {
        res.status(400).json({ success: false, message: 'El grupo no está en estado "Abierto" o no existe' });
      }
    });
  });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// E N D P O I N T -Finalizar grupo-
app.put('/api/grupos/:idGrupo/finalizar', (req, res) => {
  const { idGrupo } = req.params;

  const query = 'UPDATE grupos SET estado = "Finalizado" WHERE id_grupo = ?';

  db.query(query, [idGrupo], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al finalizar el grupo', error: err });
    }
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Grupo finalizado exitosamente' });
    } else {
      res.status(400).json({ success: false, message: 'El grupo no existe' });
    }
  });
});



//////
//////
//////
//////
//////
// E N D P O I N T Registrar estudiantes en el historial.
// E N D P O I N T Registrar estudiantes en el historial
app.put('/api/grupos/:id/registrar-estudiantes', (req, res) => {
  const { id } = req.params;

  // Verificar si los estudiantes de este grupo ya están en el historial
  const verificarQuery = `
    SELECT * FROM historial_estudiantes WHERE id_grupo = ?
  `;

  db.query(verificarQuery, [id], (err, results) => {
    if (err) {
      console.error('Error al verificar estudiantes en el historial:', err);
      return res.status(500).json({ error: 'Error al verificar estudiantes en el historial' });
    }

    // Si ya hay registros, retornamos un mensaje de error
    if (results.length > 0) {
      return res.status(400).json({ error: 'Error, los estudiantes ya han sido subidos recientemente.' });
    }

    // Registrar estudiantes si no están en el historial
    const registrarQuery = `
      INSERT INTO historial_estudiantes (id_estudiante, nombre_estudiante, id_modulo, nombre_modulo, id_grupo, clave_grupo, fecha_inicio, fecha_fin, monto_pagado, estado)
      SELECT e.id, e.nombre_completo, g.id_modulo, m.nombre_modulo, g.id_grupo, g.clave_grupo, g.fecha_inicio, g.fecha_fin, p.monto, 'Registrado'
      FROM grupo_estudiantes ge
      INNER JOIN estudiantes e ON ge.id_estudiante = e.id
      INNER JOIN grupos g ON ge.id_grupo = g.id_grupo
      INNER JOIN modulos m ON g.id_modulo = m.id_modulo
      INNER JOIN pagos p ON p.id_estudiante = e.id AND p.id_modulo = g.id_modulo
      WHERE g.id_grupo = ?
    `;

    db.query(registrarQuery, [id], (err, results) => {
      if (err) {
        console.error('Error al registrar estudiantes en historial:', err);
        return res.status(500).json({ error: 'Error al registrar estudiantes en historial' });
      }

      res.json({ message: 'Estudiantes registrados en el historial correctamente' });
    });
  });
});


//////
//////
//////
//////
//////
// Endpoint Archivar grupos
app.put('/api/grupos/:id/archivar', (req, res) => {
  const { id } = req.params;

  // Verificar si los estudiantes del grupo están registrados en el historial
  const verificarQuery = `
    SELECT COUNT(*) AS total FROM historial_estudiantes WHERE id_grupo = ?
  `;

  db.query(verificarQuery, [id], (err, results) => {
    if (err) {
      console.error('Error al verificar estudiantes en el historial:', err);
      return res.status(500).json({ error: 'Error al verificar estudiantes en el historial' });
    }

    const total = results[0].total;

    if (total === 0) {
      return res.status(400).json({ error: 'No se puede archivar el grupo. Los estudiantes no han sido registrados en el historial.' });
    }

    // Iniciar la transacción para archivar el grupo
    db.beginTransaction((err) => {
      if (err) {
        console.error('Error al iniciar la transacción:', err);
        return res.status(500).send('Error al iniciar la transacción');
      }

      console.log('Transacción iniciada para el grupo ID:', id);

      // Eliminar los registros en la tabla grupo_estudiantes relacionados con el grupo
      const queryEliminarEstudiantes = 'DELETE FROM grupo_estudiantes WHERE id_grupo = ?';
      db.query(queryEliminarEstudiantes, [id], (err, result) => {
        if (err) {
          console.error('Error al eliminar estudiantes del grupo:', err);
          return db.rollback(() => {
            res.status(500).send('Error al eliminar estudiantes del grupo');
          });
        }

        console.log('Estudiantes eliminados de grupo_estudiantes para el grupo ID:', id);

        // Mover el grupo a la tabla historial_grupos
        const queryMoverGrupo = `
          INSERT INTO historial_grupos (id_grupo, clave_grupo, id_modulo, fecha_inicio, fecha_fin, nombre_grupo, estado)
          SELECT id_grupo, clave_grupo, id_modulo, fecha_inicio, fecha_fin, nombre_grupo, 'Finalizado'
          FROM grupos WHERE id_grupo = ?
        `;
        db.query(queryMoverGrupo, [id], (err, result) => {
          if (err) {
            console.error('Error al mover el grupo al historial:', err);
            return db.rollback(() => {
              res.status(500).send('Error al mover el grupo al historial');
            });
          }

          console.log('Grupo movido al historial para el grupo ID:', id);

          // Eliminar el grupo de la tabla grupos
          const queryEliminarGrupo = 'DELETE FROM grupos WHERE id_grupo = ?';
          db.query(queryEliminarGrupo, [id], (err, result) => {
            if (err) {
              console.error('Error al eliminar el grupo de la tabla grupos:', err);
              return db.rollback(() => {
                res.status(500).send('Error al eliminar el grupo');
              });
            }

            console.log('Grupo eliminado de la tabla grupos para el grupo ID:', id);

            // Confirmar la transacción solo si todo ha salido bien
            db.commit((err) => {
              if (err) {
                console.error('Error al confirmar la transacción:', err);
                return db.rollback(() => {
                  res.status(500).send('Error al confirmar la transacción');
                });
              }

              console.log('Transacción confirmada, grupo archivado con éxito para el grupo ID:', id);
              res.status(200).send('Grupo archivado con éxito');
            });
          });
        });
      });
    });
  });
});





/////
/////
/////
// E N D P O I N T -Obtener historial de grupos-
app.get('/api/modulos/:idModulo/historial-grupos', (req, res) => {
  const { idModulo } = req.params;

  const queryGrupos = `
    SELECT * FROM historial_grupos WHERE id_modulo = ?
  `;

  const queryEstudiantes = `
    SELECT he.id_estudiante, e.nombre_completo, he.id_grupo 
    FROM historial_estudiantes he
    JOIN estudiantes e ON he.id_estudiante = e.id
    WHERE he.id_grupo IN (SELECT id_grupo FROM historial_grupos WHERE id_modulo = ?)
  `;

  db.query(queryGrupos, [idModulo], (err, grupos) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener el historial de grupos' });
    }

    db.query(queryEstudiantes, [idModulo], (err, estudiantes) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener los estudiantes del historial' });
      }

      res.json({
        grupos,
        estudiantes
      });
    });
  });
});
// E N D P O I N T - Obtener estudiantes del grupo archivado en el historial
app.get('/api/historial-grupos/:idGrupo/estudiantes', (req, res) => {
  const { idGrupo } = req.params;
  const query = `
    SELECT * FROM historial_estudiantes 
    WHERE id_grupo = ?
  `;
  db.query(query, [idGrupo], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los estudiantes del grupo archivado' });
    }
    res.json(results);
  });
});
// E N D P O I N T - Ver Historial de grupos archivados de un módulo
app.get('/api/modulos/:idModulo/historial', (req, res) => {
  const { idModulo } = req.params;
  const query = `
    SELECT * FROM historial_grupos 
    WHERE id_modulo = ?
  `;
  db.query(query, [idModulo], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener el historial de grupos' });
    }
    res.json(results);
  });
});
// E N D P O I N T - Obtener grupos activos dentro de un módulo
app.get('/api/modulos/:idModulo/grupos', (req, res) => {
  const { idModulo } = req.params;
  const query = `
    SELECT * FROM grupos 
    WHERE id_modulo = ? AND estado != 'Finalizado'
  `;
  db.query(query, [idModulo], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los grupos' });
    }
    res.json(results);
  });
});

// Obtener módulos cursados por un estudiante desde el historial
app.get('/api/estudiantes/:idEstudiante/modulos-cursados', (req, res) => {
  const { idEstudiante } = req.params;

  const query = `
    SELECT 
      he.nombre_modulo, 
      hg.nombre_grupo, 
      hg.clave_grupo, 
      hg.estado, 
      hg.fecha_inicio, 
      hg.fecha_fin, 
      he.monto_pagado 
    FROM historial_estudiantes he
    INNER JOIN historial_grupos hg ON he.id_grupo = hg.id_grupo
    WHERE he.id_estudiante = ?
    UNION
    SELECT 
      m.nombre_modulo, 
      g.nombre_grupo, 
      g.clave_grupo, 
      g.estado, 
      g.fecha_inicio, 
      g.fecha_fin, 
      p.monto AS monto_pagado
    FROM grupo_estudiantes ge
    INNER JOIN grupos g ON ge.id_grupo = g.id_grupo
    INNER JOIN modulos m ON g.id_modulo = m.id_modulo
    INNER JOIN pagos p ON p.id_estudiante = ge.id_estudiante
      AND p.id_modulo = m.id_modulo
    WHERE ge.id_estudiante = ? AND g.estado = 'En Curso'
    ORDER BY fecha_inicio DESC
  `;

  db.query(query, [idEstudiante, idEstudiante], (err, results) => {
    if (err) {
      console.error('Error al obtener los módulos cursados:', err);
      return res.status(500).json({ error: 'Error al obtener los módulos cursados' });
    }

    res.json(results);
  });
});

// Endpoint para obtener módulos y sus grupos
app.get('/api/modulos-grupos', (req, res) => {
  const query = `
    SELECT m.id_modulo, m.nombre_modulo, g.id_grupo, g.nombre_grupo 
    FROM modulos m 
    LEFT JOIN grupos g ON m.id_modulo = g.id_modulo 
    ORDER BY m.id_modulo, g.id_grupo
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener módulos y grupos' });
    }

    // Agrupar los resultados por módulo
    const modulosConGrupos = results.reduce((acc, row) => {
      const { id_modulo, nombre_modulo, id_grupo, nombre_grupo } = row;
      if (!acc[id_modulo]) {
        acc[id_modulo] = {
          nombre_modulo,
          grupos: []
        };
      }
      if (id_grupo) {
        acc[id_modulo].grupos.push({
          id_grupo,
          nombre_grupo
        });
      }
      return acc;
    }, {});

    res.json(Object.values(modulosConGrupos)); // Asegúrate de que devuelve un arreglo
  });
});








// Para informe de modulos de grupos
app.get('/api/informe-modulos-grupos', (req, res) => {
  const query = `
    SELECT 
      m.id_modulo AS modulo_id,
      m.nombre_modulo AS modulo_nombre,
      g.id_grupo AS grupo_id,
      g.nombre_grupo AS grupo_nombre,
      COUNT(DISTINCT e.id) AS estudiantes_activos,
      IFNULL(SUM(p.monto), 0) AS monto_total_recaudado
    FROM modulos m
    JOIN grupos g ON m.id_modulo = g.id_modulo
    JOIN grupo_estudiantes ge ON g.id_grupo = ge.id_grupo
    JOIN estudiantes e ON ge.id_estudiante = e.id
    JOIN pagos p ON p.id_estudiante = e.id 
      AND p.id_modulo = m.id_modulo 
      AND p.estatus = 'verificado'
    WHERE g.estado IN ('en curso', 'finalizado')
    GROUP BY m.id_modulo, g.id_grupo
    ORDER BY m.id_modulo, g.nombre_grupo;
  `;

  db.query(query, (err, rows) => {
    if (err) {
      console.error("Error fetching report data:", err);
      return res.status(500).json({ error: "Error fetching report data" });
    }

    const informe = rows.reduce((acc, row) => {
      const moduloIndex = acc.findIndex(mod => mod.modulo_id === row.modulo_id);
      
      if (moduloIndex !== -1) {
        acc[moduloIndex].grupos.push({
          grupo_id: row.grupo_id,
          grupo_nombre: row.grupo_nombre,
          monto_total_recaudado: row.monto_total_recaudado,
          estudiantes_activos: row.estudiantes_activos
        });
      } else {
        acc.push({
          modulo_id: row.modulo_id,
          modulo_nombre: row.modulo_nombre,
          grupos: [{
            grupo_id: row.grupo_id,
            grupo_nombre: row.grupo_nombre,
            monto_total_recaudado: row.monto_total_recaudado,
            estudiantes_activos: row.estudiantes_activos
          }]
        });
      }
      return acc;
    }, []);

    res.status(200).json(informe);
  });
});








// Endpoint para los informes globales con filtro de tiempo basado en created_at y visualización de fecha_pago
app.post('/api/reportes/global', (req, res) => {
  const { period, startDate, endDate } = req.body;
  let dateCondition = '';

  // Ajustar la condición de fecha según el tipo de filtro usando created_at
  if (period === 'weekly') {
    dateCondition = 'AND pagos.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
  } else if (period === 'monthly') {
    dateCondition = 'AND pagos.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
  } else if (period === 'quarterly') {
    dateCondition = 'AND pagos.created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
  } else if (period === 'custom' && startDate && endDate) {
    dateCondition = `AND pagos.created_at BETWEEN '${startDate}' AND '${endDate}'`;
  }

  const query = `
    SELECT 
      pagos.fecha_pago AS fecha_pago,
      estudiantes.numero_control,
      estudiantes.nombre_completo AS nombre_estudiante,
      modulos.nombre_modulo AS modulo_pagado,
      MONTHNAME(pagos.fecha_pago) AS mes_pago,
      pagos.metodo_pago,
      pagos.monto
    FROM pagos
    JOIN estudiantes ON pagos.id_estudiante = estudiantes.id
    JOIN modulos ON pagos.id_modulo = modulos.id_modulo
    WHERE pagos.estatus = 'verificado'
    ${dateCondition}
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener datos del informe global:', error);
      return res.status(500).json({ error: 'Error al obtener datos del informe global' });
    }
    res.json(results);
  });
});



// NUEVOS ENDPOINTS PARA EL DASHBOARD
//=======ENDPOINTS PARA LAS METRICAS CLAVE=====///
//Endpoint para contar el numero de estudiantes activos en la base data.

app.get('/api/estudiantes/activos/total', (req, res) => {
  const query = 'SELECT COUNT(*) AS total FROM estudiantes WHERE estatus = "activo"';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al contar estudiantes activos', error: err });
    }
    res.json(result[0]);
  });
});

//Endpoint para contar el total de pagos con estatus "verificado" y "no verificado"
app.get('/api/pagos/total', (req, res) => {
    const query = `
      SELECT 
        SUM(CASE WHEN estatus = 'verificado' THEN 1 ELSE 0 END) AS pagos_verificados,
        SUM(CASE WHEN estatus = 'no verificado' THEN 1 ELSE 0 END) AS pagos_no_verificados
      FROM pagos
    `;
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al contar pagos', error: err });
      }
      res.json(result[0]);
    });
  });
  
  //Endpoint para sumar todos los pagos con estatus "verificado"
  app.get('/api/ingresos/total', (req, res) => {
    const query = 'SELECT IFNULL(SUM(monto), 0) AS total_ingresos FROM pagos WHERE estatus = "verificado"';
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al sumar ingresos', error: err });
      }
      res.json(result[0]);
    });
  });
  

//=======ENDPOINTS PARA LOS GRAFICOS DE INGRESOS========///

//Endpoint para obtener ingresos agrupados por semana, mes o trimestre segun el filtro.
app.post('/api/ingresos/periodo', (req, res) => {
    const { periodo } = req.body;
    let groupByClause = '';
  
    if (periodo === 'semanal') {
      groupByClause = 'WEEK(fecha_pago)';
    } else if (periodo === 'mensual') {
      groupByClause = 'MONTH(fecha_pago)';
    } else if (periodo === 'trimestral') {
      groupByClause = 'QUARTER(fecha_pago)';
    }
  
    const query = `
      SELECT ${groupByClause} AS periodo, SUM(monto) AS total_ingresos
      FROM pagos
      WHERE estatus = 'verificado'
      GROUP BY periodo
      ORDER BY periodo
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al obtener ingresos por periodo', error: err });
      }
      res.json(results);
    });
  });
  

  //Endpoint para obtener la cantidad de ingresos por cada metodo de pago (grafica de pastel)

// Endpoint para contar el número de estudiantes por método de pago
app.get('/api/ingresos/metodo-pago', (req, res) => {
  const query = `
    SELECT metodo_pago, COUNT(*) AS total_usuarios
    FROM pagos
    WHERE estatus = 'verificado'
    GROUP BY metodo_pago
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener el conteo de usuarios por método de pago', error: err });
    }
    res.json(results);
  });
});




  //===OBTENER ESTUDIANTES CON PAGOS PENDIENTES===///
  app.get('/api/estudiantes/pagos-pendientes', (req, res) => {
    const query = `
      SELECT COUNT(DISTINCT id_estudiante) AS total_pendientes
      FROM pagos
      WHERE estatus = 'no verificado'
    `;
  
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al contar pagos pendientes', error: err });
      }
      res.json(result[0]);
    });
  });
  
// Endpoint para obtener los últimos 4 pagos registrados
app.get('/api/pagos/ultimos', (req, res) => {
  const query = `
    SELECT 
      pagos.id_pago AS id_pago, 
      estudiantes.nombre_completo AS nombre_estudiante, 
      modulos.nombre_modulo AS modulo,
      pagos.estatus AS estado,
      pagos.fecha_pago, 
      pagos.metodo_pago, 
      pagos.monto AS total
    FROM pagos
    INNER JOIN estudiantes ON pagos.id_estudiante = estudiantes.id
    INNER JOIN modulos ON pagos.id_modulo = modulos.id_modulo
    ORDER BY pagos.fecha_pago DESC
    LIMIT 4;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error en la consulta a la base de datos:', err.sqlMessage || err);
      return res.status(500).json({ success: false, message: 'Error al obtener últimos pagos', error: err });
    }
    res.json(results);
  });
});



// Endpoint para obtener el rendimiento de ingresos (crecimiento mensual)
app.get('/api/ingresos/performance', (req, res) => {
  const query = `
    SELECT MONTH(fecha_pago) AS mes, SUM(monto) AS total_ingresos
    FROM pagos
    WHERE estatus = 'verificado'
    GROUP BY MONTH(fecha_pago)
    ORDER BY MONTH(fecha_pago)
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los datos de rendimiento de ingresos:", err);
      return res.status(500).json({ error: "Error al obtener los datos de rendimiento de ingresos" });
    }
    res.json(results);
  });
});

//===ENDPOINT DE EVENTOS PARA EL CALENDARIO===///

//===ENDPOINT DE EVENTOS PARA EL CALENDARIO===///

// ===ENDPOINT DE EVENTOS PARA EL CALENDARIO=== ///

// Obtener todos los eventos
app.get('/api/eventos', (req, res) => {
  db.query('SELECT * FROM eventos', (error, results) => {
    if (error) {
      console.error('Error al obtener eventos:', error);
      res.status(500).json({ message: 'Error al obtener eventos' });
    } else {
      // Muestra solo la fecha sin la hora para cada evento
      const formattedResults = results.map(event => ({
        ...event,
        eventStartDate: event.eventStartDate ? event.eventStartDate.toISOString().split('T')[0] : null,
        eventEndDate: event.eventEndDate ? event.eventEndDate.toISOString().split('T')[0] : null,
      }));
      
      res.json(formattedResults);
    }
  });
});

// Crear un nuevo evento (permite que las fechas sean NULL)
app.post('/api/eventos', (req, res) => {
  const { eventTitle, eventType, eventStartDate = null, eventEndDate = null } = req.body;

  // Verificación de campos obligatorios
  if (!eventTitle || !eventType) {
    return res.status(400).json({ message: 'Faltan datos obligatorios para crear el evento' });
  }

  const insertQuery = `
    INSERT INTO eventos (eventTitle, eventStartDate, eventEndDate, eventType)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertQuery, [eventTitle, eventStartDate, eventEndDate, eventType], (insertError, result) => {
    if (insertError) {
      console.error('Error al crear evento:', insertError);
      res.status(500).json({ message: 'Error al crear evento' });
    } else {
      const newEvent = { id: result.insertId, eventTitle, eventStartDate, eventEndDate, eventType };

      // Verificar si el evento ocurre en 2 días y generar una notificación
      const notificacionQuery = `
        INSERT INTO notificaciones (tipo, mensaje, fecha_creacion, estatus)
        SELECT 
            'eventos',
            CONCAT('El evento "', ?, '" está próximo por llegar.'),
            NOW(),
            'sin leer'
        WHERE DATE(?) = DATE_ADD(CURDATE(), INTERVAL 2 DAY)
      `;

      db.query(notificacionQuery, [eventTitle, eventStartDate], (notificacionError) => {
        if (notificacionError) {
          console.error('Error al generar notificación para el evento:', notificacionError);
        }
        // La notificación es opcional, no afecta la creación del evento.
        res.status(201).json(newEvent);
      });
    }
  });
});


// Actualizar un evento existente
app.put('/api/eventos/:id', (req, res) => {
  const { id } = req.params;
  const { eventTitle, eventType, eventStartDate, eventEndDate } = req.body;

  // Asegura que las fechas se guarden en formato YYYY-MM-DD
  const formattedStartDate = eventStartDate ? new Date(eventStartDate).toISOString().split('T')[0] : null;
  const formattedEndDate = eventEndDate ? new Date(eventEndDate).toISOString().split('T')[0] : null;

  const query = `
    UPDATE eventos 
    SET eventTitle = ?, eventType = ?, eventStartDate = ?, eventEndDate = ? 
    WHERE id = ?
  `;
  
  db.query(query, [eventTitle, eventType, formattedStartDate, formattedEndDate, id], (error, result) => {
    if (error) {
      console.error('Error al actualizar el evento:', error);
      res.status(500).json({ message: 'Error al actualizar el evento' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Evento no encontrado' });
    } else {
      res.json({ message: 'Evento actualizado correctamente' });
    }
  });
});

// Eliminar un evento existente
app.delete('/api/eventos/:id', (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM eventos WHERE id = ?';
  db.query(deleteQuery, [id], (error, result) => {
    if (error) {
      console.error('Error al eliminar el evento:', error);
      res.status(500).json({ message: 'Error al eliminar el evento' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Evento no encontrado' });
    } else {
      res.json({ message: 'Evento eliminado correctamente' });
    }
  });
});


// *****************ENDPOINTS PARA RESTAURACION DE DATOS************************** //
// *****************ENDPOINTS PARA RESTAURACION DE DATOS************************** //
// *****************ENDPOINTS PARA RESTAURACION DE DATOS************************** //


// Definir __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/api/backup', (req, res) => {
  const fileName = `backup_${Date.now()}.sql`; // Nombre del archivo
  const backupPath = path.join(__dirname, 'uploads', fileName); // Ruta al directorio uploads

  // Verifica si el directorio 'uploads' existe
  if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
    console.log('Directorio uploads creado.');
  }

  // Comando para generar el respaldo
  const command = `"C:\\xampp\\mysql\\bin\\mysqldump.exe" -u root example1 > "${backupPath}"`;

  console.log('Ejecutando comando:', command);
  exec(command, (error) => {
    if (error) {
      console.error('Error al generar el respaldo:', error);
      return res.status(500).json({ message: 'Error al generar el respaldo.' });
    }

    console.log(`Respaldo generado en: ${backupPath}`);
    res.json({
      message: 'Respaldo generado correctamente.',
      filePath: `/uploads/${fileName}`, // Devuelve la ruta relativa del archivo
    });
  });
});



// Endpoint Ruta para restaurar la base de datos desde un respaldo
// Configurar multer para manejar la carga de archivos
const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.post('/api/restore', upload.single('file'), (req, res) => {
  const filePath = req.file.path; // Ruta temporal del archivo subido
  console.log('Archivo recibido para restaurar:', filePath);

  // Comando para restaurar el respaldo
  const command = `"C:\\xampp\\mysql\\bin\\mysql.exe" -u root example1 < "${filePath}"`;

  console.log('Ejecutando comando:', command);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error al restaurar el respaldo:', error);
      return res.status(500).json({ message: 'Error al restaurar el respaldo.' });
    }

    console.log('Respaldo restaurado exitosamente:', stdout || stderr);

    // Elimina el archivo después de restaurar
    fs.unlink(filePath, (unlinkError) => {
      if (unlinkError) {
        console.error('Error al eliminar el archivo temporal:', unlinkError);
      } else {
        console.log('Archivo temporal eliminado.');
      }
    });

    res.json({ message: 'Respaldo restaurado correctamente.' });
  });
});

// ENDPOINT PARA LA BITACORA DE HISTORIAL DE REPORTES //////////////////////////////////
app.post('/api/reportes/registrar', (req, res) => {
  console.log('Datos recibidos en el servidor:', req.body);

  const {
    nombre_reporte,
    numero_reporte,
    tipo_reporte,
    comentarios,
    total_modulos,
    total_grupos,
    total_estudiantes_activos,
    monto_total,
    generado_por,
  } = req.body;

  const query = `
    INSERT INTO historial_reportes 
    (nombre_reporte, numero_reporte, tipo_reporte, comentarios, total_modulos, total_grupos, 
     total_estudiantes_activos, monto_total, generado_por) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    nombre_reporte, 
    numero_reporte, 
    tipo_reporte, 
    comentarios, 
    total_modulos, 
    total_grupos, 
    total_estudiantes_activos, 
    monto_total, 
    generado_por,
  ];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al registrar el reporte:', error);
      return res.status(500).send('Error al registrar el reporte');
    }
    res.status(201).send('Reporte registrado exitosamente');
  });
});

// Endpoint para obtener el historial de reportes
app.get('/api/historial-reportes', (req, res) => {
  console.log('Solicitando datos de historial_reportes');

  const query = `
    SELECT 
      id_reporte,
      nombre_reporte,
      numero_reporte,
      tipo_reporte,
      comentarios,
      total_modulos,
      total_grupos,
      total_estudiantes_activos,
      monto_total,
      generado_por,
      fecha_generacion
    FROM historial_reportes
    ORDER BY fecha_generacion DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener los datos del historial_reportes:', err);
      return res.status(500).json({ error: 'Error al obtener los datos del historial_reportes' });
    }
    
    res.status(200).json(results);
  });
});


////////////////////////////////////////////ENDPOINTS NOTIFICACIONES//////////////////////
//Endpoint obtener notificaciones
app.get('/api/notificaciones', (req, res) => {
  const query = `
    SELECT id_notificacion, tipo, mensaje, fecha_creacion, estatus
    FROM notificaciones
    WHERE estatus IN ('sin leer', 'leida')
    ORDER BY fecha_creacion DESC;
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener notificaciones:', error);
      return res.status(500).json({ error: 'Error al obtener las notificaciones.' });
    }

    // Envía los resultados
    res.status(200).json(results);
  });
});


//Endpoint marcar notificacion como "leida"
app.put('/api/notificaciones/leida/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE notificaciones
    SET estatus = 'leída'
    WHERE id_notificacion = ?;
  `;

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error al marcar como leída:', error);
      return res.status(500).json({ error: 'Error al marcar la notificación como leída.' });
    }

    res.status(200).json({ message: 'Notificación marcada como leída.' });
  });
});





//Endpoint archivar una notificacion
app.put('/api/notificaciones/archivar/:id', (req, res) => {
  const { id } = req.params;

  const insertarHistorial = `
    INSERT INTO historial_notificaciones (id_notificacion, tipo, mensaje, fecha_creacion, estatus, accion)
    SELECT id_notificacion, tipo, mensaje, fecha_creacion, estatus, 'archivada'
    FROM notificaciones
    WHERE id_notificacion = ?;
  `;

  const eliminarNotificacion = `
    DELETE FROM notificaciones
    WHERE id_notificacion = ?;
  `;

  db.beginTransaction((err) => {
    if (err) {
      console.error('Error al iniciar la transacción:', err);
      return res.status(500).json({ error: 'Error al archivar la notificación.' });
    }

    // Insertar en historial
    db.query(insertarHistorial, [id], (error, results) => {
      if (error) {
        console.error('Error al insertar en historial_notificaciones:', error);
        return db.rollback(() => {
          res.status(500).json({ error: 'Error al registrar en el historial.' });
        });
      }

      // Eliminar notificación de la tabla notificaciones
      db.query(eliminarNotificacion, [id], (error, results) => {
        if (error) {
          console.error('Error al eliminar la notificación:', error);
          return db.rollback(() => {
            res.status(500).json({ error: 'Error al eliminar la notificación.' });
          });
        }

        db.commit((err) => {
          if (err) {
            console.error('Error al confirmar la transacción:', err);
            return db.rollback(() => {
              res.status(500).json({ error: 'Error al confirmar la acción.' });
            });
          }

          res.status(200).json({ message: 'Notificación archivada correctamente.' });
        });
      });
    });
  });
});





//Endpoint para eliminar la notificacion.
app.delete('/api/notificaciones/:id', (req, res) => {
  const { id } = req.params;

  // Consulta para insertar en historial_notificaciones
  const insertarHistorial = `
    INSERT INTO historial_notificaciones (id_notificacion, tipo, mensaje, fecha_creacion, estatus)
    SELECT id_notificacion, tipo, mensaje, fecha_creacion, estatus
    FROM notificaciones
    WHERE id_notificacion = ?;
  `;

  // Consulta para eliminar de notificaciones
  const eliminarNotificacion = `
    DELETE FROM notificaciones
    WHERE id_notificacion = ?;
  `;

  // Iniciar transacción
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error al iniciar la transacción:', err);
      return res.status(500).json({ error: 'Error al iniciar la transacción.' });
    }

    // Paso 1: Insertar en historial_notificaciones
    db.query(insertarHistorial, [id], (error, results) => {
      if (error) {
        console.error('Error al insertar en historial_notificaciones:', error);
        return db.rollback(() => {
          res.status(500).json({ error: 'Error al registrar en el historial.' });
        });
      }

      // Paso 2: Eliminar de la tabla notificaciones
      db.query(eliminarNotificacion, [id], (error, results) => {
        if (error) {
          console.error('Error al eliminar la notificación:', error);
          return db.rollback(() => {
            res.status(500).json({ error: 'Error al eliminar la notificación.' });
          });
        }

        // Confirmar la transacción
        db.commit((err) => {
          if (err) {
            console.error('Error al confirmar la transacción:', err);
            return db.rollback(() => {
              res.status(500).json({ error: 'Error al confirmar la acción.' });
            });
          }

          res.status(200).json({ message: 'Notificación eliminada y registrada en el historial correctamente.' });
        });
      });
    });
  });
});




//Endpoint para el conteo de notificaciones
app.get('/api/notificaciones/count', (req, res) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM notificaciones
    WHERE estatus = 'sin leer';
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al contar notificaciones sin leer:', error);
      return res.status(500).json({ error: 'Error al contar notificaciones sin leer.' });
    }

    res.status(200).json({ count: results[0].count });
  });
});


//Endpoint para obtener el historial de notificaciones.
app.get('/api/historial-notificaciones', (req, res) => {
  const query = `
    SELECT tipo, mensaje, fecha_creacion, fecha_accion
    FROM historial_notificaciones
    ORDER BY fecha_accion DESC;
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener el historial de notificaciones:', error);
      return res.status(500).json({ error: 'Error al obtener el historial de notificaciones.' });
    }

    res.status(200).json(results);
  });
});













// Función que contiene la lógica para generar notificaciones
const generarNotificacionesEventos = () => {
  console.log('Ejecutando cron para verificar eventos próximos...');

  const query = `
    INSERT INTO notificaciones (tipo, mensaje, fecha_creacion, estatus)
    SELECT 
        'eventos',
        CONCAT('El evento "', eventTitle, '" está próximo por llegar.'),
        NOW(),
        'sin leer'
    FROM eventos
    WHERE DATE(eventStartDate) = DATE_ADD(CURDATE(), INTERVAL 2 DAY)
    AND NOT EXISTS (
        SELECT 1 
        FROM notificaciones 
        WHERE tipo = 'eventos' AND mensaje = CONCAT('El evento "', eventTitle, '" está próximo por llegar.')
    );
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al generar notificaciones de eventos próximos:', err);
    } else {
      console.log(`Notificaciones generadas: ${result.affectedRows}`);
    }
  });
};

// Configurar el cron job diario (0 0 * * *)
cron.schedule('0 0 * * *', generarNotificacionesEventos);


// Endpoint para ejecutar el cron job manualmente
app.post('/api/cron/manual/eventos', (req, res) => {
  try {
    generarNotificacionesEventos();
    res.status(200).json({ success: true, message: 'Cron job ejecutado manualmente.' });
  } catch (error) {
    console.error('Error al ejecutar el cron job manualmente:', error);
    res.status(500).json({ success: false, message: 'Error al ejecutar el cron job manualmente.' });
  }
});







//===========================================================================================
// Iniciar el servidor en el puerto 3001
app.listen(3001, () => {
  console.log('Servidor corriendo en el puerto 3001');
});
