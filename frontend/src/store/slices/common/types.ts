export type Language = string

export interface CommonState {
  language: Language,
  isLoading: boolean,
  error: string | null,
}
