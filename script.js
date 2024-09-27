// Mappa centrata sull'Italia con Leaflet.js
let map;

function initMap() {
    // Assicurati che il container della mappa abbia dimensioni
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
    L.marker([lat, lon]).addTo(map).bindPopup("La tua posizione attuale").openPopup();
    map.setView([lat, lon], 10);
}

// Funzione per cercare gli indirizzi con Nominatim e mostrarli in un autocomplete
function searchAddress(query) {
    if (!query || query.length < 3) return; // Esegui la ricerca solo se la query è più lunga di 3 caratteri

    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const results = document.getElementById('autocomplete-results');
            results.innerHTML = ''; // Pulisci i risultati precedenti

            data.forEach(place => {
                const li = document.createElement('li');
                li.textContent = `${place.display_name}`;
                li.onclick = () => {
                    const lat = place.lat;
                    const lon = place.lon;
                    L.marker([lat, lon]).addTo(map).bindPopup("Indirizzo della persona amata").openPopup();
                    map.setView([lat, lon], 10);
                    results.innerHTML = ''; // Pulisci i risultati una volta selezionato un indirizzo
                    document.getElementById('lovedOneAddress').value = place.display_name;
                };
                results.appendChild(li);
            });
        })
        .catch(err => console.error(err));
}

window.onload = function () {
    initMap();

    // Nascondere la schermata di intro al primo scroll
    document.getElementById('intro').addEventListener('click', function () {
        document.getElementById('intro').style.display = 'none';
        document.querySelector('header').style.display = 'block';
    });
};
