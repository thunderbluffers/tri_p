const POLYGON_DRAWING  = 0;
const POLYGON_DRAWN    = 1;
const POLYGON_FINISHED = 2;

var Polygon = function() {
    this.points = [];
    this.state = POLYGON_DRAWING;
    this.ctx = canvas.getContext('2d');
}

Polygon.prototype.add = function(p) {
    this.points.push(p);
};

Polygon.prototype.finishedDrawing = function() {
    this.state = POLYGON_DRAWN;
    this.draw();
}

Polygon.prototype.draw = function () {
    // Clear
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Points
    this.points.forEach(function(p) {
        p.draw();
    });

    // Draw lines between points
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'black';

    var firstPoint = this.points[0];
    this.ctx.moveTo(firstPoint.x, firstPoint.y);
    for (var i = 1; i < this.points.length; i++) {
        this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    if (this.state >= POLYGON_DRAWN) {
        this.ctx.lineTo(firstPoint.x, firstPoint.y);
    }
    this.ctx.stroke();
    
    if (this.state == POLYGON_DRAWING && this.points.length >= 3) {
        var lastPoint = this.points[this.points.length - 1];
        this.ctx.setLineDash([5]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'blue';
        this.ctx.moveTo(firstPoint.x, firstPoint.y);
        this.ctx.lineTo(lastPoint.x, lastPoint.y);
        this.ctx.stroke();
        this.ctx.setLineDash([0]);
    }

};

Polygon.prototype.drawWithMouse = function(mouse) {
    if (this.points.length == 0 || this.state != POLYGON_DRAWING) {
        return;
    }

    this.draw();
console.log("Drawing from draWithMouse"); //debug
    var lastPoint = this.points[this.points.length - 1];
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'red';
    this.ctx.moveTo(lastPoint.x, lastPoint.y);
    this.ctx.lineTo(mouse.x, mouse.y);
    this.ctx.stroke();

    mouse.draw();
};

var Point = function(x, y) {
    this.x = x;
    this.y = y;
    this.ctx = canvas.getContext('2d');
};

Point.prototype.draw = function() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
}