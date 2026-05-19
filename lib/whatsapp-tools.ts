/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionResponseScheduling } from '@google/genai';
import { FunctionCall } from './state';

export const whatsappTools: FunctionCall[] = [
  {
    name: "send_whatsapp_message",
    description: "Sends a WhatsApp text message.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number to send to, including country code (e.g., 5511999999999)." },
        message: { type: "STRING", description: "The text message content to send." },
      },
      required: ["phone", "message"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_image",
    description: "Sends a WhatsApp image message from base64 encoded image data.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number to send to, including country code." },
        image: { type: "STRING", description: "Base64 encoded image data." },
        caption: { type: "STRING", description: "Optional caption for the image." },
      },
      required: ["phone", "image"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_file",
    description: "Sends a WhatsApp file from base64 encoded data.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number to send to, including country code." },
        file: { type: "STRING", description: "Base64 encoded file data." },
        filename: { type: "STRING", description: "Optional filename for the file." },
      },
      required: ["phone", "file"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_video",
    description: "Sends a WhatsApp video message from base64 encoded video data.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number to send to, including country code." },
        video: { type: "STRING", description: "Base64 encoded video data." },
        caption: { type: "STRING", description: "Optional caption for the video." },
      },
      required: ["phone", "video"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_sticker",
    description: "Sends a WhatsApp sticker from base64 encoded image data.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number to send to, including country code." },
        sticker: { type: "STRING", description: "Base64 encoded image data for the sticker." },
      },
      required: ["phone", "sticker"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_contact",
    description: "Sends a WhatsApp contact message.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number to send to, including country code." },
        contact_name: { type: "STRING", description: "The name of the contact to share." },
        contact_phone: { type: "STRING", description: "The phone number of the contact to share." },
      },
      required: ["phone", "contact_name", "contact_phone"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_location",
    description: "Sends a WhatsApp location message.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number to send to, including country code." },
        latitude: { type: "NUMBER", description: "The latitude coordinate." },
        longitude: { type: "NUMBER", description: "The longitude coordinate." },
        title: { type: "STRING", description: "Optional title for the location." },
      },
      required: ["phone", "latitude", "longitude"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_audio",
    description: "Sends a WhatsApp audio message from base64 encoded audio data.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number to send to, including country code." },
        audio: { type: "STRING", description: "Base64 encoded audio data." },
      },
      required: ["phone", "audio"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_poll",
    description: "Sends a WhatsApp poll message.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number to send to, including country code." },
        question: { type: "STRING", description: "The poll question to ask." },
        options: { type: "ARRAY", items: { type: "STRING" }, description: "The poll answer options." },
      },
      required: ["phone", "question", "options"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_presence",
    description: "Sets the WhatsApp online presence status.",
    parameters: {
      type: "OBJECT",
      properties: {
        type: { type: "STRING", enum: ["available", "unavailable"], description: "The presence status to set." },
      },
      required: ["type"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_chat_presence",
    description: "Sends a typing indicator to a specific WhatsApp chat.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number of the chat to send the typing indicator to." },
        type: { type: "STRING", enum: ["composing", "paused"], description: "The typing indicator type." },
      },
      required: ["phone", "type"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "send_whatsapp_link",
    description: "Sends a WhatsApp message with a URL and link preview.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number to send to, including country code." },
        url: { type: "STRING", description: "The URL to send with preview." },
        caption: { type: "STRING", description: "Optional caption for the link." },
      },
      required: ["phone", "url"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_delete_message",
    description: "Deletes a WhatsApp message you sent (removes from your view only).",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number with @s.whatsapp.net suffix." },
        message_id: { type: "STRING", description: "The ID of the message to delete." },
      },
      required: ["phone", "message_id"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_revoke_message",
    description: "Revokes (unsends) a WhatsApp message for everyone in the chat.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number of the chat containing the message." },
        message_id: { type: "STRING", description: "The ID of the message to revoke." },
      },
      required: ["phone", "message_id"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_react_message",
    description: "Reacts to a WhatsApp message with an emoji.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number of the chat containing the message." },
        message_id: { type: "STRING", description: "The ID of the message to react to." },
        emoji: { type: "STRING", description: "The emoji to react with." },
      },
      required: ["phone", "message_id", "emoji"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_update_message",
    description: "Edits a previously sent WhatsApp message.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number of the chat containing the message." },
        message_id: { type: "STRING", description: "The ID of the message to edit." },
        new_message: { type: "STRING", description: "The new message text to replace the original." },
      },
      required: ["phone", "message_id", "new_message"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_mark_read",
    description: "Marks a WhatsApp message as read.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number of the chat containing the message." },
        message_id: { type: "STRING", description: "The ID of the message to mark as read." },
      },
      required: ["phone", "message_id"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_star_message",
    description: "Stars (bookmarks) a WhatsApp message.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number of the chat containing the message." },
        message_id: { type: "STRING", description: "The ID of the message to star." },
      },
      required: ["phone", "message_id"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_unstar_message",
    description: "Unstars (removes bookmark from) a WhatsApp message.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number of the chat containing the message." },
        message_id: { type: "STRING", description: "The ID of the message to unstar." },
      },
      required: ["phone", "message_id"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_list_chats",
    description: "Gets the list of WhatsApp chats.",
    parameters: {
      type: "OBJECT",
      properties: {
        limit: { type: "INTEGER", description: "Optional maximum number of chats to return." },
        search: { type: "STRING", description: "Optional search query to filter chats." },
      },
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_get_chat_messages",
    description: "Gets messages from a specific WhatsApp chat.",
    parameters: {
      type: "OBJECT",
      properties: {
        chat_jid: { type: "STRING", description: "The JID of the chat to retrieve messages from." },
        limit: { type: "INTEGER", description: "Optional maximum number of messages to return." },
        search: { type: "STRING", description: "Optional search query to filter messages." },
      },
      required: ["chat_jid"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_pin_chat",
    description: "Pins or unpins a WhatsApp chat.",
    parameters: {
      type: "OBJECT",
      properties: {
        chat_jid: { type: "STRING", description: "The JID of the chat to pin or unpin." },
        pinned: { type: "BOOLEAN", description: "True to pin the chat, false to unpin." },
      },
      required: ["chat_jid", "pinned"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_archive_chat",
    description: "Archives or unarchives a WhatsApp chat.",
    parameters: {
      type: "OBJECT",
      properties: {
        chat_jid: { type: "STRING", description: "The JID of the chat to archive or unarchive." },
        archived: { type: "BOOLEAN", description: "True to archive the chat, false to unarchive." },
      },
      required: ["chat_jid", "archived"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_set_disappearing",
    description: "Sets the disappearing messages timer for a WhatsApp chat.",
    parameters: {
      type: "OBJECT",
      properties: {
        chat_jid: { type: "STRING", description: "The JID of the chat to configure." },
        timer_seconds: { type: "INTEGER", enum: [0, 86400, 604800, 7776000], description: "Disappearing messages timer in seconds. 0 = off, 86400 = 24h, 604800 = 7d, 7776000 = 90d." },
      },
      required: ["chat_jid", "timer_seconds"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_list_groups",
    description: "Lists all WhatsApp groups.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_create_group",
    description: "Creates a new WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "The title of the group." },
        participants: { type: "ARRAY", items: { type: "STRING" }, description: "Phone numbers of participants to add." },
      },
      required: ["title", "participants"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_join_group",
    description: "Joins a WhatsApp group using an invite link.",
    parameters: {
      type: "OBJECT",
      properties: {
        link: { type: "STRING", description: "The group invite link." },
      },
      required: ["link"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_group_info",
    description: "Gets information about a WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
      },
      required: ["group_id"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_group_info_from_link",
    description: "Previews a WhatsApp group from an invite link without joining.",
    parameters: {
      type: "OBJECT",
      properties: {
        link: { type: "STRING", description: "The group invite link." },
      },
      required: ["link"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_group_participants",
    description: "Gets the list of participants in a WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
      },
      required: ["group_id"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_add_participants",
    description: "Adds participants to a WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
        participants: { type: "ARRAY", items: { type: "STRING" }, description: "Phone numbers of participants to add." },
      },
      required: ["group_id", "participants"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_remove_participants",
    description: "Removes participants from a WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
        participants: { type: "ARRAY", items: { type: "STRING" }, description: "Phone numbers of participants to remove." },
      },
      required: ["group_id", "participants"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_promote_participants",
    description: "Promotes participants to admin in a WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
        participants: { type: "ARRAY", items: { type: "STRING" }, description: "Phone numbers of participants to promote to admin." },
      },
      required: ["group_id", "participants"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_demote_participants",
    description: "Demotes participants from admin in a WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
        participants: { type: "ARRAY", items: { type: "STRING" }, description: "Phone numbers of participants to demote from admin." },
      },
      required: ["group_id", "participants"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_set_group_photo",
    description: "Sets the photo for a WhatsApp group from base64 encoded image data.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
        photo: { type: "STRING", description: "Base64 encoded image data for the group photo." },
      },
      required: ["group_id", "photo"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_set_group_name",
    description: "Changes the name of a WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
        name: { type: "STRING", description: "The new name for the group." },
      },
      required: ["group_id", "name"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_set_group_locked",
    description: "Locks or unlocks a WhatsApp group (only admins can edit group settings when locked).",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
        locked: { type: "BOOLEAN", description: "True to lock the group, false to unlock." },
      },
      required: ["group_id", "locked"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_set_group_announce",
    description: "Sets announce mode for a WhatsApp group (only admins can send messages when announce is on).",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
        announce: { type: "BOOLEAN", description: "True to enable announce mode (admin only), false to disable." },
      },
      required: ["group_id", "announce"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_set_group_topic",
    description: "Sets the description (topic) for a WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
        topic: { type: "STRING", description: "The description text to set for the group." },
      },
      required: ["group_id", "topic"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_get_group_invite_link",
    description: "Gets the invite link for a WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group." },
      },
      required: ["group_id"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_leave_group",
    description: "Leaves a WhatsApp group.",
    parameters: {
      type: "OBJECT",
      properties: {
        group_id: { type: "STRING", description: "The ID of the group to leave." },
      },
      required: ["group_id"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_list_contacts",
    description: "Gets all WhatsApp contacts.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_get_user_info",
    description: "Gets WhatsApp user info by phone number.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number including country code." },
      },
      required: ["phone"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_check_user",
    description: "Checks if a phone number is registered on WhatsApp.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number including country code to check." },
      },
      required: ["phone"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_get_avatar",
    description: "Gets the avatar/profile picture of a WhatsApp user.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number including country code." },
      },
      required: ["phone"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_get_business_profile",
    description: "Gets the WhatsApp Business profile for a phone number.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "The phone number including country code." },
      },
      required: ["phone"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_get_my_privacy",
    description: "Gets the current WhatsApp privacy settings.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: "whatsapp_change_push_name",
    description: "Changes the WhatsApp display name (push name).",
    parameters: {
      type: "OBJECT",
      properties: {
        push_name: { type: "STRING", description: "The new display name to set." },
      },
      required: ["push_name"]
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];
