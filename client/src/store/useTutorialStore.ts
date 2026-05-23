import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TutorialState {
  completed: boolean
  skipped:   boolean
  _hydrated: boolean   // persist 로드 완료 여부
}

interface TutorialActions {
  complete:    () => void
  skip:        () => void
  reset:       () => void
  _setHydrated:() => void
}

export const useTutorialStore = create<TutorialState & TutorialActions>()(
  persist(
    (set) => ({
      completed:    false,
      skipped:      false,
      _hydrated:    false,
      complete:     () => set({ completed: true }),
      skip:         () => set({ skipped: true }),
      reset:        () => set({ completed: false, skipped: false }),
      _setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: 'key-crack-tutorial',
      onRehydrateStorage: () => (state) => {
        // localStorage 로드 완료 시점에 hydrated 마킹
        state?._setHydrated()
      },
    },
  ),
)

/** hydration 완료 후에만 true — 리다이렉트 가드에 사용 */
export const selectNeedsTutorial = (s: TutorialState) =>
  s._hydrated && !s.completed && !s.skipped
