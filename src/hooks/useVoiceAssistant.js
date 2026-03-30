'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Enhanced Voice Assistant — health-specific recovery companion
 * Supports natural language understanding for medical commands
 * Works in English (extendable to Hindi)
 */
export function useVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = useCallback((lang = 'en-US') => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const result = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setTranscript(result);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    synth.cancel();

    // Detect if text is Hindi (contains Devanagari characters)
    const isHindiText = /[\u0900-\u097F]/.test(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = isHindiText ? 0.9 : 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    // Set language explicitly
    utterance.lang = isHindiText ? 'hi-IN' : 'en-US';

    // Pick appropriate voice
    const voices = synth.getVoices();
    if (isHindiText) {
      const hindiVoice = voices.find(v => v.lang === 'hi-IN')
        || voices.find(v => v.lang.startsWith('hi'));
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      const enVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
        || voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synth.speak(utterance);
  }, []);

  const processCommand = useCallback((text, context = {}) => {
    const lower = text.toLowerCase().trim();
    const raw = text.trim(); // Keep original for Devanagari matching
    const isHindi = context.lang === 'hi';

    function respond(action, enResponse, hiResponse) {
      return { action, response: isHindi ? hiResponse : enResponse };
    }

    // Helper: check if input contains any of the given keywords
    function has(...keywords) {
      return keywords.some(k => lower.includes(k) || raw.includes(k));
    }

    // Pain logging
    if (has('pain', 'dard', 'hurt', 'दर्द', 'तकलीफ') && /\d/.test(lower)) {
      const num = parseInt(lower.match(/\d+/)?.[0] || raw.match(/\d+/)?.[0]);
      const level = Math.min(10, num);
      if (level > 6) {
        return { action: 'log_pain', value: level, response: isHindi
          ? `दर्द स्तर ${level} दर्ज कर रहा हूँ। यह काफ़ी ज़्यादा है। कृपया आराम करें और अपनी दवा लें।`
          : `Logging pain level ${level}. That seems high. Please consider resting and taking your prescribed medication.` };
      }
      return { action: 'log_pain', value: level, response: isHindi
        ? `दर्द स्तर ${level} दर्ज कर रहा हूँ। यह सहनीय लगता है। ट्रैक करते रहें और पानी पीते रहें।`
        : `Logging pain level ${level}. That sounds manageable. Keep tracking and stay hydrated.` };
    }

    // How am I doing / recovery status
    if (has('how am i', 'doing', 'status', 'progress', 'kaisa', 'कैसा', 'कैसी', 'प्रगति', 'स्थिति', 'हालत', 'रिकवरी')) {
      const score = context.recoveryScore || 0;
      if (score >= 70) {
        return { action: 'show_recovery', response: isHindi
          ? `आप बहुत अच्छा कर रहे हैं! आपका रिकवरी स्कोर ${score}/100 है। शानदार काम जारी रखें।`
          : `You're doing great! Your recovery score is ${score} out of 100. Keep up the excellent work.` };
      } else if (score >= 50) {
        return { action: 'show_recovery', response: isHindi
          ? `आपका रिकवरी स्कोर ${score}/100 है। अच्छी प्रगति हो रही है। दवाइयाँ समय पर लें।`
          : `Your recovery score is ${score} out of 100. You're making good progress.` };
      }
      return { action: 'show_recovery', response: isHindi
        ? `आपका रिकवरी स्कोर ${score}/100 है। कृपया अपनी रिकवरी योजना का पालन करें।`
        : `Your recovery score is ${score} out of 100. Please follow your recovery plan.` };
    }

    // Medication queries
    if (has('medication', 'medicine', 'dawa', 'tablet', 'dose', 'दवा', 'दवाइयां', 'दवाइयाँ', 'दवाई', 'गोली', 'खुराक')) {
      return respond('show_medications',
        'Opening your medications. Please take them as prescribed by your doctor.',
        'आपकी दवाइयाँ खोल रहा हूँ। कृपया डॉक्टर के निर्देशानुसार लें।');
    }

    // Symptom check-in
    if (has('symptom', 'check-in', 'checkin', 'check in', 'lakshan', 'लक्षण', 'चेक-इन', 'चेकइन', 'जांच')) {
      return respond('show_symptoms',
        'Opening symptom check-in. Record how you\'re feeling — it helps your doctor.',
        'लक्षण चेक-इन खोल रहा हूँ। बताएँ कि आप कैसा महसूस कर रहे हैं।');
    }

    // Calendar / schedule
    if (has('calendar', 'schedule', 'appointment', 'कैलेंडर', 'शेड्यूल', 'अपॉइंटमेंट', 'समय सारणी')) {
      return respond('show_calendar',
        'Opening your calendar. Let me show you what\'s scheduled for today.',
        'आपका कैलेंडर खोल रहा हूँ। आज का शेड्यूल दिखाता हूँ।');
    }

    // Follow-ups
    if (has('follow', 'followup', 'follow-up', 'next visit', 'फॉलो', 'फॉलो-अप', 'अगली मुलाकात')) {
      return respond('show_followups',
        'Opening your follow-up appointments.',
        'आपकी फॉलो-अप अपॉइंटमेंट खोल रहा हूँ।');
    }

    // Doctor notes / recommendations
    if (has('note', 'recommendation', 'doctor said', 'dr.', "doctor's", 'meera', 'arjun', 'sifaarish', 'नोट', 'सिफारिश', 'सिफ़ारिश', 'डॉक्टर', 'मीरा', 'अर्जुन', 'सलाह')) {
      const notes = context.doctorNotes || [];
      if (notes.length === 0) {
        return respond('show_notes',
          'No doctor notes yet. Your doctor will add recommendations after reviewing your progress.',
          'अभी कोई डॉक्टर नोट्स नहीं हैं। आपके डॉक्टर बाद में सिफ़ारिशें जोड़ेंगे।');
      }
      const latest = notes[notes.length - 1];
      return { action: 'show_notes', response: isHindi
        ? `आपके डॉक्टर ${latest.doctorName} ने लिखा: "${latest.title}"। ${latest.content.substring(0, 100)}`
        : `Your doctor ${latest.doctorName} wrote: "${latest.title}". ${latest.content.substring(0, 100)}` };
    }

    // Recovery plan
    if (has('recovery', 'plan', 'exercise', 'task', 'योजना', 'व्यायाम', 'कार्य', 'एक्सरसाइज')) {
      return respond('show_recovery',
        'Showing your recovery plan. Stay consistent with your exercises.',
        'आपकी रिकवरी योजना दिखा रहा हूँ। व्यायाम नियमित करते रहें।');
    }

    // Feeling bad
    if (has('not feeling', 'feel bad', 'feel sick', 'unwell', 'tabiyat', 'तबीयत', 'बीमार', 'ठीक नहीं', 'अच्छा नहीं', 'बुरा', 'खराब')) {
      return respond('log_feeling_bad',
        'I\'m sorry to hear that. Please do a quick check-in. If very unwell, contact your caregiver.',
        'यह सुनकर दुख हुआ। कृपया चेक-इन करें। बहुत बुरा लगे तो देखभालकर्ता से संपर्क करें।');
    }

    // Feeling good
    if (has('feeling good', 'feel great', 'feel better', 'accha', 'अच्छा', 'बेहतर', 'बढ़िया', 'ठीक')) {
      return respond('log_feeling_good',
        'That\'s wonderful! Keep up the great work. Stay strong!',
        'यह सुनकर बहुत अच्छा लगा! मजबूत रहें!');
    }

    // Reminders
    if (has('remind', 'reminder', 'forget', 'याद', 'रिमाइंडर', 'भूल')) {
      return respond('show_medications',
        'Check your calendar for reminders. Take your medicine if it\'s time.',
        'रिमाइंडर के लिए कैलेंडर देखें। अगर दवा का समय है तो अभी लें।');
    }

    // Emergency
    if (has('emergency', 'help me', 'ambulance', 'danger', 'इमरजेंसी', 'एम्बुलेंस', 'खतरा', 'बचाओ')) {
      return respond('emergency',
        'If this is a medical emergency, call your local emergency number immediately!',
        'अगर यह इमरजेंसी है, तो तुरंत अपना इमरजेंसी नंबर कॉल करें!');
    }

    // Greeting
    if (has('hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'नमस्कार', 'हेलो', 'हाय')) {
      return respond('greeting',
        'Hello! I\'m your OmniCare recovery companion. Ask about medications, recovery, or say "help".',
        'नमस्ते! मैं आपका OmniCare रिकवरी साथी हूँ। दवाओं, रिकवरी के बारे में पूछें या "मदद" कहें।');
    }

    // Water / hydration
    if (has('water', 'drink', 'hydrat', 'pani', 'पानी', 'पीना')) {
      return respond('reminder_water',
        'Stay hydrated! Drink at least 8 glasses of water today.',
        'पानी पीते रहें! आज कम से कम 8 गिलास पानी पिएँ।');
    }

    // Rest
    if (has('rest', 'sleep', 'tired', 'thak', 'fatigue', 'आराम', 'नींद', 'थक', 'थकान', 'सोना')) {
      return respond('reminder_rest',
        'Rest is crucial. Try to get 7-8 hours of sleep.',
        'आराम बहुत ज़रूरी है। 7-8 घंटे सोने की कोशिश करें।');
    }

    // Today / aaj — show calendar
    if (has('today', 'आज')) {
      return respond('show_calendar',
        'Let me show you what\'s on your schedule today.',
        'आज का शेड्यूल दिखाता हूँ।');
    }

    // Show / dikhao / dikhaiye — generic show command, try to infer target
    if (has('दिखाओ', 'दिखाइए', 'दिखाइये', 'बताओ', 'बताइए', 'खोलो', 'खोलिए', 'show', 'open')) {
      // Already handled by specific commands above — if we reach here, show dashboard
      return respond('show_recovery',
        'Opening your dashboard. You can ask about specific things like medications, calendar, or recovery.',
        'आपका डैशबोर्ड खोल रहा हूँ। आप दवाइयाँ, कैलेंडर, या रिकवरी के बारे में पूछ सकते हैं।');
    }

    // Help
    if (has('help', 'what can you', 'command', 'madad', 'मदद', 'सहायता', 'क्या कर सकते')) {
      return respond('help',
        'Try: Show medications, Open calendar, How am I doing, Log pain 5, Show doctor notes.',
        'कहें: दवाइयाँ दिखाओ, कैलेंडर खोलो, रिकवरी कैसी है, दर्द 5 दर्ज करो, डॉक्टर नोट्स दिखाओ।');
    }

    return respond('unknown',
      'I didn\'t catch that. Say "help" to see what I can do.',
      'मैं समझ नहीं पाया। "मदद" कहें या दवाइयाँ, कैलेंडर, रिकवरी के बारे में पूछें।');
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    processCommand,
    isSupported: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  };
}
