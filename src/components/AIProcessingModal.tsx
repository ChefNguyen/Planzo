import React, { useState, useEffect } from 'react';
import { Sparkles, Plane, MapPin, CheckCircle2, Clock, Globe, Cpu } from 'lucide-react';

interface AIProcessingModalProps {
  destination: string;
  vibes: string[];
}

export const AIProcessingModal: React.FC<AIProcessingModalProps> = ({ destination, vibes }) => {
  const [progress, setProgress] = useState(15);
  const [step, setStep] = useState<number>(1);
  const [logs, setLogs] = useState<Array<{ time: string; text: string; highlight?: boolean }>>([]);

  const destName = (destination || '').trim() || 'Tokyo, Japan';
  const vibeText = Array.isArray(vibes) && vibes.length > 0 ? vibes.join(' & ') : 'Curated Escapes';

  useEffect(() => {
    // Progress animation timeline
    const timer1 = setTimeout(() => {
      setProgress(35);
      setStep(1);
      setLogs((prev) => [
        ...prev,
        { time: getTime(), text: `Vibe Sync: Analyzing intent for "${vibeText}"...` },
      ]);
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(65);
      setStep(2);
      setLogs((prev) => [
        ...prev,
        { time: getTime(), text: `Google Places API: Scouting real-time locations in ${destName}...` },
      ]);
    }, 1200);

    const timer3 = setTimeout(() => {
      setProgress(88);
      setStep(3);
      setLogs((prev) => [
        ...prev,
        { time: getTime(), text: `Gemini 3.6 Flash: Optimizing travel routes and walking times...`, highlight: true },
      ]);
    }, 2200);

    const timer4 = setTimeout(() => {
      setProgress(98);
      setStep(4);
      setLogs((prev) => [
        ...prev,
        { time: getTime(), text: `Finalizing boarding pass schedule for ${destName}...` },
      ]);
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [destName, vibeText]);

  function getTime() {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-white rounded-none p-6 sm:p-8 border-2 border-[#1b1c19] shadow-[6px_6px_0px_0px_#00696b] relative overflow-hidden my-auto text-[#1b1c19]">

        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-[#00696b] text-white border-2 border-[#1b1c19] rounded-none flex items-center justify-center shadow-[3px_3px_0px_0px_#1b1c19] animate-pulse shrink-0">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-headline font-black text-2xl sm:text-3xl text-[#1b1c19]">
              Dreaming Up Your Escape
            </h2>
            <p className="text-sm text-[#3b4949] mt-0.5 font-medium">
              Gemini AI is handpicking local secrets in <span className="font-bold text-[#00696b]">{destName}</span>.
            </p>
          </div>
        </div>

        {/* Boarding Pass Progress Card */}
        <div className="bg-[#f5f3ee] rounded-none border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] overflow-hidden mb-6 relative">
          <div className="px-5 py-3 flex justify-between items-center bg-white border-b-2 border-[#1b1c19]">
            <div className="flex items-center gap-1.5 text-xs font-headline font-black text-[#00696b] uppercase tracking-wider">
              <Plane className="w-4 h-4" />
              <span>Your Intent</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-headline font-black text-[#a43c12] uppercase tracking-wider">
              <span>Final Plan</span>
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          {/* Flight Path Animation */}
          <div className="p-6">
            <div className="relative h-2 w-full bg-[#e4e2dd] border border-[#1b1c19] mb-6 overflow-visible">
              {/* Active filled line */}
              <div
                className="absolute top-0 left-0 h-full bg-[#00696b] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />

              {/* Moving Airplane */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700"
                style={{ left: `${progress}%` }}
              >
                <div className="bg-[#00696b] text-white p-2 rounded-none border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19]">
                  <Plane className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Step Checkpoints */}
            <div className="grid grid-cols-4 text-center text-xs">
              <div className="flex flex-col items-center gap-1">
                <span className={`font-semibold ${step >= 1 ? 'text-[#00696b]' : 'text-[#6b7a7a]'}`}>Vibe Sync</span>
                {step >= 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00696b]" />
                ) : (
                  <div className="w-3.5 h-3.5 border-2 border-[#1b1c19]" />
                )}
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className={`font-semibold ${step >= 2 ? 'text-[#00696b]' : 'text-[#6b7a7a]'}`}>Local Scouting</span>
                {step >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00696b]" />
                ) : (
                  <div className="w-3.5 h-3.5 border-2 border-[#1b1c19]" />
                )}
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className={`font-semibold ${step >= 3 ? 'text-[#00696b]' : 'text-[#6b7a7a]'}`}>Route Optimization</span>
                {step >= 3 ? (
                  <div className="w-3.5 h-3.5 bg-[#00696b] border border-[#1b1c19] animate-ping" />
                ) : (
                  <div className="w-3.5 h-3.5 border-2 border-[#1b1c19]" />
                )}
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className={`font-semibold ${step >= 4 ? 'text-[#00696b]' : 'text-[#6b7a7a]'}`}>Final Touch</span>
                {step >= 4 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00696b]" />
                ) : (
                  <div className="w-3.5 h-3.5 border-2 border-[#1b1c19]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Realtime API Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="bg-white p-3.5 rounded-none flex items-center gap-3 border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19]">
            <div className="w-9 h-9 rounded-none bg-[#00ced1]/20 text-[#00696b] border border-[#1b1c19] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1b1c19]">Google Places API</div>
              <div className="text-[11px] text-[#6b7a7a]">Fetching real-time busy hours & coordinates...</div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-none flex items-center gap-3 border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19]">
            <div className="w-9 h-9 rounded-none bg-[#fe7e4f]/20 text-[#a43c12] border border-[#1b1c19] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1b1c19]">Gemini 3.6 Flash</div>
              <div className="text-[11px] text-[#6b7a7a]">Synthesizing {vibeText} vibes...</div>
            </div>
          </div>
        </div>

        {/* Live Reasoning Logs Container */}
        <div className="bg-[#1b1c19] text-[#f2f1ec] p-4 rounded-none border-2 border-[#1b1c19] font-mono text-xs max-h-36 overflow-y-auto space-y-1.5 shadow-[3px_3px_0px_0px_#00696b]">
          <div className="text-[#00ced1] font-bold mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[#00ced1]" />
            <span>AI Reasoning Output</span>
          </div>
          {logs.map((l, i) => (
            <div key={i} className={`flex items-start gap-2 ${l.highlight ? 'text-[#5af8fb]' : 'text-gray-300'}`}>
              <span className="text-gray-500 shrink-0">{l.time}</span>
              <span>{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
