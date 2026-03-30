'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

export default function PhotoCapture({ patientId }) {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  const analysisResults = [
    { status: 'normal',  label: t('healingWell'),    color: 'text-emerald-600 bg-emerald-50', message: t('healingWellDesc') },
    { status: 'monitor', label: t('monitorClosely'),  color: 'text-amber-600 bg-amber-50',    message: t('monitorCloselyDesc') },
    { status: 'concern', label: t('needsAttention'),  color: 'text-red-600 bg-red-50',        message: t('needsAttentionDesc') },
  ];

  async function analyzeImage(file) {
    // For demo: analyze image color channels via canvas
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 50; // sample 50x50
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, size, size);
          const data = ctx.getImageData(0, 0, size, size).data;

          let redDominant = 0;
          let totalPixels = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            totalPixels++;
            // Red-dominant pixels suggest inflammation/wounds
            if (r > 120 && r > g * 1.3 && r > b * 1.3) redDominant++;
          }
          const redRatio = redDominant / totalPixels;

          if (redRatio > 0.15) {
            resolve(analysisResults[2]); // Needs Attention — significant redness
          } else if (redRatio > 0.05) {
            resolve(analysisResults[1]); // Monitor Closely
          } else {
            resolve(analysisResults[0]); // Healing Well
          }
        } catch {
          resolve(analysisResults[1]); // Default to Monitor if canvas fails
        }
      };
      img.onerror = () => resolve(analysisResults[1]);
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    const url = URL.createObjectURL(file);
    const newPhoto = {
      id: `photo_${Date.now()}`,
      url,
      name: file.name,
      timestamp: new Date().toISOString(),
    };

    setPhotos(prev => [...prev, newPhoto]);

    // Persist to localStorage for doctor visibility
    const { addPatientPhoto } = await import('@/services/storageService');
    addPatientPhoto({
      patientId,
      url: url,
      name: file.name,
      timestamp: new Date().toISOString(),
      analysis: null, // will be updated after analysis
    });

    setAnalyzing(true);
    setAnalysis(null);

    // Run analysis with a realistic delay
    await new Promise(r => setTimeout(r, 2200));
    const result = await analyzeImage(file);
    setAnalysis(result);
    setAnalyzing(false);

    // Update stored photo with analysis result
    const storedPhotos = JSON.parse(localStorage.getItem('recoverai_patientPhotos') || '[]');
    const lastPhoto = storedPhotos[storedPhotos.length - 1];
    if (lastPhoto && lastPhoto.patientId === patientId) {
      lastPhoto.analysis = { status: result.status, label: result.label };
      localStorage.setItem('recoverai_patientPhotos', JSON.stringify(storedPhotos));
    }

    // Auto-alert doctor if concerning
    if (result.status === 'concern') {
      const { addAlert } = await import('@/services/storageService');
      addAlert({
        patientId,
        type: 'photo_concern',
        severity: 'critical',
        title: 'Wound Photo Requires Attention',
        message: 'Patient uploaded a wound photo showing possible signs of infection or inflammation. Immediate review recommended.',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(id) {
    setPhotos(prev => prev.filter(p => p.id !== id));
    if (photos.length <= 1) setAnalysis(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="text-base font-semibold text-text mb-1">{t('photoCapture')}</h3>
      <p className="text-xs text-text-light mb-4">{t('photoDesc')}</p>

      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary-50/50 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <FiCamera className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-text mb-1">{t('takePhoto')}</p>
        <p className="text-xs text-text-light">{t('tapToCapture')}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {photos.map(photo => (
            <div key={photo.id} className="relative shrink-0">
              <img
                src={photo.url}
                alt="Wound photo"
                className="w-20 h-20 rounded-xl object-cover border border-border"
              />
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
              >
                <FiX className="w-3 h-3" />
              </button>
              <span className="absolute bottom-1 left-1 text-[8px] bg-black/60 text-white px-1 rounded">
                {new Date(photo.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span className="text-sm text-blue-700 font-medium">{t('analyzing')}</span>
            </div>
          </motion.div>
        )}

        {analysis && !analyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`mt-4 p-4 rounded-xl border ${analysis.color}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {analysis.status === 'normal' ? (
                  <FiCheck className="w-5 h-5 text-emerald-600" />
                ) : (
                  <FiAlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">{analysis.label}</p>
                <p className="text-xs leading-relaxed">{analysis.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-text-light mt-3 text-center">{t('photosStored')}</p>
    </div>
  );
}
