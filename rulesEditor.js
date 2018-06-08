var $ = $;

/** @class */
function Rule()
{
    /** @type {number} */ this.ID = 0;
    /** @type {number[]} */ this.conditions = [];
    /** @type {string} */ this.symbol = "";
}

/** @typedef {number} ConditionType */
var ConditionType = 
{
    None: 0,
    Range: 1,
    NotRange: 2,
    Equals: 3,
    NotEquals: 4
}

/** @class */
function Condition()
{
    /** @type {number} */ this.ID = 0;
    /** @type {ConditionType} */ this.conditionType = ConditionType.Equals;
    /** @type {number} */ this.min = 0;
    /** @type {number} */ this.max = 0;
    /** @type {string} */ this.value = "";
    /** @type {string} */ this.conditionField = "";
}

/** @class */
function Json()
{
 /** @type {number[]} */ this.rulesOrder =[];
 /** @type {Rule[]} */ this.rules = [];
 /** @type {Condition[]} */ this.conditions = [];
 /** @type {number} */ this.conditionsCounter = 0;
 /** @type {number} */ this.rulesCounter = 0;
}

/** @class */
function RuleEditor()
{
    /** @type {HTMLElement} */ this.LoadDataButton = null;
    /** @type {HTMLElement} */ this.elementRuleID = null;
    /** @type {HTMLElement} */ this.loadDataArea = null;

    /** @type {HTMLElement} */ this.ruleConditions = null;
    /** @type {HTMLElement} */ this.addCondition = null;
    /** @type {HTMLElement} */ this.applyRule = null;

    /** @type {HTMLElement} */ this.applyCondition = null;
    /** @type {HTMLElement} */ this.conditionRadioRange = null;
    /** @type {HTMLElement} */ this.conditionRadioNotRange = null;
    /** @type {HTMLElement} */ this.conditionRadioEquals = null;
    /** @type {HTMLElement} */ this.conditionRadioNotEquals = null;

    /** @type {HTMLElement} */ this.conditionMinP = null;
    /** @type {HTMLElement} */ this.conditionMinInput = null;
    /** @type {HTMLElement} */ this.conditionMaxP = null;
    /** @type {HTMLElement} */ this.conditionMaxInput = null;
    /** @type {HTMLElement} */ this.conditionValueP = null;
    /** @type {HTMLElement} */ this.conditionValueInput = null;
    /** @type {HTMLElement} */ this.conditionFieldInput = null;
    /** @type {HTMLElement} */ this.conditionIDInput = null;

    /** @type {HTMLElement} */ this.rulesOrderDiv = null;
    /** @type {HTMLElement} */ this.addRuleButton = null;
    /** @type {HTMLElement} */ this.ruleSymbolInput = null;

    /** @type {HTMLElement} */ this.saveJsonButton = null;
    /** @type {HTMLElement} */ this.loadJsonButton = null;

    /** @type {HTMLElement} */ this.testDataTextArea = null;
    /** @type {HTMLElement} */ this.testDataButton = null;
    /** @type {HTMLElement} */ this.testDataresult = null;

    /** @type {HTMLElement} */ this.convertionButton = null;
    /** @type {HTMLElement} */ this.convertionResultText = null;

    /** @type {number} */ this.ruleID = -1;
    /** @type {string} */ this.ruleSymbol = "";
    /** @type {number[]} */ this.ruleTempConditions = [];

    /** @type {number} */ this.conditionID = -1;
    /** @type {ConditionType} */ this.conditionType = ConditionType.None;
    /** @type {string} */ this.conditionField = "";
    /** @type {number} */ this.conditionMin = 0;
    /** @type {number} */ this.conditionMax = 0;
    /** @type {string} */ this.conditionValue = "";

    /** @type {Json} */ this.json = new Json();
}

/** @param {RuleEditor} editor */
/** @param {number} conditionID */
RuleEditor.prototype.CreateConditionsButtons = function(editor, conditionID)
 {
    var buttonEdit = document.createElement("button");
    buttonEdit.addEventListener("click", 
        function() { 
            var condition = editor.FindCondition(editor, conditionID);
            editor.SwitchToCondtion(editor, condition);
            OpenTab(null, 'EditCondition');
         });
    buttonEdit.innerHTML = "Редактировать " + conditionID;
    editor.ruleConditions.appendChild(buttonEdit);

    var buttonRemove = document.createElement("button");
    buttonRemove.addEventListener("click", 
        function() { 

            for(var p=0; p<editor.json.conditions.length; p++)
            {
                var c = editor.json.conditions[p];

                if(c.ID === conditionID)
                {
                    editor.json.conditions.splice(p, 1);
                }
            }

            for(var p=0; p<editor.ruleTempConditions.length; p++)
            {
                var tempID = editor.ruleTempConditions[p];

                if(tempID === conditionID)
                {
                    editor.ruleTempConditions.splice(p, 1);
                }
            }

            editor.ApplyRule(editor);
         });
    buttonRemove.innerHTML = "Удалить " + conditionID;
    editor.ruleConditions.appendChild(buttonRemove);
 }

/** @param {RuleEditor} editor */
 RuleEditor.prototype.AddRuleButtonClick = function(editor)
 {
    editor.AddRule(editor);
 }

 /** @param {RuleEditor} editor */
/** @param {number} conditionID */
RuleEditor.prototype.RemoveCondition = function(editor, conditionID)
{
    for (var i=0; i<editor.json.conditions.length; i++)
    {
        if (editor.json.conditions[i].ID === conditionID)
        {
            editor.json.conditions.splice(i, 1);
            return;
        }
    }
}

/** @param {RuleEditor} editor */
/** @param {number} ruleID */
RuleEditor.prototype.RemoveRule = function(editor, ruleID)
{
   var r = editor.FindRule(editor, ruleID);
    
   for(var i=0; i<r.conditions.length; i++)
   {
       var condID = r.conditions[i];
       editor.RemoveCondition(editor, condID);
   }

   for(var i=0; i<editor.json.rules.length; i++)
   {
       if(editor.json.rules[i].ID === ruleID)
       {
           editor.json.rules.splice(i, 1);
           break;
       }
   }

   for(var i=0; i<editor.json.rulesOrder.length; i++)
   {
       if(editor.json.rulesOrder[i] === ruleID)
       {
           editor.json.rulesOrder.splice(i, 1);
           break;
       }
   }

   if (editor.json.rules.length == 0 && editor.json.conditions.length == 0)
   {
       editor.json.rulesCounter = 0;
       editor.json.conditionsCounter = 0;
   }
}

/** @param {RuleEditor} editor */
/** @param {number} ruleID */
 RuleEditor.prototype.RefreshEditRuleOrderCreateButtons = function(editor, ruleID)
 {
    var buttonEdit = document.createElement("button");
    buttonEdit.addEventListener("click", 
        function() { 
            var rule = editor.FindRule(editor, ruleID);
            editor.SwitchToRule(editor, rule)
            OpenTab(null, 'EditRule');
         });
    buttonEdit.innerHTML = "Редактировать " + ruleID;
    editor.rulesOrderDiv.appendChild(buttonEdit);

    var buttonRemove = document.createElement("button");
    buttonRemove.addEventListener("click", 
        function() { 
            editor.RemoveRule(editor, ruleID);
            editor.RefreshEditRuleOrder(editor);
         });
    buttonRemove.innerHTML = "Удалить " + ruleID;
    editor.rulesOrderDiv.appendChild(buttonRemove);

    var buttonPriorutyUp = document.createElement("button");
    buttonPriorutyUp.addEventListener("click", 
        function() { 

            for(var i=1; i<editor.json.rulesOrder.length; i++)
            {
                var tId = editor.json.rulesOrder[i];

                if(tId === ruleID)
                {
                    var temp = editor.json.rulesOrder[i - 1];
                    editor.json.rulesOrder[i - 1] = tId;
                    editor.json.rulesOrder[i] = temp;
                    break;
                }
            }

            editor.RefreshEditRuleOrder(editor);
         });
    buttonPriorutyUp.innerHTML = "/\\";
    editor.rulesOrderDiv.appendChild(buttonPriorutyUp);

    var buttonPriorutyDown = document.createElement("button");
    buttonPriorutyDown.addEventListener("click", 
        function() { 

            for(var i=editor.json.rulesOrder.length - 2; i >= 0; i--)
            {
                var tId = editor.json.rulesOrder[i];

                if(tId === ruleID)
                {
                    var temp = editor.json.rulesOrder[i + 1];
                    editor.json.rulesOrder[i + 1] = tId;
                    editor.json.rulesOrder[i] = temp;
                    break;
                }
            }

            editor.RefreshEditRuleOrder(editor);
         });
    buttonPriorutyDown.innerHTML = "\\/";
    editor.rulesOrderDiv.appendChild(buttonPriorutyDown);
 }

 /** @param {RuleEditor} editor */
 RuleEditor.prototype.RefreshEditRuleOrder = function(editor)
 {
    editor.rulesOrderDiv.innerHTML = "";

     for (var i=0; i<editor.json.rulesOrder.length; i++)
     {
        var ruleID = editor.json.rulesOrder[i];

        var rule = editor.FindRule(editor, ruleID);

        var ruleDiv = document.createElement("div");
        ruleDiv.innerHTML = ruleID.toString() + " " + rule.symbol;
        editor.rulesOrderDiv.appendChild(ruleDiv);

        editor.RefreshEditRuleOrderCreateButtons(editor, ruleID);
     }
 }

 /** @param {RuleEditor} editor */
 RuleEditor.prototype.RefreshEditRule = function(editor)
 {
     /** @type {any} */
     var e = editor.elementRuleID;
     e.value = editor.ruleID;

     /** @type {any} */
    var sym = editor.ruleSymbolInput;
    sym.value = editor.ruleSymbol;

     editor.ruleConditions.innerHTML = "<br>";

     for (var i=0; i<editor.ruleTempConditions.length; i++)
     {
        var conditionID = editor.ruleTempConditions[i];

        var pId = document.createElement("p");
        pId.innerHTML = "<b>ID: " + conditionID.toString() + "</b>";
        editor.ruleConditions.appendChild(pId);

        var condition = editor.FindCondition(editor, conditionID);

        if (condition == null)
            throw new Error("Condition not found: " + conditionID);

        var conditionContent = condition.conditionField + " ";

        switch(condition.conditionType)
        {
            case ConditionType.None:
                throw new Error("Unexected condition type");
            case ConditionType.Equals:
                conditionContent += "= " + condition.value;
                break;
            case ConditionType.NotEquals:
                conditionContent += "!= " + condition.value;
                break;
            case ConditionType.Range:
                conditionContent += "IN [" + condition.min.toString() + ".." + condition.max.toString() + "]";
                break;
            case ConditionType.NotRange:
                conditionContent += "NOT IN [" + condition.min.toString() + ".." + condition.max.toString() + "]";
                break;
        }

        var conditionContentElem = document.createElement("p");
        conditionContentElem.innerHTML = conditionContent.toString();
        editor.ruleConditions.appendChild(conditionContentElem);

        editor.CreateConditionsButtons(editor, conditionID);
     }
 }

/** @param {RuleEditor} editor */
RuleEditor.prototype.ApplyRule = function(editor)
{
    /** @type {any} */
    var idInput = editor.elementRuleID;

    var id = parseInt(idInput.value);
    if (isNaN(id))
        id = -1;

    editor.ruleID = id;

     /** @type {any} */
    var symInput = editor.ruleSymbolInput;
    editor.ruleSymbol = symInput.value;

    var rule = editor.FindRule(editor, id);

    if (rule == null)
    {
        rule = new Rule();

        editor.json.rulesCounter++;
        id = editor.json.rulesCounter;
        editor.ruleID = id;
        rule.ID = id;

        editor.json.rules.push(rule);
    }

    rule.conditions = [];

    for (var i=0; i<editor.ruleTempConditions.length; i++)
    {
        rule.conditions.push(editor.ruleTempConditions[i]);
    }

    rule.symbol = editor.ruleSymbol;

    editor.RefreshEditRule(editor);
    editor.RefreshEditRuleOrder(editor);
}

/** @param {RuleEditor} editor */
RuleEditor.prototype.RefreshEditCondition = function(editor)
{
    if (editor.conditionType === ConditionType.None)
        editor.conditionType = ConditionType.Equals;

    /** @type {any} */
    var conditionRadioRange = editor.conditionRadioRange;
    /** @type {any} */
    var conditionRadioNotRange = editor.conditionRadioNotRange;
    /** @type {any} */
    var conditionRadioEquals = editor.conditionRadioEquals;
    /** @type {any} */
    var conditionRadioNotEquals = editor.conditionRadioNotEquals;
    /** @type {any} */
    var idInput = editor.conditionIDInput;
    /** @type {any} */
    var conditionFieldInput = editor.conditionFieldInput;

    /** @type {any} */
    var conditionMin = editor.conditionMinInput;
    /** @type {any} */
    var conditionMax = editor.conditionMaxInput;
    /** @type {any} */
    var conditionValue = editor.conditionValueInput;

    conditionRadioRange.checked = false;
    conditionRadioNotRange.checked = false;
    conditionRadioEquals.checked = false;
    conditionRadioNotEquals.checked = false;

    editor.conditionMinP.style.display = "none";
    editor.conditionMinInput.style.display = "none";
    editor.conditionMaxP.style.display = "none";
    editor.conditionMaxInput.style.display = "none";
    editor.conditionValueP.style.display = "none";
    editor.conditionValueInput.style.display = "none";

    idInput.value = editor.conditionID;
    conditionFieldInput.value = editor.conditionField;
    conditionMin.value = editor.conditionMin;
    conditionMax.value = editor.conditionMax;
    conditionValue.value = editor.conditionValue;

    switch (editor.conditionType)
    {
        case ConditionType.None:
            throw new Error("Invalid condition type: " + editor.conditionType.toString());
        case ConditionType.Range:
            conditionRadioRange.checked = true;
            editor.conditionMinP.style.display = "block";
            editor.conditionMinInput.style.display = "block";
            editor.conditionMaxP.style.display = "block";
            editor.conditionMaxInput.style.display = "block";
            break;
        case ConditionType.NotRange:
            conditionRadioNotRange.checked = true;
            editor.conditionMinP.style.display = "block";
            editor.conditionMinInput.style.display = "block";
            editor.conditionMaxP.style.display = "block";
            editor.conditionMaxInput.style.display = "block";
            break;
        case ConditionType.Equals:
            conditionRadioEquals.checked = true;
            editor.conditionValueP.style.display = "block";
            editor.conditionValueInput.style.display = "block";
            break;
        case ConditionType.NotEquals:
            conditionRadioNotEquals.checked = true;
            editor.conditionValueP.style.display = "block";
            editor.conditionValueInput.style.display = "block";
            break;
    }
}

 /** @param {RuleEditor} editor */
 /** @param {Condition} condition */
RuleEditor.prototype.SwitchToCondtion = function(editor, condition)
{
    editor.conditionID = condition.ID;
    editor.conditionType = condition.conditionType;
    editor.conditionField = condition.conditionField;
    editor.conditionMin = condition.min;
    editor.conditionMax = condition.max;
    editor.conditionValue = condition.value;
    editor.RefreshEditCondition(editor);
}

/** @param {RuleEditor} editor */
/** @param {Rule} rule */
RuleEditor.prototype.SwitchToRule = function(editor, rule)
{
    editor.ruleID = rule.ID;
    editor.ruleTempConditions = [];

    for(var i=0; i<rule.conditions.length; i++)
        editor.ruleTempConditions.push(rule.conditions[i]);

    editor.ruleSymbol = rule.symbol;

    editor.RefreshEditRule(editor);
}

 /** @param {RuleEditor} editor */
 RuleEditor.prototype.AddRule = function(editor)
 {
    var rule = new Rule();
    editor.json.rulesCounter++;
    rule.ID = editor.json.rulesCounter;
    editor.json.rules.push(rule);
    editor.json.rulesOrder.push(rule.ID);
    editor.RefreshEditRuleOrder(editor);
    editor.SwitchToRule(editor, rule);
    OpenTab(null, 'EditRule');
 }

 /** @param {RuleEditor} editor */
 RuleEditor.prototype.AddCondition = function(editor)
 {
    var c = new Condition();
    editor.json.conditionsCounter++;
    c.ID = editor.json.conditionsCounter;
    editor.json.conditions.push(c);
    editor.ruleTempConditions.push(c.ID);
    editor.ApplyRule(editor);
    editor.SwitchToCondtion(editor, c);
    OpenTab(null, 'EditCondition');
 }

 /** @param {RuleEditor} editor */
 /** @param {ConditionType} type */
RuleEditor.prototype.SwitchConditionType = function(editor, type)
{
    editor.conditionType = type;
    editor.RefreshEditCondition(editor);
}

 /** @param {RuleEditor} editor */
 /** @param {number} ID */
 /** @returns {Rule} */
 RuleEditor.prototype.FindRule = function(editor, ID)
 {
     for (var i=0; i<editor.json.rules.length; i++)
     {
         var rule = editor.json.rules[i];
 
         if (rule.ID === ID)
             return rule;
     }
 
     return null;
 }

 /** @param {RuleEditor} editor */
 /** @param {number} ID */
 /** @returns {Condition} */
RuleEditor.prototype.FindCondition = function(editor, ID)
{
    for (var i=0; i<editor.json.conditions.length; i++)
    {
        var condition = editor.json.conditions[i];

        if (condition.ID === ID)
            return condition;
    }

    return null;
}

 /** @param {RuleEditor} editor */
 RuleEditor.prototype.ApplyCondition = function(editor)
 {
    /** @type {any} */
    var idInput = editor.conditionIDInput;
    /** @type {any} */
    var conditionFieldInput = editor.conditionFieldInput;
    /** @type {any} */
    var conditionValueInput = editor.conditionValueInput;
    /** @type {any} */
    var conditionMinInput = editor.conditionMinInput;
    /** @type {any} */
    var conditionMaxInput = editor.conditionMaxInput;

    var id = parseInt(idInput.value);
    if (isNaN(id))
        id = -1;

    var condition = editor.FindCondition(editor, id);

    if (condition == null)
        throw new Error("Condition not found: " + id);

    var min = parseFloat(conditionMinInput.value);
    var max = parseFloat(conditionMaxInput.value);

    if (isNaN(min))
        min = 0;

    if (isNaN(max))
        max = 0;

    if (max < min)
        max = min;
    
    condition.min = min;
    condition.max = max;
    condition.value =  conditionValueInput.value;
    condition.conditionType = editor.conditionType;
    condition.conditionField = conditionFieldInput.value;

    editor.SwitchToCondtion(editor, condition);

    editor.RefreshEditCondition(editor);
    editor.RefreshEditRule(editor);

    $("#conditionApplyFeedback").show();
    $("#conditionApplyFeedback").fadeOut(1000);
 }

/** @param {RuleEditor} editor */
RuleEditor.prototype.SaveJson = function(editor)
{
    localStorage["editorJson"] = JSON.stringify(editor.json);
}

/** @param {RuleEditor} editor */
RuleEditor.prototype.LoadJson = function(editor)
{
    editor.json = JSON.parse(localStorage["editorJson"]);
    editor.RefreshEditRuleOrder(editor);
}

/** @param {RuleEditor} editor */
/** @returns {Rule} */
RuleEditor.prototype.ProcessData = function(editor, data)
{
    for(var i=0; i<editor.json.rulesOrder.length; i++)
    {
        var rule = editor.FindRule(editor, editor.json.rulesOrder[i]);

        var success = true;

        for(var j=0; j<rule.conditions.length; j++)
        {
            var condition = editor.FindCondition(editor, rule.conditions[j]);

            var v = parseFloat(data[condition.conditionField]);

            switch(condition.conditionType)
            {
                case ConditionType.Equals:
                    success = data[condition.conditionField] == condition.value;
                    break;

                case ConditionType.NotEquals:
                    success = data[condition.conditionField] != condition.value;
                    break;

                case ConditionType.Range:
                    success = !isNaN(v) && condition.min <= v && v <= condition.max;
                    break;

                case ConditionType.NotRange:
                    success = !isNaN(v) && !(condition.min <= v && v <= condition.max);
                    break;

                default:
                    throw new Error("Unexpected condition");
            }

            if (!success)
                break;
        }

        if (success)
            return rule;
    }

    return null;
}

/** @type {ParseResult[]} */
var ParseResults = [];

/** @class */
function ParseResult()
{
    /** @type {object} */ this.data = null;
    /** @type {Rule} */ this.rule = null;
}

/** @param {RuleEditor} editor */
RuleEditor.prototype.RunConvertion = function(editor)
{
    ParseResults = [];

    /** @type {any} */
    var loadDataAreaAny = editor.loadDataArea;
    /** @type {object[]} */
    var parsed = JSON.parse(loadDataAreaAny.value);

    for (var i=0; i<parsed.length; i++)
    {
        var data = parsed[i];
        var rule = editor.ProcessData(editor, data);

        if (rule != null)
        {
            var result = new ParseResult();
            result.data = data;
            result.rule = rule;
            ParseResults.push(result);
        }
    }

    editor.convertionResultText.innerHTML = "";
    for(var i=0; i<ParseResults.length; i++)
    {
        var result = ParseResults[i];
        editor.convertionResultText.innerHTML += result.rule.symbol + " ";
    }
}

$(document).ready(function() 
{
    editor.LoadDataButton = document.getElementById("LoadDataButton");
    editor.elementRuleID = document.getElementById("elementRuleID");
    editor.loadDataArea = document.getElementById("loadData");
    
    editor.ruleConditions = document.getElementById("ruleConditions");
    editor.addCondition = document.getElementById("addCondition");
    editor.applyRule = document.getElementById("applyRule");

    editor.applyCondition = document.getElementById("applyCondition");
    editor.conditionRadioRange = document.getElementById("conditionRadioRange");
    editor.conditionRadioNotRange = document.getElementById("conditionRadioNotRange");
    editor.conditionRadioEquals = document.getElementById("conditionRadioEquals");
    editor.conditionRadioNotEquals = document.getElementById("conditionRadioNotEquals");

    editor.conditionMinP = document.getElementById("conditionMinP");
    editor.conditionMinInput = document.getElementById("conditionMinInput");
    editor.conditionMaxP = document.getElementById("conditionMaxP");
    editor.conditionMaxInput = document.getElementById("conditionMaxInput");
    editor.conditionValueP = document.getElementById("conditionValueP");
    editor.conditionValueInput = document.getElementById("conditionValueInput");
    editor.conditionFieldInput = document.getElementById("conditionFieldInput");
    editor.conditionIDInput = document.getElementById("conditionIDInput");

    editor.rulesOrderDiv = document.getElementById("rulesOrderDiv");
    editor.addRuleButton = document.getElementById("addRuleButton");
    editor.ruleSymbolInput = document.getElementById("ruleSymbolInput");

    editor.saveJsonButton = document.getElementById("saveJsonButton");
    editor.loadJsonButton = document.getElementById("loadJsonButton");

    editor.testDataTextArea = document.getElementById("testDataTextArea");
    editor.testDataButton = document.getElementById("testDataButton");
    editor.testDataresult = document.getElementById("testDataresult");

    editor.convertionButton = document.getElementById("convertionButton");
    editor.convertionResultText = document.getElementById("convertionResultText");

    editor.LoadDataButton.className += " active";

    editor.LoadJson(editor);

    editor.RefreshEditRule(editor);
    editor.RefreshEditCondition(editor);
    editor.RefreshEditRuleOrder(editor);

    editor.addCondition.addEventListener("click", 
        function() { editor.AddCondition(editor); });

    editor.conditionRadioRange.addEventListener("click", 
        function() { editor.SwitchConditionType(editor, ConditionType.Range) });
    editor.conditionRadioNotRange.addEventListener("click", 
        function() { editor.SwitchConditionType(editor, ConditionType.NotRange) });
    editor.conditionRadioEquals.addEventListener("click", 
        function() { editor.SwitchConditionType(editor, ConditionType.Equals) });
    editor.conditionRadioNotEquals.addEventListener("click", 
        function() { editor.SwitchConditionType(editor, ConditionType.NotEquals) });
    editor.applyCondition.addEventListener("click", 
        function() { editor.ApplyCondition(editor); });
    editor.applyRule.addEventListener("click", 
        function() { editor.ApplyRule(editor); });
    editor.addRuleButton.addEventListener("click", 
        function() { editor.AddRuleButtonClick(editor); });
    editor.saveJsonButton.addEventListener("click", 
        function() { editor.SaveJson(editor); });
    editor.loadJsonButton.addEventListener("click", 
        function() { editor.LoadJson(editor); });
    editor.convertionButton.addEventListener("click", 
        function() { editor.RunConvertion(editor); });

    /** @type {any} */
    var testDataTextAreaAny = editor.testDataTextArea;
    editor.testDataButton.addEventListener("click", 
        function() 
        { 
            try
            {
                var result = editor.ProcessData(editor, JSON.parse(testDataTextAreaAny.value)); 

                if(result == null)
                {
                    editor.testDataresult.innerHTML = "NULL";
                }
                else
                {
                    editor.testDataresult.innerHTML = result.ID.toString() + " " + result.symbol;
                }
            }
            catch (Error)
            {
                alert(Error);
                throw Error;
            }
        });

    /** @type {any} */
    var loadDataAreaAny = editor.loadDataArea;
    loadDataAreaAny.value = JSON.stringify(logsExample);

    $("#conditionApplyFeedback").hide();
});

var editor = new RuleEditor();