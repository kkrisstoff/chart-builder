document.addEventListener('DOMContentLoaded', function(){

    var elem = document.getElementById("paper");
    //getDataFromJSON();

    var canvasWidth = elem.clientWidth,
        canvasHeight = elem.clientHeight;

    var chart = Raphael(elem, canvasWidth, canvasHeight);
    //chart.bar(vls, options);
    chart.bar(vls, options);


    var select = document.getElementById("chartType");
    select.addEventListener("change", function (e) {
        onSelectChanged(e, chart);
    });

});
    var vls = [20, 10, 50, 10, 10],
        colors = ['#b1238d', '#c71057', '#fc7b06', '#ffc200', '#41baea'],
        labels = ['tooltip1', 'tooltip2', 'tooltip3', 'tooltip4', 'tooltip5'],
        options = {
            padding: 30,
            is3d: false,
            colors: colors,
            labels: labels,
            legendText: [],
            legendColors: [],
            horizontal: false,
            onSectorClicked: function (e, n) {
                 console.log("sector " + n + " is clicked");
            }
        };


function getDataFromJSON() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4){
            console.log(request.response);
            return request.response;
        }
    };
    request.open("GET", "data/charts_data.json", true);
    request.send();
}

function onSelectChanged(e, chart) {
    var target = e.currentTarget,
        option = findSelectedOption(target);
    chart.clear();
    switch(option.value) {
        case "pie":
            chart.pie(vls, options);
            break;
        case "bar":
            chart.bar(vls, options);
            break;
        default: break;
    }
}

function findSelectedOption(select) {
    var options = select.options,
        i;
    if (options && options.length){
        for (i = 0; options[i]; i++){
            if (options[i].selected) {
                return options[i];
            }
        }
    } else {
        return false;
    }
}

