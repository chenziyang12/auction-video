import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const PriceBlock = ({price}: {price: string | null}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const enter = spring({frame: frame - 22, fps, config: {damping: 18, stiffness: 130}});
  if (!price) return null;
  return <div style={{opacity: interpolate(frame, [18, 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), transform: `scale(${interpolate(enter, [0, 1], [0.96, 1])})`, transformOrigin: 'left bottom', margin: '28px 0 42px'}}><div style={{fontSize: 24, color: '#a4a8af', letterSpacing: 4, marginBottom: 10}}>当前价</div><div style={{fontSize: 80, fontWeight: 800, color: '#f1c36a', letterSpacing: -3}}><span style={{fontSize: 35, marginRight: 12}}>¥</span>{price}</div></div>;
};

