const CALLTYPE_SINGLE = 0;
const CALLTYPE_BATCH = 1;
const CALLTYPE_STATIC = 254;
const CALLTYPE_DELEGATECALL = 255;

const EXECTYPE_DEFAULT = 0;
const EXECTYPE_TRY = 1;

const EXEC_MODE_DEFAULT = 0;

function formatCalltype(calltype: number): string {
  switch (calltype) {
    case CALLTYPE_SINGLE:
      return 'single';
    case CALLTYPE_BATCH:
      return 'batch';
    case CALLTYPE_STATIC:
      return 'static';
    case CALLTYPE_DELEGATECALL:
      return 'delegatecall';
    default:
      return 'unknown';
  }
}

function formatExectype(exectype: number): string {
  switch (exectype) {
    case EXECTYPE_DEFAULT:
      return 'default';
    case EXECTYPE_TRY:
      return 'try';
    default:
      return 'unknown';
  }
}

function formatExecMode(mode: number): string {
  switch (mode) {
    case EXEC_MODE_DEFAULT:
      return 'default';
    default:
      return 'unknown';
  }
}

export {
  CALLTYPE_SINGLE,
  CALLTYPE_BATCH,
  CALLTYPE_STATIC,
  CALLTYPE_DELEGATECALL,
  EXECTYPE_DEFAULT,
  EXECTYPE_TRY,
  EXEC_MODE_DEFAULT,
  formatCalltype,
  formatExectype,
  formatExecMode,
};
