function PolaroidDeveloper (img, canvas, time) {
	this.displayCanvas = canvas;
	this.devTime = time*1000;
	this.curTime = 0;
	this.interval = Math.round(1000/15); //15fps
	this.rgbStart = 220;
	this.refCanvas = document.createElement("canvas");
	this.img = new Image();
	var developerObj = this;
	this.img.addEventListener("load", function(event) {developerObj.startDeveloping(event)});
	this.img.src = img;
}

PolaroidDeveloper.prototype.startDeveloping = function (event) {
	//alert("loaded");
	var scale = Math.min(this.displayCanvas.width/this.img.width, this.displayCanvas.height/this.img.height);
	var newWidth = Math.round(this.img.width * scale);
	var newHeight = Math.round(this.img.height * scale);
	//alert(newWidth+', '+newHeight);
	this.displayCanvas.width = this.refCanvas.width = newWidth;
	this.displayCanvas.height = this.refCanvas.height = newHeight;
	this.dContext = this.displayCanvas.getContext('2d');
	this.rContext = this.refCanvas.getContext('2d');
	this.dContext.fillStyle = "rgb("+this.rgbStart+","+this.rgbStart+","+this.rgbStart+")";
	this.dContext.fillRect(0,0,newWidth,newHeight);
	this.rContext.drawImage(this.img,0,0,newWidth,newHeight);
	var vignette = this.rContext.createRadialGradient(newWidth/2,newHeight/2,Math.min((newWidth/2)-(newWidth/10), (newHeight/2)-(newHeight/10)),newWidth/2,newHeight/2,Math.sqrt(Math.pow(newWidth,2)+Math.pow(newHeight,2))/2);
	vignette.addColorStop(0,"rgba(0,0,0,0)");
	vignette.addColorStop(1,"rgba(0,0,0,.75)");
	this.rContext.fillStyle = vignette;
	this.rContext.fillRect(0,0,newWidth,newHeight);
	this.rPixels = this.rContext.getImageData(0,0,newWidth,newHeight);
	if (this.callback != null) this.callback(event);
	var devObject = this;
	this.timer = setInterval(function(event) {devObject.drawImage(event)}, this.interval);
}

PolaroidDeveloper.prototype.drawImage = function (event) {
	this.curTime += this.interval;
	//alert(this.rPixels);
	if (this.curTime > this.devTime) clearInterval(this.timer);
	var gCoeff = this.curTime>this.devTime*.6 ? 1 : this.easeInOutPosition(this.curTime, this.devTime*.6);
	var bCoeff = this.curTime>this.devTime*.75 ? 1 : this.easeInOutPosition(this.curTime, this.devTime*.75);
	var rCoeff = this.easeInOutPosition(this.curTime, this.devTime);
	var dPixels = this.dContext.getImageData(0,0,this.displayCanvas.width,this.displayCanvas.height);
	//alert("dPixels")
	for (var i=0; i < dPixels.data.length; i += 4) {
		dPixels.data[i] = this.rgbStart + Math.round((this.rPixels.data[i] - this.rgbStart)*rCoeff);
		dPixels.data[i+1] = this.rgbStart + Math.round((this.rPixels.data[i+1] - this.rgbStart)*gCoeff);
		dPixels.data[i+2] = this.rgbStart + Math.round((this.rPixels.data[i+2] - this.rgbStart)*bCoeff);
	}
	this.dContext.putImageData(dPixels,0,0);
}

PolaroidDeveloper.prototype.easeInOutPosition = function (time, duration) {
	return (1 - Math.cos(Math.PI*time/duration))/2;
}

PolaroidDeveloper.prototype.onLoad = function (func) {
	this.callback = func;
}

PolaroidDeveloper.prototype.stop = function () {
	clearInterval(this.timer);
}