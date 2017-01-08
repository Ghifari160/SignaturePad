(function()
{
	var SignaturePad = function(selector)
	{
		return new SignaturePad.fn.init(selector);
	};

	SignaturePad.fn = SignaturePad.prototype =
	{
		signaturepad: "proto-2",
		constructor: SignaturePad
	};

	var init = SignaturePad.fn.init = function(selector)
	{
		if(typeof selector === "string")
		{
			var elements = document.querySelectorAll(selector);

			for(var i = 0; i < elements.length; i++)
				this[i] = elements[i];

			this.length = elements.length;
		}
		else
		{
			this[0] = selector;
			this.length = 1;
		}
	};

	init.prototype = SignaturePad.fn;

	SignaturePad.fn.map = function(callback)
	{
		var ret = [], i = 0;
		for(; i < this.length; i++)
			ret.push(callback.call(this, this[i], i));
		return ret;
	};

	SignaturePad.fn.each = function(callback)
	{
		this.map(callback);
		return this;
	};

	SignaturePad.fn.mapOne = function(callback)
	{
		var ret = this.map(callback);
		return ret.length > 1 ? ret : ret[0];
	};

	SignaturePad.fn.text = function(text)
	{
		if(typeof text !== "undefined")
		{
			return this.each(function (el)
			{
				el.innerText = text;
			});
		}
		else
		{
			return this.mapOne(function(el)
			{
				return el.innerText;
			});
		}
	};

	SignaturePad.fn.getDom = function()
	{
		return this[0];
	};

	SignaturePad.fn.html = function(html)
	{
		if(typeof html !== "undefined")
		{
			return this.each(function(el)
			{
				el.innerHTML = html;
			});
		}
		else
		{
			return this.mapOne(function(el)
			{
				return el.innerHTML;
			});
		}
	};

	SignaturePad.fn.val = function(val)
	{
		if(typeof val !== "undefined")
		{
			return this.each(function(el)
			{
				el.value = val;
			});
		}
		else
		{
			return this.mapOne(function(el)
			{
				return el.value;
			});
		}
	};

	SignaturePad.fn.append = function(html)
	{
		return this.each(function(el)
		{
			el.insertAdjacentHTML("beforeend", html);
		});
	};

	SignaturePad.fn.prepend = function(html)
	{
		return this.each(function(el)
		{
			el.insertAdjacentHTML("afterbegin", html);
		});
	};

	SignaturePad.fn.on = function(type, callback, passive)
	{
		return this.each(function(el)
		{
			el.addEventListener(type, callback, {capture: false, passive: passive});
		});
	};

	SignaturePad.fn.click = function(callback, passive)
	{
		return this.on("click", callback, passive);
	};

	SignaturePad.fn.show = function()
	{
		return this.each(function(el)
		{
			el.style.display = "block";
		});
	};

	SignaturePad.fn.hide = function()
	{
		return this.each(function(el)
		{
			el.style.display = "none";
		});
	};

	function preparePage()
	{
		SignaturePad("body").append('<div id="pad-modal"></div>'
			+ '<div id="pad-container">'
			+ '<canvas id="pad" width="500" height="250"></canvas>'
			+ '<div id="pad-btn-cancel">Cancel</div>'
			+ '<div id="pad-btn-done">Done</div>'
			+ '</div>');

		SignaturePad("#pad-btn-cancel").click(function()
		{
			SignaturePad("#pad-modal").hide();
			SignaturePad("#pad-container").hide();
			reset();
		}, true);

		initCanvas();
	};

	var canvas,
			ctx,
			paint = false,
			clickX = new Array(),
			clickY = new Array(),
			clickDrag = new Array();

	function initCanvas()
	{
		canvas = document.getElementById("pad");
		ctx = canvas.getContext("2d");

		canvas.onmousedown = function(e)
		{
			e.preventDefault();
			paint = true;
			addClick(e.pageX - canvas.parentNode.offsetLeft - canvas.offsetLeft - parseInt(window.getComputedStyle(canvas).paddingLeft, 10),
				e.pageY - canvas.parentNode.offsetTop - canvas.offsetTop - parseInt(window.getComputedStyle(canvas).paddingTop, 10));
			redraw();
		};

		canvas.onmousemove = function(e)
		{
			e.preventDefault();
			if(paint)
			{
				addClick(e.pageX - canvas.parentNode.offsetLeft - canvas.offsetLeft - parseInt(window.getComputedStyle(canvas).paddingLeft, 10),
					e.pageY - canvas.parentNode.offsetTop - canvas.offsetTop - parseInt(window.getComputedStyle(canvas).paddingTop, 10), true);
				redraw();
			}
		};

		canvas.onmouseup = function()
		{
			paint = false;
		};

		canvas.ontouchstart = function(e)
		{
			e.preventDefault();
			paint = true;
			addClick(e.touches[0].pageX - canvas.parentNode.offsetLeft - canvas.offsetLeft - parseInt(window.getComputedStyle(canvas).paddingLeft, 10),
				e.touches[0].pageY - canvas.parentNode.offsetTop - canvas.offsetTop - parseInt(window.getComputedStyle(canvas).paddingTop, 10));
			redraw();
		};

		canvas.ontouchmove = function(e)
		{
			e.preventDefault();
			if(paint)
			{
				addClick(e.touches[0].pageX - canvas.parentNode.offsetLeft - canvas.offsetLeft - parseInt(window.getComputedStyle(canvas).paddingLeft, 10),
					e.touches[0].pageY - canvas.parentNode.offsetTop - canvas.offsetTop - parseInt(window.getComputedStyle(canvas).paddingTop, 10), true);
				redraw();
			}
		};

		canvas.ontouchend = function()
		{
			paint = false;
		};

		canvas.ontouchcancel = function()
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
		clickX = new Array();
		clickY = new Array();
		clickDrag = new Array();

		resetCanvas();
	}

	function encode()
	{
		var json =
		{
			version: "proto-2",
			path:
			{
				x: clickX,
				y: clickY,
				d: clickDrag
			}
		};

		return base64_encode(JSON.stringify(json));
	}

	function base64_encode(str)
	{
		return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1)
		{
			return String.fromCharCode('0x' + p1);
		}));
	}

	SignaturePad.fn.acquireSignature = function()
	{
		return this.each(function(el)
		{
			console.log(SignaturePad(el).html());
			if((SignaturePad(el).getDom().nodeName == "TEXTAREA" && SignaturePad(el).val() === "")
				|| (SignaturePad(el).getDom().nodeName !== "TEXTAREA" && SignaturePad(el).text() === ""))
			{
				if(SignaturePad("#pad-container").length == 0)
					preparePage();

				SignaturePad("#pad-modal").show();
				SignaturePad("#pad-container").show();

				SignaturePad("#pad-btn-done").click(function()
				{
					SignaturePad("#pad-modal").hide();
					SignaturePad("#pad-container").hide();

					SignaturePad(el).val(encode());

					reset();
				}, true);
			}
		});
	};

	var _$ = window.$,
		_SignaturePad = window.SignaturePad;

	SignaturePad.fn.noConflict = function(deep)
	{
		if(window.$ === SignaturePad)
			window.$ = _$;

		if(deep && window.SignaturePad === SignaturePad)
			window.SignaturePad = _SignaturePad;

		return SignaturePad;
	};

	window.SignaturePad = window.$ = SignaturePad;
})();
