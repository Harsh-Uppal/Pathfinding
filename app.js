let cols = rows = 5;
let player = vec(0, 0), target = vec(cols - 1, rows - 1);
let currentCell = 'player';
let grid = null, gridElem, walls = [];
let joystick, joystickContext;
let gridEditable = true;

const cellColors = {
    player: 'gold',
    wall: 'steelblue',
    target: 'red',
    path: 'blue',
    open: '#4A4',
    empty: ''
}

window.addEventListener('load', () => {
    document.querySelectorAll('.cells>*').forEach(cell => {
        cell.children[1].style.backgroundColor = cellColors[cell.name];
    });

    gridElem = document.querySelector('#grid');

    let selectedCell = document.querySelector('.cells > *');
    selectedCell.style.backgroundColor = 'var(--selected-color)';
    document.querySelectorAll('.cells > *').forEach(cell => {
        cell.addEventListener('click', () => {
            selectedCell.style.backgroundColor = '';
            currentCell = cell.name;
            cell.style.backgroundColor = 'var(--selected-color)';
            selectedCell = cell;
        });
    });

    createGrid();

    grid[player.x][player.y].style.backgroundColor = cellColors.player;
    grid[target.x][target.y].style.backgroundColor = cellColors.target;
});

function createGrid() {
    grid = [];
    gridCols = [];
    let column, cell;

    for (let c = 0; c < cols; c++) {
        column = document.createElement('div');
        column.className = 'column';
        grid.push([]);
        for (let r = 0; r < rows; r++) {
            cell = document.createElement('div');
            cell.className = 'cell';
            cell.addEventListener('click', () => cellClicked(vec(c, r)))
            column.appendChild(cell);
            grid[c].push(cell);
        }
        gridElem.appendChild(column);
    }
}

function cellClicked(pos) {
    if (!gridEditable || pos.equals(player, target))
        return;

    grid[pos.x][pos.y].style.backgroundColor = cellColors[currentCell];
    switch (currentCell) {
        case 'player':
            grid[player.x][player.y].style.backgroundColor = cellColors.empty;
            player = pos;
            break;
        case 'target':
            grid[target.x][target.y].style.backgroundColor = cellColors.empty;
            target = pos;
            break;
        case 'wall':
            if (walls[pos.x] == null)
                walls[pos.x] = [];

            walls[pos.x][pos.y] = true;
            break;
        case 'empty':
            if (walls[pos.x] != null && walls[pos.x][pos.y])
                walls[pos.x][pos.y] = undefined;
            break;
    }
}

function play() {
    showPath(player, target, walls);
    gridEditable = false;
}

function showPath(start, end, obstacles) {
    let nodes = [];

    for (let c = 0; c < cols; c++) {
        nodes[c] = [];
        for (let r = 0; r < rows; r++)
            nodes[c][r] = { fCost: Infinity, gCost: Infinity, hCost: Infinity, last: null, state: null };
    }

    nodes[start.x][start.y] = { fCost: 0, gCost: 0, hCost: 0 };

    let open = [start], closed = [];
    let lastNode, currentNode;
    let leastCost, leastHCost, currentIndex;
    let gCost, hCost, fCost;
    while (true) {
        if (open.length == 0)
            break;

        //Set currentNode to the node with least fCost in open array
        leastCost = Infinity;
        leastHCost = Infinity;
        open.forEach((node, index) => {
            fCost = nodes[node.x][node.y].fCost;
            hCost = nodes[node.x][node.y].hCost;
            if (fCost < leastCost || (fCost == leastCost && hCost < leastHCost)) {
                leastCost = fCost;
                leastHCost = hCost;
                currentIndex = index;
                currentNode = node;
            }
        });

        //Make the current node closed
        open.splice(currentIndex, 1);
        closed.push(currentNode);
        nodes[currentNode.x][currentNode.y].state = 'closed';

        //If current node is the end then return the path
        if (currentNode.equals(end))
            break;

        lastNode = nodes[currentNode.x][currentNode.y].last;
        getNeighbours(currentNode).forEach(neighbourNode => {
            if ((obstacles[neighbourNode.x] != null && obstacles[neighbourNode.x][neighbourNode.y])
                || nodes[neighbourNode.x][neighbourNode.y].state == 'closed'
                || (lastNode != null && lastNode.equals(neighbourNode)))
                return;

            if (nodes[neighbourNode.x][neighbourNode.y].state == 'open')
                return;

            gCost = nodes[currentNode.x][currentNode.y].gCost + manhattanDist(currentNode, neighbourNode);
            hCost = manhattanDist(neighbourNode, end);
            nodes[neighbourNode.x][neighbourNode.y] = { gCost, hCost, fCost: gCost + hCost, last: currentNode, state: 'open' }
            open.push(neighbourNode);
            if (!neighbourNode.equals(player, target))
                grid[neighbourNode.x][neighbourNode.y].style.backgroundColor = cellColors.open;
        });

        if (!currentNode.equals(player, target))
            grid[currentNode.x][currentNode.y].style.backgroundColor = cellColors.path;
    }
}

function getNeighbours(cell) {
    let neighbours = [];

    for (let x = Math.max(cell.x - 1, 0); x < Math.min(cell.x + 2, cols); x++) {
        for (let y = Math.max(cell.y - 1, 0); y < Math.min(cell.y + 2, rows); y++) {
            if (x == cell.x && y == cell.y)
                continue;

            neighbours.push(vec(x, y));
        }
    }

    return neighbours;
}

function test(f, repeat) {
    console.time('test');

    for (let i = 0; i < repeat; i++)
        f();

    return console.timeEnd('test');
}

function addColumn() {
    let c = cols;
    cols++;

    grid.push([]);
    let cell, column = document.createElement('div');
    column.className = 'column';
    for (let r = 0; r < rows; r++) {
        cell = document.createElement('div');
        cell.className = 'cell';
        cell.addEventListener('click', () => cellClicked(vec(c, r)))
        column.appendChild(cell);
        grid[cols - 1].push(cell);
    }
    gridElem.appendChild(column);
}

function addRow() {
    let r = rows;
    rows++;

    let cell, columns = document.querySelectorAll('.grid .column');
    for (let c = 0; c < cols; c++) {
        cell = document.createElement('div');
        cell.className = 'cell';
        cell.addEventListener('click', () => cellClicked(vec(c, r)))
        columns[c].appendChild(cell);
        grid[c].push(cell);
    }
}

function reset() {
    grid.forEach(row => {
        row.forEach(cell => {
            cell.style.backgroundColor = '';
        });
    });

    walls.forEach((row, x) => {
        row.forEach((wall, y) => {
            if (wall)
                grid[x][y].style.backgroundColor = cellColors.wall;
        });
    });

    grid[player.x][player.y].style.backgroundColor = cellColors.player;
    grid[target.x][target.y].style.backgroundColor = cellColors.target;

    gridEditable = true;
}

const manhattanDist = (v0, v1) => Math.abs(v0.x - v1.x) + Math.abs(v0.y - v1.y);