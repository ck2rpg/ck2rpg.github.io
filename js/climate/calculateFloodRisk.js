function calculateFloodRisk(province) {
    // Define risk multipliers for different factors
    const ELEVATION_RISK_MULTIPLIER = 1.5;
    const WATER_PROXIMITY_RISK_MULTIPLIER = 2.0;
  
    const TERRAIN_RISK_MULTIPLIERS = {
      floodplains: 3.0,
      oasis: 1.5,
      taiga: 0.5,
      forest: 0.5,
      mountains: 0.2,
      desert: 0.1,
      desert_mountains: 0.15,
      drylands: 0.3,
      hills: 0.5,
      jungle: 1.5,
      steppe: 0.7,
      wetland: 2.5,
      farmlands: 1.0,
      plains: 1.0,
      sea: 0.0
    };
  
    const CLIMATE_RISK_MULTIPLIERS = {
      Af: 2.0,  // Tropical rainforest
      Aw: 1.8,  // Tropical savanna
      Am: 1.8,  // Tropical monsoon
      As: 1.5,  // Tropical savanna (dry summer)
      BWh: 0.2, // Arid desert (hot)
      BWk: 0.3, // Arid desert (cold)
      BSh: 0.4, // Semi-arid (hot)
      BSk: 0.5, // Semi-arid (cold)
      Csa: 1.2, // Mediterranean (hot summer)
      Csb: 1.0, // Mediterranean (warm summer)
      Cfa: 1.2, // Humid subtropical (no dry season, hot summer)
      Cfb: 1.0, // Oceanic (no dry season, warm summer)
      Cfc: 0.8, // Subpolar oceanic (no dry season, cool summer)
      Dfa: 0.8, // Humid continental (no dry season, hot summer)
      Dfb: 0.7, // Humid continental (no dry season, warm summer)
      Dfc: 0.6, // Subarctic (no dry season, cool summer)
      Dfd: 0.5, // Subarctic (no dry season, extremely cold winter)
      ET: 0.4,  // Tundra
      EF: 0.2   // Ice cap
    };
  
    // Calculate elevation risk (lower elevation = higher risk)
    let elevationRisk = (100 - province.elevation) * ELEVATION_RISK_MULTIPLIER;
    if (elevationRisk < 0) elevationRisk = 0;
  
    // Calculate water proximity risk
    let waterProximityRisk = 0;
    if (province.adjacentToWater.length > 0) {
      waterProximityRisk += (WATER_PROXIMITY_RISK_MULTIPLIER * province.adjacentToWater.length);
    }

    waterProximityRisk += (province.rivers.length * WATER_PROXIMITY_RISK_MULTIPLIER);
  
    // Calculate terrain risk
    const terrainRisk = TERRAIN_RISK_MULTIPLIERS[province.terrain] || 1.0;
  
    // Calculate climate risk
    const climateRisk = CLIMATE_RISK_MULTIPLIERS[province.climate] || 1.0;
  
    // Combine all risks to calculate total flood risk
    const totalFloodRisk = elevationRisk + waterProximityRisk + terrainRisk * climateRisk;
  
    province.floodRisk = totalFloodRisk;
  }

  function assignFloodRisks() {
    for (let i = 0; i < world.provinces.length; i++) {
        calculateFloodRisk(world.provinces[i])
    }
  }
  