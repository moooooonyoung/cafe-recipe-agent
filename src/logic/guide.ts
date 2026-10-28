import { statusOf } from './status'
import type { ResolvedLine } from './substitution'

// 대체를 제안하는 중인 첫 번째 재료(없으면 undefined). 재료가 여럿이면 하나씩 차례로 묻는다.
export function pendingSuggestion(lines: readonly ResolvedLine[]): ResolvedLine | undefined {
  return lines.find((l) => l.state === 'suggest')
}

// 가이드 화면이 보여줄 것
// blocked: 제조 불가 / suggest: 대체 제안(적용 또는 취소를 먼저 정해야 한다) / cooking: 단계 목록
export type GuideStage = 'blocked' | 'suggest' | 'cooking'

// 만들 수 없는 재료가 하나라도 있으면 다른 재료의 대체는 묻지 않고 바로 제조 불가다.
export function guideStage(lines: readonly ResolvedLine[]): GuideStage {
  if (statusOf(lines) === 'blocked') return 'blocked'
  return pendingSuggestion(lines) ? 'suggest' : 'cooking'
}

// 제조 불가 패널의 설명이 달라지는 이유
// cancelled: 재고에 있는 대체 후보를 모두 [취소]했다 / unavailable: 후보가 없거나 대체 불가이거나 후보가 모두 품절이다
export type BlockedCause = 'cancelled' | 'unavailable'

// 패널에 보여주는 이유(처음 막힌 재료)와 같은 재료를 기준으로 한다
export function blockedCause(lines: readonly ResolvedLine[]): BlockedCause {
  return lines.find((l) => l.state === 'blocked')?.cancelled ? 'cancelled' : 'unavailable'
}

// 단계 체크: 탭하면 체크, 다시 탭하면 해제. 받은 집합은 바꾸지 않고 새 집합을 돌려준다.
export function toggleDone(done: ReadonlySet<number>, index: number): Set<number> {
  const next = new Set(done)
  if (!next.delete(index)) next.add(index)
  return next
}

// 현재 단계: 체크하지 않은 첫 번째 단계. 모두 체크했으면 -1(완료).
export function currentStepIndex(total: number, done: ReadonlySet<number>): number {
  for (let i = 0; i < total; i++) {
    if (!done.has(i)) return i
  }
  return -1
}
