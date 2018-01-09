/**
 * @param {SuffixTree} Tx
 * @param {SuffixTree} Tr
 */
function tarzan(Tx, Tr)
{
    app.log("<b>Запущен алгоритм TARZAN<b>")
    var anomlyList = [];

    // Let the scale factor α = (|x| – m + 1) / (|r| – m + 1) (i.e. the relative sizes of the sequences X and R)
    // Так и не понял откуда взяли "m" и что это вообще!
    var scaleFactorA = Tx.text.length / Tr.text.length;

    // find the largest l such that all substrings of length l in w exist in Tr.
    /**
     * @param {string} str
     * @returns {number}
     */
    function findLargestSubstrLengthForTr(str)
    {
        //console.log("findLargestSubstrLengthForTr " + str);

        var l = str.length - 1;

        while (l > 1)
        {
            //console.log("iteration " + l);
            var haveAll = true;

            for (var i=0; i<str.length - l; i++)
            {
                var end = i + l;

                var sub = str.substring(i, end);
                //console.log("checking " + sub);

                var node = Tr.searchNode(sub);

                if (node == null)
                {
                    haveAll = false;
                    //console.log("Not found!");
                    break;
                }
            }

            if (haveAll)
            {
                //console.log("RESULT: " + l);
                return l;
            }

            l--;
        }

        //console.log("RESULT: null");
        return null;
    }

    // perform a breadth-first traversal of Tx examining each node u in Tx in turn
    function breadthFirst()
    {
        var nodesToVisit = [{node: Tx.root, w: "", start: 0}];

        while (nodesToVisit.length > 0)
        {
            var nodeU = nodesToVisit[0].node;
            var strW = nodesToVisit[0].w;
            var nodeStart = nodesToVisit[0].start;
            nodesToVisit.splice(0, 1);

            for (var t in nodeU.transition) 
            {
                var traNs = nodeU.transition[t];
                var u = traNs[0], a = traNs[1], b = traNs[2]; 
                var name = Tx.text.substring(a, b + 1);
                
                if (name[name.length - 1] === "#")
                    name = name.substring(0, name.length - 1);

                if (name.length === 0)
                    continue;

                // Compute the string w formed by traversing Tx from the root to the node u. 
                var w = strW + name;

                if (w.length > parseInt(app.maxTarzanSequenceLength.value))
                    continue;

                nodesToVisit.push({node: u, w: w, start: a});
            }

            if (strW.length === 0 || strW.length < parseInt(app.minTarzanSequenceLength.value))
                continue;

            // Lookup w in Tr
            var node = Tr.searchNode(strW);

            var expectedOccurrences = 0;

            if (node != null)
            {
                // If w exists in Tr then let the expected number of occurrences of w in X be αfr(w) 
                // i.e. the count that we stored at that node in Tr during preprocessing, scaled by the factor α)
                expectedOccurrences = scaleFactorA * node.leafChilds;
            }
            else
            {
                // If w doesn’t exist in Tr then 
                
                // find the largest l such that all substrings of length l in w exist in Tr.
                var largestL = findLargestSubstrLengthForTr(strW);
                
                if (largestL != null)
                {
                    // Set the expected number of occurrences of w in X to be [FORMULA]

                    var m = strW.length;
                    var l = largestL;

                    var topPart = 1;

                    for (var j=1-1; j<m-l; j++) //-1 because of index begins from 0
                    {
                        var w = strW.substring(j, j+l); //+1 because of substring not include last
                        var node = Tr.searchNode(w);

                        if (node == null)
                            throw new Error("Not found: " + strW + " " + w + " " + l);

                        topPart *= node.leafChilds;
                    }

                    var bottomPart = 1;

                    for (var j=2-1; j<m-l; j++) //-1 because of index begins from 0
                    {
                        var w = strW.substring(j, j+l-1); //+1 because of substring not include last
                        var node = Tr.searchNode(w);
                        bottomPart *= node.leafChilds;
                    }

                    expectedOccurrences = scaleFactorA * (topPart / bottomPart);
                }
                else
                {
                    // If there is no suitable l, 
                    // set the expected number of occurrences of w in X based on the probability of the 
                    // symbols from Tr

                    var m = strW.length;
                    var x = Tx.text.length;
                    var partLeft = m * x;
                    var partRight = 1;

                    for (var i=0; i<m; i++)
                    {
                        var node = Tr.searchNode(strW[i]);
                        if (node == null)
                        {
                            partRight *= 0;
                            break;
                        }

                        partRight *= node.probability; // Не уверен. Потому что опять не объяснено что именно взято
                    }

                    expectedOccurrences = partLeft * partRight;
                }
            }

            // Set the surprise score to be the difference between the 
            // observed number of occurrences and the expected number of occurrences.

            //var surpriseScoreZ = nodeU.leafChilds - expectedOccurrences;
            //nodeU.surpriseScoreZ = surpriseScoreZ;

            var errorChance = (nodeU.leafChilds - expectedOccurrences);
            errorChance /= Math.max(Math.abs(nodeU.leafChilds), Math.abs(expectedOccurrences));
            errorChance = Math.abs(errorChance);

            app.log("");
            app.log("Подстрока: " + strW);
            app.log("Ожидаемое кол-во: " + expectedOccurrences.toFixed(2));
            app.log("Реальное  кол-во: " + nodeU.leafChilds);
            app.log("Ожидание  ошибки: " + errorChance.toFixed(2));

            var maxError = parseFloat(app.maxTarzanError.value);
            
            if (errorChance > maxError)
            {
                app.log("Строка отмечена как аномальная");
                anomlyList.push({start: nodeStart, length: strW.length})
            }
        }        
    }

    breadthFirst();
    app.log("");
    app.log("Завершено");
    return anomlyList;
}