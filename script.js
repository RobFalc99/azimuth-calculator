const map = L.map('map').setView([41.9028, 12.4964], 5); // Centro sull'Italia

// Aggiungi la mappa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Variabili per i punti
let userLocation = null;
let destinationLocation = null;
let line = null; // Variabile per la linea

// Funzione per calcolare l'azimuth
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

// Gestione del bottone "Tu sei qui"
document.getElementById('locateBtn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition((position) => {
        userLocation = [position.coords.latitude, position.coords.longitude];
        L.marker(userLocation).addTo(map).bindPopup('Tu sei qui').openPopup();
        map.setView(userLocation, 7);
    });
});

// Funzione per ottenere suggerimenti di indirizzi
async function getAddressSuggestions(query) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`);
    const data = await response.json();
    return data;
}

// Gestione dell'input per l'indirizzo
document.getElementById('addressInput').addEventListener('input', async (e) => {
    const query = e.target.value;
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';

    if (query.length > 2) {
        const results = await getAddressSuggestions(query);
        results.forEach(result => {
            const li = document.createElement('li');
            li.textContent = result.display_name;
            li.onclick = () => {
                destinationLocation = [result.lat, result.lon];
                L.marker(destinationLocation).addTo(map).bindPopup('Destinazione').openPopup();
                map.setView(destinationLocation, 7);

                if (line) {
                    map.removeLayer(line);
                }
                line = L.polyline([userLocation, destinationLocation], { color: 'blue' }).addTo(map);

                // Chiudi la lista dei suggerimenti
                suggestions.innerHTML = '';  // Nascondi la lista
            };
            suggestions.appendChild(li);
        });
    }
});


// Gestione del calcolo dell'azimuth
document.getElementById('calculateBtn').addEventListener('click', () => {
    if (userLocation && destinationLocation) {
        const azimuth = calculateAzimuth(userLocation[0], userLocation[1], destinationLocation[0], destinationLocation[1]);
        const popupText = `L'azimuth tra i vostri luoghi speciali è di <strong>${azimuth.toFixed(2)} gradi</strong>.`;

        // Mostra il popup
        document.getElementById('popup-text').innerHTML = popupText;
        document.getElementById('popup').classList.remove('hidden');
    } else {
        document.getElementById('result').innerText = 'Per favore, seleziona entrambi i punti.';
    }
});

// Chiudi il popup
document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('popup').classList.add('hidden');
});

// Gestione del calcolo finale dell'azimuth
document.getElementById('finalCalculateBtn').addEventListener('click', () => {
    if (userLocation && destinationLocation) {
        const azimuth = calculateAzimuth(userLocation[0], userLocation[1], destinationLocation[0], destinationLocation[1]);
        const finalPopupText = `L'azimuth finale tra i vostri luoghi è di <strong>${azimuth.toFixed(2)} gradi</strong>.`;

        // Mostra il popup
        document.getElementById('popup-text').innerHTML = finalPopupText;
        document.getElementById('popup').classList.remove('hidden');
    } else {
        document.getElementById('result').innerText = 'Per favore, seleziona entrambi i punti.';
    }
});
