var d3 = d3;

app.SuffixtreeJS = function(data) 
{
	var treeBuilder = {};

	var special_chars = '#$&%@?+*';
	var colorlist = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"];
	var max_string = colorlist.length;

	var stree = new SuffixTree();
	stree.addString('MISSION#');
	stree.addString('MISSISSIPPI$');
	stree.finish();
	var treeData = stree.convertToJson();

	var realWidth = app.getContentSize().width * 0.9;
	var realHeight = app.getContentSize().height * 0.7;

	// ************** Generate the tree diagram	 *****************
	var margin = {top: 5, right: 25, bottom: 20, left: 50},

		width = realWidth - margin.right - margin.left,
		height = realHeight - margin.top - margin.bottom;
		
	var i = 0,
		duration = 750,
		root;

	var tree = d3.layout.tree()
		.size([height, width]);
		
	var diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.y, d.x]; });

	var svg = d3.select(data.outputID).append("svg")
		.attr("height", realHeight)
		.attr("width", realWidth)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	root = treeData;
	root.x0 = height / 2;
	root.y0 = 0;

	treeBuilder.buildTree = function()
	{
		var str_list = $( data.wordsID ).val().split(",");

		if (!check_char($( data.wordsID ).val(), special_chars)){
			$( data.errorID ).text("Ваши строки не должны содержать ни один из спец. символов: " +  special_chars);
			$( data.errorID ).toggle(true);
		}

		else if(str_list.length > max_string){
			$( data.errorID ).text("Достигнут лимит (" + max_string + ") кол-ва строк!");
			$( data.errorID ).toggle(true);
		}

		else{

			var totalSymbols = 0;

			if(str_list.length > 0 && !(str_list.length==1 && str_list[0]==="")){
				$( data.errorID ).toggle(false);
				stree =  new SuffixTree();
				for(var i=0; i<str_list.length; i++){
					var s = str_list[i] + get_add_special_char(i, special_chars)
					stree.addString(s);
					totalSymbols+=s.length;
				}
				stree.finish();
				root = stree.convertToJson();
				treeBuilder.sTree = stree;
			}
			else{
				root = treeData;
			}

			var maxSymbols = 100;

			if (totalSymbols <= maxSymbols)
			{
				root.x0 = height / 2;
				root.y0 = 0;
				update(root);
			}
			else
			{
				$( data.errorID ).text("Дерево не было визуализировано, т.к. общее кол-во символов превысило порог " + maxSymbols);
				$( data.errorID ).toggle(true);
			}
		}
	}

	d3.select(self.frameElement).style("height", "800px");

	var getDepth = function (jdata) {
		var depth = 0;
		if (jdata.children) {
			jdata.children.forEach(function (d) {
				var cdepth = getDepth(d)
				if (cdepth > depth) {
					depth = cdepth
				}
			})
		}
		return 1 + depth
	}

	function update(source) {

		var coeff = getDepth(root);
	// Compute the new tree layout.
	var nodes = tree.nodes(root).reverse(),
		links = tree.links(nodes);

	// Normalize for fixed-depth.
	nodes.forEach(function(d) { d.y = d.depth * width/coeff; });

	// Update the nodes…
	var node = svg.selectAll("g.node")
		.data(nodes, function(d) { return d.id || (d.id = ++i); });

	// Enter any new nodes at the parent's previous position.
	var nodeEnter = node.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
		.on("click", click);

	nodeEnter.append("circle")
		.attr("r", 1e-6)
		.style("fill", function(d) { return d._children ? "#ddd" : "#fff"; });

	nodeEnter.append("text")
		.attr("x", function(d) { return d.children || d._children ? -13 : 13; })
		.attr("dy", ".5em")
		.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
		//.text(function(d) { return d.name+ (d.start?" ["+d.start + (d.seq ? ","+d.seq:"")+ "]":""); })
		//.text(function(d) { return d.name + " " + d.leafChilds; })
		.text(function(d) { return d.name; })
		.style("fill-opacity", 1e-6);

	// Transition nodes to their new position.
	var nodeUpdate = node.transition()
		.duration(duration)
		.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

	nodeUpdate.select("circle")
		.attr("r", 5)
		.style("fill", function(d) { return d._children ? "#ddd" : "#fff"; })
		.style("stroke", function(d) { return d._children ? "#bbb" : colorlist[d.seq]; });

	nodeUpdate.select("text")
		.style("fill-opacity", 1);

	// Transition exiting nodes to the parent's new position.
	var nodeExit = node.exit().transition()
		.duration(duration)
		.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
		.remove();

	nodeExit.select("circle")
		.attr("r", 1e-6);

	nodeExit.select("text")
		.style("fill-opacity", 1e-6);

	// Update the links…
	var link = svg.selectAll("path.link")
		.data(links, function(d) { return d.target.id; });

	// Enter any new links at the parent's previous position.
	link.enter().insert("path", "g")
		.attr("class", "link")
		.style("stroke", function(d) { return d.target._children ? "#ccc" : colorlist[d.target.seq]; })

		.attr("d", function(d) {
			var o = {x: source.x0, y: source.y0};
			return diagonal({source: o, target: o});
		});

	// Transition links to their new position.
	link.transition()
		.duration(duration)
		.attr("d", diagonal);

	// Transition exiting nodes to the parent's new position.
	link.exit().transition()
		.duration(duration)
		.attr("d", function(d) {
			var o = {x: source.x, y: source.y};
			return diagonal({source: o, target: o});
		})
		.remove();

	// Stash the old positions for transition.
	nodes.forEach(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
	});
	}

	// Toggle children on click.
	function click(d) {
	if (d.children) {
		d._children = d.children;
		d.children = null;
	} else {
		d.children = d._children;
		d._children = null;
	}
	update(d);
	}

	function get_add_special_char(i, special_chars){

		var char_end = ""
		if (i<special_chars.length){
			char_end = special_chars[i];
		}
		else{
			var start_ind = 1000, offset = 10;
			char_end = String.fromCharCode(start_ind + i*offset);
		}
		return char_end;
	}


	function check_char(str1, str2){
		return str1.split('').filter(function(n){
			return str2.indexOf(n)!= -1;
		}).length <1;
	}



	return treeBuilder;
};