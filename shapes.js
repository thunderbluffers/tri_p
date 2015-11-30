const POLYGON_DRAWING   = 0;
const POLYGON_DRAWN     = 1;
const POLYGON_FINISHED  = 2;

const EPS               = 0.0000000001;

function triangleArea(ax, ay, bx, by, cx, cy) {
    return Math.abs(ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2;
};

var Polygon = function() {
    this.points = [];
    this.state = POLYGON_DRAWING;
    this.ctx = canvas.getContext('2d');
    this.triangles = [];
};

Polygon.prototype.add = function(p) {
    this.points.push(p);
};

Polygon.prototype.pointInside = function(a, b, c, p) {
    var ax = this.points[a].x,
        ay = this.points[a].y,
        bx = this.points[b].x,
        by = this.points[b].y,
        cx = this.points[c].x,
        cy = this.points[c].y,
        px = this.points[p].x,
        py = this.points[p].y;

    var aTot = triangleArea(ax, ay, bx, by, cx, cy),
        a1   = triangleArea(px, py, bx, by, cx, cy),
        a2   = triangleArea(ax, ay, px, py, cx, cy),
        a3   = triangleArea(ax, ay, bx, by, px, py);

    if (aTot == a1 + a2 + a3)
        return true;
    else
        return false;
}

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

    if (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by) < 0)
        return false;

    for (var i = 0; i < this.points.length; ++i)
    {
        if (i == a || i == b || i == c) continue;
        if (this.pointInside(a, b, c, i))
            return false;
    }

    return true;
}

Polygon.prototype.triangulateEC = function() {

    var indexes = [],
        n = this.points.length;
console.log(this.points.length);
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
            this.triangles.push(indexes[u]);
            this.triangles.push(indexes[v]);
            this.triangles.push(indexes[w]);
console.log("removed", indexes[v]);
            indexes.splice(v, 1);

            n--;
        }
    }
}

Polygon.prototype.finishedDrawing = function() {
    this.state = POLYGON_DRAWN;
    this.draw();
    this.triangulateEC();
    this.state = POLYGON_FINISHED;
    this.draw();
}

Polygon.prototype.draw = function () {
    // Clear
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.ctx.lineCap  = 'round';
    this.ctx.lineJoin = 'round';

    // Draw triangles if the case
    if (this.state == POLYGON_FINISHED) {
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

            //assign random blue-ish colour
            var randColParam = Math.floor((Math.random() * 70) + 80);
            this.ctx.fillStyle = "rgb(" + randColParam + ", " + randColParam + ", 255)";
            this.ctx.fill();
        }

        this.ctx.restore();
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

    // Draw Points
    this.points.forEach(function(p) {
        p.draw();
    });
};

Polygon.prototype.drawWithMouse = function(mouse) {
    if (this.points.length == 0 || this.state != POLYGON_DRAWING) {
        return;
    }

    this.draw();

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
