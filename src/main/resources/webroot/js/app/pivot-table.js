'use strict';

function camelCaseToTitleCase(camelCase) {
    var result = camelCase.replace( /([A-Z])/g, " $1" );
    return result.charAt(0).toUpperCase() + result.slice(1);
}

var HeaderRow = React.createClass({
   render: function() {
       var headers = this.props.groupBys.split(',').map(gb => <th key={gb}>{camelCaseToTitleCase(gb)}</th>);
       return (<thead><tr>{headers}</tr></thead>)
   }
});

var PivotTable = React.createClass({
    propTypes: {
        groupBys: React.PropTypes.string.isRequired
    },

    render: function() {
        return (
            <table className="table table-striped">
                <HeaderRow groupBys={this.props.groupBys}/>
            </table>
        )
    }
});

window.PivotTable = PivotTable;