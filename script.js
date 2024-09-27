// Mappa centrata sull'Italia con Leaflet.js
let map;
let userMarker = null;
let lovedOneMarker = null;
let line = null;

function initMap() {
    map = L.map('map').setView([41.9028, 12.4964], 5); // Italia
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("La geolocalizzazione non è supportata da questo browser.");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    userMarker = L.marker([lat, lon]).addTo(map).bindPopup("La tua posizione attuale").openPopup();
    map.setView([lat, lon], 10);

    // Usa Nominatim per ottenere l'indirizzo
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('myAddress').value = data.display_name;
        })
        .catch(err => console.error(err));

    drawLine(); // Disegna la linea se entrambi i marker sono presenti
}

function searchAddress(query, inputField) {
    if (!query || query.length < 3) return;

    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const results = document.getElementById('autocomplete-results');
            results.innerHTML = '';

            data.forEach(place => {
                const li = document.createElement('li');
                li.textContent = place.display_name;
                li.onclick = () => {
                    const lat = place.lat;
                    const lon = place.lon;
                    if (inputField === 'myAddress') {
                        if (userMarker) {
                            map.removeLayer(userMarker);
                        }
                        userMarker = L.marker([lat, lon]).addTo(map).bindPopup("La tua posizione").openPopup();
                    } else if (inputField === 'lovedOneAddress') {
                        if (lovedOneMarker) {
                            map.removeLayer(lovedOneMarker);
                        }
                        lovedOneMarker = L.marker([lat, lon]).addTo(map).bindPopup("Indirizzo della persona amata").openPopup();
                    }
                    map.setView([lat, lon], 10);
                    document.getElementById(inputField).value = place.display_name;
                    results.innerHTML = ''; // Nascondi i suggerimenti
                    drawLine(); // Disegna la linea se entrambi i marker sono presenti
                };
                results.appendChild(li);
            });
        })
        .catch(err => console.error(err));
}

// Funzione per disegnare la linea tra i due punti
function drawLine() {
    if (userMarker && lovedOneMarker) {
        const userLatLng = userMarker.getLatLng();
        const lovedOneLatLng = lovedOneMarker.getLatLng();

        // Rimuovi la linea precedente se esiste
        if (line) {
            map.removeLayer(line);
        }

        // Disegna la linea tra i due punti
        line = L.polyline([userLatLng, lovedOneLatLng], { color: 'blue' }).addTo(map);

        // Usa fitBounds per adattare la mappa a entrambi i punti
        map.fitBounds([userLatLng, lovedOneLatLng], {
            padding: [50, 50], // Padding opzionale per spazio extra attorno ai punti
            maxZoom: 10 // Imposta un livello di zoom massimo per evitare zoom eccessivo
        });
    }
}


// Funzione per calcolare l'azimuth tra due punti
function calculateAzimuth(lat1, lon1, lat2, lon2) {
    const toRadians = (degrees) => degrees * Math.PI / 180;
    lat1 = toRadians(lat1);
    lat2 = toRadians(lat2);
    const deltaLon = toRadians(lon2 - lon1);
    const x = Math.sin(deltaLon) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
    const azimuth = Math.atan2(x, y) * (180 / Math.PI);
    return (azimuth + 360) % 360; // Normalizza l'azimuth
}

// Funzione per calcolare l'azimuth al click del pulsante
document.getElementById('calculateAzimuthBtn').addEventListener('click', () => {
    // Controlla se entrambi i marker sono presenti
    if (userMarker && lovedOneMarker) {
        const userLatLng = userMarker.getLatLng();
        const lovedOneLatLng = lovedOneMarker.getLatLng();
        const azimuth = calculateAzimuth(userLatLng.lat, userLatLng.lng, lovedOneLatLng.lat, lovedOneLatLng.lng);
        document.getElementById('azimuthResult').textContent = `${azimuth.toFixed(2)}°`;
    } else {
        document.getElementById('azimuthResult').textContent = 'Seleziona entrambe le posizioni.';
    }

    // Scorri fino in fondo alla pagina
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
});


window.onload = function () {
    initMap();
};
