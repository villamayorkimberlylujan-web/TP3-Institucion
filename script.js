// ==========================
// NAVEGACIÓN ENTRE SECCIONES
// ==========================
const SECCIONES = document.querySelectorAll('.seccion');
const NAV_BUTTONS = document.querySelectorAll('nav button');

function mostrarSeccion(idSeccion) {
  SECCIONES.forEach(s => s.classList.add('hidden'));
  NAV_BUTTONS.forEach(btn => btn.classList.remove('font-extrabold', 'underline', 'text-blue-900'));

  const seccionActiva = document.getElementById(idSeccion);
  if (seccionActiva) seccionActiva.classList.remove('hidden');

  const botonActivo = document.querySelector(`nav button[data-id="${idSeccion}"]`);
  if (botonActivo) botonActivo.classList.add('font-extrabold', 'underline', 'text-blue-900');

  if (idSeccion === 'listado') cargarAlumnos();
}

// ==========================
// WIDGET DEL CLIMA (HOME)
// ==========================
const apiKey = "ab1aa1b81bb50ba27432a398bab06ab7"; // ← Reemplazala con tu propia clave de OpenWeather
const buscarBtn = document.getElementById("buscarBtn");
const ciudadInput = document.getElementById("ciudadInput");
const climaResultado = document.getElementById("climaResultado");

if (buscarBtn) buscarBtn.addEventListener("click", obtenerClima);
if (ciudadInput) ciudadInput.addEventListener("keypress", e => {
  if (e.key === "Enter") obtenerClima();
});

async function obtenerClima() {
  const ciudad = ciudadInput.value.trim();
  if (!ciudad) return alert("Ingrese una ciudad.");

  climaResultado.innerHTML = "<p class='text-gray-500'>Cargando...</p>";

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&lang=es&units=metric`);
    const data = await res.json();

    if (data.cod !== 200) {
      climaResultado.innerHTML = `<p class='text-red-500'>❌ Ciudad no encontrada o error en la clave API.</p>`;
      return;
    }

    climaResultado.innerHTML = `
      <div class="flex flex-col items-center space-y-2 mt-4 animate-fadeIn">
        <h3 class="text-2xl font-bold text-blue-800">${data.name}, ${data.sys.country}</h3>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" class="w-20 h-20">
        <p class="capitalize text-lg text-gray-700 font-medium">${data.weather[0].description}</p>
        <p class="text-5xl font-extrabold text-blue-700">${Math.round(data.main.temp)}°C</p>
        <p class="text-gray-600">Sensación térmica: ${Math.round(data.main.feels_like)}°C</p>
        <div class="flex justify-center gap-6 mt-3 text-sm text-gray-700">
          <p>💧 Humedad: ${data.main.humidity}%</p>
          <p>🌬️ Viento: ${(data.wind.speed * 3.6).toFixed(1)} km/h</p>
        </div>
      </div>`;
  } catch (error) {
    climaResultado.innerHTML = `<p class='text-red-500'>Hubo un error al intentar conectarse.</p>`;
  }
}

// ==========================
// CRUD DE ALUMNOS
// ==========================
const formAlumno = document.getElementById('formAlumno');
const tablaAlumnos = document.getElementById('tablaAlumnos');
const filtroCurso = document.getElementById('filtroCurso');
const formMessage = document.getElementById('formMessage');

let alumnos = JSON.parse(localStorage.getItem('alumnos')) || [];

if (formAlumno) formAlumno.addEventListener('submit', guardarAlumno);
if (filtroCurso) filtroCurso.addEventListener('change', cargarAlumnos);

function guardarAlumno(e) {
  e.preventDefault();
  const dni = document.getElementById('dni').value.trim();

  if (alumnos.some(alumno => alumno.dni === dni)) {
    mostrarMensaje('❌ Error: Ya existe un alumno con ese DNI.', 'error');
    return;
  }

  const nuevoAlumno = {
    nombre: document.getElementById('nombre').value.trim(),
    apellido: document.getElementById('apellido').value.trim(),
    dni: dni,
    curso: document.getElementById('curso').value,
    email: document.getElementById('email').value.trim()
  };

  alumnos.push(nuevoAlumno);
  localStorage.setItem('alumnos', JSON.stringify(alumnos));

  mostrarMensaje('✅ Alumno guardado con éxito.', 'ok');
  formAlumno.reset();

  cargarAlumnos();
  actualizarOpcionesCurso();
}

function mostrarMensaje(texto, tipo) {
  formMessage.classList.remove('hidden');
  formMessage.textContent = texto;

  if (tipo === 'ok') {
    formMessage.className = 'md:col-span-2 text-center py-2 rounded-lg bg-green-100 text-green-700';
  } else {
    formMessage.className = 'md:col-span-2 text-center py-2 rounded-lg bg-red-100 text-red-700';
  }
}

function actualizarOpcionesCurso() {
  if (!filtroCurso) return;
  const cursosExistentes = [...new Set(alumnos.map(a => a.curso))].sort();
  const cursoSeleccionado = filtroCurso.value;

  filtroCurso.innerHTML = '<option value="todos">Mostrar todos los cursos</option>';
  cursosExistentes.forEach(curso => {
    const option = document.createElement('option');
    option.value = curso;
    option.textContent = curso;
    filtroCurso.appendChild(option);
  });

  filtroCurso.value = cursosExistentes.includes(cursoSeleccionado) ? cursoSeleccionado : 'todos';
}

function cargarAlumnos() {
  if (!tablaAlumnos) return;

  alumnos = JSON.parse(localStorage.getItem('alumnos')) || [];
  tablaAlumnos.innerHTML = '';

  const cursoAFiltrar = filtroCurso ? filtroCurso.value : 'todos';
  const alumnosFiltrados = cursoAFiltrar === 'todos'
    ? alumnos
    : alumnos.filter(a => a.curso === cursoAFiltrar);

  if (alumnos.length === 0) {
    tablaAlumnos.innerHTML = '<tr><td colspan="6" class="py-4 text-gray-500">No hay alumnos cargados.</td></tr>';
    return;
  }

  if (alumnosFiltrados.length === 0) {
    tablaAlumnos.innerHTML = `<tr><td colspan="6" class="py-4 text-orange-500">No hay alumnos en el curso ${cursoAFiltrar}.</td></tr>`;
    return;
  }

  alumnosFiltrados.forEach(alumno => {
    const fila = document.createElement('tr');
    fila.classList.add('hover:bg-sky-50', 'transition');

    fila.innerHTML = `
      <td class="py-2 px-3 border border-gray-200">${alumno.nombre}</td>
      <td class="py-2 px-3 border border-gray-200">${alumno.apellido}</td>
      <td class="py-2 px-3 border border-gray-200 font-semibold">${alumno.curso}</td>
      <td class="py-2 px-3 border border-gray-200">${alumno.dni}</td>
      <td class="py-2 px-3 border border-gray-200">${alumno.email}</td>
      <td class="py-2 px-3 border border-gray-200">
        <button onclick="eliminarAlumno('${alumno.dni}')" class="text-red-600 hover:text-red-800 font-semibold transition">🗑️ Eliminar</button>
      </td>`;
    tablaAlumnos.appendChild(fila);
  });
}

function eliminarAlumno(dni) {
  if (confirm(`¿Estás seguro de eliminar el alumno con DNI ${dni}? Esta acción no se puede deshacer.`)) {
    alumnos = alumnos.filter(alumno => alumno.dni !== dni);
    localStorage.setItem('alumnos', JSON.stringify(alumnos));
    cargarAlumnos();
    actualizarOpcionesCurso();
  }
}

function limpiarStorage() {
  if (confirm('ADVERTENCIA: ¿Desea eliminar TODA la información de alumnos guardada?')) {
    localStorage.removeItem('alumnos');
    alumnos = [];
    cargarAlumnos();
    actualizarOpcionesCurso();
    alert('Datos de alumnos eliminados con éxito.');
    mostrarSeccion('home');
  }
}

// ==========================
// EJECUCIÓN INICIAL
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  mostrarSeccion('home');
  cargarAlumnos();
  actualizarOpcionesCurso();
});
