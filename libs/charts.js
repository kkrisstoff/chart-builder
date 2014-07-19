
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

Raphael.fn.bar = function (w, h, values, colors, opt) {
    var paper = this;

    var scaleWidth = w - 40,
        scaleHeight = h - 40;
    drawScale(scaleWidth, scaleHeight, values);



    function drawScale (w, h, values) {
        var o = [30, 20];

        var x0 = 0 + o[0],
            y0 = h + o[1];

        var params = {
            stroke: "#ccd4e0",
            "stroke-width": 0.5
        };

        paper.path(makeLinePath('h', x0, y0));
        paper.path(makeLinePath('w', x0, y0));

        var maxScaleY = calculateMaxScaleY(),
            scale = createScale(maxScaleY);
        console.log(maxScaleY);
        console.log(scale);

        drawDivisions(maxScaleY);


        function makeLinePath(direction, xStart, yStart) {
            var m = {
                'h': [w - xStart, yStart],
                'w': [xStart, h -yStart]
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

        function drawDivisions (maxScaleY) {
            var numOfDivisions = 2,
                numOfSubs = 5,
                i, j;
            for (i = 1; i <= numOfDivisions; i++){
                paper.path(makeLinePath('h', x0, y0 - h/numOfDivisions*i)).attr(params);
                paper.text(x0 - 15, y0 - h/numOfDivisions*i, ''+maxScaleY/numOfDivisions*i+'%');
            }
            for (i = 1; i <= numOfSubs*numOfDivisions; i++){
                paper.path(makeLinePath('h', x0, y0 - h/numOfDivisions/numOfSubs*i)).attr(params);
            }
            //TODO: create a divs builder
            /*for (i = 1; i <= numOfDivisions; i++){
                paper.path(makeLinePath('h', x0, y0 - h/numOfDivisions*i));
                paper.text(x0 - 15, y0 - h/numOfDivisions*i, ''+maxScaleY/numOfDivisions*i+'%');
                for (j = 1; j <= numOfSubs; j++) {
                    paper.path(makeLinePath('h', x0, h/numOfDivisions*i + h/numOfDivisions/numOfSubs*j));
                }
            }*/
        }

        function drawShadow () {

        }

    }
};