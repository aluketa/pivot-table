'use strict';

let dropdownStyle = {
    display: 'inline-block',
    marginRight: '10px'
};

let dropdownButtonStyle = {
    backgroundImage: 'none'
};

function camelCaseToTitleCase(camelCase) {
    var result = camelCase.replace( /([A-Z])/g, " $1" );
    return result.charAt(0).toUpperCase() + result.slice(1);
}

function getDataFromUrl(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            dataType: 'json',
            success: (data => resolve(data)),
            error: ((xhr, status, error) =>  reject(xhr, status, error))
        });
    });
}

function pivotData(data, groupBys, summaries) {
    function groupToRow(group, key) {
        return _.extend(
            {rawData: group, key: key},
            _.extend(
                _.object(groupBys, groupBys.map(gb => group[0][gb])),
                _.object(summaries, summaries.map(s => _.reduce(_.pluck(group, s), (a, b) => a + b)))));
    }
    var groups = _.values(_.groupBy(data, d => _.map(groupBys, gb => d[gb] )));
    var key = 0;
    return groups.map(g => groupToRow(g, key++));
}

var HeaderRow = React.createClass({
    propTypes: {
        groupBys: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        summaries: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
    },
    render: function() {
       var groupByHeaders = this.props.groupBys.map(gb => <th key={gb}>{camelCaseToTitleCase(gb)}</th>);
       var summaryHeaders = this.props.summaries.map(s => <th key={s}>{camelCaseToTitleCase(s)}</th>);
       return (<thead><tr>{groupByHeaders}{summaryHeaders}</tr></thead>)
   }
});

var GroupRow = React.createClass({
    propTypes: {
        groupBys: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        summaries: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        row: React.PropTypes.object
    },
    render: function() {
        var cellKey = 0;
        var groupValues = this.props.groupBys.map(gb => <td key={cellKey++}>{this.props.row[gb]}</td>);
        var summaryValues = this.props.summaries.map(s => <td key={cellKey++}>{this.props.row[s]}</td>);
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
        this.groupByArray = this.props.groupBys.split(',');
        this.selectedGroupBys = this.groupByArray.slice();
        this.summaryArray = this.props.summaries.split(',');
        this.selectedSummaries = this.summaryArray.slice();
        return {data: []};
    },
    componentDidMount: function() {
        getDataFromUrl(this.props.dataUrl)
            .then(data => this.setState({data: data}))
            .catch((xhr, status, error) => {
                console.error('Failed to retrieve pivot table data from ' + this.props.dataUrl, status, error.toString())
            });
    },
    toggleGroupBy: function(groupBy) {
        if (this.selectedGroupBys.indexOf(groupBy) > -1) {
            this.selectedGroupBys.splice(this.selectedGroupBys.indexOf(groupBy), 1);
        } else {
            this.selectedGroupBys.push(groupBy);
        }
        this.forceUpdate();
    },
    toggleSummary: function(summary) {
        if (this.selectedSummaries.indexOf(summary) > -1) {
            this.selectedSummaries.splice(this.selectedSummaries.indexOf(summary), 1);
        } else {
            this.selectedSummaries.push(summary);
        }
        this.forceUpdate();
    },
    render: function() {
        var pivotRows = pivotData(this.state.data, this.selectedGroupBys, this.selectedSummaries);
        var groupRows = pivotRows.map(pr =>
            <GroupRow groupBys={this.selectedGroupBys} summaries={this.selectedSummaries} row={pr} key={pr.key}/>);
        var groupByOptions = this.groupByArray.map(ga => {
            var isSelected = this.selectedGroupBys.indexOf(ga) > -1;
            return (<li key={ga}>
                <a href="javascript:void(0)" onClick={() => this.toggleGroupBy(ga)}>
                    {isSelected ? <span className="glyphicon glyphicon-ok"></span>: <span>&nbsp;&nbsp;&nbsp;</span>}
                    &nbsp;&nbsp;{camelCaseToTitleCase(ga)}
                </a>
            </li>)});
        var summaryOptions = this.summaryArray.map(s => {
            var isSelected = this.selectedSummaries.indexOf(s) > -1;
            return (<li key={s}>
                <a href="javascript:void(0)" onClick={() => this.toggleSummary(s)}>
                    {isSelected ? <span className="glyphicon glyphicon-ok"></span>: <span>&nbsp;&nbsp;&nbsp;</span>}
                    &nbsp;&nbsp;{camelCaseToTitleCase(s)}
                </a>
            </li>)});
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <div>
                        <div className="dropdown" style={dropdownStyle}>
                            <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" style={dropdownButtonStyle}>
                                Group By &nbsp;
                                <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu">
                                {groupByOptions}
                            </ul>
                        </div>
                        <div className="dropdown" style={dropdownStyle}>
                            <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" style={dropdownButtonStyle}>
                                Summaries &nbsp;
                                <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu">
                                {summaryOptions}
                            </ul>
                        </div>
                            </div>
                        <hr style={{marginTop: '15px', marginBottom: '10px'}}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <table className="table table-striped small">
                            <HeaderRow groupBys={this.selectedGroupBys} summaries={this.selectedSummaries}/>
                            <tbody>{groupRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
});

window.PivotTable = PivotTable;