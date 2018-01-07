document.app = new App();

function App()
{
}

App.prototype.getContentSize = function()
{
    var elem = document.getElementById('Discretizing');
    return { width: elem.clientWidth, height: elem.clientHeight };
}

App.prototype.arrayToDygraph = function(sourceArray)
{
    var graphArray = [];
    for(var i=0; i<sourceArray.length; i++)
    {
        graphArray.push([i, sourceArray[i]]);
    }
    return graphArray;
}

App.prototype.applyConvert = function()
{
    var app = document.app;
    var convertGraph = document.getElementById("convertDataSource");

    var sourceArray = JSON.parse(document.getElementById("discretizingTextArea").value);
    var graphArray = app.arrayToDygraph(sourceArray);

    new Dygraph(
        convertGraph,
        graphArray,
        {
          showRangeSelector: true,
          labels: [ "x", "y" ],
          title: "Исходные данные"
        }
    );
}

$(document).ready(function () 
{
    var app = document.app;
    document.getElementById("DiscretizingButton").className += " active";
    document.app.SuffixtreeJS();

    var convertGraph = document.getElementById("convertDataSource");
    convertGraph.style.width = app.getContentSize().width * 0.9 + "px";
    convertGraph.style.height = app.getContentSize().height * 0.5 + "px";

    document.getElementById("discretizingTextArea").value="[" +
    "0.88,0.95,1.02,0.98,0.76,0.53,0.28,0.02,-0.32,-0.57,-0.80,-0.85,-0.92,-0.93,-0.84,-0.65,-0.49,-0.19,0.18,0.40,0.71,0.92,0.92,1.02,0.98,0.86,0.60,0.31,0.09,-0.34,-0.54,-0.78,-0.89,-0.96,-1.03,-0.86,-0.75,-0.40,-0.19,0.20,0.36,0.71,0.92,0.91,1.01,0.96,0.81,0.56,0.32,0.01,-0.28,-0.55,-0.84,-0.99,-0.97,-0.97,-0.81,-0.64,-0.45,-0.10,0.11,0.49,0.68,0.85,1.05,0.96,0.90,0.77,0.57,0.26,-0.01,-0.23,-0.58,-0.73,-0.89,-0.97,-1.04,-0.85,-0.68,-0.46,-0.12,0.10,0.52,0.65,0.94,1.02,0.97,0.94,0.72,0.61,0.29,-0.03,-0.29,-0.65,-0.95,-0.83,-0.52,-0.37,-0.02,0.21,0.55,0.76,0.98,1.01,0.95,0.92,0.73,0.50,0.18,-0.12,-0.37,-0.70,-0.89,-0.94,-0.54,-0.78,-1.02,-1.06,-1.02,-0.84,-0.70,-0.38,-0.17,0.23,0.46,0.78,0.88,0.91,1.03,0.88,0.72,0.59,0.24,-0.03,-0.36,-0.55,-0.87,-0.92,-0.95,-0.97,-0.89,-0.67,-0.42,-0.08,0.16,0.46,0.80,0.92,1.00,1.05,0.90,0.71,0.49,0.16,-0.10,-0.38,-0.69,-0.76,-0.95,-0.95,-0.90,-0.78,-0.57,-0.37,-0.10,0.22,0.49,0.80,0.95,0.95,1.00,0.94,0.73,0.48,0.20,-0.04,-0.37,-0.58,-0.81,-0.92,-0.96,-1.00,-0.88,-0.53,-0.27,-0.08,0.29,0.54,0.78,0.88,1.06,1.01,0.92,0.67,0.54,0.26,-0.10,-0.36,-0.65,-0.83,-1.02,-0.97,-0.94,-0.74,-0.63,-0.39,-0.07,0.24,0.48,0.77,0.87,1.04,1.00,0.90,0.67,0.40,0.18,-0.13,-0.40,-0.64,-0.80,-1.00,-1.03,-0.93,-0.83,-0.54,-0.27,0.00,0.22,0.57,0.79,0.89,1.00,0.92,0.86,0.71,0.44,0.20,-0.09,-0.39,-0.64,-0.84,-0.94,-1.00,-0.93,-0.72,-0.58,-0.27,-0.04,0.35,0.54,0.77,0.92,0.98,0.95,0.79,0.68,0.50,0.10,-0.13,-0.48,-0.74,-0.93,-1.01"
    + "]";
    app.applyConvert();
    $("#applyConvert").click(document.app.applyConvert);
});