'use strict';

var PivotDemo = React.createClass({
    render: function() {
        return (
            <PivotTable groupBys="accountName,productName" summaries="quantity,marketValue" dataUrl="/rest/data"/>
        );
    }
});

ReactDOM.render(
    <PivotDemo/>,
    document.getElementById('demo')
);