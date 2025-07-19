// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCumnVuD9kdmdtT41ylR-ulkNaTUgZBBpk",
  authDomain: "gestortest1-3e23b.firebaseapp.com",
  databaseURL: "https://gestortest1-3e23b-default-rtdb.firebaseio.com",
  projectId: "gestortest1-3e23b",
  storageBucket: "gestortest1-3e23b.appspot.com",
  messagingSenderId: "1022461211268",
  appId: "1:1022461211268:web:cc37900be57bdeda1608d1",
  measurementId: "G-BY5XBEV30P"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Helpers
function toKey(nombre) {
  return nombre.trim().toLowerCase();
}

function mostrarNotificacion(texto, color = "bg-green-500") {
  const noti = document.getElementById("notificacion");
  noti.textContent = texto;
  noti.className = `fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow-lg transition-all duration-300 z-50 ${color}`;
  noti.classList.remove("hidden");
  setTimeout(() => noti.classList.add("hidden"), 3000);
}

async function usuarioExiste(usuarioKey) {
  const snapshot = await db.ref(`usuarios/${usuarioKey}`).once("value");
  return snapshot.exists() ? snapshot.val() : null;
}


// Función para normalizar la clave del usuario (minúsculas, sin espacios)
function toKey(str) {
  return str.toLowerCase().replace(/\s+/g, '');
}

// Función para verificar si el usuario existe en la base
async function usuarioExiste(usuarioKey) {
  const snapshot = await db.ref(`usuarios/${usuarioKey}`).once('value');
  return snapshot.exists();
}

// Crear usuario
document.getElementById("crear-usuario").addEventListener("click", async () => {
  const input = document.getElementById("usuario-input");
  const nombreBase = input.value.trim();
  if (!nombreBase) return mostrarNotificacion("⚠️ Ingresá un nombre base.", "yellow");

  const generarNombreUnico = () => `B1${nombreBase}${Math.floor(Math.random() * 100)}`;
  let intentos = 0, nombreGenerado, usuarioKey, existe = true;

  while (existe && intentos < 10) {
    nombreGenerado = generarNombreUnico();
    usuarioKey = toKey(nombreGenerado);
    existe = await usuarioExiste(usuarioKey);
    intentos++;
  }

  if (existe) return mostrarNotificacion("❌ No se pudo generar un usuario único.", "red");

  const clave = "hola999";
  await db.ref(`usuarios/${usuarioKey}`).set({
    nombreOriginal: nombreGenerado,
    clave,
    fechaCreacion: new Date().toISOString(),
    saldo: 0,
    estado: "activo"
  });

  const mensajes = [
    `👉 El monto mínimo de carga es $1500 y el de retiro $3000\n\n🌐 Ingresá desde: https://ganamos.bet/home\n\n💳 Hacemos cargas y retiros todos los días, a toda hora 🚀\n\nAvisame si pudiste entrar así te paso los datos del CBU ✅`,
    `Te recuerdo que la carga mínima es: $1500 \nRetiro mínimo: $3000\n🌐 Sitio web: https://ganamos.bet/home\n\nCargamos y retiramos las 24hs del día los 7 días de la semana al instante!\n\nAvisame si pudiste entrar así te paso los datos del CBU ✅`,
    `📢 Te cuento que el mínimo para cargar es de $1500 y para retirar $3000.\n🌐 Sitio web: https://ganamos.bet/home\n\n💸 Trabajamos 24/7 con cargas y retiros instantáneos 🎲🔥\n\n¿Podés acceder? Así te paso el CBU 📲`
  ];

  const mensajeFinal = 
`Te dejo los datos acá!

Usuario: ${nombreGenerado}
Clave: ${clave}

${mensajes[Math.floor(Math.random() * mensajes.length)]}`;

  await navigator.clipboard.writeText(mensajeFinal);
  mostrarNotificacion("✅ Usuario creado y mensaje copiado.");
  input.value = "";
});

// Mostrar notificaciones temporales
function mostrarNotificacion(mensaje, color = "green") {
  const noti = document.getElementById("notificacion");
  noti.textContent = mensaje;

  const colores = {
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
  };

  noti.className = `fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow-lg z-50 ${colores[color] || colores.green}`;
  noti.classList.remove("hidden");
  noti.style.opacity = "1";

  setTimeout(() => {
    noti.style.opacity = "0";
    setTimeout(() => noti.classList.add("hidden"), 500);
  }, 3000);
}

// Boton desbloquear

// Función para mostrar el modal de error
function mostrarModalError(mensaje) {
  const modal = document.getElementById("modal-error");
  const mensajeCont = document.getElementById("modal-mensaje");
  mensajeCont.textContent = mensaje;
  modal.classList.remove("hidden");

  // Cerrar modal con botón
  document.getElementById("cerrar-modal-error").onclick = () => {
    modal.classList.add("hidden");
  };
}

// Evento click para desbloquear usuario
document.getElementById("btn-desbloquear").addEventListener("click", async () => {
  const input = document.getElementById("usuario-input");
  const usuarioInput = input.value.trim();

  if (!usuarioInput) {
    mostrarNotificacion("⚠️ Ingresá un nombre de usuario para desbloquear.", "yellow");
    return;
  }

  const usuarioKey = toKey(usuarioInput);
  const snapshot = await db.ref(`usuarios/${usuarioKey}`).once("value");

  if (!snapshot.exists()) {
    mostrarModalError(`El usuario "${usuarioInput}" no existe en la base de datos.`);
    return;
  }

  // Aquí asumimos que desbloquear es cambiar el estado a "activo"
  await db.ref(`usuarios/${usuarioKey}/estado`).set("activo");

  const nombreOriginal = snapshot.val().nombreOriginal || usuarioInput;
  mostrarNotificacion(`Usuario ${nombreOriginal} desbloqueado`, "green");

  input.value = "";
});


// Boton reestablecer usuario

document.getElementById("btn-reestablecer").addEventListener("click", async () => {
  const input = document.getElementById("usuario-input");
  const usuarioBuscado = input.value.trim();

  if (!usuarioBuscado) {
    mostrarModalError("⚠️ Por favor ingresá un nombre de usuario.");
    return;
  }

  const usuarioKey = usuarioBuscado.toLowerCase();

  try {
    const snapshot = await db.ref(`usuarios/${usuarioKey}`).once("value");

    if (!snapshot.exists()) {
      mostrarModalError(`❌ El usuario "${usuarioBuscado}" no existe en la base de datos.`);
      return;
    }

    const datos = snapshot.val();
    const nombreOriginal = datos.nombreOriginal || usuarioBuscado;
    const clavePorDefecto = "hola999";

    const mensaje = 
`Usuario reestablecido
Usuario: ${nombreOriginal}
Clave: ${clavePorDefecto}

Intenta ingresar nuevamente!`;

    await navigator.clipboard.writeText(mensaje);
    mostrarNotificacion(`✅ Mensaje copiado para ${nombreOriginal}`, "green");
  } catch (error) {
    console.error("Error al consultar usuario:", error);
    mostrarModalError("❌ Error al consultar la base de datos. Reintenta.");
  }
});

function mostrarModalError(mensaje) {
  const modal = document.getElementById("modal-error");
  const mensajeDiv = document.getElementById("modal-mensaje");

  mensajeDiv.textContent = mensaje;
  modal.classList.remove("hidden");
}

document.getElementById("cerrar-modal-error").addEventListener("click", () => {
  document.getElementById("modal-error").classList.add("hidden");
});

document.getElementById("modal-error").addEventListener("click", (e) => {
  if (e.target.id === "modal-error") {
    document.getElementById("modal-error").classList.add("hidden");
  }
});

// Boton de Historial de cargas de usuario

document.getElementById("btn-historial-usuario").addEventListener("click", async () => {
  const usuarioInput = document.getElementById("usuario-input").value.trim().toLowerCase();
  const modal = document.getElementById("modal-historial-usuario");
  const lista = document.getElementById("lista-historial-usuario");

  if (!usuarioInput) {
    mostrarModalError("⚠️ Por favor, ingresá un nombre de usuario.");
    return;
  }

  try {
    const usuarioSnap = await db.ref(`usuarios/${usuarioInput}`).once("value");
    if (!usuarioSnap.exists()) {
      mostrarModalError(`❌ El usuario "${usuarioInput}" no existe.`);
      return;
    }

    // Limpiar lista previa
    lista.innerHTML = "";

    // Obtener datos de cargas, retiros y bonificaciones
    const [cargasSnap, retirosSnap, bonificacionesSnap] = await Promise.all([
      db.ref(`cargas/${usuarioInput}`).once("value"),
      db.ref(`retiros/${usuarioInput}`).once("value"),
      db.ref(`bonificaciones/${usuarioInput}`).once("value"),
    ]);

    const movimientos = [];

    cargasSnap.forEach(child => {
      const data = child.val();
      movimientos.push({
        tipo: "Carga",
        monto: data.monto,
        fecha: data.fecha || data.timestamp || "",
      });
    });

    retirosSnap.forEach(child => {
      const data = child.val();
      movimientos.push({
        tipo: "Retiro",
        monto: data.monto,
        fecha: data.fecha || data.timestamp || "",
      });
    });

    bonificacionesSnap.forEach(child => {
      const data = child.val();
      const montoBonif = (data.montoFinal && data.montoBase) ? data.montoFinal - data.montoBase : 0;
      movimientos.push({
        tipo: "Bonificación",
        monto: montoBonif,
        fecha: data.timestamp ? new Date(data.timestamp).toISOString() : "",
      });
    });

    if (movimientos.length === 0) {
      lista.innerHTML = "<li class='text-center text-gray-500'>No se encontraron movimientos.</li>";
    } else {
      // Ordenar por fecha descendente
      movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      movimientos.forEach(item => {
        const li = document.createElement("li");
        const fechaFormateada = item.fecha ? new Date(item.fecha).toLocaleString("es-AR") : "Fecha desconocida";

        if (item.tipo === "Carga") {
          li.className = "text-green-600";
          li.textContent = `+${item.monto} fichas (Carga) - ${fechaFormateada}`;
        } else if (item.tipo === "Retiro") {
          li.className = "text-red-600";
          li.textContent = `-${item.monto} fichas (Retiro) - ${fechaFormateada}`;
        } else if (item.tipo === "Bonificación") {
          li.className = "text-yellow-600";
          li.textContent = `+${item.monto.toFixed(2)} fichas (Bonificación) - ${fechaFormateada}`;
        }

        lista.appendChild(li);
      });
    }

    modal.classList.remove("hidden");
  } catch (error) {
    console.error("Error al obtener el historial:", error);
    mostrarModalError("❌ Error al obtener historial. Revisá la consola.");
  }
});

document.getElementById("cerrar-modal-historial-usuario").addEventListener("click", () => {
  document.getElementById("modal-historial-usuario").classList.add("hidden");
});

document.getElementById("modal-historial-usuario").addEventListener("click", (e) => {
  if (e.target.id === "modal-historial-usuario") {
    document.getElementById("modal-historial-usuario").classList.add("hidden");
  }
});

// Boton cargar

document.getElementById('btn-cargar').addEventListener('click', async () => {
  const usuario = document.getElementById('usuario-carga').value.trim();
  const monto = parseFloat(document.getElementById('monto').value.trim());

  if (!usuario || isNaN(monto) || monto <= 0) {
    mostrarModalError('Ingresá un usuario válido y un monto mayor a 0.');
    return;
  }

  const usuarioKey = usuario.toLowerCase().replace(/\s+/g, '');

  try {
    // Verificar si el usuario existe
    const snapshot = await db.ref(`usuarios/${usuarioKey}`).once('value');

    if (!snapshot.exists()) {
      mostrarModalError(`El usuario "${usuario}" no existe en la base de datos.`);
      return;
    }

    // Datos de la carga
    const nuevaCarga = {
      usuario,    // el nombre tal como lo ingresó el usuario
      monto,
      timestamp: Date.now()
    };

    // Guardar la carga dentro de cargas/{usuarioKey}/ con clave automática
    await db.ref(`cargas/${usuarioKey}`).push(nuevaCarga);

    mostrarNotificacion(`✅ Se registró correctamente la carga de $${monto} a ${usuario}`, 'green');
    limpiarFormularioCarga();

  } catch (error) {
    console.error('Error al cargar fichas:', error);
    mostrarModalError('Ocurrió un error al intentar cargar fichas.');
  }
});

// Limpia los inputs después de cargar
function limpiarFormularioCarga() {
  document.getElementById('usuario-carga').value = '';
  document.getElementById('monto').value = '';
}


// Notificacion de carga

function mostrarNotificacion(mensaje, color = 'green') {
  const colores = {
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  const noti = document.getElementById('notificacion');
  noti.textContent = mensaje;
  noti.className = `fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow-lg z-50 ${colores[color] || colores.green}`;
  noti.classList.remove('hidden');
  noti.style.opacity = '1';

  setTimeout(() => {
    noti.style.opacity = '0';
    setTimeout(() => noti.classList.add('hidden'), 500);
  }, 3000);
}


// BOTON DE BONIFICACION!!

// Mostrar / ocultar panel de bonificaciones
document.getElementById('btn-bonif').addEventListener('click', () => {
  const panel = document.getElementById('panel-bonif');
  panel.classList.toggle('hidden');
});

// Referencias para el modal de confirmación de bonificación
const modalBonif = document.getElementById('modalConfirmacionBonif');
const textoBonif = document.getElementById('textoBonif');
const btnCerrarBonif = document.getElementById('cerrarModalBonif');

btnCerrarBonif.addEventListener('click', () => {
  modalBonif.classList.add('hidden');
});

// Al seleccionar una bonificación
document.querySelectorAll('.bonif-option').forEach(btn => {
  btn.addEventListener('click', async () => {
    const porcentaje = parseFloat(btn.dataset.porcentaje);
    const usuario = document.getElementById('usuario-carga').value.trim();
    const montoInput = parseFloat(document.getElementById('monto').value.trim());

    if (!usuario || isNaN(montoInput) || montoInput <= 0) {
      mostrarModalError('Ingresá un usuario válido y un monto mayor a 0 antes de aplicar la bonificación.');
      return;
    }

    const usuarioKey = usuario.toLowerCase().replace(/\s+/g, '');

    try {
      // Verificar existencia usuario
      const snapshot = await db.ref(`usuarios/${usuarioKey}`).once('value');
      if (!snapshot.exists()) {
        mostrarModalError(`El usuario "${usuario}" no existe en la base de datos.`);
        return;
      }

      // Calcular monto con bonificación
      const montoFinal = montoInput + (montoInput * porcentaje / 100);

      // Guardar carga base en Firebase
      const carga = {
        usuario,
        monto: montoInput,
        timestamp: Date.now()
      };
      await db.ref(`cargas/${usuarioKey}`).push(carga);

      // Guardar bonificación en Firebase
      const bonificacion = {
        usuario,
        montoBase: montoInput,
        montoFinal,
        porcentaje,
        timestamp: Date.now()
      };
      await db.ref(`bonificaciones/${usuarioKey}`).push(bonificacion);

      // Mostrar modal con el detalle
      textoBonif.textContent = `Se cargaron ${montoFinal.toFixed(2)} fichas a ${usuario} (Incluye bonificación del ${porcentaje}%)`;

      modalBonif.classList.remove('hidden');

      limpiarFormularioCarga();

      // Ocultar panel bonificación
      document.getElementById('panel-bonif').classList.add('hidden');
    } catch (error) {
      console.error('Error al aplicar bonificación:', error);
      mostrarModalError('Ocurrió un error al aplicar la bonificación.');
    }
  });
});




// Boton BAJAR

document.getElementById('btn-bajar').addEventListener('click', async () => {
  const usuario = document.getElementById('usuario-carga').value.trim();
  const monto = parseFloat(document.getElementById('monto').value.trim());

  if (!usuario || isNaN(monto) || monto <= 0) {
    mostrarModalError('Ingresá un usuario válido y un monto mayor a 0.');
    return;
  }

  const usuarioKey = usuario.toLowerCase().replace(/\s+/g, '');

  try {
    // Verificar si el usuario existe
    const snapshot = await db.ref(`usuarios/${usuarioKey}`).once('value');
    if (!snapshot.exists()) {
      mostrarModalError(`El usuario "${usuario}" no existe en la base de datos.`);
      return;
    }

    // Guardar retiro en el nodo "retiros"
    const nuevoRetiro = {
      usuario,
      monto,
      timestamp: Date.now()
    };

    await db.ref(`retiros/${usuarioKey}`).push(nuevoRetiro);

    mostrarNotificacion(`✅ Se registró retiro de $${monto} para ${usuario}`, 'green');
    limpiarFormularioCarga();

  } catch (error) {
    console.error('Error al registrar retiro:', error);
    mostrarModalError('Ocurrió un error al intentar registrar el retiro.');
  }
});

// MONTOS PREDETERMINADOS PARA CARGAR

const inputMonto = document.getElementById('monto');
const dropdownMonto = document.getElementById('monto-dropdown');

// Mostrar/ocultar dropdown al hacer click en el input
inputMonto.addEventListener('click', () => {
  dropdownMonto.classList.toggle('hidden');
});

// Cuando se selecciona un monto del dropdown
dropdownMonto.querySelectorAll('.monto-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Quitar comas y parsear el monto a número
    const valor = btn.textContent.replace(/,/g, '').trim();
    inputMonto.value = valor;
    dropdownMonto.classList.add('hidden'); // Ocultar dropdown
  });
});

// Opcional: ocultar dropdown si se clickea fuera del input o dropdown
document.addEventListener('click', (e) => {
  if (!inputMonto.contains(e.target) && !dropdownMonto.contains(e.target)) {
    dropdownMonto.classList.add('hidden');
  }
});


// Boton con modal de Historial general

document.getElementById('btn-historial').addEventListener('click', async () => {
  const modal = document.getElementById('modalHistorialCompacto');
  const contenedor = document.getElementById('contenedorHistorialCompacto');

  try {
    // Traer cargas, retiros y bonificaciones
    const [cargasSnap, retirosSnap, bonifSnap] = await Promise.all([
      db.ref('cargas').once('value'),
      db.ref('retiros').once('value'),
      db.ref('bonificaciones').once('value')
    ]);

    const movimientos = [];

    cargasSnap.forEach(usuarioNode => {
      usuarioNode.forEach(cargaNode => {
        const data = cargaNode.val();
        movimientos.push({
          tipo: 'Carga',
          usuario: data.usuario || usuarioNode.key,
          monto: data.monto,
          fecha: data.timestamp || 0
        });
      });
    });

    retirosSnap.forEach(usuarioNode => {
      usuarioNode.forEach(retiroNode => {
        const data = retiroNode.val();
        movimientos.push({
          tipo: 'Retiro',
          usuario: data.usuario || usuarioNode.key,
          monto: data.monto,
          fecha: data.timestamp || 0
        });
      });
    });

    bonifSnap.forEach(usuarioNode => {
      usuarioNode.forEach(bonifNode => {
        const data = bonifNode.val();
        movimientos.push({
          tipo: 'Bonificación',
          usuario: data.usuario || usuarioNode.key,
          montoBase: data.montoBase || 0,
          montoFinal: data.montoFinal || 0,
          porcentaje: data.porcentaje || 0,
          fecha: data.timestamp || 0
        });
      });
    });

    if (movimientos.length === 0) {
      contenedor.innerHTML = `<p class="text-center text-gray-400">No hay movimientos registrados.</p>`;
    } else {
      movimientos.sort((a, b) => b.fecha - a.fecha);

      contenedor.innerHTML = ''; // limpio antes de agregar

      movimientos.forEach(item => {
        const fechaFormateada = item.fecha ? new Date(item.fecha).toLocaleString('es-AR') : 'Fecha desconocida';

        let bgColor = '';
        let signo = '';
        let textoMonto = '';

        if (item.tipo === 'Carga') {
          bgColor = 'bg-green-700';
          signo = '+';
          textoMonto = `${signo}${item.monto} fichas`;
        } else if (item.tipo === 'Retiro') {
          bgColor = 'bg-red-700';
          signo = '-';
          textoMonto = `${signo}${item.monto} fichas`;
        } else if (item.tipo === 'Bonificación') {
          bgColor = 'bg-yellow-600';
          signo = '+';
          const extraBonificado = (item.montoFinal - item.montoBase).toFixed(2);
          textoMonto = `${signo}${extraBonificado} fichas (Bonif. ${item.porcentaje}%)`;
        }

        const div = document.createElement('div');
        div.className = `p-2 rounded ${bgColor}`;

        div.innerHTML = `
          <strong>${textoMonto}</strong> 
          <span class="opacity-75">(${item.tipo})</span><br/>
          <small class="opacity-75">${item.usuario} - ${fechaFormateada}</small>
        `;

        contenedor.appendChild(div);
      });
    }

    modal.classList.remove('hidden');
  } catch (error) {
    console.error('Error al obtener historial general:', error);
    alert('Error al obtener el historial general. Revisa la consola.');
  }
});

document.getElementById('cerrarHistorialCompacto').addEventListener('click', () => {
  document.getElementById('modalHistorialCompacto').classList.add('hidden');
});

document.getElementById('modalHistorialCompacto').addEventListener('click', e => {
  if (e.target.id === 'modalHistorialCompacto') {
    document.getElementById('modalHistorialCompacto').classList.add('hidden');
  }
});




// FUNCIONES DE BOTONES!!


// Boton info usuarios nuevos

// Mensajes para info usuarios nuevos
const mensajesInfoNuevos = [
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

let ultimoMensajeInfoNuevos = null;

// Evento para botón info usuarios nuevos
document.getElementById('btn-info-nuevos').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesInfoNuevos[Math.floor(Math.random() * mensajesInfoNuevos.length)];
  } while (mensaje === ultimoMensajeInfoNuevos);

  ultimoMensajeInfoNuevos = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacion("Mensaje copiado al portapapeles ✔️");
  } else {
    mostrarNotificacion("Error al copiar mensaje. Intenta manualmente.");
  }
});

// Función para copiar texto al portapapeles
async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    console.error('Error copiando al portapapeles:', err);
    return false;
  }
}

// Función para mostrar notificación toast
function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.className = 'notificacion-toast';
  document.body.appendChild(notif);
  
  // Animación para mostrar y ocultar
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 2500);
}


// Boton de bienvenida

// Mensajes de bienvenida
const mensajesBienvenida = [
   `¡Hola! Bienvenido/a ❤️ Decime tu nombre asi te brindo un usuario para jugar`,
  `¡Holis Bienvenida/o, decime tu nombre asi te creo un usuario 😊`,
  `¡Buenaaas! Bienvenido/a!❤️ Decime tu nombre asi te creo un usuario para vos 🙌`
];

let ultimoMensajeBienvenida = null;

// Evento para botón mensaje de bienvenida
document.getElementById('btn-bienvenida').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesBienvenida[Math.floor(Math.random() * mensajesBienvenida.length)];
  } while (mensaje === ultimoMensajeBienvenida);

  ultimoMensajeBienvenida = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacion("Mensaje de bienvenida copiado al portapapeles ✔️");
  } else {
    mostrarNotificacion("Error al copiar mensaje. Intenta manualmente.");
  }
});

// Función para copiar texto al portapapeles (si no la tenés ya)
async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    console.error('Error copiando al portapapeles:', err);
    return false;
  }
}

// Función para mostrar notificación toast (si no la tenés ya)
function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.className = 'notificacion-toast';
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 2500);
}



// Boton minimo de carga y retiro

const mensajesMinimos = [
  `📢 Te comento que:\n💵 El monto mínimo de carga: $1500\n💸 Monto mínimo de retiro: $3000`,
  `ℹ️ Importante a tener en cuenta:\n✅ Carga mínima: $1500 💰\n✅ Retiro mínimo: $3000 🏧`,
  `📝 Te paso los montos mínimos:\n📥 Carga minima: $1500\n📤 Retiro minimo: $3000`
];

let ultimoMensajeMinimos = null;

document.getElementById('btn-minimos').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesMinimos[Math.floor(Math.random() * mensajesMinimos.length)];
  } while (mensaje === ultimoMensajeMinimos);

  ultimoMensajeMinimos = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacion("Mensaje de montos mínimos copiado al portapapeles ✔️");
  } else {
    mostrarNotificacion("Error al copiar mensaje. Intenta manualmente.");
  }
});

// Funciones auxiliares (copiar al portapapeles y notificación)
async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    console.error('Error copiando al portapapeles:', err);
    return false;
  }
}

function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.className = 'notificacion-toast';
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 2500);
}


// Plataforma web

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
  } while (mensaje === ultimoMensajePlataforma);

  ultimoMensajePlataforma = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacion("Mensaje de plataforma web copiado al portapapeles ✔️");
  } else {
    mostrarNotificacion("Error al copiar mensaje. Intenta manualmente.");
  }
});

// Funciones auxiliares (copiar al portapapeles y notificación)
async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    console.error('Error copiando al portapapeles:', err);
    return false;
  }
}

function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.className = 'notificacion-toast';
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 2500);
}

// Unirse al grupo

const mensajesUnirse = [
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

let ultimoMensajeUnirse = null;

document.getElementById('btn-unirse').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesUnirse[Math.floor(Math.random() * mensajesUnirse.length)];
  } while (mensaje === ultimoMensajeUnirse);

  ultimoMensajeUnirse = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacion("Mensaje de grupo privado copiado al portapapeles ✔️");
  } else {
    mostrarNotificacion("Error al copiar mensaje. Intenta manualmente.");
  }
});

// Funciones auxiliares (copiar al portapapeles y notificación)
async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    console.error('Error copiando al portapapeles:', err);
    return false;
  }
}

function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.className = 'notificacion-toast';
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 2500);
}


// Boton contacto por el grupo

const mensajesContactanos = [
  `Buenas❤️
Te pido que nos escribas por tu grupo asignado, es el único canal de atención que usamos 🛎️🙌🏻
¡Gracias por tu comprensión!`,

  `¡Hola! ❤️ Para cualquier consulta o gestión, recordá que solo respondemos por tu grupo asignado 🔒
Es nuestro canal exclusivo de atención 🛎️✨`,

  `¡Hola hola! ❤️
¿Todo bien? Por favor, escribinos únicamente por tu grupo privado ✅
Es el único canal habilitado para cargas, retiros y consultas 🛎️💬`
];

let ultimoMensajeContactanos = null;

document.getElementById('btn-contactanos').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesContactanos[Math.floor(Math.random() * mensajesContactanos.length)];
  } while (mensaje === ultimoMensajeContactanos);

  ultimoMensajeContactanos = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacionContactanos("Mensaje copiado al portapapeles ✔️");
  } else {
    mostrarNotificacionContactanos("Error al copiar el mensaje. Intenta manualmente.");
  }
});

async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    console.error('Error copiando al portapapeles:', err);
    return false;
  }
}

function mostrarNotificacionContactanos(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.className = 'notificacion-toast';
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 2500);
}


// Boton info referidos

const mensajesReferidos = [
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

let ultimoMensajeReferidos = null;

document.getElementById('btn-info-referidos').addEventListener('click', async () => {
  let mensaje;
  do {
    mensaje = mensajesReferidos[Math.floor(Math.random() * mensajesReferidos.length)];
  } while (mensaje === ultimoMensajeReferidos);

  ultimoMensajeReferidos = mensaje;

  const copiado = await copiarAlPortapapeles(mensaje);
  if (copiado) {
    mostrarNotificacion("Mensaje de referidos copiado al portapapeles ✔️");
  }
});

// Boton derivacion principal

const mensajeDerivar = `Te pido que por favor envíes el comprobante al número principal junto con el nombre de usuario que se te asignó, así pueden cargarte al instante 👇

📲 +543815154196

Para que sea más fácil, podés hacer clic en este link y te deriva directo a nuestro chat para enviar:
👉 https://wa.me/543815154196?text=Hola%2C%20mi%20usuario%20es%3A%20%0AAhora%20te%20env%C3%ADo%20el%20comprobante`;

document.getElementById('btn-derivar').addEventListener('click', async () => {
  const copiado = await copiarAlPortapapeles(mensajeDerivar);
  if (copiado) {
    mostrarNotificacion("Mensaje para derivar al principal copiado al portapapeles ✔️");
  }
});

// Boton CBU

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

function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.className = 'notificacion-toast';
  notif.style.position = 'fixed';
  notif.style.bottom = '20px';
  notif.style.right = '20px';
  notif.style.backgroundColor = '#4caf50';
  notif.style.color = 'white';
  notif.style.padding = '10px 15px';
  notif.style.borderRadius = '5px';
  notif.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  notif.style.zIndex = 9999;
  notif.style.transition = 'opacity 0.5s ease';
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 2500);
}

document.getElementById('btn-cbu').addEventListener('click', async () => {
  const titular = document.getElementById('input-titular').value.trim();
  const cbu = document.getElementById('input-cbu').value.trim();
  const alias = document.getElementById('input-alias').value.trim();

  if (!titular || !cbu || !alias) {
    alert('Por favor, completá Titular, CBU y Alias antes de copiar el mensaje.');
    return;
  }

  const idx = Math.floor(Math.random() * mensajesCBU.length);
  const mensaje = mensajesCBU[idx](titular, cbu, alias);

  try {
    await navigator.clipboard.writeText(mensaje);
    mostrarNotificacion('Mensaje CBU copiado al portapapeles ✔️');
  } catch (error) {
    alert('Error al copiar el mensaje. Intentá de nuevo.');
  }
});

// Boton info de retiros

const mensajesRetiro = [
  "🎉 ¡Felicitaciones por tu premio! Para hacer el retiro, enviános tu CBU, nombre del titular y el monto que querés retirar. ¡Dale que es tuyo! 💰🙌",
  "🎊 ¡Genial! Ganaste un premio 🎉. Para retirar, mandanos tu CBU, titular y cuánto querés retirar. ¡Estamos para ayudarte! 💸💪",
  "🏆 ¡Felicitaciones! Para poder retirar tu premio, pasanos tu CBU, el nombre del titular y el monto a retirar. ¡Vamos que ya falta poco! 💰👏.. ⚠️Recorda que las bonificaciones no son extraibles"
];

function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.className = 'notificacion-toast';
  notif.style.position = 'fixed';
  notif.style.bottom = '20px';
  notif.style.right = '20px';
  notif.style.backgroundColor = '#4caf50';
  notif.style.color = 'white';
  notif.style.padding = '10px 15px';
  notif.style.borderRadius = '5px';
  notif.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  notif.style.zIndex = 9999;
  notif.style.transition = 'opacity 0.5s ease';
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 2500);
}

document.getElementById('btn-info-retiro').addEventListener('click', async () => {
  const mensaje = mensajesRetiro[Math.floor(Math.random() * mensajesRetiro.length)];

  try {
    await navigator.clipboard.writeText(mensaje);
    mostrarNotificacion('Mensaje de info de retiro copiado al portapapeles ✔️');
  } catch (error) {
    alert('Error al copiar el mensaje. Intentá de nuevo.');
  }
});

// Boton Felicitaciones


const mensajesFelicitaciones = [
    "🎉 ¡Felicitaciones por ese premio! Te cuento que para que sigas jugando sin parar, por cada amigo que refieras y cargue, te regalo $3000 para tu próxima recarga. 🍀🎰 ¡No lo dejes pasar, compartí y ganá!",
    "🎊 ¡Excelente  ese premio que ganaste! Te comento ademas que por cada amigo que invites y realice su carga, recibís $3000 para usar en tu próxima recarga. 🍀🎰 ¡Seguí jugando y compartiendo la diversión!",
    "🎉 ¡Genial, te felicito por ese premio!  Recorda que por cada amigo que traigas y que cargue, te doy $3000 para tu próxima carga. 🍀🎰 ¡Aprovechá y seguí ganando con tus referidos!"
  ];

  document.getElementById('btn-felicitaciones').addEventListener('click', async () => {
    const mensaje = mensajesFelicitaciones[Math.floor(Math.random() * mensajesFelicitaciones.length)];
    try {
      await navigator.clipboard.writeText(mensaje);
      mostrarNotificacionContactanos('✅ Mensaje copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar: ', err);
    }
  });

  function mostrarNotificacionContactanos(mensaje) {
    const notif = document.createElement('div');
    notif.textContent = mensaje;
    notif.className = 'notificacion-toast';
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.style.opacity = '0';
      setTimeout(() => notif.remove(), 500);
    }, 2500);
  }

  // Boton AGENDAME!

 const mensajesAgendame = [
  `🙋‍♀️ ¡Celeste acá! 📲 Agendame así no te perdés ninguna promo 🎉
¿Sabías que por cada referido te regalo $3000 para tu próxima carga? 🎰💰
Solo tienen que mencionar tu usuario ¡y listo! Las fichas son tuyas 💎
¡Dale que se viene lo bueno! 🚀🔥`,

  `Holiss, Celeste te saluda 🙋‍♀️
📲 Agendame así estás al tanto de todas las promos 🎉
Cada vez que un amigo mencione tu usuario y haga su carga, te llevás $3000 para tu próxima recarga 💰🎰
¡No te lo pierdas! Lo que viene, viene con todo 🚀🔥`,

  `🙋‍♀️ Soy Celeste, ¡agendame! 📲 Así no te perdés ninguna novedad ni promo 🎉
🎰 Por cada persona que refieras y cargue fichas, ganás $3000 para usar en tu próxima carga 💸
Solo deben decir tu usuario y listo. ¡Vamos con toda! 🚀🔥`
];

function copiarAlPortapapeles(texto) {
  navigator.clipboard.writeText(texto)
    .then(() => {
      mostrarNotificacionContactanos("Mensaje copiado al portapapeles ✅");
    })
    .catch(err => {
      console.error('Error al copiar al portapapeles', err);
      mostrarNotificacionContactanos("❌ Error al copiar el mensaje");
    });
}

function mostrarNotificacionContactanos(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.className = 'notificacion-toast';
  Object.assign(notif.style, {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111',
    color: '#fff',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    opacity: '1',
    transition: 'opacity 0.5s ease',
    zIndex: '9999'
  });
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 2500);
}

document.getElementById('btn-agendame').addEventListener('click', () => {
  const mensaje = mensajesAgendame[Math.floor(Math.random() * mensajesAgendame.length)];
  copiarAlPortapapeles(mensaje);
});


// Modal tope de retiro

// Mostrar modal de topes de retiro
const btnTopeRetiros = document.getElementById('btn-tope-retiros');
const modalTopeRetiros = document.getElementById('modal-tope-retiros');
const cerrarModalTope = document.getElementById('cerrar-modal-tope');

btnTopeRetiros.addEventListener('click', () => {
  modalTopeRetiros.classList.remove('hidden');
});

cerrarModalTope.addEventListener('click', () => {
  modalTopeRetiros.classList.add('hidden');
});

// Cierra el modal si se hace clic fuera del contenido
modalTopeRetiros.addEventListener('click', (e) => {
  if (e.target === modalTopeRetiros) {
    modalTopeRetiros.classList.add('hidden');
  }
});

// Cargar y guardar datos de datos bancarios

// Referencias a los botones e inputs
const btnEditarDatos = document.getElementById('btn-editar-datos');
const btnGuardarDatos = document.getElementById('btn-guardar-datos');
const inputTitular = document.getElementById('input-titular');
const inputCBU = document.getElementById('input-cbu');
const inputAlias = document.getElementById('input-alias');

// Desactivar inputs al inicio
[inputTitular, inputCBU, inputAlias].forEach(input => input.disabled = true);

// 🔁 Cargar datos bancarios desde Firebase al iniciar
function cargarDatosBancarios() {
  const dbRef = firebase.database().ref('datosbancarios');
  dbRef.once('value').then(snapshot => {
    const datos = snapshot.val();
    if (datos) {
      inputTitular.value = datos.titular || '';
      inputCBU.value = datos.cbu || '';
      inputAlias.value = datos.alias || '';
    }
  });
}

// 🔓 Habilitar edición
btnEditarDatos.addEventListener('click', () => {
  [inputTitular, inputCBU, inputAlias].forEach(input => input.disabled = false);
  btnGuardarDatos.classList.remove('hidden');
});

// 💾 Guardar datos y deshabilitar inputs
btnGuardarDatos.addEventListener('click', () => {
  const titular = inputTitular.value.trim();
  const cbu = inputCBU.value.trim();
  const alias = inputAlias.value.trim();

  if (titular && cbu && alias) {
    firebase.database().ref('datosbancarios').set({
      titular,
      cbu,
      alias
    }).then(() => {
      mostrarToast('Datos guardados correctamente ✅');
      [inputTitular, inputCBU, inputAlias].forEach(input => input.disabled = true);
      btnGuardarDatos.classList.add('hidden');
    }).catch(error => {
      mostrarToast('Error al guardar los datos: ' + error.message, 'error');
    });
  } else {
    mostrarToast('Por favor completá todos los campos antes de guardar.', 'error');
  }
});

// 🚀 Cargar datos cuando se abre la página
cargarDatosBancarios();

// Función para mostrar un toast discreto
function mostrarToast(mensaje, tipo = 'ok') {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  toast.className = `fixed bottom-4 left-4 px-4 py-2 rounded shadow-md text-white z-50 text-sm ${
    tipo === 'error' ? 'bg-red-500' : 'bg-green-600'
  }`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Boton descargar retiros segun horarios

// Asegurate de incluir este CDN en tu HTML antes de este script:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

const { jsPDF } = window.jspdf;

const btnAbrirModal = document.getElementById('btn-abrir-modal-retiros');
const modal = document.getElementById('modal-retiros');
const btnCerrarModal = document.getElementById('cerrar-modal-retiros');
const btnConfirmar = document.getElementById('btn-confirmar-retiros');
const inputFecha = document.getElementById('input-fecha-retiros');
const selectTurno = document.getElementById('select-turno-retiros');

// Función para verificar si un timestamp cae dentro de la fecha y turno seleccionados
function estaEnDiaYTurno(timestamp, fechaSeleccionada, turno) {
  const fecha = new Date(timestamp);

  // Chequeo de día (comparar solo año-mes-dia)
  const fechaISO = fecha.toISOString().slice(0, 10);
  if (fechaISO !== fechaSeleccionada) {
    // Para turno3, puede que la hora caiga en el día siguiente (hasta las 2 AM)
    if (turno !== 'turno3') return false;
  }

  const hora = fecha.getHours();
  // Definir rangos de turnos
  if (turno === 'turno1') {
    return hora >= 2 && hora < 10 && fechaISO === fechaSeleccionada;
  }
  if (turno === 'turno2') {
    return hora >= 10 && hora < 18 && fechaISO === fechaSeleccionada;
  }
  if (turno === 'turno3') {
    // turno3 abarca 18:00 a 23:59 del día seleccionado
    // y 00:00 a 01:59 del día siguiente
    if (fechaISO === fechaSeleccionada && hora >= 18) return true;
    // Comprobar si fecha es el día siguiente y hora entre 0 y 1
    const fechaObj = new Date(fechaSeleccionada);
    fechaObj.setDate(fechaObj.getDate() + 1);
    const diaSiguienteISO = fechaObj.toISOString().slice(0, 10);
    if (fechaISO === diaSiguienteISO && hora >=0 && hora < 2) return true;
    return false;
  }
  return false;
}

// Abrir modal
btnAbrirModal.addEventListener('click', () => {
  modal.classList.remove('hidden');
  // Limpiar selección
  inputFecha.value = '';
  selectTurno.value = 'turno1';
});

// Cerrar modal
btnCerrarModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Cerrar modal si clickeas afuera
modal.addEventListener('click', e => {
  if (e.target === modal) modal.classList.add('hidden');
});

// Descargar PDF con retiros filtrados
btnConfirmar.addEventListener('click', async () => {
  const fechaSeleccionada = inputFecha.value;
  const turnoSeleccionado = selectTurno.value;

  if (!fechaSeleccionada) {
    alert('Por favor seleccioná una fecha.');
    return;
  }

  try {
    const retirosSnap = await firebase.database().ref('retiros').once('value');
    const retiros = [];

    retirosSnap.forEach(usuarioNode => {
      usuarioNode.forEach(retiroNode => {
        const data = retiroNode.val();
        if (data.timestamp && estaEnDiaYTurno(data.timestamp, fechaSeleccionada, turnoSeleccionado)) {
          retiros.push({
            usuario: data.usuario || usuarioNode.key,
            monto: parseFloat(data.monto) || 0,
            fecha: new Date(data.timestamp)
          });
        }
      });
    });

    if (retiros.length === 0) {
      alert('No se encontraron retiros para esa fecha y turno.');
      return;
    }

    // Crear PDF
    const doc = new jsPDF();

    doc.setFontSize(14);
    const fechaFormato = new Date(fechaSeleccionada).toLocaleDateString('es-AR');
    const textoTurno = selectTurno.options[selectTurno.selectedIndex].text;
    doc.text(`Retiros - ${fechaFormato} - ${textoTurno}`, 10, 10);
    doc.setFontSize(10);

    let y = 20;
    doc.text('Usuario', 10, y);
    doc.text('Monto', 80, y);
    doc.text('Fecha', 130, y);
    y += 6;

    let totalMontos = 0;

    retiros.forEach(({usuario, monto, fecha}) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(usuario, 10, y);
      doc.text(monto.toFixed(2), 80, y);
      doc.text(fecha.toLocaleString('es-AR'), 130, y);
      y += 6;

      totalMontos += monto;
    });

    y += 10;
    if (y > 280) doc.addPage();
    doc.setFontSize(12);
    doc.text(`Total retiros: $${totalMontos.toFixed(2)}`, 10, y);

    doc.save(`retiros_${fechaSeleccionada}_${turnoSeleccionado}.pdf`);

    modal.classList.add('hidden');
  } catch (error) {
    console.error('Error al descargar retiros:', error);
    alert('Ocurrió un error al descargar los retiros. Revisa la consola.');
  }
});


// Boton modo oscuro

const btn = document.getElementById('btn-modo-oscuro');

  function activarModoOscuro() {
    document.body.classList.add('modo-oscuro');
    localStorage.setItem('modoOscuro', 'true');
  }

  function desactivarModoOscuro() {
    document.body.classList.remove('modo-oscuro');
    localStorage.setItem('modoOscuro', 'false');
  }

  // Aplicar preferencia guardada al cargar la página
  if (localStorage.getItem('modoOscuro') === 'true') {
    activarModoOscuro();
  } else {
    desactivarModoOscuro();
  }

  btn.addEventListener('click', () => {
    if (document.body.classList.contains('modo-oscuro')) {
      desactivarModoOscuro();
    } else {
      activarModoOscuro();
    }
  });





































