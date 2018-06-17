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

    var start = new Date().getTime();
    var anomalyList = tarzan(app.treeBuilderX.sTree, app.treeBuilderR.sTree);
    var end = new Date().getTime();
    console.log(end - start);

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

    applyDefaultData(app);

    app.applyConvertAll();

    $("#applyConvert").click(app.applyConvertAll);
    $("#applyTree").click(app.buildTrees);
    $("#clearLog").click(app.applyClearLog);
});

var app = new App();