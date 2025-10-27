import React from 'react';
import {
  abbreviateNumber,
  SORT_ENUM,
  defaultSort,
  getColStyle,
} from '../../utility';
import { TablePercent, TableSparkline } from '../Visualizations';
import Pagination from './Pagination';
import TableHeader from './TableHeader';
import Error from '../Error/Error';
import TableSkeleton from '../Skeletons/TableSkeleton';
import { StyledBody, StyledContainer } from './Styled';

const getColumnMax = (data: any[], field: string, getValue: Function) => {
  const valuesArr = data.reduce((arr, row) => {
    const value = getValue ? getValue(row) : row[field];
    const num = Number(value);
    if (Number.isNaN(num)) {
      return arr;
    }
    arr.push(value);
    return arr;
  }, []);
  return Math.max(...valuesArr);
};

const getColumnMin = (data: any[], field: string, getValue: Function) => {
  const valuesArr = data.reduce((arr, row) => {
    const value = getValue ? getValue(row) : row[field];
    const num = Number(value);
    if (Number.isNaN(num)) {
      return arr;
    }
    arr.push(value);
    return arr;
  }, []);
  return Math.min(...valuesArr);
};

const initialState = {
  currentPage: 0,
  sortState: '',
  sortField: '',
  sortFn: (f: any) => f,
};

type TableProps = {
  data: any[];
  columns: any[];
  loading?: boolean;
  error?: boolean;
  summable?: boolean;
  maxRows?: number;
  paginated?: boolean;
  placeholderMessage?: string;
  pageLength?: number;
  hoverRowColumn?: boolean;
  highlightFn?: Function;
  keyFn?: Function;
  customWidth?: number;
  isBestValueInMatch?: Function;
  overflowAuto?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type TableState = {
  currentPage: number;
  sortState: string;
  sortField: string;
  sortFn: Function;
  scrolled?: boolean;
};

class Table extends React.Component<TableProps, TableState> {
  state: TableState = initialState;
  static renderSumRow({ columns, data }: { columns: any[]; data: any[] }) {
    return (
      <tr>
        {columns.map((column, colIndex) => {
          let total = 0;
          if (column.sumFn) {
            const sumFn =
              typeof column.sumFn === 'function'
                ? column.sumFn
                : (acc: any, row: any) => acc + (row[column.field] || 0);
            total = data.reduce(sumFn, null);
          }

          return (
            <td
              className={column.className}
              key={`${colIndex}_sum`}
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                ...getColStyle(column),
              }}
            >
              {column.sumFn &&
                (column.displaySumFn
                  ? column.displaySumFn(total)
                  : abbreviateNumber(total))}
            </td>
          );
        })}
      </tr>
    );
  }

  innerContainerRef: any = undefined;
  doShrink: boolean = false;

  setTableRef = (node: any) => {
    if (node) {
      this.innerContainerRef = node;
      // only shrink first column if there is enough wiggle room
      this.doShrink =
        this.innerContainerRef?.scrollWidth -
          this.innerContainerRef?.clientWidth >
        90;
      this.innerContainerRef.onscroll = this.handleScroll;
    }
  };

  setCurrentPage = (pageNumber: number) => {
    this.setState({
      currentPage: pageNumber,
    });
  };

  handleScroll = () => {
    const { scrolled } = this.state;
    const { scrollLeft } = this.innerContainerRef;
    if ((!scrolled && scrollLeft) || (scrolled && !scrollLeft)) {
      this.setState({
        scrolled: scrollLeft,
      });
    }
  };

  nextPage = () => {
    this.setState({
      currentPage: this.state.currentPage + 1,
    });
  };

  prevPage = () => {
    this.setState({
      currentPage: this.state.currentPage - 1,
    });
  };

  sortClick = (sortField: string, sortState: string, sortFn: Function) => {
    const { state } = this;
    this.setState({
      sortState:
        sortField === state.sortField
          ? //@ts-expect-error
            SORT_ENUM.next(SORT_ENUM[state.sortState])
          : SORT_ENUM[0],
      sortField,
      sortFn,
    });
  };

  render() {
    const {
      columns,
      loading,
      error,
      summable,
      maxRows,
      paginated,
      placeholderMessage,
      pageLength = 20,
      hoverRowColumn,
      highlightFn,
      keyFn,
      customWidth,
      isBestValueInMatch,
      overflowAuto,
      className,
    } = this.props;
    const { sortState, sortField, sortFn, currentPage, scrolled } = this.state;
    const dataLength = this.props.data.length;
    let { data } = this.props;
    if (maxRows && maxRows <= dataLength) {
      data = data.slice(0, maxRows);
    }
    if (sortField) {
      data = defaultSort(data.slice(0), sortState, sortField, sortFn);
    }
    if (paginated) {
      data = data.slice(
        currentPage * pageLength,
        (currentPage + 1) * pageLength,
      );
    }
    return (
      <StyledBody hoverRowColumn={hoverRowColumn} customWidth={customWidth}>
        {paginated && (
          <Pagination
            numPages={Math.ceil(dataLength / pageLength)}
            currentPage={currentPage}
            nextPage={this.nextPage}
            prevPage={this.prevPage}
            setCurrentPage={this.setCurrentPage}
            place="top"
            pageLength={pageLength}
            length={dataLength}
          />
        )}
        <StyledContainer>
          {loading && <TableSkeleton />}
          {!loading && error && <Error />}
          {!loading && !error && dataLength <= 0 && (
            <div>{placeholderMessage}</div>
          )}
          {!loading && !error && dataLength > 0 && (
            <div
              className={`innerContainer ${scrolled && 'scrolled'} ${
                this.doShrink && 'shrink'
              } ${overflowAuto && 'table-container-overflow-auto'}`}
              ref={this.setTableRef}
            >
              <table className={className}>
                <thead>
                  <TableHeader
                    columns={columns}
                    sortState={sortState}
                    sortField={sortField}
                    sortClick={this.sortClick}
                  />
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr
                      key={(keyFn && keyFn(row)) || index}
                      {...(highlightFn && highlightFn(row))}
                    >
                      {columns.map((column, colIndex) => {
                        const {
                          field,
                          color,
                          center,
                          displayFn,
                          relativeBars,
                          percentBars,
                          percentBarsWithValue,
                          invertBarColor,
                          underline,
                          colColor,
                          sparkline,
                        } = column;
                        const columnSortFn = column.sortFn;
                        const getValue =
                          typeof columnSortFn === 'function'
                            ? columnSortFn
                            : null;
                        const value = getValue ? getValue(row) : row[field];
                        const style = {
                          overflow: `${field === 'kills' ? 'visible' : null}`,
                          marginBottom: 0,
                          textUnderlinePosition: 'under',
                          textDecorationColor: 'rgb(140, 140, 140)',
                          ...getColStyle(column),
                        };

                        if (center) {
                          style.textAlign = 'center';
                        }
                        if (!row) {
                          return (
                            <td
                              key={`${index}_${colIndex}`}
                              style={style}
                              className={column.className}
                            />
                          );
                        }

                        let fieldEl = null;
                        const bars =
                          relativeBars || percentBars || percentBarsWithValue;
                        if (bars) {
                          const altValue =
                            typeof bars === 'function' && percentBarsWithValue
                              ? bars(row)
                              : null;
                          let valEl = null;
                          let barPercentValue = 0;
                          if (relativeBars) {
                            // Relative bars calculates the max for the column
                            // and gets the percentage of value/max
                            // TODO masad-frost memoize or something
                            const min = getColumnMin(data, field, getValue);
                            let max = getColumnMax(data, field, getValue);
                            let valueWithOffset = value;
                            if (!Number.isNaN(Number(min)) && min < 0) {
                              // Rescale to cater for columns with negatives
                              max -= min;
                              valueWithOffset -= min;
                            }

                            const isValidNumber = !Number.isNaN(
                              Number(valueWithOffset),
                            );
                            barPercentValue =
                              max !== 0 && isValidNumber
                                ? Number(
                                    ((valueWithOffset * 100) / max).toFixed(1),
                                  )
                                : 0;
                            valEl = displayFn ? (
                              displayFn(
                                row,
                                column,
                                value,
                                index,
                                barPercentValue,
                              )
                            ) : (
                              <span>{value}</span>
                            );
                          } else {
                            // Percent bars assumes that the value is in decimal
                            barPercentValue =
                              Number((value * 100).toFixed(1)) || 0;
                            valEl = displayFn ? (
                              displayFn(
                                row,
                                column,
                                value,
                                index,
                                barPercentValue,
                              )
                            ) : (
                              <span>{barPercentValue}</span>
                            );
                          }

                          fieldEl = (
                            <TablePercent
                              valEl={valEl}
                              percent={barPercentValue}
                              altValue={altValue}
                              inverse={invertBarColor}
                            />
                          );
                        } else if (displayFn) {
                          fieldEl = displayFn(row, column, value, index);
                        } else if (sparkline) {
                          fieldEl = (
                            <TableSparkline values={value} altValues={[]} />
                          );
                        } else {
                          fieldEl = value;
                        }
                        if (
                          (underline === 'max' || underline === 'min') &&
                          typeof isBestValueInMatch === 'function'
                        ) {
                          style.textDecoration = isBestValueInMatch(
                            field,
                            row,
                            underline,
                          )
                            ? 'underline'
                            : 'none';
                        }
                        const tdStyle =
                          fieldEl && fieldEl.type && fieldEl.type.tdStyle;
                        return (
                          <td
                            key={`${index}_${colIndex}`}
                            style={{ ...style, ...tdStyle }}
                            className={column.className}
                          >
                            {fieldEl}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {summable && Table.renderSumRow({ columns, data })}
                </tbody>
              </table>
            </div>
          )}
        </StyledContainer>
        {paginated && (
          <Pagination
            numPages={Math.ceil(dataLength / pageLength)}
            currentPage={currentPage}
            pageLength={pageLength}
            length={dataLength}
            nextPage={this.nextPage}
            prevPage={this.prevPage}
            setCurrentPage={this.setCurrentPage}
            place="bot"
          />
        )}
      </StyledBody>
    );
  }
}

export default Table;
