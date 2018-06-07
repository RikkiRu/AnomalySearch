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

    /** @type {number} */ this.ruleID = -1;
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
 RuleEditor.prototype.RefreshEditRule = function(editor)
 {
     /** @type {any} */
     var e = editor.elementRuleID;
     e.value = editor.ruleID;

     editor.ruleConditions.innerHTML = "<br>";

     for (var i=0; i<editor.ruleTempConditions.length; i++)
     {
        var t = i;
        var conditionID = editor.ruleTempConditions[t];
        //editor.ruleConditions.innerHTML += conditionID + " ";

        var condition = editor.FindCondition(editor, conditionID);

        if (condition == null)
            throw new Error("Condition not found: " + conditionID);

        //editor.ruleConditions.innerHTML += condition.conditionField;

        switch(condition.conditionType)
        {
            case ConditionType.None:
                throw new Error("Unexected condition type");
            case ConditionType.Equals:
                //editor.ruleConditions.innerHTML += "=" + condition.value;
                break;
            case ConditionType.NotEquals:
                //editor.ruleConditions.innerHTML += "!=" + condition.value;
                break;
            case ConditionType.Range:
                //editor.ruleConditions.innerHTML += "IN [" + condition.min.toString() + ".." + condition.max.toString() + "]";
                break;
            case ConditionType.NotRange:
                //editor.ruleConditions.innerHTML += "NOT IN [" + condition.min.toString() + ".." + condition.max.toString() + "]";
                break;
        }

        //editor.ruleConditions.innerHTML += "<br>"

        var buttonEdit = document.createElement("button");
        buttonEdit.addEventListener("click", 
            function() { 
                console.log("edit " + conditionID);
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

        //editor.ruleConditions.innerHTML += "<hr>"
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

    editor.RefreshEditRule(editor);
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

    editor.LoadDataButton.className += " active";

    editor.RefreshEditRule(editor);
    editor.RefreshEditCondition(editor);

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

    $("#conditionApplyFeedback").hide();
});

var editor = new RuleEditor();