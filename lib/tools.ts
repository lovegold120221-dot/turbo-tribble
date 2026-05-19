/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionResponseScheduling } from '@google/genai';
import { FunctionCall } from './state';
import { whatsappTools } from './whatsapp-tools';

export const AVAILABLE_TOOLS: FunctionCall[] = [
  {
    name: "register_google_site_asset",
    description: "Registers a Google Site as a known Beatrice project asset.",
    parameters: {
      type: "OBJECT",
      properties: {
        file_id: { type: "STRING" },
        title: { type: "STRING" },
        url: { type: "STRING" },
        purpose: { type: "STRING" },
        project: { type: "STRING" },
        tags: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      },
      required: ["file_id", "title", "url", "purpose"]
    },
    isEnabled: true
  },
  {
    name: "create_site_content_plan",
    description: "Creates a page-by-page content plan for a Google Site.",
    parameters: {
      type: "OBJECT",
      properties: {
        site_title: { type: "STRING" },
        site_purpose: { type: "STRING" },
        target_audience: { type: "STRING" },
        pages: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              page_title: { type: "STRING" },
              goal: { type: "STRING" },
              sections: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["page_title", "goal", "sections"]
          }
        }
      },
      required: ["site_title", "site_purpose", "pages"]
    },
    isEnabled: true
  },
  {
    name: "create_deployment_portal_copy",
    description: "Creates copy/content for a Beatrice or Eburon deployment portal page.",
    parameters: {
      type: "OBJECT",
      properties: {
        app_name: { type: "STRING" },
        environment: {
          type: "STRING",
          enum: ["local", "staging", "production"]
        },
        backend_url: { type: "STRING" },
        sections: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      },
      required: ["app_name", "environment"]
    },
    isEnabled: true
  },
  {
    name: "create_restaurant_demo_site_copy",
    description: "Creates website copy for a restaurant demo using Beatrice as a voice and WhatsApp assistant.",
    parameters: {
      type: "OBJECT",
      properties: {
        restaurant_name: { type: "STRING" },
        features: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        tone: {
          type: "STRING",
          enum: ["friendly", "premium", "casual", "modern", "local"]
        },
        call_to_action: { type: "STRING" }
      },
      required: ["restaurant_name", "features"]
    },
    isEnabled: true
  },
  {
    name: 'start_return',
    description: 'Starts the return process for an item, collecting necessary details from the user.',
    parameters: {
      type: 'OBJECT',
      properties: {
        orderId: {
          type: 'STRING',
          description: 'The ID of the order containing the item to be returned.',
        },
        itemName: {
          type: 'STRING',
          description: 'The name of the item the user wants to return.',
        },
        reason: {
          type: 'STRING',
          description: 'The reason the user is returning the item.',
        },
      },
      required: ['orderId', 'itemName', 'reason'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'get_order_status',
    description: 'Provides the current status of a user\'s order, searching by order ID or customer details.',
    parameters: {
      type: 'OBJECT',
      properties: {
        orderId: {
          type: 'STRING',
          description: 'The ID of the order to check. Ask for this first.',
        },
        customerName: {
          type: 'STRING',
          description: 'The name of the customer, if order ID is not available.',
        },
        customerEmail: {
          type: 'STRING',
          description: 'The email of the customer, if order ID is not available.',
        },
      },
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'speak_to_representative',
    description: 'Escalates the conversation to a human customer support representative.',
    parameters: {
      type: 'OBJECT',
      properties: {
        reason: {
          type: 'STRING',
          description: 'A brief summary of the user\'s issue for the representative.',
        },
      },
      required: ['reason'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'save_memory',
    description: 'Saves a specific piece of information or conversation topic into the user\'s long-term memory for future recall.',
    parameters: {
      type: 'OBJECT',
      properties: {
        content: {
          type: 'STRING',
          description: 'The specific fact, preference, or topic to remember.',
        },
        type: {
          type: 'STRING',
          description: 'The category of memory (e.g., personal, work, project).',
          enum: ['personal', 'work', 'project'],
        },
      },
      required: ['content', 'type'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'list_google_chat_spaces',
    description: 'Lists the Google Chat spaces the user is a member of. Returns space names and resource names.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
    isEnabled: true,
  },
  {
    name: 'send_google_chat_message',
    description: 'Sends a message to a specific Google Chat space. You must use list_google_chat_spaces to get the space resource name first.',
    parameters: {
      type: 'OBJECT',
      properties: {
        spaceName: {
          type: 'STRING',
          description: 'The resource name of the space (e.g., spaces/AAAAxxxxxxx).',
        },
        messageText: {
          type: 'STRING',
          description: 'The text message to send.',
        },
      },
      required: ['spaceName', 'messageText'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'save_knowledge_keep',
    description: 'Saves important AI corrections and user preferences to a Google Keep note as persistent knowledge.',
    parameters: {
      type: 'OBJECT',
      properties: {
        text: {
          type: 'STRING',
          description: 'The corrected knowledge or preference to save.',
        },
      },
      required: ['text'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'display_map',
    description: 'Displays a Google Map with the provided iframe source URL on the user\'s screen.',
    parameters: {
      type: 'OBJECT',
      properties: {
        iframeSrc: {
          type: 'STRING',
          description: 'The src URL to embed for the map iframe.',
        },
      },
      required: ['iframeSrc'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'create_google_doc',
    description: 'Creates a new Google Doc with the specified title.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'The title of the new document.' }
      },
      required: ['title']
    },
    isEnabled: true,
  },
  {
    name: 'create_google_sheet',
    description: 'Creates a new Google Sheet with the specified title.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'The title of the new spreadsheet.' }
      },
      required: ['title']
    },
    isEnabled: true,
  },
  {
    name: 'create_google_slide',
    description: 'Creates a new Google Slide presentation with the specified title.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'The title of the new presentation.' }
      },
      required: ['title']
    },
    isEnabled: true,
  },
  {
    name: 'create_google_form',
    description: 'Creates a new Google Form with the specified title.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'The title of the new form.' }
      },
      required: ['title']
    },
    isEnabled: true,
  },
  {
    name: 'open_drive_picker',
    description: 'Opens a Google Drive file picker to let the user select a file.',
    parameters: {
      type: 'OBJECT',
      properties: {}
    },
    isEnabled: true,
  },
  {
    name: 'schedule_meeting',
    description: 'Schedules a calendar meeting/event using Google Calendar API.',
    parameters: {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING', description: 'Title or summary of the meeting.' },
        startDateTime: { type: 'STRING', description: 'Start time in RFC3339 format.' },
        endDateTime: { type: 'STRING', description: 'End time in RFC3339 format.' },
      },
      required: ['summary', 'startDateTime', 'endDateTime']
    },
    isEnabled: true,
  },
  {
    name: 'fetch_google_api',
    description: 'Fetches data from a Google API. Provide the full endpoint URL. Useful for Gmail, Calendar, Contacts. Method is GET.',
    parameters: {
      type: 'OBJECT',
      properties: {
        url: {
          type: 'STRING',
          description: 'The full Google API URL to fetch from (e.g. https://www.googleapis.com/calendar/v3/calendars/primary/events or https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses or https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10)'
        }
      },
      required: ['url']
    },
    isEnabled: true,
  },
  {
    name: 'send_email',
    description: 'Sends an email using the Gmail API.',
    parameters: {
      type: 'OBJECT',
      properties: {
        to: { type: 'STRING', description: 'The recipient email address.' },
        subject: { type: 'STRING', description: 'The email subject.' },
        body: { type: 'STRING', description: 'The email body text.' }
      },
      required: ['to', 'subject', 'body']
    },
    isEnabled: true,
  },
  {
    name: 'search_gmail',
    description: 'Searches Gmail for messages matching a query.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Gmail search query (e.g., "is:unread", "from:boss@example.com").' },
        maxResults: { type: 'INTEGER', description: 'Max number of messages to return.' }
      },
      required: ['query']
    },
    isEnabled: true,
  },
  {
    name: 'get_contacts',
    description: 'Retrieves the authenticated user\'s Google Contacts.',
    parameters: {
      type: 'OBJECT',
      properties: {
        maxResults: { type: 'INTEGER', description: 'Max number of contacts to return.' }
      }
    },
    isEnabled: true,
  },
  {
    name: 'create_task',
    description: 'Creates a new Google Task in the default task list.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'The title or description of the task.' },
        notes: { type: 'STRING', description: 'Optional notes for the task.' },
      },
      required: ['title']
    },
    isEnabled: true,
  },
  {
    name: 'read_email',
    description: 'Retrieves the details of a specific Gmail email message by its ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        id: { type: 'STRING', description: 'The unique ID of the email message to retrieve.' }
      },
      required: ['id']
    },
    isEnabled: true
  },
  {
    name: 'read_google_sheet',
    description: 'Reads data values from a specified Google Sheet.',
    parameters: {
      type: 'OBJECT',
      properties: {
        spreadsheetId: { type: 'STRING', description: 'The ID of the spreadsheet.' },
        range: { type: 'STRING', description: 'The range of cells to retrieve (e.g. Sheet1!A1:D10).' }
      },
      required: ['spreadsheetId', 'range']
    },
    isEnabled: true
  },
  {
    name: 'update_google_sheet',
    description: 'Updates values in a specified range of a Google Sheet.',
    parameters: {
      type: 'OBJECT',
      properties: {
        spreadsheetId: { type: 'STRING', description: 'The ID of the spreadsheet.' },
        range: { type: 'STRING', description: 'The range to update (e.g. Sheet1!A1:B2).' },
        values: {
          type: 'ARRAY',
          description: 'A 2D array of rows containing values to write (e.g. [["header1", "header2"], [10, 20]]).',
          items: {
            type: 'ARRAY',
            items: { type: 'STRING' }
          }
        }
      },
      required: ['spreadsheetId', 'range', 'values']
    },
    isEnabled: true
  },
  {
    name: 'read_google_doc',
    description: 'Reads the full content structure of a Google Document.',
    parameters: {
      type: 'OBJECT',
      properties: {
        documentId: { type: 'STRING', description: 'The ID of the document to retrieve.' }
      },
      required: ['documentId']
    },
    isEnabled: true
  },
  {
    name: 'update_google_doc',
    description: 'Appends or inserts text into a specified Google Document.',
    parameters: {
      type: 'OBJECT',
      properties: {
        documentId: { type: 'STRING', description: 'The ID of the document.' },
        text: { type: 'STRING', description: 'The text content to insert.' },
        index: { type: 'INTEGER', description: 'Optional character index to insert text at (default is 1).' }
      },
      required: ['documentId', 'text']
    },
    isEnabled: true
  },
  {
    name: 'read_google_slide',
    description: 'Reads slides and elements structure of a Google Slide presentation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        presentationId: { type: 'STRING', description: 'The ID of the presentation.' }
      },
      required: ['presentationId']
    },
    isEnabled: true
  },
  {
    name: 'update_google_slide',
    description: 'Inserts a new blank slide into a Google Slide presentation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        presentationId: { type: 'STRING', description: 'The ID of the presentation.' }
      },
      required: ['presentationId']
    },
    isEnabled: true
  },
  {
    name: 'read_google_form',
    description: 'Reads the metadata and questions structure of a Google Form.',
    parameters: {
      type: 'OBJECT',
      properties: {
        formId: { type: 'STRING', description: 'The ID of the form.' }
      },
      required: ['formId']
    },
    isEnabled: true
  },
  {
    name: 'update_google_form',
    description: 'Adds a new item/question to a Google Form.',
    parameters: {
      type: 'OBJECT',
      properties: {
        formId: { type: 'STRING', description: 'The ID of the form.' },
        title: { type: 'STRING', description: 'The title/question text of the new form item.' }
      },
      required: ['formId', 'title']
    },
    isEnabled: true
  },
  {
    name: 'list_keep_notes',
    description: 'Lists the user Keep notes (simulated fallback to list saved preference notes).',
    parameters: {
      type: 'OBJECT',
      properties: {}
    },
    isEnabled: true
  },
  {
    name: 'update_keep_note',
    description: 'Updates or appends text to a Keep preference note.',
    parameters: {
      type: 'OBJECT',
      properties: {
        noteId: { type: 'STRING', description: 'The ID of the Keep note.' },
        text: { type: 'STRING', description: 'The content/text to append.' }
      },
      required: ['noteId', 'text']
    },
    isEnabled: true
  },
  {
    name: 'list_tasks',
    description: 'Lists Google Tasks from the user default tasks list.',
    parameters: {
      type: 'OBJECT',
      properties: {}
    },
    isEnabled: true
  },
  {
    name: 'update_task',
    description: 'Updates a Google Task status (e.g. marking it as completed).',
    parameters: {
      type: 'OBJECT',
      properties: {
        taskId: { type: 'STRING', description: 'The ID of the task to update.' },
        status: { type: 'STRING', description: 'The new status of the task (e.g., "completed" or "needsAction").' }
      },
      required: ['taskId', 'status']
    },
    isEnabled: true
  },
  {
    name: 'list_meetings',
    description: 'Lists upcoming calendar meetings/events from the user primary calendar.',
    parameters: {
      type: 'OBJECT',
      properties: {
        maxResults: { type: 'INTEGER', description: 'Max events to return (default is 10).' }
      }
    },
    isEnabled: true
  },
  {
    name: 'update_meeting',
    description: 'Updates the details of an existing Google Calendar event.',
    parameters: {
      type: 'OBJECT',
      properties: {
        eventId: { type: 'STRING', description: 'The ID of the calendar event.' },
        summary: { type: 'STRING', description: 'The new title/summary of the meeting.' }
      },
      required: ['eventId', 'summary']
    },
    isEnabled: true
  },
  {
    name: 'create_contact',
    description: 'Creates a new contact in Google Contacts.',
    parameters: {
      type: 'OBJECT',
      properties: {
        givenName: { type: 'STRING', description: 'First name.' },
        familyName: { type: 'STRING', description: 'Last name.' },
        email: { type: 'STRING', description: 'Email address.' }
      },
      required: ['givenName', 'familyName']
    },
    isEnabled: true
  },
  {
    name: 'list_google_chat_messages',
    description: 'Lists chat messages from a Google Chat space.',
    parameters: {
      type: 'OBJECT',
      properties: {
        spaceName: { type: 'STRING', description: 'The resource name of the space (e.g., spaces/AAAAxxxxxxx).' }
      },
      required: ['spaceName']
    },
    isEnabled: true
  },
  {
    name: 'search_drive_files',
    description: 'Searches for files in the user Google Drive.',
    parameters: {
      type: 'OBJECT',
      properties: {
        q: { type: 'STRING', description: 'Query string for searching files (e.g., name contains "invoice").' }
      }
    },
    isEnabled: true
  },
  {
    name: 'get_drive_file_content',
    description: 'Retrieves the body text content of a Google Doc from Drive.',
    parameters: {
      type: 'OBJECT',
      properties: {
        fileId: { type: 'STRING', description: 'The Google Drive file ID.' }
      },
      required: ['fileId']
    },
    isEnabled: true
  },
  {
    name: 'get_user_location',
    description: 'Requests the user\'s current GPS coordinate location (latitude and longitude) from the browser.',
    parameters: {
      type: 'OBJECT',
      properties: {}
    },
    isEnabled: true
  },
  {
    name: 'search_places',
    description: 'Searches for nearby establishments, supermarkets, cafes, restaurants, pharmacies or landmarks using the Google Maps Places API.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'The text query to search for, e.g. "supermarket" or "cafe".' },
        location: { type: 'STRING', description: 'Optional center coordinates biased search near, e.g. "50.8503,4.3517".' }
      },
      required: ['query']
    },
    isEnabled: true
  },
  {
    name: 'generate_blog',
    description: 'Called when the user is idle or mentions a blog-worthy topic. Generates a complete blog draft with Eburon AI-centered SEO and saves it to Firebase. The content should be well-written, informative, and centered on "Eburon AI," "Beatrice AI assistant," or related technology themes.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Blog post title' },
        excerpt: { type: 'STRING', description: 'A short summary of the blog post (1-2 sentences)' },
        content: { type: 'STRING', description: 'The full blog content in markdown format' },
        tags: { type: 'ARRAY', items: { type: 'STRING' }, description: 'SEO tags for the blog post' },
        imageQuery: { type: 'STRING', description: 'Optional search query to find a free-licensed image for the blog' }
      },
      required: ['title', 'excerpt', 'content', 'tags']
    },
    isEnabled: true
  },
  ...whatsappTools,
];
