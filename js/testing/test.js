function initializeTests() {
    //testing the post-generation work
    createDummyWorld();
    setProvinceDirections()
    overloadProvinceProperties()
    setLandProvinces()
    floodFillContinentsByProvince()
    //need world.continents - should probably save morei nfo
    seedEachContinentWithATribe()
    //add history
}