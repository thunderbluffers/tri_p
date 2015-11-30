const POLYGON_DRAWING   = 0;
const POLYGON_DRAWN     = 1;
const POLYGON_FINISHED  = 2;

const EPS               = 0.0000000001;

const COLOR_HIGHLIGHT   = "rgb(255, 255, 200)";

function orientationTest(ax, ay, bx, by, cx, cy) {
    return ax * (by - cy) + bx * (cy - ay) + cx * (ay - by);
}

function triangleArea(ax, ay, bx, by, cx, cy) {
    return Math.abs(orientationTest(ax, ay, bx, by, cx, cy)) / 2;
};

function randomBlueColorCode() {
    var randColParam = Math.floor((Math.random() * 70) + 80);
    return ("rgb(" + randColParam + ", " + randColParam + ", 255)");
}

function pointInside(a, b, c, p) {
    var ax = a.x,
        ay = a.y,
        bx = b.x,
        by = b.y,
        cx = c.x,
        cy = c.y,
        px = p.x,
        py = p.y;

    var aTot = triangleArea(ax, ay, bx, by, cx, cy),
        a1   = triangleArea(px, py, bx, by, cx, cy),
        a2   = triangleArea(ax, ay, px, py, cx, cy),
        a3   = triangleArea(ax, ay, bx, by, px, py);

    if (aTot == a1 + a2 + a3)
        return true;
    else
        return false;
}

var Polygon = function() {
    this.points = [];
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
    var ax = this.points[a].x,
        ay = this.points[a].y,
        bx = this.points[b].x,
        by = this.points[b].y,
        cx = this.points[c].x,
        cy = this.points[c].y;

    if (orientationTest(ax, ay, bx, by, cx, cy) < 0)
        return false;

    for (var i = 0; i < this.points.length; ++i)
    {
        if (i == a || i == b || i == c) continue;
        if (pointInside(this.points[a], this.points[b], this.points[c], this.points[i]))
            return false;
    }

    return true;
}

Polygon.prototype.triangulateEC = function() {

    var indexes = [],
        n = this.points.length;

    //make it trigonometric
    if (this.calculateArea() > 0)   //invers-trigonometric
        for (var i = 0; i < n; ++i) indexes.push(i);
    else                            //trigonometric
        for (var i = 0; i < n; ++i) indexes.push(n - i - 1);

    var v = n - 1;
    while (n > 2) {
        //set indexes
        var u = v; //prev
        if (n <= u) u = 0;
        v = u + 1; //new
        if (n <= v) v = 0;
        var w = v + 1; //next
        if (n <= w) w = 0;

        if (this.isEar(indexes[u], indexes[v], indexes[w]))
        {
            console.log("Removing", indexes[v]);
            this.triangles.push(indexes[u]);
            this.triangles.push(indexes[v]);
            this.triangles.push(indexes[w]);
            indexes.splice(v, 1);

            this.trianglesColors.push(randomBlueColorCode());

            n--;
        }
    }
}

Polygon.prototype.finishedDrawing = function() {
    this.state = POLYGON_DRAWN;
    this.drawContour();
    this.triangulateEC();
    this.state = POLYGON_FINISHED;

    var dummyMouse = new Point(-1, -1);
    this.drawWithMouse(dummyMouse);
}

Polygon.prototype.drawContour = function () {
    // Clear
    this.ctx.lineCap  = 'round';
    this.ctx.lineJoin = 'round';

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

    // Draw Points
    this.points.forEach(function(p) {
        p.draw();
    });
};

Polygon.prototype.drawWithMouse = function(mouse) {
    if (this.points.length == 0) {
        return;
    }

    //clear context
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw mouse point if still drawing
    if (this.state == POLYGON_DRAWING) {
        var lastPoint = this.points[this.points.length - 1];
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'red';
        this.ctx.moveTo(lastPoint.x, lastPoint.y);
        this.ctx.lineTo(mouse.x, mouse.y);
        this.ctx.stroke();

        mouse.draw();
    }
    else if (this.state >= POLYGON_DRAWN) {
        this.ctx.save();
        this.ctx.strokeStyle = "black";
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

            //check if mouse in triangle and highlight if the case
            if (pointInside(p1, p2, p3, mouse))
                this.ctx.fillStyle = COLOR_HIGHLIGHT;
            else
                this.ctx.fillStyle = this.trianglesColors[i / 3];
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    //draw contour over all other shapes
    this.drawContour();
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
