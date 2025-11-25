import type { BackgroundHandle } from "./Runtime";
import type { DisposableProcess } from "@/node/utils/disposableExec";
import { log } from "@/node/services/log";

/**
 * Handle to a local background process.
 *
 * Buffers early events until callbacks are registered, since the manager
 * registers callbacks after spawn() returns (but output may arrive before).
 */
export class LocalBackgroundHandle implements BackgroundHandle {
  private stdoutCallback?: (line: string) => void;
  private stderrCallback?: (line: string) => void;
  private exitCallback?: (exitCode: number) => void;
  private terminated = false;

  // Buffers for events that arrive before callbacks are registered
  private pendingStdout: string[] = [];
  private pendingStderr: string[] = [];
  private pendingExitCode?: number;

  constructor(private readonly disposable: DisposableProcess) {}

  onStdout(callback: (line: string) => void): void {
    this.stdoutCallback = callback;
    // Flush buffered events
    for (const line of this.pendingStdout) {
      callback(line);
    }
    this.pendingStdout = [];
  }

  onStderr(callback: (line: string) => void): void {
    this.stderrCallback = callback;
    // Flush buffered events
    for (const line of this.pendingStderr) {
      callback(line);
    }
    this.pendingStderr = [];
  }

  onExit(callback: (exitCode: number) => void): void {
    this.exitCallback = callback;
    // Flush buffered event
    if (this.pendingExitCode !== undefined) {
      callback(this.pendingExitCode);
      this.pendingExitCode = undefined;
    }
  }

  /** Internal: called when stdout line arrives */
  _emitStdout(line: string): void {
    if (this.stdoutCallback) {
      this.stdoutCallback(line);
    } else {
      this.pendingStdout.push(line);
    }
  }

  /** Internal: called when stderr line arrives */
  _emitStderr(line: string): void {
    if (this.stderrCallback) {
      this.stderrCallback(line);
    } else {
      this.pendingStderr.push(line);
    }
  }

  /** Internal: called when process exits */
  _emitExit(exitCode: number): void {
    if (this.exitCallback) {
      this.exitCallback(exitCode);
    } else {
      this.pendingExitCode = exitCode;
    }
  }

  isRunning(): Promise<boolean> {
    const child = this.disposable.underlying;
    // Process is dead if either exitCode or signalCode is set
    // (signal-killed processes have signalCode set but exitCode remains null)
    return Promise.resolve(child.exitCode === null && child.signalCode === null);
  }

  async terminate(): Promise<void> {
    if (this.terminated) return;

    const pid = this.disposable.underlying.pid;
    if (pid === undefined) {
      this.terminated = true;
      return;
    }

    try {
      // Send SIGTERM to the process group for graceful shutdown
      // Use negative PID to kill the entire process group (detached processes are group leaders)
      const pgid = -pid;
      log.debug(`LocalBackgroundHandle: Sending SIGTERM to process group (PGID: ${pgid})`);
      process.kill(pgid, "SIGTERM");

      // Wait 2 seconds for graceful shutdown
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if process is still running
      if (await this.isRunning()) {
        log.debug(`LocalBackgroundHandle: Process still running, sending SIGKILL`);
        process.kill(pgid, "SIGKILL");
      }
    } catch (error) {
      // Process may already be dead - that's fine
      log.debug(
        `LocalBackgroundHandle: Error during terminate: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    this.terminated = true;
  }

  dispose(): Promise<void> {
    return Promise.resolve(this.disposable[Symbol.dispose]());
  }

  /** Get the underlying child process (for spawn event waiting) */
  get child() {
    return this.disposable.underlying;
  }
}
