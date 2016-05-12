'use strict';

var PivotDemo = React.createClass({
    render: function() {
        return (
            <PivotTable groupBys="accountName,productName" foo="bar"/>
        );
    }
});

ReactDOM.render(
    <PivotDemo/>,
    document.getElementById('demo')
);