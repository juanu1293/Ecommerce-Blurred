// === Menú hamburguesa ===
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('show');
}

const imagenes = [
  'img1.jpg',
  'img2.jpg',
  'img3.jpg',
  'img4.jpg',
  'img5.jpg',
  'img6.jpg',
  'img7.jpg',
  'img8.jpg',
  'img9.jpg',
  'img10.jpg'
];

document.addEventListener('DOMContentLoaded', function () {
  // === Popup de usuario ===
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const popupNombre = document.getElementById('popup-nombre');
  const popupEmail = document.getElementById('popup-email');
  if (usuario && popupNombre && popupEmail) {
    popupNombre.textContent = usuario.nombre || '';
    popupEmail.textContent = usuario.correo || usuario.email || '';
  } else if (popupNombre && popupEmail) {
    popupNombre.textContent = 'Invitado';
    popupEmail.textContent = '';
  }

  // === Popup de carrito ===
  const listaCarrito = document.querySelector('.lista-carrito');
  const mensajeVacio = document.querySelector('.carrito-vacio');
  let carrito = {};
  try {
    const almacenado = localStorage.getItem("carrito");
    carrito = almacenado ? JSON.parse(almacenado) : {};
  } catch (e) {
    carrito = {};
  }

  if (listaCarrito && mensajeVacio) {
    listaCarrito.innerHTML = "";
    const items = Object.values(carrito);
    if (items.length === 0) {
      mensajeVacio.style.display = "block";
    } else {
      mensajeVacio.style.display = "none";
      let total = 0;
      items.forEach(producto => {
        const li = document.createElement("li");
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;
        li.textContent = `${producto.nombre} × ${producto.cantidad} - $${subtotal.toLocaleString()}`;
        listaCarrito.appendChild(li);
      });
      const totalLi = document.createElement("li");
      totalLi.textContent = `🧾 Total: $${total.toLocaleString()}`;
      totalLi.style.fontWeight = "bold";
      totalLi.style.marginTop = "10px";
      listaCarrito.appendChild(totalLi);
    }
  }

  // === Cuenta regresiva ===
  const fechaObjetivo = new Date("2025-12-31T23:59:59").getTime();
  const contadorElemento = document.getElementById('contador');

  function actualizarCuentaRegresiva() {
    const ahora = new Date().getTime();
    const diferencia = fechaObjetivo - ahora;

    if (diferencia <= 0) {
      contadorElemento.textContent = "¡Tiempo finalizado!";
      return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    contadorElemento.textContent = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
  }

  setInterval(actualizarCuentaRegresiva, 1000);
  actualizarCuentaRegresiva(); // Llamada inicial

  // === Contador de carrito ===
  const contadorCarrito = document.querySelector(".contador-carrito");
  const totalProductos = Object.values(carrito).reduce((total, producto) => total + producto.cantidad, 0);
  if (contadorCarrito) {
    contadorCarrito.textContent = totalProductos;
    contadorCarrito.style.display = totalProductos > 0 ? "inline-block" : "none";
  }

  // === Redirección del icono de usuario según sesión ===
  const usuarioLink = document.getElementById('usuario-link');
  if (usuarioLink) {
    usuarioLink.addEventListener('click', function(e) {
      e.preventDefault();
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (usuario) {
        window.location.href = 'perfil.html';
      } else {
        window.location.href = 'registro.html';
      }
    });
  }
});

const stripe = Stripe('pk_test_51RTU8SPeOk3lf9h44jRReveFmFZvEjdEsNn4SFp8sprD1r9L1ki7kC7JeIdptj2NjuD7qvhvOo53AxZG0iAjLfXf00C77TJId0'); // Tu clave pública de Stripe

function iniciarPago() {
  let carrito = {};
  try {
    const almacenado = localStorage.getItem("carrito");
    carrito = almacenado ? JSON.parse(almacenado) : {};
  } catch (e) {
    console.error("No se pudo leer el carrito");
    return;
  }

  const items = Object.values(carrito).filter(p => p.cantidad > 0).map(producto => ({
    name: producto.nombre,
    price: producto.precio,
    quantity: producto.cantidad
  }));

  if (items.length === 0) {
    alert("El carrito está vacío o contiene productos inválidos.");
    return;
  }

  fetch('http://localhost:3000/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  })
    .then(res => res.json())
    .then(data => stripe.redirectToCheckout({ sessionId: data.id }))
    .catch(err => {
      console.error('Error:', err);
      alert('Hubo un error al iniciar el pago.');
    });
}
