import {useEffect, useMemo, useState} from 'react';
import type {AuctionItem} from '../data/types';

const templates = [
  {id: 'default', name: '今日拍卖精选', description: '适合每日批量播报的标准版式'},
  {id: 'high-value', name: '高价值标的', description: '突出价格与核心资产信息'},
  {id: 'simple', name: '简洁资讯', description: '更克制的资讯摘要表达'},
] as const;

type TemplateId = typeof templates[number]['id'];
type Stage = '准备数据' | '生成语音' | '渲染视频' | '完成';
type RenderStatus = {status: 'idle' | 'processing' | 'success' | 'error'; stage?: Stage; file?: string; message?: string};

const request = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  const value = await response.json();
  if (!response.ok) throw new Error(value.message ?? '请求失败，请稍后重试。');
  return value as T;
};

const formatTime = (value?: number | string): string => {
  if (value == null || value === '') return '待公布';
  const date = new Date(typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('zh-CN', {month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'});
};

export const App = () => {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState<TemplateId>('default');
  const [loadingItems, setLoadingItems] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [stage, setStage] = useState<Stage>();
  const [downloadUrl, setDownloadUrl] = useState('');
  const [message, setMessage] = useState('');
  const selectedItems = useMemo(() => items.filter((item) => selectedIds.includes(item.id)), [items, selectedIds]);

  useEffect(() => {
    request<AuctionItem[]>('/api/items').then(setItems).catch((error: Error) => setMessage(error.message));
  }, []);

  const fetchItems = async () => {
    setLoadingItems(true);
    setMessage('');
    setDownloadUrl('');
    try {
      const nextItems = await request<AuctionItem[]>('/api/items/fetch', {method: 'POST'});
      setItems(nextItems);
      setSelectedIds([]);
      setMessage(`已拉取 ${nextItems.length} 条今日拍卖数据。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '拉取失败。');
    } finally {
      setLoadingItems(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((itemId) => itemId !== id)
      : current.length < 10 ? [...current, id] : current);
  };

  // POST 保持连接，页面通过短轮询同步服务端实际生成阶段。
  const renderVideo = async () => {
    if (!selectedItems.length) return;
    setRendering(true);
    setStage('准备数据');
    setMessage('');
    setDownloadUrl('');
    const polling = window.setInterval(() => {
      void request<RenderStatus>('/api/video/status')
        .then((status) => {
          if (status.stage) setStage(status.stage);
        })
        .catch(() => undefined);
    }, 800);

    try {
      const result = await request<{status: 'success'; file: string; url: string}>('/api/video/render', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({items: selectedItems, templateId}),
      });
      setStage('完成');
      setDownloadUrl(result.url);
    } catch (error) {
      setStage(undefined);
      setMessage(error instanceof Error ? error.message : '视频生成失败。');
    } finally {
      window.clearInterval(polling);
      setRendering(false);
    }
  };

  return (
    <main className="workspace">
      <header className="hero">
        <div>
          <div className="eyebrow">AUCTION VIDEO STUDIO</div>
          <h1>拍卖视频工作台</h1>
          <p>从今日标的中选择内容，一键生成带语音与字幕的竖版短视频。</p>
        </div>
        <div className="hero-meta">
          <span>本地 MVP</span>
          <strong>{items.length}</strong>
          <small>条可用数据</small>
        </div>
      </header>

      <div className="steps" aria-label="生成步骤">
        {['拉取数据', '选择标的', '选择模板', '生成视频'].map((name, index) => (
          <div className="step" key={name}><b>{String(index + 1).padStart(2, '0')}</b><span>{name}</span></div>
        ))}
      </div>

      <section className="panel fetch-panel">
        <div>
          <span className="section-number">01</span>
          <h2>今日拍卖数据</h2>
          <p>从京东拍卖列表拉取最新标的，并把图片保存到本地。</p>
        </div>
        <button className="primary-button" type="button" onClick={fetchItems} disabled={loadingItems || rendering}>
          {loadingItems ? '正在拉取…' : '拉取今日拍卖数据'}
        </button>
      </section>

      {message && <div className="notice" role="status">{message}</div>}

      <section className="panel">
        <div className="section-heading">
          <div><span className="section-number">02</span><h2>选择拍卖标的</h2></div>
          <span className="selection-count">已选择 {selectedIds.length} / 10</span>
        </div>
        {items.length ? (
          <div className="item-grid">
            {items.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <label className={`item-card${selected ? ' selected' : ''}`} key={item.id}>
                  <input type="checkbox" checked={selected} onChange={() => toggleItem(item.id)} disabled={!selected && selectedIds.length >= 10} />
                  <div className="checkmark" aria-hidden="true">{selected ? '✓' : ''}</div>
                  <img src={`/${item.image}`} alt="" />
                  <div className="item-content">
                    <div className="item-tags"><span>{item.city ?? item.province ?? '地区待定'}</span><span>{item.category ?? '司法拍卖'}</span></div>
                    <h3>{item.title}</h3>
                    <div className="item-footer"><strong>{item.price ?? '价格待定'}</strong><span>结束 {formatTime(item.endTime)}</span></div>
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="empty-state"><b>还没有拍卖数据</b><span>点击上方按钮拉取今日标的</span></div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading"><div><span className="section-number">03</span><h2>选择视频模板</h2></div></div>
        <div className="template-grid">
          {templates.map((template, index) => (
            <label className={`template-card${templateId === template.id ? ' selected' : ''}`} key={template.id}>
              <input type="radio" name="template" value={template.id} checked={templateId === template.id} onChange={() => setTemplateId(template.id)} />
              <span className="template-index">0{index + 1}</span>
              <strong>{template.name}</strong>
              <small>{template.description}</small>
              <i>{templateId === template.id ? '已选择' : '选择模板'}</i>
            </label>
          ))}
        </div>
      </section>

      <section className="generate-panel">
        <div>
          <span className="section-number light">04</span>
          <h2>{downloadUrl ? '视频生成完成' : rendering ? stage : '准备生成视频'}</h2>
          <p>{downloadUrl ? 'MP4 已保存在本地，可以直接下载查看。' : `已选 ${selectedItems.length} 条标的 · ${templates.find((item) => item.id === templateId)?.name}`}</p>
          {rendering && <div className="progress-track"><span className={`progress progress-${stage}`}></span></div>}
        </div>
        {downloadUrl ? (
          <a className="download-button" href={downloadUrl} download>下载视频 <span>MP4</span></a>
        ) : (
          <button className="generate-button" type="button" onClick={renderVideo} disabled={!selectedItems.length || rendering || loadingItems}>
            {rendering ? `${stage}…` : '生成视频'}
          </button>
        )}
      </section>
    </main>
  );
};
