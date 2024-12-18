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

let image_src = null;

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
        image_src = URL.createObjectURL(file);
    }
});

function resizeImage(img, targetWidth, targetHeight, callback) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Устанавливаем новые размеры на основе требуемых
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Сжимаем изображение, сохраняя пропорции
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // После сжатия вызываем коллбек, передав сжатое изображение
    img.src = canvas.toDataURL("image/jpeg");
    img.onload = callback;  // Продолжаем с подготовкой пазла после загрузки нового изображения
}

function preparePuzzle(img) {
    piecesContainer.innerHTML = "";
    pieces = [];
    const pieceWidth = img.width / gridSizeX;
    const pieceHeight = img.height / gridSizeY;

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
            piece.style.left = `${Math.random() * 500}px`;
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
    if (draggedPiece.draggable == false) {
        return;
    }
    const rect = puzzleContainer.getBoundingClientRect();
    const piecesRect = piecesContainer.getBoundingClientRect();
    const x = e.clientX - rect.left; // Координаты мыши относительно поля
    const y = e.clientY - rect.top;

    // Расчёт ближайшей клетки
    const col = Math.floor(x / pieceSize);
    const row = Math.floor(y / pieceSize);

    cell = puzzleContainer.firstChild;
    cellRect = cell.getBoundingClientRect();
    cell_border_Y = cellRect.width-pieceSize;
    cell_border_X = cellRect.height-pieceSize;

    // Проверка попадания внутрь сетки
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

            // Меняем данные о правильных позициях
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
        
        // Проверка правильности позиции
        if (
            parseInt(draggedPiece.dataset.correctRow) === row &&
            parseInt(draggedPiece.dataset.correctCol) === col
        ) {
            draggedPiece.draggable = false;
            draggedPiece.style.cursor = 'not-allowed';
        }
        
        checkVictory();
    } else {
        // Возвращаем кусок на место, если он вне поля
        draggedPiece.style.left = `${Math.random() * 200}px`;
        draggedPiece.style.top = `${Math.random() * 500}px`;
    }
}

// Проверка на победу
function checkVictory() {
    console.log(pieces);
    const allPiecesCorrect = pieces.every(piece => {
        // Проверяем, находятся ли все кусочки в правильных позициях, используя данные о правильных строках и столбцах
        return parseInt(piece.dataset.correctRow) === parseInt(piece.dataset.row) &&
               parseInt(piece.dataset.correctCol) === parseInt(piece.dataset.col);
    });

    if (allPiecesCorrect) {
        alert("Поздравляем, вы выиграли!");
    }
}

createGrid();
// Кнопка "Начать игру"
shuffleBtn.addEventListener("click", () => {
    piecesContainer.innerHTML = "";
    puzzleContainer.innerHTML = "";
    createGrid();
    if (image_src !== null) {
        let image = new Image();
        image.src = image_src;
        image.onload = () => {
            resizeImage(image, gridSizeX * pieceSize, gridSizeY * pieceSize, () => {
                preparePuzzle(image);
            });
        };
    }
    pieces = [];
});
