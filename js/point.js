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

Point.prototype.eq = function(other) {
    return this.x == other.x && this.y == other.y;
}

Point.prototype.drawSpecial = function() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'red';
    this.ctx.fill();
};
