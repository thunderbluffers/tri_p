var log = function() {
    var $log = document.getElementById('log');
    var msg = [].slice.call(arguments).join(' ');
    $log.innerHTML += msg + "\n";
}

var getMousePos = function(canvas, evt) {
    // TODO: getBoundingClientRect doesn't work well on scroll
    var rect = canvas.getBoundingClientRect();
    return new Point(evt.clientX - rect.left, evt.clientY - rect.top);
}

var canvas = document.getElementById('bible');
var context = canvas.getContext('2d');
var polygon = new Polygon();

// Events
var canvasMouseMove = function(evt) {
    var mouse = getMousePos(canvas, evt);
    polygon.drawWithMouse(mouse);
};
canvas.addEventListener('mousemove', canvasMouseMove, false);

var canvasClick = function(e) {
    var mouse = getMousePos(canvas, e);
    log(`Drawn line to (${mouse.x.toFixed(1)}, ${mouse.y.toFixed(1)})`);
    polygon.add(mouse);
    polygon.drawWithMouse(mouse);
};
canvas.addEventListener('click', canvasClick, false);

var userInputFinish = function (e) {
    if (polygon.state > POLYGON_DRAWING) {
        return;
    }
    canvas.removeEventListener('click', canvasClick);
    polygon.finishedDrawing();

    canvas.addEventListener('click', function(e) {
        var mouse = getMousePos(canvas, e);
        log(`Point X at (${mouse.x.toFixed(1)}, ${mouse.y.toFixed(1)})`);
        polygon.drawWithMouse(mouse);
        polygon.highlightPoint(mouse);
        mouse.drawSpecial();
    }, false);
};

document.onkeypress = function(e) {
    e = e || window.event;
    var charCode = (typeof e.which == 'number') ? e.which : e.keyCode;
    if (String.fromCharCode(charCode) == ' ') {
    	userInputFinish();
    }
};

// Error handling
function resetScene() {
	context.clearRect(0, 0, canvas.width, canvas.height);

	if (polygon) {

	}
}
