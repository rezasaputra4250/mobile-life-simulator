import { Circle, G, Line, Polygon, Svg, Text as SvgText } from 'react-native-svg';
import { Text, View } from 'react-native';

export type RadarAxis = {
  label: string;
  value: number;
  displayValue?: string;
};

type RadarChartProps = {
  axes: RadarAxis[];
  accent?: string;
  scaleMax?: number;
  size?: number;
  accessibilityLabel?: string;
};

function getPoint(index: number, count: number, radius: number, center: number, value = 1) {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
  return {
    x: center + Math.cos(angle) * radius * value,
    y: center + Math.sin(angle) * radius * value,
  };
}

function getPoints(axes: RadarAxis[], radius: number, center: number, values: number[]) {
  return axes
    .map((_, index) => getPoint(index, axes.length, radius, center, values[index]))
    .map((point) => `${point.x},${point.y}`)
    .join(' ');
}

export function RadarChart({
  axes,
  accent = '#e7bd68',
  scaleMax,
  size = 220,
  accessibilityLabel = 'Diagram radar karakter',
}: RadarChartProps) {
  if (axes.length < 3 || axes.length > 6) return null;

  const center = size / 2;
  const radius = size * 0.31;
  const maxValue = Math.max(10, scaleMax ?? 0, ...axes.map((axis) => Math.max(0, axis.value)));
  const normalizedValues = axes.map((axis) => Math.min(1, Math.max(0, axis.value / maxValue)));
  const gridLevels = [0.33, 0.66, 1];

  return (
    <View accessible accessibilityLabel={accessibilityLabel}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {gridLevels.map((level) => (
            <Polygon
              key={`grid-${level}`}
              points={getPoints(axes, radius, center, axes.map(() => level))}
              fill="none"
              stroke="#484132"
              strokeWidth={1}
            />
          ))}
          {axes.map((axis, index) => {
            const point = getPoint(index, axes.length, radius, center);
            return (
              <Line
                key={`axis-${axis.label}`}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="#3b3428"
                strokeWidth={1}
              />
            );
          })}
          <Polygon
            points={getPoints(axes, radius, center, normalizedValues)}
            fill={`${accent}35`}
            stroke={accent}
            strokeWidth={2}
          />
          {axes.map((axis, index) => {
            const point = getPoint(index, axes.length, radius, center, normalizedValues[index]);
            return <Circle key={`value-${axis.label}`} cx={point.x} cy={point.y} r={3} fill={accent} />;
          })}
          {axes.map((axis, index) => {
            const point = getPoint(index, axes.length, radius + 22, center);
            const anchor = point.x < center - 6 ? 'end' : point.x > center + 6 ? 'start' : 'middle';
            return (
              <SvgText
                key={`label-${axis.label}`}
                x={point.x}
                y={point.y}
                fill="#c5beb0"
                fontSize={9}
                fontWeight="600"
                textAnchor={anchor}
              >
                {axis.label}
              </SvgText>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

type RadarCardProps = RadarChartProps & {
  title: string;
  description: string;
  emptyMessage?: string;
};

export function RadarCard({ title, description, emptyMessage, axes, ...chartProps }: RadarCardProps) {
  const canRenderChart = axes.length >= 3 && axes.length <= 6;

  return (
    <View className="flex-1 rounded-2xl border border-[#2d2e35] bg-[#1b1c22] p-4">
      <Text className="text-base font-black text-[#f5f0e6]">{title}</Text>
      <Text className="mt-1 text-[10px] leading-4 text-[#85838a]">{description}</Text>
      {canRenderChart ? (
        <View className="mt-3 items-center">
          <RadarChart
            axes={axes}
            accessibilityLabel={`Diagram radar ${title.toLowerCase()}`}
            {...chartProps}
          />
        </View>
      ) : (
        <View className="min-h-[220px] items-center justify-center">
          <Text className="text-center text-xs leading-5 text-[#85838a]">
            {emptyMessage || 'Data belum tersedia.'}
          </Text>
        </View>
      )}
      {canRenderChart ? (
        <View className="mt-1 gap-1">
          {axes.map((axis) => (
            <View key={axis.label} className="flex-row items-center justify-between">
              <Text className="text-[10px] text-[#85838a]">{axis.label}</Text>
              <Text className="text-[10px] font-black text-[#e7bd68]">
                {axis.displayValue ?? Math.round(axis.value)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
