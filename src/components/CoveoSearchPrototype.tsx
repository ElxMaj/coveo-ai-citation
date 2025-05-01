
import { useState } from 'react';
import { Badge } from './ui/badge';
import { ArrowRight, FileText, Link } from 'lucide-react';

/**
 * CoveoSearchPrototype – Apple-inspired UI/UX
 * ------------------------------------------------------------
 * ▸ Sleek, minimal search experience
 * ▸ Glass morphism effects for cards
 * ▸ Subtle animations and transitions
 * ▸ Apple-like typography and spacing
 * ▸ Sources limited to 3; inline markers must match
 */

interface Source {
  id: number;
  label: string;
  url: string;
  excerpt: string;
  date?: string;
  type: string;
}

interface AnswerData {
  answer: string;
  sources: Source[];
}

export default function CoveoSearchPrototype() {
  const presetQueries = [
    'How does Coveo ML relevance ranking work?',
    'What data sources can Coveo index out-of-the-box?',
    'Steps to integrate Coveo with Salesforce Service Cloud',
  ];
  
  const followUpQuestions = [
    'What is Coveo Machine Learning and how does it improve search results?',
    'How does Coveo handle personalization in enterprise search?',
    'What are Coveo\'s key features for e-commerce search?',
  ];

  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<AnswerData | null>(null);
  const [showSources, setShowSources] = useState(false);

  /**
   * Fetch mock JSON in /src/mock-data based on slugified query.
   */
  const handleSearch = async (q: string) => {
    if (!q) return;
    setQuery(q);
    setShowSources(false);

    const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      let data;
      if (slug.includes('relevance-ranking')) {
        data = await import('../mock-data/relevance-ranking.json');
      } else if (slug.includes('data-sources')) {
        data = await import('../mock-data/data-sources.json');
      } else if (slug.includes('salesforce')) {
        data = await import('../mock-data/salesforce-integration.json');
      } else {
        console.error('No matching mock file for', slug);
        return;
      }
      setAnswer(data);
    } catch (err) {
      console.error('Error loading mock file for', slug, err);
      setAnswer(null);
    }
  };

  // Process answer text with inline sources
  const renderAnswerWithInlineSources = () => {
    if (!answer) return null;
    
    // Make sure all sources have a citation marker in the text
    // If we have sources that are not cited, we need to ensure they appear in the text
    const sourcesInAnswer = answer.sources.map(source => `【${source.id}】`);
    let processedAnswer = answer.answer;
    
    // Create a processed version of the text segments
    const segments = [];
    let lastIndex = 0;
    
    // Find all citation markers and split text accordingly
    const citationPattern = /【\d+】/g;
    let match;
    
    while ((match = citationPattern.exec(processedAnswer)) !== null) {
      // Extract text before this citation
      const currentText = processedAnswer.slice(lastIndex, match.index);
      
      // Add text segment and citation to our segments array
      if (currentText) {
        segments.push({ type: 'text', content: currentText });
      }
      
      segments.push({ 
        type: 'citation', 
        content: match[0],
        id: match[0].match(/\d+/)?.[0] || ''
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text after the last citation
    if (lastIndex < processedAnswer.length) {
      segments.push({ 
        type: 'text', 
        content: processedAnswer.slice(lastIndex) 
      });
    }
    
    // Now render segments with sources placed after periods
    return (
      <div className="text-apple-dark leading-relaxed">
        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            // Find the last period in this text segment
            const lastPeriodIndex = segment.content.lastIndexOf('.');
            
            if (lastPeriodIndex !== -1 && index < segments.length - 1 && segments[index + 1].type === 'citation') {
              // If there's a period and the next segment is a citation,
              // split this text segment at the period
              const beforePeriod = segment.content.slice(0, lastPeriodIndex + 1);
              const afterPeriod = segment.content.slice(lastPeriodIndex + 1);
              
              return (
                <span key={index}>
                  {beforePeriod}
                  <Citation id={segments[index + 1].id} sources={answer.sources} />
                  {showSources && answer.sources.find(s => s.id.toString() === segments[index + 1].id) && (
                    <div className="my-4 ml-6 animate-gentle-appear">
                      <SourceCard source={answer.sources.find(s => s.id.toString() === segments[index + 1].id)!} />
                    </div>
                  )}
                  {afterPeriod}
                </span>
              );
            } else {
              // Regular text with no special handling needed
              return <span key={index}>{segment.content}</span>;
            }
          } else if (segment.type === 'citation') {
            // Skip citations here, they're handled with the preceding text
            return null;
          }
          return null;
        })}
      </div>
    );
  };

  // Get icon based on the source type
  const getSourceIcon = (type: string) => {
    if (type.includes('PDF') || type.includes('Documentation') || type.includes('Guide')) {
      return <FileText size={16} className="mr-2 text-apple-light-text" />;
    } else {
      return <Link size={16} className="mr-2 text-apple-light-text" />;
    }
  };

  return (
    <div className="min-h-screen bg-apple-gray font-sf text-apple-dark flex flex-col items-center">
      {/* Header - Updated with much darker purple gradient */}
      <header className="w-full py-10 bg-gradient-to-r from-[#1A1F2C] to-[#3A1E5D]">
        <div className="flex justify-center items-center">
          <img 
            src="/lovable-uploads/67178166-b63c-4697-b66d-82745bf182af.png" 
            alt="Coveo Logo" 
            className="h-10"
          />
          <h1 className="text-3xl font-medium ml-2 text-white">AI Search</h1>
        </div>
      </header>

      {/* Main container */}
      <main className="w-full max-w-[900px] mt-8 px-4">
        {/* Search Bar - Fixed button alignment */}
        <div className="relative animate-gentle-slide-up">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about Coveo…"
            className="w-full bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl p-5 shadow-soft focus:outline-none focus:ring-2 focus:ring-apple-blue/30 text-lg transition-all duration-300"
          />
          <button
            onClick={() => handleSearch(query)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-apple-blue hover:bg-apple-blue/90 text-white px-6 py-2.5 rounded-xl transition-colors duration-300 text-base font-medium"
          >
            Search
          </button>
        </div>

        {/* Query Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {presetQueries.map((pq) => (
            <button
              key={pq}
              onClick={() => handleSearch(pq)}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white text-apple-dark hover:bg-black/5 transition-colors duration-200 shadow-soft"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Answer Panel (+ inline sources) */}
        {answer && (
          <div className="mt-10 animate-gentle-appear glass rounded-2xl p-8 relative space-y-8 text-lg shadow-medium">
            {/* Expand / Collapse toggle */}
            <button
              onClick={() => setShowSources(!showSources)}
              className="absolute right-8 top-8 text-apple-blue text-sm font-medium flex items-center gap-1 hover:text-apple-blue/80 transition-colors"
            >
              {showSources ? '▲ Hide Sources' : '▼ Show Sources'}
            </button>

            {/* Answer text with inline citations and sources */}
            <div className="text-apple-dark pt-6">
              {renderAnswerWithInlineSources()}
            </div>
            
            {/* Follow-up section - Made smaller */}
            <div className="mt-10 border-t border-black/5 pt-6">
              <div className="flex items-center gap-2 text-apple-dark mb-3">
                <h2 className="text-base font-semibold">Follow-up Questions</h2>
              </div>
              
              <div className="space-y-2">
                {followUpQuestions.slice(0, 3).map((question, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleSearch(question)}
                    className="w-full text-left p-3 bg-white/50 border border-black/5 rounded-xl hover:bg-white/80 transition-all duration-200 flex items-center justify-between group shadow-soft"
                  >
                    <span className="text-apple-dark text-sm">{question}</span>
                    <ArrowRight className="text-apple-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={14} />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sources Used section - Sources from the answer */}
            <div className="mt-10 border-t border-black/5 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Sources Used</h2>
                  <Badge className="bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/20 ml-2">
                    {answer.sources.length} Sources
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {answer.sources.map((source, index) => (
                  <div 
                    key={index} 
                    className="bg-white/50 border border-black/5 rounded-xl p-4 hover:shadow-medium transition-all duration-300"
                  >
                    <h3 className="font-semibold text-apple-dark mb-2 flex items-center">
                      <span className="bg-apple-blue text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">
                        {source.id}
                      </span>
                      <span className="text-sm">{source.label}</span>
                    </h3>
                    <div className="flex items-center">
                      {getSourceIcon(source.type)}
                      <span className="text-xs text-apple-light-text">{source.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Ask anything section */}
            <div className="mt-12 border-t border-black/5 pt-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything about Coveo..."
                  className="w-full bg-white/80 backdrop-blur-sm border border-black/5 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-apple-blue/30 transition-all duration-300"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-apple-blue text-white rounded-full w-7 h-7 flex items-center justify-center">
                  <ArrowRight size={16} />
                </div>
              </div>
              <p className="text-xs text-apple-light-text mt-3 text-center">
                AI responses may be inaccurate. For key decisions, please 
                <a href="#" className="text-apple-blue underline mx-1">contact Coveo Support.</a>
                Learn more about 
                <a href="#" className="text-apple-blue underline ml-1">Coveo's privacy policy.</a>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ✦ Inline citation superscript + on‑hover tooltip preview */
function Citation({ id, sources }: { id: string; sources: Source[] }) {
  const src = sources.find((s) => s.id.toString() === id.toString());
  if (!src) return null;

  return (
    <sup className="relative text-apple-blue hover:cursor-pointer group select-none">
      {`【${id}】`}
      {/* Tooltip */}
      <span className="opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 absolute z-10 ml-1 mt-[-6px] glass rounded-xl p-3 text-xs w-64 shadow-medium">
        <strong className="block mb-1 text-apple-blue">{src.label}</strong>
        <span className="text-apple-dark">{src.excerpt}</span>
        <br />
        <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:underline text-[11px] inline-block mt-1">
          View full source ↗
        </a>
      </span>
    </sup>
  );
}

/* ✦ Full source card */
function SourceCard({ source }: { source: Source }) {
  return (
    <div className="glass p-4 rounded-xl shadow-inner animate-gentle-appear">
      {/* Vertical accent - Changed from neutral to blue color for better contrast */}
      <div className="flex gap-3">
        <span className="w-1 rounded bg-apple-blue"></span>

        <div className="text-sm leading-snug text-apple-dark">
          <div className="font-medium mb-1 flex items-center gap-1">
            <span>{source.type}</span>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:underline ml-1">
              {`Source ${source.id}: ${source.label}`}
            </a>
          </div>
          {source.date && (
            <div className="text-[11px] text-apple-light-text mb-2">{source.date}</div>
          )}
          <p>
            {source.excerpt}{' '}
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:underline">
              View full document ↗
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
