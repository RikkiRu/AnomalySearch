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

App.prototype.drawGraph = function(graph, arr, title)
{
    var labels = [ "x", "y" ];

    if (arr[0].length === 3)
        labels = [ "x", "y1", "y2" ];

    new Dygraph(
        graph,
        arr,
        {
          showRangeSelector: true,
          labels: labels,
          title: title
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
    this.drawGraph(graph, graphArray, title);
}

App.prototype.applyConvertAll = function()
{
    var strSymCount = app.usingSymbolsCount.value;
    var symbolsCount = parseInt(strSymCount);

    if (isNaN(symbolsCount) || symbolsCount < 2 || symbolsCount > 26)
    {
        alert("Ошибка в кол-ве используемых символов. Ожидается число от 2 до 27");
        return;
    }

    var strSamplingInterval = app.usingSamplingInterval.value;
    var samplingInterval = parseInt(strSamplingInterval);

    if (isNaN(samplingInterval) || samplingInterval < 1)
    {
        alert("Ошибка в интервале дискретизации. Ожидается число от 1");
        return;
    }

    app.symbolsCount = symbolsCount;
    app.samplingInterval = samplingInterval;

    var arrX = JSON.parse(app.discretizingTextAreaX.value);
    var arrR = JSON.parse(app.discretizingTextAreaR.value);

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
    app.treeBuilderX.buildTree();
    app.treeBuilderR.buildTree();

    //var node = app.treeBuilderX.sTree.searchNode("bc");
    //console.log(node);
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

    app.discretizingTextAreaX.value=
    "[" +
    "0.90,1.02,1.03,0.90,0.85,0.59,0.36,0.02,-0.19,-0.60,-0.71,-0.92,-1.07,-1.04,-0.82,-0.76,-0.51,-0.22,0.18,0.35,0.59,0.90,0.89,1.01,0.90,0.84,0.62,0.37,0.08,-0.27,-0.54,-0.76,-0.86,-1.04,-0.97,-0.86,-0.70,-0.42,-0.18,0.10,0.41,0.71,0.89,0.99,0.94,0.96,0.82,0.59,0.36,0.02,-0.22,-0.61,-0.73,-0.92,-1.04,-0.91,-0.80,-0.71,-0.38,-0.09,0.10,0.48,0.68,0.80,1.01,0.94,0.87,0.80,0.58,0.24,-0.06,-0.27,-0.64,-0.74,-0.94,-0.95,-1.03,-0.83,-0.73,-0.39,-0.10,0.15,0.40,0.64,0.86,0.91,1.02,0.94,0.77,0.55,0.21,-0.07,-0.39,-0.60,-0.75,-0.92,-0.98,-0.94,-0.89,-0.70,-0.36,-0.18,0.23,0.45,0.67,0.89,1.05,0.93,0.88,0.71,0.46,0.24,-0.07,-0.28,-0.63,-0.74,-0.99,-1.04,-0.99,-0.87,-0.62,-0.34,-0.17,0.14,0.42,0.70,0.87,1.03,1.01,0.96,0.67,0.57,0.26,0.01,-0.34,-0.55,-0.86,-0.92,-0.94,-0.88,-0.81,-0.57,-0.37,-0.03,0.16,0.57,0.71,0.85,0.94,0.99,0.85,0.78,0.46,0.21,-0.07,-0.30,-0.57,-0.80,-0.93,-0.96,-0.91,-0.86,-0.55,-0.32,0.01,0.18,0.53,0.79,0.83,0.96,0.96,0.88,0.74,0.49,0.23,-0.10,-0.35,-0.60,-0.77,-0.96,-0.93,-1.00,-0.77,-0.54,-0.40,-0.04,0.31,0.59,0.73,0.95,1.06,0.94,0.82,0.66,0.54,0.19,-0.10,-0.37,-0.60,-0.79,-0.97,-0.99,-0.98,-0.73,-0.67,-0.26,-0.07,0.33,0.59,0.78,0.86,1.01,0.98,0.88,0.72,0.38,0.13,-0.15,-0.48,-0.66,-0.89,-0.95,-1.00,-0.88,-0.77,-0.50,-0.35,0.01,0.32,0.53,0.77,0.98,1.06,0.97,0.80,0.75,0.38,0.20,-0.14,-0.46,-0.66,-0.92,-1.03,-1.01,-0.98,-0.76,-0.50,-0.28,0.02,0.24,0.55,0.80,0.91,0.96,1.00,0.85,0.69,0.37,0.15,-0.18,-0.42,-0.64,-0.81,-0.92"
    + "]";

    app.discretizingTextAreaR.value=
    "[" +
    "0.88,0.95,1.02,0.98,0.76,0.53,0.28,0.02,-0.32,-0.57,-0.80,-0.85,-0.92,-0.93,-0.84,-0.65,-0.49,-0.19,0.18,0.40,0.71,0.92,0.92,1.02,0.98,0.86,0.60,0.31,0.09,-0.34,-0.54,-0.78,-0.89,-0.96,-1.03,-0.86,-0.75,-0.40,-0.19,0.20,0.36,0.71,0.92,0.91,1.01,0.96,0.81,0.56,0.32,0.01,-0.28,-0.55,-0.84,-0.99,-0.97,-0.97,-0.81,-0.64,-0.45,-0.10,0.11,0.49,0.68,0.85,1.05,0.96,0.90,0.77,0.57,0.26,-0.01,-0.23,-0.58,-0.73,-0.89,-0.97,-1.04,-0.85,-0.68,-0.46,-0.12,0.10,0.52,0.65,0.94,1.02,0.97,0.94,0.72,0.61,0.29,-0.03,-0.29,-0.65,-0.95,-0.83,-0.52,-0.37,-0.02,0.21,0.55,0.76,0.98,1.01,0.95,0.92,0.73,0.50,0.18,-0.12,-0.37,-0.70,-0.89,-0.94,-0.54,-0.78,-1.02,-1.06,-1.02,-0.84,-0.70,-0.38,-0.17,0.23,0.46,0.78,0.88,0.91,1.03,0.88,0.72,0.59,0.24,-0.03,-0.36,-0.55,-0.87,-0.92,-0.95,-0.97,-0.89,-0.67,-0.42,-0.08,0.16,0.46,0.80,0.92,1.00,1.05,0.90,0.71,0.49,0.16,-0.10,-0.38,-0.69,-0.76,-0.95,-0.95,-0.90,-0.78,-0.57,-0.37,-0.10,0.22,0.49,0.80,0.95,0.95,1.00,0.94,0.73,0.48,0.20,-0.04,-0.37,-0.58,-0.81,-0.92,-0.96,-1.00,-0.88,-0.53,-0.27,-0.08,0.29,0.54,0.78,0.88,1.06,1.01,0.92,0.67,0.54,0.26,-0.10,-0.36,-0.65,-0.83,-1.02,-0.97,-0.94,-0.74,-0.63,-0.39,-0.07,0.24,0.48,0.77,0.87,1.04,1.00,0.90,0.67,0.40,0.18,-0.13,-0.40,-0.64,-0.80,-1.00,-1.03,-0.93,-0.83,-0.54,-0.27,0.00,0.22,0.57,0.79,0.89,1.00,0.92,0.86,0.71,0.44,0.20,-0.09,-0.39,-0.64,-0.84,-0.94,-1.00,-0.93,-0.72,-0.58,-0.27,-0.04,0.35,0.54,0.77,0.92,0.98,0.95,0.79,0.68,0.50,0.10,-0.13,-0.48,-0.74,-0.93,-1.01"
    + "]";

    app.applyConvertAll();

    $("#applyConvert").click(app.applyConvertAll);
    $("#applyTree").click(app.buildTrees);
});

var app = new App();