import api from "../lib/api";

export interface Meeting {
  _id: string;
  title: string;
  status: "scheduled" | "active" | "ended";
  roomId: string;
  host: { _id: string; name: string; email: string; avatarUrl?: string };
  participants: { _id: string; name: string; email: string; avatarUrl?: string }[];
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: string;
  summary?: string;
  actionItems: { _id: string; text: string; assignee: string; completed: boolean }[];
  createdAt: string;
}

export interface Analytics {
  total: number;
  ended: number;
  active: number;
  totalActionItems: number;
  completedActionItems: number;
  recentMeetings: Meeting[];
}

export const meetingsService = {
  getAll: async (): Promise<Meeting[]> => {
    const { data } = await api.get("/meetings");
    return data.meetings;
  },

  getOne: async (id: string): Promise<Meeting> => {
    const { data } = await api.get(`/meetings/${id}`);
    return data.meeting;
  },

  create: async (payload: { title: string; scheduledAt?: string; teamId?: string }): Promise<Meeting> => {
    const { data } = await api.post("/meetings", payload);
    return data.meeting;
  },

  start: async (id: string): Promise<Meeting> => {
    const { data } = await api.patch(`/meetings/${id}/start`);
    return data.meeting;
  },

  end: async (id: string, transcript?: string): Promise<Meeting> => {
    const { data } = await api.patch(`/meetings/${id}/end`, { transcript });
    return data.meeting;
  },

  saveSummary: async (
    id: string,
    payload: { summary: string; actionItems: { text: string; assignee: string }[] }
  ): Promise<Meeting> => {
    const { data } = await api.patch(`/meetings/${id}/summary`, payload);
    return data.meeting;
  },

  toggleActionItem: async (id: string, itemId: string): Promise<Meeting> => {
    const { data } = await api.patch(`/meetings/${id}/action-items/${itemId}/toggle`);
    return data.meeting;
  },

  getAnalytics: async (): Promise<Analytics> => {
    const { data } = await api.get("/meetings/analytics");
    return data;
  },
};
