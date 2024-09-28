// Mappa centrata sull'Italia con Leaflet.js
let map;
let userMarker = null; // Marker per la posizione dell'utente
let lovedOneMarker = null; // Marker per la persona amata
let line = null; // Linea che collega i due punti

// Funzione per inizializzare la mappa
function initMap() {
    map = L.map('map').setView([41.9028, 12.4964], 5); // Centra la mappa sull'Italia
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Funzione per ottenere la posizione dell'utente
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("La geolocalizzazione non è supportata da questo browser.");
    }
}

// Funzione per mostrare la posizione sulla mappa e ottenere l'indirizzo tramite Nominatim
function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Posiziona il marker sulla mappa
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    userMarker = L.marker([lat, lon]).addTo(map).bindPopup("La tua posizione attuale").openPopup();
    map.setView([lat, lon], 10);

    // Usa Nominatim per ottenere l'indirizzo e inserirlo nel campo
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('myAddress').value = data.display_name;
        })
        .catch(err => console.error(err));
}

// Funzione per cercare un indirizzo tramite Nominatim
function searchAddress(query, inputField) {
    if (!query || query.length < 3) return;

    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const results = document.getElementById('autocomplete-results');
            results.innerHTML = ''; // Pulisci i risultati precedenti

            // Aggiungi i risultati della ricerca all'elenco
            data.forEach(place => {
                const li = document.createElement('li');
                li.textContent = place.display_name;
                li.onclick = () => {
                    const lat = place.lat;
                    const lon = place.lon;
                    if (inputField === 'lovedOneAddress') {
                        if (lovedOneMarker) {
                            map.removeLayer(lovedOneMarker);
                        }
                        lovedOneMarker = L.marker([lat, lon]).addTo(map).bindPopup("Indirizzo della persona che cerchi").openPopup();
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

// Funzione per disegnare la linea tra l'utente e la persona amata
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

        // Adatta la mappa per mostrare entrambi i punti
        map.fitBounds([userLatLng, lovedOneLatLng], {
            padding: [50, 50],
            maxZoom: 10
        });
    }
}

// Funzione per simulare la declinazione magnetica (da sostituire con API reale)
function getMagneticDeclination(lat, lon) {
    return 2.5; // Simulazione: 2.5 gradi verso Est
}

// Funzione per correggere l'azimuth usando la declinazione magnetica
function correctAzimuthForMagneticDeclination(azimuth, declination) {
    return (azimuth - declination + 360) % 360; // Mantiene l'azimuth nell'intervallo 0-360 gradi
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
    return (azimuth + 360) % 360;
}

// Funzione per calcolare l'azimuth e correggerlo per la declinazione magnetica
document.getElementById('calculateAzimuthBtn').addEventListener('click', () => {
    if (userMarker && lovedOneMarker) {
        const userLatLng = userMarker.getLatLng();
        const lovedOneLatLng = lovedOneMarker.getLatLng();

        // Calcola l'azimuth geografico
        let azimuth = calculateAzimuth(userLatLng.lat, userLatLng.lng, lovedOneLatLng.lat, lovedOneLatLng.lng);

        // Ottieni la declinazione magnetica
        const declination = getMagneticDeclination(userLatLng.lat, userLatLng.lng);

        // Correggi l'azimuth
        const correctedAzimuth = correctAzimuthForMagneticDeclination(azimuth, declination);

        // Mostra l'azimuth corretto
        document.getElementById('azimuthResult').textContent = `${correctedAzimuth.toFixed(2)}°`;
    } else {
        document.getElementById('azimuthResult').textContent = 'Seleziona entrambe le posizioni.';
    }

    // Scorri fino in fondo alla pagina
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
});

// Funzione per aprire il sito esterno della bussola
function openCompass() {
    window.open("https://lamplightdev.github.io/compass/", "_blank");
}

// Inizializza la mappa al caricamento della pagina
window.onload = function () {
    initMap();
};
