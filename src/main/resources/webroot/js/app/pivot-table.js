'use strict';

var dropdownStyle = {
    display: 'inline-block',
    marginRight: '10px'
};

var dropdownButtonStyle = {
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
        row: React.PropTypes.object.isRequired
    },
    render: function() {
        var cellKey = 0;
        var groupValues = this.props.groupBys.map(gb => <td key={cellKey++}>{this.props.row[gb]}</td>);
        var summaryValues = this.props.summaries.map(s => <td key={cellKey++}>{this.props.row[s]}</td>);
        return (<tr>{groupValues}{summaryValues}</tr>)
    }
});

var DropdownSelection = React.createClass({
    propTypes: {
        title: React.PropTypes.string.isRequired,
        options: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        onChange: React.PropTypes.func
    },
    getInitialState: function() {
        return {
            selectedOptions: this.props.options.slice()
        }
    },
    toggleOption: function(option) {
        var selectedOptions = this.state.selectedOptions.slice();
        if (selectedOptions.indexOf(option) > -1) {
            selectedOptions.splice(selectedOptions.indexOf(option), 1)
        } else {
            selectedOptions.push(option);
        }
        this.setState({selectedOptions: selectedOptions});
        this.props.onChange(selectedOptions);
    },
    render: function() {
        var optionElements = this.props.options.map(option => {
            var isSelected = this.state.selectedOptions.indexOf(option) > -1;
            return (<li key={option}>
                <a href="javascript:void(0)" onClick={() => this.toggleOption(option)}>
                    {isSelected ? <span className="glyphicon glyphicon-ok"></span>: <span>&nbsp;&nbsp;&nbsp;</span>}
                    &nbsp;&nbsp;{camelCaseToTitleCase(option)}
                </a>
            </li>)});

        return (<div className="dropdown" style={dropdownStyle}>
            <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" style={dropdownButtonStyle}>
                {this.props.title}&nbsp;
                <span className="caret"></span>
            </button>
            <ul className="dropdown-menu">
                {optionElements}
            </ul>
        </div>);
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
    groupBysUpdated: function(selectedGroupBys) {
        this.selectedGroupBys = selectedGroupBys;
        this.forceUpdate();
    },
    summariesUpdated: function(selectedSummaries) {
        this.selectedSummaries = selectedSummaries;
        this.forceUpdate();
    },
    render: function() {
        var pivotRows = pivotData(this.state.data, this.selectedGroupBys, this.selectedSummaries);
        var groupRows = pivotRows.map(pr =>
            <GroupRow groupBys={this.selectedGroupBys} summaries={this.selectedSummaries} row={pr} key={pr.key}/>);
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <DropdownSelection title="Group By" options={this.groupByArray} onChange={this.groupBysUpdated}/>
                        <DropdownSelection title="Summaries" options={this.summaryArray} onChange={this.summariesUpdated}/>
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