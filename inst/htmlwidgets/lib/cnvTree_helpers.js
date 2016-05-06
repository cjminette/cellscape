// D3 EFFECTS FUNCTIONS

/* brush selection ending function
* @param {Object} vizObj
*/
function _brushEnd(vizObj, brush) {
    var selectedSCs = [];
    var extent = d3.event.target.extent();
    if (!brush.empty()) {

        // highlight selected grid cell rows
        d3.selectAll(".groupAnnot").classed("active", function(d) {
            // if any transformation has occurred
            var t = d3.transform(d3.select(this).attr("transform")), 
                t_y = t.translate[1];
            var brushed = extent[0] <= (d.y+vizObj.view.cnv.rowHeight+t_y) && (d.y+t_y) <= extent[1];
            if (brushed) {
                selectedSCs.push(d.single_cell_id);
            }
            return brushed;
        });

        // highlight selected sc's indicators & nodes
        selectedSCs.forEach(function(sc_id) {
            _highlightIndicator(sc_id, vizObj);   
            _highlightNode(sc_id, vizObj);    
        });
    } else {
        d3.select(".cnvSVG").classed("brushed", false)
        d3.selectAll(".gridCell").classed("active", false)

        // reset nodes and indicators
        _resetNodes(vizObj);
        _resetIndicators();
    }

    // clear brush
    d3.select(".brush").call(brush.clear());
}

/* function to check for selections
*/
function _checkForSelections() {
    return ((d3.selectAll(".nodeSelected")[0].length == 0) && // node selection
            (d3.selectAll(".linkSelected")[0].length == 0) && // link selection
            (d3.selectAll(".brushButtonSelected")[0].length == 0) && // brush button not selected
            (d3.selectAll(".scissorsButtonSelected")[0].length == 0)) // scissors button not selected
}

/* mouseover function for group annotations
* highlights indicator & node for all sc's with this group annotation id, highlights group annotation rectangle in legend
* @param {String} group -- group to highlight
* @param {Object} vizObj
*/
function _mouseoverGroupAnnot(group, vizObj) {
    // highlight indicator & node for all sc's with this group annotation id
    vizObj.data.groups[group].forEach(function(sc) {
        _highlightIndicator(sc, vizObj);
        _highlightNode(sc, vizObj);
    })

    // highlight group annotation rectangle in legend
    _highlightGroupAnnotLegendRect(group, vizObj);
}

/* mouseover function for group annotations
* reset indicators, nodes, group annotation rectangles in legend
* @param {Object} vizObj
*/
function _mouseoutGroupAnnot(vizObj) {
    // reset indicators & nodes
    _resetIndicators();
    _resetNodes(vizObj);

    // reset group annotation rectangles in legend
    _resetGroupAnnotLegendRects();
}

/* function to highlight a node in the tree
* @param {String} sc_id -- single cell id
* @param {Object} vizObj
*/
function _highlightNode(sc_id, vizObj) {
    d3.select("#node_" + sc_id)
        .style("fill", vizObj.generalConfig.highlightColour);
}

/* function to highlight a group annotation rectangle in the legend
* @param {String} group_id -- group id
* @param {Object} vizObj
*/
function _highlightGroupAnnotLegendRect(group_id, vizObj) {
    d3.select(".legendGroupRect.group_" + group_id)
        .attr("stroke", vizObj.generalConfig.highlightColour);
}

/* function to unhighlight group annotation rectangles in the legend
*/
function _resetGroupAnnotLegendRects() {
    d3.selectAll(".legendGroupRect")
        .attr("stroke", "none");
}

/* function to highlight indicator for a single cell
* @param {String} sc_id -- single cell id
* @param {Object} vizObj
*/
function _highlightIndicator(sc_id, vizObj) {
    d3.select(".indic.sc_" + sc_id)
        .style("fill-opacity", 1);
}

/* function to reset a node in the tree
* @param {String} sc_id -- single cell id
* @param {Object} vizObj
*/
function _resetNode(sc_id, vizObj) {
    d3.select("#node_" + sc_id)
        .style("fill", function(d) {
            return _getNodeColour(vizObj, d.name);
        });
}

/* function to reset indicator for a single cell
* @param {String} sc_id -- single cell id
*/
function _resetIndicator(sc_id) {
    d3.select(".indic.sc_" + sc_id)
        .style("fill-opacity", 0);
}

/* function to reset all nodes in the tree
* @param {Object} vizObj
*/
function _resetNodes(vizObj) {
    d3.selectAll(".node")
        .style("fill", function(d) {
            return _getNodeColour(vizObj, d.name);
        });
}

/* function to get the colour of a node
* @param {Object} vizObj
* @param {String} sc_id -- single cell id
*/
function _getNodeColour(vizObj, sc_id) {
    // group annotations specified -- colour by group
    if (vizObj.view.groupsSpecified) {
        var group = _.findWhere(vizObj.userConfig.sc_groups, {single_cell_id: sc_id}).group;
        return vizObj.view.colour_assignment[group];
    }
    // no group annotations -- default colour
    return vizObj.generalConfig.defaultNodeColour;
}

/* function to reset all indicators for a single cell
* @param {String} sc_id -- single cell id
*/
function _resetIndicators() {
    d3.selectAll(".indic")
        .style("fill-opacity", 0);
}

/* function to reset all links in the tree
* @param {Object} vizObj
*/
function _resetLinks(vizObj) {
    d3.selectAll(".link")
        .style("stroke", vizObj.generalConfig.defaultLinkColour);
}

/* brush selection button push function
* @param {Object} brush -- brush object
* @param {Object} vizObj
* @param {Object} cnvSVG -- cnv SVG object
*/
function _pushBrushSelectionButton(brush, vizObj, cnvSVG) {

    // deselect brush tool
    if (d3.select(".selectionButton").classed("brushButtonSelected")) {
        // remove brush tool
        d3.select(".brush").remove();

        // remove "brushButtonSelected" class from button
        d3.select(".selectionButton").classed("brushButtonSelected", false); 

        // reset colour of the brush selection button
        d3.select(".selectionButton").attr("fill", vizObj.generalConfig.topBarColour);
    }
    // select brush tool
    else {
        // mark this button as brushButtonSelected
        d3.select(".selectionButton").classed("brushButtonSelected", true); 

        // create brush tool
        cnvSVG.append("g") 
            .attr("class", "brush")
            .call(brush)
            .selectAll('rect')
            .attr('width', vizObj.userConfig.cnvWidth);
    }
}

/* scissors button push function
* @param {Object} vizObj
*/
function _pushScissorsButton(vizObj) {

    // deselect scissors tool
    if (d3.select(".scissorsButton").classed("scissorsButtonSelected")) {
        // remove "scissorsButtonSelected" class from button
        d3.select(".scissorsButton").classed("scissorsButtonSelected", false); 

        // reset colour of the brush scissors button
        d3.select(".scissorsButton").attr("fill", vizObj.generalConfig.topBarColour);
    }
    // select scissors tool
    else {
        // mark this button as scissorsButtonSelected
        d3.select(".scissorsButton").classed("scissorsButtonSelected", true); 
    }
}

// TREE FUNCTIONS

/* function to get the link id for a link data object
* @param {Object} d - link data object
*/
function _getLinkId(d) {
   return "link_" + d.source.name + "_" + d.target.name;
}

/* function for mouseout of link
* @param {Object} vizObj
* @param {Boolean} resetSelectedSCList -- whether or not to reset the seleted sc list
*/
function _linkMouseout(vizObj, resetSelectedSCList) {
    // if there's no node or link selection taking place, or scissors tool on, reset the links
    if (_checkForSelections() || d3.selectAll(".scissorsButtonSelected")[0].length == 1) {
        // reset nodes
        d3.selectAll(".node")
            .style("fill", function(d) {
                return _getNodeColour(vizObj, d.name);
            });

        // reset indicators
        d3.selectAll(".indic")
            .style("fill-opacity", 0);

        // reset links
        d3.selectAll(".link")
            .style("stroke", vizObj.generalConfig.defaultLinkColour);

        // reset list of selected cells & links
        if (resetSelectedSCList) {
            vizObj.view.selectedSCs = [];
            vizObj.view.selectedLinks = [];
        }
    }
};

/* function for mouseover of link
* @param {Object} vizObj
* @param {String} link_id -- id for mousedover link
*/
function _linkMouseover(vizObj, link_id) {
    // if there's no node or link selection taking place
    if (_checkForSelections()) {
        // highlight downstream links
        _downstreamEffects(vizObj, link_id);                     
    }
    // if scissors button is selected
    else if (d3.selectAll(".scissorsButtonSelected")[0].length == 1) {

        // reset lists of selected links and scs
        vizObj.view.selectedSCs = [];
        vizObj.view.selectedLinks = [];

        // highlight downstream links
        _downstreamEffects(vizObj, link_id); 

        // highlight the potentially-cut link red
        d3.select("#"+link_id)
            .style("stroke", "red");
    }
}

/* function for clicked link (tree trimming)
* @param {Object} vizObj
* @param {String} link_id -- id for clicked link
*/
function _linkClick(vizObj, link_id) {
    var userConfig = vizObj.userConfig;

    // if scissors button is selected
    if (d3.selectAll(".scissorsButtonSelected")[0].length == 1) {

        // for each link
        vizObj.view.selectedLinks.forEach(function(link_id) {
            // remove link
            d3.select("#" + link_id).remove();

            // remove link from list of links
            var index = userConfig.link_ids.indexOf(link_id);
            userConfig.link_ids.splice(index, 1);
        })
        // for each single cell
        vizObj.view.selectedSCs.forEach(function(sc_id) {
            d3.select("#node_" + sc_id).remove(); // remove node in tree
            d3.select(".gridCellG.sc_" + sc_id).remove(); // remove copy number profile
            d3.select(".groupAnnot.sc_" + sc_id).remove(); // remove group annotation
            d3.select(".indic.sc_" + sc_id).remove(); // remove indicator

            // remove single cell from list of single cells
            var index = userConfig.sc_ids_ordered.indexOf(sc_id);
            userConfig.sc_ids_ordered.splice(index, 1);
        })

        // adjust copy number matrix to fill the entire space
        d3.timer(_updateTrimmedMatrix(vizObj), 300);
    }
}

/* function for tree node mouseover
* @param {Object} vizObj
* @param {String} sc_id -- single cell id of mousedover node
* @param {Object} nodeTip -- tooltip for node
*/
function _nodeMouseover(vizObj, sc_id, nodeTip) {
    // if there's no node or link selection taking place
    if (_checkForSelections()) {
        // show tooltip
        nodeTip.show(sc_id);

        // highlight node
        _highlightNode(sc_id, vizObj);

        // highlight indicator
        _highlightIndicator(sc_id, vizObj);
    }
}

/* function for tree node mouseout
* @param {Object} vizObj
* @param {String} sc_id -- single cell id of mousedover node
* @param {Object} nodeTip -- tooltip for node
*/
function _nodeMouseout(vizObj, sc_id, nodeTip) {
    // if there's no node or link selection taking place
    if (_checkForSelections()) {
        // hide tooltip
        nodeTip.hide(sc_id);

        // reset node
        _resetNode(sc_id, vizObj);

        // reset indicator
        _resetIndicator(sc_id);
    }
}

/* recursive function to perform downstream effects upon tree link highlighting
* @param {Object} vizObj
* @param link_id -- id for the link that's currently highlighted
*/
function _downstreamEffects(vizObj, link_id) {

    // get target id & single cell id
    var targetRX = new RegExp("link_source_.+_target_(.+)");  
    var target_id = targetRX.exec(link_id)[1];

    // add this target sc and link id to the lists of selected scs and links
    vizObj.view.selectedSCs.push(target_id);
    vizObj.view.selectedLinks.push(link_id);

    // highlight node
    d3.select("#node_" + target_id)
        .style("fill", vizObj.generalConfig.highlightColour);

    // highlight indicator for target
    d3.select(".indic.sc_" + target_id)
        .style("fill-opacity", 1);

    // highlight link
    d3.select("#"+link_id)
        .style("stroke", vizObj.generalConfig.linkHighlightColour);

    // get the targets of this target
    var sourceRX = new RegExp("link_source_" + target_id + "_target_(.+)");
    var targetLinks_of_targetNode = [];
    vizObj.userConfig.link_ids.map(function(id) {
        if (id.match(sourceRX)) {
            targetLinks_of_targetNode.push(id);
        }
    });

    // for each of the target's targets, highlight their downstream links
    targetLinks_of_targetNode.map(function(target_link_id) {
        _downstreamEffects(vizObj, target_link_id);
    });
};


/* function to get order of tree nodes
* param link_ids -- ids for all links in tree
* param node_name -- the name of the current node - start with root
* param nodeOrder -- array of node order - starts empty, appended to as function executes
*/
function _getNodeOrder(link_ids, node_name, nodeOrder) {

    // append this node to the node order array
    nodeOrder.push(node_name);

    // get the targets of this node
    var targetRX = new RegExp("link_source_" + node_name + "_target_(.+)");
    var targets = [];
    link_ids.map(function(id) {
       if (id.match(targetRX)) {
         targets.push(targetRX.exec(id)[1]);
       }
    });

    // for each of the targets, get their own targets
    targets.map(function(target) {
       _getNodeOrder(link_ids, target, nodeOrder);
    });

    return nodeOrder;
 };

/* function to get font size for labels, given their content the size of the nodes that contain them
* @param {Array} labels -- array of node labels
* @param {Number} width -- width of svg element that will contain the label
*/
function _getLabelFontSize(labels, width) {

    // find the longest node label (in terms of # characters)
    var max_n_chars = 0;
    labels.forEach(function(label) {
        // parse integer (if the label is an integer) to remove leading zeros
        var label_parsed_int = parseInt(label, 10); 

        // number of characters in the label
        var n_chars = (!isNaN(label_parsed_int)) ? label_parsed_int.toString().length : label.length;

        // update max label length (# characters)
        if (n_chars > max_n_chars) {
            max_n_chars = n_chars; 
        }
    })

    // get font size, given longest node label (4 pixels per character)
    var aspect_ratio = 7/4; // font aspect ratio of (font height / font width)
    var font_size = (width - 2) / max_n_chars * aspect_ratio;

    return font_size;
}

/* function to retrieve a single cell's descendant tree structure object by its index, 
* or create the single cell as a new root of a tree if it doesn't already exist
* @param {String} sc_id -- id of the single cell
* @param {Array} nodes -- nodes from which to search for node of interest
*/
function _retrieveSCTree(sc_id, nodes) {
   var foundNode = _.findWhere(nodes, {sc_id: sc_id});
   if (!foundNode) {
      nodes.push({name: sc_id, sc_id: sc_id});
      foundNode = _.findWhere(nodes, {sc_id: sc_id});
   }
   return foundNode;
};


/* function to get the tree structure given an array of edges and the root node 
* param {Array} directed_edges -- array of directed edges objects (source, target)
* @param {String} root_sc_id -- single cell id for the root cell
*/
function _getTreeStructure(directed_edges, root_sc_id) {
   var treeStructures = []; // all (descendant) tree structures for all single cells 

   directed_edges.forEach(function(edge) {
      var parent = _retrieveSCTree(edge["source_sc_id"], treeStructures);
      var child = _retrieveSCTree(edge["target_sc_id"], treeStructures);
      if (parent.children) parent.children.push(child);
      else parent.children = [child];
   });

   var treeStructure = _.findWhere(treeStructures, {sc_id: root_sc_id});

   return treeStructure;
};

/* elbow function to draw phylogeny links 
*/
function _elbow(d) {
    return "M" + d.source.x + "," + d.source.y
        + "H" + (d.source.x + (d.target.x-d.source.x)/3)
        + "V" + d.target.y + "H" + d.target.x;
}

/* function to plot the force-directed graph
* @param {Object} vizObj
* @param {Object} nodeTip -- tooltip for node
*/
function _plotForceDirectedGraph(vizObj, nodeTip) {
    var config = vizObj.generalConfig,
        userConfig = vizObj.userConfig;

    // layout function
    var force_layout = d3.layout.force()
        .size([config.treeWidth, config.treeHeight])
        .linkDistance(20)
        .gravity(.09)
        .charge(-20)
        .nodes(userConfig.tree_nodes)
        .links(userConfig.tree_edges)
        .start();

    // plot links
    var link = vizObj.view.treeSVG
        .append("g")
        .classed("links", true)
        .selectAll(".link")
        .data(userConfig.tree_edges)
        .enter().append("line")
        .classed("link", true)
        .attr("id", function(d) { 
            return d.link_id; 
        })
        .attr("stroke",vizObj.generalConfig.defaultLinkColour)
        .attr("stroke-width", "2px")
        .on("mouseover", function(d) {
            _linkMouseover(vizObj, d.link_id);
        })
        .on("mouseout", function(d) { 
            _linkMouseout(vizObj, true); 
        })
        .on("click", function(d) {
            _linkClick(vizObj, d.link_id);
        });

    // plot nodes
    var nodeG = vizObj.view.treeSVG.append("g")
        .classed("nodes", true)
        .selectAll(".node")
        .data(userConfig.tree_nodes)
        .enter()
        .append("g")
        .attr("class", "nodesG");

    // node circles
    var nodeCircle = nodeG.append("circle")
        .classed("node", true)
        .attr("id", function(d) {
            return "node_" + d.name;
        })
        .attr("r", function() {
            // if user wants to display node ids 
            if (userConfig.display_node_ids) {
                return config.tree_w_labels_r;
            }
            // don't display labels
            return config.tree_r
        })
        .style("fill", function(d) {
             return _getNodeColour(vizObj, d.name);
        })
        .style("stroke", "#838181")
        .on('mouseover', function(d) {
            _nodeMouseover(vizObj, d.name, nodeTip);
        })
        .on('mouseout', function(d) {
            _nodeMouseout(vizObj, d.name, nodeTip);
        })
        .call(force_layout.drag);

    // node single cell labels (if user wants to display them)
    if (userConfig.display_node_ids) {

        var nodeLabel = nodeG.append("text")
            .text(function(d) { return parseInt(d.name, 10); })
            .attr("font-size", 
                _getLabelFontSize(_.pluck(userConfig.tree_nodes, "name"), config.tree_w_labels_r * 2))
            .attr("text-anchor", "middle")
            .attr("dy", "+0.35em");
    }

    force_layout.on("tick", function() {

        // radius of nodes
        var r = (userConfig.display_node_ids) ? config.tree_r : config.tree_w_labels_r;

        nodeCircle.attr("cx", function(d) { 
                return d.x = Math.max(r, Math.min(config.treeWidth - r, d.x)); 
            })
            .attr("cy", function(d) { 
                return d.y = Math.max(r, Math.min(config.treeHeight - r, d.y)); 
            });

        if (userConfig.display_node_ids) {
            nodeLabel.attr("x", function(d) { 
                    return d.x = Math.max(r, Math.min(config.treeWidth - r, d.x)); 
                })
                .attr("y", function(d) { 
                    return d.y = Math.max(r, Math.min(config.treeHeight - r, d.y)); 
                });
        }

        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    });
}

/* function to plot classical phylogenetic tree
* @param {Object} vizObj
* @param {Object} nodeTip -- tooltip for node
*/
function _plotClassicalPhylogeny(vizObj, nodeTip) {
    var config = vizObj.generalConfig,
        r = vizObj.generalConfig.tree_r;

    // layout function
    var phylo_layout = d3.layout.tree()           
        .size([config.treeHeight - (r*2), config.treeWidth - (r*2)]);  

    // get tree structure
    var nodes = phylo_layout.nodes(vizObj.data.treeStructure);
    var links = phylo_layout.links(nodes);   

    // swap x and y direction
    nodes.forEach(function(node) {
        node.tmp = node.y + r; // add padding of 1 tree node radius
        node.y = node.x + r; // add padding of 1 tree node radius
        node.x = node.tmp;
        delete node.tmp;
    });

    // create links
    var link = vizObj.view.treeSVG.append("g")
        .classed("treeLinks", true)
        .selectAll(".treeLink")                  
        .data(links)                   
        .enter().append("path")  
        .classed("link", true)                 
        .attr("id", function(d) { 
            d.link_id = "link_source_" + d.source.sc_id + "_target_" + d.target.sc_id;
            return d.link_id; 
        })               
        .attr("d", _elbow)
        .attr("stroke",vizObj.generalConfig.defaultLinkColour)
        .attr("stroke-width", "2px")
        .attr("fill", "none")
        .on("mouseover", function(d) {
            _linkMouseover(vizObj, d.link_id);
        })
        .on("mouseout", function(d) { 
            _linkMouseout(vizObj, true); 
        })
        .on("click", function(d) {
            _linkClick(vizObj, d.link_id);
        });

    // create nodes
    var node = vizObj.view.treeSVG.selectAll(".treeNode")                  
        .data(nodes)                   
        .enter()
        .append("circle")   
        .classed("node", true)
        .attr("id", function(d) {
            return "node_" + d.sc_id;
        })  
        .attr("cx", function(d) { return d.x})
        .attr("cy", function(d) { return d.y})              
        .attr("fill", function(d) {
            return _getNodeColour(vizObj, d.name);
        })
        .attr("r", r)
        .on('mouseover', function(d) {
            _nodeMouseover(vizObj, d.name, nodeTip);
        })
        .on('mouseout', function(d) {
            _nodeMouseout(vizObj, d.name, nodeTip);
        });
}

// GROUP ANNOTATION FUNCTIONS

/* function to get group annotations as object w/properties group : [array of single cells]
* @param {Object} vizObj
*/
function _reformatGroupAnnots(vizObj) {
    var groups = {};

    vizObj.userConfig.sc_groups.forEach(function(sc) {
        if (!groups[sc.group]) {
            groups[sc.group] = [];
        }
        groups[sc.group].push(sc.single_cell_id);
    });

    vizObj.data.groups = groups;
}

// CNV FUNCTIONS

/* function to update copy number matrix upon trimming
*/
function _updateTrimmedMatrix(vizObj) {
    var config = vizObj.generalConfig;

    // keep track of matrix height
    var matrix_height = 0;

    // for each single cell that's still in the matrix
    vizObj.userConfig.sc_ids_ordered.forEach(function(sc_id) {
        // original y-coordinate for this single cell
        var original_sc_index = vizObj.view.original_sc_list.indexOf(sc_id);
        var original_y = (original_sc_index/vizObj.view.cnv.nrows)*(config.cnvHeight-config.chromLegendHeight);

        // new y-coordinate
        var new_sc_index = vizObj.userConfig.sc_ids_ordered.indexOf(sc_id);
        var new_y = (new_sc_index/vizObj.view.cnv.nrows)*(config.cnvHeight-config.chromLegendHeight);

        // y-difference
        var diff_y = original_y - new_y;

        // translate copy number profile & indicator
        d3.select(".gridCellG.sc_" + sc_id)
            .transition()
            .duration(1000)
            .attr("transform", function() {
                return "translate(0," + (-1*diff_y) + ")";
            });
        
        // translate group annotation
        if (vizObj.view.groupsSpecified) {
            d3.select(".groupAnnot.sc_" + sc_id)
                .transition()
                .duration(1000)
                .attr("transform", function() {
                    return "translate(0," + (-1*diff_y) + ")";
                });
        }

        // translate indicator
        d3.select(".indic.sc_" + sc_id)
            .transition()
            .duration(1000)
            .attr("transform", function() {
                return "translate(0," + (-1*diff_y) + ")";
            });

        // update matrix height 
        matrix_height = new_y + vizObj.view.cnv.rowHeight;
    });

    // move chromosome legend up
    d3.selectAll(".chromBox")
        .transition()
        .duration(1000)
        .attr("y", matrix_height);
    d3.selectAll(".chromBoxText")
        .transition()
        .duration(1000)
        .attr("y", matrix_height + (config.chromLegendHeight / 2));
}

/* function to get chromosome min and max values
* @param {Object} vizObj
*/
function _getChromBounds(vizObj) {
    var chroms = vizObj.userConfig.chroms;
    var chrom_bounds = {};

    // for each chromosome
    for (var i = 0; i < chroms.length; i++) {

        // get all the starts and ends of segments for this chromosome
        var cur_chrom_data = _.filter(vizObj.userConfig.cnv_data, function(cnv){ return cnv.chr == chroms[i]; });
        var cur_starts = _.pluck(cur_chrom_data, "start");
        var cur_ends = _.pluck(cur_chrom_data, "end");

        // find the min and max bounds of this chromosome
        chrom_bounds[chroms[i]] = {
            "start": Math.min(...cur_starts),
            "end": Math.max(...cur_ends)
        };
    }

    return chrom_bounds;
}

// COLOUR FUNCTIONS


/* function to calculate colours for group annotations
* @param {Array} groups -- groups in dataset, for which we need colours
*/
function _getColours(groups) {

    var colour_assignment = {};

    var s = 0.95, // saturation
        l = 0.76; // lightness

    // number of nodes
    var n_nodes = groups.length;

    for (var i = 0; i < n_nodes; i++) {
        var h = i/n_nodes;
        var rgb = _hslToRgb(h, s, l); // hsl to rgb
        var col = _rgb2hex("rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")"); // rgb to hex

        colour_assignment[groups[i]] = col;
    }

    return colour_assignment;  
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function _hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


// convert RGB to hex
// http://stackoverflow.com/questions/1740700/get-hex-value-rather-than-rgb-value-using-jquery
function _rgb2hex(rgb) {
     if (  rgb.search("rgb") == -1 ) {
          return rgb;
     } else {
          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
          function hex(x) {
               return ("0" + parseInt(x).toString(16)).slice(-2);
          }
          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
     }
}

// GENERAL FUNCTIONS

/* alphanumeric sorting function
* from: http://stackoverflow.com/questions/4340227/sort-mixed-alpha-numeric-array
*/
function _sortAlphaNum(a,b) {
    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;
    var aA = a.replace(reA, "");
    var bA = b.replace(reA, "");
    if(aA === bA) {
        var aN = parseInt(a.replace(reN, ""), 10);
        var bN = parseInt(b.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
}


/* function to get the mode of an array
* from: http://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
* @param arr -- array of values
*/
function _arrayMode(arr) 
{
    if(arr.length == 0)
        return null;
    var modeMap = {};
    var maxEl = arr[0], maxIntensity = 1;
    for(var i = 0; i < arr.length; i++)
    {
        var el = arr[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxIntensity)
        {
            maxEl = el;
            maxIntensity = modeMap[el];
        }
    }
    return maxEl;
}
