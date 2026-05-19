/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GenAILiveClient } from '../../lib/genai-live-client';
import { LiveConnectConfig, Modality, LiveServerToolCall } from '@google/genai';
import { AudioStreamer } from '../../lib/audio-streamer';
import { audioContext } from '../../lib/utils';
import VolMeterWorket from '../../lib/worklets/vol-meter';
import { useLogStore, useSettings, useAuth } from '@/lib/state';
import { auth } from '@/lib/firebase';
import * as api from '@/lib/api-client';

export type UseLiveApiResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;

  connect: () => Promise<void>;
  disconnect: () => void;
  connected: boolean;

  volume: number;
  gracefulInterrupt: () => Promise<void>;
};

export function useLiveApi({
  apiKey,
}: {
  apiKey: string;
}): UseLiveApiResults {
  const { model } = useSettings();
  const client = useMemo(() => new GenAILiveClient(apiKey, model), [apiKey, model]);

  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [volume, setVolume] = useState(0);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConnectConfig>({});

  useEffect(() => {
    let isCancelled = false;
    if (!audioStreamerRef.current) {
      audioContext({ id: 'audio-out', sampleRate: 16000 }).then((audioCtx: AudioContext) => {
        if (isCancelled) return;
        if (audioStreamerRef.current) return;
        audioStreamerRef.current = new AudioStreamer(audioCtx, 0.15);
        audioStreamerRef.current
          .addWorklet<any>('vumeter-out', VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            // Successfully added worklet
          })
          .catch(err => {
            console.error('Error adding worklet:', err);
          });
      });
    }
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setConnected(true);
    };

    const onClose = () => {
      setConnected(false);
    };

    const stopAudioStreamer = () => {
      if (audioStreamerRef.current) {
        setTimeout(() => {
          audioStreamerRef.current?.stop();
        }, 150);
      }
    };

    const onAudio = (data: ArrayBuffer) => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.addPCM16(new Uint8Array(data));
      }
    };

    const callAuthenticatedBackendTool = async (name: string, args: any) => {
      const user = auth.currentUser;
      if (!user) {
        return { ok: false, error: 'Not authenticated. Please sign in before running backend tools.' };
      }
      const token = await user.getIdToken();
      const res = await fetch('/api/local-tools/run', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, args: args || {} }),
      });
      const data = await res.json().catch(() => ({ ok: false, error: 'Invalid backend response.' }));
      if (!res.ok) return { ok: false, status: res.status, ...data };
      return data;
    };

    const runAppsScriptAction = async (args: any) => {
      const user = auth.currentUser;
      if (!user) {
        return { ok: false, error: 'Not authenticated. Please sign in before running Apps Script tools.' };
      }
      const token = await user.getIdToken();
      const res = await fetch('/api/tools/apps-script/run', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: args?.action, payload: args?.payload || {} }),
      });
      const data = await res.json().catch(() => ({ ok: false, error: 'Invalid Apps Script response.' }));
      if (!res.ok) return { ok: false, status: res.status, ...data };
      return data;
    };

    const localBackendTools = new Set([
      'create_markdown_document',
      'create_html_document',
      'create_project_brief',
      'create_checklist',
      'save_note',
      'read_note',
      'list_notes',
      'create_json_file',
      'validate_json',
      'create_env_template',
      'create_readme',
      'create_chart_spec',
      'extract_tasks',
      'create_video_storyboard',
      'create_video_script_document',
      'create_deployment_video_plan',
      'register_google_video_asset',
      'register_google_site_asset',
      'create_site_content_plan',
      'create_deployment_portal_copy',
      'create_restaurant_demo_site_copy',
    ]);

    const whatsAppToolRoutes: Record<string, { method: string; path: (args: any) => string }> = {
      send_whatsapp_message: { method: 'POST', path: () => '/api/whatsapp/send/message' },
      send_whatsapp_image: { method: 'POST', path: () => '/api/whatsapp/send/image' },
      send_whatsapp_file: { method: 'POST', path: () => '/api/whatsapp/send/file' },
      send_whatsapp_video: { method: 'POST', path: () => '/api/whatsapp/send/video' },
      send_whatsapp_sticker: { method: 'POST', path: () => '/api/whatsapp/send/sticker' },
      send_whatsapp_contact: { method: 'POST', path: () => '/api/whatsapp/send/contact' },
      send_whatsapp_location: { method: 'POST', path: () => '/api/whatsapp/send/location' },
      send_whatsapp_audio: { method: 'POST', path: () => '/api/whatsapp/send/audio' },
      send_whatsapp_poll: { method: 'POST', path: () => '/api/whatsapp/send/poll' },
      send_whatsapp_presence: { method: 'POST', path: () => '/api/whatsapp/send/presence' },
      send_whatsapp_chat_presence: { method: 'POST', path: () => '/api/whatsapp/send/chat-presence' },
      send_whatsapp_link: { method: 'POST', path: () => '/api/whatsapp/send/link' },
      whatsapp_delete_message: { method: 'POST', path: (a) => `/api/whatsapp/message/${a.message_id}/delete` },
      whatsapp_revoke_message: { method: 'POST', path: (a) => `/api/whatsapp/message/${a.message_id}/revoke` },
      whatsapp_react_message: { method: 'POST', path: (a) => `/api/whatsapp/message/${a.message_id}/react` },
      whatsapp_update_message: { method: 'POST', path: (a) => `/api/whatsapp/message/${a.message_id}/update` },
      whatsapp_mark_read: { method: 'POST', path: (a) => `/api/whatsapp/message/${a.message_id}/read` },
      whatsapp_star_message: { method: 'POST', path: (a) => `/api/whatsapp/message/${a.message_id}/star` },
      whatsapp_unstar_message: { method: 'POST', path: (a) => `/api/whatsapp/message/${a.message_id}/unstar` },
      whatsapp_list_chats: { method: 'GET', path: () => '/api/whatsapp/chats' },
      whatsapp_get_chat_messages: { method: 'GET', path: (a) => `/api/whatsapp/chat/${a.chat_jid}/messages` },
      whatsapp_pin_chat: { method: 'POST', path: (a) => `/api/whatsapp/chat/${a.chat_jid}/pin` },
      whatsapp_archive_chat: { method: 'POST', path: (a) => `/api/whatsapp/chat/${a.chat_jid}/archive` },
      whatsapp_set_disappearing: { method: 'POST', path: (a) => `/api/whatsapp/chat/${a.chat_jid}/disappearing` },
      whatsapp_list_groups: { method: 'GET', path: () => '/api/whatsapp/groups' },
      whatsapp_create_group: { method: 'POST', path: () => '/api/whatsapp/group/create' },
      whatsapp_join_group: { method: 'POST', path: () => '/api/whatsapp/group/join' },
      whatsapp_group_info: { method: 'GET', path: (a) => `/api/whatsapp/group/info?group_id=${a.group_id}` },
      whatsapp_group_info_from_link: { method: 'GET', path: (a) => `/api/whatsapp/group/preview?link=${encodeURIComponent(a.link)}` },
      whatsapp_group_participants: { method: 'GET', path: (a) => `/api/whatsapp/group/participants?group_id=${a.group_id}` },
      whatsapp_add_participants: { method: 'POST', path: () => '/api/whatsapp/group/participants/add' },
      whatsapp_remove_participants: { method: 'POST', path: () => '/api/whatsapp/group/participants/remove' },
      whatsapp_promote_participants: { method: 'POST', path: () => '/api/whatsapp/group/participants/promote' },
      whatsapp_demote_participants: { method: 'POST', path: () => '/api/whatsapp/group/participants/demote' },
      whatsapp_set_group_photo: { method: 'POST', path: () => '/api/whatsapp/group/photo' },
      whatsapp_set_group_name: { method: 'POST', path: () => '/api/whatsapp/group/name' },
      whatsapp_set_group_locked: { method: 'POST', path: () => '/api/whatsapp/group/locked' },
      whatsapp_set_group_announce: { method: 'POST', path: () => '/api/whatsapp/group/announce' },
      whatsapp_set_group_topic: { method: 'POST', path: () => '/api/whatsapp/group/topic' },
      whatsapp_get_group_invite_link: { method: 'GET', path: (a) => `/api/whatsapp/group/invite-link?group_id=${a.group_id}` },
      whatsapp_leave_group: { method: 'POST', path: () => '/api/whatsapp/group/leave' },
      whatsapp_list_contacts: { method: 'GET', path: () => '/api/whatsapp/contacts' },
      whatsapp_get_user_info: { method: 'GET', path: (a) => `/api/whatsapp/user/info?phone=${a.phone}` },
      whatsapp_check_user: { method: 'GET', path: (a) => `/api/whatsapp/user/check?phone=${a.phone}` },
      whatsapp_get_avatar: { method: 'GET', path: (a) => `/api/whatsapp/user/avatar?phone=${a.phone}` },
      whatsapp_get_business_profile: { method: 'GET', path: (a) => `/api/whatsapp/user/business-profile?phone=${a.phone}` },
      whatsapp_get_my_privacy: { method: 'GET', path: () => '/api/whatsapp/user/privacy' },
      whatsapp_change_push_name: { method: 'POST', path: () => '/api/whatsapp/user/pushname' },
    };

    // Bind event listeners
    const onToolCall = async (toolCall: LiveServerToolCall) => {
      const functionResponses: any[] = [];

      for (const fc of toolCall.functionCalls) {
        // Log the function call trigger
        const triggerMessage = `Triggering function call: **${
          fc.name
        }**\n\`\`\`json\n${JSON.stringify(fc.args, null, 2)}\n\`\`\``;
        useLogStore.getState().addTurn({
          role: 'system',
          text: triggerMessage,
          isFinal: true,
        });

        let responsePayload: any = { result: 'ok' };
        
        if (fc.name === 'fetch_google_api') {
           const { url, method, body } = fc.args as any;
           const token = useAuth.getState().googleAccessToken;
           if (!token) {
               responsePayload = { error: 'No Google access token found, please authenticate with Google (Sign in option).' };
           } else if (!url) {
               responsePayload = { error: 'Missing full URL for Google API.' };
           } else {
               try {
                   const headers: any = { Authorization: `Bearer ${token}` };
                   let fetchBody = undefined;
                   if (body) {
                       headers['Content-Type'] = 'application/json';
                       fetchBody = typeof body === 'string' ? body : JSON.stringify(body);
                   }

                   const res = await fetch(url, {
                       method: method || 'GET',
                       headers,
                       body: fetchBody
                   });

                   let dataText = '';
                   try { dataText = await res.text(); } catch (e) {}

                   let json = null;
                   if (dataText) {
                       try { json = JSON.parse(dataText); } catch(e) {}
                   }
                   
                   if (!res.ok) {
                       responsePayload = { 
                           error: `HTTP Error ${res.status}: ${res.statusText}`, 
                           status: res.status,
                           details: json || dataText || 'No error body returned.'
                       };
                   } else {
                       responsePayload = {
                           data: json || dataText
                       };
                       // If meaningful response, set in UI workspace
                       if (json && Object.keys(json).length > 0) {
                           const uiState = await import('../../lib/state');
                           uiState.useUI.getState().setActiveWorkspaceResult(json);
                       }
                   }
               } catch (e: any) {
                   responsePayload = { error: 'Request execution failed. Network might be down or API blocked.', message: e.message };
               }
           }
        }

        if (fc.name === 'save_memory') {
           const { memory, content, type } = fc.args as any;
           const memoryText = memory || content;
           const user = auth.currentUser;
           if (!user) {
               responsePayload = { error: 'No user authenticated. Cannot save memory.' };
           } else if (!memoryText) {
               responsePayload = { error: 'Missing memory content.' };
           } else {
               try {
                   await api.saveMemory(memoryText, type || 'personal');
                   responsePayload = { status: 'Memory saved successfully' };
               } catch (e: any) {
                   console.error("Error saving memory to Postgres:", e);
                   responsePayload = { error: 'Failed to save memory' };
               }
           }
        }

        if (fc.name === 'generate_artifact') {
           const { title, type, content, language } = fc.args as any;
           const isHtml = type === 'html' || language === 'html' || (typeof content === 'string' && (content.trim().startsWith('<!DOCTYPE html') || content.trim().startsWith('<html') || content.trim().startsWith('<!DOCTYPE HTML')));
           const artifactType = isHtml ? 'html' : (type || 'code');
           responsePayload = { status: 'Artifact generated successfully', title, type: artifactType };
           const uiState = await import('../../lib/state');
           uiState.useUI.getState().setWorkspaceGenerating(true);
           uiState.useUI.getState().setActiveWorkspaceResult(null);
           setTimeout(() => {
              uiState.useUI.getState().setActiveWorkspaceResult({
                 artifact: { title, type: artifactType, content, language }
              });
              uiState.useUI.getState().setWorkspaceGenerating(false);
           }, 800);
        }

        if (fc.name === 'create_calendar_event') {
          const { summary, location, startTime, endTime } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found, please authenticate.' };
          } else {
            try {
              const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  summary,
                  location,
                  start: { dateTime: startTime },
                  end: { dateTime: endTime }
                })
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'send_email') {
          const { recipient, subject, body } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found, please authenticate.' };
          } else {
            try {
              // Gmail API uses base64url encoded RFC822 messages
              const utf8Encoder = new TextEncoder();
              const email = [
                `To: ${recipient}`,
                `Subject: ${subject}`,
                '',
                body
              ].join('\r\n');
              const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
              
              const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
                method: 'POST',
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ raw: encodedEmail })
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'get_current_datetime') {
          responsePayload = {
            datetime: new Date().toISOString(),
             readable: new Date().toString()
          };
        }

        if (fc.name === 'calculate') {
          const { expression } = fc.args as any;
          try {
             // Safe eval using Function for basic math ONLY
             if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
                throw new Error("Expression contains unsupported characters.");
             }
             // eslint-disable-next-line
             const result = new Function(`return (${expression})`)();
             responsePayload = { result };
          } catch (e: any) {
             responsePayload = { error: e.message };
          }
        }

        if (fc.name === 'create_google_doc') {
          const { title } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch('https://docs.googleapis.com/v1/documents', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'create_google_sheet') {
          const { title } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ properties: { title } })
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'create_google_slide') {
          const { title } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch('https://slides.googleapis.com/v1/presentations', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'create_google_form') {
          const { title } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch('https://forms.googleapis.com/v1/forms', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ info: { title } })
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'search_gmail') {
          const { query, maxResults } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const qs = new URLSearchParams({ q: query || '', maxResults: String(maxResults || 10) });
              const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${qs}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'get_contacts') {
          const { maxResults } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=${maxResults || 10}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'create_task') {
          const { title, notes } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch('https://tasks.googleapis.com/v1/users/@me/lists/@default/tasks', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, notes })
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'schedule_meeting') {
          const { summary, startDateTime, endDateTime, location } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const body: any = {
                summary,
                start: { dateTime: startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
                end: { dateTime: endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
              };
              if (location) body.location = location;
              const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'save_knowledge_keep') {
          const { text } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch('https://keep.googleapis.com/v1/notes', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Knowledge', body: { text } })
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'set_reminder') {
          const { task, time } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const due = new Date(time).toISOString();
              const res = await fetch('https://tasks.googleapis.com/v1/users/@me/lists/@default/tasks', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: task, due })
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'list_google_chat_spaces') {
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch('https://chat.googleapis.com/v1/spaces', {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'send_google_chat_message') {
          const { spaceName, messageText } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: messageText })
              });
              responsePayload = await res.json();
            } catch (e: any) { responsePayload = { error: e.message }; }
          }
        }

        if (fc.name === 'display_map') {
          const { iframeSrc } = fc.args as any;
          const uiState = await import('../../lib/state');
          uiState.useUI.getState().setActiveWorkspaceResult({
            artifact: { title: 'Map', type: 'html', content: `<!DOCTYPE html><html><body style="margin:0;height:100vh"><iframe src="${iframeSrc || ''}" width="100%" height="100%" style="border:none"></iframe></body></html>` }
          });
          responsePayload = { status: 'Map displayed on screen.' };
        }

        if (fc.name === 'open_drive_picker') {
          const uiState = await import('../../lib/state');
          uiState.useUI.getState().setActiveWorkspaceResult({
            artifact: { title: 'Google Drive Picker', type: 'html', content: `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f5f5f5"><p>Open <strong><a href="https://drive.google.com" target="_blank" rel="noopener">Google Drive</a></strong> to select a file.</p></body></html>` }
          });
          responsePayload = { status: 'Drive picker opened on screen.' };
        }

        if (localBackendTools.has(fc.name)) {
          responsePayload = await callAuthenticatedBackendTool(fc.name, fc.args as any);
        }

        if (fc.name === 'run_google_workspace_action') {
          responsePayload = await runAppsScriptAction(fc.args as any);
        }

        if (fc.name === 'open_browser_url') {
          const { url } = fc.args as any;
          if (!url || !/^https?:\/\//.test(url)) {
            responsePayload = { ok: false, error: 'URL must start with http:// or https://.' };
          } else {
            window.open(url, '_blank', 'noopener,noreferrer');
            responsePayload = { ok: true, url };
          }
        }

        if (fc.name === 'execute_safe_command') {
          const { command } = fc.args as any;
          try {
             const token = useAuth.getState().googleAccessToken || 'debug-token';
             const res = await fetch(`/api/system_command?cmd=${encodeURIComponent(command)}`, {
                 headers: { Authorization: `Bearer ${token}` } // Wait, system command needs a backend API
             });
             responsePayload = await res.json();
          } catch (e: any) {
             responsePayload = { error: e.message };
          }
        }

        if (fc.name === 'search_drive_files') {
          const { q } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found, please authenticate.' };
          } else {
            try {
              const url = new URL('https://www.googleapis.com/drive/v3/files');
              if (q) url.searchParams.append('q', q);
              url.searchParams.append('pageSize', '10');
              url.searchParams.append('fields', 'files(id, name, mimeType, webViewLink)');
              const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'get_drive_file_content') {
          const { fileId } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found, please authenticate.' };
          } else {
            try {
              const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const fileInfo = await fileRes.json();
              if (fileInfo.mimeType === 'application/vnd.google-apps.document') {
                  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  responsePayload = { text: await res.text() };
              } else {
                  responsePayload = { 
                      error: 'Can only extract text from Google Docs right now. Provided file is ' + fileInfo.mimeType,
                      info: fileInfo
                  };
              }
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'list_gmail_messages') {
          const { q } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found, please authenticate.' };
          } else {
            try {
              const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
              if (q) url.searchParams.append('q', q);
              const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'get_gmail_message') {
          const { id } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found, please authenticate.' };
          } else {
            try {
              const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'list_calendar_events') {
          const { timeMin, timeMax } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found, please authenticate.' };
          } else {
            try {
              const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
              if (timeMin) url.searchParams.append('timeMin', timeMin);
              if (timeMax) url.searchParams.append('timeMax', timeMax);
              const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'search_contacts') {
          const { query } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found, please authenticate.' };
          } else {
            try {
              const url = new URL('https://people.googleapis.com/v1/people/me/connections');
              url.searchParams.append('personFields', 'names,emailAddresses');
              const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
              });
              const data = await res.json();
              if (query) {
                  // Simple client-side filtering
                  data.connections = data.connections?.filter((c: any) => 
                      c.names?.some((n: any) => n.displayName.toLowerCase().includes(query.toLowerCase()))
                  );
              }
              responsePayload = data;
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'get_current_date') {
          responsePayload = { date: new Date().toISOString() };
        }

        if (fc.name === 'get_user_location') {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            responsePayload = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
          } catch (e: any) {
            responsePayload = { error: e.message || 'Geolocation failed' };
          }
        }

        if (fc.name === 'search_places') {
          const { query, location } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          // Places API usually uses API Key, but we can try to use the token if proxied or use the fetch tool
          // Actually, for consistency, we'll try to fetch it.
          try {
            // Using the Places API (New)
            const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
              },
              body: JSON.stringify({
                textQuery: query,
                locationBias: location ? {
                  circle: {
                    center: {
                      latitude: parseFloat(location.split(',')[0]),
                      longitude: parseFloat(location.split(',')[1])
                    },
                    radius: 5000.0
                  }
                } : undefined
              })
            });
            responsePayload = await res.json();
          } catch (e: any) {
            responsePayload = { error: e.message };
          }
        }

        if (fc.name === 'list_contacts') {
          const { pageSize } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const url = new URL('https://people.googleapis.com/v1/people/me/connections');
              url.searchParams.append('personFields', 'names,emailAddresses,phoneNumbers');
              url.searchParams.append('pageSize', (pageSize || 10).toString());
              const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (whatsAppToolRoutes[fc.name]) {
          try {
            const user = auth.currentUser;
            if (!user) {
              responsePayload = { error: 'Not authenticated.' };
            } else {
              const token = await user.getIdToken();
              const route = whatsAppToolRoutes[fc.name];
              const url = route.path(fc.args as any);
              const method = route.method;
              const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: method !== 'GET' ? JSON.stringify(fc.args) : undefined,
              });
              responsePayload = await res.json();
            }
          } catch (e: any) {
            responsePayload = { error: e.message };
          }
        }

        if (fc.name === 'generate_blog') {
          try {
            const { title, excerpt, content, tags, imageQuery } = fc.args as any;
            const { saveBlogPost } = await import('../../lib/blog-firebase');
            let imageResult = { url: '', alt: '', source: '', photographer: '', license: '', status: 'pending' as const };
            if (imageQuery) {
              try {
                const imgResp = await fetch('/api/blog/image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ query: imageQuery }),
                });
                if (imgResp.ok) {
                  const imgData = await imgResp.json();
                  if (imgData.url) {
                    imageResult = { ...imgData, status: 'attached' as const };
                  }
                }
              } catch {}
            }
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const blogId = await saveBlogPost({
              title,
              excerpt,
              content,
              author: 'Beatrice',
              source: 'Eburon AI',
              status: 'draft',
              image: imageResult,
              seo: {
                metaTitle: `${title} | Eburon AI Blog`,
                metaDescription: excerpt,
                slug,
                tags: tags || [],
                focusKeyword: 'Eburon AI',
                secondaryKeywords: [
                  'Beatrice AI assistant',
                  'voice-first AI',
                  'Eburon Agent',
                  'Eburon Hub',
                  'digital execution',
                  'AI office aide'
                ],
              },
            });
            responsePayload = { status: 'Blog draft saved to Firebase', blogId, slug };
          } catch (e: any) {
            responsePayload = { error: e.message };
          }
        }

        if (fc.name === 'read_email') {
          const { id } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found, please authenticate.' };
          } else {
            try {
              const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'read_google_sheet') {
          const { spreadsheetId, range } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'update_google_sheet') {
          const { spreadsheetId, range, values } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ range, majorDimension: 'ROWS', values })
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'read_google_doc') {
          const { documentId } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'update_google_doc') {
          const { documentId, text, index } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  requests: [
                    {
                      insertText: {
                        text,
                        location: { index: index || 1 }
                      }
                    }
                  ]
                })
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'read_google_slide') {
          const { presentationId } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'update_google_slide') {
          const { presentationId } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  requests: [
                    {
                      createSlide: {}
                    }
                  ]
                })
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'read_google_form') {
          const { formId } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'update_google_form') {
          const { formId, title } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  requests: [
                    {
                      createItem: {
                        item: {
                          title
                        },
                        location: { index: 0 }
                      }
                    }
                  ]
                })
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'list_keep_notes') {
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch('https://keep.googleapis.com/v1/notes', {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message, info: 'Keep notes listing is simulated or requires service endpoints.' };
            }
          }
        }

        if (fc.name === 'update_keep_note') {
          const { noteId, text } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://keep.googleapis.com/v1/notes/${noteId}`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ body: { text } })
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'list_tasks') {
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch('https://tasks.googleapis.com/v1/users/@me/lists/@default/tasks', {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'update_task') {
          const { taskId, status } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://tasks.googleapis.com/v1/users/@me/lists/@default/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'list_meetings') {
          const { maxResults } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${maxResults || 10}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'update_meeting') {
          const { eventId, summary } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ summary })
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'create_contact') {
          const { givenName, familyName, email } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  names: [{ givenName, familyName }],
                  emailAddresses: email ? [{ value: email }] : undefined
                })
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        if (fc.name === 'list_google_chat_messages') {
          const { spaceName } = fc.args as any;
          const token = useAuth.getState().googleAccessToken;
          if (!token) {
            responsePayload = { error: 'No Google access token found.' };
          } else {
            try {
              const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              responsePayload = await res.json();
            } catch (e: any) {
              responsePayload = { error: e.message };
            }
          }
        }

        // Prepare the response
        functionResponses.push({
          id: fc.id,
          name: fc.name,
          response: responsePayload,
        });
      }

      // Log the function call response
      if (functionResponses.length > 0) {
        const responseMessage = `Function call response:\n\`\`\`json\n${JSON.stringify(
          functionResponses,
          null,
          2,
        )}\n\`\`\``;
        useLogStore.getState().addTurn({
          role: 'system',
          text: responseMessage,
          isFinal: true,
        });
      }

      client.sendToolResponse({ functionResponses: functionResponses });
    };

    client.on('open', onOpen);
    client.on('close', onClose);
    client.on('interrupted', stopAudioStreamer);
    client.on('audio', onAudio);
    client.on('toolcall', onToolCall);

    return () => {
      // Clean up event listeners
      client.off('open', onOpen);
      client.off('close', onClose);
      client.off('interrupted', stopAudioStreamer);
      client.off('audio', onAudio);
      client.off('toolcall', onToolCall);
    };
  }, [client]);

  const connect = useCallback(async () => {
    if (!config) {
      throw new Error('config has not been set');
    }
    client.disconnect();
    await client.connect(config);
  }, [client, config]);

  const disconnect = useCallback(async () => {
    client.disconnect();
    setConnected(false);
  }, [setConnected, client]);

  const gracefulInterrupt = useCallback(async () => {
    if (audioStreamerRef.current) {
      const ctx = audioStreamerRef.current.context;
      audioStreamerRef.current.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      await new Promise(r => setTimeout(r, 450));
      audioStreamerRef.current?.stop();
    }
  }, []);

  return {
    client,
    config,
    setConfig,
    connect,
    connected,
    disconnect,
    volume,
    gracefulInterrupt,
  };
}