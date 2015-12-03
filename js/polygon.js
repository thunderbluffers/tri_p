const POLYGON_DRAWING   = 0;
const POLYGON_DRAWN     = 1;
const POLYGON_FINISHED  = 2;

const EPS               = 0.0000000001;
const COLOR_HIGHLIGHT   = 'rgb(220, 255, 200)';

var detPoints = function(a, b, c) {
    return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
}

var orientationTest = function(a, b, c) {
    var d = detPoints(a, b, c);

    return d > 0 ? 1 : d < 0 ? -1 : 0;
}

var triangleArea = function(a, b, c) {
    return Math.abs(detPoints(a, b, c)) / 2;
};

var randomBlueColorCode = function() {
    var randColParam = Math.floor((Math.random() * 70) + 80);
    return ("rgb(" + randColParam + ", " + randColParam + ", 255)");
}

var isPointInside = function(a, b, c, p) {
    var aTot = triangleArea(a, b, c);
    var a1   = triangleArea(p, b, c);
    var a2   = triangleArea(a, p, c);
    var a3   = triangleArea(a, b, p);

    return aTot == a1 + a2 + a3;
}

var Polygon = function() {
    this.points = [];
    this.specialPoints = [];
    this.state = POLYGON_DRAWING;
    this.ctx = canvas.getContext('2d');
    this.triangles = [];
    this.trianglesColors = [];
};

Polygon.prototype.add = function(p) {
    this.points.push(p);
};

Polygon.prototype.calculateArea = function() {
    var a = 0;
    for (var p = this.points.length - 1, q = 0; q < this.points.length; p = q++) {
        a += this.points[p].x * this.points[q].y - this.points[q].x * this.points[p].y;
    }
    return a / 2;
}

Polygon.prototype.isEar = function(a, b, c) {
    if (orientationTest(a, b, c) < 0) {
        return false;
    }

    for (var x of this.points) {
        if (a.eq(x) || b.eq(x) || c.eq(x)) continue;
        if (isPointInside(a, b, c, x)) {
            return false;
        }
    }

    return true;
}

Polygon.prototype.triangulateEC = function() {
    var indexes = [],
        n = this.points.length;

    //make it trigonometric
    if (this.calculateArea() > 0)   // invers-trigonometric
        for (var i = 0; i < n; ++i) indexes.push(i);
    else                            // trigonometric
        for (var i = 0; i < n; ++i) indexes.push(n - i - 1);

    var v = n - 1,
        errCnt = n * n;
    while (n > 2) {
        //set indexes
        var u = v; //prev
        if (n <= u) u = 0;
        v = u + 1; //new
        if (n <= v) v = 0;
        var w = v + 1; //next
        if (n <= w) w = 0;

        if (errCnt-- <= 0) {
            log('Triangulation error');
            log('Remaining points:', indexes.join(', '));
            //console.log("n: ", n);
            //console.log("u v w: ", u, " " , v, " " , w);
            //console.log("true: ", indexes[u], " " , indexes[v], " " , indexes[w]);
            return;
        }

        if (this.isEar(
            this.points[indexes[u]],
            this.points[indexes[v]],
            this.points[indexes[w]]
        )) {
            console.log('Removing', indexes[v]);
            this.triangles.push(indexes[u]);
            this.triangles.push(indexes[v]);
            this.triangles.push(indexes[w]);
            indexes.splice(v, 1);

            this.trianglesColors.push(randomBlueColorCode());
            n--;
        }
    }

    log('Triangulation success');
};

Polygon.prototype.highlightPoint = function(x) {
    this.specialPoints.push(x);
    for (var i = 0; i < this.triangles.length; i += 3) {
        var p1 = this.points[this.triangles[i]],
            p2 = this.points[this.triangles[i + 1]],
            p3 = this.points[this.triangles[i + 2]];

        if (isPointInside(p1, p2, p3, x)) {
            this.trianglesColors[i / 3] = COLOR_HIGHLIGHT;
            log('Found X inside a triangle');
            this.draw();

            return;
        }
    }

    log('Found X outside the polygon');
};

Polygon.prototype.finishedDrawing = function() {
    this.state = POLYGON_DRAWN;
    this.draw();
    this.triangulateEC();

    this.state = POLYGON_FINISHED;
    this.draw();
};

Polygon.prototype._drawEdges = function () {
    if (this.points.length == 0) {
        return;
    }

    // Draw lines between points
    this.ctx.save();
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 3;

    var firstPoint = this.points[0];
    this.ctx.beginPath();
    this.ctx.moveTo(firstPoint.x, firstPoint.y);
    for (var i = 1; i < this.points.length; i++) {
        this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    if (this.state >= POLYGON_DRAWN) {
        this.ctx.closePath();
    }
    this.ctx.stroke();
    this.ctx.restore();

    if (this.state == POLYGON_DRAWING && this.points.length >= 3) {
        var lastPoint = this.points[this.points.length - 1];
        this.ctx.setLineDash([5]);
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'blue';
        this.ctx.moveTo(lastPoint.x, lastPoint.y);
        this.ctx.lineTo(firstPoint.x, firstPoint.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
};

Polygon.prototype._drawTriangles = function() {
    if (this.state == POLYGON_FINISHED) {
        this.ctx.save();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([]);

        for (var i = 0; i < this.triangles.length; i += 3) {
            var p1 = this.points[this.triangles[i]],
                p2 = this.points[this.triangles[i + 1]],
                p3 = this.points[this.triangles[i + 2]];

            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.lineTo(p3.x, p3.y);
            this.ctx.closePath();
            this.ctx.stroke();

            this.ctx.fillStyle = this.trianglesColors[i / 3];
            this.ctx.fill();
        }

        this.ctx.restore();
    }
};

Polygon.prototype._drawPoints = function() {
    // Draw Points
    for (var x of this.points) {
        x.draw();
    }

    if (this.state == POLYGON_FINISHED) {
        for (var x of this.specialPoints) {
            x.drawSpecial();
        }
    }
};

Polygon.prototype.draw = function() {
    //clear context
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.ctx.lineCap  = 'round';
    this.ctx.lineJoin = 'round';

    this._drawTriangles();
    this._drawEdges();
    this._drawPoints();
};

Polygon.prototype.drawWithMouse = function(mouse) {
    this.draw();

    // Draw mouse point if still drawing
    if (this.state == POLYGON_DRAWING) {
        if (this.points.length > 0) {
            var lastPoint = this.points[this.points.length - 1];
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'red';
            this.ctx.moveTo(lastPoint.x, lastPoint.y);
            this.ctx.lineTo(mouse.x, mouse.y);
            this.ctx.stroke();
        }

        mouse.draw();
    } else if (this.state == POLYGON_FINISHED) {
        mouse.drawSpecial();
    }
};
