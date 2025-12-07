import React from 'react';
import { GeneratedScript, Concept } from '../types';
import { Copy, Download, RefreshCw, Volume2 } from 'lucide-react';

interface ScriptViewerProps {
  script: GeneratedScript;
  concept: Concept;
  onClose: () => void;
}

const ScriptViewer: React.FC<ScriptViewerProps> = ({ script, concept, onClose }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(script.content);
    alert('대본이 클립보드에 복사되었습니다.');
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([script.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${concept.title}_대본.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[800px] w-full max-w-5xl mx-auto my-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif mb-1">{concept.title}</h2>
          <p className="text-slate-400 text-sm flex items-center">
            <Volume2 className="w-4 h-4 mr-2" />
            TTS 최적화 포맷 (30분 분량)
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            <Copy className="w-4 h-4 mr-2" />
            복사
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center px-3 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            저장
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#fdfbf7]">
        <div className="max-w-3xl mx-auto prose prose-slate prose-lg">
          <div className="whitespace-pre-wrap font-serif leading-loose text-slate-800 text-lg">
            {script.content}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
        <span>생성 시간: {new Date(script.timestamp).toLocaleString()}</span>
        <div className="flex gap-4">
           {/* Placeholder for future features */}
           <span className="text-xs bg-slate-200 px-2 py-1 rounded">순수 대본 모드</span>
        </div>
      </div>
    </div>
  );
};

export default ScriptViewer;