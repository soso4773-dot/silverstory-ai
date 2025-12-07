import React from 'react';
import { Concept } from '../types';
import { Sparkles, BookOpen, Users } from 'lucide-react';
import Button from './Button';

interface ConceptCardProps {
  concept: Concept;
  onGenerate: (concept: Concept) => void;
  isGenerating: boolean;
  isSelected: boolean;
  hasScript: boolean;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ 
  concept, 
  onGenerate, 
  isGenerating, 
  isSelected,
  hasScript
}) => {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 transition-all duration-300 border-2
      ${isSelected 
        ? 'bg-rose-50 border-rose-400 shadow-xl scale-[1.02]' 
        : 'bg-white border-slate-100 shadow-md hover:shadow-lg hover:border-rose-200'
      }
    `}>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-rose-100 rounded-full opacity-50 blur-xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            <Sparkles className="w-3 h-3 mr-1" />
            {concept.tone}
          </span>
          {hasScript && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
              대본 생성 완료
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2 font-serif leading-tight">
          {concept.title}
        </h3>
        
        <p className="text-sm text-slate-500 font-medium mb-4 italic">
          "{concept.logline}"
        </p>

        <div className="mb-6 space-y-3">
          <div className="bg-white/60 p-3 rounded-lg border border-slate-100">
            <h4 className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <BookOpen className="w-3 h-3 mr-1.5" />
              줄거리
            </h4>
            <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
              {concept.synopsis}
            </p>
          </div>

          <div>
            <h4 className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Users className="w-3 h-3 mr-1.5" />
              등장인물
            </h4>
            <div className="flex flex-wrap gap-1">
              {concept.characters.map((char, idx) => (
                <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Button 
          onClick={() => onGenerate(concept)}
          isLoading={isGenerating && isSelected}
          disabled={isGenerating && !isSelected}
          variant={hasScript ? "secondary" : "primary"}
          className="w-full"
        >
          {hasScript ? '대본 다시 보기 / 재생성' : '이 컨셉으로 대본 만들기'}
        </Button>
      </div>
    </div>
  );
};

export default ConceptCard;