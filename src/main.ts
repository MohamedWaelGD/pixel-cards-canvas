import "./style.css";

export interface Square {
    x: number;
    y: number;
    opacity: number;
    speed: number;
    color: Color;
    distanceFromCenter: number;
}

export interface Color {
    r: number;
    g: number;
    b: number;
}

export interface CardEffectOptions {
    cellSize: number;
    gapSize: number;
    gridCells: number;
    squareSize: number;
    minPointFadeSpeed: number;
    maxPointFadeSpeed: number;
    pointFadeSpeedFactor: number;
    cardSpeedFactor: number;
    fadeSpeedFactor: number;
    colors: Color[];
    icon?: string;
    mainTextColorHover?: string;
    mainBorderColorHover?: string;
}

export class CardEffect {
    public static readonly DEFAULT_OPTIONS: CardEffectOptions = {
        cellSize: 50,
        gapSize: 0,
        gridCells: 50,
        squareSize: 25,
        minPointFadeSpeed: 4,
        maxPointFadeSpeed: 6,
        pointFadeSpeedFactor: 0.01,
        cardSpeedFactor: 0.065,
        fadeSpeedFactor: 0.04,
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 255, g: 0, b: 0 },
        ],
    };

    private _ctx: CanvasRenderingContext2D;
    private _squares: Square[] = [];
    private _mouseInCard = false;
    private _opacityTouchFactor = 0;
    private _maxPointDistance = 0;
    private _fadeSpeed = 0;

    constructor(
        private _canvas: HTMLCanvasElement,
        private _options = CardEffect.DEFAULT_OPTIONS
    ) {
        if (this._options.maxPointFadeSpeed < this._options.minPointFadeSpeed) {
            throw new Error("Max speed must be greater than min speed");
        }

        if (this._options.pointFadeSpeedFactor <= 0) {
            throw new Error("Factor speed must be greater than 0");
        }

        this._ctx = _canvas.getContext("2d")!;
        _canvas.width =
            this._options.gridCells *
                (this._options.cellSize + this._options.gapSize) -
            this._options.gapSize;
        _canvas.height =
            this._options.gridCells *
                (this._options.cellSize + this._options.gapSize) -
            this._options.gapSize;
        this._squares = [];
        this._resetSquaresPoints();
        _canvas.addEventListener("mouseenter", () => this._onMouseEnter());
        _canvas.addEventListener("mouseleave", () => this._onMouseLeave());
    }

    public drawGrid() {
        this._resetCanvas();
        for (let i = 0; i < this._squares.length; i++) {
            this._drawSquare(this._squares[i]);
        }
    }

    public animateCardEffect() {
        this._resetCanvas();
        if (this._mouseInCard) {
            if (this._fadeSpeed < 1) {
                this._fadeSpeed += this._options.fadeSpeedFactor;
            } else {
                this._fadeSpeed = 1;
            }
            if (this._opacityTouchFactor < 1) {
                this._opacityTouchFactor += this._options.cardSpeedFactor;
            } else {
                this._opacityTouchFactor = 1;
            }
        } else {
            if (this._fadeSpeed > 0) {
                this._fadeSpeed -= this._options.fadeSpeedFactor;
            } else {
                this._fadeSpeed = 0;
            }
            if (this._opacityTouchFactor > 0) {
                this._opacityTouchFactor -= this._options.cardSpeedFactor;
            } else {
                this._opacityTouchFactor = 0;
            }
        }

        this._canvas.style.opacity = `${this._opacityTouchFactor}`;

        this._squares.forEach((square) => {
            if (
                square.distanceFromCenter / this._maxPointDistance >
                    this._fadeSpeed &&
                square.speed > 0
            ) {
                square.speed = -Math.abs(square.speed);
            }

            square.opacity += square.speed * this._options.pointFadeSpeedFactor;

            if (square.opacity > 1) {
                square.opacity = 1;
                square.speed = -square.speed;
            } else if (square.opacity < 0) {
                square.opacity = 0;
                square.speed = -square.speed;
            }
            this._drawSquare(square);
        });
    }

    private _resetCanvas() {
        this._ctx.clearRect(0, 0, this._canvas!.width, this._canvas!.height);
    }

    private _resetSquaresPoints() {
        this._maxPointDistance = 0;
        for (let row = 0; row < this._options.gridCells; row++) {
            for (let col = 0; col < this._options.gridCells; col++) {
                const x =
                    col * (this._options.cellSize + this._options.gapSize);
                const y =
                    row * (this._options.cellSize + this._options.gapSize);
                const squareX =
                    x + (this._options.cellSize - this._options.squareSize) / 2;
                const squareY =
                    y + (this._options.cellSize - this._options.squareSize) / 2;
                const distanceFromCenter = Math.sqrt(
                    Math.pow(squareX - this._canvas.width / 2, 2) +
                        Math.pow(squareY - this._canvas.height / 2, 2)
                );
                this._squares.push({
                    x: squareX,
                    y: squareY,
                    opacity: 0,
                    speed: this._randomSpeed(),
                    color: this._randomColor(),
                    distanceFromCenter,
                });
                if (this._maxPointDistance < distanceFromCenter) {
                    this._maxPointDistance = distanceFromCenter;
                }
            }
        }
    }

    private _drawSquare(square: Square) {
        this._ctx.fillStyle = `rgba(${square.color.r}, ${square.color.g}, ${square.color.b}, ${square.opacity})`; // Use RGBA to control opacity
        this._ctx.fillRect(
            square.x,
            square.y,
            this._options.squareSize,
            this._options.squareSize
        );
    }

    private _onMouseEnter() {
        this._mouseInCard = true;
    }

    private _onMouseLeave() {
        this._mouseInCard = false;
    }

    private _randomSpeed() {
        return (
            Math.random() *
                (this._options.maxPointFadeSpeed -
                    this._options.minPointFadeSpeed +
                    1) +
            this._options.minPointFadeSpeed
        );
    }

    private _randomColor() {
        const randomColor = Math.floor(
            Math.random() * this._options.colors.length
        );
        return this._options.colors[randomColor];
    }
}

const cardEffects: CardEffectOptions[] = [
    {
        ...CardEffect.DEFAULT_OPTIONS,
        minPointFadeSpeed: 2,
        maxPointFadeSpeed: 4,
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 155, g: 155, b: 155 },
        ],
        icon: '<i class="fa-solid fa-desktop"></i>',
        mainTextColorHover: "hover:text-white",
        mainBorderColorHover: "hover:border-white",
    },
    {
        ...CardEffect.DEFAULT_OPTIONS,
        minPointFadeSpeed: 2,
        maxPointFadeSpeed: 4,
        gridCells: 20,
        gapSize: 20,
        cellSize: 30,
        squareSize: 10,
        colors: [
            { r: 80, g: 150, b: 240 },
            { r: 155, g: 155, b: 155 },
            { r: 255, g: 255, b: 255 },
        ],
        icon: '<i class="fa-solid fa-puzzle-piece"></i>',
        mainTextColorHover: "hover:text-blue-300",
        mainBorderColorHover: "hover:border-blue-300",
    },
    {
        ...CardEffect.DEFAULT_OPTIONS,
        minPointFadeSpeed: 1,
        maxPointFadeSpeed: 3,
        colors: [
            { r: 255, g: 192, b: 33 },
            { r: 250, g: 220, b: 120 },
        ],
        icon: '<i class="fa-solid fa-trophy"></i>',
        mainTextColorHover: "hover:text-yellow-500",
        mainBorderColorHover: "hover:border-yellow-500",
    },
    {
        ...CardEffect.DEFAULT_OPTIONS,
        minPointFadeSpeed: 1,
        maxPointFadeSpeed: 3,
        colors: [
            { r: 255, g: 33, b: 33 },
            { r: 255, g: 120, b: 120 },
        ],
        icon: '<i class="fa-solid fa-gamepad"></i>',
        mainTextColorHover: "hover:text-red-500",
        mainBorderColorHover: "hover:border-red-500",
    },
];

const wrapper = document.querySelector(".wrapper")!;

if (wrapper) {
    cardEffects.forEach((cardEffect) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";

        // Add card content
        const html = `<div class="w-64 h-72 border border-gray-500 relative card text-gray-500 ${cardEffect.mainTextColorHover!} ${cardEffect.mainBorderColorHover!} transition duration-500">
        <canvas class="w-full h-full relative z-1"></canvas>
        <div class="absolute w-52 h-52 flex justify-center items-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-3 pointer-events-none radial-gradient opacity-0"></div>
        <div class="absolute w-52 h-52 flex justify-center items-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-5xl z-4 pointer-events-none">${
            cardEffect.icon
        }</div>
      </div>`;
        cardDiv.innerHTML = html;
        wrapper.appendChild(cardDiv);
        const canvas = cardDiv.querySelector("canvas") as HTMLCanvasElement;
        const cardEffectInstance = new CardEffect(canvas, cardEffect);
        cardEffectInstance.drawGrid();
        function animateFrames() {
            cardEffectInstance.animateCardEffect();
            requestAnimationFrame(animateFrames);
        }
        animateFrames();
    });
}

// const canvas = document.querySelector("canvas");
// if (canvas) {
//     const ctx = canvas.getContext("2d")!;
//     const cellSize = 10; // Size of each grid cell (square size)
//     const gapSize = 20; // Gap between cells
//     const gridCells = 42; // Number of cells in both directions (rows and columns)
//     const squareSize = 15; // Size of the square

//     // Calculate the canvas size based on grid and gap
//     canvas.width = gridCells * (cellSize + gapSize) - gapSize;
//     canvas.height = gridCells * (cellSize + gapSize) - gapSize;

//     const squares: { x: number; y: number }[] = [];

//     // Store all squares' positions for easy reference
//     for (let row = 0; row < gridCells; row++) {
//         for (let col = 0; col < gridCells; col++) {
//             const x = col * (cellSize + gapSize);
//             const y = row * (cellSize + gapSize);
//             const squareX = x + (cellSize - squareSize) / 2;
//             const squareY = y + (cellSize - squareSize) / 2;
//             squares.push({ x: squareX, y: squareY });
//         }
//     }

//     // Draw the grid initially
//     drawGrid();

//     function drawGrid() {
//         ctx.clearRect(0, 0, canvas!.width, canvas!.height); // Clear the canvas before drawing again
//         for (let i = 0; i < squares.length; i++) {
//             const { x, y } = squares[i];
//             drawSquare(x, y, squareSize);
//         }
//     }

//     function drawSquare(
//         x: number,
//         y: number,
//         size: number,
//         opacity: number = 1
//     ) {
//         ctx.fillStyle = `rgba(0, 200, 0, ${opacity})`; // Use RGBA to control opacity
//         ctx.fillRect(x, y, size, size); // Draw the square
//     }

//     function calculateOpacity(
//         mouseX: number,
//         mouseY: number,
//         squareX: number,
//         squareY: number
//     ) {
//         const distance = Math.sqrt(
//             (mouseX - squareX) ** 2 + (mouseY - squareY) ** 2
//         );
//         const maxDistance = 150; // Max distance for fading effect
//         const opacity = Math.max(0, 1 - distance / maxDistance); // Fade out the square based on distance
//         return opacity;
//     }

//     canvas.addEventListener("mousemove", (event) => {
//         const mouseX = event.offsetX;
//         const mouseY = event.offsetY;

//         // Re-draw the grid with fading squares
//         drawGrid();

//         // Adjust the opacity of squares based on mouse position
//         for (let i = 0; i < squares.length; i++) {
//             const { x, y } = squares[i];
//             const opacity = calculateOpacity(
//                 mouseX,
//                 mouseY,
//                 x + squareSize / 2,
//                 y + squareSize / 2
//             );
//             drawSquare(x, y, squareSize, opacity);
//         }
//     });
// }
