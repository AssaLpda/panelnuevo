// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCu6SyJj6xF4ZFHwV34zVtT7kSWUU0Gjds",
  authDomain: "gestorcasino-1405c.firebaseapp.com",
  databaseURL: "https://gestorcasino-1405c-default-rtdb.firebaseio.com",
  projectId: "gestorcasino-1405c",
  storageBucket: "gestorcasino-1405c.firebasestorage.app",
  messagingSenderId: "544923157042",
  appId: "1:544923157042:web:7d3a4530a2c4880bb8b22b"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const usuariosRef = database.ref('usuarios');
const cargasRef = database.ref('cargas');
const retirosRef = database.ref('retiros');

function mostrarNotificacion(mensaje, tipo = "success") {
  const notificacion = document.getElementById('notificacion');
  notificacion.textContent = mensaje;
  notificacion.className = `fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg transition-all duration-300 ${
    tipo === "error" ? "bg-red-500" : "bg-green-500"
  } text-white`;

  notificacion.classList.remove('hidden', 'opacity-0');
  notificacion.classList.add('opacity-100');

  setTimeout(() => {
    notificacion.classList.add('opacity-0');
    setTimeout(() => notificacion.classList.add('hidden'), 300);
  }, 3000);
}

// Variables globales para manejo de bonificación
let montoBase = null;
let porcentajeBonificacion = 0;

// Limpia inputs de usuario y monto
function limpiarFormularioCarga() {
  document.getElementById('usuario-carga').value = '';
  document.getElementById('monto').value = '';
}

// Registrar carga solo si usuario existe
async function registrarCarga() {
  const usuario = document.getElementById('usuario-carga').value.trim();
  const montoStr = document.getElementById('monto').value.trim();
  const monto = parseFloat(montoStr);

  if (!usuario) {
    mostrarNotificacion("Debe ingresar un nombre de usuario", "error");
    return;
  }
  if (isNaN(monto) || monto <= 0) {
    mostrarNotificacion("Monto inválido", "error");
    return;
  }

  try {
    const snapshot = await usuariosRef
      .orderByChild('usuario')
      .equalTo(usuario)
      .once('value');

    if (!snapshot.exists()) {
      mostrarNotificacion("El usuario no existe en la base de datos", "error");
      return;
    }

    await cargasRef.push({
      usuario: usuario,
      monto: monto,
      montoBase: montoBase !== null ? montoBase : monto,
      porcentajeBonificacion: porcentajeBonificacion,
      timestamp: Date.now(),
      fecha: new Date().toLocaleString("es-AR")
    });

    mostrarNotificacion("Carga registrada correctamente");
    limpiarFormularioCarga();

    // Resetear variables de bonificación después de guardar
    montoBase = null;
    porcentajeBonificacion = 0;

  } catch (error) {
    console.error("Error al guardar la carga:", error);
    mostrarNotificacion("Error al guardar en la base de datos", "error");
  }
}

// Registrar retiro solo si usuario existe
async function registrarRetiro() {
  const usuario = document.getElementById('usuario-carga').value.trim();
  const montoStr = document.getElementById('monto').value.trim();
  const monto = parseFloat(montoStr);

  if (!usuario) {
    mostrarNotificacion("Debe ingresar un nombre de usuario para retiro", "error");
    return;
  }
  if (isNaN(monto) || monto <= 0) {
    mostrarNotificacion("Monto inválido para retiro", "error");
    return;
  }

  try {
    const snapshot = await usuariosRef
      .orderByChild('usuario')
      .equalTo(usuario)
      .once('value');

    if (!snapshot.exists()) {
      mostrarNotificacion("El usuario no existe en la base de datos", "error");
      return;
    }

    await retirosRef.push({
      usuario: usuario,
      monto: monto,
      timestamp: Date.now(),
      fecha: new Date().toLocaleString("es-AR")
    });

    mostrarNotificacion("Retiro registrado correctamente");
    limpiarFormularioCarga();

  } catch (error) {
    console.error("Error al guardar el retiro:", error);
    mostrarNotificacion("Error al guardar retiro en la base de datos", "error");
  }
}

// Copiar al portapapeles
async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    console.error('Error al copiar:', err);

    try {
      const input = document.createElement('input');
      input.value = texto;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      return true;
    } catch (fallbackErr) {
      console.error('Error en fallback de copiado:', fallbackErr);
      mostrarNotificacion(`No se pudo copiar al portapapeles`, "error");
      return false;
    }
  }
}

// Textos rotativos no repetitivos
const textosInfo = [
  `👉 El monto mínimo de carga es $1500 y el de retiro $3000

🌐 Ingresá desde: https://ganamos.bet/home

💳 Hacemos cargas y retiros todos los días, a toda hora 🚀

Avisame si pudiste entrar así te paso los datos del CBU ✅`,

  `Te recuerdo que la carga mínima es: $1500
Retiro mínimo: $3000
🌐 Sitio web: https://ganamos.bet/home

Cargamos y retiramos las 24hs del día los 7 días de la semana al instante!`,

  `📢 Te cuento que el mínimo para cargar es de $1500 y para retirar $3000.
🌐 Sitio web: https://ganamos.biz/home

💸 Trabajamos 24/7 con cargas y retiros instantáneos 🎲🔥

¿Podés acceder? Así te paso el CBU 📲`
];

let ultimoTexto = null;
function obtenerTextoAleatorio() {
  let texto;
  do {
    texto = textosInfo[Math.floor(Math.random() * textosInfo.length)];
  } while (texto === ultimoTexto);
  ultimoTexto = texto;
  return texto;
}

// Generar usuario único
async function generarUsuarioUnico(nombre) {
  if (!database) throw new Error("No hay conexión a la base de datos");

  const nombreLimpio = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .substring(0, 12);

  for (let intentos = 0; intentos < 5; intentos++) {
    const numeroAleatorio = Math.floor(Math.random() * 90) + 10;
    const usuarioGenerado = `B1${nombreLimpio}${numeroAleatorio}`;

    try {
      const snapshot = await usuariosRef
        .orderByChild('usuario')
        .equalTo(usuarioGenerado)
        .once('value');

      if (!snapshot.exists()) return usuarioGenerado;
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      throw new Error("Error al verificar usuario existente");
    }
  }

  throw new Error('No se pudo generar un usuario único. Intente con un nombre diferente');
}

// Crear usuario
async function crearUsuario() {
  const crearUsuarioBtn = document.getElementById('crear-usuario');
  const usuarioInput = document.getElementById('usuario-input');
  const nombre = usuarioInput.value.trim();

  if (!nombre) {
    mostrarNotificacion("Por favor ingrese un nombre para el usuario", "error");
    usuarioInput.focus();
    return;
  }

  if (nombre.length > 14) {
    mostrarNotificacion("Máximo 14 caracteres para el nombre", "error");
    return;
  }

  crearUsuarioBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i> Creando...';
  crearUsuarioBtn.disabled = true;

  try {
    const usuarioGenerado = await generarUsuarioUnico(nombre);
    const clave = "hola123";

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Tiempo de espera agotado")), 8000)
    );

    await Promise.race([
      usuariosRef.push().set({
        usuario: usuarioGenerado,
        nombreOriginal: nombre,
        clave: clave,
        fechaCreacion: firebase.database.ServerValue.TIMESTAMP,
        saldo: 0,
        estado: 'activo'
      }),
      timeoutPromise
    ]);

    const mensajeFinal = `Usuario: ${usuarioGenerado}
Clave: ${clave}

${obtenerTextoAleatorio()}`;

    usuarioInput.value = usuarioGenerado;
    await copiarAlPortapapeles(mensajeFinal);
    mostrarNotificacion("Usuario creado correctamente");

  } catch (error) {
    console.error('Error en el proceso:', error);

    let mensajeError = "Error al crear usuario";
    if (error.message.includes("permission_denied")) {
      mensajeError = "Error: Permisos insuficientes en la base de datos";
    } else if (error.message.includes("Tiempo de espera")) {
      mensajeError = "Error: Tiempo de conexión agotado";
    } else {
      mensajeError = error.message;
    }

    mostrarNotificacion(mensajeError, "error");
  } finally {
    crearUsuarioBtn.innerHTML = '<i class="fas fa-user-plus text-xs"></i> Crear';
    crearUsuarioBtn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('crear-usuario').addEventListener('click', crearUsuario);
  document.getElementById('usuario-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') crearUsuario();
  });

  document.getElementById('btn-cargar').addEventListener('click', registrarCarga);
  document.getElementById('btn-bajar').addEventListener('click', registrarRetiro);

  // Botón Reestablecer - Comportamiento modificado
  document.getElementById('btn-reestablecer').addEventListener('click', async () => {
    const inputUsuario = document.getElementById('usuario-input');
    const usuario = inputUsuario.value.trim();

    if (!usuario) {
      mostrarNotificacion("Ingrese un usuario para reestablecer", "error");
      return;
    }

    try {
      const snapshot = await usuariosRef.orderByChild('usuario').equalTo(usuario).once('value');

      if (!snapshot.exists()) {
        mostrarNotificacion("El usuario no existe en la base de datos", "error");
        return;
      }

      const mensaje = `Usuario reestablecido\nUsuario: ${usuario}\nClave: hola123\nIngresa nuevamente`;

      await copiarAlPortapapeles(mensaje);
      mostrarNotificacion("Credenciales copiadas al portapapeles ✔️");

    } catch (error) {
      console.error("Error al reestablecer usuario:", error);
      mostrarNotificacion("Error al procesar la solicitud", "error");
    }
  });

  // Funcionalidad de desbloqueo
  const btnDesbloquear = document.getElementById('btn-desbloquear');
  if (btnDesbloquear) {
    btnDesbloquear.addEventListener('click', async () => {
      const inputUsuario = document.getElementById('usuario-input');
      const usuario = inputUsuario.value.trim();

      if (!usuario) {
        mostrarNotificacion("Debe ingresar un usuario para desbloquear", "error");
        return;
      }

      try {
        const snapshot = await usuariosRef.orderByChild('usuario').equalTo(usuario).once('value');

        if (!snapshot.exists()) {
          mostrarNotificacion("El usuario no existe en la base de datos", "error");
          return;
        }

        const ahora = new Date().toLocaleString("es-AR");
        const mensaje = `${usuario}, tu usuario fue desbloqueado. Intenta nuevamente ✅\n(${ahora})`;

        await copiarAlPortapapeles(mensaje);
        mostrarNotificacion("Mensaje de desbloqueo copiado al portapapeles");

      } catch (error) {
        console.error("Error al buscar usuario:", error);
        mostrarNotificacion("Error al buscar usuario", "error");
      }
    });
  }

  // Bonificación dropdown
  const btnBonif = document.getElementById('btn-bonif');
  const panelBonif = document.getElementById('panel-bonif');
  const inputMonto = document.getElementById('monto');

  btnBonif.addEventListener('click', () => {
    if (panelBonif.classList.contains('hidden')) {
      const val = parseFloat(inputMonto.value);
      if (isNaN(val) || val <= 0) {
        mostrarNotificacion("Ingrese un monto válido antes de aplicar bonificación", "error");
        return;
      }
      montoBase = val;
      panelBonif.classList.remove('hidden');
    } else {
      panelBonif.classList.add('hidden');
      if (montoBase !== null) {
        inputMonto.value = montoBase.toFixed(2);
      }
      limpiarFormularioCarga();
      montoBase = null;
      porcentajeBonificacion = 0;
    }
  });

  panelBonif.querySelectorAll('.bonif-option').forEach(btn => {
    btn.addEventListener('click', async () => {
      const porcentaje = parseFloat(btn.getAttribute('data-porcentaje'));
      if (montoBase === null) return;

      const usuario = document.getElementById('usuario-carga').value.trim();
      if (!usuario) {
        mostrarNotificacion("Debe ingresar un usuario antes de aplicar bonificación", "error");
        return;
      }

      try {
        const snapshot = await usuariosRef
          .orderByChild('usuario')
          .equalTo(usuario)
          .once('value');

        if (!snapshot.exists()) {
          mostrarNotificacion("El usuario no existe en la base de datos", "error");
          return;
        }

        porcentajeBonificacion = porcentaje;
        const nuevoMonto = montoBase * (1 + porcentaje / 100);
        inputMonto.value = nuevoMonto.toFixed(2);

        mostrarNotificacion(`Bonificación aplicada: ${porcentaje}%`);
        panelBonif.classList.add('hidden');

      } catch (error) {
        console.error("Error al verificar usuario para bonificación:", error);
        mostrarNotificacion("Error al verificar usuario", "error");
      }
    });
  });

  // Modal historial general
  const btnHistorial = document.getElementById('btn-historial');
  const modalHistorial = document.getElementById('modal-historial');
  const cerrarModalBtn = document.getElementById('cerrar-modal');
  const contenidoHistorial = document.getElementById('contenido-historial');

  btnHistorial.addEventListener('click', async () => {
    contenidoHistorial.innerHTML = 'Cargando historial...';

    try {
      const ahora = Date.now();
      const cincoHorasAntes = ahora - 5 * 60 * 60 * 1000;

      const cargasSnap = await cargasRef
        .orderByChild('timestamp')
        .startAt(cincoHorasAntes)
        .once('value');

      const retirosSnap = await retirosRef
        .orderByChild('timestamp')
        .startAt(cincoHorasAntes)
        .once('value');

      const cargas = cargasSnap.exists() ? cargasSnap.val() : {};
      const retiros = retirosSnap.exists() ? retirosSnap.val() : {};

      const eventos = [];

      for (const key in cargas) {
        eventos.push({
          tipo: 'carga',
          usuario: cargas[key].usuario,
          monto: cargas[key].monto,
          montoBase: cargas[key].montoBase,
          porcentajeBonificacion: cargas[key].porcentajeBonificacion,
          fecha: cargas[key].fecha,
          timestamp: cargas[key].timestamp
        });
      }

      for (const key in retiros) {
        eventos.push({
          tipo: 'retiro',
          usuario: retiros[key].usuario,
          monto: retiros[key].monto,
          fecha: retiros[key].fecha,
          timestamp: retiros[key].timestamp
        });
      }

      eventos.sort((a, b) => b.timestamp - a.timestamp);

      if (eventos.length === 0) {
        contenidoHistorial.innerHTML = '<p class="text-center text-gray-600">No hay movimientos en las últimas 5 horas.</p>';
      } else {
        contenidoHistorial.innerHTML = '';

        eventos.forEach(ev => {
          const div = document.createElement('div');
          div.className = `p-2 rounded mb-1 text-sm ${
            ev.tipo === 'carga' ? (Number(ev.porcentajeBonificacion) > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800') : 'bg-red-100 text-red-800'
          }`;

          let infoBonif = '';
          if (ev.tipo === 'carga' && Number(ev.porcentajeBonificacion) > 0) {
            const base = Number(ev.montoBase);
            infoBonif = `<br><em>Bonificación: ${Number(ev.porcentajeBonificacion)}% (Base: $${isNaN(base) ? ev.montoBase : base.toFixed(2)})</em>`;
          }

          div.innerHTML = `<strong>${ev.tipo === 'carga' ? 'Carga' : 'Retiro'}</strong> — Usuario: <span class="font-mono">${ev.usuario}</span><br>
          Monto: $${Number(ev.monto).toFixed(2)}${infoBonif}<br>
          Fecha: ${ev.fecha}`;

          contenidoHistorial.appendChild(div);
        });
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
      contenidoHistorial.innerHTML = `<p class="text-center text-red-600">Error cargando historial</p>`;
    }

    modalHistorial.classList.remove('hidden');
  });

  cerrarModalBtn.addEventListener('click', () => {
    modalHistorial.classList.add('hidden');
  });

  modalHistorial.addEventListener('click', (e) => {
    if (e.target === modalHistorial) {
      modalHistorial.classList.add('hidden');
    }
  });


  // Nuevo: Modal historial para usuario específico
  const btnHistorialUsuario = document.getElementById('btn-historial-usuario');
  const modalHistorialUsuario = document.getElementById('modal-historial-usuario');
  const cerrarModalUsuarioBtn = document.getElementById('cerrar-modal-usuario');
  const contenidoHistorialUsuario = document.getElementById('contenido-historial-usuario');

  btnHistorialUsuario.addEventListener('click', async () => {
    const usuario = document.getElementById('usuario-input').value.trim();

    if (!usuario) {
      mostrarNotificacion("Ingrese un usuario para ver historial", "error");
      return;
    }

    contenidoHistorialUsuario.innerHTML = 'Cargando historial del usuario...';

    try {
      // Cargas filtradas por usuario
      const cargasSnap = await cargasRef
        .orderByChild('usuario')
        .equalTo(usuario)
        .limitToLast(30)
        .once('value');

      // Retiros filtrados por usuario
      const retirosSnap = await retirosRef
        .orderByChild('usuario')
        .equalTo(usuario)
        .limitToLast(30)
        .once('value');

      const cargas = cargasSnap.exists() ? cargasSnap.val() : {};
      const retiros = retirosSnap.exists() ? retirosSnap.val() : {};

      // Unificar y ordenar eventos por timestamp descendente
      const eventos = [];

      for (const key in cargas) {
        eventos.push({
          tipo: 'carga',
          usuario: cargas[key].usuario,
          monto: cargas[key].monto,
          montoBase: cargas[key].montoBase,
          porcentajeBonificacion: cargas[key].porcentajeBonificacion,
          fecha: cargas[key].fecha,
          timestamp: cargas[key].timestamp
        });
      }

      for (const key in retiros) {
        eventos.push({
          tipo: 'retiro',
          usuario: retiros[key].usuario,
          monto: retiros[key].monto,
          fecha: retiros[key].fecha,
          timestamp: retiros[key].timestamp
        });
      }

      eventos.sort((a, b) => b.timestamp - a.timestamp);

      if (eventos.length === 0) {
        contenidoHistorialUsuario.innerHTML = '<p class="text-center text-gray-600">No hay movimientos para este usuario.</p>';
      } else {
        contenidoHistorialUsuario.innerHTML = '';

        eventos.forEach(ev => {
          const div = document.createElement('div');
          div.className = `p-1 rounded mb-0.5 text-xxs ${
            ev.tipo === 'carga' ? (Number(ev.porcentajeBonificacion) > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800') : 'bg-red-100 text-red-800'
          }`;

          let infoBonif = '';
          if (ev.tipo === 'carga' && Number(ev.porcentajeBonificacion) > 0) {
            const base = Number(ev.montoBase);
            infoBonif = `<br><em>Bonificación: ${Number(ev.porcentajeBonificacion)}% (Base: $${isNaN(base) ? ev.montoBase : base.toFixed(2)})</em>`;
          }

          div.innerHTML = `<strong>${ev.tipo === 'carga' ? 'Carga' : 'Retiro'}</strong><br>
          Monto: $${Number(ev.monto).toFixed(2)}${infoBonif}<br>
          Fecha: ${ev.fecha}`;

          contenidoHistorialUsuario.appendChild(div);
        });
      }
    } catch (error) {
      console.error("Error cargando historial de usuario:", error);
      contenidoHistorialUsuario.innerHTML = `<p class="text-center text-red-600">Error cargando historial del usuario</p>`;
    }

    modalHistorialUsuario.classList.remove('hidden');
  });

  cerrarModalUsuarioBtn.addEventListener('click', () => {
    modalHistorialUsuario.classList.add('hidden');
  });

  modalHistorialUsuario.addEventListener('click', (e) => {
    if (e.target === modalHistorialUsuario) {
      modalHistorialUsuario.classList.add('hidden');
    }
  });

  const mensajesUsuariosNuevos = [
  `Hola, ¿cómo andás? ¡Qué bueno que quieras sumarte a la diversión! 🎉🎰

Primero te vamos a crear tu usuario y contraseña para ingresar a https://ganamos.bet/home

👉 Para cargar fichas solo hace falta que hagas una transferencia bancaria, te paso el CBU.

Podés cargar el monto que prefieras.

💵 Carga mínima: $1500
💵 Retiro mínimo: $3000

📤 Los retiros también se hacen por CBU.

⏰ Estamos disponibles 24/7 para que juegues cuando quieras.
Si tenés alguna consulta, escribinos sin problema 🙌`,

  `¡Hola! ¿Todo bien? Genial que quieras empezar a jugar con nosotros 🎲🔥

Vamos a crear tu usuario y contraseña para que puedas acceder a https://ganamos.bet/home 🎰😊

Para cargar fichas y jugar, solo tenés que hacer una transferencia bancaria. Te paso el CBU y podés ingresar el monto que prefieras.

💲 Carga mínima: $1500
💲 Retiro mínimo: $3000

Los retiros también se hacen por transferencia a CBU 💸

⚠️ Estamos disponibles las 24 horas, los 7 días de la semana para que juegues cuando quieras 🙌🏼

Si tenés alguna consulta, no dudes en preguntarme 🙏🏼`,

  `¡Hola! Qué bueno que te sumes a jugar con nosotros 🎰✨

Te vamos a generar un usuario y clave para que puedas ingresar a https://ganamos.bet/home 🎰✨

Para cargar fichas y empezar a jugar, solo tenés que hacer una transferencia bancaria. Te paso el CBU y podés acreditar el monto que desees.

Monto mínimo para cargar: $1500 💲
Monto mínimo para retirar: $3000 💲

Los retiros de premios también se realizan por transferencia a CBU 💸

⚠️ Estamos disponibles las 24 horas, todos los días de la semana para que disfrutes cuando quieras 🙌🏼

Si necesitás ayuda o tenés alguna pregunta, podes escribirme sin problema 🙏🏼`
];

let ultimoMensajeUsuarioNuevo = null;

document.getElementById('btn-info-nuevos').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesUsuariosNuevos[Math.floor(Math.random() * mensajesUsuariosNuevos.length)];
  } while (mensaje === ultimoMensajeUsuarioNuevo);

  ultimoMensajeUsuarioNuevo = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacion("Mensaje de info para usuarios nuevos copiado al portapapeles ✔️");
  }
});

const mensajesBienvenida = [
  `¡Hola! Bienvenido/a ❤️ Para poder crear tu usuario y contraseña, ¿me podés pasar tu nombre completo, por favor?`,

  `¡Hola! ¿Me podrías decir tu nombre completo para crear tu usuario y contraseña y que puedas empezar a jugar? 😊`,

  `¡Bienvenido/a!❤️ Para generar tu usuario y clave, necesito que me pases tu nombre completo, ¿podés? 🙌`
];

let ultimoMensajeBienvenida = null;

document.getElementById('btn-bienvenida').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesBienvenida[Math.floor(Math.random() * mensajesBienvenida.length)];
  } while (mensaje === ultimoMensajeBienvenida);

  ultimoMensajeBienvenida = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacion("Mensaje de bienvenida copiado al portapapeles ✔️");
  }
});

const mensajesMinimos = [
  `📢 Te comento que:\n💵 Monto mínimo de carga: $1500\n💸 Monto mínimo de retiro: $3000`,
  `ℹ️ Importante a tener en cuenta:\n✅ Carga mínima: $1500 💰\n✅ Retiro mínimo: $3000 🏧`,
  `📝 Te paso los montos mínimos:\n📥 Cargar fichas: desde $1500\n📤 Retirar premios: desde $3000`
];

let ultimoMensajeMinimos = null;

document.getElementById('btn-minimos').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesMinimos[Math.floor(Math.random() * mensajesMinimos.length)];
  } while (mensaje === ultimoMensajeMinimos && mensajesMinimos.length > 1);

  ultimoMensajeMinimos = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) mostrarNotificacion("Mensaje copiado ✔️");
});

const mensajesPlataforma = [
  `Nuestra plataforma es: https://www.ganamos.bet/home`,
  `Te dejo la web: https://www.ganamos.bet/home`,
  `Link para ingresar: https://www.ganamos.bet/home`
];

let ultimoMensajePlataforma = null;

document.getElementById('btn-plataforma').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesPlataforma[Math.floor(Math.random() * mensajesPlataforma.length)];
  } while (mensaje === ultimoMensajePlataforma && mensajesPlataforma.length > 1);

  ultimoMensajePlataforma = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) mostrarNotificacion("Link copiado ✔️");
});
const mensajesGrupoPrivado = [
  `¡Hola! 😊 A partir de ahora, todas las cargas y retiros se gestionan desde un grupo privado.
🔗 Te paso el link para que te unas 🔒
En ese grupo está nuestro equipo listo para ayudarte con lo que necesites 🙌
Es exclusivo, solo para vos 💎
Una vez que entres, avisá si querés cargar o retirar. ¡Gracias! 🎰💖`,

  `¡Hola! 👋 Desde este momento, las cargas y retiros se realizan únicamente dentro de un grupo privado.
🔐 Te comparto el link para que te unas.
Ahí vas a tener atención directa del equipo y asistencia las 24hs 🕒💬
📢 Es un grupo exclusivo para vos.
Cuando ingreses, solo tenés que avisar si querés cargar fichas o hacer un retiro. ¡Gracias por estar! 🎲💰`,

  `¡Bienvenido/a! 😄 Todas las cargas y retiros se hacen ahora a través de un grupo privado.
🔗 Acá tenés el link para sumarte 🔒
Nuestro equipo está ahí para ayudarte cuando lo necesites 🤝
👤 Es un grupo exclusivo y personalizado.
Cuando estés dentro, avisá lo que necesitás: cargar o retirar, ¡y listo! 🎉🎰`
];

let ultimoMensajeGrupo = null;

document.getElementById('btn-unirse').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesGrupoPrivado[Math.floor(Math.random() * mensajesGrupoPrivado.length)];
  } while (mensaje === ultimoMensajeGrupo && mensajesGrupoPrivado.length > 1);

  ultimoMensajeGrupo = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) mostrarNotificacion("Mensaje copiado ✔️");
});
const mensajesContactoGrupo = [
  `Buenas❤️
Te pido que nos escribas por tu grupo asignado, es el único canal de atención que usamos 🛎️🙌🏻
¡Gracias por tu comprensión!`,

  `¡Hola! ❤️ Para cualquier consulta o gestión, recordá que solo respondemos por tu grupo asignado 🔒
Es nuestro canal exclusivo de atención 🛎️✨`,

  `¡Hola hola! ❤️
¿Todo bien? Por favor, escribinos únicamente por tu grupo privado ✅
Es el único canal habilitado para cargas, retiros y consultas 🛎️💬`
];

let ultimoMensajeContacto = null;

document.getElementById('btn-contactanos').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesContactoGrupo[Math.floor(Math.random() * mensajesContactoGrupo.length)];
  } while (mensaje === ultimoMensajeContacto && mensajesContactoGrupo.length > 1);

  ultimoMensajeContacto = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) mostrarNotificacion("Mensaje copiado ✔️");
});
const mensajesInfo = [
  "🎉 ¡Felicitaciones por tu premio! Para hacer el retiro, enviános tu CBU, nombre del titular y el monto que querés retirar. ¡Dale que es tuyo! 💰🙌",
  "🎊 ¡Genial! Ganaste un premio 🎉. Para retirar, mandanos tu CBU, titular y cuánto querés retirar. ¡Estamos para ayudarte! 💸💪",
  "🏆 ¡Felicitaciones! Para poder retirar tu premio, pasanos tu CBU, el nombre del titular y el monto a retirar. ¡Vamos que ya falta poco! 💰👏.. ⚠️Recorda que las bonificaciones no son extraibles"
];

let ultimoMensajeInfo = null;

document.getElementById('btn-info-retiro').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesInfo[Math.floor(Math.random() * mensajesInfo.length)];
  } while (mensaje === ultimoMensajeInfo);

  ultimoMensajeInfo = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacion("Mensaje de Info de retiro copiado ✔️");
  }
});

const mensajesFelicitaciones = [
  "🎉 ¡Felicitaciones! Para que sigas jugando sin parar, por cada amigo que refieras y cargue, te regalo $3000 para tu próxima recarga. 🍀🎰 ¡No lo dejes pasar, compartí y ganá!",
  "🎊 ¡Excelente! Por cada amigo que invites y realice su carga, recibís $3000 para usar en tu próxima recarga. 🍀🎰 ¡Seguí jugando y compartiendo la diversión!",
  "🎉 ¡Genial! Por cada amigo que traigas y que cargue, te doy $3000 para tu próxima carga. 🍀🎰 ¡Aprovechá y seguí ganando con tus referidos!"
];

let ultimoMensajeFelicitaciones = null;

document.getElementById('btn-felicitaciones').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesFelicitaciones[Math.floor(Math.random() * mensajesFelicitaciones.length)];
  } while (mensaje === ultimoMensajeFelicitaciones);

  ultimoMensajeFelicitaciones = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacion("Mensaje de felicitaciones copiado ✔️");
  }
});

const mensajesAgendame = [
  `🙋‍♀️ ¡Celeste acá! 📲 Agendame así no te perdés ninguna promo 🎉
¿Sabías que por cada referido te regalo $3000 para tu próxima carga? 🎰💰
Solo tienen que mencionar tu usuario ¡y listo! Las fichas son tuyas 💎
¡Dale que se viene lo bueno! 🚀🔥`,

  `¡Hola! Celeste te saluda 🙋‍♀️
📲 Agendame así estás al tanto de todas las promos 🎉
Cada vez que un amigo mencione tu usuario y haga su carga, te llevás $3000 para tu próxima recarga 💰🎰
¡No te lo pierdas! Lo que viene, viene con todo 🚀🔥`,

  `🙋‍♀️ Soy Celeste, ¡agendame! 📲 Así no te perdés ninguna novedad ni promo 🎉
🎰 Por cada persona que refieras y cargue fichas, ganás $3000 para usar en tu próxima carga 💸
Solo deben decir tu usuario y listo. ¡Vamos con toda! 🚀🔥`
];

let ultimoMensajeAgendame = null;

document.getElementById('btn-agendame').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesAgendame[Math.floor(Math.random() * mensajesAgendame.length)];
  } while (mensaje === ultimoMensajeAgendame);

  ultimoMensajeAgendame = mensaje;
  await copiarAlPortapapeles(mensaje);
  mostrarNotificacion("Mensaje de Agendame copiado al portapapeles ✔️");
});
const modalTope = document.getElementById('modal-tope-retiros');
const btnTope = document.getElementById('btn-tope-retiros');
const cerrarTope = document.getElementById('cerrar-modal-tope');

btnTope.addEventListener('click', () => {
  modalTope.classList.remove('hidden');
});

cerrarTope.addEventListener('click', () => {
  modalTope.classList.add('hidden');
});

modalTope.addEventListener('click', (e) => {
  if (e.target === modalTope) {
    modalTope.classList.add('hidden');
  }
});

let modoEditarDatos = false;

const titularInput = document.getElementById('input-titular');
const cbuInput = document.getElementById('input-cbu');
const aliasInput = document.getElementById('input-alias');
const boton = document.getElementById('btn-guardar-datos');

async function cargarDatosBancarios() {
  try {
    const snapshot = await firebase.database().ref('datosbancarios').get();
    if (snapshot.exists()) {
      const datos = snapshot.val();
      titularInput.value = datos.titular || '';
      cbuInput.value = datos.cbu || '';
      aliasInput.value = datos.alias || '';

      // Bloqueamos inputs al cargar datos
      titularInput.disabled = true;
      cbuInput.disabled = true;
      aliasInput.disabled = true;
      boton.textContent = 'Editar Datos';
      modoEditarDatos = true;
    } else {
      // No hay datos guardados aún
      titularInput.value = '';
      cbuInput.value = '';
      aliasInput.value = '';
      titularInput.disabled = false;
      cbuInput.disabled = false;
      aliasInput.disabled = false;
      boton.textContent = 'Guardar Datos';
      modoEditarDatos = false;
    }
  } catch (error) {
    console.error('Error al cargar datos bancarios:', error);
    mostrarNotificacion('Error al cargar datos bancarios', 'error');
  }
}

boton.addEventListener('click', async () => {
  if (!modoEditarDatos) {
    // Guardar datos
    const titular = titularInput.value.trim();
    const cbu = cbuInput.value.trim();
    const alias = aliasInput.value.trim();

    if (!titular || !cbu || !alias) {
      mostrarNotificacion('Completá todos los campos', 'error');
      return;
    }

    try {
      await firebase.database().ref('datosbancarios').set({
        titular,
        cbu,
        alias
      });
      mostrarNotificacion('Datos bancarios guardados correctamente ✅');

      titularInput.disabled = true;
      cbuInput.disabled = true;
      aliasInput.disabled = true;
      boton.textContent = 'Editar Datos';
      modoEditarDatos = true;
    } catch (error) {
      console.error('Error al guardar datos bancarios:', error);
      mostrarNotificacion('Error al guardar datos bancarios', 'error');
    }
  } else {
    // Modo editar
    titularInput.disabled = false;
    cbuInput.disabled = false;
    aliasInput.disabled = false;
    boton.textContent = 'Guardar Datos';
    modoEditarDatos = false;
  }
});

// Llamar esta función al cargar la página
cargarDatosBancarios();


document.getElementById('btn-cbu').addEventListener('click', async () => {
  const titular = document.getElementById('input-titular').value.trim();
  const cbu = document.getElementById('input-cbu').value.trim();
  const alias = document.getElementById('input-alias').value.trim();

  if (!titular || !cbu || !alias) {
    mostrarNotificacion("Faltan completar datos para copiar", "error");
    return;
  }

  const campos = [
    `Titular: ${titular}`,
    `CBU: ${cbu}`,
    `Alias: ${alias}`
  ];

  // Desordenar el array aleatoriamente
  const camposAleatorios = campos.sort(() => Math.random() - 0.5);

  const mensaje = camposAleatorios.join('\n');

  try {
    await navigator.clipboard.writeText(mensaje);
    mostrarNotificacion("Datos copiados al portapapeles ✅");
  } catch (err) {
    mostrarNotificacion("Error al copiar los datos", "error");
  }
});

const mensajesCBU = [
  (titular, cbu, alias) => 
    `¡Hola! ¿Todo bien? 😊

💳 Te paso los datos para transferir:
Alias: ${alias}
CBU: ${cbu}
🧾 A nombre de: ${titular}

Mandame el comprobante y te acredito las fichas 🎰
⚠️ Siempre revisá el alias antes de hacer la transferencia.`,

  (titular, cbu, alias) =>
    `¡Hey! 👋 ¿Cómo estás?
Acá van los datos para cargar tus fichas:

Titular: ${titular}
CBU: ${cbu}
Alias: ${alias}

📩 Enviame el comprobante cuando termines y te acredito al toque 🎰
⚠️ Verificá el alias antes de transferir.`,

  (titular, cbu, alias) =>
    `¡Hola! 😊 Te paso los datos para que puedas hacer la transferencia:

🏦 CBU: ${cbu}
📛 Alias: ${alias}
👤 A nombre de: ${titular}

📩 Mandame el comprobante una vez que transfieras y te cargo las fichas 🎰
⚠️ Siempre chequeá que el alias sea correcto antes de enviar.`,

  (titular, cbu, alias) =>
    `💳 Te paso los datos para transferir:

🧾 A nombre de: ${titular}
      CBU: ${cbu}
      Alias: ${alias}

Mandame el comprobante y te acredito las fichas 🎰
⚠️ Siempre revisá el alias antes de hacer la transferencia.`,

  (titular, cbu, alias) =>
    `Acá van los datos para cargar tus fichas:

💳 CBU: ${cbu}
📌 Alias: ${alias}
👤 Titular: ${titular}

📩 Enviame el comprobante cuando termines y te acredito al toque 🎰
⚠️ Verificá el alias antes de transferir.`,

  (titular, cbu, alias) =>
    `Te paso los datos para que puedas hacer la transferencia:

📛 Alias: ${alias}
🏦 CBU: ${cbu}
👤 A nombre de: ${titular}

📩 Mandame el comprobante una vez que transfieras y te cargo las fichas 🎰
⚠️ Siempre chequeá que el alias sea correcto antes de enviar.`
];

// Resto del código igual
let ultimoMensajeIndex = null;

document.getElementById('btn-cbu').addEventListener('click', async () => {
  const titular = document.getElementById('input-titular').value.trim();
  const cbu = document.getElementById('input-cbu').value.trim();
  const alias = document.getElementById('input-alias').value.trim();

  if (!titular || !cbu || !alias) {
    mostrarNotificacion("Faltan completar datos para copiar", "error");
    return;
  }

  let index;
  do {
    index = Math.floor(Math.random() * mensajesCBU.length);
  } while (index === ultimoMensajeIndex);
  ultimoMensajeIndex = index;

  const mensaje = mensajesCBU[index](titular, cbu, alias);

  try {
    await navigator.clipboard.writeText(mensaje);
    mostrarNotificacion("Mensaje CBU copiado al portapapeles ✅");
  } catch (err) {
    mostrarNotificacion("Error al copiar los datos", "error");
  }
});

const montoInput = document.getElementById('monto');
const montoDropdown = document.getElementById('monto-dropdown');
const montoButtons = montoDropdown.querySelectorAll('.monto-btn');

// Mostrar dropdown al enfocar el input
montoInput.addEventListener('focus', () => {
  montoDropdown.classList.remove('hidden');
});

// Opcional: también mostrar al hacer click dentro del input (por si no enfoca por teclado)
montoInput.addEventListener('click', () => {
  montoDropdown.classList.remove('hidden');
});

// Al hacer click en un botón del dropdown, poner el valor en el input y ocultar dropdown
montoButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    montoInput.value = btn.textContent.replace(/,/g, ''); // Quitar comas si querés solo número limpio
    montoDropdown.classList.add('hidden');
    montoInput.focus();
  });
});

// Cerrar el dropdown si se hace click fuera del input o dropdown
document.addEventListener('click', (e) => {
  if (!montoInput.contains(e.target) && !montoDropdown.contains(e.target)) {
    montoDropdown.classList.add('hidden');
  }
});


const db = firebase.database();

// Mostrar modal al hacer click en el botón principal
document.getElementById("btn-descargar-retiros").addEventListener("click", () => {
  document.getElementById("modal-turnos-retiros").classList.remove("hidden");
});

// Cerrar modal
document.getElementById("cerrar-modal-retiros").addEventListener("click", () => {
  document.getElementById("modal-turnos-retiros").classList.add("hidden");
});

// Asignar evento a cada botón del turno dentro del modal
document.querySelectorAll(".btn-turno-retiro").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const turnoKey = btn.dataset.turno;
    document.getElementById("modal-turnos-retiros").classList.add("hidden");
    await descargarRetirosPorTurno(turnoKey);
  });
});

async function descargarRetirosPorTurno(turnoKey) {
  try {
    const snapshot = await db.ref("retiros").once("value");
    const retirosData = snapshot.val();

    if (!retirosData) {
      alert("No hay retiros en la base de datos.");
      return;
    }

    const retiros = Object.values(retirosData);
    const retirosFiltrados = filtrarRetirosPorTurno(retiros, turnoKey);

    if (retirosFiltrados.length === 0) {
      alert("No hay retiros en este turno.");
      return;
    }

    generarPDFRetiros(retirosFiltrados, turnoKey);
  } catch (error) {
    console.error("Error al obtener retiros:", error);
    alert("Error al obtener retiros. Revisa la consola.");
  }
}

function filtrarRetirosPorTurno(retiros, turno) {
  return retiros.filter((retiro) => {
    const fechaObj = new Date(retiro.timestamp);
    const hora = fechaObj.getHours();

    if (turno === "02-10") {
      return hora >= 2 && hora < 10;
    } else if (turno === "10-18") {
      return hora >= 10 && hora < 18;
    } else if (turno === "18-02") {
      return hora >= 18 || hora < 2;
    }
    return false;
  });
}

function generarPDFRetiros(retiros, turno) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Reporte de Retiros", 10, 10);
  doc.setFontSize(11);
  doc.text(`Turno: ${turno}`, 10, 18);

  // Encabezados
  doc.setFontSize(12);
  doc.text("Usuario", 10, 28);
  doc.text("Monto", 70, 28);

  let y = 36;
  let total = 0;

  retiros.forEach((retiro) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10);
    doc.text(retiro.usuario, 10, y);
    doc.text(`$${retiro.monto.toLocaleString()}`, 70, y);
    y += 8;

    total += Number(retiro.monto);
  });

  // Mostrar total
  if (y > 280) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.text("Total:", 10, y + 10);
  doc.text(`$${total.toLocaleString()}`, 70, y + 10);

  doc.save(`retiros_${turno.replace("-", "_")}.pdf`);
}

// Modo oscuro toggle
const btnModoOscuro = document.getElementById('btn-modo-oscuro');
const body = document.body;

// Cargar estado guardado en localStorage (si existe)
if (localStorage.getItem('modoOscuro') === 'true') {
  body.classList.add('modo-oscuro');
}

btnModoOscuro.addEventListener('click', () => {
  body.classList.toggle('modo-oscuro');
  // Guardar estado
  const modoOscuroActivo = body.classList.contains('modo-oscuro');
  localStorage.setItem('modoOscuro', modoOscuroActivo);
});


const btnInfoReferidos = document.getElementById('btn-info-referidos');

const mensajes = [
  `🎉 ¡Sumá fichas gratis invitando amigos con nuestro plan de referidos!

Por cada amigo que invites y realice su primer depósito, recibís 3000 fichas para usar en tu próxima carga 🎰🎁

Pídanle que mencionen tu usuario para poder acreditar la bonificación ☘️

El bono se aplica luego de la primera carga del referido y se acumula en tu siguiente recarga.

Recordanos tus referidos cuando hagas tu carga para agregar el bono.

Las bonificaciones son para jugar, no para retirar`,

  `🎉 ¡Sumate a nuestro programa de referidos y llevate fichas gratis!

Por cada amigo que invites y haga su primera carga, te regalamos 3000 fichas para usar en tu próxima recarga 🎰🎁

Solo pediles que mencionen tu nombre de usuario al cargar para que puedas recibir la bonificación ☘️

El bono se activa después de la carga inicial del referido y se suma en tu siguiente recarga.

Recordanos tus referidos al cargar para que te acreditemos el premio.

Las bonificaciones son solo para jugar, no se pueden retirar.`,

  `🎉 ¡Invitá a tus amigos y ganá fichas gratis con nuestro plan de referidos!

Cada amigo que venga de tu parte y realice su primera carga te suma 3000 fichas extras para tu próxima recarga 🎰🎁

Solo asegurate que digan tu nombre de usuario al hacer la carga para acreditarte el bono ☘️

La bonificación se acredita luego de la primera carga del referido y se suma a tu siguiente recarga.

No olvides avisarnos quiénes son tus referidos al momento de cargar para sumar el bono.

Las fichas del bono solo pueden usarse para jugar, no para retirar.`
];

btnInfoReferidos.addEventListener('click', async () => {
  const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
  try {
    await navigator.clipboard.writeText(mensaje);
    mostrarNotificacion("Mensaje copiado al portapapeles ✅");
  } catch (err) {
    mostrarNotificacion("Error al copiar el mensaje", "error");
  }
});



  const mensajeDerivacion = `Hola, ¿cómo estás?
Te pido que por favor envíes el comprobante al número principal junto con el nombre de usuario que se te asignó, así pueden cargarte al instante 👇

📲 +543813595069

Para que sea más fácil, podés hacer clic en este link y te deriva directo a nuestro chat para enviar:
👉 https://wa.me/543813595069?text=Hola%2C%20mi%20usuario%20es%3A%20%0AAhora%20te%20env%C3%ADo%20el%20comprobante`;

  document.getElementById("btn-derivar").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(mensajeDerivacion);
      mostrarNotificacion("Mensaje de derivación copiado al portapapeles ✅");
    } catch (err) {
      mostrarNotificacion("Error al copiar el mensaje", "error");
      console.error(err);
    }
  });






});



































