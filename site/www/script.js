document.addEventListener('DOMContentLoaded', function(){
    var vls = [20, 10, 50, 10, 10],
        colors = ['#b1238d', '#c71057', '#fc7b06', '#ffc200', '#41baea'],
        labels = ['tooltip1', 'tooltip2', 'tooltip3', 'tooltip4', 'tooltip5'],
        options = {
            padding: 30,
            is3d: true,
            colors: colors,
            labels: labels,
            legendText: [],
            legendColors: [],
            onSectorClicked: function (e, n) {
                console.log("sector " + n + " is clicked");
            }
        };

    var container = document.getElementById("chart-holder"),
        papers = container.querySelectorAll(".paper"),
        i;

    for (i=0; papers[i]; i++){
        var elem = papers[i],
            canvasWidth = elem.clientWidth,
            canvasHeight = elem.clientHeight;

        var chart = Raphael(elem, canvasWidth, canvasHeight);
        //chart.bar(vls, options);
        chart.pie(vls, options);
    }




});

