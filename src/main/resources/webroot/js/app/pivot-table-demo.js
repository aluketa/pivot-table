'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import PivotTable from './pivot-table.js'

/*var testData = [
    {
        accountName: 'Account 7',
        productName: 'Product 13',
        quantity: 17,
        marketValue: 19
    }
];*/

var PivotDemo = React.createClass({
    render: function() {
        return (
            <PivotTable groupBys={["accountName", "productName"]} summaries={["quantity", "marketValue"]} dataUrl="/rest/data"/>
        );
    }
});

ReactDOM.render(
    <PivotDemo/>,
    document.getElementById('demo')
);