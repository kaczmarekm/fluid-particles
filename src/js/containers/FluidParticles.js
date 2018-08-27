import React, { Component } from 'react';

import '../../styles/style.css';

export class FluidParticles extends Component {

    componentDidMount() {
        (function (window) {
            let canvas, ctx;
            let mouse = {
                mouseXPosition: 0,
                mouseYPosition: 0,
                mousePreviousXPosition: 0,
                mousePreviousYPosition: 0,
                clicked: false
            };

            let canvasWidth = window.innerWidth;
            let canvasHeight = window.innerHeight - 5;
            let canvasHorizontalMargin = 0;
            let canvasVerticalMargin = 0;

            while (canvasWidth % 10 !== 0) {
                canvasWidth--;
                canvasHorizontalMargin++;
            }

            while (canvasHeight % 10 !== 0) {
                canvasHeight--;
                canvasVerticalMargin++;
            }

            const gridCellSize = 10;
            const penSize = 50;
            const columnNumber = canvasWidth / gridCellSize;
            const rowNumber = canvasHeight / gridCellSize;
            const particlesNumber = 5000;

            const velocityFactor = 0.03;
            const travelLimitFactor = 0.5;
            const speedUpFactor = 0.05;

            let gridCellArray = [];
            let particlesArray = [];

            function init() {
                canvas = document.getElementById("canvas");
                ctx = canvas.getContext("2d");

                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                for (let i = 0; i < particlesNumber; i++) {
                    particlesArray.push(new Particle(Math.random() * canvasWidth, Math.random() * canvasHeight));
                }

                for (let columnCounter = 0; columnCounter < columnNumber; columnCounter++) {
                    gridCellArray[columnCounter] = [];
                    for (let rowCounter = 0; rowCounter < rowNumber; rowCounter++) {
                        gridCellArray[columnCounter][rowCounter] = new Cell(columnCounter * gridCellSize, rowCounter * gridCellSize, gridCellSize);
                        gridCellArray[columnCounter][rowCounter].col = columnCounter;
                        gridCellArray[columnCounter][rowCounter].row = columnCounter;
                    }
                }

                for (let columnCounter = 0; columnCounter < columnNumber; columnCounter++) {
                    for (let rowCounter = 0; rowCounter < rowNumber; rowCounter++) {

                        let cellData = gridCellArray[columnCounter][rowCounter];

                        let rowAboveSelectedCell = (rowCounter - 1 >= 0) ? rowCounter - 1 : rowNumber - 1;
                        let columnOnTheLeftOfSelectedCell = (columnCounter - 1 >= 0) ? columnCounter - 1 : columnNumber - 1;
                        let columnToTheRightOfSelectedCell = (columnCounter + 1 < columnNumber) ? columnCounter + 1 : 0;

                        let cellAbove = gridCellArray[columnCounter][rowAboveSelectedCell];
                        let cellLeft = gridCellArray[columnOnTheLeftOfSelectedCell][rowCounter];
                        let cellUpperLeft = gridCellArray[columnOnTheLeftOfSelectedCell][rowAboveSelectedCell];
                        let cellUpperRight = gridCellArray[columnToTheRightOfSelectedCell][rowAboveSelectedCell];

                        cellData.above = cellAbove;
                        cellData.left = cellLeft;
                        cellData.upperLeft = cellUpperLeft;
                        cellData.upperRight = cellUpperRight;

                        cellAbove.below = gridCellArray[columnCounter][rowCounter];
                        cellLeft.right = gridCellArray[columnCounter][rowCounter];
                        cellUpperLeft.lowerRight = gridCellArray[columnCounter][rowCounter];
                        cellUpperRight.lowerLeft = gridCellArray[columnCounter][rowCounter];
                    }
                }

                window.addEventListener("mousedown", mouseBtnDownEventHandler);
                window.addEventListener("touchstart", mouseBtnDownEventHandler);
                window.addEventListener("mouseup", mouseBtnUpEventHandler);
                window.addEventListener("touchend", touchUpEventHandler);
                canvas.addEventListener("mousemove", mouseMovedEventHandler);
                canvas.addEventListener("touchmove", touchMovedEventHandler);
                window.onload = draw;
            }

            function updateParticle() {
                for (let i = 0; i < particlesArray.length; i++) {
                    let particle = particlesArray[i];
                    if (particle.x >= 0 && particle.x < canvasWidth && particle.y >= 0 && particle.y < canvasHeight) {
                        let col = parseInt(particle.x / gridCellSize);
                        let row = parseInt(particle.y / gridCellSize);
                        let cellData = gridCellArray[col][row];

                        let ax = (particle.x % gridCellSize) / gridCellSize;
                        let ay = (particle.y % gridCellSize) / gridCellSize;

                        particle.xv += (1 - ax) * cellData.xv * velocityFactor;
                        particle.yv += (1 - ay) * cellData.yv * velocityFactor;
                        particle.xv += ax * cellData.right.xv * velocityFactor;
                        particle.yv += ax * cellData.right.yv * velocityFactor;
                        particle.xv += ay * cellData.below.xv * velocityFactor;
                        particle.yv += ay * cellData.below.yv * velocityFactor;

                        particle.x += particle.xv;
                        particle.y += particle.yv;

                        let dx = particle.px - particle.x;
                        let dy = particle.py - particle.y;

                        let travelDistance = Math.sqrt(dx * dx + dy * dy);

                        let travelLimit = Math.random() * travelLimitFactor;
                        if (travelDistance > travelLimit) {
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(particle.px, particle.py);
                            ctx.stroke();
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(particle.x + travelLimit, particle.y + travelLimit);
                            ctx.stroke();
                        }

                        particle.px = particle.x;
                        particle.py = particle.y;
                    } else {
                        particle.x = particle.px = Math.random() * canvasWidth;
                        particle.y = particle.py = Math.random() * canvasHeight;

                        particle.xv = 0;
                        particle.yv = 0;
                    }

                    particle.xv *= speedUpFactor;
                    particle.yv *= speedUpFactor;
                }
            }

            function draw() {
                let mouse_xv = mouse.mouseXPosition - mouse.mousePreviousXPosition;
                let mouse_yv = mouse.mouseYPosition - mouse.mousePreviousYPosition;

                for (let i = 0; i < gridCellArray.length; i++) {
                    let rowsData = gridCellArray[i];
                    for (let j = 0; j < rowsData.length; j++) {
                        let cellData = rowsData[j];
                        if (mouse.clicked) {
                            changeCellVelocity(cellData, mouse_xv, mouse_yv, penSize);
                        }
                        updatePressure(cellData);
                    }
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = "#66cdaa";
                updateParticle();

                for (let i = 0; i < gridCellArray.length; i++) {
                    let rowsData = gridCellArray[i];
                    for (let j = 0; j < rowsData.length; j++) {
                        let cellData = rowsData[j];
                        updateVelocity(cellData);
                    }
                }

                mouse.mousePreviousXPosition = mouse.mouseXPosition;
                mouse.mousePreviousYPosition = mouse.mouseYPosition;

                requestAnimationFrame(draw);
            }

            function changeCellVelocity(cellData, mouseVelocityX, mouseVelocityY, penSize) {
                let dx = cellData.x - mouse.mouseXPosition;
                let dy = cellData.y - mouse.mouseYPosition;

                let distanceTravelled = Math.sqrt(dy * dy + dx * dx);

                if (distanceTravelled < penSize) {
                    if (distanceTravelled < 4) {
                        distanceTravelled = penSize;
                    }

                    let power = penSize / distanceTravelled;

                    cellData.xv += mouseVelocityX * power;
                    cellData.yv += mouseVelocityY * power;
                }
            }

            function updatePressure(cellData) {
                let pressureX = (
                    cellData.upperLeft.xv * 0.3 +
                    cellData.left.xv +
                    cellData.lowerLeft.xv * 0.3 -
                    cellData.upperRight.xv * 0.3 -
                    cellData.right.xv -
                    cellData.lowerRight.xv * 0.3
                );

                let pressureY = (
                    cellData.upperLeft.yv * 0.3 +
                    cellData.above.yv +
                    cellData.upperRight.yv * 0.3 +
                    cellData.lowerLeft.yv * 0.3 -
                    cellData.above.yv -
                    cellData.lowerRight.yv * 0.3
                );

                cellData.pressure = (pressureX + pressureY) * 0.2;
            }

            function updateVelocity(cellData) {
                cellData.xv += (
                    cellData.upperLeft.pressure * 0.3 +
                    cellData.left.pressure +
                    cellData.lowerLeft.pressure * 0.3 -
                    cellData.upperRight.pressure * 0.3 -
                    cellData.right.pressure -
                    cellData.lowerRight.pressure * 0.3
                ) * 0.25;

                cellData.yv += (
                    cellData.upperLeft.pressure * 0.3 +
                    cellData.above.pressure +
                    cellData.upperRight.pressure * 0.3 -
                    cellData.lowerLeft.pressure * 0.3 -
                    cellData.above.pressure -
                    cellData.lowerRight.pressure * 0.3
                ) * 0.25;

                cellData.xv *= 0.975;
                cellData.yv *= 0.975;
            }

            function Cell(x, y, res) {
                this.x = x;
                this.y = y;
                this.r = res;
                this.col = 0;
                this.row = 0;
                this.xv = 0;
                this.yv = 0;
                this.pressure = 0;
            }

            function Particle(x, y) {
                this.x = this.px = x;
                this.y = this.py = y;
                this.xv = this.yv = 0;
            }

            function mouseBtnDownEventHandler(e) {
                e.preventDefault();
                mouse.clicked = true;
            }

            function mouseBtnUpEventHandler() {
                mouse.clicked = false;
            }

            function touchUpEventHandler(e) {
                if (!e.touches) mouse.clicked = false;
            }

            function mouseMovedEventHandler(e) {
                mouse.mousePreviousXPosition = mouse.mouseXPosition;
                mouse.mousePreviousYPosition = mouse.mouseYPosition;

                mouse.mouseXPosition = e.offsetX || e.layerX;
                mouse.mouseYPosition = e.offsetY || e.layerY;
            }

            function touchMovedEventHandler(e) {
                e.preventDefault();

                mouse.mousePreviousXPosition = mouse.mouseXPosition;
                mouse.mousePreviousYPosition = mouse.mouseYPosition;

                let rect = canvas.getBoundingClientRect();

                mouse.mouseXPosition = e.touches[0].pageX - rect.left;
                mouse.mouseYPosition = e.touches[0].pageY - rect.top;
            }

            window.Fluid = {
                initialize: init
            }

        }(window));

        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

        window.Fluid.initialize();
    }

    render() {
        return (
            <canvas id='canvas' />
        );
    }

}