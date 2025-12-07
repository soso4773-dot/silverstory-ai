import React, { useState, useRef } from 'react';
import { Sparkles, PenTool, FileText, ChevronDown } from 'lucide-react';
import { Concept, GeneratedScript, GenerationStatus } from './types';
import { generateStoryConcepts, generateFullScriptContent } from './services/geminiService';
import ConceptCard from './components/ConceptCard';
import ScriptViewer from './components/ScriptViewer';
import Button from './components/Button';

const App: React.FC = () => {
  const [referenceText, setReferenceText] = useState('');
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [generatedScripts, setGeneratedScripts] = useState<Record<number, GeneratedScript>>({});
  const [conceptStatus, setConceptStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [scriptStatus, setScriptStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [selectedConceptId, setSelectedConceptId] = useState<number | null>(null);
  
  // Ref for scrolling to sections
  const conceptsRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLDivElement>(null);

  const handleConceptGeneration = async () => {
    if (!referenceText.trim()) {
      alert('참고 대본을 입력해주세요.');
      return;
    }

    setConceptStatus(GenerationStatus.LOADING);
    setConcepts([]);
    setSelectedConceptId(null);
    setGeneratedScripts({});

    try {
      const result = await generateStoryConcepts(referenceText);
      // Ensure we have exactly 3 concepts with proper IDs
      const mappedResult = result.map((c, i) => ({ ...c, id: i + 1 })).slice(0, 3);
      setConcepts(mappedResult);
      setConceptStatus(GenerationStatus.SUCCESS);
      
      // Smooth scroll to concepts
      setTimeout(() => {
        conceptsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error(error);
      alert('컨셉 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      setConceptStatus(GenerationStatus.ERROR);
    }
  };

  const handleScriptGeneration = async (concept: Concept) => {
    setSelectedConceptId(concept.id);
    
    // If we already have a script, just show it
    if (generatedScripts[concept.id]) {
      setTimeout(() => {
        scriptRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    setScriptStatus(GenerationStatus.LOADING);
    try {
      const content = await generateFullScriptContent(concept);
      setGeneratedScripts(prev => ({
        ...prev,
        [concept.id]: {
          conceptId: concept.id,
          content,
          timestamp: Date.now()
        }
      }));
      setScriptStatus(GenerationStatus.SUCCESS);
      
      // Smooth scroll to script
      setTimeout(() => {
        scriptRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error(error);
      alert('대본 생성 중 오류가 발생했습니다.');
      setScriptStatus(GenerationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 p-2 rounded-lg text-white">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900">SilverStory AI</h1>
              <p className="text-xs text-slate-500 font-medium">시니어 감성 맞춤형 오디오 드라마 작가</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-20">
        
        {/* Section 1: Input */}
        <section className="space-y-6">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
              새로운 이야기의 시작
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              참고하고 싶은 대본이나 이야기를 들려주세요.<br/>
              60대 이상 여성들의 마음에 깊은 울림을 줄 수 있는<br/> 
              <span className="font-semibold text-rose-600">완전히 새롭고 감동적인 3가지 이야기</span>를 제안해 드립니다.
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 max-w-4xl mx-auto transition-transform focus-within:scale-[1.01]">
            <div className="relative">
              <label htmlFor="reference" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                참고 대본 / 스토리 입력
              </label>
              <textarea
                id="reference"
                value={referenceText}
                onChange={(e) => setReferenceText(e.target.value)}
                placeholder="여기에 참고할 이야기나 대본을 붙여넣으세요. 이 내용의 키워드를 분석하여 전혀 다른 새로운 인물과 배경의 이야기를 만듭니다..."
                className="w-full h-48 md:h-64 p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none text-base md:text-lg leading-relaxed shadow-inner placeholder-slate-400"
              />
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={handleConceptGeneration}
                  isLoading={conceptStatus === GenerationStatus.LOADING}
                  disabled={!referenceText.trim()}
                  className="shadow-xl"
                >
                  <PenTool className="w-5 h-5 mr-2" />
                  이야기 컨셉 3가지 제안받기
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Concepts Grid */}
        {concepts.length > 0 && (
          <section ref={conceptsRef} className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-center space-x-4">
               <div className="h-px w-16 bg-slate-300"></div>
               <h3 className="text-2xl font-serif font-bold text-slate-800">추천 이야기 컨셉</h3>
               <div className="h-px w-16 bg-slate-300"></div>
            </div>
            
            <p className="text-center text-slate-600 max-w-2xl mx-auto">
              마음에 드는 컨셉을 선택하세요. <br/>
              선택한 컨셉으로 <span className="text-rose-600 font-bold">낭독(TTS)에 최적화된 30분 분량의 대본</span>을 작성해 드립니다.
              <br/><span className="text-sm text-slate-400">(여러 개를 선택해서 각각 대본을 만들 수도 있습니다)</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {concepts.map((concept) => (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  isSelected={selectedConceptId === concept.id}
                  hasScript={!!generatedScripts[concept.id]}
                  isGenerating={scriptStatus === GenerationStatus.LOADING && selectedConceptId === concept.id}
                  onGenerate={handleScriptGeneration}
                />
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Generated Script Viewer */}
        <section ref={scriptRef}>
          {selectedConceptId && generatedScripts[selectedConceptId] ? (
            <div className="animate-slide-up">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <FileText className="text-rose-600" />
                <h3 className="text-2xl font-serif font-bold text-slate-800">완성된 대본</h3>
              </div>
              <ScriptViewer 
                script={generatedScripts[selectedConceptId]} 
                concept={concepts.find(c => c.id === selectedConceptId)!}
                onClose={() => setSelectedConceptId(null)}
              />
            </div>
          ) : (
             // Loading State Placeholder for Script
             scriptStatus === GenerationStatus.LOADING && (
               <div className="flex flex-col items-center justify-center py-20 animate-pulse bg-white rounded-2xl border border-slate-100 shadow-lg max-w-4xl mx-auto">
                 <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-6"></div>
                 <h4 className="text-xl font-serif font-bold text-slate-800 mb-2">대본을 작성하고 있습니다...</h4>
                 <p className="text-slate-500">약 30분 분량의 긴 호흡을 가진 감동적인 이야기를 짓고 있습니다.<br/>잠시만 기다려 주세요.</p>
               </div>
             )
          )}
        </section>
        
        {/* Footer */}
        <footer className="text-center text-slate-400 text-sm py-8">
          <p>&copy; 2024 SilverStory AI. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;