import { useCallback, useRef, useState } from 'react'

/**
 * A value that a caller may control, or leave to the component: React Stately's
 * `useControlledState`, which the copied Calendar imported from `@react-stately/utils`. Diba keeps
 * its own rather than take that package for one hook.
 */
export function useControlledState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [own, setOwn] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : own
  const latest = useRef(current)
  latest.current = current

  const set = useCallback(
    (next: T) => {
      if (Object.is(next, latest.current)) return
      if (!controlled) setOwn(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )

  return [current, set]
}
