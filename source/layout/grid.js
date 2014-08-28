// updates only tested for enyo v2
enyo.kind({
    name:"extras.GridLayout",
    kind:"Layout",
    layoutClass:"extras-grid",
    getClientControls:function() {
        var c$ = this.container.getControls(), controls = [];
        for(var i=0,c;c=c$[i];i++) {
            if(!c.tag) {
                // assuming that an owner proxy doesn't contain another owner proxy to avoid unnecessary recursion
                controls.push.apply(controls, c.getClientControls());
            } else {
                controls.push(c);
            }
        }
        
        return controls;
    },
    // iterates children and repositions them
    positionControls:function() {
        var c = this.getClientControls();
        if(c.length === 0) return;

        var m2 = this.margin*2,
            d = this.getDimensions(),
            colsPerRow = Math.floor(d.width/(m2+this.width)),
            numRows = Math.floor(this.container.children.length/colsPerRow)+1;

        for(var i=0;i<c.length;i++) {
            this.positionControl(c[i], i, colsPerRow, numRows);
        }
        
        var h = Math.floor(c.length/colsPerRow)*(m2+this.height);
        this.container.applyStyle("height", h + "px");
    },
    // does the position calculation for a control and applies the style
    positionControl:function(control, index, colsPerRow, numRows) {
        var m2 = this.margin*2,
            top = (this.collapsed) ? 0 : Math.floor(index/colsPerRow)*(m2+this.height),
            left = (this.collapsed) ? this.alignmentMargin : (index%colsPerRow)*(m2+this.width)+this.alignmentMargin,
            row = Math.floor(index/colsPerRow)+1;

        control.applyStyle("top", top + "px");
        if (colsPerRow < 2 || numRows-row) {
            control.applyStyle("left", left + "px");
        } else { // Da sistemare, non è una soluzione universale
            if (this.align2 === "center") {
                control.applyStyle("left", Math.floor(left+this.width/2+this.margin*(colsPerRow-2)) + "px");
            } else if (this.align2 === "right") {
                control.applyStyle("left", Math.floor(left+this.width+this.margin*(colsPerRow-1)) + "px");
            } else {
                control.applyStyle("left", left + "px");
            }
        }
        control.applyStyle("opacity", (this.collapsed && index !== 0) ? 0 : 1);
    },
    // reflows controls when window.resize event fires (e.g. device rotation)
    reflow:function() {
        this.dim = null;

        // import properties from container
        this.margin = this.container.cellMargin || 0;
        this.collapsed = this.container.gridCollapsed || false;
        this.height = this.container.cellHeight || 100;
        this.width = this.container.cellWidth || 100;
        this.deferTime = this.container.deferTime || 0;
        this.align = this.container.gridAlign || "left";
        this.align2 = this.container.gridAlign2 || "left";

        if(!this.deferTime) {
            this.positionControls();
        } else {
            enyo.job("extras.GridLayout.defer" + this.container.id, enyo.bind(this, "positionControls"), this.deferTime);
        }        
    },
    getDimensions:function() {
        if(!this.dim) {
            /*
             * enyo.dom has a method to support ie8 for getComputedStyle, but it fails with width and height dimensions.
             * Calling enyo.dom.getComputedStyleValue for width and height instead works like a charm.
             */
            // var s = enyo.dom.getComputedStyle(this.container.hasNode());
            this.dim = {
                width: parseInt(enyo.dom.getComputedStyleValue(this.container.hasNode(),"width")),
                height: parseInt(enyo.dom.getComputedStyleValue(this.container.hasNode(),"height"))
            };
            this.calcAlignmentMargin(this.dim);
        }
        
        return this.dim;
    },
    calcAlignmentMargin:function(d) {
        d = d || this.getDimensions();    // fallback to method if not called by getDimensions
        var colsPerRow = Math.floor(d.width/(this.margin*2+this.width)),
            remainder = d.width-(colsPerRow*(this.margin*2+this.width));

        if(this.align === "right") {
            this.alignmentMargin = remainder;
        } else if(this.align === "center") {
            this.alignmentMargin = Math.round(remainder/2);
        } else {
            this.alignmentMargin = 0;
        }
    }
});

enyo.kind({
	name:"extras.Grid",
	kind:"Control",
	layoutKind:"extras.GridLayout"
});
