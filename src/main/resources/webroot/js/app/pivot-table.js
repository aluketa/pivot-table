'use strict';

import React from 'react';
import {_} from 'underscore';
import $ from 'jquery';

var dropdownStyle = {
    display: 'inline-block',
    marginRight: '10px'
};

var dropdownButtonStyle = {
    backgroundImage: 'none'
};

var clickableStyle = {
    cursor: 'pointer'
};

var drillDownControlStyle = {
    cursor: 'pointer',
    width: '20px'
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

function pivotData(data, groupBys, summaries, sortColumn, sortAscending) {
    function groupToRow(group, key) {
        return _.extend(
            {rawData: group, key: key},
            _.extend(
                _.object(groupBys, groupBys.map(gb => group[0][gb])),
                _.object(summaries, summaries.map(s => _.reduce(_.pluck(group, s), (a, b) => a + b)))));
    }
    var groups = _.values(_.groupBy(data, d => _.map(groupBys, gb => d[gb] )));
    var key = 0;
    var sortedResults = _.sortBy(groups.map(g => groupToRow(g, key++)), r => r[sortColumn]);
    return sortAscending ? sortedResults : sortedResults.reverse();
}

var HeaderRow = React.createClass({
    propTypes: {
        groupBys: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        summaries: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        sortColumn: React.PropTypes.string.isRequired,
        sortAscending: React.PropTypes.bool.isRequired,
        onChange: React.PropTypes.func
    },
    updateSort: function(sortColumn) {
        var newSortAscending = this.props.sortColumn == sortColumn ? !this.props.sortAscending : true;
        this.props.onChange(sortColumn, newSortAscending);
    },
    render: function() {
        var sortClass = this.props.sortAscending ? 'glyphicon glyphicon-arrow-up' : 'glyphicon glyphicon-arrow-down';
        var groupByHeaders = this.props.groupBys.map(gb =>
            <th key={gb} style={clickableStyle} onClick={() => this.updateSort(gb)}>
                {camelCaseToTitleCase(gb)}
                {this.props.sortColumn == gb ? <span className={sortClass}></span> : <span></span>}
            </th>);
        var summaryHeaders = this.props.summaries.map(s =>
            <th key={s} style={clickableStyle} onClick={() => this.updateSort(s)}>
                {camelCaseToTitleCase(s)}
                {this.props.sortColumn == s ? <span className={sortClass}></span> : <span></span>}
            </th>);
       return (<thead><tr><th style={{width: '20px'}}></th>{groupByHeaders}{summaryHeaders}</tr></thead>)
   }
});

var GroupRow = React.createClass({
    propTypes: {
        selectedGroupBys: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        selectedSummaries: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        groupBys: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        summaries: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        row: React.PropTypes.object.isRequired
    },
    getInitialState: function() {
        return {
            showDrillDown: false
        }
    },
    toggleDrillDown: function() {
        var showDrillDown = ! this.state.showDrillDown;
        this.setState({showDrillDown: showDrillDown});
    },
    render: function() {
        var cellKey = 0;
        var groupValues = this.props.selectedGroupBys.map(gb => <td key={cellKey++}>{this.props.row[gb]}</td>);
        var summaryValues = this.props.selectedSummaries.map(s => <td key={cellKey++}>{this.props.row[s]}</td>);
        var drillDownClassName = this.state.showDrillDown ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus';
        var drillDownControl =
            this.props.row.rawData.length > 1
                ? <td style={drillDownControlStyle} onClick={this.toggleDrillDown}><span className={drillDownClassName}></span></td>
                : <td></td>;
        var drillDownColSpan = this.props.groupBys.length + this.props.summaries.length + 1;
        var drillDownRow = (
            <tr>
                <td colSpan={drillDownColSpan}>
                    <PivotTable groupBys={this.props.groupBys}
                                summaries={this.props.summaries}
                                data={this.props.row.rawData}
                                hideControls={true}/>
                </td>
            </tr>
        );
        return (
            <tbody>
                <tr>{drillDownControl}{groupValues}{summaryValues}</tr>
                {this.state.showDrillDown ? drillDownRow : null}
            </tbody>);
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
        groupBys: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        summaries: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        dataUrl: React.PropTypes.string,
        data: React.PropTypes.arrayOf(React.PropTypes.object),
        hideControls: React.PropTypes.bool
    },
    getInitialState: function() {
        return {
            selectedGroupBys: this.props.groupBys.slice(),
            selectedSummaries: this.props.summaries.slice(),
            sortColumn: this.props.groupBys[0] ? this.props.groupBys[0] : this.props.summaries[0] ? this.props.summaries[0] : undefined,
            sortAscending: true,
            data: this.props.data || []
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            sortColumn: nextProps.groupBys[0] ? nextProps.groupBys[0] : nextProps.summaries[0] ? nextProps.summaries[0] : undefined
        });
    },
    componentDidMount: function() {
        if (this.props.dataUrl) {
            getDataFromUrl(this.props.dataUrl)
                .then(data => this.setState({data: data}))
                .catch((xhr, status, error) => {
                    console.error('Failed to retrieve pivot table data from ' + this.props.dataUrl, status, error.toString())
                });
        }
    },
    groupBysUpdated: function(selectedGroupBys) {
        this.setState({selectedGroupBys: selectedGroupBys});
    },
    summariesUpdated: function(selectedSummaries) {
        this.setState({selectedSummaries: selectedSummaries});
    },
    headerRowUpdated: function(sortColumn, sortAscending) {
        this.setState({sortColumn: sortColumn, sortAscending: sortAscending});
    },
    render: function() {
        var pivotRows = pivotData(this.state.data, this.state.selectedGroupBys, this.state.selectedSummaries, this.state.sortColumn, this.state.sortAscending);
        var groupRows = pivotRows.map(pr =>
            <GroupRow selectedGroupBys={this.state.selectedGroupBys}
                      selectedSummaries={this.state.selectedSummaries}
                      groupBys={this.props.groupBys}
                      summaries={this.props.summaries}
                      row={pr}
                      key={pr.key}/>);
        var controls = (
            <div className="row">
                <div className="col-md-12">
                    <DropdownSelection title="Group By" options={this.props.groupBys} onChange={this.groupBysUpdated}/>
                    <DropdownSelection title="Summaries" options={this.props.summaries} onChange={this.summariesUpdated}/>
                    <hr style={{marginTop: '15px', marginBottom: '10px'}}/>
                </div>
            </div>
        );
        return (
            <div>
                {this.props.hideControls ? <span></span> : controls}
                <div className="row">
                    <div className="col-md-12">
                        <table className="table small">
                            <HeaderRow groupBys={this.state.selectedGroupBys}
                                       summaries={this.state.selectedSummaries}
                                       sortColumn={this.state.sortColumn}
                                       sortAscending={this.state.sortAscending}
                                       onChange={this.headerRowUpdated}/>
                            {groupRows}
                        </table>
                    </div>
                </div>
            </div>
        )
    }
});

export default PivotTable;