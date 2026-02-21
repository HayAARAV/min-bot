
import React from 'react';
import { Newspaper, Bell, ExternalLink } from 'lucide-react';

interface NewsPageProps {
  store: any;
}

const NewsPage: React.FC<NewsPageProps> = ({ store }) => {
  const { news } = store;

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center gap-2">
          <Newspaper className="text-indigo-400" />
          <h1 className="text-2xl font-bold">Latest News</h1>
      </div>

      <div className="flex flex-col gap-6">
          {news.map((item: any) => (
              <article key={item.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
                  <div className="h-40 bg-slate-800 relative overflow-hidden">
                      <img src={`https://picsum.photos/seed/${item.id}/600/400`} alt="News" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full text-white uppercase flex items-center gap-1">
                          <Bell size={10} /> Official Announcement
                      </div>
                  </div>
                  <div className="p-5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">
                          {new Date(item.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h2 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{item.title}</h2>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">
                          {item.content}
                      </p>
                      <button className="text-indigo-400 font-bold text-xs flex items-center gap-1 hover:underline">
                          Read Full Article <ExternalLink size={12} />
                      </button>
                  </div>
              </article>
          ))}
      </div>
    </div>
  );
};

export default NewsPage;
