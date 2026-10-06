export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'working' | 'calling' | 'success' | 'concerned' | 'happy'

export type NavItem = 'home' | 'chat' | 'today' | 'calendar' | 'tasks' | 'calls' | 'memory' | 'suggestions' | 'contacts' | 'settings'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolName?: string
  toolData?: string
  mood?: string
  createdAt: string
}

export interface MemoryItem {
  id: string
  type: string
  content: string
  entities: string[]
  source: string
  confidence: number
  importance: number
  lastAccessed: string
  createdAt: string
  updatedAt: string
}

export interface TaskItem {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  priority: string
  category: string
  status: string
  recurrence: string | null
  reminder: string | null
  createdFromConversation: boolean
  createdAt: string
  updatedAt: string
}

export interface EventItem {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  location: string | null
  color: string
  allDay: boolean
  createdAt: string
}

export interface ContactItem {
  id: string
  name: string
  phone: string | null
  email: string | null
  relationship: string | null
  notes: string | null
  avatar: string | null
  lastContact: string | null
  createdAt: string
}

export interface CallItem {
  id: string
  contactId: string | null
  contactName: string
  phone: string | null
  direction: string
  status: string
  callReason: string | null
  aiInstructions: string | null
  transcript: string | null
  summary: string | null
  result: string | null
  duration: number | null
  scheduledAt: string | null
  startedAt: string | null
  endedAt: string | null
  createdAt: string
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  type: string
  read: boolean
  actionUrl: string | null
  createdAt: string
}

export interface SuggestionItem {
  id: string
  text: string
  type: 'free_slot' | 'postponed_task' | 'call_reminder' | 'preparation' | 'habit'
  action?: string
  accepted?: boolean
}
