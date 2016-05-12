'use strict';

function camelCaseToTitleCase(camelCase) {
    var result = camelCase.replace( /([A-Z])/g, " $1" );
    return result.charAt(0).toUpperCase() + result.slice(1);
}

var HeaderRow = React.createClass({
   render: function() {
       var groupByHeaders = this.props.groupBys.split(',').map(gb => <th key={gb}>{camelCaseToTitleCase(gb)}</th>);
       var summaryHeaders = this.props.summaries.split(',').map(s => <th key={s}>{camelCaseToTitleCase(s)}</th>);
       return (<thead><tr>{groupByHeaders}{summaryHeaders}</tr></thead>)
   }
});

var PivotTable = React.createClass({
    propTypes: {
        groupBys: React.PropTypes.string.isRequired,
        summaries: React.PropTypes.string.isRequired
    },

    render: function() {
        return (
            <table className="table table-striped small">
                <HeaderRow groupBys={this.props.groupBys} summaries={this.props.summaries}/>
            </table>
        )
    }
});

window.PivotTable = PivotTable;