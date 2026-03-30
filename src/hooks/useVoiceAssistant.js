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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    // Try to pick a softer voice
    const voices = synth.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synth.speak(utterance);
  }, []);

  const processCommand = useCallback((text, context = {}) => {
    const lower = text.toLowerCase().trim();
    const isHindi = context.lang === 'hi';

    function respond(action, enResponse, hiResponse) {
      return { action, response: isHindi ? hiResponse : enResponse };
    }

    // Pain logging
    if ((lower.includes('pain') || lower.includes('dard') || lower.includes('hurt')) && /\d/.test(lower)) {
      const num = parseInt(lower.match(/\d+/)[0]);
      const level = Math.min(10, num);
      if (level > 6) {
        return { action: 'log_pain', value: level, response: isHindi
          ? `दर्द स्तर ${level} दर्ज कर रहा हूँ। यह काफ़ी ज़्यादा है। कृपया आराम करें और अपनी दवा लें। क्या मैं आपके देखभालकर्ता को सूचित करूँ?`
          : `Logging pain level ${level}. That seems high. Please consider resting and taking your prescribed medication. Should I alert your caregiver?` };
      }
      return { action: 'log_pain', value: level, response: isHindi
        ? `दर्द स्तर ${level} दर्ज कर रहा हूँ। यह सहनीय लगता है। ट्रैक करते रहें और पानी पीते रहें।`
        : `Logging pain level ${level}. That sounds manageable. Keep tracking and stay hydrated.` };
    }

    // How am I doing / recovery status
    if (lower.includes('how am i') || lower.includes('doing') || lower.includes('status') || lower.includes('progress') || lower.includes('kaisa')) {
      const score = context.recoveryScore || 0;
      if (score >= 70) {
        return { action: 'show_recovery', response: isHindi
          ? `आप बहुत अच्छा कर रहे हैं! आपका रिकवरी स्कोर ${score}/100 है। शानदार काम जारी रखें।`
          : `You're doing great! Your recovery score is ${score} out of 100. Keep up the excellent work. You're on track with your recovery plan.` };
      } else if (score >= 50) {
        return { action: 'show_recovery', response: isHindi
          ? `आपका रिकवरी स्कोर ${score}/100 है। अच्छी प्रगति हो रही है। अपने दैनिक कार्य पूरे करें और दवाइयाँ समय पर लें।`
          : `Your recovery score is ${score} out of 100. You're making good progress. Remember to complete your daily tasks and take your medications on time.` };
      }
      return { action: 'show_recovery', response: isHindi
        ? `आपका रिकवरी स्कोर ${score}/100 है। इसे बेहतर करने की कोशिश करें। कृपया अपनी रिकवरी योजना का पालन करें और सभी दवाइयाँ लें।`
        : `Your recovery score is ${score} out of 100. Let's work on improving this. Please make sure you're following your recovery plan and taking all medications.` };
    }

    // Medication queries
    if (lower.includes('medication') || lower.includes('medicine') || lower.includes('dawa') || lower.includes('tablet') || lower.includes('dose')) {
      if (lower.includes('schedule') || lower.includes('when') || lower.includes('next')) {
        return respond('show_medications',
          'Opening your medication schedule. Remember, taking your medicines on time is important for a smooth recovery.',
          'आपका दवा शेड्यूल खोल रहा हूँ। याद रखें, समय पर दवा लेना रिकवरी के लिए ज़रूरी है।');
      }
      return respond('show_medications',
        'Here are your medications. Please take them as prescribed by your doctor.',
        'यहाँ आपकी दवाइयाँ हैं। कृपया डॉक्टर के निर्देशानुसार लें।');
    }

    // Symptom check-in
    if (lower.includes('symptom') || lower.includes('check-in') || lower.includes('checkin') || lower.includes('check in') || lower.includes('lakshan')) {
      return respond('show_symptoms',
        'Opening symptom check-in. Take a moment to honestly record how you\'re feeling — it helps your doctor monitor your recovery.',
        'लक्षण चेक-इन खोल रहा हूँ। ईमानदारी से बताएँ कि आप कैसा महसूस कर रहे हैं — इससे डॉक्टर को आपकी रिकवरी ट्रैक करने में मदद मिलती है।');
    }

    // Calendar / schedule
    if (lower.includes('calendar') || lower.includes('schedule') || lower.includes('appointment') || lower.includes('today')) {
      return respond('show_calendar',
        'Opening your calendar. Let me show you what\'s scheduled for today.',
        'आपका कैलेंडर खोल रहा हूँ। आज का शेड्यूल दिखाता हूँ।');
    }

    // Follow-ups
    if (lower.includes('follow') || lower.includes('followup') || lower.includes('follow-up') || lower.includes('next visit')) {
      return respond('show_followups',
        'Opening your follow-up appointments. Let me show you what\'s coming up.',
        'आपकी फॉलो-अप अपॉइंटमेंट खोल रहा हूँ। आगे क्या आने वाला है दिखाता हूँ।');
    }

    // Doctor notes / recommendations
    if (lower.includes('note') || lower.includes('recommendation') || lower.includes('doctor said') || lower.includes('dr.') || lower.includes('doctor\'s') || lower.includes('meera') || lower.includes('arjun') || lower.includes('sifaarish')) {
      const notes = context.doctorNotes || [];
      if (notes.length === 0) {
        return respond('show_notes',
          'You don\'t have any doctor notes yet. Your doctor will add recommendations after reviewing your progress.',
          'अभी कोई डॉक्टर नोट्स नहीं हैं। आपके डॉक्टर आपकी प्रगति देखने के बाद सिफ़ारिशें जोड़ेंगे।');
      }
      const latest = notes[notes.length - 1];
      return { action: 'show_notes', response: isHindi
        ? `आपके डॉक्टर ${latest.doctorName} ने लिखा: "${latest.title}"। ${latest.content.substring(0, 120)}। आप सभी नोट्स डैशबोर्ड पर देख सकते हैं।`
        : `Your doctor ${latest.doctorName} wrote: "${latest.title}". ${latest.content.substring(0, 120)}. You can see all notes on your dashboard.` };
    }

    // Recovery plan
    if (lower.includes('recovery') || lower.includes('plan') || lower.includes('exercise') || lower.includes('task')) {
      return respond('show_recovery',
        'Showing your recovery plan. You\'re doing well — stay consistent with your exercises and daily tasks.',
        'आपकी रिकवरी योजना दिखा रहा हूँ। अपने व्यायाम और कार्य नियमित करते रहें।');
    }

    // Feeling statements
    if (lower.includes('not feeling') || lower.includes('feel bad') || lower.includes('feel sick') || lower.includes('unwell') || lower.includes('tabiyat')) {
      return respond('log_feeling_bad',
        'I\'m sorry to hear that. Please do a quick check-in so we can track your symptoms. If you feel very unwell, please contact your caregiver or doctor immediately.',
        'यह सुनकर दुख हुआ। कृपया एक चेक-इन करें ताकि हम आपके लक्षण ट्रैक कर सकें। बहुत बुरा लगे तो अपने देखभालकर्ता या डॉक्टर से संपर्क करें।');
    }
    if (lower.includes('feeling good') || lower.includes('feel great') || lower.includes('feel better') || lower.includes('accha')) {
      return respond('log_feeling_good',
        'That\'s wonderful to hear! Keep up the great work. Your body is healing well. Stay strong!',
        'यह सुनकर बहुत अच्छा लगा! बहुत अच्छा काम कर रहे हैं। मजबूत रहें!');
    }

    // Reminders
    if (lower.includes('remind') || lower.includes('reminder') || lower.includes('forget')) {
      return respond('show_medications',
        'I\'ll help you stay on track. Check your calendar for upcoming reminders. Take your medicine now if it\'s time.',
        'मैं आपको ट्रैक पर रखने में मदद करूँगा। आगामी रिमाइंडर के लिए कैलेंडर देखें। अगर दवा का समय है तो अभी लें।');
    }

    // Emergency
    if (lower.includes('emergency') || lower.includes('help me') || lower.includes('ambulance') || lower.includes('danger')) {
      return respond('emergency',
        'If this is a medical emergency, please call your local emergency number immediately. I\'m also alerting your caregiver and doctor.',
        'अगर यह मेडिकल इमरजेंसी है, तो कृपया तुरंत अपना स्थानीय इमरजेंसी नंबर कॉल करें। मैं आपके देखभालकर्ता और डॉक्टर को भी सूचित कर रहा हूँ।');
    }

    // Greeting
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('namaste')) {
      return respond('greeting',
        'Hello! I\'m your OmniCare recovery companion. You can ask me about your medications, recovery progress, or log how you\'re feeling. How can I help you today?',
        'नमस्ते! मैं आपका OmniCare रिकवरी साथी हूँ। आप मुझसे अपनी दवाओं, रिकवरी प्रगति के बारे में पूछ सकते हैं। आज मैं आपकी कैसे मदद कर सकता हूँ?');
    }

    // Water / hydration
    if (lower.includes('water') || lower.includes('drink') || lower.includes('hydrat') || lower.includes('pani')) {
      return respond('reminder_water',
        'Great reminder! Staying hydrated is very important for recovery. Try to drink at least 8 glasses of water today. Your body needs it to heal.',
        'बहुत अच्छा! पानी पीना रिकवरी के लिए बहुत ज़रूरी है। आज कम से कम 8 गिलास पानी पिएँ।');
    }

    // Rest
    if (lower.includes('rest') || lower.includes('sleep') || lower.includes('tired') || lower.includes('thak') || lower.includes('fatigue')) {
      return respond('reminder_rest',
        'Rest is crucial for your recovery. Please try to get 7-8 hours of sleep. If you\'re feeling very tired, it\'s okay to take a short nap. Listen to your body.',
        'आराम आपकी रिकवरी के लिए बहुत ज़रूरी है। 7-8 घंटे सोने की कोशिश करें।');
    }

    // Help
    if (lower.includes('help') || lower.includes('what can you') || lower.includes('command') || lower.includes('madad')) {
      return respond('help',
        'I can help you with many things. Try saying: How am I doing? Log pain level 5. Show my medications. Open my calendar. I\'m not feeling well. Or just tell me how you\'re feeling. I\'m here to help with your recovery.',
        'मैं कई चीज़ों में मदद कर सकता हूँ। कहें: मेरी रिकवरी कैसी है? दर्द 5 दर्ज करो। दवाइयाँ दिखाओ। कैलेंडर खोलो। मुझे अच्छा नहीं लग रहा।');
    }

    return respond('unknown',
      'I\'m your recovery companion. You can tell me how you\'re feeling, ask about your medications, check your progress, or say "help" for more options. I\'m here to support your recovery.',
      'मैं आपका रिकवरी साथी हूँ। आप बता सकते हैं कैसा महसूस कर रहे हैं, दवाओं के बारे में पूछ सकते हैं, या \'मदद\' कहें।');
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
