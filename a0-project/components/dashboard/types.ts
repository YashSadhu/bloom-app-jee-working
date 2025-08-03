export interface SubTopic {
  id: string;
  name: string;
  checked: boolean;
}

export interface Topic {
  id: string;
  name: string;
  checked: boolean;
  subTopics: SubTopic[];
  expanded?: boolean;
  matchesSearch?: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  checked: boolean;
  topics: Topic[];
  expanded: boolean;
  matchesSearch?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  checked: boolean;
  chapters: Chapter[];
  matchesSearch?: boolean;
}

export interface SubjectTab {
  id: string;
  name: string;
}