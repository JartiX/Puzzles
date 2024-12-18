const imageInput = document.querySelector(".imageInput");
const piecesContainer = document.querySelector(".piecesContainer");
const puzzleContainer = document.querySelector(".puzzleContainer");
const shuffleBtn = document.querySelector(".shuffleBtn");
const resizeBtn = document.querySelector(".resizeBtn");
const resetBtn = document.querySelector(".resetBtn");

let gridSizeY = 6; // Высота поля
let gridSizeX = 9; // Длина поля
const pieceSize = 70; // Размер клетки пазла
let pieces = [];

puzzleContainer.style.gridTemplateColumns = `repeat(${gridSizeX}, 1fr)`;
puzzleContainer.style.gridTemplateRows = `repeat(${gridSizeY}, 1fr);`;

let image_src = null;
const default_src = '/images/mountains.jpg'
    
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

imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        image_src = URL.createObjectURL(file);
    }
});

function resizeImage(img, targetWidth, targetHeight, callback) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Сжимаем изображение, сохраняя пропорции
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    img.src = canvas.toDataURL("image/jpeg");
    img.onload = callback;
}

function preparePuzzle(img) {
    piecesContainer.innerHTML = "";
    pieces = [];
    const pieceWidth = img.width / gridSizeX;
    const pieceHeight = img.height / gridSizeY;

    
    puzzleContainer.style.gridTemplateColumns = `repeat(${gridSizeX}, 1fr)`;
    puzzleContainer.style.gridTemplateRows = `repeat(${gridSizeY}, 1fr);`;

    pzRect = puzzleContainer.getBoundingClientRect();

    piecesContainer.style.width = `${pzRect.width-pieceSize}px`;
    piecesContainer.style.height = `${pzRect.height}px`;

    for (let row = 0; row < gridSizeY; row++) {
        for (let col = 0; col < gridSizeX; col++) {
            const piece = document.createElement("div");
            piece.classList.add("puzzlePiece");
            piece.style.backgroundImage = `url('${img.src}')`;
            piece.style.backgroundSize = `${img.width}px, ${img.height}px`
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;

            // Устанавливаем правильные координаты
            piece.dataset.correctRow = row;
            piece.dataset.correctCol = col;

            // Случайное начальное расположение
            piece.style.position = "absolute";
            piece.style.left = `${Math.random() * pieceSize*(gridSizeX-2)}px`;
            piece.style.top = `${Math.random() * pieceSize*(gridSizeY-1)}px`;

            // Добавляем события для перетаскивания
            piece.draggable = true;
            piece.addEventListener("dragstart", dragStart);
            piece.addEventListener("dragend", dragEnd);

            piecesContainer.appendChild(piece);
            pieces.push(piece);
        }
    }
}

let draggedPiece = null;

function dragStart(e) {
    draggedPiece = e.target;
}

function dragEnd(e) {
    if (draggedPiece.draggable == false) {
        return;
    }
    const rect = puzzleContainer.getBoundingClientRect();
    const piecesRect = piecesContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Расчёт ближайшей клетки
    const col = Math.floor(x / pieceSize);
    const row = Math.floor(y / pieceSize);

    var cell = puzzleContainer.firstChild;
    var cellRect = cell.getBoundingClientRect();
    var cell_border_Y = cellRect.width-pieceSize;
    var cell_border_X = cellRect.height-pieceSize;

    // Проверка попадания внутрь сетки пазла
    if (row >= 0 && row < gridSizeY && col >= 0 && col < gridSizeX) {
        const targetCell = puzzleContainer.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        const targetPiece = Array.from(piecesContainer.children).find(piece => {
            const pieceRect = piece.getBoundingClientRect();
            const targetCellRect = targetCell.getBoundingClientRect();
            return Math.abs(pieceRect.left - targetCellRect.left) < pieceSize && 
                   Math.abs(pieceRect.top - targetCellRect.top) < pieceSize;
        });

        if (targetPiece) {
            if (!targetPiece.draggable) {
                return;
            }
            const targetPiecePos = { left: targetPiece.style.left, top: targetPiece.style.top };
            targetPiece.style.left = draggedPiece.style.left;
            targetPiece.style.top = draggedPiece.style.top;

            draggedPiece.style.left = targetPiecePos.left;
            draggedPiece.style.top = targetPiecePos.top;

            // Меняем данные о позициях
            const tempRow = draggedPiece.dataset.row;
            const tempCol = draggedPiece.dataset.col;

            draggedPiece.dataset.row = targetPiece.dataset.row;
            draggedPiece.dataset.col = targetPiece.dataset.col;

            targetPiece.dataset.row = tempRow;
            targetPiece.dataset.col = tempCol;

            if (
                targetPiece.dataset.correctRow === tempRow &&
                targetPiece.dataset.correctCol === tempCol
            ) {
                draggedPiece.classList.add('rightPlace');
                    setTimeout(() => {
                        draggedPiece.classList.remove('rightPlace');
                }, 1000);
                targetPiece.draggable = false;
                targetPiece.style.cursor = 'not-allowed';
            }
        }
        else {
            draggedPiece.style.left = `${col * pieceSize + rect.left - piecesRect.left + cell_border_Y * (col+1)}px`;
            draggedPiece.style.top = `${row * pieceSize + rect.top - piecesRect.top + cell_border_X * (row + 1)}px`;
            
            draggedPiece.dataset.col = col;
            draggedPiece.dataset.row = row;
        }
        
        if (
            parseInt(draggedPiece.dataset.correctRow) === row &&
            parseInt(draggedPiece.dataset.correctCol) === col
        ) {
            draggedPiece.classList.add('rightPlace');
            setTimeout(() => {
                draggedPiece.classList.remove('rightPlace');
            }, 1000);
            draggedPiece.draggable = false;
            draggedPiece.style.cursor = 'not-allowed';
        }
        
        checkVictory();
    } else if (
        e.clientX >= piecesRect.left &&
        e.clientX <= piecesRect.right &&
        e.clientY >= piecesRect.top &&
        e.clientY <= piecesRect.bottom
    ) {
        // Если кусок внутри контейнера piecesContainer, устанавливаем позицию куска в месте, где его отпустили
        const offsetX = e.clientX - piecesRect.left;
        const offsetY = e.clientY - piecesRect.top;
        draggedPiece.style.left = `${offsetX - pieceSize / 2}px`;
        draggedPiece.style.top = `${offsetY - pieceSize / 2}px`;
    } else {
        // Если кусок за пределами контейнеров, ставим его случайно
        draggedPiece.style.left = `${Math.random() * (gridSizeX - 2) * pieceSize}px`;
        draggedPiece.style.top = `${Math.random() * (gridSizeY - 1) * pieceSize}px`;
    }
}

// Проверка на победу
function checkVictory() {
    const allPiecesCorrect = pieces.every(piece => {
        // Проверяем, находятся ли все кусочки в правильных позициях
        return parseInt(piece.dataset.correctRow) === parseInt(piece.dataset.row) &&
               parseInt(piece.dataset.correctCol) === parseInt(piece.dataset.col);
    });

    if (allPiecesCorrect) {
        setTimeout(() => {
            alert("Поздравляем, вы выиграли!");
        }, 500);
    }
}

createGrid();

let pzRect = puzzleContainer.getBoundingClientRect();
piecesContainer.style.width = `${pzRect.width-pieceSize}px`;
piecesContainer.style.height = `${pzRect.height}px`;

resetBtn.addEventListener("click", () => {
    image_src = default_src;
    imageInput.value = "";
});

// Кнопка "Начать игру"
shuffleBtn.addEventListener("click", () => {
    piecesContainer.innerHTML = "";
    puzzleContainer.innerHTML = "";
    createGrid();
    image_src = image_src === null ? default_src : image_src; 
    let image = new Image();
    image.src = image_src;
    image.onload = () => {
        resizeImage(image, gridSizeX * pieceSize, gridSizeY * pieceSize, () => {
            preparePuzzle(image);
        });
    };
    pieces = [];
});

resizeBtn.addEventListener("click", () => {
    const newSizeX = parseInt(document.querySelector(".gridSizeXInput").value);
    const newSizeY = parseInt(document.querySelector(".gridSizeYInput").value);

    if (newSizeX >= 2 && newSizeX <= 9 && newSizeY >= 2 && newSizeY <= 9) {
        gridSizeX = newSizeX;
        gridSizeY = newSizeY;
    } else {
        alert("Размер поля должен быть от 2x2 до 9x9.");
    }
});