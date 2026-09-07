export type HomeConversation = {
  id: string;
  title: string;
  preview: string;
  time: string;
  unread?: number;
  accent: string;
};

export const homeContent = {
  greeting: 'Your circle, in sync.',
  subtitle: 'Pick up where you left off, or let LinkUp help you move things forward.',
  aiPrompt: 'Ask LinkUp anything',
  conversations: [
    { id: 'amina', title: 'Amina', preview: 'I’ll send the details tonight.', time: '11:42', unread: 2, accent: '#93c5fd' },
    { id: 'core-team', title: 'The Core Team', preview: 'The new direction feels right.', time: '10:18', accent: '#c4b5fd' },
    { id: 'david', title: 'David', preview: 'You: Perfect. See you soon.', time: 'Yesterday', accent: '#99f6e4' },
  ] satisfies HomeConversation[],
};
