export interface TimeEstimate {
  estimatedTotalTime: number // in milliseconds
  estimatedRemainingTime: number // in milliseconds
  elapsedTime: number // in milliseconds
  averageTimePerItem: number // in milliseconds
  estimatedCompletionTime: Date
}

export class TimeEstimator {
  private startTime = 0
  private itemTimes: number[] = []
  private lastItemTime = 0

  start() {
    this.startTime = Date.now()
    this.lastItemTime = this.startTime
    this.itemTimes = []
  }

  recordItemCompletion() {
    const now = Date.now()
    const itemTime = now - this.lastItemTime
    this.itemTimes.push(itemTime)
    this.lastItemTime = now
  }

  getEstimate(currentItem: number, totalItems: number): TimeEstimate {
    const now = Date.now()
    const elapsedTime = now - this.startTime

    // Calculate average time per item from completed items
    let averageTimePerItem = 0
    if (this.itemTimes.length > 0) {
      // Use weighted average, giving more weight to recent items
      const recentItems = this.itemTimes.slice(-5) // Last 5 items
      averageTimePerItem = recentItems.reduce((sum, time) => sum + time, 0) / recentItems.length
    } else if (currentItem > 0) {
      // Fallback: use elapsed time divided by current progress
      averageTimePerItem = elapsedTime / currentItem
    } else {
      // Initial estimate: assume 2 seconds per item
      averageTimePerItem = 2000
    }

    const remainingItems = totalItems - currentItem
    const estimatedRemainingTime = remainingItems * averageTimePerItem
    const estimatedTotalTime = elapsedTime + estimatedRemainingTime
    const estimatedCompletionTime = new Date(now + estimatedRemainingTime)

    return {
      estimatedTotalTime,
      estimatedRemainingTime,
      elapsedTime,
      averageTimePerItem,
      estimatedCompletionTime,
    }
  }

  reset() {
    this.startTime = 0
    this.itemTimes = []
    this.lastItemTime = 0
  }
}

export function formatTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return "< 1s"
  }

  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${seconds}s`
  }
}

export function formatTimeShort(milliseconds: number): string {
  if (milliseconds < 1000) {
    return "< 1s"
  }

  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}
