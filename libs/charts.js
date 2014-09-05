/**
 *
 * @param values []
 * @param options {}
 */
Raphael.fn.pie = function (values, opt) {
    var paper = this,
        w = this.width,
        h = this.height,
        rad = Math.PI / 180,
        chart = paper.set(),
        colors = opt.colors;

    var cX = w/2,
        cY = h/ 2,
        z = 30;

    var totalValue = countTotalValue(),
        angle = 0,
        start = 0;

    function Chart() {
        this.c0 = [cX, cY];
        this.rX = 80;
        this.rY = opt.is3d ? 50 : r1;
        this.sectors = [];
        this.values = values;
    }

    /**
     *
     * @param i number
     * @param val value
     * @param c object
     * @param r
     * @constructor
     */
    function Sector (i, val, c) {
        this.val = val;
        this.startAngle = c.angle;
        this.r1 = c.rX;
        this.r2 = c.rY;

        this.x0 = c.x;
        this.y0 = c.y;

        var color = colors[i],
            //color = Raphael.hsb(0.1, .75, 1),
            param = {fill: color, stroke: "none", "stroke-width": 3};

        this.currentAngle = this.currentAngle || 0;

        var angle = 360*val/100,
            startAngle = this.startAngle,
            endAngle = this.startAngle + angle;

        this.sector = this.drawSector(this.x0, this.y0, this.r1, this.r2, startAngle, endAngle, param);
        //var s = drawSector(cX, cY, r1, r2, angle, currentAngle, param);
        //var s1 = drawSector(cX, cY - z, r1, r2, angle, currentAngle, param);
        //s.toBack();
    }
    Chart.prototype.createSector = function () {
        if (!this.values) {
            console.log("your values is empty: (" + values.join(',') + ")");
            return false;
        }
        var x0 = this.c0[0],
            y0 = this.c0[1],
            r1 = this.r0,
            valsLength = this.values.length,
            sector,
            i, currentAngle = 0;
        for (i=0; i<valsLength; i+=1){

            sector = new Sector(i, this.values[i], {x: x0, y: y0, rX: this.rX, rY: this.rY, angle: currentAngle});
            currentAngle += 360*this.values[i]/100;
            //sector.draw();
            this.sectors.push(sector);
        }

    };
    Sector.prototype.drawSector = function (cx, cy, r1, r2, startAngle, endAngle, params) {
        console.log(r1, r2);
        var x1 = cx + r1 * Math.cos(-startAngle * rad),
            x2 = cx + r2 * Math.cos(-endAngle * rad),
            y1 = cy + r1 * Math.sin(-startAngle * rad),
            y2 = cy + r2 * Math.sin(-endAngle * rad);
        return paper.path(["M", cx, cy, "L", x1, y1, "A", r1, r2, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    };

    var chart = new Chart();
    chart.createSector();

    // helpers
    function countTotalValue(){
        var i,
            l = values.length,
            val = 0;
        for (i = 0; i < l; i ++){
            val += values[i];
        }
        return val || false;
    }

};


/**
 *
 * @param values []
 * @param options {}
 */
Raphael.fn.bar = function (values, options) {
    var paper = this,
        opt = options || {};
    paper.el = this.canvas.offsetParent;

    var o = {
        padding: opt.padding || 0,
        is3d: opt.is3d,
        size3d: 10,
        colors: opt.colors,
        legendText: opt.legendText || options.labels || [],
        legendColors: opt.legendColors || [],
        labels: opt.labels || [],

        onSectorClicked: opt.onSectorClicked || function () { }
    };

    paper.stngs = {
        scaleY: null
    };

    var w = this.width,
        h = this.height,
        x0 = o.padding,
        y0 = h - o.padding,
        screenW = w - x0,
        screenH = y0;

    var parameters = {
        stroke: "#000",
        "stroke-width": 0.5,
        fill: o.colors[1]
    };

    /* draw Scale */
    drawScale(screenW, screenH, values);
    function drawScale (w, h, values) {

        var lineParams = {
            stroke: "#ccd4e0",
            "stroke-width": 0.5
        };
        var axisParams = {
            stroke: "#ccd4e0",
            "stroke-width": 1
        };
        var shadowParams = {
            stroke: "#ccd4e0",
            "stroke-width": 0.5,
            fill: "#ccd4e0"
        };

        var maxScaleY = calculateMaxScaleY(),
            scale = createScale(maxScaleY);

        paper.stngs.scaleY = maxScaleY;

        drawAxis();
        drawDivisions(maxScaleY);


        function makeLinePath(direction, xStart, yStart) {
            var m = {
                'v': [xStart, 0],
                'h': [w, yStart]
            };
            return [
                "M", xStart, yStart,
                "L", m[direction][0], m[direction][1]
            ]
        }

        function calculateMaxScaleY (){
            var maxVal = values.reduce(function (previousNum, currentNum) {
                return (previousNum < currentNum) ? currentNum : previousNum;
            }, 0);
            return (((maxVal + 10) / 10) >> 0) * 10
        }

        function createScale (maxScale) {
            var arr = [];
            while (maxScale >= 0) {
                arr.push(maxScale);
                maxScale -= 10;
            }
            return arr.reverse();
        }

        function drawAxis() {
            paper.path(makeLinePath('h', x0, y0)).attr(axisParams);
            paper.path(makeLinePath('v', x0, y0)).attr(axisParams);
        }
        function drawDivisions (maxScaleY) {
            console.log(maxScaleY);
            var numOfDivisions = 3,
                numOfSubs = 5,
                i, j;
            for (i = 1; i <= numOfDivisions; i++){
                var y = screenH - screenH/numOfDivisions*i;
                paper.path(makeLinePath('h', x0, y)).attr(lineParams);
                paper.text(x0 - 15, y, ''+maxScaleY/numOfDivisions*i+'%');
                for (j = 1; j < numOfSubs; j++){
                    paper.path(makeLinePath('h', x0, y + screenH/numOfDivisions/numOfSubs*j)).attr(lineParams);
                }
            }
        }

    }

    /* draw bar chart */
    function Bar (value, opt){
        this.val = value;
        this.x = opt.x;
        this.y = opt.y;
        this.w = opt.w || 20;

        this.parts = [];

        this.onMouseOver = function(){};

        if (typeof opt.onMouseOver == 'function'){
            this.onMouseOver = opt.onMouseOver
        }
        return this;
    }
    Bar.prototype.createPath = function (type, params) {
        var types = {
                top: top,
                side: side
            };
        if (typeof types[type] == "function"){
            return types[type].apply(this, params);
        }
        function top(x, y, w) {
            var size3d = o.size3d;
            return ["M", x, y, "L", x + size3d, y - size3d, "L", x + w + size3d, y - size3d, "L", x + w, y, "z"].join(",");
        }
        function side(x, y, w, h) {
            var size3d = o.size3d;
            return ["M", x + w + size3d, y - size3d, "L", x + w + size3d, y + h - size3d, "L", x + w, y + h, "L", x + w, y, "z"].join(",");
        }
    };
    Bar.prototype.drawRect = function(x, y, w, h, params){
        var pms = params || {};
        return paper.rect(x, y, w, h).attr(pms)
    };
    Bar.prototype.drawPart = function (path, params) {
        return paper.path(path).attr(params);
    };
    Bar.prototype.drawBar = function (){
        var x0 = this.x,
            y0 = this.y,
            w = this.w,
            value = this.val;
        if (o.is3d){
            x0 = this.x + o.size3d;
            y0 = this.y + o.size3d;
            var top = this.createPath('top', [x0, y0 - value, w, value]);
            var side = this.createPath('side', [x0, y0 - value, w, value]);
            var topPart = this.drawPart(top, parameters);
            var sidePart = this.drawPart(side, parameters);
            this.drawPart(this.createPath('top', [0 + 20, screenH + o.size3d, screenW, o.size3d]), {
                stroke: "#ccd4e0",
                "stroke-width": 0.5,
                fill: "#ccd4e0"
            }).toBack();
        }

        var frontPart = this.drawRect(x0, y0 - value, w, value, parameters);
        this.parts.push(frontPart)/*.push(topPart).push(sidePart)*/;
    };
    Bar.prototype.addEvents = function (num) {
        this.parts[0]
            .mouseover(function (e) {
                showTooltip(e, num);
            })
            .mouseout(function (e) {
                hideTooltip(e);
            })
            .click(function (e) {
                o.onSectorClicked(e, num);
            });
    };
    drawBars(x0, y0, screenW, screenH, values);
    function drawBars(x, y, w, h, vals ) {
        var x0 = x,
            y0 = y,
            canvasW = w,
            canvasH = h,
            delta = 15,
            i,
            l = values.length;
        var barWidth = 20;
        var hScale = getCanvasMaxScale();
        var opt = {
                x: x0,
                y: y0
            };

        for (i = 0; i<l; i++){
            var value = h/hScale*values[i];
            parameters.fill = o.colors[i];
            var bar = new Bar(value, opt);
            opt.x += delta + barWidth;
            bar.drawBar();
            bar.addEvents(i);
        }
    }

    //tooltip
    function showTooltip(e, num){
        var tooltip = createTooltip(),
            innerText = o.labels[num];
        tooltip.style.display = 'block';
        tooltip.innerHTML = innerText;
        calculatePosition();
    }
    function hideTooltip(e){
        var tooltip = document.getElementById('tooltip');
        tooltip.style.display = 'none';
    }
    function createTooltip(){
        var tooltip;
        if(document.getElementById('tooltip')){
            tooltip = document.getElementById('tooltip')
        }else {
            tooltip = document.createElement("div");
            tooltip.id = "tooltip";
            paper.el.appendChild(tooltip);
        }
        return tooltip
    }
    function calculatePosition() {

    }


    function getCanvasMaxScale(){
        return paper.stngs.scaleY;
    }


};
