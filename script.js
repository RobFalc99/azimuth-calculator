let map = L.map('map').setView([41.9028, 12.4964], 6);  // Centra la mappa sull'Italia

// Aggiungi tile layer da OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Crea due marker per selezionare i punti
let marker1 = L.marker([41.9275, 12.6370], {draggable: true}).addTo(map);
let marker2 = L.marker([40.7436, 14.6145], {draggable: true}).addTo(map);

// Aggiungi un popup al marker del Punto 1
marker1.bindPopup('Tu sei qui').openPopup();

// Funzione per calcolare l'azimut
function calcolaAzimut() {
    const lat1 = marker1.getLatLng().lat;
    const lon1 = marker1.getLatLng().lng;
    const lat2 = marker2.getLatLng().lat;
    const lon2 = marker2.getLatLng().lng;

    // Converti le coordinate in radianti
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    // Differenza di longitudine
    const deltaLon = lon2Rad - lon1Rad;

    // Calcolo dell'azimut
    const x = Math.sin(deltaLon) * Math.cos(lat2Rad);
    const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) - (Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLon));

    // Calcolo dell'azimut in gradi
    let azimuth = toDegrees(Math.atan2(x, y));

    // Normalizzazione dell'azimut (deve essere tra 0° e 360°)
    if (azimuth < 0) {
        azimuth += 360;
    }

    // Visualizza il risultato
    document.getElementById('result').textContent = `L'azimut da Punto 1 a Punto 2 è di ${azimuth.toFixed(2)} gradi.`;

    // Aggiorna la bussola con l'azimut calcolato
    rotateArrow(azimuth);
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

// Funzione per ruotare la freccia della bussola
function rotateArrow(azimuth) {
    const arrow = document.getElementById('arrow');
    arrow.style.transform = `translateX(-50%) rotate(${azimuth}deg)`;
}

// Funzione per gestire l'orientamento del dispositivo
function handleOrientation(event) {
    const compassHeading = event.alpha;  // Alpha rappresenta l'orientamento rispetto al nord
    const arrow = document.getElementById('arrow');
    arrow.style.transform = `translateX(-50%) rotate(${compassHeading}deg)`;
}

// Aggiungi l'evento per l'orientamento del dispositivo
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleOrientation, true);
} else {
    alert("Il tuo dispositivo non supporta l'orientamento del dispositivo.");
}
