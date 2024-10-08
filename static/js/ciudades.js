document.addEventListener('DOMContentLoaded', () => {
  const sliderContainer = document.querySelector('.slider-container');
  const esDispositivoMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Asegurarse de que el slider sea visible en todos los dispositivos
  if (sliderContainer) {
    sliderContainer.style.display = "block";
  }

  const ciudades = {
    'SA': {center: [-63, -24], zoom: 2.4},
    'NA': {center: [-87, 41], zoom: 2.4},
    'dublin': {center: [-6.26, 53.34], zoom: 6.2},
    'mallorca': {center: [2.88, 39.6], zoom: 7.2},
    'caracas': {center: [-66.91, 10.50], zoom: 5.0},
    'paris': {center: [2.32, 48.8], zoom: 5.1},
    'huelva': {center: [-6.94, 37.2], zoom: 7.9},
    'madrid': {center: [-3.68, 40.47], zoom: 4.1},
    'vancouver': {center: [-123.11, 49.26], zoom: 5.6},
    'habana': {center: [-80.8395, 23.01], zoom: 5.1},
    'trinidad': {center: [-61.26, 10.44], zoom: 7.1},
    'londres': {center: [0.14, 51.4], zoom: 5.4}
  };

  function moverMapa(id) {
    const cerrarAsideBtn = document.getElementById('cerrar-aside');
    if (cerrarAsideBtn) {
      cerrarAsideBtn.click();
    }

    const { center, zoom } = ciudades[id];

    if (map && typeof map.flyTo === 'function') {
      map.flyTo({
        center,
        zoom,
        speed: esDispositivoMovil ? 0.8 : 0.5,
        curve: 1,
        easing(t) {
          return t;
        }
      });
    }
  }

  Object.keys(ciudades).forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.addEventListener('click', () => moverMapa(id));
    }
  });

  if (sliderContainer) {
    $("#sliderHandle").slider({
      range: 'min',
      min: 0,
      max: 23,
      value: 0.8,
      step: 0.1,
      create: function() {
        $("#custom-handle").text($(this).slider("value").toFixed(1));
      },
      slide: function(event, ui) {
        $("#custom-handle").text(ui.value.toFixed(1));
        zoomy = ui.value;
        go_zoom();
      }
    });

    $("#sliderHandle").draggable();

    if (esDispositivoMovil) {
      $("#sliderHandle").css({
        'height': '30px',
        'touch-action': 'none'
      });
      $(".ui-slider-handle").css({
        'width': '40px',
        'height': '40px',
        'top': '-5px',
        'margin-left': '-20px'
      });
    }
  }

  // Optimizar el rendimiento del mapa
  if (map) {
    map.dragRotate.disable(); // Desactivar la rotación por arrastre
    map.touchZoomRotate.disableRotation(); // Desactivar la rotación en dispositivos táctiles
    
    // Reducir la calidad durante el movimiento para mejorar el rendimiento
    map.on('movestart', () => {
      map.getCanvas().style.imageRendering = 'pixelated';
    });
    
    map.on('moveend', () => {
      map.getCanvas().style.imageRendering = 'auto';
    });

    // Ajustar la sensibilidad del zoom con la rueda del ratón
    map.scrollZoom.setWheelZoomRate(1 / 450);

    // Limitar el zoom máximo y mínimo
    map.setMaxZoom(18);
    map.setMinZoom(1);
  }
});

function go_zoom() {
  if (map) {
    map.easeTo({
      zoom: zoomy,
      duration: 500,
      easing: (t) => t * (2 - t)
    });
  }
}