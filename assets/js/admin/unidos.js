document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('.sidebar .nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      if (link.getAttribute('href') === '#') {
        e.preventDefault();
      }
    });
  });

  const form = document.getElementById('form-suscripcion');
  const correoInput = document.getElementById('correoInput');
  const tbody = document.querySelector('table tbody');

  // Cargar suscriptores desde JSON Server
  async function cargarSuscriptores() {
    if (!tbody) return;
    tbody.innerHTML = '';
    try {
      const response = await fetch('http://localhost:3000/suscriptores');
      if (response.ok) {
        const suscriptores = await response.json();
        suscriptores.forEach((s, idx) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td><strong>${s.id}</strong></td><td>${s.email}</td><td><a href="#" class="text-danger btn-eliminar" data-id="${s.id}">Eliminar</a></td>`;
          tbody.appendChild(tr);
        });
      }
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="3">No se pudieron cargar los suscriptores.</td></tr>';
    }
  }

  if (form && correoInput) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const correo = correoInput.value.trim();
      if (correo) {
        try {
          const response = await fetch('http://localhost:3000/suscriptores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: correo, fechaSuscripcion: new Date().toISOString() })
          });
          if (response.ok) {
            correoInput.value = '';
            await cargarSuscriptores();
          } else {
            alert('No se pudo agregar el suscriptor.');
          }
        } catch (err) {
          alert('Error de conexión al agregar suscriptor.');
        }
      }
    });
  }

  // Delegación de eventos para eliminar filas
  if (tbody) {
    tbody.addEventListener('click', async function (e) {
      if (e.target && e.target.classList.contains('btn-eliminar')) {
        e.preventDefault();
        const id = e.target.getAttribute('data-id');
        if (id && confirm('¿Eliminar este suscriptor?')) {
          try {
            const response = await fetch(`http://localhost:3000/suscriptores/${id}`, { method: 'DELETE' });
            if (response.ok) {
              await cargarSuscriptores();
            } else {
              alert('No se pudo eliminar el suscriptor.');
            }
          } catch (err) {
            alert('Error de conexión al eliminar suscriptor.');
          }
        }
      }
    });
  }

  cargarSuscriptores();
});
