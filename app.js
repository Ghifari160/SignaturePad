function preparePage()
{
	document.body.insertAdjacentHTML('beforeend', '<div id="pad-modal" style="display: none;"></div>'
		+ '<div id="pad-container" style="display: none;">'
		+ '<canvas id="pad" width="500" height="250"></canvas>'
		+ '<div id="pad-btn-cancel">Cancel</div>'
		+ '<div id="pad-btn-done">Done</div>'
		+ '</div>');

	initCanvas();

	document.getElementById("pad-btn-cancel").addEventListener("click", btnList, false);
	document.getElementById("pad-btn-done").addEventListener("click", function(e)
	{
		submit();

		document.getElementById("pad-modal").style.display = "none";
		document.getElementById("pad-container").style.display = "none";

		reset();
	}, false);
}

function btnList()
{
	document.getElementById("pad-modal").style.display = "none";
	document.getElementById("pad-container").style.display = "none";

	reset();
}

function acquireSignature(t)
{
	if(document.getElementById("pad-modal") == undefined)
		preparePage();

	document.getElementById("pad-modal").style.display = "block";
	document.getElementById("pad-container").style.display = "block";
	target = t;
}

var c, ctx, paint, target;
	clickX = new Array(), clickY = new Array(), clickDrag = new Array();


function initCanvas()
{
	c = document.getElementById("pad");
	ctx = c.getContext('2d');
	paint = false;

	c.onmousedown = function(e)
	{
		e.preventDefault();
		paint = true;

		addClick(e.pageX - c.parentNode.offsetLeft - c.offsetLeft - parseInt(window.getComputedStyle(c).paddingLeft, 10),
			e.pageY - c.parentNode.offsetTop - c.offsetTop - parseInt(window.getComputedStyle(c).paddingTop, 10));
		redraw();

		console.log(window.getComputedStyle(c).paddingLeft);
	};

	c.onmousemove = function(e)
	{
		e.preventDefault();
		if(paint)
		{
			addClick(e.pageX - c.parentNode.offsetLeft - c.offsetLeft - parseInt(window.getComputedStyle(c).paddingLeft, 10),
				e.pageY - c.parentNode.offsetTop - c.offsetTop - parseInt(window.getComputedStyle(c).paddingTop, 10), true);
			redraw();
		}
	};

	c.onmouseup = function(e)
	{
		paint = false;
	};

	resetCanvas();
}

function addClick(x, y, drag)
{
	clickX.push(x);
	clickY.push(y);
	clickDrag.push(drag);
}

function redraw()
{
	resetCanvas();

	for(var i = 0; i < clickX.length; i++)
	{
		ctx.beginPath();

		if(clickDrag[i] && i)
			ctx.moveTo(clickX[i - 1], clickY[i - 1]);
		else
			ctx.moveTo(clickX[i] - 1, clickY[i]);

		ctx.lineTo(clickX[i], clickY[i]);
		ctx.closePath();
		ctx.stroke();
	}
}

function resetCanvas()
{
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctx.strokeStyle = "#000000";
	ctx.lineJoin = "round";
	ctx.lineWidth = 2.5;

	ctx.beginPath();
	ctx.moveTo(20, ctx.canvas.height - 60);
	ctx.lineTo(ctx.canvas.width - 20, ctx.canvas.height - 60);
	ctx.closePath();
	ctx.stroke();
}

function reset()
{
	console.log(clickX);
	clickX = new Array();
	clickY = new Array();
	clickDrag = new Array();

	resetCanvas();
}

function base64_encode(str)
{
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1)
	{
		return String.fromCharCode('0x' + p1);
	}));
}

function submit()
{
	var json =
	{
		version: "proto-1",
		path:
		{
			x: clickX,
			y: clickY
		}
	},
		sJson;

	sJson = JSON.stringify(json);

	target.innerHTML = base64_encode(sJson);
}
