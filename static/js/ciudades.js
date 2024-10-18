document.addEventListener('DOMContentLoaded', () => {
  if (screen.width < 1200) {
    document.getElementsByClassName('slider-container').style.display="none"
   
  }})
    



  const ciudades = {
    'Dublin': {center: [-6.26, 53.34], zoom: 6.2, informacion: "https://www.voyadublin.com/dublin/"},
    'Mallorca': {center: [2.88, 39.6], zoom: 7.2, informacion: "https://www.youtube.com/embed/ZMdmjBh8rF4?si=Z5NELuabf9MUA9no"},
    'Caracas': {center: [-66.91, 10.50], zoom: 5.0, informacion: "https://es.wikipedia.org/wiki/Caracas"},
    'Huelva': {center: [-6.94, 37.2], zoom: 7.9, informacion: "https://es.wikipedia.org/wiki/Huelva"},
    'Madrid': {center: [-3.68, 40.47], zoom: 7.9, informacion: "https://es.wikipedia.org/wiki/Madrid"},
    'Trinidad': {center: [-61.26, 10.44], zoom: 7.1, informacion: "https://es.wikipedia.org/wiki/Trinidad_y_Tobago"},
    'Londres': {center: [0.14, 51.4], zoom: 5.4, informacion: "https://es.wikipedia.org/wiki/Londres"},
    'Piramides_Giza': {center: [31.1342, 29.9792], zoom: 14.5, informacion: "https://es.wikipedia.org/wiki/Pir%C3%A1mides_de_Guiza"},
    'Machu_Picchu': {center: [-72.5450, -13.1631], zoom: 15, informacion: "https://es.wikipedia.org/wiki/Machu_Picchu"},
    'Taj_Mahal': {center: [78.0422, 27.1751], zoom: 16, informacion: "https://es.wikipedia.org/wiki/Taj_Mahal"},
    'Gran_Muralla': {center: [116.5704, 40.4319], zoom: 10, informacion: "https://es.wikipedia.org/wiki/Gran_Muralla_China"},
    'Petra': {center: [35.4444, 30.3285], zoom: 14, informacion: "https://es.wikipedia.org/wiki/Petra"},
    'Estatua_Libertad': {center: [-74.0445, 40.6892], zoom: 15, informacion: "https://es.wikipedia.org/wiki/Estatua_de_la_Libertad"},
    'Torre_Eiffel': {center: [2.2945, 48.8584], zoom: 16, informacion: "https://es.wikipedia.org/wiki/Torre_Eiffel"},
    'Toledo': {center: [-4.0273, 39.8628], zoom: 14, informacion: "https://es.wikipedia.org/wiki/Toledo"},
    'Acropolis_Atenas': {center: [23.7257, 37.9715], zoom: 16, informacion: "https://es.wikipedia.org/wiki/Acr%C3%B3polis_de_Atenas"},
    'Coliseo_Roma': {center: [12.4922, 41.8902], zoom: 16, informacion: "https://es.wikipedia.org/wiki/Coliseo"},
    'Alhambra': {center: [-3.5886, 37.1760], zoom: 15.5, informacion: "https://es.wikipedia.org/wiki/Alhambra"},
    'Angkor_Wat': {center: [103.8670, 13.4125], zoom: 14, informacion: "https://es.wikipedia.org/wiki/Angkor_Wat"},
    'Sagrada_Familia': {center: [2.1744, 41.4036], zoom: 16, informacion: "https://es.wikipedia.org/wiki/Templo_Expiatorio_de_la_Sagrada_Familia"},
    'Gobekli_Tepe': {center: [38.9222, 37.2231], zoom: 15, informacion: "https://es.wikipedia.org/wiki/G%C3%B6bekli_Tepe"},
    'Stonehenge': {center: [-1.8262, 51.1789], zoom: 15, informacion: "https://es.wikipedia.org/wiki/Stonehenge"},
    'Kaaba': {center: [39.8262, 21.4225], zoom: 16, informacion: "https://es.wikipedia.org/wiki/Kaaba"},
    'Basilica_San_Pedro': {center: [12.4534, 41.9022], zoom: 16, informacion: "https://es.wikipedia.org/wiki/Bas%C3%ADlica_de_San_Pedro"},
    'Teotihuacan': {center: [-98.8443, 19.6925], zoom: 14, informacion: "https://es.wikipedia.org/wiki/Teotihuacan"},
    'Lalibela': {center: [39.0476, 12.0315], zoom: 15, informacion: "https://es.wikipedia.org/wiki/Lalibela"},
    'Cataratas_Victoria': {center: [25.8573, -17.9244], zoom: 12, informacion: "https://es.wikipedia.org/wiki/Cataratas_Victoria"},
    'Bosque_Bwindi': {center: [29.6166, -1.0406], zoom: 11, informacion: "https://es.wikipedia.org/wiki/Parque_Nacional_del_Bosque_Impenetrable_de_Bwindi"},
    'Isla_Pascua': {center: [-109.3667, -27.1167], zoom: 11, informacion: "https://es.wikipedia.org/wiki/Isla_de_Pascua"},
    'Salar_Uyuni': {center: [-67.5452, -20.1338], zoom: 9, informacion: "https://es.wikipedia.org/wiki/Salar_de_Uyuni"},
    'Cristo_Redentor': {center: [-43.2104, -22.9519], zoom: 15, informacion: "https://es.wikipedia.org/wiki/Cristo_Redentor"},
    'Yellowstone': {center: [-110.5885, 44.4280], zoom: 9, informacion: "https://es.wikipedia.org/wiki/Parque_nacional_de_Yellowstone"},
    'Cataratas_Niagara': {center: [-79.0713, 43.0828], zoom: 12, informacion: "https://es.wikipedia.org/wiki/Cataratas_del_Ni%C3%A1gara"},
    'Gran_Canon': {center: [-112.1401, 36.0544], zoom: 11, informacion: "https://es.wikipedia.org/wiki/Gran_Ca%C3%B1%C3%B3n_del_Colorado"},
    'Yellowknife': {center: [-114.3719, 62.4540], zoom: 11, informacion: "https://es.wikipedia.org/wiki/Yellowknife"},
    'Ciudad_Ur': {center: [46.1031, 30.9626], zoom: 15, informacion: "https://es.wikipedia.org/wiki/Ur"},
    'Monte_Fuji': {center: [138.7274, 35.3606], zoom: 11, informacion: "https://es.wikipedia.org/wiki/Monte_Fuji"},
    'Ciudad_Prohibida': {center: [116.3972, 39.9169], zoom: 16, informacion: "https://es.wikipedia.org/wiki/Ciudad_Prohibida"},
    'Bagan': {center: [94.8585, 21.1717], zoom: 12, informacion: "https://es.wikipedia.org/wiki/Bagan"},
    'Cuevas_Ajanta': {center: [75.7033, 20.5519], zoom: 14, informacion: "https://es.wikipedia.org/wiki/Cuevas_de_Ajanta"},
    'Cuevas_Ellora': {center: [75.1779, 20.0268], zoom: 14, informacion: "https://es.wikipedia.org/wiki/Cuevas_de_Ellora"},
    'Venecia': {center: [12.3155, 45.4408], zoom: 13, informacion: "https://es.wikipedia.org/wiki/Venecia"},
    'Santorini': {center: [25.4615, 36.3932], zoom: 11, informacion: "https://es.wikipedia.org/wiki/Santorini"},
    'Castillo_Neuschwanstein': {center: [10.7498, 47.5576], zoom: 15, informacion: "https://es.wikipedia.org/wiki/Castillo_de_Neuschwanstein"},
    'Notre_Dame': {center: [2.3499, 48.8530], zoom: 16, informacion: "https://es.wikipedia.org/wiki/Catedral_de_Notre_Dame_(Par%C3%ADs)"},
    'Pompeya': {center: [14.4857, 40.7508], zoom: 15, informacion: "https://es.wikipedia.org/wiki/Pompeya"},
    'Acueducto_Segovia': {center: [-4.1185, 40.9480], zoom: 16, informacion: "https://es.wikipedia.org/wiki/Acueducto_de_Segovia"},
    'Puerto_Sydney': {center: [151.2093, -33.8688], zoom: 13, informacion: "https://es.wikipedia.org/wiki/Puerto_de_S%C3%ADdney"},
    'Pinguinos_Phillip': {center: [145.1506, -38.4899], zoom: 12, informacion: "https://es.wikipedia.org/wiki/Isla_Phillip"},
    'Gran_Barrera_Coral': {center: [146.2559, -18.2871], zoom: 7, informacion: "https://es.wikipedia.org/wiki/Gran_barrera_de_coral"},
    'Catedral de Ciudad Real':{center:[ -3.9309,38.9866],zoom:14,informacion:"https://res.cloudinary.com/dquxfl0fe/video/upload/didactico_htn1mq.mp4?_s=vp-2.1.0"}
  };
  
  const esDispositivoMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  function moverMapa(id) {
    if (screen.width < 1200) {
      document.getElementById('cerrar-aside').click();
    }

    const { center, zoom } = ciudades[id];

    if (esDispositivoMovil) {
      map.jumpTo({ center, zoom });
      setTimeout(() => map.fire('moveend'), 500);
    } else {
      map.flyTo({ center, zoom, speed: 0.2 });
    }
  }

 


 
 
