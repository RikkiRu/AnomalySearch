// This implementation is adapted from the one here the snippets provided here
// http://www.allisons.org/ll/AlgDS/Tree/Suffix/

'use strict';

function UNode(){
    this.transition = {};
    this.suffixLink = null;
    this.leafChilds = 0;
    this.probability = 0;
    this.surpriseScoreZ = 0;
}

UNode.prototype.addTransition = function(node, start, end, t) {
    this.transition[t] = [node, start, end];
}

UNode.prototype.isLeaf = function() {
    return Object.keys(this.transition).length === 0;
}

function SuffixTree (){  
    this.text = '';
    this.str_list = [];
    this.seps = []
    this.root = new UNode();
    this.bottom = new UNode();
    this.root.suffixLink = this.bottom;
    this.s = this.root;
    this.k = 0;
    this.i = -1;
}

SuffixTree.prototype.addString = function(str) {
  var temp = this.text.length;
  this.text += str;
  this.seps.push(str[str.length-1])
  this.str_list.push(str);
  var s, k, i;
  s = this.s;
  k = this.k;
  i = this.i;

  for (var j = temp; j < this.text.length; j++) {
    this.bottom.addTransition(this.root, j, j, this.text[j]);
  }

  while(this.text[i+1]) {
    i++;
    var up = this.update(s, k, i);
    up = this.canonize(up[0], up[1], i);
    s = up[0];
    k = up[1];
  }

  this.s = s;
  this.k = k;
  this.i = i;
  return this;
}


SuffixTree.prototype.update = function(s, k, i) {

  var oldr = this.root;
  var endAndr= this.testAndSplit(s, k, i - 1, this.text[i]);
  var endPoint = endAndr[0]; var r = endAndr[1]    

  while(!endPoint) {
    r.addTransition(new UNode(), i, Infinity, this.text[i]);

    if(oldr != this.root) {
      oldr.suffixLink = r;
    }

    oldr = r;
    var sAndk = this.canonize(s.suffixLink, k, i - 1);
    s = sAndk[0];
    k = sAndk[1];
    endAndr = this.testAndSplit(s, k, i - 1, this.text[i]);
    var endPoint = endAndr[0]; var r = endAndr[1]    
  }

  if(oldr != this.root) {
    oldr.suffixLink = s;
  }

  return [s, k];
}


SuffixTree.prototype.testAndSplit = function(s, k, p, t) {
  if(k <= p) {
    var traNs = s.transition[this.text[k]];
    var s2 = traNs[0], k2 = traNs[1], p2 = traNs[2];
    if(t == this.text[k2 + p - k + 1]) {
      return [true, s];
    } else {
      var r = new UNode();
      s.addTransition(r, k2, k2 + p - k, this.text[k2]);
      r.addTransition(s2, k2 + p - k + 1, p2, this.text[k2 + p - k + 1]);
      return [false, r];
    }
  } else {
    if(!s.transition[t])
      return [false, s];
    else
      return [true, s];
  }
}


SuffixTree.prototype.canonize = function(s, k, p) {
  if(p < k)
    return [s, k];
  else {
    var traNs = s.transition[this.text[k]];
    var s2 = traNs[0], k2 = traNs[1], p2 = traNs[2];

    while(p2 - k2 <= p - k) {
      k = k + p2 - k2 + 1;
      s = s2;

      if(k <= p) {
        var traNs = s.transition[this.text[k]];
        s2 = traNs[0]; k2 = traNs[1]; p2 = traNs[2];
      }
    }

    return [s, k];
  }
}

SuffixTree.prototype.finish = function()
{
  this.countLeafChilds(this.root);
  this.countProbability(this.root, "");
}

/**
* @returns {UNode} tree
*/
SuffixTree.prototype.searchNode = function(str)
{
  return this.CheckNodeForStr(str, this.root);
}

SuffixTree.prototype.CheckNodeForStr = function(str, node)
{
  //console.log("search " + str);

  for (var t in node.transition) 
  {
    var traNs = node.transition[t];
    var s = traNs[0], a = traNs[1], b = traNs[2]; 
    var name = this.text.substring(a, b + 1);

    if (name.startsWith(str))
    {
      //console.log("found at " + name);
      return s;
    }
    else if (str.startsWith(name))
    {
      //console.log("starts with " + name);
      return this.CheckNodeForStr(str.substring(name.length, str.length), s);
    }
    else
    {
      //console.log("not found " + str + " at " + name);
    }
  }

  //console.log("not found at all");
  return null;
}

/**
* @param {UNode} node
* @param {string} prevName
*/
SuffixTree.prototype.countProbability = function(node, prevName)
{
  for (var t in node.transition) 
  {
    var traNs = node.transition[t];
    var s = traNs[0], a = traNs[1], b = traNs[2]; 
    var name = this.text.substring(a, b + 1);

    if (name[name.length - 1] === "#")
      name = name.substring(0, name.length - 1);

    if (name.length === 0)
        continue;

    name = prevName + name;

    s.probability = s.leafChilds / (this.text.length - name.length + 1);
    this.countProbability(s, name);
  }
}

/**
* @param {UNode} node
*/
SuffixTree.prototype.countLeafChilds = function(node)
{
  var sum = 0;

  for (var t in node.transition) 
  {
    var traNs = node.transition[t];
    var child = traNs[0];
    if (child.isLeaf())
    {
      child.leafChilds = 1;
      sum++;
    }
    else
      sum += this.countLeafChilds(child);
  }

  node.leafChilds = sum;

  return sum;
}

SuffixTree.prototype.convertToJson = function(){
  // convert tree to json to use with d3js

  var text = this.text;
  var ret = {
      "name" : "",
      "parent": "null",
      "suffix" : "",
      "children": []
  }

  function traverse(node, seps, str_list, ret) {
    for(var t in node.transition) {
      var traNs = node.transition[t];
      var s = traNs[0], a = traNs[1], b = traNs[2]; 
      var name =  text.substring(a, b + 1);
      var position = seps.length-1;
      for(var pos=name.length -1; pos>-1; pos--){
         var insep = seps.indexOf(name[pos]);
         position = insep>-1 ?insep:position;
      }

      var names = name.split(seps[position]);
      if (names.length >1){
          name = names[0] + seps[position];
      }
      var suffix =  ret["suffix"]+name;
      var cchild = {
        "name" : name,
        "parent": ret['name'],
        "suffix" : suffix,
        "children": []
      };
      if (s.isLeaf()){
        cchild['seq'] = position +1;
        cchild['start'] = ""+(str_list[position].length - suffix.length);
      }
      cchild = traverse(s, seps, str_list, cchild);
      ret["children"].push(cchild)
    }

    return ret;

  }
  return traverse(this.root, this.seps, this.str_list, ret);

}

SuffixTree.prototype.toString = function() {
  var text = this.text;

  function traverse(node, offset, ret) {
    offset = typeof offset !== 'undefined' ? offset : '';
    ret = typeof ret !== 'undefined' ? ret : '';
    for(var t in node.transition) {
      var traNs = node.transition[t];
      var s = traNs[0], a = traNs[1], b = traNs[2]; 
      ret += offset + '["' + text.substring(a, b + 1) + '", ' + a + ', ' + b + ']' + '\r\n';
      ret += traverse(s, offset+'\t');
    }
    return ret;
  }
  var res = traverse(this.root)
  return res;
}

SuffixTree.prototype.print = function(){
  console.log(this.toString());
}