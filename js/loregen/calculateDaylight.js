function assignDaylight() {
    for (let i = 0; i < world.provinces.length; i++) {
        let p = world.provinces[i]
        p.daylight = calculateDaylight(p.y)
    }
}

function calculateDaylight(distanceFromEquator) {
    const maxLatitude = 3600; // Maximum distance from the equator in the given context
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Helper function to convert degrees to radians
    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Calculate approximate daylight hours based on latitude and day of the year
    function calculateDaylight(latitude, dayOfYear) {
        const axialTilt = 23.44; // Earth's axial tilt in degrees
        const declination = axialTilt * Math.sin(toRadians((360 / 365) * (dayOfYear - 81)));
        
        const tanLatitude = Math.tan(toRadians(latitude));
        const tanDeclination = Math.tan(toRadians(declination));
        const cosHourAngle = -tanLatitude * tanDeclination;
        
        let hourAngle;
        if (cosHourAngle >= 1) {
            hourAngle = 0; // Polar night
        } else if (cosHourAngle <= -1) {
            hourAngle = Math.PI; // Polar day
        } else {
            hourAngle = Math.acos(cosHourAngle);
        }
        
        const daylightHours = 2 * (hourAngle * (180 / Math.PI)) / 15;
        return daylightHours;
    }
    
    const results = [];
    for (let month = 0; month < 12; month++) {
        const dayOfYear = 15 + month * 30; // Approximate day of the year for each month
        const latitude = (distanceFromEquator / maxLatitude) * 90;
        const daylightHours = calculateDaylight(latitude, dayOfYear);
        results.push({ month: months[month], daylightHours: daylightHours.toFixed(2) });
    }
    
    return results;
}