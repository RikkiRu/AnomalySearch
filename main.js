var $ = $;
var Dygraph = Dygraph;

function App()
{
    this.elemForGetSize = null;
    this.graphConvertDataSourceX = null;
    this.graphConvertDataSourceR = null;
    this.wordsX = null;
    this.wordsR = null;
    this.symbolsData = [];
    this.minMax = null;
    this.symbolStep = 0;
    this.samplingInterval = 0;
    this.symbolsCount = 0;
    this.SuffixtreeJS = null;
    this.treeBuilderX = null;
    this.treeBuilderR = null;
    this.usingSymbolsCount = null;
    this.discretizingTextAreaX = null;
    this.discretizingTextAreaR = null;
    this.usingSamplingInterval = null;
    this.tarzanHistory = null;
    this.maxTarzanSequenceLength = null;
    this.minTarzanSequenceLength = null;
    this.clearLog = null;
    this.maxTarzanError = null;
    this.graphResults = null;
    this.anomalyArrayX = [0];
}

App.prototype.getContentSize = function()
{
    var elem = app.elemForGetSize;
    return { width: elem.clientWidth, height: elem.clientHeight };
}

App.prototype.arrayToDygraph = function(sourceArray1, sourceArray2)
{
    var graphArray = [];
    for (var i=0; i<sourceArray1.length; i++)
    {
        if (sourceArray2 == null)
            graphArray.push([i, sourceArray1[i]]);
        else
            graphArray.push([i, sourceArray1[i], sourceArray2[i]]);
    }
    return graphArray;
}

App.prototype.extrudeArray = function(arr, step)
{
    var a = [];

    for (var i=0; i<arr.length; i++)
    {
        for (var j=0; j<step; j++)
            a.push(arr[i]);
    }

    return a;
}

App.prototype.sampleArray = function(arr, step)
{
    var sampledArray = [];
    var currentSample = 0;
    var temp = 0;

    for (var i=0; i<arr.length; i++)
    {
        temp += arr[i];

        currentSample++;
        if (currentSample >= step || i == arr.length - 1)
        {
            temp = temp / currentSample;
            currentSample = 0;
            sampledArray.push(temp);
            temp = 0;
        }
    }

    return sampledArray;
}

App.prototype.drawGraph = function(graph, arr, title, anomalyList)
{
    var labels = [ "x", "y" ];

    if (arr[0].length === 3)
        labels = [ "x", "y1", "y2" ];

    new Dygraph(
        graph,
        arr,
        {
            stackedGraph: false,
            showRangeSelector: true,
            labels: labels,
            title: title,

            underlayCallback: function(canvas, area, g) 
            {
                for (var i=0; i<anomalyList.length; i++)
                {
                    var a = anomalyList[i];
                    var bottom_left = g.toDomCoords(a.start, -20);
                    var top_right = g.toDomCoords(a.start + a.length, +20);
      
                    var left = bottom_left[0];
                    var right = top_right[0];
      
                    canvas.fillStyle = "#F5A9A9";
                    canvas.fillRect(left, area.y, right - left, area.h);
                }
            }
        }
    );
}

App.prototype.getMinMaxValues = function(arr)
{
    var res = {};
    res.min = arr[0];
    res.max = arr[0];

    for (var i=0; i<arr.length; i++)
    {
        var v = arr[i];

        if (v < res.min)
            res.min = v;

        if (v > res.max)
            res.max = v;
    }

    return res;
}


App.prototype.generateSymbolsData = function(minMax, symbolStep)
{
    var symbolsData = [];
    var symbol = 0;

    for (var i=minMax.min; i<minMax.max; i+=symbolStep)
    {
        var data = {};
        data.minBorder = i;
        data.maxBorder = i + symbolStep;
        data.symbol = String.fromCharCode(65 + symbol);
        data.average = (data.maxBorder + data.minBorder) / 2;
        symbolsData.push(data);

        symbol++;
    }

    return symbolsData;
}

App.prototype.applyConvert = function(sourceArray, sampledArray, graph, title, putTo)
{
    var symbols = "";
    var symbolsValues = [];

    for (var i=0; i<sampledArray.length; i++)
    {
        var v = sampledArray[i];
        var j = Math.floor((v - app.minMax.min) / app.symbolStep);

        if (j < 0)
            j = 0;

        if (j >= app.symbolsData.length)
            j = app.symbolsData.length - 1;

        var sData = app.symbolsData[j];

        if (v >= sData.minBorder && v <= sData.maxBorder)
        {
            symbols += sData.symbol.toString();
            symbolsValues.push(sData.average);
        }
        else
            throw new Error("Not found symbol for value: " + v + " data: " + JSON.stringify(app.symbolsData));
    }

    putTo.value = symbols;

    var sampledExtrudedArray = this.extrudeArray(symbolsValues, app.samplingInterval);   
    var graphArray = this.arrayToDygraph(sourceArray, sampledExtrudedArray);

    app.log("Построение графика: " + title);
    this.drawGraph(graph, graphArray, title, []);
}

App.prototype.applyClearLog = function()
{
    app.tarzanHistory.innerHTML = "";
}

App.prototype.log = function(str)
{
    if (str === "")
    {
        app.tarzanHistory.innerHTML += "<br>";
        return;
    }

    var now = new Date();
    app.tarzanHistory.innerHTML += 
        (now.getMinutes() + ":" + now.getSeconds()) + " " + str + "<br>";
}

App.prototype.applyConvertAll = function()
{
    app.applyClearLog();
    app.log("<b>Запущено конвертирование в символьные ряды<b>");

    var strSymCount = app.usingSymbolsCount.value;
    var symbolsCount = parseInt(strSymCount);

    if (isNaN(symbolsCount) || symbolsCount < 2 || symbolsCount > 26)
    {
        var msg = "Ошибка в кол-ве используемых символов. Ожидается число от 2 до 27";
        app.log(msg);
        alert(msg);
        return;
    }

    var strSamplingInterval = app.usingSamplingInterval.value;
    var samplingInterval = parseInt(strSamplingInterval);

    if (isNaN(samplingInterval) || samplingInterval < 1)
    {
        var msg = "Ошибка в интервале дискретизации. Ожидается число от 1";
        app.log(msg);
        alert();
        return;
    }

    app.symbolsCount = symbolsCount;
    app.samplingInterval = samplingInterval;

    var arrX = JSON.parse(app.discretizingTextAreaX.value);
    var arrR = JSON.parse(app.discretizingTextAreaR.value);

    app.anomalyArrayX = arrX;

    var sampledX = app.sampleArray(arrX, app.samplingInterval);
    var sampledR = app.sampleArray(arrR, app.samplingInterval);

    var minMax = app.getMinMaxValues(sampledX);
    var minMaxR = app.getMinMaxValues(sampledR);

    if (minMaxR.min < minMax.min)
        minMax.min = minMaxR.min;

    if (minMaxR.max > minMax.max)
        minMax.max = minMaxR.max;

    var minMaxInterval = minMax.max - minMax.min;
    var symbolStep = minMaxInterval / (app.symbolsCount - 1);

    app.log("Мин. знач: " + minMax.min);
    app.log("Макс. знач: " + minMax.max);
    app.log("Шаг на 1 символ: " + symbolStep);

    app.symbolsData = app.generateSymbolsData(minMax, symbolStep);
    app.minMax = minMax;
    app.symbolStep = symbolStep;

    app.applyConvert(
        arrX, sampledX, app.graphConvertDataSourceX, "График X", app.wordsX);
    app.applyConvert(
        arrR, sampledR, app.graphConvertDataSourceR, "График R", app.wordsR);

    app.buildTrees();
}

App.prototype.buildTrees = function()
{
    app.log("<b>Построение деревьев<b>");
    app.treeBuilderX.buildTree();
    app.treeBuilderR.buildTree();
    var anomalyList = tarzan(app.treeBuilderX.sTree, app.treeBuilderR.sTree);
    
    for(var i=0; i<anomalyList.length; i++)
    {
        var a = anomalyList[i];
        a.start *= app.samplingInterval;
    }

    var graphArray = this.arrayToDygraph(app.anomalyArrayX);
    this.drawGraph(app.graphResults, graphArray, "Найденные аномалии", anomalyList);
}

App.prototype.resizeGraph = function(htmlElement)
{
    htmlElement.style.width = app.getContentSize().width * 0.9 + "px";
    htmlElement.style.height = app.getContentSize().height * 0.5 + "px";
}

$(document).ready(function() 
{
    app.usingSymbolsCount = document.getElementById("usingSymbolsCount");
    app.discretizingTextAreaX = document.getElementById("discretizingTextAreaX");
    app.discretizingTextAreaR = document.getElementById("discretizingTextAreaR");
    app.usingSamplingInterval = document.getElementById("usingSamplingInterval");
    app.elemForGetSize = document.getElementById('Discretizing');
    app.graphConvertDataSourceX = document.getElementById("graphConvertDataSourceX");
    app.graphConvertDataSourceR = document.getElementById("graphConvertDataSourceR");
    app.wordsX = document.getElementById("wordsX");
    app.wordsR = document.getElementById("wordsR");
    app.tarzanHistory = document.getElementById("tarzanHistory");
    app.maxTarzanSequenceLength = document.getElementById("maxTarzanSequenceLength");
    app.minTarzanSequenceLength = document.getElementById("minTarzanSequenceLength");
    app.clearLog = document.getElementById("clearLog");
    app.maxTarzanError = document.getElementById("maxTarzanError");
    app.graphResults = document.getElementById("graphResults");

    document.getElementById("DiscretizingButton").className += " active";

	var dataX =
	{
		outputID: "#suffixTreeX",
		wordsID: "#wordsX",
		errorID: "#errorWordsX"
	}

	var dataR =
	{
		outputID: "#suffixTreeR",
		wordsID: "#wordsR",
		errorID: "#errorWordsR"
	}

    app.treeBuilderX = app.SuffixtreeJS(dataX);
    app.treeBuilderR = app.SuffixtreeJS(dataR);

    app.resizeGraph(app.graphConvertDataSourceX);
    app.resizeGraph(app.graphConvertDataSourceR);
    app.resizeGraph(app.graphResults);

    app.discretizingTextAreaX.value=
    "[" +
    "0.42,0.89,0.93,0.96,0.99,1.00,1.00,0.99,0.97,0.95,0.91,0.86,0.81,0.75,0.68,0.60,0.52,0.43,0.33,0.24,0.14,0.04,-0.06,-0.16,-0.26,-0.35,-0.44,-0.53,-0.61,-0.69,-0.76,-0.82,-0.87,-0.92,-0.95,-0.98,-0.99,-1.00,-1.00,-0.98,-0.96,-0.93,-0.88,-0.83,-0.77,-0.71,-0.63,-0.55,-0.46,-0.37,-0.28,-0.18,-0.08,0.02,0.12,0.22,0.31,0.40,0.49,0.58,0.66,0.73,0.79,0.85,0.90,0.94,0.97,0.99,1.00,1.00,0.99,0.97,0.94,0.90,0.85,0.80,0.73,0.66,0.58,0.50,0.41,0.32,0.22,0.12,0.02,-0.08,-0.17,-0.27,-0.37,-0.46,-0.54,-0.63,-0.70,-0.77,-0.83,-0.88,-0.92,-0.96,-0.98,-1.00,-1.00,-0.99,-0.98,-0.95,-0.92,-0.88,-0.82,-0.76,-0.69,-0.62,-0.54,-0.45,-0.36,-0.26,-0.17,-0.13,0.07,0.27,0.46,0.65,0.84,1.02,1.18,1.34,1.48,1.61,1.72,1.81,1.89,1.94,1.98,2.00,2.00,1.97,1.93,1.87,1.79,1.69,1.58,1.45,0.65,0.57,0.49,0.40,0.30,0.21,0.11,0.01,-0.09,-0.19,-0.29,-0.38,-0.47,-0.56,-0.64,-0.71,-0.78,-0.84,-0.89,-0.93,-0.96,-0.98,-1.00,-1.00,-0.99,-0.98,-0.95,-0.91,-0.87,-0.81,-0.75,-0.68,-0.60,-0.52,-0.43,-0.34,-0.25,-0.15,-0.05,0.05,0.15,0.25,0.34,0.44,0.52,0.61,0.68,0.75,0.81,0.87,0.91,0.95,0.98,0.99,1.00,1.00,0.98,0.96,0.93,0.89,0.84,0.78,0.71,0.64,0.56,0.47,0.38,0.29,0.19,0.09,-0.01,-0.11,-0.21,-0.30,-0.40,-0.49,-0.57,-0.65,-0.72,-0.79,-0.85,-0.90,-0.94,-0.97,-0.99,-1.00,-1.00,-0.99,-0.97,-0.94,-0.91,-0.86,-0.80,-0.74,-0.67,-0.59,-0.51,-0.42,-0.33,-0.23,-0.13,-0.03,0.07,0.17,0.26,0.36,0.45,0.54,0.62,0.69,0.76,0.82,0.88,0.92,0.95,0.98,0.99,1.00,1.00,0.98,0.96,0.92,0.88,0.83"
    + "]";

    app.discretizingTextAreaR.value=
    "[" +
    "0.42,0.89,0.93,0.96,0.99,1.00,1.00,0.99,0.97,0.95,0.91,0.86,0.81,0.75,0.68,0.60,0.52,0.43,0.33,0.24,0.14,0.04,-0.06,-0.16,-0.26,-0.35,-0.44,-0.53,-0.61,-0.69,-0.76,-0.82,-0.87,-0.92,-0.95,-0.98,-0.99,-1.00,-1.00,-0.98,-0.96,-0.93,-0.88,-0.83,-0.77,-0.71,-0.63,-0.55,-0.46,-0.37,-0.28,-0.18,-0.08,0.02,0.12,0.22,0.31,0.40,0.49,0.58,0.66,0.73,0.79,0.85,0.90,0.94,0.97,0.99,1.00,1.00,0.99,0.97,0.94,0.90,0.85,0.80,0.73,0.66,0.58,0.50,0.41,0.32,0.22,0.12,0.02,-0.08,-0.17,-0.27,-0.37,-0.46,-0.54,-0.63,-0.70,-0.77,-0.83,-0.88,-0.92,-0.96,-0.98,-1.00,-1.00,-0.99,-0.98,-0.95,-0.92,-0.88,-0.82,-0.76,-0.69,-0.62,-0.54,-0.45,-0.36,-0.26,-0.17,-0.07,0.03,0.13,0.23,0.33,0.42,0.51,0.59,0.67,0.74,0.80,0.86,0.91,0.94,0.97,0.99,1.00,1.00,0.99,0.97,0.93,0.89,0.85,0.79,0.72,0.65,0.57,0.49,0.40,0.30,0.21,0.11,0.01,-0.09,-0.19,-0.29,-0.38,-0.47,-0.56,-0.64,-0.71,-0.78,-0.84,-0.89,-0.93,-0.96,-0.98,-1.00,-1.00,-0.99,-0.98,-0.95,-0.91,-0.87,-0.81,-0.75,-0.68,-0.60,-0.52,-0.43,-0.34,-0.25,-0.15,-0.05,0.05,0.15,0.25,0.34,0.44,0.52,0.61,0.68,0.75,0.81,0.87,0.91,0.95,0.98,0.99,1.00,1.00,0.98,0.96,0.93,0.89,0.84,0.78,0.71,0.64,0.56,0.47,0.38,0.29,0.19,0.09,-0.01,-0.11,-0.21,-0.30,-0.40,-0.49,-0.57,-0.65,-0.72,-0.79,-0.85,-0.90,-0.94,-0.97,-0.99,-1.00,-1.00,-0.99,-0.97,-0.94,-0.91,-0.86,-0.80,-0.74,-0.67,-0.59,-0.51,-0.42,-0.33,-0.23,-0.13,-0.03,0.07,0.17,0.26,0.36,0.45,0.54,0.62,0.69,0.76,0.82,0.88,0.92,0.95,0.98,0.99,1.00,1.00,0.98,0.96,0.92,0.88,0.83"
    + "]";

    app.usingSymbolsCount.value = "15";
    app.usingSamplingInterval.value = "4";

    app.applyConvertAll();

    $("#applyConvert").click(app.applyConvertAll);
    $("#applyTree").click(app.buildTrees);
    $("#clearLog").click(app.applyClearLog);
});

var app = new App();