import {Router} from 'express';
import type {AuctionItem} from '../data/types';
import {fetchAndStoreAuctionItems, readStoredAuctionItems} from '../jd/auctionItemStore';
import {renderSelectedVideo, VIDEO_TEMPLATES} from '../video/renderSelectedVideo';
import type {RenderStage, VideoTemplateId} from '../video/renderSelectedVideo';
import type {VideoConfig} from '../types/video';
import {isVideoConfig,readVideoSettings,saveVideoSettings} from '../settings/videoSettings';
import {getSystemUpdateStatus,startSystemUpdate} from '../system/updateService';

type RenderState = {
  // 当前任务状态，MVP 仅维护一个本机渲染任务。
  status: 'idle' | 'processing' | 'success' | 'error';
  // 页面轮询展示的生成阶段。
  stage?: RenderStage;
  // 成功后返回的文件名。
  file?: string;
  // 失败时展示的中文错误信息。
  message?: string;
};

const router = Router();
let renderState: RenderState = {status: 'idle'};
let fetching = false;

const isAuctionItem = (value: unknown): value is AuctionItem => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<AuctionItem>;
  return typeof item.id === 'string'
    && typeof item.title === 'string'
    && typeof item.image === 'string'
    && (item.price === null || typeof item.price === 'string')
    && (item.source === 'DEMO' || item.source === 'JD');
};

const templateIds = new Set<string>(VIDEO_TEMPLATES.map((template) => template.id));

router.get('/health', (_request, response) => {
  response.json({ok: true});
});

router.get('/items', async (_request, response) => {
  response.json(await readStoredAuctionItems());
});

router.post('/items/fetch', async (_request, response) => {
  if (fetching) return response.status(409).json({message: '正在拉取拍卖数据，请稍候。'});
  fetching = true;
  try {
    const items = await fetchAndStoreAuctionItems(10);
    return response.json(items);
  } catch (error) {
    return response.status(500).json({message: error instanceof Error ? error.message : '拉取拍卖数据失败。'});
  } finally {
    fetching = false;
  }
});

router.get('/video/status', (_request, response) => {
  response.json(renderState);
});

router.get('/settings/video',async(_request,response)=>{
  response.json(await readVideoSettings());
});

router.post('/settings/video',async(request,response)=>{
  if(!isVideoConfig(request.body))return response.status(400).json({message:'视频配置格式无效。'});
  try{return response.json(await saveVideoSettings(request.body));}
  catch(error){return response.status(500).json({message:error instanceof Error?error.message:'保存视频配置失败。'});}
});

router.get('/system/update/status',async(_request,response)=>{
  response.json(await getSystemUpdateStatus());
});

router.post('/system/update',async(_request,response)=>{
  try{await startSystemUpdate();return response.json({success:true,message:'更新任务已启动'});}
  catch(error){return response.status(409).json({success:false,message:error instanceof Error?error.message:'启动更新失败。'});}
});

router.post('/video/render', async (request, response) => {
  if (renderState.status === 'processing') {
    return response.status(409).json({message: '已有视频正在生成，请稍候。'});
  }

  const items = request.body?.items;
  const templateId = request.body?.templateId;
  const requestedVideoConfig:unknown = request.body?.videoConfig;
  if (!Array.isArray(items) || items.length === 0 || items.length > 10 || !items.every(isAuctionItem)) {
    return response.status(400).json({message: '请选择 1 到 10 条有效拍卖标的。'});
  }
  if (typeof templateId !== 'string' || !templateIds.has(templateId)) {
    return response.status(400).json({message: '请选择有效的视频模板。'});
  }
  if(requestedVideoConfig!==undefined&&!isVideoConfig(requestedVideoConfig)){
    return response.status(400).json({message:'视频配置格式无效。'});
  }
  const videoConfig:VideoConfig=requestedVideoConfig===undefined?await readVideoSettings():requestedVideoConfig;

  renderState = {status: 'processing', stage: '准备数据'};
  try {
    const file = await renderSelectedVideo({
      items,
      templateId: templateId as VideoTemplateId,
      videoConfig,
      onStage: (stage) => { renderState = {status: stage === '完成' ? 'success' : 'processing', stage}; },
    });
    renderState = {status: 'success', stage: '完成', file};
    return response.json({status: 'success', file, url: `/videos/${encodeURIComponent(file)}`});
  } catch (error) {
    const message = error instanceof Error ? error.message : '视频生成失败。';
    renderState = {status: 'error', message};
    return response.status(500).json({status: 'error', message});
  }
});

export {router as apiRouter};
