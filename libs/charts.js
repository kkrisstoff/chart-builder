
Raphael.fn.pie = function (w, h, values, colors, opt) {
    var paper = this,
        rad = Math.PI / 180,
        chart = paper.set();

    var cX = w/2,
        cY = h/ 2,
        r1 = 80,
        r2 = opt.is3D ? 50 : r1,
        z = 30;

    var totalValue = countTotalValue(),
        angle = 0,
        start = 0;

    function countTotalValue(){
        var i,
            l = values.length,
            val = 0;
        for (i = 0; i < l; i ++){
            val += values[i];
        }
        return val || false;
    }

    function drawChart() {
        if (!totalValue) {
            console.log("your values is empty: (" + values.join(',') + ")");
            return false;
        }
        var xEnd,
            yEnd,
            rEnd;
        var path = buildSectorPath();

        for (var i = 0, l = values.length; i < l; i++){
            sector(i);
        }
    }
    function sector(i) {
        var val = values[i],
            color = colors[i],
            thisAngle = 360*val / totalValue,
            currentAngle = angle + thisAngle,
        //color = Raphael.hsb(0.1, .75, 1),
            param = {fill: color, stroke: "none", "stroke-width": 3};

        var s = drawSector(cX, cY, r1, r2, angle, currentAngle, param);
        var s1 = drawSector(cX, cY - z, r1, r2, angle, currentAngle, param);
        s.toBack();
        angle = currentAngle;
    }

    function buildSectorPath(x1, y1, x2, y2){
        //cX, cY, r1, r2, angle, currentAngle
        return ["M", cX, cY, "L", x1, y1, "A",  ]
    }

    drawChart();

    function drawSector(cx, cy, r, r2, startAngle, endAngle, params) {
        var x1 = cx + r * Math.cos(-startAngle * rad),
            x2 = cx + r2 * Math.cos(-endAngle * rad),
            y1 = cy + r * Math.sin(-startAngle * rad),
            y2 = cy + r2 * Math.sin(-endAngle * rad);
        return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r2, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    }

    function createPath(startX, startY) {
        return ["M", startX, startY,
            "L", cX, cY,
            "L", cX, cY + z,
            "L", startX, startY + z, "z"].join(",");
    }

};

Raphael.fn.bar = function (/*w, h, */values, colors, options) {
    console.log(this);
    var paper = this,
        opt = options || {};

    var o = {
        padding: opt.padding || 0
    };

    var w = this.width,
        h = this.height,
        x0 = o.padding,
        y0 = h - o.padding,
        screenW = w - x0,
        screenH = y0,
        size3d = 10;

    var parameters = {
        stroke: "#000",
        "stroke-width": 0.5,
        fill: colors[1]
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

        drawAxis();
        drawDivisions(maxScaleY);
        drawShadow();

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

        function drawShadow () {
            drawSide(createTopPath(0 + 20, screenH + 30, screenW, 10), shadowParams)
        }

    }

    /* draw bar */
    drawBars();
    function drawBars() {
        var delta = 10,
            i,
            l = values.length;
        var barWidth = 20;
        for (i = 0; i<l; i++){
            drawBar(x0 + delta, y0, barWidth, values[i]);
            delta += (10 + barWidth);
        }
    }

    function drawBar (x0, y0, w, value){
        drawRect(x0, y0 - value, w, value, parameters);
        var top = createTopPath(x0, y0 - value, w, value);
        var side = createSidePath(x0, y0 - value, w, value);
        drawSide(top, parameters);
        drawSide(side, parameters);
    }

    function createTopPath(x, y, w, h) {
        return ["M", x, y, "L", x + size3d, y - size3d, "L", x + w + size3d, y - size3d, "L", x + w, y, "z"].join(",");
    }
    function createSidePath(x, y, w, h) {
        return ["M", x + w + size3d, y - size3d, "L", x + w + size3d, y + h - size3d, "L", x + w, y + h, "L", x + w, y, "z"].join(",");
    }
    function drawRect (x, y, w, h, params){
        var pms = params || {};
        return paper.rect(x, y, w, h).attr(pms)
    }
    function drawSide(path, params) {
        return paper.path(path).attr(params);
    }

};