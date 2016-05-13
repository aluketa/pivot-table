'use strict';

function camelCaseToTitleCase(camelCase) {
    var result = camelCase.replace( /([A-Z])/g, " $1" );
    return result.charAt(0).toUpperCase() + result.slice(1);
}

function getDataFromUrl(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {
                resolve(data);
            },
            error: function(xhr, status, error) {
                reject(xhr, status, error);
            }
        });
    });
}

function pivotData(data, groupBys, summaries) {
    function groupToRow(group, key) {
        return _.extend(
            {rawData: group, key: key},
            _.extend(
                _.object(groupBys, groupBys.map(gb => group[0][gb])),
                _.object(summaries, summaries.map(s => 0))));
    }
    var groups = _.values(_.groupBy(data, function(d) { return _.map(groupBys, function(gb) { return d[gb] }) }));
    var key = 0;
    return groups.map(g => groupToRow(g, key++));
}

var HeaderRow = React.createClass({
   render: function() {
       var groupByHeaders = this.props.groupBys.split(',').map(gb => <th key={gb}>{camelCaseToTitleCase(gb)}</th>);
       var summaryHeaders = this.props.summaries.split(',').map(s => <th key={s}>{camelCaseToTitleCase(s)}</th>);
       return (<thead><tr>{groupByHeaders}{summaryHeaders}</tr></thead>)
   }
});

var GroupRow = React.createClass({
    render: function() {
        var cellKey = 0;
        var groupValues = this.props.groupBys.split(',').map(gb => <td key={cellKey++}>{this.props.row[gb]}</td>);
        var summaryValues = this.props.summaries.split(',').map(s => <td key={cellKey++}>{this.props.row[s]}</td>);
        return (<tr>{groupValues}{summaryValues}</tr>)
    }
});

var PivotTable = React.createClass({
    propTypes: {
        groupBys: React.PropTypes.string.isRequired,
        summaries: React.PropTypes.string.isRequired,
        dataUrl: React.PropTypes.string.isRequired
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        getDataFromUrl(this.props.dataUrl)
            .then(data => this.setState({data: data}))
            .catch((xhr, status, error) => {
                console.error('Failed to retrieve pivot table data from ' + this.props.dataUrl, status, error.toString())
            });
    },
    render: function() {
        var pivotRows = pivotData(this.state.data, this.props.groupBys.split(','), this.props.summaries.split(','));
        var groupRows = pivotRows.map(pr => <GroupRow groupBys={this.props.groupBys} summaries={this.props.summaries} row={pr} key={pr.key}/>);
        return (
            <table className="table table-striped small">
                <HeaderRow groupBys={this.props.groupBys} summaries={this.props.summaries}/>
                <tbody>{groupRows}</tbody>
            </table>
        )
    }
});

window.PivotTable = PivotTable;