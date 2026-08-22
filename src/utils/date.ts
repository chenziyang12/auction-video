export const formatShanghaiTime = (value?: number | string): string | null => {
  if (value === undefined || value === null || value === '') return null;
  const numeric = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  const date = new Date(numeric);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('zh-CN', {timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false})
    .format(date).replace('/', '月').replace(' ', '日 ');
};

