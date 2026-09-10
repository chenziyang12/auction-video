export type VideoPosition = {
  x: number;
  y: number;
};

export type VideoTextStyle = {
  fontSize: number;
  color: string;
  fontWeight: number;
};

export type SubtitleConfig = {
  enabled: boolean;
  /** 留空时继续显示语音时间轴生成的逐句字幕。 */
  text: string;
  position: VideoPosition;
  style: VideoTextStyle & {
    background?: string;
  };
};

export type VideoTextLayer = {
  id: string;
  text: string;
  position: VideoPosition;
  style: VideoTextStyle;
};

export type ContactConfig = {
  enabled: boolean;
  name?: string;
  phone?: string;
  wechat?: string;
};

export type LogoConfig = {
  enabled: boolean;
  url: string;
  opacity: number;
};

export interface VideoConfig {
  subtitle?: Partial<Omit<SubtitleConfig, 'position' | 'style'>> & {
    position?: Partial<VideoPosition>;
    style?: Partial<SubtitleConfig['style']>;
  };
  textLayers?: VideoTextLayer[];
  contact?: Partial<ContactConfig>;
  logo?: Partial<LogoConfig>;
}

export type ResolvedVideoConfig = {
  subtitle: SubtitleConfig;
  textLayers: VideoTextLayer[];
  contact: ContactConfig;
  logo: LogoConfig;
};

export const DEFAULT_VIDEO_CONFIG: ResolvedVideoConfig = {
  subtitle: {
    enabled: true,
    text: '',
    position: {x: 540, y: 1220},
    style: {
      fontSize: 38,
      color: '#ffffff',
      fontWeight: 650,
      background: 'rgba(0,0,0,.72)',
    },
  },
  textLayers: [],
  contact: {enabled: false, name: '', phone: '', wechat: ''},
  logo: {enabled: false, url: '', opacity: 1},
};

export const resolveVideoConfig = (config?: VideoConfig): ResolvedVideoConfig => ({
  subtitle: {
    ...DEFAULT_VIDEO_CONFIG.subtitle,
    ...config?.subtitle,
    position: {...DEFAULT_VIDEO_CONFIG.subtitle.position, ...config?.subtitle?.position},
    style: {...DEFAULT_VIDEO_CONFIG.subtitle.style, ...config?.subtitle?.style},
  },
  textLayers: config?.textLayers ?? DEFAULT_VIDEO_CONFIG.textLayers,
  contact: {...DEFAULT_VIDEO_CONFIG.contact, ...config?.contact},
  logo: {...DEFAULT_VIDEO_CONFIG.logo, ...config?.logo},
});
