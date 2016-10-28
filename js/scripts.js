app.directive('sortablejs', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			initSortables(scope);
				
		}  // end jQuery
	};
});

app.directive('daterange', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			$( ".datePicker" ).datepicker();
			$(".dateRangePicker").daterangepicker({
			    onChange: function() { 
			    	console.log($('.dateRangePicker').val()) 
			    	scope.dateRange = $.parseJSON($('.dateRangePicker').val());
			    	scope.$apply();
			    }
			});
				
		}  // end jQuery
	};
});

app.directive('sortablegroups', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {

			$('.groupListings').sortable({
				helper: 'clone',
				stop: function(event, ui) {
					var list=ui.item.parents('.groupListings');
					scope.setGroupOrder(list);
				}
			});

			$('.groupTitle').droppable({
				drop: function(event, ui) {
					var item = ui.draggable;

					var groupid = $(this).attr('groupid');
					var itemid = ui.draggable.attr('itemgroupid');

					scope.changeItemGroup(itemid, groupid);

					$(this).trigger('click');

					initSortables(scope);
				},
				hoverClass: "ui-state-hover",
				accept: '.sortableItem',
				tolerance: 'pointer'
			});
				
		}  // end jQuery
	};
});

function initSortables(scope) {
	$( ".sortableItems" ).sortable({
		helper : 'clone',
		stop: function(event, ui) {
			var list = ui.item.parents('.sortableItems');
			scope.setItemOrder(list);
		}
	});
	$( ".sortableJobs" ).sortable({
		helper : 'clone',
		stop: function(event, ui) {
			var list = ui.item.parents('.sortableJobs');
			scope.setEstimateOrder(list);
		}
	});
}