import type {VideoTextLayer} from '../../types/video';

export const TextLayer = ({layer}: {layer: VideoTextLayer}) => (
  <div style={{
    position: 'absolute',
    left: layer.position.x,
    top: layer.position.y,
    maxWidth: 960,
    color: layer.style.color,
    fontSize: layer.style.fontSize,
    fontWeight: layer.style.fontWeight,
    lineHeight: 1.35,
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    transform: 'translate(-50%, -50%)',
    zIndex: 15,
  }}>{layer.text}</div>
);
