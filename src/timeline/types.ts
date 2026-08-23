import type {AuctionItem} from '../data/types';
import type {SubtitleCue} from '../subtitles/types';
export type VideoSegment={id:string;type:'intro'|'auction-item'|'outro';narration:string;audioSrc:string;audioDurationSeconds:number;durationInFrames:number;subtitles:SubtitleCue[];boundaryCount:number;item?:AuctionItem};
export type VideoTimeline={fps:number;segments:VideoSegment[];totalFrames:number};
