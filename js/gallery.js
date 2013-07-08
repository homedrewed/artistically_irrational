//Window resizes caused the manual liquid layout to distort the images. This saves original images' aspect ratio.
function registerRatios(e) {
	var img = $(e.target);
	var ratio = img.width()/img.height();
	//alert(img.parents('article').length);
	ratios[$("#artwork article").index(img.parents('article'))] = ratio;
	fitImage(e);
}

function replaceWithImage(e) {
    var img = $(e.target).next();
    img.load(registerRatios);
    $(e.target).parent().replaceWith(img);
}

function fitImage(e) {
	var img = $(e.currentTarget).is("img, video") ? $(e.target) : $("article.selected").find("div:first-child img, div:first-child video");
	var article = img.parents('article');
	if (article.hasClass('selected')) {
		//alert(img[0].src);
		img.addClass('expando');
		img.parent().addClass('expando');
		img.parent().width('').height('');
		article.children('header').css("margin-top",0);
	}
	//alert(img[0]);
	//alert(e.currentTarget.nodeName);
	var ratio = ratios[$("#artwork article").index($(img.parents('article')))];
	var maskSize = $("article:not(.selected) div:first-child").width();
	//alert(maskSize+' '+ratio);
	if (img.width() > img.height()) {
		img.width(maskSize*ratio).height(maskSize);
	} else {
		img.width(maskSize).height(maskSize/ratio);
	}
}

function growImage(article) {
	//alert(ratios.length);
	var img = article.find("div:first-child img, div:first-child video");
	var div = article.children("div:first-child");
	var ratio = ratios[$("#artwork article").index(article)];
	div.addClass('expando');
	img.addClass('expando');
	if (img.width() > img.height()) {
		//img.width("100%").height("auto");
		img.width(article.width()).height(article.width()/ratio);
		div.width(article.width()).height(article.width()/ratio);;
	} else {
		//img.width("auto").height("100%");
		img.width(article.width()*ratio).height(article.width());
		div.width(article.width()).height(article.width());
	}
	//document.addEventListener("webkitTransitionEnd", stripTransition,false);
	scrollInterval = setInterval(adjustScroll, Math.round(1000/24));
	setTimeout(function () {clearInterval(scrollInterval)}, 1010);
	$(document).bind("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd", stripTransition);
}

//Don't want resize transition if it's a simple window resize. Also fades in descriptions.
function stripTransition(event) {
	//alert(event.target);
	var img = $(event.target).is('img, video') ? $(event.target) : $(event.target).children('img, video');
	var article = img.parents('article');
	if (article.hasClass("selected")) {
		$(document).unbind("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd", stripTransition);
		img.removeClass('expando');
		img.parent().removeClass('expando');
		article.children('header').css("margin-top",(img.height()+15)+'px');
		var txtHite = article.children("header").height() + article.children('div').eq(1).height();
		//alert(article.children("header").height()+", "+txtHite+", "+article.children("div:last-child").height());
		if (article.children("div:last-child").height() > txtHite) {
			var btmMrgn = article.children("div:last-child").height() - (txtHite+5);
			article.children('div').eq(1).css("margin-bottom", btmMrgn + 'px');
		}
		article.children('div').each(function(index) { if (index>0) $(this).css("opacity",1) });
	}
}

function adjustScroll() {
	$(document).scrollTop($("article.selected").offset().top);
}

//Fakes a liquid layout, since CSS Transitions want images styled with exact pixel dimensions
function liquify(e) {
	var article = $("article.selected");
	var art;
	var div;
	var img;
	var ratio;
	var txtHite;
	var btmMrgn;
	article.each(function (index) {
		art = $(this);
		div = art.children("div:first-child");
		img = div.children("img, video");
		ratio = ratios[$("#artwork article").index($(this))];
		if (ratio >= 1) {
			img.width(art.width()).height(art.width()/ratio);
			div.width(art.width()).height(art.width()/ratio);
		} else {
			img.width(art.width()/ratio).height(art.width());
			div.width(art.width()).height(art.width());
		}
		art.children('header').css("margin-top",(img.height()+15)+'px');
		txtHite = art.children("header").height() + art.children('div').eq(1).height();
		if (art.children("div:last-child").height() > txtHite) {
			btmMrgn = art.children("div:last-child").height() - (txtHite+5);
			art.children('div').eq(1).css("margin-bottom", btmMrgn + 'px');
		}
	});
}

function toggle(e) {
	var target = $(e.target);
	//Don't want toggle to trigger if bottom 30 pixels of video is clicked (controls area)
	if (target.is("video") && e.layerY > (target.height()-30)) return;
	if (!target.is("a") && !target.parent().is("h2")) {
    	var clicked = target.is("article") ? target : target.parents("article");
    	var open = $("article.selected");
    	if (open.length > 0) {
    		fitImage(e);
    		open.children('div').each(function(index) { if(index>0) $(this).css("opacity",'') });
    		open.removeClass("selected");
    	}
    	if (clicked[0] != open[0]) {
    		clicked.addClass("selected");
    		growImage(clicked);
    	}
	}
}

function displayPolaroid(event) {
	//alert($(event.currentTarget).attr("href"));
	$("#popup").css("display", "block");//.height($(document).height());
	var canvas = $("#popup canvas")[0];
	canvas.width = $(window).width()/2;
	canvas.height = $(window).height()/1.5;
	$("#popup div").css({position: 'absolute',top:-$("#popup div").height()*1.5});
	//var cntxt = canvas.getContext('2d');
	//cntxt.fillStyle = "rgb(220,220,220)";
	//cntxt.fillRect(0,0,400,300);
	photo = new PolaroidDeveloper($(event.currentTarget).attr("href"),canvas,3);
	photo.onLoad(positionPolaroid);
	//alert();
	$("#popup").click(hidePolaroid);
	//$("#popup").click(hidePolaroid);
	event.preventDefault();
}

function positionPolaroid(event) {
	var div = $("#popup div");
	div.addClass("flyin");
	div.css({left: ($(window).width() - div.outerWidth())/2, top: ($(window).height() - div.outerHeight())/2});
}

function hidePolaroid(event) {
	if ($(event.target).is("a") || $(event.target).attr("id") == "popup") {
		$("#popup").unbind("click", hidePolaroid);
		//$("#popup").unbind("click", hidePolaroid);
		photo.stop();
		$("#popup").css("display",'');
		$("#popup div").removeClass("flyin").css("top", -$("#popup div").height()*2);
		event.preventDefault();
	}
}

var ratios = [];
var photo; //currently developing crowd shot (PolaroidDeveloper object)
var scrollInterval;

$(function() {
	var fillColor = $("article div:last p").css("background-color");
	var strokeColor = "#333"; //JS cannot read border styles in most browsers, so must change this manually
	//var canvases = $("canvas");
	var pointCanvas;
	var cntx;
	$("article div:last-child").each(function () {
		pointCanvas = $(document.createElement('canvas'));
		pointCanvas[0].width = 20;
		pointCanvas[0].height = 20;
		$(this).children("img").before(pointCanvas);
		cntx = pointCanvas[0].getContext('2d');
		cntx.beginPath();
		cntx.fillStyle = fillColor;
		cntx.lineTo(0,2);
		cntx.lineTo(20,2)
		cntx.lineTo(20,0);
		cntx.lineTo(0,0);
		cntx.fill();
		cntx.beginPath();
		cntx.fillStyle = fillColor;
		cntx.strokeStyle = strokeColor;
		cntx.lineWidth = 2;
		cntx.moveTo(0,2);
		cntx.lineTo(20,20);
		cntx.lineTo(20,2);
		cntx.fill();
		cntx.stroke();
	});
	$("article div:first-child img").load(registerRatios);
	$("article div:first-child video").bind("loadedmetadata", registerRatios);
	$("video source:last-of-type").bind('error', replaceWithImage);
	var popup = $(document.createElement('div'));
	popup.html('<div><canvas></canvas></div>');//'<div><canvas></canvas><a href="#">close</a></div>');
	popup.attr("id", "popup");
	$("#artwork").after(popup);
	/*alert(artImages.length);
	for (var j=0; j<artImages.length; j++) {
		$(artImages[j]).load(registerRatios);
	}*/
	var rotDegrees;
	$("aside li").each(function(index) {
		rotDegrees = "rotate("+((Math.round(Math.random() * 10) *2) -10)+"deg)";
		$(this).css({"transform":rotDegrees,"-webkit-transform":rotDegrees,"-moz-transform":rotDegrees,"-ms-transform":rotDegrees,"-o-transform":rotDegrees});
	});
	$("article").click(toggle);
	$("aside a").click(displayPolaroid);
	$(window).bind('resize',liquify);
});