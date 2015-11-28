var Point = function(x, y) {
    this.x = x;
    this.y = y;
};

Point.prototype.draw = function() {
    context.beginPath();
    context.arc(this.x, this.y, 3, 0, 2 * Math.PI);
    context.fillStyle = 'black';
    context.fill();
}

function writeMessage(canvas, message) {
    var context = canvas.getContext('2d');
    // context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '18pt Helvetica Neue';
    context.fillStyle = 'black';
    context.fillText(message, 10, 25);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new Point(evt.clientX - rect.left, evt.clientY - rect.top);
}

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
canvas.addEventListener('mousemove', function(evt) {
    var pos = getMousePos(canvas, evt);
    var message = 'Mouse position: ' + pos.x + ', ' + pos.y;
    writeMessage(canvas, message);
}, false);

canvas.addEventListener('click', function(evt) {
    var pos = getMousePos(canvas, evt);
    pos.draw();
    console.log(pos);
}, false)
