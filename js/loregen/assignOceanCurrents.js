function determineOceanCurrents(provinces) {
    const width = 8192;
    const height = 4096;
    const equatorY = 496;
    const oceanCurrents = [];

    // Function to calculate Coriolis effect direction based on hemisphere
    function coriolisEffect(y) {
        return y < equatorY ? -1 : 1; // -1 for Southern Hemisphere, 1 for Northern Hemisphere
    }

    // Function to determine current direction based on neighboring provinces
    function getCurrentDirection(province, neighbors) {
        let direction = { x: 0, y: 0 };

        neighbors.forEach(neighborIndex => {
            const neighbor = provinces[neighborIndex];
            const dx = neighbor.x - province.x;
            const dy = neighbor.y - province.y;

            direction.x += dx;
            direction.y += dy;
        });

        // Normalize direction vector
        const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
        }

        return direction;
    }

    // New complex function for calculating thermohaline circulation
    function calculateThermohalineCirculation(province, neighbors) {
        // Constants for density calculation
        const MAX_DENSITY = 1028; // Maximum seawater density (kg/m^3)
        const MIN_DENSITY = 1020; // Minimum seawater density (kg/m^3)
        const TEMPERATURE_EFFECT = -0.2; // Change in density per degree Celsius
        const SALINITY_EFFECT = 0.8; // Change in density per PSU (Practical Salinity Units)

        // Helper function to calculate density based on temperature and salinity
        function calculateDensity(temperature, salinity) {
            return MIN_DENSITY + (temperature * TEMPERATURE_EFFECT) + (salinity * SALINITY_EFFECT);
        }

        // Assume we have functions to get temperature and salinity of a province
        function getTemperature(province) {
            // Placeholder: Replace with actual temperature data retrieval
            return province.y < equatorY ? 30 - (province.y / height * 30) : 0;
        }

        function getSalinity(province) {
            // Placeholder: Replace with actual salinity data retrieval
            return 35 + (province.y / height * 5);
        }

        // Calculate the density of the current province
        const currentTemperature = getTemperature(province);
        const currentSalinity = getSalinity(province);
        const currentDensity = calculateDensity(currentTemperature, currentSalinity);

        // Calculate the average density of neighboring provinces
        let neighborDensitySum = 0;
        neighbors.forEach(neighborIndex => {
            const neighbor = provinces[neighborIndex];
            const neighborTemperature = getTemperature(neighbor);
            const neighborSalinity = getSalinity(neighbor);
            const neighborDensity = calculateDensity(neighborTemperature, neighborSalinity);
            neighborDensitySum += neighborDensity;
        });
        const averageNeighborDensity = neighborDensitySum / neighbors.length;

        // Determine the vertical current direction based on density differences
        let verticalCurrentDirection = 0;
        if (currentDensity > averageNeighborDensity) {
            verticalCurrentDirection = 1; // Downward current
        } else if (currentDensity < averageNeighborDensity) {
            verticalCurrentDirection = -1; // Upward current
        }

        // Determine the horizontal current direction based on density gradient
        let horizontalCurrentDirection = { x: 0, y: 0 };
        neighbors.forEach(neighborIndex => {
            const neighbor = provinces[neighborIndex];
            const neighborTemperature = getTemperature(neighbor);
            const neighborSalinity = getSalinity(neighbor);
            const neighborDensity = calculateDensity(neighborTemperature, neighborSalinity);

            const dx = neighbor.x - province.x;
            const dy = neighbor.y - province.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance > 0) {
                const densityGradient = (neighborDensity - currentDensity) / distance;
                horizontalCurrentDirection.x += densityGradient * dx;
                horizontalCurrentDirection.y += densityGradient * dy;
            }
        });

        // Normalize the horizontal current direction vector
        const length = Math.sqrt(horizontalCurrentDirection.x ** 2 + horizontalCurrentDirection.y ** 2);
        if (length > 0) {
            horizontalCurrentDirection.x /= length;
            horizontalCurrentDirection.y /= length;
        }

        return {
            verticalCurrentDirection,
            horizontalCurrentDirection
        };
    }

    // Iterate through all provinces to calculate ocean currents
    provinces.forEach(province => {
        if (province.land) return;

        const neighbors = province.neighbors.map(n => n.nonDef);
        const currentDirection = getCurrentDirection(province, neighbors);

        // Apply Coriolis effect
        const coriolis = coriolisEffect(province.y);
        currentDirection.x *= coriolis;

        // Simplified wind effect based on latitude
        let windEffect = 0;
        if (province.y < equatorY + 1007) {
            windEffect = 1; // Tropical easterlies
        } else if (province.y < equatorY + 1520) {
            windEffect = -1; // Subtropical westerlies
        } else if (province.y < equatorY + 2865) {
            windEffect = 1; // Temperate easterlies
        } else {
            windEffect = -1; // Polar westerlies
        }

        currentDirection.x += windEffect * 0.5; // Adjust influence of wind

        // Calculate thermohaline circulation
        const thermohaline = calculateThermohalineCirculation(province, neighbors);
        currentDirection.x += thermohaline.horizontalCurrentDirection.x * 0.5; // Adjust influence of thermohaline circulation
        currentDirection.y += thermohaline.horizontalCurrentDirection.y * 0.5; // Adjust influence of thermohaline circulation
        let o = {
            province: province.nonDef,
            x: province.x,
            y: province.y,
            currentDirection,
            verticalCurrentDirection: thermohaline.verticalCurrentDirection
        }
        province.oceanCurrents = o;
        // Store the combined effects in ocean currents
        oceanCurrents.push(o);
    });

    return oceanCurrents;
}
