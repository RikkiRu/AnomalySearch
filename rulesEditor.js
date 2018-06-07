var $ = $;

/** @class */
function Rule()
{
    /** @type {number} */ this.ID = 0;
    /** @type {number[]} */ this.conditions = [];
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
    /** @type {ConditionType} */ this.conditionType = ConditionType.None;
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

    /** @type {HTMLElement} */ this.ruleConditions = null;
    /** @type {HTMLElement} */ this.addCondition = null;
    /** @type {HTMLElement} */ this.applyRule = null;
    /** @type {HTMLElement} */ this.revertRule = null;

    /** @type {HTMLElement} */ this.applyCondition = null;
    /** @type {HTMLElement} */ this.revertCondition = null;
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

    /** @type {number} */ this.ruleID = -1;

    /** @type {number} */ this.conditionID = -1;
    /** @type {ConditionType} */ this.conditionType = ConditionType.None;
    /** @type {string} */ this.conditionField = "";
    /** @type {number} */ this.conditionMin = 0;
    /** @type {number} */ this.conditionMax = 0;
    /** @type {string} */ this.conditionValue = "";

    /** @type {Json} */ this.json = new Json();
}

 /** @param {RuleEditor} editor */
 RuleEditor.prototype.RefreshEditRule = function(editor)
 {
     /** @type {any} */
     var e = editor.elementRuleID;
     e.value = editor.ruleID;
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

 RuleEditor.prototype.AddCondition = function()
 {
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

    editor.conditionID = id;
    editor.conditionField = conditionFieldInput.value;
    editor.conditionValue = conditionValueInput.value;

    var min = parseFloat(conditionMinInput.value);
    var max = parseFloat(conditionMaxInput.value);

    if (isNaN(min))
        min = 0;

    if (isNaN(max))
        max = 0;

    if (max < min)
        max = min;

    editor.conditionMin = min;
    editor.conditionMax = max;
   
    var condition = editor.FindCondition(editor, id);

    if (condition == null)
    {
        condition = new Condition();

        editor.json.conditionsCounter++;
        id = editor.json.conditionsCounter;
        editor.conditionID = id;
        condition.ID = id;

        editor.json.conditions.push(condition);
    }
    
    condition.min = min;
    condition.max = max;
    condition.value = editor.conditionValue;
    condition.conditionType = editor.conditionType;
    condition.conditionField = editor.conditionValue;

    editor.RefreshEditCondition(editor);
    $("#conditionApplyFeedback").show();
    $("#conditionApplyFeedback").fadeOut(1000);
 }

$(document).ready(function() 
{
    editor.LoadDataButton = document.getElementById("LoadDataButton");
    editor.elementRuleID = document.getElementById("elementRuleID");
    
    editor.ruleConditions = document.getElementById("ruleConditions");
    editor.addCondition = document.getElementById("addCondition");
    editor.applyRule = document.getElementById("applyRule");
    editor.revertRule = document.getElementById("revertRule");

    editor.applyCondition = document.getElementById("applyCondition");
    editor.revertCondition = document.getElementById("revertCondition");
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

    editor.LoadDataButton.className += " active";

    editor.RefreshEditRule(editor);
    editor.RefreshEditCondition(editor);

    editor.addCondition.addEventListener("click", 
        function() { editor.AddCondition(); });

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

    $("#conditionApplyFeedback").hide();
});

var editor = new RuleEditor();