import prettyMilliseconds from "pretty-ms";
import _ from "lodash";

class ExecutionStats {
  startTime?: DOMHighResTimeStamp;
  endTime?: DOMHighResTimeStamp;
  status?: string;
  affected_rows?: number;
  total_count?: number;
  statement_type?: string;

  duration: number = 0;

  constructor(
    startTime?: DOMHighResTimeStamp,
    endTime?: DOMHighResTimeStamp,
    status?: string,
    affected_rows?: number,
    total_count?: number,
    statement_type?: string
  ) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.status = status;
    this.affected_rows = affected_rows;
    this.total_count = total_count;
    this.statement_type = statement_type;
  }

  calculateDuration(): ExecutionStats {
    if (this.startTime && this.endTime)
      this.duration = this.endTime - this.startTime;
    if (this.startTime && !this.endTime)
      this.duration = performance.now() - this.startTime;
    return this;
  }

  setSuccess(): ExecutionStats {
    this.setStatus("success");
    return this;
  }
  setError(): ExecutionStats {
    this.setStatus("error");
    return this;
  }
  setStatus(status: string): ExecutionStats {
    this.status = status;
    this.endTime = performance.now();
    this.calculateDuration();
    return this;
  }
  setStatementType(statement_type: string): ExecutionStats {
    this.statement_type = statement_type;
    return this;
  }
  setAffectedRows(affected_rows?: number): ExecutionStats {
    this.affected_rows = affected_rows;
    return this;
  }
  setTotalCount(total_count?: number): ExecutionStats {
    this.total_count = total_count;
    return this;
  }

  prettyDuration(): string {
    return prettyMilliseconds(this.duration, { formatSubMilliseconds: false });
  }

  displayStatus(): string {
    return _.capitalize(this.status);
  }
  isRunning(): boolean {
    return _.upperCase(this.status) == "RUNNING";
  }
  isError(): boolean {
    return _.upperCase(this.status) == "ERROR";
  }
  isSuccess(): boolean {
    return _.upperCase(this.status) == "SUCCESS";
  }
  hasStatus(): boolean {
    return this.status !== undefined;
  }
  isIdle(): boolean {
    return !this.hasStatus();
  }
  hasTotalCount(): boolean {
    return this.total_count !== undefined;
  }
  hasAffectedRows(): boolean {
    return this.affected_rows !== undefined;
  }
  statusColor(): string {
    if (this.isSuccess()) return "green.8";
    if (this.isError()) return "red.8";
    return "";
  }
}

export { ExecutionStats };
