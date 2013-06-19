(function() {
	
	window.jsPlumbConnector = {
		stepStartpoint : {
				endpoint:"Dot",
				paintStyle:{ fillStyle:"#CCC",radius:5 },
				isSource:true, 
				maxConnections:-1, 
				connector:[ "Flowchart", { stub:[5, 5], gap:5 } ],
				connectorStyle:{lineWidth:3,
					strokeStyle:"#CCC",
					joinstyle:"round",
					outlineColor:"#CCC",
					outlineWidth:1},
				hoverPaintStyle:{
					lineWidth:3,
					strokeStyle:"gray"},
				connectorHoverStyle:{
					lineWidth:3,
					strokeStyle:"gray"},
                dragOptions:{},
                overlays:[]
		},
		stepEndpoint : {
				endpoint:"Dot",
				paintStyle:{ fillStyle:"#CCC",radius:10 },
				isTarget:true, 
				maxConnections:-1, 
				connector:[ "Flowchart", { stub:[5, 5], gap:5 } ],
				connectorStyle:{lineWidth:3,
					strokeStyle:"#CCC",
					joinstyle:"round",
					outlineColor:"#CCC",
					outlineWidth:1},
				hoverPaintStyle:{
					lineWidth:3,
					strokeStyle:"gray"},
				connectorHoverStyle:{
					lineWidth:3,
					strokeStyle:"gray"},
                dragOptions:{},
                overlays:[]
		},
		allSourceEndpoints : [],
		allTargetEndpoints : [],
		addEndpoints : function(toId, sourceAnchors, targetAnchors) {
			for (var i = 0; i < sourceAnchors.length; i++) {
				var sourceUUID = toId + sourceAnchors[i];
				this.allSourceEndpoints.push(jsPlumb.addEndpoint(toId, this.stepStartpoint, { anchor:sourceAnchors[i], uuid:sourceUUID }));
			}
			for (var j = 0; j < targetAnchors.length; j++) {
				var targetUUID = toId + targetAnchors[j];
				this.allTargetEndpoints.push(jsPlumb.addEndpoint(toId, this.stepEndpoint, { anchor:targetAnchors[j], uuid:targetUUID }));
			}
		},
		init : function() {
			jsPlumb.importDefaults({
				// default drag options
				DragOptions : { cursor: 'pointer', zIndex:2000 },
				// default to blue at one end and green at the other
				EndpointStyles : [{ fillStyle:'#225588' }, { fillStyle:'#558822' }],
				// blue endpoints 7 px; green endpoints 11.
				Endpoints : [ [ "Dot", {radius:3} ], [ "Dot", { radius:3 } ]],
				// the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
				// case it returns the 'labelText' member that we set on each connection in the 'init' method below.
				ConnectionOverlays : [
					//[ "Arrow", { location:0.9 } ],
					[ "Label", { 
						id:"label",
						cssClass:"connector_label"
					}]
				]
			});			

			init = function(connection) {
				//connection.getOverlay("label").setLabel(connection.sourceId.substring(6) + "-" + connection.targetId.substring(6));
			};	
			
			// listen for new connections; initialise them the same way we initialise the connections at startup.
			jsPlumb.bind("jsPlumbConnection", function(connInfo, originalEvent) { 
				console.log("connInfo");
				console.log(connInfo);
				init(connInfo.connection);
				
				connInfo.connection.setLabel((connInfo.sourceEndpoint.connections.length).toString());
				
				this.addStep(connInfo.sourceId, connInfo.targetId);
				
			}.bind(this));
			//
			// listen for clicks on connections, and offer to delete connections on click.
			//
			jsPlumb.bind("click", function(conn, originalEvent) {
				if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
					jsPlumb.detach(conn); 
			});	
			
			jsPlumb.bind("connectionDrag", function(connection) {
				console.log("connection " + connection.id + " is being dragged");
				console.log(connection);
		
			});		
			
			jsPlumb.bind("beforeDetach", function(connection) {
				
				console.log("connection " + connection.id + " is being detached");
				console.log(connection);
		
				var connectionOrdinal = parseInt(connection.getLabel());
				
				console.log("source endpoints");
				for (var connectionIndex in connection.endpoints[0].connections)
				{
					var siblingConnection = connection.endpoints[0].connections[connectionIndex];
					
					var siblingConnectionOrdinal = parseInt(siblingConnection.getLabel());
					
					if (siblingConnectionOrdinal > connectionOrdinal)
					{
						siblingConnection.setLabel((siblingConnectionOrdinal - 1).toString());
					}
					
					console.log(siblingConnection);
				}
				
				jsPlumbConnector.removeStep(connection.endpoints[0].elementId, connection.endpoints[1].elementId);
				
				return true;
			});
			
			
			jsPlumb.bind("connectionDrop", function(connection) {
				console.log(connection);
				console.log("connection " + connection.id + " is being dropped");
				console.log(connection);
			});		
			
			jsPlumb.bind("connectionDragStop", function(connection) {
				console.log("connection " + connection.id + " was dragged");
				console.log(connection);
			});
			
			
		},
		addShape : function(shapeId)
		{
			this.addEndpoints(shapeId, ["RightMiddle"], ["LeftMiddle"]);	
		
			console.log($('#' + shapeId));
			
			console.log('added endpoints');
			
			jsPlumb.draggable(shapeId, {
				start:function(){  
			       console.log('shape drag started');
			       $('body').data('dragging-step', true);
			       //$(".process-step").qtip('disable');
			       //$(this).qtip('api').hide();
			    },  
			    drag:function(){  
			       
			    },  
			    stop:function(){  
			    	console.log('shape drag stopped');
			    	$('body').data('dragging-step', false);
			    	 //$(this).qtip('api').show();
			    	//$(".process-step").qtip( 'enable');
			    }
		    });

		},
		connectShapes : function(parentId, childId)
		{
			jsPlumb.connect({uuids:[parentId + "RightMiddle",childId + "LeftMiddle"]});
			var parentIds = $('#' + childId).data('parentIds');
			if (parentIds == null)
				parentIds = [];
			
			parentIds.push(parentId);
			$('#' + childId).data('parentIds', parentIds);
		},
		addStep : function (parentId, childId)
		{
			var sourceElement = $('#' + parentId);
			var sourceStepData  = sourceElement.data('steps');
			
			if (sourceStepData == null)
				sourceStepData = [];
			
			sourceStepData.push(childId);
			sourceElement.data('steps', sourceStepData);
		},
		removeStep : function (parentId, childId)
		{
			var sourceElement = $('#' + parentId);
			var sourceStepData  = sourceElement.data('steps');
			
			if (sourceStepData == null)
				sourceStepData = [];
			
			var childStep = childId.replace("flowchart_step_","");
			var newSourceStepData = [];
			
			for (var stepIdIndex in sourceStepData)
			{
				var stepIdInstance = sourceStepData[stepIdIndex];
				if (stepIdInstance != childStep)
					newSourceStepData.push(stepIdInstance);
			}
			
			sourceElement.data('steps', newSourceStepData);
		}
	};
})();

function FlowchartDesigner()
{
	
}

FlowchartDesigner.prototype = {
		containerControl : null,
		initialized : false,
		currentX : -1,
		currentY : -1,
		boundsX : -1,
		stepCounter : 0,
		initialize: function(container, onInitialized)
		{
			try
			{
				this.containerControl = container;
				//boundsX = this.containerControl.css('width');
				
				/*
				 *  This file contains the JS that handles the first init of each jQuery demonstration, and also switching
				 *  between render modes.
				 */
				jsPlumb.bind("ready", function() {
					// chrome fix.
					document.onselectstart = function () { return false; };				

					
					
				    // render mode
					var resetRenderMode = function(desiredMode) {
						var newMode = jsPlumb.setRenderMode(desiredMode);
						$(".rmode").removeClass("selected");
						$(".rmode[mode='" + newMode + "']").addClass("selected");		

						$(".rmode[mode='canvas']").attr("disabled", !jsPlumb.isCanvasAvailable());
						$(".rmode[mode='svg']").attr("disabled", !jsPlumb.isSVGAvailable());
						$(".rmode[mode='vml']").attr("disabled", !jsPlumb.isVMLAvailable());

						//var disableList = (newMode === jsPlumb.VML) ? ",.rmode[mode='svg']" : ".rmode[mode='vml']"; 
					//	$(disableList).attr("disabled", true);				
						jsPlumbConnector.init();
						initialized = true;
						onInitialized(null);
					}.bind(this);
					
					resetRenderMode(jsPlumb.SVG);
				}.bind(this));
			}
			catch(e)
			{
				onInitialized(e);
			}
		},
		drawFlowchart: function (processObj, onComplete)
		{
			// to test this we will create a dummy process object and have it draw steps
			
			console.log(processObj);
			
			//add the steps
			for (var stepIndex in processObj.steps)
			{
				var stepInstance = processObj.steps[stepIndex];
				this.addStep(stepInstance);
			}
			
			var getStepById = function(id)
			{
				for (var stepIndex in processObj.steps)
				{
					var stepInstance = processObj.steps[stepIndex];
					if (stepInstance.id == id)
						return stepInstance;
				}
				
				return null;
			}.bind(this);
			
			//wire the relationships
			for (var stepIndex in processObj.steps)
			{
				var stepInstance = processObj.steps[stepIndex];
				
				for (var childStepIdIndex in stepInstance.steps)
				{
					var childStepId = stepInstance.steps[childStepIdIndex];
					var childStep = getStepById(childStepId);
					
					if (childStep != null)
						this.joinSteps(stepInstance, childStep);
				}
			}
			
			onComplete();
			
			
		},
		getProcessObject: function (initialStep)
		{
			var processObj = {steps:{},initialStep:initialStep};
			
			$('.step').each(function()
			{
				var stepObject = $(this).data('processor');
				stepObject.steps =  $(this).data('steps');
				
				processObj.steps[$(this).attr('id')] = stepObject;
			});
			
			console.log(processObj);
			
			return processObj;
		},
		removeStep: function(stepObjectId)
		{
			if (confirm('Are you sure you wish to remove this step?'))
			{
				jsPlumb.detachAllConnections($('#' + stepObjectId));
				jsPlumb.removeAllEndpoints($('#' + stepObjectId));
				$('#' + stepObjectId).remove();
			}
		},
		addStep: function(stepHtml, top, left)
		{
			jsPlumbConnector.addShape(stepHtml.attr('id'));
			
			this.stepCounter ++;
			
		},
		joinSteps: function (parentStep, childStep)
		{
			jsPlumbConnector.connectShapes('flowchart_step_' + parentStep.id, 'flowchart_step_' + childStep.id);
		},
		editStep: function (robotId, stepId)
		{
			if (this.onEditStep != null)
				this.onEditStep(robotId, stepId);
		},
		onEditStep: null,
		getNewStepId: function ()
		{
			var stepId = this.stepCounter;
			
			while($('#flowchart_step_' + stepId).html() != null)
			{
				stepId++;
			}
			
			return stepId;
		}
};