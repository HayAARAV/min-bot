
import React from 'react';
import { HelpCircle, MessageSquare, Facebook, Youtube, Twitter, Globe, Send } from 'lucide-react';

interface SupportPageProps {
  store: any;
}

const SupportPage: React.FC<SupportPageProps> = ({ store }) => {
  const { config } = store;

  const links = [
      { name: 'Telegram Channel', icon: <Send className="text-sky-400" />, url: config.socialLinks.telegram },
      { name: 'Facebook Page', icon: <Facebook className="text-blue-600" />, url: config.socialLinks.facebook },
      { name: 'YouTube Channel', icon: <Youtube className="text-red-500" />, url: config.socialLinks.youtube },
      { name: 'X / Twitter', icon: <Twitter className="text-slate-100" />, url: config.socialLinks.twitter },
  ];

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center gap-2">
          <HelpCircle className="text-indigo-400" />
          <h1 className="text-2xl font-bold">Support & Community</h1>
      </div>

      <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl text-center">
          <MessageSquare className="text-indigo-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Need Help?</h2>
          <p className="text-slate-400 text-sm mb-6">Our support team is available 24/7 on Telegram. Join our community to stay updated.</p>
          <a 
            href={config.socialLinks.telegram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
          >
              <Send size={18} /> Contact Support
          </a>
      </div>

      <section>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Our Social Links</h3>
          <div className="grid grid-cols-1 gap-3">
              {links.map(link => (
                  <a 
                    key={link.name} 
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all"
                  >
                      <div className="flex items-center gap-3">
                          <div className="bg-slate-800 p-2 rounded-lg">{link.icon}</div>
                          <span className="font-bold text-slate-100">{link.name}</span>
                      </div>
                      <Globe size={18} className="text-slate-600" />
                  </a>
              ))}
          </div>
      </section>

      <div className="mt-8 text-center opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-widest">GYK Mining Platform v1.2.4</p>
          <p className="text-[10px] mt-1">© 2024 All rights reserved.</p>
      </div>
    </div>
  );
};

export default SupportPage;
