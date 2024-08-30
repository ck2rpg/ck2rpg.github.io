function resetVoronoi() {
    world.voronoi = new Voronoi();
    world.bbox  = {xl: 0, xr: settings.width - 1, yt: 0, yb: settings.height - 1};
    world.sites = []
    settings.tooSmallProvince = 100
    for (let i = 0; i < 50; i++) {
        let cell = { x: getRandomInt(1, settings.width - 1), y: getRandomInt(1, settings.height - 1)}
        world.sites.push(cell)
    }
    world.diagram = world.voronoi.compute(world.sites, world.bbox)
}

function getCellIdFromPoint(x, y) {
    if (world.treemap) {
        
    } else {
        world.treemap = buildTreeMap();
    }
    // Get the Voronoi cells from the tree map given x,y
    var items = world.treemap.retrieve({x:x,y:y}),
        iItem = items.length,
        cells = world.diagram.cells,
        cell, cellid;
    while (iItem--) {
        cellid = items[iItem].cellid;
        cell = cells[cellid];
        if (cell.pointIntersection(x,y) > 0) {
                return cellid;
            }
        }
    return undefined;
}

function assignProvinceFromPoint(x, y) {
    let id = getCellIdFromPoint(x, y);
    if (id) {
        let prov = world.diagram.cells[id].site.province;
        return prov;
    }
}

function buildTreeMap() {
    var treemap = new QuadTree({
        x: world.bbox.xl,
        y: world.bbox.yt,
        width: world.bbox.xr - world.bbox.xl,
        height: world.bbox.yb - world.bbox.yt
        });
    var cells = world.diagram.cells,
        iCell = cells.length;
    while (iCell--) {
        bbox = cells[iCell].getBbox();
        bbox.cellid = iCell;
        treemap.insert(bbox);
        }
    return treemap;
}

function createVoronoiProvinces() {
    resetVoronoi()
    //createSmallMap()
    console.log("ok")
    for (let i = 0; i < world.sites.length; i++) {
        let lw = "l"
        let seed = world.sites[i]
        let n = parseInt(seed.x);
        let n2 = parseInt(seed.y)
        let cell = world.smallMap[n2][n]
        cell.children = [];
        cell.children.push(cell);
        cell.parent = cell;
        if (cell.bigCell && cell.bigCell.elevation > limits.seaLevel.lower) {
            lw = "l"
        } else {
            lw = "w"
        }
        seedCell(cell.x, cell.y, lw)
        world.seedCells.push(cell)
    }
    /*
    for (let i = 0; i < settings.height; i++) {
        for (let j = 0; j < settings.width; j++) {
            let cell = world.smallMap[i][j];
            cell.province = assignProvinceFromPoint(j, i)
        }
    }
        */
}