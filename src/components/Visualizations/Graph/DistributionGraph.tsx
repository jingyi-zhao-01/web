import React from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  ComposedChart,
  CartesianGrid,
  Label,
  ResponsiveContainer,
} from 'recharts';
import { StyledTooltip } from './Styled';
import useStrings from '../../../hooks/useStrings.hook';

const DistributionTooltipContent = ({
  payload,
  array,
}: {
  payload?: any;
  array: any[];
}) => {
  const strings = useStrings();
  const data = payload && payload[0] && payload[0].payload;
  const total = array.length ? array[array.length - 1].cumulative_sum : 0;
  return (
    <StyledTooltip>
      <div>{data && data.bin_name}</div>
      <div>
        {data && data.count} {strings.th_players}
      </div>
      <div>
        {data && ((data.cumulative_sum / total) * 100).toFixed(2)}{' '}
        {strings.th_percentile}
      </div>
    </StyledTooltip>
  );
};

const DistributionGraph = ({
  data,
  xTickInterval,
}: {
  data: any[];
  xTickInterval: number | null;
}) => {
  if (data && data.length) {
    return (
      <ResponsiveContainer width="100%" height={600}>
        <ComposedChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 30,
            bottom: 5,
          }}
        >
          <XAxis dataKey="bin_name" interval={xTickInterval || 4}>
            <Label value="" position="insideTopRight" />
          </XAxis>
          <YAxis yAxisId="left" orientation="left" stroke="#1393f9" />
          <YAxis yAxisId="right" orientation="right" stroke="#ff4c4c" />
          <CartesianGrid stroke="#505050" strokeWidth={1} opacity={0.5} />

          <Tooltip content={<DistributionTooltipContent array={data} />} />
          <Bar dataKey="count" yAxisId="left" fill="#1393f9" />
          <Line dataKey="cumulative_sum" yAxisId="right" stroke="#ff4c4c" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }
  return null;
};

export default DistributionGraph;
