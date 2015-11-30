var getMousePos = function(canvas, evt) {
    // TODO: getBoundingClientRect doesn't work well on scroll
    var rect = canvas.getBoundingClientRect();
    return new Point(evt.clientX - rect.left, evt.clientY - rect.top);
}

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var polygon = new Polygon();

// Events
var canvasMouseMove = function(evt) {
    var mouse = getMousePos(canvas, evt);
    polygon.drawWithMouse(mouse);
};
canvas.addEventListener('mousemove', canvasMouseMove, false);

var canvasClick = function(evt) {
    var mouse = getMousePos(canvas, evt);
    polygon.add(mouse);
    polygon.drawWithMouse(mouse);
};
canvas.addEventListener('click', canvasClick, false)

document.onkeypress = function(e) {
	if (polygon.state > POLYGON_DRAWING)
		return;
    e = e || window.event;
    var charCode = (typeof e.which == 'number') ? e.which : e.keyCode;
    if (String.fromCharCode(charCode) == ' ') {
        //canvas.removeEventListener('mousemove', canvasMouseMove);
        canvas.removeEventListener('click', canvasClick);
        polygon.finishedDrawing();
    }
};

// Error handling
function resetScene() {
	context.clearRect(0, 0, canvas.width, canvas.height);

	if (polygon) {
		
	}
}