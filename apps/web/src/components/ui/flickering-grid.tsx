"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { cn } from "@/lib/utils";

const EIGHT_DIRECTIONS = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 0],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
] as const;

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
    squareSize?: number;
    gridGap?: number;
    flickerChance?: number;
    color?: string;
    width?: number;
    height?: number;
    className?: string;
    maxOpacity?: number;
    minOpacity?: number;
    backgroundMaxOpacity?: number;
    backgroundMinOpacity?: number;
    backgroundFlickerChance?: number;
    text?: string;
    textPadding?: number;
}

type GridParams = {
    cols: number;
    rows: number;
    squares: Float32Array;
    dpr: number;
    mask?: Uint8Array;
};

const dilateMask = (
    mask: Uint8Array,
    cols: number,
    rows: number,
    iterations: number,
) => {
    if (iterations <= 0) {
        return mask;
    }

    let current = Uint8Array.from(mask);

    for (let step = 0; step < iterations; step++) {
        const next = Uint8Array.from(current);

        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                const idx = col * rows + row;
                if (current[idx] !== 1) continue;

                for (const [dx, dy] of EIGHT_DIRECTIONS) {
                    const nCol = col + dx;
                    const nRow = row + dy;
                    if (nCol < 0 || nCol >= cols || nRow < 0 || nRow >= rows) {
                        continue;
                    }
                    next[nCol * rows + nRow] = 1;
                }
            }
        }

        current = next;
    }

    return current;
};

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
    squareSize = 4,
    gridGap = 6,
    flickerChance = 0.3,
    color = "rgb(0, 0, 0)",
    width,
    height,
    className,
    maxOpacity = 0.95,
    minOpacity = 0.8,
    backgroundMaxOpacity = 0.4,
    backgroundMinOpacity = 0.16,
    backgroundFlickerChance = 0.12,
    text = "Helpdesk",
    textPadding = 2,
    ...props
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const memoizedColor = useMemo(() => {
        const toRGBA = (color: string) => {
            if (typeof window === "undefined") {
                return `rgba(0, 0, 0,`;
            }
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const ctx = canvas.getContext("2d");
            if (!ctx) return "rgba(255, 0, 0,";
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
            return `rgba(${r}, ${g}, ${b},`;
        };
        return toRGBA(color);
    }, [color]);

    const highlightMinOpacity = useMemo(
        () => Math.max(0, Math.min(minOpacity, maxOpacity)),
        [minOpacity, maxOpacity],
    );
    const highlightOpacityRange = useMemo(
        () => Math.max(maxOpacity - highlightMinOpacity, 0),
        [highlightMinOpacity, maxOpacity],
    );

    const backgroundBaseOpacity = useMemo(
        () => Math.max(0, Math.min(backgroundMinOpacity, backgroundMaxOpacity)),
        [backgroundMinOpacity, backgroundMaxOpacity],
    );
    const backgroundOpacityRange = useMemo(
        () => Math.max(backgroundMaxOpacity - backgroundBaseOpacity, 0),
        [backgroundBaseOpacity, backgroundMaxOpacity],
    );

    const textPaddingSteps = useMemo(
        () => Math.max(0, Math.floor(textPadding)),
        [textPadding],
    );

    const setupCanvas = useCallback(
        (
            canvas: HTMLCanvasElement,
            targetWidth: number,
            targetHeight: number,
        ): GridParams => {
            const dpr = window.devicePixelRatio || 1;
            const pixelWidth = Math.max(Math.floor(targetWidth * dpr), 1);
            const pixelHeight = Math.max(Math.floor(targetHeight * dpr), 1);

            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
            canvas.style.width = `${targetWidth}px`;
            canvas.style.height = `${targetHeight}px`;

            const cols = Math.floor(targetWidth / (squareSize + gridGap));
            const rows = Math.floor(targetHeight / (squareSize + gridGap));

            const createTextMask = (): Uint8Array | undefined => {
                if (!text?.trim() || cols === 0 || rows === 0) {
                    return undefined;
                }

                const offscreen = document.createElement("canvas");
                offscreen.width = pixelWidth;
                offscreen.height = pixelHeight;
                const offscreenCtx = offscreen.getContext("2d");

                if (!offscreenCtx) {
                    return undefined;
                }

                offscreenCtx.clearRect(0, 0, pixelWidth, pixelHeight);

                let fontSize = pixelHeight * 0.75;
                if (!Number.isFinite(fontSize) || fontSize <= 0) {
                    return undefined;
                }

                const fontFamily = '"Space Grotesk", "Inter", "Arial", sans-serif';
                offscreenCtx.font = `700 ${fontSize}px ${fontFamily}`;
                offscreenCtx.textAlign = "center";
                offscreenCtx.textBaseline = "middle";

                const maxTextWidth = pixelWidth * 0.9;
                const metrics = offscreenCtx.measureText(text);

                if (metrics.width > maxTextWidth) {
                    fontSize = Math.max(
                        (fontSize * maxTextWidth) / metrics.width,
                        pixelHeight * 0.2,
                    );
                    offscreenCtx.font = `700 ${fontSize}px ${fontFamily}`;
                }

                offscreenCtx.fillStyle = "#ffffff";
                offscreenCtx.fillText(text, pixelWidth / 2, pixelHeight / 2);

                const imageData = offscreenCtx.getImageData(
                    0,
                    0,
                    pixelWidth,
                    pixelHeight,
                );
                const data = imageData.data;
                const mask = new Uint8Array(cols * rows);
                const cellPixelWidth = Math.max(Math.floor(squareSize * dpr), 1);
                const cellPixelHeight = Math.max(Math.floor(squareSize * dpr), 1);
                let activeCount = 0;

                for (let col = 0; col < cols; col++) {
                    for (let row = 0; row < rows; row++) {
                        const index = col * rows + row;
                        const startX = Math.floor(col * (squareSize + gridGap) * dpr);
                        const startY = Math.floor(row * (squareSize + gridGap) * dpr);
                        let hasAlpha = false;

                        for (let dx = 0; dx < cellPixelWidth && !hasAlpha; dx += 1) {
                            for (let dy = 0; dy < cellPixelHeight; dy += 1) {
                                const px = startX + dx;
                                const py = startY + dy;

                                if (px >= pixelWidth || py >= pixelHeight) {
                                    continue;
                                }

                                const alphaIndex = (py * pixelWidth + px) * 4 + 3;
                                if ((data[alphaIndex] ?? 0) > 10) {
                                    hasAlpha = true;
                                    break;
                                }
                            }
                        }

                        if (hasAlpha) {
                            mask[index] = 1;
                            activeCount += 1;
                        }
                    }
                }

                return activeCount > 0 ? mask : undefined;
            };

            const baseMask = createTextMask();
            const mask =
                baseMask && textPaddingSteps > 0
                    ? dilateMask(baseMask, cols, rows, textPaddingSteps)
                    : baseMask;
            const squares = new Float32Array(cols * rows);

            for (let i = 0; i < squares.length; i++) {
                const isTextCell = mask ? mask[i] === 1 : true;
                if (isTextCell) {
                    squares[i] =
                        highlightOpacityRange > 0
                            ? highlightMinOpacity + Math.random() * highlightOpacityRange
                            : highlightMinOpacity;
                } else {
                    squares[i] =
                        backgroundOpacityRange > 0
                            ? backgroundBaseOpacity + Math.random() * backgroundOpacityRange
                            : backgroundBaseOpacity;
                }
            }

            return { cols, rows, squares, dpr, mask };
        },
        [
            backgroundBaseOpacity,
            backgroundOpacityRange,
            gridGap,
            highlightMinOpacity,
            highlightOpacityRange,
            squareSize,
            text,
            textPaddingSteps,
        ],
    );

    const updateSquares = useCallback(
        (
            squares: Float32Array,
            mask: Uint8Array | undefined,
            deltaTime: number,
        ) => {
            for (let i = 0; i < squares.length; i++) {
                const isTextCell = mask ? mask[i] === 1 : true;
                const activeFlickerChance = isTextCell
                    ? flickerChance
                    : backgroundFlickerChance;

                if (
                    activeFlickerChance <= 0 ||
                    Math.random() >= activeFlickerChance * deltaTime
                ) {
                    continue;
                }

                if (isTextCell) {
                    squares[i] =
                        highlightOpacityRange > 0
                            ? highlightMinOpacity + Math.random() * highlightOpacityRange
                            : highlightMinOpacity;
                } else {
                    squares[i] =
                        backgroundOpacityRange > 0
                            ? backgroundBaseOpacity + Math.random() * backgroundOpacityRange
                            : backgroundBaseOpacity;
                }
            }
        },
        [
            backgroundBaseOpacity,
            backgroundFlickerChance,
            backgroundOpacityRange,
            flickerChance,
            highlightMinOpacity,
            highlightOpacityRange,
            highlightMinOpacity,
            highlightOpacityRange,
        ],
    );

    const drawGrid = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            width: number,
            height: number,
            cols: number,
            rows: number,
            squares: Float32Array,
            dpr: number,
        ) => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "transparent";
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const index = i * rows + j;
                    const opacity = squares[index];
                    if ((opacity ?? 0) <= 0) continue;

                    ctx.fillStyle = `${memoizedColor}${opacity})`;
                    ctx.fillRect(
                        i * (squareSize + gridGap) * dpr,
                        j * (squareSize + gridGap) * dpr,
                        squareSize * dpr,
                        squareSize * dpr,
                    );
                }
            }
        },
        [memoizedColor, squareSize, gridGap],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let gridParams: GridParams | undefined;

        const updateCanvasSize = () => {
            const newWidth = width || container.clientWidth;
            const newHeight = height || container.clientHeight;
            setCanvasSize({ width: newWidth, height: newHeight });
            gridParams = setupCanvas(canvas, newWidth, newHeight);
        };

        updateCanvasSize();

        let lastTime = 0;
        const animate = (time: number) => {
            if (!isInView) return;

            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            if (!gridParams) return;

            updateSquares(gridParams.squares, gridParams.mask, deltaTime);
            drawGrid(
                ctx,
                canvas.width,
                canvas.height,
                gridParams.cols,
                gridParams.rows,
                gridParams.squares,
                gridParams.dpr,
            );
            animationFrameId = requestAnimationFrame(animate);
        };

        const resizeObserver = new ResizeObserver(() => {
            updateCanvasSize();
        });

        resizeObserver.observe(container);

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry?.isIntersecting ?? false);
            },
            { threshold: 0 },
        );

        intersectionObserver.observe(canvas);

        if (isInView) {
            animationFrameId = requestAnimationFrame(animate);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

    return (
        <div
            ref={containerRef}
            className={cn("h-full w-full", className)}
            {...props}
        >
            <canvas
                ref={canvasRef}
                className="pointer-events-none"
                style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                }}
            />
        </div>
    );
};
