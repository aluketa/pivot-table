'use strict';

var PivotDemo = React.createClass({
    render: function() {
        return (
            <PivotTable groupBys="accountName,productName" summaries="quantity,marketValue"/>
        );
    }
});

ReactDOM.render(
    <PivotDemo/>,
    document.getElementById('demo')
);