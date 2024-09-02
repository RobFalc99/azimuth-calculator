function calcolaAzimut() {
    const lat1 = parseFloat(document.getElementById('lat1').value);
    const lon1 = parseFloat(document.getElementById('lon1').value);
    const lat2 = parseFloat(document.getElementById('lat2').value);
    const lon2 = parseFloat(document.getElementById('lon2').value);

    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        alert('Per favore, inserisci valori numerici validi per tutte le coordinate.');
        return;
    }

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
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}
