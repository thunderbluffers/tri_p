function writeMessage(canvas, message) {
    var context = canvas.getContext('2d');
    //context.clearRect(0, 0, canvas.width, canvas.height);
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
var polygon = new Polygon();
var canvasMouseMove = function(evt) {
    var pos = getMousePos(canvas, evt);
    var message = 'Mouse position: ' + pos.x + ', ' + pos.y;
    //writeMessage(canvas, message);
    
    var mouse = getMousePos(canvas, evt);
    polygon.drawWithMouse(mouse);
};
canvas.addEventListener('mousemove', canvasMouseMove, false);

var canvasClick = function(evt) {
    var mouse = getMousePos(canvas, evt);
    polygon.add(mouse);
    polygon.draw();

    console.log(mouse);
};
canvas.addEventListener('click', canvasClick, false)

document.onkeypress = function(e) {
    e = e || window.event;
    var charCode = (typeof e.which == 'number') ? e.which : e.keyCode;
    if (String.fromCharCode(charCode) == ' ') {
        canvas.removeEventListener('mousemove', canvasMouseMove);
        canvas.removeEventListener('click', canvasClick);
        polygon.finishedDrawing();
    }
};
