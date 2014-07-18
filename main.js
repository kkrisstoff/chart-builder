
window.onload=function(){
    var elem = document.getElementById("paper");
    console.log(elem);

    var vls = [20, 10, 50, 10, 10],
        colors = ['#b1238d', '#c71057', '#fc7b06', '#ffc200', '#41baea'],
        options = {
            is3D: true
        };

    var canvasWidth = elem.clientWidth,
        canvasHeight = elem.clientHeight;

    var chart = Raphael(elem, canvasWidth, canvasHeight);
    chart.bar(canvasWidth, canvasHeight, vls, colors, options)
};



