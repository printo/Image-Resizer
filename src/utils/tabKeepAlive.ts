export class TabKeepAlive {
  private wakeLock: WakeLockSentinel | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private audioContext: AudioContext | null = null
  private isActive = false
  private visibilityChangeHandler: () => void

  constructor() {
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this)
  }

  async start(): Promise<void> {
    if (this.isActive) return

    this.isActive = true

    try {
      // Strategy 1: Wake Lock API to prevent system sleep
      await this.requestWakeLock()

      // Strategy 2: Audio context to maintain tab priority
      this.createSilentAudio()

      // Strategy 3: Periodic heartbeat to keep tab active
      this.startHeartbeat()

      // Strategy 4: Monitor visibility changes
      this.monitorVisibility()

      console.log("[v0] Tab keep-alive protection activated")
    } catch (error) {
      console.warn("[v0] Some keep-alive features may not be available:", error)
    }
  }

  async stop(): Promise<void> {
    if (!this.isActive) return

    this.isActive = false

    try {
      // Release wake lock
      if (this.wakeLock) {
        await this.wakeLock.release()
        this.wakeLock = null
      }

      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }

      // Close audio context
      if (this.audioContext) {
        await this.audioContext.close()
        this.audioContext = null
      }

      // Remove visibility listener
      document.removeEventListener("visibilitychange", this.visibilityChangeHandler)

      console.log("[v0] Tab keep-alive protection deactivated")
    } catch (error) {
      console.warn("[v0] Error stopping keep-alive protection:", error)
    }
  }

  private async requestWakeLock(): Promise<void> {
    if ("wakeLock" in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request("screen")
        console.log("[v0] Wake lock acquired")

        this.wakeLock.addEventListener("release", () => {
          console.log("[v0] Wake lock released")
        })
      } catch (error) {
        console.warn("[v0] Wake lock not available:", error)
      }
    }
  }

  private createSilentAudio(): void {
    try {
      // Create audio context with silent audio to maintain tab priority
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Create a silent oscillator
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      // Set volume to nearly silent (but not completely silent)
      gainNode.gain.setValueAtTime(0.001, this.audioContext.currentTime)

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Start silent audio
      oscillator.frequency.setValueAtTime(20000, this.audioContext.currentTime) // 20kHz - inaudible
      oscillator.start()

      console.log("[v0] Silent audio context created")
    } catch (error) {
      console.warn("[v0] Audio context not available:", error)
    }
  }

  private startHeartbeat(): void {
    // Send periodic heartbeat to keep tab active
    this.heartbeatInterval = setInterval(() => {
      if (this.isActive) {
        // Perform minimal DOM operation to keep tab active
        document.title = document.title

        // Optional: dispatch custom event for monitoring
        window.dispatchEvent(
          new CustomEvent("tabKeepAlive", {
            detail: { timestamp: Date.now() },
          }),
        )
      }
    }, 5000) // Every 5 seconds

    console.log("[v0] Heartbeat started")
  }

  private monitorVisibility(): void {
    document.addEventListener("visibilitychange", this.visibilityChangeHandler)
  }

  private async handleVisibilityChange(): Promise<void> {
    if (document.hidden) {
      console.log("[v0] Tab became hidden - maintaining keep-alive")
      // Tab became hidden, ensure wake lock is still active
      if (this.isActive && !this.wakeLock) {
        await this.requestWakeLock()
      }
    } else {
      console.log("[v0] Tab became visible")
    }
  }

  // Public method to check if protection is active
  isProtectionActive(): boolean {
    return this.isActive
  }

  // Public method to get status
  getStatus(): {
    isActive: boolean
    hasWakeLock: boolean
    hasAudioContext: boolean
    hasHeartbeat: boolean
  } {
    return {
      isActive: this.isActive,
      hasWakeLock: this.wakeLock !== null,
      hasAudioContext: this.audioContext !== null,
      hasHeartbeat: this.heartbeatInterval !== null,
    }
  }
}

// Global instance
export const tabKeepAlive = new TabKeepAlive()

// Utility function to prevent tab suspension during async operations
export async function withTabProtection<T>(operation: () => Promise<T>): Promise<T> {
  await tabKeepAlive.start()

  try {
    const result = await operation()
    return result
  } finally {
    await tabKeepAlive.stop()
  }
}
