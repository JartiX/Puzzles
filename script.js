const imageInput = document.getElementById("imageInput");
const piecesContainer = document.getElementById("piecesContainer");
const puzzleContainer = document.getElementById("puzzleContainer");
const shuffleBtn = document.getElementById("shuffleBtn");
const gridSizeY = 6; // Высота поля
const gridSizeX = 9; // Длина поля
const pieceSize = 100; // Размер клетки пазла
let pieces = [];

puzzleContainer.style.gridTemplateColumns = `repeat(${gridSizeX}, 1fr)`;
puzzleContainer.style.gridTemplateRows = `repeat(${gridSizeY}, 1fr);`;


// Создание сетки на поле
function createGrid() {
    puzzleContainer.innerHTML = "";
    for (let row = 0; row < gridSizeY; row++) {
        for (let col = 0; col < gridSizeX; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.style.width = `${pieceSize}px`;
            cell.style.height = `${pieceSize}px`;
            puzzleContainer.appendChild(cell);
        }
    }
}

// Загрузка изображения и создание пазлов
imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            preparePuzzle(img);
        };
    }
});

function preparePuzzle(img) {
    piecesContainer.innerHTML = "";
    pieces = [];
    const pieceWidth = img.width / gridSizeX;
    const pieceHeight = img.height / gridSizeY;

    for (let row = 0; row < gridSizeY; row++) {
        for (let col = 0; col < gridSizeX; col++) {
            const piece = document.createElement("div");
            piece.classList.add("puzzlePiece");
            piece.style.backgroundSize = `${gridSizeX*pieceSize}px, ${gridSizeY*pieceSize}px`
            piece.style.backgroundImage = `url('${img.src}')`;
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            piece.style.width = `${pieceSize}px`;
            piece.style.height = `${pieceSize}px`;

            // Устанавливаем правильные координаты
            piece.dataset.correctRow = row;
            piece.dataset.correctCol = col;

            // Случайное начальное расположение
            piece.style.position = "absolute";
            piece.style.left = `${Math.random() * 200}px`;
            piece.style.top = `${Math.random() * 500}px`;

            // Добавляем события для перетаскивания
            piece.draggable = true;
            piece.addEventListener("dragstart", dragStart);
            piece.addEventListener("dragend", dragEnd);

            piecesContainer.appendChild(piece);
            pieces.push(piece);
        }
    }
}

// Drag-and-Drop
let draggedPiece = null;

function dragStart(e) {
    draggedPiece = e.target;
}

function dragEnd(e) {
    const rect = puzzleContainer.getBoundingClientRect();
    const x = e.clientX - rect.left; // Координаты мыши относительно поля
    const y = e.clientY - rect.top;
    console.log(rect);

    // Расчёт ближайшей клетки
    const col = Math.floor(x / pieceSize);
    const row = Math.floor(y / pieceSize);

    cell = puzzleContainer.firstChild;
    cellRect = cell.getBoundingClientRect();
    cell_width = cellRect.width;
    cell_height = cellRect.height;
    console.log(cell.getBoundingClientRect())

    // Проверка попадания внутрь сетки
    if (row >= 0 && row < gridSizeY && col >= 0 && col < gridSizeX) {
        // Устанавливаем координаты в сетке
        draggedPiece.style.left = `${col * pieceSize + rect.left + borderSize*col*2}px`;
        draggedPiece.style.top = `${row * pieceSize + rect.top + borderSize*row*2}px`;

        // Проверка правильности позиции
        if (
            parseInt(draggedPiece.dataset.correctRow) === row &&
            parseInt(draggedPiece.dataset.correctCol) === col
        ) {
            draggedPiece.draggable = false;
            draggedPiece.style.zIndex = 0;
        }
    } else {
        // Возвращаем кусок на место, если он вне поля
        draggedPiece.style.left = `${Math.random() * 200}px`;
        draggedPiece.style.top = `${Math.random() * 500}px`;
    }
}

// Кнопка "Начать игру"
shuffleBtn.addEventListener("click", () => {
    piecesContainer.innerHTML = "";
    puzzleContainer.innerHTML = "";
    createGrid();
    pieces = [];
});
