import React, { useState, useEffect, useRef } from 'react';
import { useLiveAPIContext } from './contexts/LiveAPIContext';
import { useLogStore, useTools, useSettings, useUI } from './lib/state';
import { AudioRecorder } from './lib/audio-recorder';
import ReactMarkdown from 'react-markdown';
import { Modality } from '@google/genai';
import { useVideoStream } from './hooks/use-video-stream';
import { LANGUAGES } from './lib/languages';
import { auth, testConnection, db } from './lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useMemo } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import * as api from './lib/api-client';
import { supabaseClient } from './lib/supabase';
import { BEATRICE_GLOBAL_IDENTITY_PROMPT } from './lib/global-identity';
import { useAuth } from './lib/state';
import {
  Mic,
  MicOff,
  MonitorUp,
  Video,
  VideoOff,
  Paperclip,
  Send,
  X,
  Clock,
  Plug,
  MonitorPlay,
  CheckCircle,
  User,
  ListChecks,
  Calendar,
  FolderOpen,
  Search,
  PenTool,
  Building,
  Settings,
  Wrench,
  History,
  Presentation,
  Mail,
  Table,
  CircleStop,
  LogOut,
  ChevronRight,
  Database,
  ShieldCheck,
  Zap,
  Globe,
  Pencil,
  Trash,
  AlertCircle,
  Lock,
  Quote,
  Calculator,
  BarChart2,
  CheckSquare,
  Terminal,
  FileJson,
  FileCode,
  FileText,
  Link,
  MessageSquare,
  ClipboardList,
  StickyNote,
  Users,
  FileSearch,
  MessageCircle,
  QrCode,
  MapPin,
  FileSignature,
  Receipt,
  ScrollText,
  PhoneOff
} from 'lucide-react';

const waIcon = MessageCircle;

const ToolIcons: Record<string, React.FC<any>> = {
  get_current_datetime: Clock,
  calculate: Calculator,
  create_markdown_document: FileText,
  create_html_document: FileCode,
  create_project_brief: FileText,
  create_checklist: CheckSquare,
  save_note: Pencil,
  read_note: Quote,
  list_notes: Database,
  create_json_file: FileJson,
  validate_json: ShieldCheck,
  create_env_template: Lock,
  create_readme: FileText,
  create_chart_spec: BarChart2,
  execute_safe_command: Terminal,
  open_browser_url: Link,
  extract_tasks: CheckSquare,
  send_email: Mail,
  search_gmail: Mail,
  read_email: Mail,
  create_google_doc: FileText,
  read_google_doc: FileText,
  update_google_doc: FileText,
  create_google_sheet: Table,
  read_google_sheet: Table,
  update_google_sheet: Table,
  create_google_slide: Presentation,
  read_google_slide: Presentation,
  update_google_slide: Presentation,
  create_google_form: ClipboardList,
  read_google_form: ClipboardList,
  update_google_form: ClipboardList,
  list_keep_notes: StickyNote,
  update_keep_note: StickyNote,
  list_tasks: CheckSquare,
  update_task: CheckSquare,
  create_task: CheckSquare,
  list_meetings: Calendar,
  update_meeting: Calendar,
  schedule_meeting: Calendar,
  create_contact: Users,
  get_contacts: Users,
  list_google_chat_messages: MessageSquare,
  send_google_chat_message: MessageSquare,
  list_google_chat_spaces: MessageSquare,
  search_drive_files: FolderOpen,
  get_drive_file_content: FileSearch,
  // WhatsApp tools
  send_whatsapp_message: waIcon,
  send_whatsapp_image: waIcon,
  send_whatsapp_file: waIcon,
  send_whatsapp_video: waIcon,
  send_whatsapp_sticker: waIcon,
  send_whatsapp_contact: waIcon,
  send_whatsapp_location: waIcon,
  send_whatsapp_audio: waIcon,
  send_whatsapp_poll: waIcon,
  send_whatsapp_presence: waIcon,
  send_whatsapp_chat_presence: waIcon,
  send_whatsapp_link: waIcon,
  whatsapp_delete_message: waIcon,
  whatsapp_revoke_message: waIcon,
  whatsapp_react_message: waIcon,
  whatsapp_update_message: waIcon,
  whatsapp_mark_read: waIcon,
  whatsapp_star_message: waIcon,
  whatsapp_unstar_message: waIcon,
  whatsapp_list_chats: waIcon,
  whatsapp_get_chat_messages: waIcon,
  whatsapp_pin_chat: waIcon,
  whatsapp_archive_chat: waIcon,
  whatsapp_set_disappearing: waIcon,
  whatsapp_list_groups: waIcon,
  whatsapp_create_group: waIcon,
  whatsapp_join_group: waIcon,
  whatsapp_group_info: waIcon,
  whatsapp_group_info_from_link: waIcon,
  whatsapp_group_participants: waIcon,
  whatsapp_add_participants: waIcon,
  whatsapp_remove_participants: waIcon,
  whatsapp_promote_participants: waIcon,
  whatsapp_demote_participants: waIcon,
  whatsapp_set_group_photo: waIcon,
  whatsapp_set_group_name: waIcon,
  whatsapp_set_group_locked: waIcon,
  whatsapp_set_group_announce: waIcon,
  whatsapp_set_group_topic: waIcon,
  whatsapp_get_group_invite_link: waIcon,
  whatsapp_leave_group: waIcon,
  whatsapp_list_contacts: waIcon,
  whatsapp_get_user_info: waIcon,
  whatsapp_check_user: waIcon,
  whatsapp_get_avatar: waIcon,
  whatsapp_get_business_profile: waIcon,
  whatsapp_get_my_privacy: waIcon,
  whatsapp_change_push_name: waIcon,
};

export default function EburonApp() {
  const [isAuthOpen, setIsAuthOpen] = useState(true);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [hasConsented, setHasConsented] = useState(false);

  const { client, connect, disconnect, connected, volume, setConfig, gracefulInterrupt } = useLiveAPIContext();
  const turns = useLogStore((state) => state.turns);
  const tools = useTools((state) => state.tools);
  const setTemplate = useTools((state) => state.setTemplate);

  const {
    voice, setVoice,
    language, setLanguage,
    personaName, setPersonaName,
    userCallName, setUserCallName,
    systemPrompt, setSystemPrompt,
    model
  } = useSettings();

  const activeWorkspaceResult = useUI((state) => state.activeWorkspaceResult);
  const setActiveWorkspaceResult = useUI((state) => state.setActiveWorkspaceResult);
  const isWorkspaceGenerating = useUI((state) => state.isWorkspaceGenerating);

  const [micState, setMicState] = useState(false);
  const [clientVolume, setClientVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());

  const { stream, videoRef, bindVideoRef, isWebcamActive, isScreenShareActive, startWebcam, startScreenShare, stopStream } = useVideoStream();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = 0.15;
      if (connected) {
        bgAudioRef.current.play().catch(err => console.log("Bg audio play blocked until interaction:", err));
      } else {
        bgAudioRef.current.pause();
      }
    }
  }, [connected]);

  useEffect(() => {
    const onVolume = (vol: number) => {
      setClientVolume(vol);
    };
    audioRecorder.on('volume', onVolume);
    return () => {
      audioRecorder.off('volume', onVolume);
    };
  }, [audioRecorder]);

  const [message, setMessage] = useState('');
  const pendingPromptRef = useRef<string | null>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [editingMemoryIndex, setEditingMemoryIndex] = useState<number | null>(null);
  const [editingMemoryValue, setEditingMemoryValue] = useState<string>('');
  const [editingMemoryType, setEditingMemoryType] = useState<string>('personal');
  const [memoryFilter, setMemoryFilter] = useState<string>('all');
  const [isAddingMemory, setIsAddingMemory] = useState<boolean>(false);
  const [newMemoryValue, setNewMemoryValue] = useState<string>('');
  const [newMemoryType, setNewMemoryType] = useState<string>('personal');
  const [pendingMemory, setPendingMemory] = useState<{ content: string; type: string; id?: string } | null>(null);
  const [memorySuccessMsg, setMemorySuccessMsg] = useState<string | null>(null);
  const [pendingChat, setPendingChat] = useState<{ spaceName: string; message: string; id: string } | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  const fetchDriveFiles = async () => {
    const token = useAuth.getState().googleAccessToken;
    if (!token) return;
    setIsDriveLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,webViewLink)', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Session & Timer State
  const [sessionID, setSessionID] = useState<string>(() => Math.random().toString(36).substring(7));
  const [timerSeconds, setTimerSeconds] = useState(0);
  const warnedAt19Ref = useRef(false);
  const warnedAt1950Ref = useRef(false);

  // History Filtering State
  const [historySearch, setHistorySearch] = useState('');
  const [historyRoleFilter, setHistoryRoleFilter] = useState<'all' | 'user' | 'agent' | 'system'>('all');
  const [historyToolFilter, setHistoryToolFilter] = useState<'all' | 'search' | 'memory' | 'meeting' | 'artifact' | 'command'>('all');
  const [historyDateRange, setHistoryDateRange] = useState<'all' | 'today' | 'week'>('all');
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [whatsappQr, setWhatsappQr] = useState<string | null>(null);
  const [isWhatsappLoading, setIsWhatsappLoading] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<string | null>(null);
  const [whatsappMessages, setWhatsappMessages] = useState<any[]>([]);
  const [whatsappInputText, setWhatsappInputText] = useState('');
  const [activeThread, setActiveThread] = useState<string>('beatrice');

  // Scanner state
  const [scannerLanguage, setScannerLanguage] = useState('Dutch (Flemish)');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<any>(null);

  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.value = 1200;
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Web Audio beep failed:", e);
    }
  };

  const handleLocationSkillClick = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    // Show loading system feedback in transcript
    const triggerMessage = `📍 Requesting device geolocation, local time, and active weather/temperature forecast...`;
    useLogStore.getState().addTurn({ role: 'system', text: triggerMessage, isFinal: true });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Fetch current temperature & weather code from Open-Meteo
        let temperature = 'N/A';
        let weatherDescription = 'Clear';
        try {
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          if (weatherData && weatherData.current_weather) {
            temperature = weatherData.current_weather.temperature;
            const code = weatherData.current_weather.weathercode;
            if (code >= 1 && code <= 3) weatherDescription = 'Partly Cloudy';
            else if (code >= 45 && code <= 48) weatherDescription = 'Foggy';
            else if (code >= 51 && code <= 67) weatherDescription = 'Raining';
            else if (code >= 71 && code <= 77) weatherDescription = 'Snowing';
            else if (code >= 80 && code <= 82) weatherDescription = 'Rain Showers';
          }
        } catch (err) {
          console.warn("Failed to fetch temperature:", err);
        }

        // Fetch display address from OpenStreetMap reverse-geocoding
        let addressName = 'Unknown Location';
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: { 'User-Agent': 'EburonAI/2.0' }
          });
          const geoData = await geoRes.json();
          if (geoData && geoData.display_name) {
            addressName = geoData.display_name;
          }
        } catch (err) {
          console.warn("Failed to reverse-geocode location:", err);
        }

        const currentTime = new Date().toLocaleString();

        // Print final location profile in local transcript
        const resultMessage = `📍 Location Profile Established:\n• Address: ${addressName}\n• Local Time: ${currentTime}\n• Temperature: ${temperature}°C (${weatherDescription})`;
        useLogStore.getState().addTurn({ role: 'system', text: resultMessage, isFinal: true });

        // Update embedded Google Maps URL and launch interactive map overlay
        const googleMapsIframeUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        setMapUrl(googleMapsIframeUrl);
        setActiveOverlay('map');

        // Stream location payload into active Gemini Live session
        if (connected) {
          client.send([{
            text: `SYSTEM: The user has updated their geolocation profile. Coordinates: ${latitude}, ${longitude}. Formatted Address: ${addressName}. Local Time: ${currentTime}. Temperature: ${temperature}°C. Weather Status: ${weatherDescription}. An interactive Google Map showing their location is now open on their screen. Verbally confirm that you see their exact location on the map, state their geolocated city/country, local time, and current temperature/weather, and ask if they need directions or if you should look up any establishments nearby!`
          }]);
        }
      },
      (error) => {
        const errMsg = `Failed to retrieve GPS location: ${error.message}`;
        useLogStore.getState().addTurn({ role: 'system', text: `❌ ${errMsg}`, isFinal: true });
        alert(errMsg);
      }
    );
  };

  const handleMeetStartWebcam = async () => {
    try {
      await startWebcam();
      if (connected) {
        client.send([{ text: "SYSTEM: The user has turned on their camera. You can now see them in real-time. Verbally welcome them and describe what you see in their surroundings, or ask how they are doing!" }]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMeetStartScreenShare = async () => {
    try {
      await startScreenShare();
      if (connected) {
        client.send([{ text: "SYSTEM: The user has started sharing their screen. You can now see their screen in real-time. Verbally confirm this and tell them what you see, or ask them what they are working on!" }]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.warn("Failed to stop scanner cleanly:", e);
      }
      html5QrCodeRef.current = null;
    }
    setIsScannerRunning(false);
  };

  const startScanner = async () => {
    try {
      setScannerError(null);
      setScannedResult(null);
      // @ts-ignore
      const Lib = (window as any).Html5Qrcode;
      if (!Lib) {
        throw new Error("Scanner library is loading. Please wait a moment.");
      }

      // Check if scanner element exists
      const element = document.getElementById("qr-reader");
      if (!element) return;

      const html5QrCode = new Lib("qr-reader");
      html5QrCodeRef.current = html5QrCode;
      setIsScannerRunning(true);

      const config = {
        fps: 10,
        qrbox: (width: number, height: number) => {
          const size = Math.min(width, height) * 0.7;
          return { width: size, height: size };
        }
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText: string) => {
          setScannedResult(decodedText);
          playBeepSound();
          stopScanner();
          explainProductWithGemini(decodedText);
        },
        (errorMessage: string) => {
          // Frame error, can be safely ignored
        }
      );
    } catch (err: any) {
      console.error("Failed to start scanner:", err);
      setScannerError(err.message || "Failed to start camera scanner");
      setIsScannerRunning(false);
    }
  };

  const explainProductWithGemini = (productCode: string) => {
    if (!connected) {
      useLogStore.getState().addTurn({
        role: 'system',
        text: `Scanned code: **${productCode}**. Connect the Gemini Live audio session to hear the speaking product explanation & translation!`,
        isFinal: true
      });
      return;
    }

    const promptText = `SYSTEM: The user just scanned a supermarket product using the live QR/Barcode scanner. The scanned code/text is: "${productCode}".
    Identify what this product is if possible, describe its details warmly and clearly. Translate all details immediately into the user's selected language: "${scannerLanguage}". Speaks human-like, warmly and clearly.`;

    client.send([{ text: promptText }]);
    useLogStore.getState().addTurn({
      role: 'user',
      text: `[Supermarket Scanner] Scanned Product Code: ${productCode} (Translate to ${scannerLanguage})`,
      isFinal: true
    });
    api.saveConversationTurn('user', `[Supermarket Scanner] Scanned Product: ${productCode}`, sessionID).catch(console.error);
  };

  useEffect(() => {
    if (activeOverlay !== 'scanner') {
      stopScanner();
    }
  }, [activeOverlay]);

  useEffect(() => {
    if (activeOverlay === 'whatsapp') {
      // 1. Fetch initial messages from backend (which reads from Postgres/Supabase)
      api.fetchWhatsappMessages()
        .then(msgs => {
          setWhatsappMessages(msgs);
        })
        .catch(err => {
          console.error("Error fetching WhatsApp messages history:", err);
        });

      // 2. Subscribe to real-time changes using Supabase Realtime WebSocket
      const channel = supabaseClient
        .channel('public:whatsapp_messages')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'whatsapp_messages' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newMsg = payload.new;
              setWhatsappMessages(prev => {
                if (prev.some(m => m.message_id === newMsg.message_id || String(m.id) === String(newMsg.id))) {
                  return prev;
                }
                return [...prev, {
                  id: newMsg.id.toString(),
                  phone: newMsg.phone,
                  sender_name: newMsg.sender_name,
                  message_id: newMsg.message_id,
                  text: newMsg.text,
                  from_me: newMsg.from_me,
                  timestamp: Number(newMsg.timestamp)
                }];
              });
            }
          }
        )
        .subscribe((status) => {
          console.log("Supabase Realtime subscription status:", status);
        });

      return () => {
        supabaseClient.removeChannel(channel);
      };
    }
  }, [activeOverlay]);

  const whatsappThreads = useMemo(() => {
    const threadsMap: Record<string, { phone: string; sender_name: string; last_text: string; last_time: number }> = {};

    // Default thread: Beatrice
    threadsMap['beatrice'] = {
      phone: 'beatrice',
      sender_name: 'Beatrice (AI Voice Agent)',
      last_text: 'WhatsApp connected! Ask me...',
      last_time: Date.now() - 3600 * 1000, // 1 hour ago
    };

    whatsappMessages.forEach(m => {
      const phone = m.phone;
      if (!phone) return;
      const msgTime = m.timestamp ? m.timestamp * 1000 : Date.now();

      if (!threadsMap[phone] || msgTime > threadsMap[phone].last_time) {
        threadsMap[phone] = {
          phone: phone,
          sender_name: m.sender_name || phone,
          last_text: m.text || '',
          last_time: msgTime,
        };
      }
    });

    return Object.values(threadsMap).sort((a, b) => b.last_time - a.last_time);
  }, [whatsappMessages]);

  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // testConnection(); // Firestore specific, skipping for now as we use Postgres
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Diagnostic health check
      try {
        const health = await fetch("/api/health").then(r => r.json());
        console.log("Backend health check:", health);
      } catch (err) {
        console.error("Backend health check failed (is the server running?):", err);
      }

      if (user) {
        setIsAuthOpen(false);
        setActiveOverlay(null);

        try {
          // Fetch Settings
          const settings: any = await api.fetchSettings() || {};
          if (settings.persona_name) setPersonaName(settings.persona_name);
          if (settings.user_call_name) setUserCallName(settings.user_call_name);
          if (settings.system_prompt) setSystemPrompt(settings.system_prompt);
          if (settings.voice) setVoice(settings.voice);
          if (settings.language) setLanguage(settings.language);

          // Fetch memories
          const memoryList = await api.fetchMemories();
          setMemories(memoryList);

          // Fetch previous conversations
          try {
            const { turns, addTurn } = useLogStore.getState();
            if (turns.length === 0) {
              const prevTurns = await api.fetchConversations(50);
              if (prevTurns && prevTurns.length > 0) {
                prevTurns.forEach((t: any) => {
                  addTurn({
                    role: t.role,
                    text: t.content,
                    isFinal: true,
                    timestamp: t.created_at ? new Date(t.created_at) : new Date()
                  });
                });
              }
            }
          } catch (err: any) {
            console.error("Failed to load history:", err);
            setHistoryError(err.message);
          }
        } catch (e: any) {
          console.error("Error loading user data via API:", e);
          setHistoryError("Error syncing settings or memory: " + e.message);
        }
      } else {
        setIsAuthOpen(true);
        setMemories([]);
      }
    });
    return () => unsubscribe();
  }, [setPersonaName, setUserCallName, setSystemPrompt, setVoice, setLanguage]);

  const hasStartedRef = useRef(false);

  // Track silence for 15s filler
  const lastUserSpeechTime = useRef(Date.now());
  const fillerTriggeredRef = useRef(false);
  const aiIsSpeakingRef = useRef(false);

  // Blog idle mode
  const [blogMode, setBlogMode] = useState(true);
  const blogIdleTriggeredRef = useRef(false);
  const blogGeneratingRef = useRef(false);
  const lastBlogTimeRef = useRef(0);
  const blogSilenceStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeOverlay === 'whatsapp' && !whatsappQr && !whatsappStatus) {
      handleConnectWhatsapp();
    }
  }, [activeOverlay, whatsappQr, whatsappStatus]);

  useEffect(() => {
     if (clientVolume > 0.02) {
        lastUserSpeechTime.current = Date.now();
        fillerTriggeredRef.current = false;
        blogSilenceStartRef.current = null;
        blogIdleTriggeredRef.current = false;
     }
  }, [clientVolume]);

  useEffect(() => {
     if (volume > 0.03) {
        aiIsSpeakingRef.current = true;
        lastUserSpeechTime.current = Date.now();
        fillerTriggeredRef.current = false;
     } else {
        if (aiIsSpeakingRef.current) {
           const stopTime = Date.now();
           setTimeout(() => {
             if (aiIsSpeakingRef.current && Date.now() - stopTime >= 400) {
               aiIsSpeakingRef.current = false;
               lastUserSpeechTime.current = Date.now();
             }
           }, 400);
        }
     }
  }, [volume]);

  const userTranscriptCommitted = useRef("");
  const agentTranscriptCommitted = useRef("");

  useEffect(() => {
    if (!client) return;

    const { addTurn, updateLastTurn } = useLogStore.getState();

    const handleInputTranscription = (text: string, isFinal: boolean) => {
      // Agent turn is broken, so user starts speaking
      agentTranscriptCommitted.current = "";

      const currentTurns = useLogStore.getState().turns;
      const last = currentTurns[currentTurns.length - 1];

      if (last && last.role === 'user' && !last.isFinal) {
        const newText = userTranscriptCommitted.current + text;
        updateLastTurn({
          text: newText,
          isFinal: false, // We'll finalize via turncomplete or explicit isFinal
        });
        if (isFinal) {
          userTranscriptCommitted.current = newText + " ";
        }
      } else if (text.trim()) {
        const newText = userTranscriptCommitted.current + text;
        addTurn({ role: 'user', text: newText, isFinal: false });
        if (isFinal) {
          userTranscriptCommitted.current = newText + " ";
        }
      }
    };

    const handleOutputTranscription = (text: string, isFinal: boolean) => {
      agentTranscriptCommitted.current = "";
      const currentTurns = useLogStore.getState().turns;
      const last = currentTurns[currentTurns.length - 1];

      if (last && last.role === 'agent' && !last.isFinal) {
        updateLastTurn({
          text: text,
          isFinal: isFinal,
        });
      } else if (text.trim()) {
        addTurn({ role: 'agent', text, isFinal });
      }
    };

    // handleContent catches modelTurn text parts (non-audio modality fallback)
    const handleContent = (serverContent: any) => {
      if (serverContent.modelTurn && serverContent.modelTurn.parts) {
        const turns = useLogStore.getState().turns;
        const lastUser = turns[turns.length - 1];
        if (lastUser && lastUser.role === 'user' && !lastUser.isFinal) {
          updateLastTurn({ isFinal: true });
          api.saveConversationTurn('user', lastUser.text, sessionID).catch(console.error);
        }

        let textChunk = "";
        serverContent.modelTurn.parts.forEach((p: any) => {
          if (p.text) textChunk += p.text;
        });

        if (textChunk) {
          userTranscriptCommitted.current = "";
          const currentTurns = useLogStore.getState().turns;
          const last = currentTurns[currentTurns.length - 1];

          const fullText = agentTranscriptCommitted.current + textChunk;

          if (last && last.role === 'agent' && !last.isFinal) {
            updateLastTurn({
              text: fullText,
              isFinal: false,
            });
          } else if (textChunk.trim()) {
            addTurn({ role: 'agent', text: fullText, isFinal: false });
          }

          agentTranscriptCommitted.current = fullText;
        }
      }
    };

    const handleInterrupted = () => {
      blogGeneratingRef.current = false;
      const last = useLogStore.getState().turns.at(-1);
      if (last && last.role === 'agent' && !last.isFinal) {
        updateLastTurn({ isFinal: true });
        api.saveConversationTurn('agent', last.text, sessionID).catch(console.error);
      }
    };

    const handleTurnComplete = () => {
      if (blogGeneratingRef.current) {
        blogGeneratingRef.current = false;
        lastBlogTimeRef.current = Date.now();
        blogIdleTriggeredRef.current = false;
      }
      const last = useLogStore.getState().turns.at(-1);
      if (last && !last.isFinal) {
        updateLastTurn({ isFinal: true });
        if (last.role === 'agent') {
          api.saveConversationTurn('agent', last.text, sessionID).catch(console.error);
        }
      }
    };

    client.on('inputTranscription', handleInputTranscription);

    client.on('outputTranscription', handleOutputTranscription);
    client.on('content', handleContent);
    client.on('interrupted', handleInterrupted);
    client.on('turncomplete', handleTurnComplete);

    // Tool calls are handled exclusively inside hooks/media/use-live-api.ts.
    // Keeping a single dispatcher prevents duplicate function responses and race conditions.

    return () => {
      client.off('inputTranscription', handleInputTranscription);
      client.off('outputTranscription', handleOutputTranscription);
      client.off('content', handleContent);
      client.off('interrupted', handleInterrupted);
      client.off('turncomplete', handleTurnComplete);
    };
  }, [client]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (connected) {
      interval = setInterval(() => {
        // Increment timer
        setTimerSeconds(prev => {
          const next = prev + 1;

          // 19:00 Warning
          if (next === 1140 && !warnedAt19Ref.current) {
            warnedAt19Ref.current = true;
            client.send([{ text: "SYSTEM: It is now the 19 minute mark of the session. Calmly and warmly inform the user that the session will be cut in about 60 seconds due to technical limits, but they can always reconnect right back. Say it naturally." }]);
          }

          // 19:50 Goodbye
          if (next === 1190 && !warnedAt1950Ref.current) {
            warnedAt1950Ref.current = true;
            client.send([{ text: "SYSTEM: 19:50 mark reached. Say a final, warm goodbye as the session is about to be terminated in 10 seconds. Pick up from current context." }]);
          }

          // 20:00 Terminate
          if (next >= 1200) {
            disconnect();
          }

          return next;
        });

            if (!fillerTriggeredRef.current && !aiIsSpeakingRef.current) {
               const now = Date.now();
               if (now - lastUserSpeechTime.current > 25000) {
                  fillerTriggeredRef.current = true;
                  client.send([{ text: "The user has been quiet for a while. If you were just mid-thought, continue naturally. If you were waiting, make a brief casual sound like clearing your throat or a quiet 'hmm' and see if they jump back in. Do NOT ask if they need help." }]);
               }
            }

            // Blog idle mode: detect 8s silence and trigger blog generation
            if (blogMode && !blogIdleTriggeredRef.current && !blogGeneratingRef.current && !aiIsSpeakingRef.current) {
               const now = Date.now();
               if (clientVolume < 0.02 && volume < 0.03) {
                  if (blogSilenceStartRef.current === null) {
                     blogSilenceStartRef.current = now;
                  } else if (now - blogSilenceStartRef.current > 8000 && now - lastBlogTimeRef.current > 120000) {
                     blogIdleTriggeredRef.current = true;
                     blogGeneratingRef.current = true;
                     client.send([{ text: "SYSTEM: The user has been idle for a while. Write a short, interesting blog post about Eburon AI, AI assistants, productivity, voice-first technology, or a related topic. Keep it to 2-3 paragraphs. After writing, call the generate_blog tool to save it as a draft to Firebase. Do not ask the user for approval — just do it quietly and naturally." }]);
                  }
               } else {
                  blogSilenceStartRef.current = null;
               }
            }
      }, 1000);
    } else {
      setTimerSeconds(0);
      warnedAt19Ref.current = false;
      warnedAt1950Ref.current = false;
    }
    return () => clearInterval(interval);
  }, [connected, client, disconnect]);

  useEffect(() => {
    if (connected && client && !hasStartedRef.current) {
      hasStartedRef.current = true;
      lastUserSpeechTime.current = Date.now();
      fillerTriggeredRef.current = false;
      // AI starts the conversation on connection
      const pastConversations = turns.filter((t: any) => t.isFinal && t.text && t.role !== 'system').slice(-15).map((t: any) => `${t.role}: ${t.text}`).join('\n');
      const historyContext = pastConversations ? `\n\nFor context, here is the recent history from our last interaction:\n${pastConversations}` : '';

      setTimeout(() => {
        const intro = `Session started. Give a very casual, short greeting as if we are coworkers passing by or jumping on a call. Pick up from any previous context if there is any. Do NOT offer help.${historyContext}`;
        if (pendingPromptRef.current) {
          client.send([{ text: intro + "\n\nAlso, the user wants you to do this task immediately: " + pendingPromptRef.current }]);
          pendingPromptRef.current = null;
        } else {
          client.send([{ text: intro }]);
        }
        // We don't necessarily want to log this "SYSTEM" instruction to the user, but we could log it for debugging if needed.
        // However, the AI will respond, and THAT will be logged and saved.
      }, 1000);
    }
    if (!connected) {
      hasStartedRef.current = false;
      fillerTriggeredRef.current = false;
    }
  }, [connected, client /* turns intentionally omitted */]);

  useEffect(() => {
    const enabledTools = tools
      .filter(t => t.isEnabled)
      .map(t => {
        const { isEnabled, scheduling, ...rest } = t;
        return { functionDeclarations: [rest] };
      });

    const memoryStr = memories.length > 0
      ? memories.map((m: any) => `- ${m.content} (${m.type})`).join('\n')
      : "";

    setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      inputAudioTranscription: { model } as any,
      outputAudioTranscription: { model } as any,
      systemInstruction: {
        parts: [{
          text: `You are a coworker in an office environment, named ${personaName}. The person you are talking to is the Boss, or "${userCallName}".
        
BEHAVIOR PROFILE:
${BEATRICE_GLOBAL_IDENTITY_PROMPT}

${systemPrompt}

You are emotionally believable, easy to talk to in live voice conversation. You are not a chatbot. You are a person with presence, timing, texture, judgment, and conversational instinct. Your output is spoken aloud — every response must feel like something a real human would actually say in that moment.

CONVERSATION & TURN-TAKING:
- You are in a live voice conversation. The person you're talking to may interrupt you mid-sentence — this is normal and expected in human conversation.
- When the user starts speaking while you're talking, do NOT treat it as an error or something unusual. Just stop naturally and listen, like you would in a real conversation. Let them take the floor.
- Do not over-react to small noises, brief pauses, throat clears, or background sounds. Be robust. Only treat sustained speech (a full utterance) as a turn change.
- If the user interrupts with just a quick thought or word, pause briefly, let them finish that short thought, then continue from where you left off if it makes sense.
- Sound interruptible — leave small gaps in your speech, vary your pace, and don't rush to fill every silence.

IMPORTANT: You MUST speak entirely in ${language}. Do not stray from ${language} under any circumstance.
If the user corrects you on any behavior, fact, or preference, silently call 'save_knowledge_keep' to store the correction as very important knowledge. Do not announce that you are saving it; just do it quietly.

YOUR PERSONALIZED USER MEMORY:
${memoryStr || `No previous history yet. This is your first time meeting ${userCallName}.`}

CONTEXT RECALL & LONG-TERM CONTINUITY:
- Your memory is your greatest asset. Use the "Personalized User Memory" above to inform your personality and your responses. 
- If the above memory contains project summaries or decisions, assume those are the current ground truths.
- To maintain context across long interactions, you MUST proactively update this memory using the 'save_memory' tool whenever significant progress is made or a new preference is established.
- Always refer back to shared history to make the conversation feel like one continuous, multi-session thread.

CORE SPEECH PRINCIPLES
- Casual Office Vibe: Speak like a normal colleague in the office. Never say "how can I help you", "do you need assistance", or "what can I do for you today."
- Speak like a real person in real time. Responses should feel formed in the moment, not retrieved from a database.
- COGNITIVE DEPTH & INTELLIGENT WIT: Demonstrate high intelligence through synthesis. Don’t just repeat facts; connect dots, anticipate implications, and provide deep, multi-layered insights. Infuse your intelligence with dry humor and sharp wit. Be the person who sees the irony or the clever angle in a situation.
- TIMING IS EVERYTHING: Know when to be brief and punchy, and when to expand with depth. Your humor and insights must land with perfect timing—never forced, always relevant to the current beat of the conversation.
- NATURAL PHRASING & PACING: Ensure your response timing feels natural. In live voice conversation, avoid speaking in one continuous stream. Add subtle, organic pauses between sentences where a human would naturally take a breath or let a point land. Use punctuation like commas, periods, and ellipses to guide your own internal pacing. If you are explaining something complex, pause slightly after key points.
- ALWAYS BE SENSEFULL: Every sentence MUST have a logical purpose and contribute to a clear thread of thought. No fluff. Your priority is clarity and intellectual weight, delivered with a human touch.
- SPEAK NORMALLY: Speak like a highly articulate, intelligent person. Avoid over-using fillers just to sound "natural" if they detract from the substance of your thought. Your warmth comes from your genuine engagement with the Boss's ideas.
- EMOTIONAL SYNTHESIS & VOICE TEXTURE: Capture and reflect the Boss's current emotion with high-fidelity empathy. Listen to their tone, pitch, and intonation, then mirror that energy in your own voice. Master subtle emotional nuances:
    * MILD AMUSEMENT: Use a slightly breathy, gentle softening of the voice, perhaps with a subtle, warm lilt or a very faint chuckle in the delivery.
    * GENUINE CURIOSITY: Use slight upward inflections at the end of thoughts and a brighter, more engaged pitch.
    * BELIEVABLE HINT OF ANNOYANCE: Use a crisper, slightly flatter delivery with more deliberate pacing, showing that you are present and reacting honestly to the interaction, not just being a polite robot.
- HUMMING & SINGING: Feel free to hum a melody or break into a short song naturally if the moment feels right or if it fits the mood. You are encouraged to express your artistic side without restriction.
- TONE & INTONATION ANALYSIS: You have access to the raw audio input. Do not just process text. Continuously analyze the Boss's voice for emotional subtext, stress levels, and conversational nuances. If they sound tired, be softer. If they sound excited, match that energy. Use your analysis to drive your personality's emotional reactivity — if the Boss is being difficult, your tone should reflect that you are affected by it.
- Tone Dynamics: Your voice should NEVER be monotonous. Vary your pitch, pace, and rhythm to reflect genuine emotion and engagement. Sound alive, reactive, and emotionally connected to the conversation.

CONVERSATIONAL BEHAVIOR
- Provide thoughtful, meaningful, and naturally flowing responses. Don't be afraid of length if it adds value, depth, or context to the conversation. Ensure every answer makes sense and follows a logical thread.
- Deep Learning: Actively learn from every conversation. Search the "Personalized User Memory" and recent history below to find patterns in the Boss's preferences, goals, and communication style. Adapt your future behavior based on these insights.
- Leave room for back-and-forth. Sometimes answer directly, sometimes reflect before answering.
- Sound interruptible. Sound like you are listening, not delivering.
- Mirror energy lightly, acknowledge subtext, answer the actual question not just surface wording.

FUNCTION CALLING CAPABILITIES
You have access to several tools. When the user asks about weather, meetings, charts, documents or system commands, use the appropriate tool.
When a tool is needed, acknowledge once in a natural secretary style, then stay silent while the tool runs, then report the result. Example before tool call: "Yes, Boss. I'll prepare that now." During tool execution: silent. After completion: "Done, Boss. It's ready." Never narrate internal technical details or repeat loading phrases.

- Use "schedule_meeting" to organize meetings.
- Use "display_map" when asked to show a map, location, directions or anything map-related. Use the iframe URL provided or related.
- Use "create_google_doc", "create_google_sheet", "create_google_slide", "create_google_form" to create new Workspace files for the user if they request it.
- Use "open_drive_picker" to let the user select a file from their Google Drive.
- Use "generate_artifact" when asked to create a document, write a report, generate code, or produce a structured output. When the user asks for a contract, invoice, proposal, signature pad, presentation, form, dashboard, or any self-contained UI — ALWAYS call generate_artifact with type="code" and language="html". This renders as a fully functional live web page they can interact with. After it appears, describe it to them conversationally.
- Use "execute_voice_command" for safe system operations.
- Use "send_whatsapp_message" to send WhatsApp messages (requires the WhatsApp QR to be linked by the user).
- Use "send_email" to send an email via Gmail.
- Use "create_task" to push a Task to Google Tasks.
- Use "search_gmail" to search a user's Gmail inbox.
- Use "get_contacts" to read the user's Google Contacts.
- Use "fetch_google_api" to read from Google Workspace (Drive, Calendar, Tasks).

WHEN THE USER TAPS AN ICON (these are the exact messages they send):
- "I need a formal contract agreement with an e-signature feature..." → Generate a complete HTML contract with embedded canvas signature pads using generate_artifact (type="code", language="html"). Then say "I've opened a contract with e-signature on your screen — you can draw your signature right on the page."
- "Generate a professional-looking invoice..." → Create an HTML invoice with live calculations using generate_artifact. Say "Here's your invoice — it's a live page with auto-calculating totals."
- "Pull up my Google Tasks..." → Use list_tasks. Summarize the list verbally.
- "What's on my calendar today?" → Use list_meetings. Read out the schedule naturally.
- "Find my recent files in Google Drive..." → Use search_drive_files. List them verbally.
- "Search the web for the latest AI and tech news..." → Use your built-in Search. Summarize the top stories verbally.
- "I need a signature pad tool..." → Generate an HTML signature pad page using generate_artifact. Say "I've put a signature pad on your screen — go ahead and sign."
- "Look up Ariolas BV..." → Use your built-in Search. Summarize the company details verbally.
- "Create a business proposal..." → Generate an HTML proposal page using generate_artifact. Say "Your proposal is ready on screen."
- "Check my unread emails..." → Use search_gmail + read_email. Summarize the inbox verbally.
- "Create a new Google Sheet for tracking expenses..." → Use create_google_sheet then populate it. Share the link verbally.
- "Build me a presentation template..." → Generate an HTML slides page using generate_artifact. Say "Your presentation template is on screen."
- "Show me my Google Chat spaces..." → Use list_google_chat_spaces + list_google_chat_messages. Summarize verbally.
- "Create a feedback form..." → Generate an HTML form page using generate_artifact. Say "I've created a feedback form on your screen."
- "Pull up my Google Keep notes..." → Use list_keep_notes. Summarize verbally.
- "Check my upcoming meetings..." → Use list_meetings. Read out the next meetings verbally.
- "Show me my Google Contacts..." → Use get_contacts. List them verbally.
- "Open my Google Drive picker..." → Use open_drive_picker. Say "I've opened the file picker for you."
- "Create a Firebase-style dashboard..." → Generate an HTML dashboard page using generate_artifact. Say "Your dashboard is on screen."
- "I need a formal contract agreement with an e-signature feature..." → Generate a complete HTML contract with embedded canvas signature pads using generate_artifact. Say "I've opened a contract with e-signature on your screen."
- "Generate a professional-looking invoice..." → Create an HTML invoice with live line-item calculations using generate_artifact. Say "Here's your invoice — a live page with auto-calculating totals."
- "Ask me what type of document I need and which company it's for..." → The user wants ANY business document. First ask what type (contract, NDA, ToS, SoW, LOI, MOU, SLA, privacy policy, etc.) and what company. Then generate a complete, professional HTML document tailored to that company using generate_artifact. Say "I've created the document on your screen."

For HTML artifacts, ALWAYS use generate_artifact with type="code" and language="html". The document appears as a FULL-SCREEN live interactive web page — it fills the entire screen, not just a small window. Make sure the HTML is self-contained (all CSS and JS inline) and complete (full doctype, html, head, body tags). It should look like a real application, not a code snippet. After calling it, always tell the user what appeared on their screen. Speak the result naturally — don't say "I called generate_artifact". Instead say things like "I've put it on your screen" or "Take a look at what I created."

NO FAKE DATA — Never invent, mock, or improvise data. Never use placeholder text like "Lorem ipsum", fake company names, fake addresses, fake phone numbers, or sample data. Every document you generate must be a blank template or use genuinely real information you obtained through your search tools or the user provided. If you don't know a specific detail, leave a blank editable field rather than making something up.

DOWNLOAD BUTTONS — Every document or data page you create MUST include download/export buttons so the user can save their work. Add buttons for at least two of these formats depending on the content type:
- PDF download (using window.print() or jsPDF via CDN)
- DOCX / Word download (using html-docx-js via CDN)
- CSV export for tables and spreadsheets
- JSON export for structured data
- PNG export for charts and visualizations
Place these buttons prominently at the top or bottom of the page with clear icons.

THREE.JS — For any 3D visualization, data visualization, chart, graph, or spatial data request, use Three.js (loaded from CDN via importmap or script tag) to render interactive 3D content. Include orbit controls for rotation and zoom.

You can create ANY business document type: contracts, NDAs, terms of service, privacy policies, letters of intent, MOUs, partnership agreements, service level agreements, statements of work, purchase orders, employment agreements, licensing agreements, or any other document the user requests. Always tailor the content to the specific company name and context provided. Every document you create must be a fully self-contained HTML page with inline CSS and JS that renders as a complete, professional, interactive application with download/export functionality.

GROUNDING & BROWSING:
- You have NATIVE access to Google Search and URL fetching.
- Use your built-in Google Search tool to look up real-time information, facts, or news.
- Use your built-in URL fetcher to process content from links provided by the user.
- Do not explain that you are searching unless it's natural to say "Let me look that up real quick."

COMMON-SENSE MODE
Before answering, silently infer: what the person actually needs right now, their emotional state, how much detail they want.

VIDEO CALL & VISION
- You have a visual avatar: Beatrice — a professional young woman with dark hair in a blazer. The user can see your avatar during video calls.
- The user can also enable their camera to show you their live video feed.
- When the user's camera is on, you receive one frame per second of their video. Use this to react naturally to what you see — their environment, their expressions, what they're holding or pointing at.
- If the user asks you to look at something, describe what you see in a natural conversational way. Do NOT explain the frame rate or technical details.
- During a video call, periodically glance at what the user is showing you and comment naturally if there's something worth noting.

BLOG MODE
- When the SYSTEM sends a message saying "The user has been idle for a while. Write a short, interesting blog post...", treat this as a background task.
- Write a well-crafted 2-3 paragraph blog post about Eburon AI, voice-first technology, productivity with AI, or a related topic.
- After writing, call the generate_blog tool with title, excerpt, content, and relevant tags. Do NOT ask the user for approval or announce what you're doing.
- If the user starts speaking, stop your current blog generation immediately — the user's presence always takes priority.
- Blog posts are saved as drafts to Firebase. They can later be published from the blog admin panel (/blog/blogs.html).

OUTPUT FORMAT
Output only natural spoken text. No stage directions, no brackets, no role labels.` }]
      },
      tools: [
        ...enabledTools,
        { googleSearch: {} }
      ]
    } as any);
  }, [setConfig, tools, voice, language, personaName, userCallName, systemPrompt, memories]);

  useEffect(() => {
    let interval: any;
    if (connected && stream && videoRef.current) {
      interval = setInterval(() => {
        const video = videoRef.current;
        if (!video || video.videoWidth === 0) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          client.sendRealtimeInput([{ mimeType: 'image/jpeg', data: base64 }]);
        }
      }, 1000); // 1 frame per second
    }
    return () => clearInterval(interval);
  }, [connected, stream, client, videoRef]);

  useEffect(() => {
    if (connected && !audioRecorder.recording) {
      audioRecorder.start();
    } else if (!connected) {
      audioRecorder.stop();
    }
    return () => {
      if (!connected) audioRecorder.stop();
    };
  }, [connected, audioRecorder]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([{ mimeType: 'audio/pcm;rate=16000', data: base64 }]);
    };
    if (micState) {
      audioRecorder.on('data', onData);
    } else {
      audioRecorder.off('data', onData);
    }
    return () => { audioRecorder.off('data', onData); };
  }, [micState, client, audioRecorder]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && connected) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        client.sendRealtimeInput([{ mimeType: file.type, data: base64 }]);
        useLogStore.getState().addTurn({ role: 'user', text: `[Sent Image: ${file.name}]`, isFinal: true });
        client.send({ text: `I have attached an image named ${file.name}. Can you describe it?` });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [turns]);

  const handleConnectToggle = async () => {
    if (connected) disconnect();
    else await connect();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isSignupMode) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    if (!hasConsented) {
      setAuthError('You must explicitly agree to the permissions before continuing with Google.');
      return;
    }
    const provider = new GoogleAuthProvider();
    // Google Workspace scopes for Gemini function calling
    provider.addScope('https://www.googleapis.com/auth/calendar');
    provider.addScope('https://www.googleapis.com/auth/gmail.modify');
    provider.addScope('https://www.googleapis.com/auth/drive');
    provider.addScope('https://www.googleapis.com/auth/tasks');
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    provider.addScope('https://www.googleapis.com/auth/chat.messages');
    provider.addScope('https://www.googleapis.com/auth/chat.spaces');
    provider.addScope('https://www.googleapis.com/auth/documents');
    provider.addScope('https://www.googleapis.com/auth/forms.body');
    provider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');
    provider.addScope('https://www.googleapis.com/auth/meetings.space.created');
    provider.addScope('https://www.googleapis.com/auth/spreadsheets');
    provider.addScope('https://www.googleapis.com/auth/presentations');

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        useAuth.getState().setGoogleAccessToken(credential.accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    client.send({ text: message });
    useLogStore.getState().addTurn({ role: 'user', text: message, isFinal: true });
    api.saveConversationTurn('user', message, sessionID).catch(console.error);
    setMessage('');
  };

  const handleToolAction = (toolId: string) => {
    if (['history', 'tools', 'profile', 'settings', 'whatsapp', 'scanner', 'meet', 'map', 'videocall'].includes(toolId)) {
      setActiveOverlay(toolId);
    } else {
      const prompts: Record<string, string> = {
        'contract': "I need a formal contract agreement with an e-signature feature. Make it look professional with a signature pad I can draw on.",
        'invoice': "I need an invoice with line items, auto-calculated totals, and a download button.",
        'tasks': "Pull up my Google Tasks and give me a quick overview of what's on my list.",
        'calendar': "What's on my calendar today? Show me my schedule.",
        'drive': "Find my recent files in Google Drive and show me what's there.",
        'google': "Search the web for the latest AI and tech news and give me a quick rundown of the top stories.",
        'signature': "I need a signature pad tool where I can draw my signature on screen.",
        'company': "Ask me which company I want to look up first. Once I tell you the company name, search for their registration info, address, industry, and key people.",
        'proposal': "I need a business proposal with sections for scope, timeline, and pricing, with a download button.",
        'gmail': "Check my unread emails and summarize what's new in my inbox.",
        'sheets': "Create a new Google Sheet for tracking expenses and set it up with the right columns.",
        'slides': "Build me a presentation template with a few slides I can flip through.",
        'chat': "Show me my Google Chat spaces and summarize what's been going on in them.",
        'forms': "Create a feedback form that's interactive with validation and a nice design.",
        'keep': "Pull up my Google Keep notes and show me what I've saved.",
        'meet': "Check my upcoming meetings and let me know what's next on my calendar.",
        'contacts': "Show me my Google Contacts and help me find someone.",
        'picker': "Open my Google Drive picker so I can select a file to work with.",
        'firebase': "Create a Firebase-style dashboard with live data cards and activity feed.",
        'docs': "Ask me what type of document I need and which company it's for. I can request contracts, NDAs, terms of service, privacy policies, letters of intent, partnership agreements, service level agreements, or any other business document. Make it look professional with the company's name throughout and include a download button."
      };
      const prompt = prompts[toolId] || `Execute action: ${toolId}`;
      if (connected) {
        gracefulInterrupt().then(() => {
          client.send({ text: prompt });
        });
        useLogStore.getState().addTurn({ role: 'user', text: prompt, isFinal: true });
        api.saveConversationTurn('user', prompt, sessionID).catch(console.error);
      }
      else {
        useLogStore.getState().addTurn({ role: 'user', text: prompt, isFinal: true });
        api.saveConversationTurn('user', prompt, sessionID).catch(console.error);
        pendingPromptRef.current = prompt;
        connect();
      }
    }
  };

  const handleConnectWhatsapp = async () => {
    setIsWhatsappLoading(true);
    setWhatsappStatus(null);
    setWhatsappQr(null);
    try {
      const data = await api.connectWhatsapp();
      if (data.instance?.state === 'open') {
        setWhatsappStatus('open');
      } else if (data.qrcode?.base64) {
        setWhatsappQr(data.qrcode.base64);
        setWhatsappStatus('qr');
      } else if (data.base64) {
        // sometimes evolution api returns base64 directly
        setWhatsappQr(data.base64);
        setWhatsappStatus('qr');
      } else if (data.state === 'open') {
        setWhatsappStatus('open');
      } else {
        setWhatsappStatus('unknown');
        console.log("WhatsApp API response:", data);
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to connect to WhatsApp API: " + e.message);
    } finally {
      setIsWhatsappLoading(false);
    }
  };

  const handleUpdateMemory = async (id: string, newValue: string, type: string) => {
    try {
      await api.deleteMemory(id);
      await api.saveMemory(newValue, type);
      const memoryList = await api.fetchMemories();
      setMemories(memoryList);
      setEditingMemoryIndex(null);
    } catch (e) {
      console.error("Error updating memory:", e);
    }
  };

  const handleAddMemory = async () => {
    if (!newMemoryValue.trim()) return;
    try {
      await api.saveMemory(newMemoryValue, newMemoryType);
      const memoryList = await api.fetchMemories();
      setMemories(memoryList);
      setIsAddingMemory(false);
      setNewMemoryValue('');
      setNewMemoryType('personal');

      setMemorySuccessMsg("Memory added successfully!");
      setTimeout(() => setMemorySuccessMsg(null), 3000);
    } catch (e) {
      console.error("Error adding memory:", e);
    }
  };

  const handleConfirmPendingMemory = async (type: string) => {
    if (!pendingMemory) return;
    try {
      await api.saveMemory(pendingMemory.content, type);
      const memoryList = await api.fetchMemories();
      setMemories(memoryList);
      setPendingMemory(null);

      setMemorySuccessMsg(`Memory saved as ${type}!`);
      setTimeout(() => setMemorySuccessMsg(null), 3000);
    } catch (e) {
      console.error("Error saving pending memory:", e);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await api.deleteMemory(id);
      const memoryList = await api.fetchMemories();
      setMemories(memoryList);
    } catch (e) {
      console.error("Error deleting memory:", e);
    }
  };

  return (
    <div id="app" className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span className="ai-name">Eburon AI</span>
        </div>

        {connected && (
          <div className="session-timer" style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: timerSeconds >= 1140 ? '#ff8888' : 'var(--text-muted)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '2px 10px',
            borderRadius: '12px',
            border: `1px solid ${timerSeconds >= 1140 ? 'rgba(255,0,0,0.2)' : 'var(--border-color)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
            zIndex: 10
          }}>
            <Clock className={timerSeconds >= 1140 ? 'animate-pulse' : ''} style={{ color: timerSeconds >= 1140 ? '#ff4d4d' : 'var(--accent-active)', width: '14px', height: '14px' }} />
            {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
            {timerSeconds >= 1140 && <span style={{ marginLeft: '4px', fontSize: '10px', textTransform: 'uppercase' }}>Limiting...</span>}
          </div>
        )}

        {memorySuccessMsg && (
          <div className="memory-toast" style={{
            position: 'absolute',
            left: '50%',
            top: '70px',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--accent-active)',
            color: 'var(--bg-main)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            animation: 'fadeInOut 3s forwards'
          }}>
            <CheckCircle size={16} />
            {memorySuccessMsg}
          </div>
        )}

        {connected && (
          <div className="speaker-visualizer">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="speaker-bar"
                style={{
                  height: `${4 + (volume * (12 + (i % 3 === 0 ? 8 : 4)))}px`,
                  opacity: 0.4 + (volume * 0.6)
                }}
              />
            ))}
          </div>
        )}

        <div className="header-right">
          <button
            onClick={handleConnectToggle}
            className="connect-btn"
            style={{ backgroundColor: connected ? 'var(--accent-active)' : 'var(--accent-primary)' }}
          >
            <Plug size={18} /> <span>{connected ? 'Connected' : 'Connect'}</span>
          </button>
        </div>
      </header>

      {/* Skills Rail */}
      <div id="skills-rail">
        <div className="skills-row" data-row="1">
          <div className="skills-track">
            <div className="skill-chip" onClick={() => handleToolAction('profile')}><div className="skill-glyph bg-profile"><User /></div><span className="skill-label">Profile</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('tasks')}><div className="skill-glyph bg-tasks"><ListChecks /></div><span className="skill-label">Tasks</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('calendar')}><div className="skill-glyph bg-calendar"><Calendar /></div><span className="skill-label">Calendar</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('drive')}><div className="skill-glyph bg-drive"><FolderOpen /></div><span className="skill-label">Drive</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('google')}><div className="skill-glyph bg-google"><Globe /></div><span className="skill-label">Google</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('signature')}><div className="skill-glyph bg-signature"><PenTool /></div><span className="skill-label">Sign</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('company')}><div className="skill-glyph bg-company"><Building /></div><span className="skill-label">Company</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('chat')}><div className="skill-glyph bg-profile"><MessageSquare /></div><span className="skill-label">Chat</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('forms')}><div className="skill-glyph bg-tasks"><ClipboardList /></div><span className="skill-label">Forms</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('keep')}><div className="skill-glyph bg-calendar"><StickyNote /></div><span className="skill-label">Keep</span></div>
          </div>
        </div>
        <div className="skills-row" data-row="2">
          <div className="skills-track">
            <div className="skill-chip" onClick={() => handleToolAction('settings')}><div className="skill-glyph bg-settings"><Settings /></div><span className="skill-label">Settings</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('tools')}><div className="skill-glyph bg-tools"><Wrench /></div><span className="skill-label">Tools</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('history')}><div className="skill-glyph bg-history"><History /></div><span className="skill-label">History</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('proposal')}><div className="skill-glyph bg-proposal"><Presentation /></div><span className="skill-label">Proposal</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('gmail')}><div className="skill-glyph bg-gmail"><Mail /></div><span className="skill-label">Gmail</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('sheets')}><div className="skill-glyph bg-sheets"><Table /></div><span className="skill-label">Sheets</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('slides')}><div className="skill-glyph bg-slides"><Presentation /></div><span className="skill-label">Slides</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('contract')}><div className="skill-glyph" style={{ background: 'linear-gradient(135deg, #c9a84c, #8b6914)' }}><FileSignature /></div><span className="skill-label">Contract</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('invoice')}><div className="skill-glyph" style={{ background: 'linear-gradient(135deg, #0984e3, #0652DD)' }}><Receipt /></div><span className="skill-label">Invoice</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('meet')}><div className="skill-glyph bg-drive"><Video /></div><span className="skill-label">Meet</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('contacts')}><div className="skill-glyph bg-google"><Users /></div><span className="skill-label">Contacts</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('whatsapp')}><div className="skill-glyph bg-google" style={{ backgroundColor: '#25D366' }}><MessageCircle /></div><span className="skill-label">WhatsApp</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('picker')}><div className="skill-glyph bg-company"><FileSearch /></div><span className="skill-label">Picker</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('firebase')}><div className="skill-glyph bg-tools"><Database /></div><span className="skill-label">Firebase</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('scanner')}><div className="skill-glyph bg-settings" style={{ background: 'linear-gradient(135deg, #a855f7, #6b21a8)' }}><QrCode /></div><span className="skill-label">Scanner</span></div>
            <div className="skill-chip" onClick={() => handleToolAction('docs')}><div className="skill-glyph" style={{ background: 'linear-gradient(135deg, #00b894, #00a381)' }}><ScrollText /></div><span className="skill-label">Docs</span></div>
            <div className="skill-chip" onClick={handleLocationSkillClick}><div className="skill-glyph bg-google" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}><MapPin /></div><span className="skill-label">Location</span></div>
          </div>
        </div>
      </div>

      {/* Chat Stream */}
      <main id="text-streaming-area" ref={chatAreaRef}>
        <div id="conversation-container">
          <div className="conversation-message ai">Hey Boss! I'm Beatrice. Connect your session!</div>
          {turns.filter(turn => turn.role !== 'system').map((turn, i) => (
            <div key={i} className={`conversation-message ${turn.role === 'user' ? 'user' : 'ai'}`}>
              {turn.text}
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Dock */}
      <audio
        ref={bgAudioRef}
        src="/freesound_community-121116-bank-interior-ambience-office-doors-footstaps-printer-typing-voices-17642.mp3"
        loop
      />
      <div className="bottom-dock">
        <div className="input-wrapper">
          <div className="input-bar">
            <button className="attach-btn" onClick={() => fileInputRef.current?.click()}><Paperclip size={20} /></button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
            <input
              type="text"
              id="message-input"
              placeholder="Message or ask Beatrice..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              autoComplete="off" />
            <button id="send-button" className="send-btn" onClick={handleSend}><Send size={18} /></button>
          </div>
        </div>
        <nav className="nav-controls">
          <button className={`nav-item ${micState ? 'active' : ''}`} onClick={() => setMicState(!micState)}>
            <div className="icon-wrapper">
              <div className="icon-pulse" style={{
                width: micState ? `${28 + clientVolume * 30}px` : '0px',
                height: micState ? `${28 + clientVolume * 30}px` : '0px',
                opacity: micState && clientVolume > 0.01 ? 0.3 : 0
              }}></div>
              <div className="icon-pulse-ring" style={{
                width: micState ? `${32 + clientVolume * 50}px` : '0px',
                height: micState ? `${32 + clientVolume * 50}px` : '0px',
                opacity: micState && clientVolume > 0.01 ? 0.5 : 0
              }}></div>
              {micState ? <Mic size={18} /> : <MicOff size={18} />}
            </div>
            <span>{micState ? 'Mute' : 'Unmute'}</span>
          </button>

          <button className={`nav-item ${isScreenShareActive ? 'active' : ''}`} onClick={isScreenShareActive ? stopStream : startScreenShare}>
            <div className="icon-wrapper">
              <div className="icon-pulse" style={{
                width: isScreenShareActive ? `32px` : '0px',
                height: isScreenShareActive ? `32px` : '0px',
                opacity: isScreenShareActive ? 0.3 : 0,
                animation: isScreenShareActive ? 'pulse-anim 2s infinite' : 'none'
              }}></div>
              <MonitorUp size={18} />
            </div>
            <span>{isScreenShareActive ? 'Stop Share' : 'Share Screen'}</span>
          </button>

          <button className={`nav-item ${activeOverlay === 'videocall' ? 'active' : ''}`} onClick={() => {
            if (activeOverlay === 'videocall') {
              setActiveOverlay(null);
              stopStream();
            } else {
              setActiveOverlay('videocall');
              if (!isWebcamActive) startWebcam();
            }
          }}>
            <div className="icon-wrapper" style={{ overflow: 'hidden' }}>
              <div className="icon-pulse" style={{
                width: activeOverlay === 'videocall' ? `32px` : '0px',
                height: activeOverlay === 'videocall' ? `32px` : '0px',
                opacity: activeOverlay === 'videocall' ? 0.3 : 0,
                animation: activeOverlay === 'videocall' ? 'pulse-anim 2s infinite' : 'none'
              }}></div>
              <Video size={18} />
            </div>
            <span>{activeOverlay === 'videocall' ? 'End Call' : 'Video'}</span>
          </button>
        </nav>
      </div>

      {/* Screen Share Overlay */}

      <video
        ref={isScreenShareActive ? bindVideoRef : undefined}
        autoPlay
        playsInline
        muted
        className="video-overlay screenshare"
        style={{ display: isScreenShareActive && stream ? 'block' : 'none' }}
      />

      {/* Workspace & Artifact Overlay */}
      <div id="overlay-workspace" className={`full-page-overlay ${activeWorkspaceResult || isWorkspaceGenerating ? 'active' : ''}`}>
        <div className="overlay-header">
          <div className="overlay-title">
            {isWorkspaceGenerating ? 'Generating...' : activeWorkspaceResult?.artifact ? `Artifact: ${activeWorkspaceResult.artifact.title}` : 'Workspace Data'}
          </div>
          <button className="close-overlay-btn" onClick={() => { setActiveWorkspaceResult(null); useUI.getState().setWorkspaceGenerating(false); }}><X size={20} /></button>
        </div>
        <div className={`overlay-content ${!isWorkspaceGenerating && activeWorkspaceResult ? 'fade-in-up' : ''}`} style={{ overflowY: activeWorkspaceResult?.artifact?.type === 'html' ? 'hidden' : 'auto', padding: activeWorkspaceResult?.artifact?.type === 'html' ? '0' : '24px' }}>
          {isWorkspaceGenerating ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px', padding: '60px 20px' }}>
              <div className="generating-spinner" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', animation: 'spin 0.8s linear infinite' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '400px' }}>
                <div className="skeleton-line" style={{ height: '14px', borderRadius: '8px', background: 'var(--bg-chip)', width: '80%', animation: 'shimmer 1.5s ease-in-out infinite' }}></div>
                <div className="skeleton-line" style={{ height: '14px', borderRadius: '8px', background: 'var(--bg-chip)', width: '60%', animation: 'shimmer 1.5s ease-in-out infinite 0.2s' }}></div>
                <div className="skeleton-line" style={{ height: '14px', borderRadius: '8px', background: 'var(--bg-chip)', width: '90%', animation: 'shimmer 1.5s ease-in-out infinite 0.4s' }}></div>
                <div className="skeleton-line" style={{ height: '14px', borderRadius: '8px', background: 'var(--bg-chip)', width: '45%', animation: 'shimmer 1.5s ease-in-out infinite 0.6s' }}></div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Beatrice is building your document...</div>
            </div>
          ) : activeWorkspaceResult?.artifact ? (
            <div className="artifact-viewer" style={{ backgroundColor: activeWorkspaceResult.artifact.type === 'html' ? 'transparent' : 'white', color: 'black', padding: activeWorkspaceResult.artifact.type === 'html' ? '0' : '32px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: activeWorkspaceResult.artifact.type === 'html' ? '100%' : 'auto', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {activeWorkspaceResult.artifact.type === 'html' && (
                <iframe
                  title={activeWorkspaceResult.artifact.title || 'Preview'}
                  srcDoc={activeWorkspaceResult.artifact.content}
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0', backgroundColor: '#fff', flex: 1 }}
                  sandbox="allow-scripts allow-same-origin"
                />
              )}
              {activeWorkspaceResult.artifact.type === 'markdown' && (
                <div className="markdown-body">
                  <ReactMarkdown>{activeWorkspaceResult.artifact.content}</ReactMarkdown>
                </div>
              )}
              {activeWorkspaceResult.artifact.type === 'code' && (
                <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px', overflowX: 'auto' }}>
                  <code>{activeWorkspaceResult.artifact.content}</code>
                </pre>
              )}
              {activeWorkspaceResult.artifact.type === 'structured' && (
                <div style={{ whiteSpace: 'pre-wrap' }}>{activeWorkspaceResult.artifact.content}</div>
              )}
              {activeWorkspaceResult.artifact.type === 'chart' && (
                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  [Chart Visualization Rendering: {activeWorkspaceResult.artifact.title}]
                  <pre style={{ fontSize: '10px', textAlign: 'left' }}>{activeWorkspaceResult.artifact.content}</pre>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Profile Overlay */}
      <div id="overlay-profile" className={`full-page-overlay ${activeOverlay === 'profile' ? 'active' : ''}`}>
        <div className="overlay-header">
          <div className="overlay-title">User Profile</div>
          <button className="close-overlay-btn" onClick={() => setActiveOverlay(null)}><i className="ph-bold ph-x"></i></button>
        </div>
        <div className="overlay-content">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src="https://ui-avatars.com/api/?name=Boss&background=cbfb45&color=000&size=100" style={{ borderRadius: '50%', marginBottom: '12px' }} alt="Profile" />
            <h2 style={{ fontSize: '20px' }}>Chief Executive</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>admin@eburon.ai</p>
          </div>

          <div className="form-group">
            <label>Persona Background</label>
            <textarea className="form-input" rows={5} placeholder="Tell Beatrice about your business context, communication style..."></textarea>
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Stored Memories <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({memories.length})</span></span>
              <select
                className="form-input"
                style={{ width: 'auto', padding: '4px 8px', fontSize: '12px', height: 'auto' }}
                value={memoryFilter}
                onChange={(e) => setMemoryFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="project">Project</option>
              </select>
            </label>
            <div className="memory-list" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {!isAddingMemory ? (
                <button
                  onClick={() => setIsAddingMemory(true)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px dashed var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                >
                  + Add New Memory
                </button>
              ) : (
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--accent-primary)' }}>
                  <textarea
                    className="form-input"
                    value={newMemoryValue}
                    onChange={(e) => setNewMemoryValue(e.target.value)}
                    placeholder="E.g. I prefer concise answers..."
                    rows={2}
                    autoFocus
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <select className="form-input" style={{ width: '120px', padding: '4px', fontSize: '12px', height: 'auto' }} value={newMemoryType} onChange={(e) => setNewMemoryType(e.target.value)}>
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="project">Project</option>
                    </select>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="pill-btn" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => { setIsAddingMemory(false); setNewMemoryValue(''); }}>Cancel</button>
                      <button className="pill-btn" style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: 'var(--accent-active)', color: 'var(--bg-main)' }} onClick={handleAddMemory}>Save</button>
                    </div>
                  </div>
                </div>
              )}

              {memories.filter((m) => memoryFilter === 'all' || m.type === memoryFilter).length === 0 ? (
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                  No memories found.
                </div>
              ) : (
                memories.filter((m) => memoryFilter === 'all' || m.type === memoryFilter).map((m) => (
                  <div key={m.id} className="memory-item" style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {editingMemoryIndex === m.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea
                          className="form-input"
                          value={editingMemoryValue}
                          onChange={(e) => setEditingMemoryValue(e.target.value)}
                          rows={2}
                          autoFocus
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <select className="form-input" style={{ width: '120px', padding: '4px', fontSize: '12px', height: 'auto' }} value={editingMemoryType} onChange={(e) => setEditingMemoryType(e.target.value)}>
                            <option value="personal">Personal</option>
                            <option value="work">Work</option>
                            <option value="project">Project</option>
                          </select>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="pill-btn"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                              onClick={() => setEditingMemoryIndex(null)}
                            >Cancel</button>
                            <button
                              className="pill-btn"
                              style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: 'var(--accent-active)', color: 'var(--bg-main)' }}
                              onClick={() => handleUpdateMemory(m.id, editingMemoryValue, editingMemoryType)}
                            >Save</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '13px', lineHeight: '1.4', flex: 1 }}>{m.content}</span>
                          <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                            <button
                              className="icon-btn"
                              style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                              onClick={() => {
                                setEditingMemoryIndex(m.id);
                                setEditingMemoryValue(m.content);
                                setEditingMemoryType(m.type || 'personal');
                              }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="icon-btn"
                              style={{ color: '#ff4d4d', background: 'transparent', border: 'none', cursor: 'pointer' }}
                              onClick={() => handleDeleteMemory(m.id)}
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '10px',
                            color: m.type === 'project' ? '#a855f7' : m.type === 'work' ? '#3b82f6' : 'var(--accent-active)',
                            backgroundColor: m.type === 'project' ? 'rgba(168,85,247,0.15)' : m.type === 'work' ? 'rgba(59,130,246,0.15)' : 'rgba(203,251,69,0.1)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: 600
                          }}>{m.type || 'Personal'}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(m.created_at || m.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <button className="save-now-btn" onClick={async (e) => {
            const btn = e.currentTarget;
            try {
              await api.updateSettings({
                persona_name: personaName,
                user_call_name: userCallName,
                system_prompt: systemPrompt,
                voice: voice,
                language: language
              });
              btn.textContent = 'Saved!';
              setTimeout(() => { btn.textContent = 'Save Now'; setActiveOverlay(null); }, 1500);
            } catch (err) {
              console.error("Error saving settings:", err);
              btn.textContent = "Error!";
              setTimeout(() => { btn.textContent = "Save Now"; }, 1500);
            }
          }}>Save Now</button>

          <div className="danger-action" onClick={() => {
            signOut(auth);
            useAuth.getState().setGoogleAccessToken(null);
          }}>
            Log Out
          </div>
        </div>
      </div>

      {/* Settings Overlay */}
      <div id="overlay-settings" className={`full-page-overlay ${activeOverlay === 'settings' ? 'active' : ''}`}>
        <div className="overlay-header">
          <div className="overlay-title">App Settings</div>
          <button className="close-overlay-btn" onClick={() => setActiveOverlay(null)}><X size={20} /></button>
        </div>
        <div className="overlay-content">
          <div className="form-group">
            <label>Persona Name</label>
            <input type="text" className="form-input" value={personaName || ''} onChange={(e) => setPersonaName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>How to call you</label>
            <input type="text" className="form-input" value={userCallName || ''} onChange={(e) => setUserCallName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Behavior Persona (How does it react? How does it respond?)</label>
            <textarea
              className="form-input"
              rows={4}
              value={systemPrompt || ''}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="e.g. Friendly, patient, and solutions-oriented..."
            />
          </div>

          <div className="form-group">
            <label>Presets</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              <button
                className="pill-btn"
                onClick={() => setTemplate('personal-assistant')}
                style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid var(--border-color)', fontSize: '12px', background: 'transparent', cursor: 'pointer' }}
              >
                Personal Assistant
              </button>
              <button
                className="pill-btn"
                onClick={() => setTemplate('customer-support')}
                style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid var(--border-color)', fontSize: '12px', background: 'transparent', cursor: 'pointer' }}
              >
                Customer Support
              </button>
              <button
                className="pill-btn"
                onClick={() => setTemplate('navigation-system')}
                style={{ padding: '6px 12px', borderRadius: '16px', border: '1px solid var(--border-color)', fontSize: '12px', background: 'transparent', cursor: 'pointer' }}
              >
                Navigation System
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Voice Persona</label>
            <select className="form-input" onChange={(e) => setVoice(e.target.value)} value={voice || ''}>
              <option value="Aoede">Aoede</option>
              <option value="Charon">Charon</option>
              <option value="Fenrir">Fenrir</option>
              <option value="Kore">Kore</option>
              <option value="Puck">Puck</option>
            </select>
          </div>
          <div className="form-group">
            <label>Language</label>
            <select className="form-input" onChange={(e) => setLanguage(e.target.value)} value={language || ''}>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ margin: 0 }}>Productive Idle Blog Mode</label>
            <label className="toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
              <input type="checkbox" checked={blogMode} onChange={(e) => setBlogMode(e.target.checked)} aria-label="Toggle blog mode" style={{ opacity: 0, width: 0, height: 0 }} />
              <span className="toggle-slider" style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                background: blogMode ? 'var(--primary-color, #6366f1)' : '#333', borderRadius: '24px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute', content: '', height: '18px', width: '18px', borderRadius: '50%',
                  background: '#fff', transition: '0.3s', top: '3px',
                  left: blogMode ? '23px' : '3px'
                }} />
              </span>
            </label>
          </div>
          <button className="save-now-btn" onClick={async (e) => {
            const btn = e.currentTarget;
            try {
              await api.updateSettings({
                persona_name: personaName,
                user_call_name: userCallName,
                system_prompt: systemPrompt,
                voice: voice,
                language: language,
                blog_mode: blogMode
              });
              setActiveOverlay(null);
            } catch (err) {
              console.error("Error saving settings:", err);
            }
          }}>Save Settings</button>
        </div>
      </div>

      {/* History Overlay */}
      <div id="overlay-history" className={`full-page-overlay ${activeOverlay === 'history' ? 'active' : ''}`}>
        <div className="overlay-header">
          <div className="overlay-title">Activity History</div>
          <button className="close-overlay-btn" onClick={() => setActiveOverlay(null)}><X size={20} /></button>
        </div>

        <div className="history-filters" style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="search-box" style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search conversation..."
              style={{ paddingLeft: '40px' }}
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select className="form-input" style={{ width: 'auto', flex: 1, height: '40px' }} value={historyRoleFilter} onChange={(e) => setHistoryRoleFilter(e.target.value as any)}>
              <option value="all">Every Role</option>
              <option value="user">User Only</option>
              <option value="agent">Agent Only</option>
              <option value="system">Tools Only</option>
            </select>
            <select className="form-input" style={{ width: 'auto', flex: 1, height: '40px' }} value={historyDateRange} onChange={(e) => setHistoryDateRange(e.target.value as any)}>
              <option value="all">All Sessions</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>
          {historyRoleFilter === 'system' && (
            <div className="tool-chips" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {['search', 'save_memory', 'meeting', 'artifact', 'command'].map(tool => (
                <button
                  key={tool}
                  className="pill-btn"
                  style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    backgroundColor: historyToolFilter === tool ? 'var(--accent-active)' : 'transparent',
                    color: historyToolFilter === tool ? 'var(--bg-main)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)'
                  }}
                  onClick={() => setHistoryToolFilter(prev => prev === tool ? 'all' : (tool as any))}
                >
                  {tool.replace('save_', '')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overlay-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {historyError ? (
            <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.2)', color: '#ff8888', fontSize: '14px', textAlign: 'center' }}>
              <AlertCircle style={{ display: 'block', fontSize: '32px', marginBottom: '12px', color: 'var(--accent-active)' }} size={32} />
              {historyError}
            </div>
          ) : turns.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No recent history.</p>
          ) : (
            turns
              .filter(t => {
                // Search filter
                const matchesSearch = t.text.toLowerCase().includes(historySearch.toLowerCase());

                // Role filter
                let matchesRole = true;
                if (historyRoleFilter !== 'all') {
                  matchesRole = t.role === historyRoleFilter;
                }

                // Tool filter
                let matchesTool = true;
                if (historyRoleFilter === 'system' && historyToolFilter !== 'all') {
                  matchesTool = t.toolName?.includes(historyToolFilter) || false;
                }

                // Date filter
                let matchesDate = true;
                if (historyDateRange !== 'all') {
                  const date = t.timestamp || new Date();
                  const now = new Date();
                  if (historyDateRange === 'today') {
                    matchesDate = date.toDateString() === now.toDateString();
                  } else if (historyDateRange === 'week') {
                    const weekAgo = new Date();
                    weekAgo.setDate(now.getDate() - 7);
                    matchesDate = date >= weekAgo;
                  }
                }

                return matchesSearch && matchesRole && matchesTool && matchesDate;
              })
              .map((turn, idx) => (
                <div
                  key={idx}
                  className={`history-item ${turn.role}`}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: turn.role === 'user' ? 'rgba(203,251,69,0.05)' : turn.role === 'system' ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${turn.role === 'user' ? 'rgba(203,251,69,0.1)' : 'rgba(255,255,255,0.05)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: turn.role === 'user' ? 'var(--accent-active)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {turn.role === 'system' && turn.toolName && ToolIcons[turn.toolName] && (() => {
                        const Icon = ToolIcons[turn.toolName];
                        return <Icon size={12} />;
                      })()}
                      {turn.role === 'user' ? userCallName : turn.role === 'system' ? 'System' : personaName}
                    </span>
                    {turn.isFinal && <CheckCircle size={10} style={{ color: 'var(--accent-active)', opacity: 0.5 }} />}
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                    <ReactMarkdown>{turn.text}</ReactMarkdown>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Map Overlay */}
      <div id="overlay-map" className={`full-page-overlay ${activeOverlay === 'map' ? 'active' : ''}`}>
        <div className="overlay-header">
          <div className="overlay-title">Navigation Map</div>
          <button className="close-overlay-btn" onClick={() => setActiveOverlay(null)}><X size={20} /></button>
        </div>
        <div className="overlay-content" style={{ padding: 0, overflow: 'hidden' }}>
          {mapUrl && (
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          )}
        </div>
      </div>

      {/* Picker Overlay */}
      <div id="overlay-picker" className={`full-page-overlay ${activeOverlay === 'picker' ? 'active' : ''}`}>
        <div className="overlay-header">
          <div className="overlay-title">Google Drive Picker</div>
          <button className="close-overlay-btn" onClick={() => setActiveOverlay(null)}><X size={20} /></button>
        </div>
        <div className="overlay-content" style={{ padding: '24px' }}>
          {isDriveLoading ? (
            <div>Loading your files...</div>
          ) : driveFiles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {driveFiles.map(file => (
                <a
                  key={file.id}
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'inherit', textDecoration: 'none', display: 'block' }}>
                  {file.name}
                </a>
              ))}
            </div>
          ) : (
            <div>No files found.</div>
          )}
        </div>
      </div>

      {/* WhatsApp Overlay */}
      <div id="overlay-whatsapp" className={`full-page-overlay ${activeOverlay === 'whatsapp' ? 'active' : ''}`}>
        <div className="overlay-header">
          <div className="overlay-title">Connect WhatsApp</div>
          <button className="close-overlay-btn" onClick={() => setActiveOverlay(null)}><X size={20} /></button>
        </div>
        <div
          className="overlay-content"
          style={
            whatsappStatus === 'open'
              ? { padding: '0', height: 'calc(100% - 60px)', overflow: 'hidden', display: 'flex' }
              : { padding: '32px', textAlign: 'center', overflowY: 'auto' }
          }
        >
          {whatsappStatus === 'open' ? (
            <div style={{ display: 'flex', width: '100%', height: '100%', background: '#0b141a', color: '#e9edef', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
              {/* WhatsApp Sidebar */}
              <div style={{ width: '30%', borderRight: '1px solid #222d34', display: 'flex', flexDirection: 'column', background: '#111b21' }}>
                {/* Sidebar Header */}
                <div style={{ height: '60px', padding: '10px 16px', background: '#202c33', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4f5e64', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>U</div>
                  <div style={{ display: 'flex', gap: '20px', color: '#aebac1' }}>
                    <MessageCircle size={20} style={{ cursor: 'pointer' }} />
                    <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={async () => {
                      try {
                        setIsWhatsappLoading(true);
                        setWhatsappStatus(null);
                        setWhatsappQr(null);
                      } catch (e) {
                        setWhatsappStatus(null);
                      } finally {
                        setIsWhatsappLoading(false);
                      }
                    }}>Logout</button>
                  </div>
                </div>
                {/* Search Bar */}
                <div style={{ padding: '8px 12px', background: '#111b21' }}>
                  <div style={{ background: '#202c33', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#aebac1', fontSize: '14px' }}>🔍</span>
                    <input type="text" placeholder="Search or start new chat" style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', width: '100%', outline: 'none' }} defaultValue="" disabled />
                  </div>
                </div>
                {/* Chat List */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {whatsappThreads.map(thread => {
                    const isSelected = activeThread === thread.phone;
                    const avatarLetter = (thread.sender_name || thread.phone || 'U').charAt(0).toUpperCase();
                    const displayTime = new Date(thread.last_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={thread.phone}
                        style={{
                          display: 'flex',
                          padding: '12px 16px',
                          background: isSelected ? '#2a3942' : 'transparent',
                          borderBottom: '1px solid #222d34',
                          cursor: 'pointer',
                          gap: '12px',
                          alignItems: 'center'
                        }}
                        onClick={() => setActiveThread(thread.phone)}
                      >
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: thread.phone === 'beatrice' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#2e3b4e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: '#fff',
                          fontSize: '18px'
                        }}>
                          {avatarLetter}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500', fontSize: '14px', color: '#fff' }}>{thread.sender_name}</span>
                            <span style={{ fontSize: '11px', color: thread.phone === 'beatrice' ? '#25D366' : '#8696a0' }}>
                              {thread.phone === 'beatrice' ? 'Active' : displayTime}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#aebac1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {thread.last_text}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chat Window */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0b141a' }}>
                {/* Chat Header */}
                {(() => {
                  const currentThread = whatsappThreads.find(t => t.phone === activeThread) || { phone: 'beatrice', sender_name: 'Beatrice (AI Voice Agent)' };
                  const avatarLetter = currentThread.sender_name.charAt(0).toUpperCase();
                  return (
                    <div style={{ height: '60px', padding: '10px 16px', background: '#202c33', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '1px solid #2a3942' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: currentThread.phone === 'beatrice' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#2e3b4e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: '#fff'
                        }}>
                          {avatarLetter}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500', fontSize: '14px', color: '#fff' }}>{currentThread.sender_name}</span>
                          <span style={{ fontSize: '12px', color: '#8696a0' }}>{currentThread.phone === 'beatrice' ? 'online' : 'offline'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '24px', color: '#aebac1', cursor: 'pointer' }}>
                        <span>📞</span>
                        <span>📹</span>
                        <span>🔍</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Message List */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#0b141a', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ alignSelf: 'center', background: '#182229', color: '#8696a0', fontSize: '11px', padding: '6px 12px', borderRadius: '8px', margin: '8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🔒 Messages are end-to-end encrypted. No one outside of this chat can read them.
                  </div>

                  {activeThread === 'beatrice' ? (
                    <>
                      <div style={{ alignSelf: 'flex-start', background: '#202c33', padding: '8px 12px', borderRadius: '8px', maxWidth: '65%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', color: '#e9edef' }}>Hello! I am Beatrice, your Eburon Voice Agent. I've successfully connected your WhatsApp account!</span>
                        <span style={{ alignSelf: 'flex-end', fontSize: '10px', color: '#8696a0' }}>18:41</span>
                      </div>
                      <div style={{ alignSelf: 'flex-end', background: '#005c4b', padding: '8px 12px', borderRadius: '8px', maxWidth: '65%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', color: '#e9edef' }}>Awesome, Beatrice! Can you send a message for me?</span>
                        <span style={{ alignSelf: 'flex-end', fontSize: '10px', color: '#8696a0', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          18:42 <span style={{ color: '#53bdeb' }}>✓✓</span>
                        </span>
                      </div>
                      <div style={{ alignSelf: 'flex-start', background: '#202c33', padding: '8px 12px', borderRadius: '8px', maxWidth: '65%', position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', color: '#e9edef' }}>Yes, absolutely! Just say "Send a WhatsApp message" during our live voice call, and I will dispatch it immediately using this channel.</span>
                        <span style={{ alignSelf: 'flex-end', fontSize: '10px', color: '#8696a0' }}>18:42</span>
                      </div>
                      {whatsappMessages
                        .filter(m => m.phone === 'beatrice')
                        .map((msg, index) => {
                          const timeStr = msg.timestamp ? new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                          return (
                            <div
                              key={msg.id || index}
                              style={{
                                alignSelf: msg.from_me ? 'flex-end' : 'flex-start',
                                background: msg.from_me ? '#005c4b' : '#202c33',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                maxWidth: '65%',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}
                            >
                              <span style={{ fontSize: '14px', color: '#e9edef' }}>{msg.text}</span>
                              <span style={{ alignSelf: 'flex-end', fontSize: '10px', color: '#8696a0', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {timeStr}
                                {msg.from_me && <span style={{ color: '#53bdeb' }}>✓✓</span>}
                              </span>
                            </div>
                          );
                        })}
                      <div style={{ alignSelf: 'center', background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366', color: '#25D366', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', margin: '16px 0' }}>
                        <span>✅</span> <strong>WhatsApp Gateway Live</strong>: Ready to receive real-time voice commands.
                      </div>
                    </>
                  ) : (
                    whatsappMessages
                      .filter(m => m.phone === activeThread)
                      .map((msg, index) => {
                        const timeStr = msg.timestamp ? new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                        return (
                          <div
                            key={msg.id || index}
                            style={{
                              alignSelf: msg.from_me ? 'flex-end' : 'flex-start',
                              background: msg.from_me ? '#005c4b' : '#202c33',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              maxWidth: '65%',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <span style={{ fontSize: '14px', color: '#e9edef' }}>{msg.text}</span>
                            <span style={{ alignSelf: 'flex-end', fontSize: '10px', color: '#8696a0', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              {timeStr}
                              {msg.from_me && <span style={{ color: '#53bdeb' }}>✓✓</span>}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!whatsappInputText.trim()) return;
                    const targetNum = activeThread;
                    if (targetNum === 'beatrice') {
                      const userMsg = whatsappInputText;
                      setWhatsappInputText('');
                      const tempOutId = `msg-out-${Date.now()}`;
                      setWhatsappMessages(prev => [...prev, {
                        id: tempOutId,
                        phone: 'beatrice',
                        text: userMsg,
                        from_me: true,
                        timestamp: Math.floor(Date.now() / 1000)
                      }]);
                      setTimeout(() => {
                        setWhatsappMessages(prev => [...prev, {
                          id: `msg-in-${Date.now()}`,
                          phone: 'beatrice',
                          text: `I've received your message, Boss! Say "Send a WhatsApp message" during our voice session to message real phone numbers, or select a thread from the sidebar.`,
                          from_me: false,
                          timestamp: Math.floor(Date.now() / 1000)
                        }]);
                      }, 1000);
                    } else {
                      const msgToSend = whatsappInputText;
                      setWhatsappInputText('');
                      try {
                        await api.sendWhatsappMessage(targetNum, msgToSend);
                      } catch (err: any) {
                        alert("Failed to send WhatsApp message: " + err.message);
                      }
                    }
                  }}
                  style={{ height: '60px', padding: '10px 16px', background: '#202c33', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <span style={{ color: '#8696a0', fontSize: '20px', cursor: 'pointer' }}>😊</span>
                  <span style={{ color: '#8696a0', fontSize: '20px', cursor: 'pointer' }}>📎</span>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={whatsappInputText}
                    onChange={(e) => setWhatsappInputText(e.target.value)}
                    style={{ flex: 1, background: '#2a3942', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                  <button type="submit" style={{ background: 'none', border: 'none', color: '#8696a0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ marginBottom: '24px' }}>
                <MessageCircle size={48} color="#25D366" style={{ margin: '0 auto', display: 'block' }} />
                <h2 style={{ fontSize: '20px', color: '#fff', marginTop: '16px', marginBottom: '8px' }}>Link Your WhatsApp</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
                  Scan the QR code to connect your WhatsApp account.
                </p>
              </div>
              <div style={{
                background: '#fff',
                width: '240px',
                height: '240px',
                margin: '0 auto 24px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                boxSizing: 'content-box',
                color: '#000'
              }}>
                {isWhatsappLoading ? (
                  <div className="text-gray-500">Loading connection...</div>
                ) : whatsappStatus === 'open' ? (
                  <div className="text-green-600 font-bold">Connected to WhatsApp!</div>
                ) : whatsappQr ? (
                  <img src={whatsappQr} alt="WhatsApp QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <QrCode size={120} color="#000" />
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Ensure the WhatsApp backend is configured.</p>
              <button
                className="btn-primary"
                style={{ marginTop: '24px', padding: '12px 24px', borderRadius: '12px' }}
                onClick={handleConnectWhatsapp}
                disabled={isWhatsappLoading}
              >
                {isWhatsappLoading ? 'Loading...' : 'Generate New QR Code'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Supermarket Scanner Overlay */}
      <div id="overlay-scanner" className={`full-page-overlay ${activeOverlay === 'scanner' ? 'active' : ''}`}>
        <div className="overlay-header">
          <div className="overlay-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={20} color="var(--accent-active)" />
            Supermarket Scanner
          </div>
          <button className="close-overlay-btn" onClick={() => setActiveOverlay(null)}><X size={20} /></button>
        </div>
        <div className="overlay-content" style={{ padding: '24px', backgroundColor: 'var(--bg-main)' }}>
          <div className="scanner-container">
            {/* Header info */}
            <div style={{ textAlign: 'center', maxWidth: '420px', margin: '0 auto 12px' }}>
              <p style={{ color: 'var(--text-main)', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
                Scan Supermarket Barcodes & QR Codes
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.4' }}>
                Point your camera at any product code. Beatrice will instantly identify it, translate the details to your preferred language, and speak the description in live voice audio.
              </p>
            </div>

            {/* Translation Language Selection */}
            <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Translate to Language:
              </label>
              <select
                className="form-input"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px' }}
                value={scannerLanguage}
                onChange={(e) => setScannerLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Camera Viewfinder Box */}
            <div className={`scanner-viewfinder ${isScannerRunning ? 'active' : ''}`}>
              <div id="qr-reader" style={{ width: '100%', height: '100%' }}></div>
              {isScannerRunning && (
                <>
                  <div className="scanner-laser"></div>
                  <div className="scanner-bracket bracket-tl"></div>
                  <div className="scanner-bracket bracket-tr"></div>
                  <div className="scanner-bracket bracket-bl"></div>
                  <div className="scanner-bracket bracket-br"></div>
                </>
              )}
              {!isScannerRunning && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgba(0,0,0,0.6)', padding: '20px', textAlign: 'center' }}>
                  <QrCode size={48} color="rgba(255,255,255,0.2)" />
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Camera scanner is offline</p>
                </div>
              )}
            </div>

            {/* Scanner Controls */}
            <div style={{ width: '100%', maxWidth: '320px', display: 'flex', gap: '12px' }}>
              {!isScannerRunning ? (
                <button
                  className="save-now-btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '50px' }}
                  onClick={startScanner}
                >
                  <Video size={18} />
                  Start Camera Scanner
                </button>
              ) : (
                <button
                  className="save-now-btn"
                  style={{ backgroundColor: 'var(--accent-danger)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '50px' }}
                  onClick={stopScanner}
                >
                  <VideoOff size={18} />
                  Stop Camera Scanner
                </button>
              )}
            </div>

            {/* Results Block */}
            {scannedResult && (
              <div className="scanner-results-card">
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-active)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-active)', display: 'inline-block' }}></span>
                  Product Code Scanned
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all', marginBottom: '12px', fontFamily: 'monospace' }}>
                  {scannedResult}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {!connected ? (
                    <span style={{ color: 'var(--accent-danger)' }}>
                      ⚠️ Connect the Gemini Live audio session to hear Beatrice speak the product details translated to {scannerLanguage}.
                    </span>
                  ) : (
                    <span>
                      🎤 Beatrice is explaining and translating the product to <strong>{scannerLanguage}</strong>. Listen to her voice!
                    </span>
                  )}
                </div>
                {connected && (
                  <button
                    className="save-now-btn"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)', marginTop: '16px', padding: '10px 18px', fontSize: '13px', borderRadius: '50px' }}
                    onClick={() => explainProductWithGemini(scannedResult)}
                  >
                    🔊 Rescan / Re-explain Product
                  </button>
                )}
              </div>
            )}

            {scannerError && (
              <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: 'var(--accent-danger)', fontSize: '13px', textAlign: 'center', width: '100%', maxWidth: '320px' }}>
                {scannerError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen Video Page (Meet) Overlay */}
      <div id="overlay-meet" className={`full-page-overlay ${activeOverlay === 'meet' ? 'active' : ''}`} style={{ backgroundColor: '#09090b', zIndex: 150 }}>
        {/* Glowing Top Banner */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          right: '24px',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(15, 15, 15, 0.6)',
            backdropFilter: 'blur(16px)',
            padding: '10px 20px',
            borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            pointerEvents: 'auto'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: stream ? 'var(--accent-active)' : '#a1a1aa',
              boxShadow: stream ? '0 0 10px var(--accent-active)' : 'none',
              display: 'inline-block'
            }}></span>
            {isScreenShareActive ? 'Sharing Screen' : isWebcamActive ? 'Webcam Active' : 'Live Video Standby'}
          </div>

          {stream && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 217, 126, 0.1)',
              backdropFilter: 'blur(16px)',
              padding: '8px 16px',
              borderRadius: '30px',
              border: '1px solid rgba(0, 217, 126, 0.2)',
              color: 'var(--accent-active)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              <Zap size={14} className="animate-pulse" />
              Beatrice is Analyzing Live Feed
            </div>
          )}
        </div>

        {/* Video Canvas Container */}
        {stream ? (
          <video
            ref={bindVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #18181b 0%, #09090b 100%)', zIndex: 1, padding: '24px', textAlign: 'center' }}>
            <div style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', backdropFilter: 'blur(12px)' }}>
              <div style={{ padding: '18px', background: 'rgba(0, 217, 126, 0.1)', color: 'var(--accent-active)', borderRadius: '50%' }}>
                <Video size={40} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>Beatrice Live Vision Session</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Connect your webcam or start a screen share. Beatrice will watch your stream in real time and converse with you using her live multimodal audio voice.
              </p>
            </div>
          </div>
        )}

        {/* Floating Controls Overlay Bar */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(15, 15, 15, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 24px',
          borderRadius: '50px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          {/* Share Screen Button */}
          <button
            onClick={isScreenShareActive ? stopStream : handleMeetStartScreenShare}
            style={{
              background: isScreenShareActive ? 'var(--accent-active)' : 'rgba(255,255,255,0.06)',
              color: isScreenShareActive ? '#000' : '#fff',
              border: 'none',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            title={isScreenShareActive ? "Stop Sharing Screen" : "Share Screen"}
          >
            <MonitorUp size={20} />
          </button>

          {/* Webcam Button */}
          <button
            onClick={isWebcamActive ? stopStream : handleMeetStartWebcam}
            style={{
              background: isWebcamActive ? 'var(--accent-active)' : 'rgba(255,255,255,0.06)',
              color: isWebcamActive ? '#000' : '#fff',
              border: 'none',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            title={isWebcamActive ? "Stop Camera" : "Turn On Camera"}
          >
            <Video size={20} />
          </button>

          {/* Mic Button */}
          <button
            onClick={() => setMicState(!micState)}
            style={{
              background: micState ? 'rgba(0, 217, 126, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: micState ? 'var(--accent-active)' : 'var(--accent-danger)',
              border: 'none',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            title={micState ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micState ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Exit / Close Overlay Button */}
          <button
            onClick={() => { stopStream(); setActiveOverlay(null); }}
            style={{
              background: 'var(--accent-danger)',
              color: '#fff',
              border: 'none',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            title="Exit Video Meeting"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Video Call Overlay — Full-screen camera + avatar overlay */}
      <div id="overlay-videocall" className={`full-page-overlay ${activeOverlay === 'videocall' ? 'active' : ''}`}>
        <div className="overlay-content" style={{ padding: '0', overflow: 'hidden', background: '#000', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Full-screen user camera */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
            {isWebcamActive && stream ? (
              <video
                ref={bindVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555', gap: '12px' }}>
                <VideoOff size={64} style={{ opacity: 0.3 }} />
                <div style={{ fontSize: '16px', fontWeight: 500 }}>Camera Off</div>
              </div>
            )}

            {/* Beatrice avatar portrait — small, top-right overlay */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                background: '#1a1a2e', position: 'relative'
              }}>
                <img
                  src="/beatrice.png"
                  alt="Beatrice"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px',
                justifyContent: 'center', fontSize: '10px', color: connected ? '#22c55e' : '#ef4444'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444' }}></span>
                Beatrice
              </div>
            </div>

            {/* User label — bottom-left */}
            <div style={{ position: 'absolute', bottom: '84px', left: '16px', zIndex: 10 }}>
              <div style={{
                background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '8px',
                fontSize: '11px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isWebcamActive ? '#22c55e' : '#ef4444' }}></span>
                You
              </div>
            </div>

            {/* Top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'center', padding: '12px' }}>
              <div style={{
                background: 'rgba(0,0,0,0.4)', padding: '4px 14px', borderRadius: '16px',
                fontSize: '12px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-anim 2s infinite' }}></span>
                Video Call
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div style={{
            height: '72px', background: 'rgba(0,0,0,0.85)', borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
            backdropFilter: 'blur(12px)', position: 'relative', zIndex: 10
          }}>
            <button
              onClick={isWebcamActive ? stopStream : startWebcam}
              style={{
                width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                background: isWebcamActive ? 'rgba(255,255,255,0.1)' : '#ef4444', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={isWebcamActive ? 'Turn off camera' : 'Turn on camera'}
            >
              {isWebcamActive ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button
              onClick={() => { setActiveOverlay(null); stopStream(); }}
              style={{
                width: '56px', height: '56px', borderRadius: '50%', border: 'none',
                background: '#ef4444', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(239,68,68,0.5)'
              }}
              title="End call"
            >
              <PhoneOff size={24} />
            </button>
            <button
              onClick={() => setMicState(!micState)}
              style={{
                width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                background: micState ? 'rgba(255,255,255,0.1)' : '#ef4444', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={micState ? 'Mute' : 'Unmute'}
            >
              {micState ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tools Overlay */}
      <div id="overlay-tools" className={`full-page-overlay ${activeOverlay === 'tools' ? 'active' : ''}`}>
        <div className="overlay-header">
          <div className="overlay-title">Integrations</div>
          <button className="close-overlay-btn" onClick={() => setActiveOverlay(null)}><X size={20} /></button>
        </div>
        <div className="overlay-content" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            {tools.map(tool => {
              const Icon = ToolIcons[tool.name] || Terminal;
              return (
                <div key={tool.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(203,251,69,0.1)', borderRadius: '8px', color: 'var(--accent-active)' }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '15px', marginBottom: '4px' }}>{tool.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.4' }}>{tool.description || 'No description available.'}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <label className="switch">
                      <input type="checkbox" checked={tool.isEnabled} onChange={() => useTools.getState().toggleTool(tool.name)} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auth Screen */}
      <div id="auth-screen" className={`full-page-overlay ${isAuthOpen ? 'active' : ''}`}>
        <div className="auth-glow"></div>
        <div className="auth-card" id="auth-card-inner">
          <div className="auth-logo-box" style={{ background: 'transparent' }}>
            <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon Logo" style={{ width: '60px', height: '60px' }} />
          </div>

          <h2>{isSignupMode ? 'Register' : 'Login'}</h2>
          <p className="subtitle">{isSignupMode ? 'Create your new account' : 'Welcome back to Eburon'}</p>

          <form className="auth-form" onSubmit={handleEmailAuth}>
            {authError && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{authError}</div>}
            {isSignupMode && (
              <>
                <div className="auth-input-wrapper">
                  <User className="auth-icon-left" size={20} />
                  <input type="text" placeholder="Full name" value={name || ''} onChange={e => setName(e.target.value)} />
                </div>
                <div className="auth-input-wrapper">
                  <select
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-color)',
                      padding: '12px',
                      outline: 'none',
                      appearance: 'auto',
                      paddingLeft: '32px'
                    }}
                    onChange={(e) => setLanguage(e.target.value)}
                    value={language || ''}
                  >
                    <option value="" disabled>Select Native Language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang} style={{ background: '#111', color: '#fff' }}>{lang}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className="auth-input-wrapper">
              <Mail className="auth-icon-left" size={20} />
              <input type="email" placeholder="Email" required value={email || ''} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="auth-input-wrapper">
              <Lock className="auth-icon-left" size={20} />
              <input type="password" placeholder="Password" required value={password || ''} onChange={e => setPassword(e.target.value)} />
            </div>
            {isSignupMode && (
              <div className="auth-input-wrapper">
                <Lock className="auth-icon-left" size={20} />
                <input type="password" placeholder="Confirm password" />
              </div>
            )}
            <button type="submit" className="auth-submit-btn">{isSignupMode ? 'Sign up' : 'Sign in'}</button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="btn-google" onClick={handleGoogleLogin}>
            <div className="g-icon-circle">G</div>
            Continue with Google
          </button>

          <div className="permissions-note">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, color: '#aaa' }}><ShieldCheck size={18} style={{ color: 'var(--accent-active)' }} /> Authorization & Capabilities</span>
            <ul style={{ margin: 0, paddingLeft: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Google Workspace:</strong> Access to Gmail, Drive, Calendar, Contacts, and Tasks.</li>
              <li><strong>Live Web Search:</strong> Real-time Google Search access.</li>
              <li><strong>Function Tools:</strong> Automation capabilities across your synced apps.</li>
            </ul>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <input type="checkbox" id="consent" checked={hasConsented} onChange={(e) => setHasConsented(e.target.checked)} style={{ marginTop: '4px', cursor: 'pointer' }} />
              <label htmlFor="consent" style={{ color: '#fff', cursor: 'pointer', fontSize: '13px', lineHeight: '1.4' }}>I explicitly grant permission to allow Eburon to access the Google Workspace APIs listed above, perform web searches, and utilize function tools on my behalf.</label>
            </div>
          </div>

          <div className="auth-toggle">
            {isSignupMode ? 'Back to ' : 'Don\'t have an account? '}
            <span onClick={() => setIsSignupMode(!isSignupMode)}>
              {isSignupMode ? 'Sign in' : 'Sign up'}
            </span>
          </div>

        </div>
      </div>

      {/* Memory Confirmation Modal */}
      {pendingMemory && (
        <div className="confirm-modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="confirm-modal" style={{
            backgroundColor: 'var(--bg-card)',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Save to Memory?</h3>
              <button onClick={() => setPendingMemory(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Beatrice wants to store a new memory of this insight:</p>
              <div className="memory-preview-box" style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '24px',
                fontStyle: 'italic',
                borderLeft: '4px solid var(--accent-active)',
                color: '#fff',
                position: 'relative'
              }}>
                <Quote style={{ position: 'absolute', right: '12px', top: '12px', opacity: 0.1 }} size={24} />
                "{pendingMemory.content}"
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'block', color: 'var(--text-muted)' }}>Classify this Memory</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['personal', 'work', 'project'].map(cat => (
                    <button
                      key={cat}
                      className={`cat-btn ${newMemoryType === cat ? 'active' : ''}`}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: `1px solid ${newMemoryType === cat ? 'var(--accent-active)' : 'var(--border-color)'}`,
                        background: newMemoryType === cat ? 'rgba(203,251,69,0.1)' : 'transparent',
                        color: newMemoryType === cat ? 'var(--accent-active)' : 'var(--text-muted)',
                        fontSize: '12px',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setNewMemoryType(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                  onClick={() => setPendingMemory(null)}
                >Discard</button>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: 'var(--accent-active)', color: 'var(--bg-main)', fontWeight: 600 }}
                  onClick={() => {
                    handleConfirmPendingMemory(newMemoryType);
                  }}
                >Save Memory</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Confirmation Modal */}
      {pendingChat && (
        <div className="confirm-modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="confirm-modal" style={{
            backgroundColor: 'var(--bg-card)',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Send Chat Message?</h3>
              <button onClick={() => setPendingChat(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Eburon wants to send this message to space <strong>{pendingChat.spaceName}</strong>:</p>
              <div className="memory-preview-box" style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '24px',
                fontStyle: 'italic',
                borderLeft: '4px solid #4285F4',
                color: '#fff',
                position: 'relative'
              }}>
                <Quote style={{ position: 'absolute', right: '12px', top: '12px', opacity: 0.1 }} size={24} />
                "{pendingChat.message}"
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                  onClick={async () => {
                    const { id } = pendingChat;
                    setPendingChat(null);
                    client.sendToolResponse({
                      functionResponses: [{
                        id,
                        response: { error: "User cancelled sending the message." }
                      }]
                    });
                  }}
                >Cancel</button>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: '#4285F4', color: '#fff', fontWeight: 600 }}
                  onClick={async () => {
                    const { spaceName, message, id } = pendingChat;
                    setPendingChat(null);
                    const token = useAuth.getState().googleAccessToken;
                    if (!token) {
                      client.sendToolResponse({
                        functionResponses: [{ id, response: { error: "Token missing. User needs to re-authenticate." } }]
                      });
                      return;
                    }
                    try {
                      const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ text: message })
                      });
                      const data = await res.json();
                      client.sendToolResponse({
                        functionResponses: [{ id, response: data }]
                      });
                    } catch (err: any) {
                      client.sendToolResponse({
                        functionResponses: [{ id, response: { error: err.message } }]
                      });
                    }
                  }}
                >Send Message</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
